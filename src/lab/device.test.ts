import { describe, expect, it } from "vitest";
import { DEVICES, IOC } from "./data";
import {
  RESPONSE_ACTIONS,
  alertsFor,
  buildDevices,
  getDevice,
  isActionAvailable,
  missingKbsFor,
  recommendationsFor,
  softwareFor,
  timelineFor,
  vulnerabilitiesFor,
  type DeviceDetails,
} from "./device";

const devices = buildDevices();
const victim = devices.find((d) => d.name === IOC.victimDevice)!;
const inactive = devices.find((d) => d.healthState === "Inactive")!;

describe("buildDevices", () => {
  it("covers every onboarded device", () => {
    expect(devices).toHaveLength(DEVICES.length);
    expect(new Set(devices.map((d) => d.id)).size).toBe(devices.length);
  });

  it("derives risk from the alerts actually attached", () => {
    expect(victim.riskLevel).toBe("High");
    const quiet = devices.find((d) => alertsFor(d).length === 0);
    if (quiet) expect(quiet.riskLevel).toBe("No known risk");
  });

  it("marks the HR workstation inactive with antivirus not reporting", () => {
    expect(inactive.antivirusStatus).toBe("Not reporting");
  });

  it("finds a device by id or by name", () => {
    expect(getDevice(victim.id)?.name).toBe(victim.name);
    expect(getDevice(victim.name)?.id).toBe(victim.id);
    expect(getDevice("nope")).toBeUndefined();
  });
});

describe("response actions", () => {
  it("offers every action on a healthy onboarded device", () => {
    for (const action of RESPONSE_ACTIONS) {
      expect(isActionAvailable(action, victim).available, action.label).toBe(true);
    }
  });

  // An inactive device cannot be reached at all — the menu greys out rather
  // than the action failing later.
  it("offers nothing on an inactive device", () => {
    for (const action of RESPONSE_ACTIONS) {
      const r = isActionAvailable(action, inactive);
      expect(r.available, action.label).toBe(false);
      expect(r.reason).toContain("inactive");
    }
  });

  it("offers nothing on a device that is not onboarded", () => {
    const notOnboarded: DeviceDetails = { ...victim, onboardingStatus: "Can be onboarded" };
    const r = isActionAvailable(RESPONSE_ACTIONS[0], notOnboarded);
    expect(r.available).toBe(false);
    expect(r.reason).toContain("not onboarded");
  });

  it("distinguishes full from selective isolation by what the user keeps", () => {
    const full = RESPONSE_ACTIONS.find((a) => a.id === "isolate-full")!;
    const selective = RESPONSE_ACTIONS.find((a) => a.id === "isolate-selective")!;
    expect(selective.effect).toContain("Outlook");
    expect(full.effect).not.toContain("Outlook");
    expect(full.userImpact).toContain("Total");
  });

  // Restricting app execution is not isolation: the device stays online.
  it("keeps the device on the network when restricting app execution", () => {
    const restrict = RESPONSE_ACTIONS.find((a) => a.id === "restrict-app-execution")!;
    expect(restrict.effect).toContain("stays on the network");
    expect(restrict.group).toBe("Containment");
  });

  it("marks the reversible actions and only those", () => {
    const undoable = RESPONSE_ACTIONS.filter((a) => a.undoable).map((a) => a.id).sort();
    expect(undoable).toEqual(["isolate-full", "isolate-selective", "restrict-app-execution"]);
    for (const a of RESPONSE_ACTIONS) {
      expect(a.undoable ? typeof a.undoLabel : a.undoLabel).toBe(a.undoable ? "string" : null);
    }
  });

  it("states the collection package leaves the user unaffected", () => {
    const collect = RESPONSE_ACTIONS.find((a) => a.id === "collect-package")!;
    expect(collect.userImpact).toContain("None");
    expect(collect.undoable).toBe(false);
  });

  it("gives every action preconditions and an effect", () => {
    for (const a of RESPONSE_ACTIONS) {
      expect(a.requires.length).toBeGreaterThan(0);
      expect(a.effect.length).toBeGreaterThan(20);
      expect(a.userImpact.length).toBeGreaterThan(10);
    }
  });
});

describe("vulnerability management", () => {
  it("gives a more exposed device more findings", () => {
    const high = devices.find((d) => d.exposureLevel === "High")!;
    const low = devices.find((d) => d.exposureLevel === "Low")!;
    expect(vulnerabilitiesFor(high).length).toBeGreaterThan(vulnerabilitiesFor(low).length);
  });

  it("flags exploited-in-the-wild separately from CVSS", () => {
    const vulns = vulnerabilitiesFor(victim);
    const wild = vulns.find((v) => v.exploitInTheWild)!;
    expect(wild).toBeTruthy();
    // The point: a lower-CVSS bug with a live exploit outranks a higher one
    // without, which is what the threat column is for.
    const higherCvssNoExploit = vulns.find((v) => !v.exploitAvailable && v.cvss > 3);
    expect(higherCvssNoExploit).toBeTruthy();
  });

  it("lists end-of-support software on servers", () => {
    const server = devices.find((d) => d.os.includes("Server"))!;
    expect(softwareFor(server).some((s) => s.endOfSupport)).toBe(true);
  });

  it("raises an attention-required recommendation when antivirus is not reporting", () => {
    const recs = recommendationsFor(inactive);
    expect(recs[0].remediationType).toBe("Attention required");
    expect(recs[0].impact).toBeGreaterThan(recs[1].impact);
  });

  it("returns missing updates only where exposure warrants it", () => {
    const high = devices.find((d) => d.exposureLevel === "High")!;
    const low = devices.find((d) => d.exposureLevel === "Low")!;
    expect(missingKbsFor(high).length).toBeGreaterThan(0);
    expect(missingKbsFor(low)).toEqual([]);
  });

  it("only cites CVEs it also reports as vulnerabilities", () => {
    const high = devices.find((d) => d.exposureLevel === "High")!;
    const known = new Set(vulnerabilitiesFor(high).map((v) => v.cveId));
    for (const kb of missingKbsFor(high)) {
      for (const cve of kb.cvesAddressed) expect(known.has(cve), `${kb.id} → ${cve}`).toBe(true);
    }
  });
});

describe("timeline and alerts", () => {
  it("returns events newest first and respects the limit", () => {
    const rows = timelineFor(victim, 10);
    expect(rows.length).toBeLessThanOrEqual(10);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].timestamp >= rows[i].timestamp).toBe(true);
    }
  });

  it("draws from more than one telemetry table", () => {
    const types = new Set(timelineFor(victim, 200).map((r) => r.type));
    expect(types.size).toBeGreaterThan(1);
  });

  it("attaches the intrusion alerts to the victim device", () => {
    const alerts = alertsFor(victim);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some((a) => a.severity === "High")).toBe(true);
  });

  it("returns alerts newest first", () => {
    const alerts = alertsFor(victim);
    for (let i = 1; i < alerts.length; i++) {
      expect(alerts[i - 1].timestamp >= alerts[i].timestamp).toBe(true);
    }
  });
});
