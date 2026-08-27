import { describe, expect, it } from "vitest";
import {
  AUTOMATION_LEVELS,
  applyAutomationLevel,
  buildActions,
  decide,
  disposition,
  historyActions,
  isCoreFolder,
  isTempFolder,
  pendingActions,
  type RemediationAction,
} from "./actions";

const air = (folderPath: string): Pick<RemediationAction, "source" | "folderPath"> => ({
  source: "Automated investigation",
  folderPath,
});

describe("folder classification", () => {
  it("treats the operating system directories as core", () => {
    expect(isCoreFolder("C:\\Windows\\System32")).toBe(true);
    expect(isCoreFolder("C:\\Program Files\\Contoso")).toBe(true);
    expect(isCoreFolder("C:\\Program Files (x86)\\Contoso")).toBe(true);
    expect(isCoreFolder("C:\\Users\\alice.chen\\Downloads")).toBe(false);
  });

  it("is case and separator insensitive, because paths arrive both ways", () => {
    expect(isCoreFolder("c:/windows/system32")).toBe(true);
    expect(isTempFolder("C:/Users/alice.chen/AppData/Local/Temp")).toBe(true);
  });

  it("counts per-user temp and downloads as temporary", () => {
    expect(isTempFolder("C:\\Users\\alice.chen\\AppData\\Local\\Temp")).toBe(true);
    expect(isTempFolder("C:\\Windows\\Temp")).toBe(true);
    expect(isTempFolder("C:\\Users\\grace.lin\\Downloads")).toBe(true);
    expect(isTempFolder("C:\\Users\\alice.chen\\AppData\\Roaming")).toBe(false);
  });

  // A path is not forced into exactly one bucket; the two levels ask different
  // questions and each answers its own.
  it("does not treat core and temp as opposites", () => {
    expect(isCoreFolder("C:\\Windows\\Temp")).toBe(true);
    expect(isTempFolder("C:\\Windows\\Temp")).toBe(true);
  });
});

describe("disposition", () => {
  it("never gates manual or custom detection actions", () => {
    for (const level of AUTOMATION_LEVELS) {
      expect(disposition({ source: "Manual" }, level).automatic).toBe(true);
      expect(disposition({ source: "Custom detection" }, level).automatic).toBe(true);
    }
  });

  it("remediates everything under full automation", () => {
    const level = "Full - remediate threats automatically";
    expect(disposition(air("C:\\Windows\\System32"), level).automatic).toBe(true);
    expect(disposition(air("C:\\Users\\a\\Downloads"), level).automatic).toBe(true);
  });

  it("remediates nothing when automation is off", () => {
    const level = "No automated response";
    expect(disposition(air("C:\\Users\\a\\Downloads"), level).automatic).toBe(false);
  });

  it("holds every remediation on the any-remediation level", () => {
    const level = "Semi - require approval for any remediation";
    expect(disposition(air("C:\\Users\\a\\AppData\\Local\\Temp"), level).automatic).toBe(false);
  });

  // The distinction the two semi levels exist for.
  it("gates only core folders on the core-folders level", () => {
    const level = "Semi - require approval for core folders remediation";
    expect(disposition(air("C:\\Windows\\System32"), level).automatic).toBe(false);
    expect(disposition(air("C:\\Users\\alice.chen\\AppData\\Roaming"), level).automatic).toBe(true);
  });

  it("gates everything except temp on the non-temp-folders level", () => {
    const level = "Semi - require approval for non-temp folders remediation";
    expect(disposition(air("C:\\Users\\alice.chen\\AppData\\Local\\Temp"), level).automatic).toBe(
      true,
    );
    expect(disposition(air("C:\\Users\\alice.chen\\AppData\\Roaming"), level).automatic).toBe(false);
    expect(disposition(air("C:\\Windows\\System32"), level).automatic).toBe(false);
  });

  // The same file lands on opposite sides of the two semi levels, which is
  // exactly the trap the exam sets.
  it("disagrees between the two semi levels for a roaming-profile file", () => {
    const path = air("C:\\Users\\alice.chen\\AppData\\Roaming");
    expect(disposition(path, "Semi - require approval for core folders remediation").automatic).toBe(
      true,
    );
    expect(
      disposition(path, "Semi - require approval for non-temp folders remediation").automatic,
    ).toBe(false);
  });

  it("always explains itself", () => {
    for (const level of AUTOMATION_LEVELS) {
      expect(disposition(air("C:\\Windows\\System32"), level).reason.length).toBeGreaterThan(0);
    }
  });
});

describe("the action queue", () => {
  const actions = buildActions();

  it("splits cleanly into pending and history", () => {
    expect(pendingActions(actions).length + historyActions(actions).length).toBe(actions.length);
    expect(pendingActions(actions).every((a) => a.status === "Pending approval")).toBe(true);
    expect(historyActions(actions).some((a) => a.status === "Completed")).toBe(true);
  });

  it("gives every action a verification query and a blast radius", () => {
    for (const a of actions) {
      expect(a.verifyQuery.trim().length).toBeGreaterThan(0);
      expect(a.blastRadius.trim().length).toBeGreaterThan(0);
      expect(a.effect.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives undoable actions an undo label and irreversible ones none", () => {
    for (const a of actions) {
      expect(a.undoable ? typeof a.undoLabel : a.undoLabel).toBe(a.undoable ? "string" : null);
    }
  });

  it("uses unique ids", () => {
    expect(new Set(actions.map((a) => a.id)).size).toBe(actions.length);
  });

  it("carries a folder path on every investigation action, since the gate needs one", () => {
    for (const a of actions.filter((x) => x.source === "Automated investigation")) {
      expect(a.folderPath, `${a.id} has no folderPath`).toBeTruthy();
    }
  });

  it("changes how much is automatic as the level changes", () => {
    const autoUnderFull = applyAutomationLevel(
      actions,
      "Full - remediate threats automatically",
    ).filter((r) => r.disposition.automatic).length;
    const autoUnderNone = applyAutomationLevel(actions, "No automated response").filter(
      (r) => r.disposition.automatic,
    ).length;

    expect(autoUnderFull).toBe(actions.length);
    // Manual and custom-detection actions stay automatic even with automation off.
    expect(autoUnderNone).toBe(
      actions.filter((a) => a.source !== "Automated investigation").length,
    );
    expect(autoUnderNone).toBeLessThan(autoUnderFull);
  });
});

describe("decide", () => {
  const action = buildActions().find((a) => a.id === "act-5001")!;
  const irreversible = buildActions().find((a) => a.id === "act-5002")!;

  it("records a rejection without carrying the action out", () => {
    const d = decide(action, false);
    expect(d.status).toBe("Rejected");
    expect(d.approved).toBe(false);
    expect(d.consequence).toContain("not carried out");
  });

  it("mentions the undo path when one exists", () => {
    const d = decide(action, true);
    expect(d.status).toBe("Approved");
    expect(d.consequence).toContain("reversed");
  });

  it("says plainly when there is no undo", () => {
    const d = decide(irreversible, true);
    expect(d.consequence).toContain("no undo");
  });
});
