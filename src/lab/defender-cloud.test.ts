import { describe, expect, it } from "vitest";
import {
  ATTACK_PATHS,
  CONTROLS,
  CONTROL_BY_ID,
  RECOMMENDATIONS,
  RESOURCE_BY_ID,
  byPotentialGain,
  livePaths,
  potentialGain,
  scoreControl,
  secureScore,
} from "./defender-cloud";

const control = (id: string) => CONTROL_BY_ID.get(id)!;
const score = (id: string, remediated: string[] = []) =>
  scoreControl(control(id), RECOMMENDATIONS, new Set(remediated));

describe("scoreControl", () => {
  it("pays proportionally to healthy resources", () => {
    // Four machines assessed by the two port recommendations; only vm-app-01
    // passes both, so the control pays a quarter of its eight points.
    const ports = score("ports");
    expect(ports.totalResources).toBe(4);
    expect(ports.healthyResources).toBe(1);
    expect(ports.current).toBeCloseTo(2, 5);
    expect(ports.max).toBe(8);
  });

  // The rule people get wrong: a resource must pass every recommendation in the
  // control, not most of them.
  it("gives a resource no credit for passing only some recommendations in a control", () => {
    const before = score("mfa");
    const after = score("mfa", ["rec-mfa-owners"]);
    expect(before.current).toBe(0);
    expect(after.current).toBe(0);
    expect(after.healthyResources).toBe(0);
  });

  it("pays in full once every recommendation in the control passes", () => {
    const both = score("mfa", ["rec-mfa-owners", "rec-mfa-write"]);
    expect(both.healthyResources).toBe(both.totalResources);
    expect(both.current).toBe(10);
  });

  it("counts a resource assessed by several recommendations only once", () => {
    // st-finance appears in both encryption recommendations; st-logs passes one.
    const encryption = score("encryption");
    expect(encryption.totalResources).toBe(3);
    expect(encryption.healthyResources).toBe(1);
    expect(encryption.current).toBeCloseTo(4 / 3, 5);
  });

  it("mixes healthy and unhealthy recommendations in one control", () => {
    const logging = score("logging");
    expect(logging.totalResources).toBe(2);
    expect(logging.healthyResources).toBe(1);
    expect(logging.current).toBeCloseTo(0.5, 5);
    expect(logging.failing.map((r) => r.id)).toEqual(["rec-kv-logging"]);
  });

  it("awards a control with nothing assessed its full score", () => {
    const empty = scoreControl(control("mfa"), []);
    expect(empty.totalResources).toBe(0);
    expect(empty.current).toBe(10);
  });
});

describe("secureScore", () => {
  it("sums earned points over total possible, not an average of percentages", () => {
    const s = secureScore();
    expect(s.max).toBe(43);
    expect(s.current).toBeCloseTo(10.7, 5);
    expect(s.percentage).toBe(25);
  });

  it("reaches 100 only when every recommendation passes", () => {
    const all = new Set(RECOMMENDATIONS.map((r) => r.id));
    const s = secureScore(RECOMMENDATIONS, all);
    expect(s.current).toBeCloseTo(s.max, 5);
    expect(s.percentage).toBe(100);
  });

  it("never exceeds its maximum", () => {
    const s = secureScore(RECOMMENDATIONS, new Set(RECOMMENDATIONS.map((r) => r.id)));
    expect(s.current).toBeLessThanOrEqual(s.max);
    for (const c of s.controls) expect(c.current).toBeLessThanOrEqual(c.max);
  });

  it("weights the heavy control above the light one", () => {
    const s = secureScore();
    expect(control("mfa").maxScore).toBeGreaterThan(control("logging").maxScore * 9);
    expect(s.controls).toHaveLength(CONTROLS.length);
  });
});

