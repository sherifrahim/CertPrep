import { describe, expect, it } from "vitest";
import { buildDevices } from "./device";
import {
  createRemediation,
  deviceSecureScore,
  exposureScore,
  softwareInventory,
  threatWeight,
  topExposedDevices,
  weaknesses,
} from "./tvm";

describe("exposure score", () => {
  it("runs 0-100 with a level attached", () => {
    const s = exposureScore();
    expect(s.score).toBeGreaterThanOrEqual(0);
    expect(s.score).toBeLessThanOrEqual(100);
    expect(["Low", "Medium", "High"]).toContain(s.level);
  });

  it("starts at full exposure with nothing remediated", () => {
    expect(exposureScore().score).toBe(100);
  });

  // Lower is better — the opposite direction from secure score.
  it("falls as vulnerabilities are remediated", () => {
    const before = exposureScore().score;
    const after = exposureScore(new Set(["CVE-2026-21412"])).score;
    expect(after).toBeLessThan(before);
  });

  it("reaches zero once every CVE is remediated", () => {
    const all = new Set(weaknesses().map((w) => w.cveId));
    expect(exposureScore(all).score).toBe(0);
  });

  it("counts every device into a level bucket", () => {
    const s = exposureScore();
    const total = s.devicesByLevel.Low + s.devicesByLevel.Medium + s.devicesByLevel.High;
    expect(total).toBe(buildDevices().length);
  });

  // A weaponised bug is worth more than a theoretical one.
  it("drops further for an exploited CVE than an unexploited one", () => {
    const exploited = exposureScore(new Set(["CVE-2026-21412"])).score;
    const theoretical = exposureScore(new Set(["CVE-2025-40782"])).score;
    expect(exploited).toBeLessThan(theoretical);
  });
});

describe("threatWeight", () => {
  it("ranks in the wild above available above none", () => {
    const wild = { exploitInTheWild: true, exploitAvailable: true } as never;
    const available = { exploitInTheWild: false, exploitAvailable: true } as never;
    const none = { exploitInTheWild: false, exploitAvailable: false } as never;
    expect(threatWeight(wild)).toBeGreaterThan(threatWeight(available));
    expect(threatWeight(available)).toBeGreaterThan(threatWeight(none));
  });
});

describe("device secure score", () => {
  it("runs 0-100 with higher being better", () => {
    const none = deviceSecureScore(new Set());
    const all = deviceSecureScore(
      new Set(deviceSecureScore().controls.map((c) => c.name)),
    );
    expect(none.score).toBe(0);
    expect(all.score).toBe(100);
    expect(all.score).toBeGreaterThan(none.score);
  });

  it("earns exactly the points of the enabled controls", () => {
    const s = deviceSecureScore(new Set(["Antivirus enabled"]));
    expect(s.earned).toBe(20);
    expect(s.controls.find((c) => c.name === "Antivirus enabled")!.enabled).toBe(true);
  });

  // The two scores measure different things and move independently.
  it("is unaffected by remediating vulnerabilities", () => {
    const before = deviceSecureScore().score;
    // Exposure changes...
    expect(exposureScore(new Set(["CVE-2026-21412"])).score).toBeLessThan(exposureScore().score);
    // ...secure score does not.
    expect(deviceSecureScore().score).toBe(before);
  });
});

describe("weaknesses", () => {
  const rows = weaknesses();

  it("rolls each CVE up once with the devices exposed to it", () => {
    expect(new Set(rows.map((r) => r.cveId)).size).toBe(rows.length);
    for (const r of rows) expect(r.exposedDevices.length).toBeGreaterThan(0);
  });

  // Ordering by threat, not by CVSS — the point of the table.
  it("puts an exploited CVE above a higher-scoring unexploited one", () => {
    const wildIndex = rows.findIndex((r) => r.threat === "Exploit verified in the wild");
    const noneIndex = rows.findIndex((r) => r.threat === "No known exploit");
    expect(wildIndex).toBeGreaterThanOrEqual(0);
    expect(noneIndex).toBeGreaterThan(wildIndex);
  });

  it("labels the threat column from the exploit flags", () => {
    for (const r of rows) {
      if (r.exploitInTheWild) expect(r.threat).toBe("Exploit verified in the wild");
      else if (r.exploitAvailable) expect(r.threat).toBe("Exploit available");
      else expect(r.threat).toBe("No known exploit");
    }
  });
});

describe("software inventory", () => {
  const rows = softwareInventory();

  it("rolls software up across devices without duplicates", () => {
    expect(new Set(rows.map((r) => r.name)).size).toBe(rows.length);
    for (const r of rows) expect(r.installedDevices.length).toBeGreaterThan(0);
  });

  it("surfaces end-of-support software first", () => {
    const firstSupported = rows.findIndex((r) => !r.endOfSupport);
    const anyEol = rows.some((r) => r.endOfSupport);
    if (anyEol) {
      expect(rows[0].endOfSupport).toBe(true);
      expect(firstSupported).toBeGreaterThan(0);
    }
  });
});

describe("remediation", () => {
  it("creates a submitted request assigned to the device owner", () => {
    const r = createRemediation("Update Microsoft Windows 11", ["CVE-2026-21412"], 3);
    expect(r.status).toBe("Submitted");
    expect(r.devices).toBe(3);
    expect(r.assignedTo).toContain("Intune");
    expect(r.id.startsWith("rem-")).toBe(true);
  });

  it("defaults to a two week due date", () => {
    expect(createRemediation("x", [], 1).dueInDays).toBe(14);
  });

  // Creating a ticket is not patching, and the score should not pretend it is.
  it("does not move the exposure score by itself", () => {
    const before = exposureScore().score;
    createRemediation("Update Microsoft Windows 11", ["CVE-2026-21412"], 3);
    expect(exposureScore().score).toBe(before);
  });
});

describe("top exposed devices", () => {
  const rows = topExposedDevices();

  it("covers every device", () => {
    expect(rows).toHaveLength(buildDevices().length);
  });

  it("ranks the most exposed first", () => {
    expect(rows[0].exposureLevel).toBe("High");
    const levels = { High: 3, Medium: 2, Low: 1 } as const;
    for (let i = 1; i < rows.length; i++) {
      expect(levels[rows[i - 1].exposureLevel]).toBeGreaterThanOrEqual(
        levels[rows[i].exposureLevel],
      );
    }
  });

  it("counts weaponised vulnerabilities separately from the total", () => {
    for (const r of rows) {
      expect(r.weaponised).toBeLessThanOrEqual(r.vulnerabilities);
    }
  });
});
