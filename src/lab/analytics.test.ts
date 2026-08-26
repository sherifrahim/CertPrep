import { describe, expect, it } from "vitest";
import {
  PREBUILT_RULES,
  blankRule,
  lintRule,
  runsPerDay,
  simulateRule,
  type AnalyticsRule,
} from "./analytics";

const rule = (over: Partial<AnalyticsRule> = {}): AnalyticsRule => ({
  ...blankRule(),
  name: "Test rule",
  tactics: ["Execution"],
  entityMappings: [{ entityType: "Host", column: "DeviceName" }],
  ...over,
});

const errors = (r: AnalyticsRule) => lintRule(r).filter((w) => w.level === "error");
const messages = (r: AnalyticsRule) => lintRule(r).map((w) => w.message).join(" ");

describe("lintRule", () => {
  it("accepts a well-formed rule", () => {
    expect(errors(rule({ frequencyMin: 60, lookbackMin: 75 }))).toHaveLength(0);
  });

  it("requires a name and a query", () => {
    expect(messages(rule({ name: " " }))).toMatch(/name/i);
    expect(messages(rule({ query: "" }))).toMatch(/query/i);
  });

  // The mistake that silently loses events.
  it("flags a coverage gap when lookback is shorter than frequency", () => {
    const r = rule({ frequencyMin: 60, lookbackMin: 15 });
    const found = errors(r);
    expect(found).toHaveLength(1);
    expect(found[0].message).toMatch(/Coverage gap/);
    expect(found[0].message).toMatch(/45 minute gap/);
  });

  it("warns, but does not fail, when lookback exactly equals frequency", () => {
    const r = rule({ frequencyMin: 30, lookbackMin: 30 });
    expect(errors(r)).toHaveLength(0);
    expect(messages(r)).toMatch(/no margin for ingestion delay/);
  });

  it("accepts lookback longer than frequency without complaint", () => {
    const r = rule({ frequencyMin: 30, lookbackMin: 45 });
    expect(messages(r)).not.toMatch(/Coverage gap|no margin/);
  });

  it("enforces the 5 minute minimum frequency", () => {
    expect(messages(rule({ frequencyMin: 1, lookbackMin: 10 }))).toMatch(/5 minutes/);
  });

  it("enforces the 14 day lookback ceiling", () => {
    expect(messages(rule({ frequencyMin: 60, lookbackMin: 15 * 24 * 60 }))).toMatch(/14 days/);
  });

  it("warns when no entities are mapped", () => {
    expect(messages(rule({ entityMappings: [] }))).toMatch(/no investigable context/i);
  });

  it("warns when no MITRE tactics are selected", () => {
    expect(messages(rule({ tactics: [] }))).toMatch(/ATT&CK coverage/);
  });
});

describe("runsPerDay", () => {
  it("converts frequency into daily runs", () => {
    expect(runsPerDay(60)).toBe(24);
    expect(runsPerDay(15)).toBe(96);
    expect(runsPerDay(1440)).toBe(1);
  });

  it("never returns zero", () => {
    expect(runsPerDay(0)).toBeGreaterThan(0);
  });
});

describe("simulateRule", () => {
  it("reports what a good rule would have caught", () => {
    const r = simulateRule(PREBUILT_RULES[1]); // comsvcs credential dumping
    expect(r.error).toBeUndefined();
    expect(r.rowCount).toBe(1);
    expect(r.alertCount).toBe(1);
    expect(r.ok).toBe(true);
  });

  it("extracts the mapped entity values from the results", () => {
    const r = simulateRule(PREBUILT_RULES[2]); // risky sign-in
    const account = r.entities.find((e) => e.entityType === "Account");
    expect(account?.missing).toBe(false);
    expect(account?.values).toContain("alice.chen@contoso.com");
    const ip = r.entities.find((e) => e.entityType === "IP");
    expect(ip?.values).toContain("185.220.101.44");
  });

  it("fails when an entity mapping names a column the query does not return", () => {
    const r = simulateRule(
      rule({
        query: "DeviceProcessEvents | project Timestamp, FileName",
        entityMappings: [{ entityType: "Host", column: "DeviceName" }],
        frequencyMin: 60,
        lookbackMin: 75,
      }),
    );
    expect(r.ok).toBe(false);
    expect(r.warnings.some((w) => w.level === "error" && /does not return/.test(w.message))).toBe(true);
  });

  it("surfaces a query error rather than pretending it matched", () => {
    const r = simulateRule(rule({ query: "NoSuchTable | take 5" }));
    expect(r.error).toMatch(/does not exist/);
    expect(r.rowCount).toBe(0);
  });

  it("warns when a rule matches nothing", () => {
    const r = simulateRule(
      rule({
        query: 'DeviceProcessEvents | where FileName =~ "definitely-not-real.exe" | project DeviceName',
        frequencyMin: 60,
        lookbackMin: 75,
      }),
    );
    expect(r.rowCount).toBe(0);
    expect(r.warnings.some((w) => /returns nothing/.test(w.message))).toBe(true);
  });

  // The over-broad prebuilt rule exists precisely to demonstrate this.
  it("flags alert fatigue on one-alert-per-row over a wide query", () => {
    const r = simulateRule(PREBUILT_RULES[3]);
    expect(r.rowCount).toBeGreaterThan(50);
    expect(r.alertCount).toBe(r.rowCount);
    expect(r.warnings.some((w) => w.level === "error" && /alerts a day/.test(w.message))).toBe(true);
    expect(r.ok).toBe(false);
  });

  it("collapses a wide query to one alert when grouped", () => {
    const grouped = { ...PREBUILT_RULES[3], eventGrouping: "SingleAlert" as const };
    const r = simulateRule(grouped);
    expect(r.alertCount).toBe(1);
    expect(r.warnings.some((w) => /alerts a day/.test(w.message))).toBe(false);
  });

  it("returns a sample of matching rows for review", () => {
    const r = simulateRule(PREBUILT_RULES[0]);
    expect(r.sample.length).toBeGreaterThan(0);
    expect(r.columns).toContain("DeviceName");
  });
});

describe("prebuilt rules", () => {
  it("all parse and run without engine errors", () => {
    for (const r of PREBUILT_RULES) {
      expect(simulateRule(r).error, r.name).toBeUndefined();
    }
  });

  it("the three enabled rules are clean, and the demo rule is not", () => {
    const enabled = PREBUILT_RULES.filter((r) => r.enabled);
    for (const r of enabled) {
      expect(simulateRule(r).ok, r.name).toBe(true);
    }
    const demo = PREBUILT_RULES.find((r) => !r.enabled)!;
    expect(simulateRule(demo).ok).toBe(false);
  });

  it("between them they would catch the intrusion", () => {
    const totalAlerts = PREBUILT_RULES.filter((r) => r.enabled)
      .map((r) => simulateRule(r).alertCount)
      .reduce((a, b) => a + b, 0);
    expect(totalAlerts).toBeGreaterThanOrEqual(3);
  });
});
