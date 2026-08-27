import { buildDevices, softwareFor, vulnerabilitiesFor, type Vulnerability } from "./device";

/**
 * Defender Vulnerability Management, tenant-wide.
 *
 * The dashboard shows two scores side by side and they are not the same thing,
 * which is the single most common confusion in this area:
 *
 *  - **Exposure score** measures how much vulnerability the estate is carrying.
 *    It runs 0–100 and **lower is better**.
 *  - **Microsoft Secure Score for Devices** measures how well devices are
 *    *configured*. It also runs 0–100 and **higher is better**.
 *
 * Patching moves exposure. Turning on a control moves secure score. An estate
 * can be fully patched and badly configured, or hardened and full of unpatched
 * software, and the two numbers say so independently.
 */

export type ExposureLevel = "Low" | "Medium" | "High";

const LEVEL_WEIGHT: Record<ExposureLevel, number> = { High: 10, Medium: 5, Low: 1 };

/** Extra weight for a vulnerability that is actually being exploited. */
const THREAT_WEIGHT = { inTheWild: 3, exploitAvailable: 2, none: 1 };

export function threatWeight(v: Vulnerability): number {
  if (v.exploitInTheWild) return THREAT_WEIGHT.inTheWild;
  if (v.exploitAvailable) return THREAT_WEIGHT.exploitAvailable;
  return THREAT_WEIGHT.none;
}

export type ExposureScore = {
  /** 0–100, lower is better. */
  score: number;
  level: ExposureLevel;
  devicesByLevel: Record<ExposureLevel, number>;
};

/**
 * Exposure score across the estate.
 *
 * Weighted by how exposed each device is and by whether its vulnerabilities are
 * actually being exploited, so a machine carrying one weaponised bug outranks
 * one carrying three theoretical ones.
 */
export function exposureScore(remediated: ReadonlySet<string> = new Set()): ExposureScore {
  const devices = buildDevices();
  const devicesByLevel: Record<ExposureLevel, number> = { Low: 0, Medium: 0, High: 0 };

  let weighted = 0;
  let maximum = 0;

  for (const device of devices) {
    devicesByLevel[device.exposureLevel]++;
    const deviceWeight = LEVEL_WEIGHT[device.exposureLevel];
    const vulns = vulnerabilitiesFor(device);

    for (const v of vulns) {
      const w = deviceWeight * threatWeight(v);
      maximum += w;
      if (!remediated.has(v.cveId)) weighted += w;
    }
  }

  const score = maximum === 0 ? 0 : Math.round((weighted / maximum) * 100);
  return {
    score,
    level: score >= 60 ? "High" : score >= 30 ? "Medium" : "Low",
    devicesByLevel,
  };
}

/**
 * Microsoft Secure Score for Devices — configuration posture, not patching.
 *
 * Deliberately driven by a different input from exposure so the two move
 * independently, exactly as they do in the product.
 */
export type DeviceSecureScore = {
  /** 0–100, higher is better. */
  score: number;
  controls: { name: string; enabled: boolean; points: number }[];
  earned: number;
  possible: number;
};

export function deviceSecureScore(
  enabledControls: ReadonlySet<string> = new Set(["Antivirus enabled", "Firewall enabled"]),
): DeviceSecureScore {
  const catalogue = [
    { name: "Antivirus enabled", points: 20 },
    { name: "Firewall enabled", points: 15 },
    { name: "Attack surface reduction rules in block mode", points: 25 },
    { name: "Credential Guard enabled", points: 20 },
    { name: "BitLocker enabled on all volumes", points: 20 },
  ];

  const controls = catalogue.map((c) => ({ ...c, enabled: enabledControls.has(c.name) }));
  const earned = controls.filter((c) => c.enabled).reduce((n, c) => n + c.points, 0);
  const possible = catalogue.reduce((n, c) => n + c.points, 0);

  return {
    controls,
    earned,
    possible,
    score: possible === 0 ? 0 : Math.round((earned / possible) * 100),
  };
}

/* ------------------------------------------------------------ weaknesses */

