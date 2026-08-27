import { describe, expect, it } from "vitest";
import {
  ASR_STATES,
  ATTACK_STAGES,
  coverage,
  defaultRules,
  isExcluded,
  stateEffect,
  summarise,
  type AsrRule,
} from "./asr";

const rules = defaultRules();
const setState = (id: string, state: AsrRule["state"]): AsrRule[] =>
  rules.map((r) => (r.id === id ? { ...r, state } : r));

const LSASS = "9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2";
const PSEXEC = "d1e49aac-8f56-4280-b9ba-993a6d77406c";

describe("stateEffect", () => {
  // Audit and Block produce identical telemetry and opposite protection.
  it("audits without preventing in Audit", () => {
    const e = stateEffect("Audit");
    expect(e.audits).toBe(true);
    expect(e.prevents).toBe(false);
  });

  it("both audits and prevents in Block", () => {
    const e = stateEffect("Block");
    expect(e.audits).toBe(true);
    expect(e.prevents).toBe(true);
    expect(e.userCanBypass).toBe(false);
  });

  it("lets the user bypass in Warn", () => {
    const e = stateEffect("Warn");
    expect(e.prevents).toBe(true);
    expect(e.userCanBypass).toBe(true);
  });

  it("does nothing at all when off", () => {
    for (const s of ["Disabled", "Not configured"] as const) {
      const e = stateEffect(s);
      expect(e.prevents).toBe(false);
      expect(e.audits).toBe(false);
    }
  });

  it("explains every state", () => {
    for (const s of ASR_STATES) expect(stateEffect(s).explanation.length).toBeGreaterThan(20);
  });
});

describe("coverage against the embedded intrusion", () => {
  it("covers every stage that has a rule, and says so when none does", () => {
    const result = coverage(rules);
    expect(result).toHaveLength(ATTACK_STAGES.length);
    const uncovered = result.filter((c) => c.rule === null);
    expect(uncovered.length).toBeGreaterThan(0);
    for (const u of uncovered) expect(u.verdict).toContain("No attack surface reduction rule");
  });

  // The headline: the rules that would have broken the attack are in Audit.
  it("stops nothing at the credential access stage while the rule sits in Audit", () => {
    const credential = coverage(rules).find((c) => c.stage.stage === "Credential access")!;
    expect(credential.rule?.id).toBe(LSASS);
    expect(credential.rule?.state).toBe("Audit");
    expect(credential.prevented).toBe(false);
    expect(credential.verdict).toContain("recorded the attempt and allowed it");
  });

  it("stops the credential dump once that one rule moves to Block", () => {
    const credential = coverage(setState(LSASS, "Block")).find(
      (c) => c.stage.stage === "Credential access",
    )!;
    expect(credential.prevented).toBe(true);
    expect(credential.verdict).toContain("Stopped by");
  });

  it("records nothing at all for a stage whose rule was never configured", () => {
    const lateral = coverage(rules).find((c) => c.stage.stage === "Lateral movement")!;
    expect(lateral.rule?.id).toBe(PSEXEC);
    expect(lateral.prevented).toBe(false);
    expect(lateral.verdict).toContain("would not even have recorded it");
  });

  it("increases the number of stages stopped as rules move to Block", () => {
    const before = coverage(rules).filter((c) => c.prevented).length;
    const after = coverage(
      rules.map((r) => (r.state === "Audit" ? { ...r, state: "Block" as const } : r)),
    ).filter((c) => c.prevented).length;
    expect(after).toBeGreaterThan(before);
  });

  it("gives every stage a hunting query that names a real table", () => {
    for (const s of ATTACK_STAGES) {
      expect(s.huntQuery.length).toBeGreaterThan(20);
      expect(/^(EmailEvents|DeviceProcessEvents|DeviceLogonEvents|CommonSecurityLog)/.test(s.huntQuery)).toBe(
        true,
      );
    }
  });

  it("references only rules that exist", () => {
    const ids = new Set(rules.map((r) => r.id));
    for (const s of ATTACK_STAGES) {
      if (s.ruleId) expect(ids.has(s.ruleId), s.stage).toBe(true);
    }
  });
});

describe("exclusions", () => {
  it("matches an exact path", () => {
    const ex = [{ path: "C:\\Apps\\legacy.exe", ruleIds: [], justification: "" }];
    expect(isExcluded(ex, LSASS, "C:\\Apps\\legacy.exe")).toBe(true);
    expect(isExcluded(ex, LSASS, "C:\\Apps\\other.exe")).toBe(false);
  });

  it("supports a trailing wildcard", () => {
    const ex = [{ path: "C:\\Apps\\*", ruleIds: [], justification: "" }];
    expect(isExcluded(ex, LSASS, "C:\\Apps\\anything\\x.exe")).toBe(true);
    expect(isExcluded(ex, LSASS, "C:\\Other\\x.exe")).toBe(false);
  });

  it("is case and separator insensitive", () => {
    const ex = [{ path: "c:/apps/*", ruleIds: [], justification: "" }];
    expect(isExcluded(ex, LSASS, "C:\\Apps\\X.EXE")).toBe(true);
  });

  // Scoping an exclusion to one rule leaves the others watching.
  it("applies only to the named rules when ids are given", () => {
    const ex = [{ path: "C:\\Apps\\*", ruleIds: [LSASS], justification: "" }];
    expect(isExcluded(ex, LSASS, "C:\\Apps\\x.exe")).toBe(true);
    expect(isExcluded(ex, PSEXEC, "C:\\Apps\\x.exe")).toBe(false);
  });

  it("applies to every rule when no ids are given", () => {
    const ex = [{ path: "C:\\Apps\\*", ruleIds: [], justification: "" }];
    expect(isExcluded(ex, PSEXEC, "C:\\Apps\\x.exe")).toBe(true);
  });
});

describe("summarise", () => {
  it("accounts for every rule exactly once", () => {
    const s = summarise(rules);
    expect(s.blocking + s.auditing + s.warning + s.off).toBe(s.total);
    expect(s.total).toBe(rules.length);
  });

  it("moves counts as states change", () => {
    const before = summarise(rules);
    const after = summarise(setState(LSASS, "Block"));
    expect(after.blocking).toBe(before.blocking + 1);
    expect(after.auditing).toBe(before.auditing - 1);
  });
});

describe("the rule set", () => {
  it("uses real GUID identifiers", () => {
    for (const r of rules) {
      expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(r.id), r.name).toBe(
        true,
      );
    }
  });

  it("uses unique ids and names", () => {
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
    expect(new Set(rules.map((r) => r.name)).size).toBe(rules.length);
  });

  it("describes every rule", () => {
    for (const r of rules) expect(r.description.length).toBeGreaterThan(20);
  });
});