describe("potentialGain", () => {
  it("is zero when the fix leaves another recommendation failing the same resource", () => {
    expect(potentialGain("rec-mfa-owners")).toBe(0);
  });

  // The headline lesson: severity is not score impact.
  it("can rank a Low severity recommendation above a High one", () => {
    const low = RECOMMENDATIONS.find((r) => r.id === "rec-kv-logging")!;
    const high = RECOMMENDATIONS.find((r) => r.id === "rec-mfa-owners")!;
    expect(low.severity).toBe("Low");
    expect(high.severity).toBe("High");
    expect(potentialGain(low.id)).toBeGreaterThan(potentialGain(high.id));
  });

  it("is zero for something already remediated", () => {
    expect(potentialGain("rec-jit", RECOMMENDATIONS, new Set(["rec-jit"]))).toBe(0);
  });

  it("matches the score movement it predicts", () => {
    const before = secureScore();
    const gain = potentialGain("rec-jit");
    const after = secureScore(RECOMMENDATIONS, new Set(["rec-jit"]));
    expect(after.current - before.current).toBeCloseTo(gain, 2);
    expect(gain).toBeCloseTo(4, 2);
  });

  it("ranks just-in-time access highest in the current estate", () => {
    const ranked = byPotentialGain();
    expect(ranked[0].recommendation.id).toBe("rec-jit");
    // Sorted descending, so the list is directly actionable.
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].gain).toBeGreaterThanOrEqual(ranked[i].gain);
    }
  });

  it("drops remediated recommendations out of the ranking", () => {
    const ranked = byPotentialGain(RECOMMENDATIONS, new Set(["rec-jit"]));
    expect(ranked.some((r) => r.recommendation.id === "rec-jit")).toBe(false);
  });
});

describe("attack paths", () => {
  it("references resources that exist", () => {
    for (const path of ATTACK_PATHS) {
      for (const node of path.nodes) {
        expect(RESOURCE_BY_ID.has(node.resourceId), `${node.resourceId} is not in the estate`).toBe(
          true,
        );
      }
    }
  });

  it("references recommendations that exist", () => {
    const ids = new Set(RECOMMENDATIONS.map((r) => r.id));
    for (const path of ATTACK_PATHS) {
      expect(path.breaksIfRemediated.length).toBeGreaterThan(0);
      for (const id of path.breaksIfRemediated) {
        expect(ids.has(id), `${id} is not a recommendation`).toBe(true);
      }
    }
  });

  // Breaking a chain anywhere breaks it — that is why paths beat lists.
  it("clears a path when any one of its links is remediated", () => {
    for (const path of ATTACK_PATHS) {
      for (const id of path.breaksIfRemediated) {
        expect(livePaths(new Set([id])).some((p) => p.id === path.id)).toBe(false);
      }
    }
  });

  it("leaves every path live when nothing is remediated", () => {
    expect(livePaths(new Set())).toHaveLength(ATTACK_PATHS.length);
  });

  it("starts each critical path at an internet-exposed resource", () => {
    const critical = ATTACK_PATHS.filter((p) => p.risk === "Critical");
    expect(critical.length).toBeGreaterThan(0);
    for (const path of critical) {
      expect(RESOURCE_BY_ID.get(path.nodes[0].resourceId)!.internetExposed).toBe(true);
    }
  });
});

describe("content integrity", () => {
  it("attaches every recommendation to a real control", () => {
    for (const rec of RECOMMENDATIONS) {
      expect(CONTROL_BY_ID.has(rec.controlId), `${rec.id} has no control`).toBe(true);
    }
  });

  it("assesses only resources in the estate", () => {
    for (const rec of RECOMMENDATIONS) {
      for (const id of [...rec.healthy, ...rec.unhealthy]) {
        expect(RESOURCE_BY_ID.has(id), `${rec.id} assesses unknown ${id}`).toBe(true);
      }
    }
  });

  it("never lists a resource as both healthy and unhealthy", () => {
    for (const rec of RECOMMENDATIONS) {
      const overlap = rec.healthy.filter((id) => rec.unhealthy.includes(id));
      expect(overlap, `${rec.id} contradicts itself`).toEqual([]);
    }
  });

  it("gives every recommendation a remediation", () => {
    for (const rec of RECOMMENDATIONS) {
      expect(rec.remediation.trim().length).toBeGreaterThan(0);
      expect(rec.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("uses unique ids", () => {
    expect(new Set(RECOMMENDATIONS.map((r) => r.id)).size).toBe(RECOMMENDATIONS.length);
    expect(new Set(CONTROLS.map((c) => c.id)).size).toBe(CONTROLS.length);
  });
});