export type TenantWeakness = Vulnerability & {
  exposedDevices: string[];
  /** Threat label as the Weaknesses table shows it. */
  threat: "Exploit verified in the wild" | "Exploit available" | "No known exploit";
};

export function weaknesses(): TenantWeakness[] {
  const devices = buildDevices();
  const byCve = new Map<string, TenantWeakness>();

  for (const device of devices) {
    for (const v of vulnerabilitiesFor(device)) {
      const existing = byCve.get(v.cveId);
      if (existing) {
        existing.exposedDevices.push(device.name);
        continue;
      }
      byCve.set(v.cveId, {
        ...v,
        exposedDevices: [device.name],
        threat: v.exploitInTheWild
          ? "Exploit verified in the wild"
          : v.exploitAvailable
            ? "Exploit available"
            : "No known exploit",
      });
    }
  }

  // Ordered by real risk — threat first, then how widely it is exposed, then
  // CVSS. Sorting by CVSS alone is the mistake this ordering exists to correct.
  return [...byCve.values()].sort(
    (a, b) =>
      threatWeight(b) - threatWeight(a) ||
      b.exposedDevices.length - a.exposedDevices.length ||
      b.cvss - a.cvss,
  );
}

/* ------------------------------------------------------------- inventory */

export type SoftwareRollup = {
  name: string;
  vendor: string;
  installedDevices: string[];
  weaknesses: number;
  endOfSupport: boolean;
};

export function softwareInventory(): SoftwareRollup[] {
  const rollup = new Map<string, SoftwareRollup>();

  for (const device of buildDevices()) {
    for (const s of softwareFor(device)) {
      const existing = rollup.get(s.name);
      if (existing) {
        existing.installedDevices.push(device.name);
        continue;
      }
      rollup.set(s.name, {
        name: s.name,
        vendor: s.vendor,
        installedDevices: [device.name],
        weaknesses: s.weaknesses,
        endOfSupport: s.endOfSupport,
      });
    }
  }

  return [...rollup.values()].sort(
    (a, b) =>
      Number(b.endOfSupport) - Number(a.endOfSupport) ||
      b.weaknesses - a.weaknesses ||
      b.installedDevices.length - a.installedDevices.length,
  );
}

/* ----------------------------------------------------------- remediation */

export type RemediationStatus = "Submitted" | "In progress" | "Completed";

export type RemediationRequest = {
  id: string;
  recommendation: string;
  cveIds: string[];
  devices: number;
  status: RemediationStatus;
  dueInDays: number;
  assignedTo: string;
};

/**
 * A remediation request is a ticket, not a patch.
 *
 * Creating one hands work to Intune or to whoever owns the devices; nothing is
 * installed by Defender itself, and the exposure score does not move until the
 * update actually lands.
 */
export function createRemediation(
  recommendation: string,
  cveIds: string[],
  devices: number,
  dueInDays = 14,
): RemediationRequest {
  return {
    id: `rem-${recommendation.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`,
    recommendation,
    cveIds,
    devices,
    status: "Submitted",
    dueInDays,
    assignedTo: "Intune — Windows Autopatch ring 2",
  };
}

export const REMEDIATION_NOTE =
  "Creating a remediation request opens a ticket against the device owner in Intune. Defender does not install anything, so the exposure score does not move until the update is actually applied.";

/* ------------------------------------------------------------ dashboard */

export type TopExposedDevice = {
  name: string;
  exposureLevel: ExposureLevel;
  vulnerabilities: number;
  weaponised: number;
};

export function topExposedDevices(): TopExposedDevice[] {
  return buildDevices()
    .map((d) => {
      const vulns = vulnerabilitiesFor(d);
      return {
        name: d.name,
        exposureLevel: d.exposureLevel,
        vulnerabilities: vulns.length,
        weaponised: vulns.filter((v) => v.exploitAvailable || v.exploitInTheWild).length,
      };
    })
    .sort(
      (a, b) =>
        LEVEL_WEIGHT[b.exposureLevel] - LEVEL_WEIGHT[a.exposureLevel] ||
        b.weaponised - a.weaponised ||
        b.vulnerabilities - a.vulnerabilities,
    );
}
