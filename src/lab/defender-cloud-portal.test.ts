import { describe, expect, it } from "vitest";
import {
  COMPLIANCE_STANDARDS,
  DEFENDER_PLANS,
  RECOMMENDATIONS,
  RESOURCE_BY_ID,
  SECURITY_ALERTS,
  applyExemptions,
  assessStandard,
  secureScore,
  type Exemption,
} from "./defender-cloud";

const standard = (name: string) => COMPLIANCE_STANDARDS.find((s) => s.name === name)!;

describe("exemptions", () => {
  it("leaves recommendations untouched when there are none", () => {
    expect(applyExemptions(RECOMMENDATIONS, [])).toBe(RECOMMENDATIONS);
  });

  it("removes named resources from both health lists", () => {
    const exemptions: Exemption[] = [
      {
        recommendationId: "rec-jit",
        resourceIds: ["vm-web-01"],
        category: "Waiver",
        justification: "Decommissioned next week.",
      },
    ];
    const applied = applyExemptions(RECOMMENDATIONS, exemptions);
    const jit = applied.find((r) => r.id === "rec-jit")!;
    expect(jit.unhealthy).not.toContain("vm-web-01");
    // The original is not mutated.
    expect(RECOMMENDATIONS.find((r) => r.id === "rec-jit")!.unhealthy).toContain("vm-web-01");
  });

  it("empties a recommendation entirely when no resources are named", () => {
    const applied = applyExemptions(RECOMMENDATIONS, [
      {
        recommendationId: "rec-jit",
        resourceIds: [],
        category: "Mitigated",
        justification: "Handled by a third-party bastion.",
      },
    ]);
    const jit = applied.find((r) => r.id === "rec-jit")!;
    expect(jit.unhealthy).toEqual([]);
    expect(jit.healthy).toEqual([]);
  });

  // Exempting removes resources from the denominator rather than passing them,
  // which is why it moves the score at all.
  it("raises the score without anything being fixed", () => {
    const before = secureScore();
    const exempted = applyExemptions(
      RECOMMENDATIONS,
      RECOMMENDATIONS.filter((r) => r.unhealthy.length > 0).map((r) => ({
        recommendationId: r.id,
        resourceIds: [],
        category: "Waiver" as const,
        justification: "Blanket waiver.",
      })),
    );
    const after = secureScore(exempted);
    expect(after.percentage).toBeGreaterThan(before.percentage);
    expect(after.percentage).toBe(100);
  });
});

describe("security alerts", () => {
  it("uses unique ids and non-empty remediation steps", () => {
    expect(new Set(SECURITY_ALERTS.map((a) => a.id)).size).toBe(SECURITY_ALERTS.length);
    for (const a of SECURITY_ALERTS) {
      expect(a.remediationSteps.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(20);
    }
  });

  it("names a real resource or the subscription", () => {
    for (const a of SECURITY_ALERTS) {
      const known =
        [...RESOURCE_BY_ID.values()].some((r) => r.name === a.affectedResource) ||
        a.affectedResource === "Contoso Production";
      expect(known, `${a.id} points at ${a.affectedResource}`).toBe(true);
    }
  });

  it("carries a MITRE tactic on every alert", () => {
    for (const a of SECURITY_ALERTS) expect(a.tactic.length).toBeGreaterThan(0);
  });
});

describe("Defender plans", () => {
  it("references recommendations and alerts that exist", () => {
    const recIds = new Set(RECOMMENDATIONS.map((r) => r.id));
    const alertIds = new Set(SECURITY_ALERTS.map((a) => a.id));
    for (const plan of DEFENDER_PLANS) {
      for (const id of plan.enables) {
        if (id.startsWith("rec-")) expect(recIds.has(id), `${plan.name} → ${id}`).toBe(true);
        else if (id.startsWith("alert-")) expect(alertIds.has(id), `${plan.name} → ${id}`).toBe(true);
      }
    }
  });

  it("keeps the free foundational plan on", () => {
    const foundational = DEFENDER_PLANS.find((p) => p.name === "Foundational CSPM")!;
    expect(foundational.state).toBe("On");
    expect(foundational.pricing).toBe("Free");
  });

  // Attack path analysis is a Defender CSPM feature, not a free one — a common
  // surprise when the blade is empty.
  it("gates attack path analysis behind Defender CSPM", () => {
    const cspm = DEFENDER_PLANS.find((p) => p.name === "Defender CSPM")!;
    expect(cspm.enables).toContain("Attack path analysis");
    expect(cspm.state).toBe("Off");
  });

  it("gives every plan a description of what it buys", () => {
    for (const p of DEFENDER_PLANS) expect(p.provides.length).toBeGreaterThan(20);
  });
});

describe("regulatory compliance", () => {
  it("maps every control to recommendations that exist", () => {
    const ids = new Set(RECOMMENDATIONS.map((r) => r.id));
    for (const s of COMPLIANCE_STANDARDS) {
      for (const c of s.controls) {
        expect(c.recommendationIds.length).toBeGreaterThan(0);
        for (const id of c.recommendationIds) {
          expect(ids.has(id), `${s.name} ${c.id} → ${id}`).toBe(true);
        }
      }
    }
  });

  // No partial credit, unlike the secure score.
  it("fails a control when any one recommendation behind it fails", () => {
    const result = assessStandard(standard("Microsoft cloud security benchmark"));
    const im1 = result.controls.find((c) => c.control.id === "IM-1")!;
    expect(im1.failed).toBeGreaterThan(0);
    expect(im1.compliant).toBe(false);
  });

  it("passes a control once every recommendation behind it is remediated", () => {
    const result = assessStandard(
      standard("Microsoft cloud security benchmark"),
      RECOMMENDATIONS,
      new Set(["rec-mfa-owners", "rec-mfa-write"]),
    );
    const im1 = result.controls.find((c) => c.control.id === "IM-1")!;
    expect(im1.compliant).toBe(true);
    expect(im1.failed).toBe(0);
  });

  it("counts an already-healthy recommendation as passing", () => {
    const result = assessStandard(standard("Microsoft cloud security benchmark"));
    const lt3 = result.controls.find((c) => c.control.id === "LT-3")!;
    // rec-sql-audit is healthy, rec-kv-logging is not.
    expect(lt3.passed).toBe(1);
    expect(lt3.failed).toBe(1);
  });

  it("reports totals across the standard", () => {
    const result = assessStandard(standard("PCI DSS 4.0"));
    expect(result.total).toBe(standard("PCI DSS 4.0").controls.length);
    expect(result.passed).toBeLessThanOrEqual(result.total);
  });

  it("reaches full compliance when everything is remediated", () => {
    const all = new Set(RECOMMENDATIONS.map((r) => r.id));
    for (const s of COMPLIANCE_STANDARDS) {
      const result = assessStandard(s, RECOMMENDATIONS, all);
      expect(result.passed, `${s.name} should fully pass`).toBe(result.total);
    }
  });
});
