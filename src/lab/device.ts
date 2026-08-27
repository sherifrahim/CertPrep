import { DEVICES, IOC, LAB_NOW, labTables } from "./data";
import type { Row } from "./kql/engine";

/**
 * The Defender XDR device entity page.
 *
 * The response actions are the point. In the portal they sit behind one menu
 * and read as interchangeable verbs, which is exactly how people get them
 * wrong: full and selective isolation differ in what the user keeps, app
 * restriction is not isolation, and only some of them can be undone. Each
 * action here carries what it actually does, what the user loses, and whether
 * there is a way back.
 */

export type RiskLevel = "No known risk" | "Low" | "Medium" | "High";
export type ExposureLevel = "Low" | "Medium" | "High";
export type HealthState = "Active" | "Inactive";
export type OnboardingStatus = "Onboarded" | "Can be onboarded" | "Unsupported";

export type DeviceDetails = {
  id: string;
  name: string;
  domain: string;
  os: string;
  osBuild: string;
  healthState: HealthState;
  onboardingStatus: OnboardingStatus;
  managedBy: "Microsoft Defender for Endpoint" | "Microsoft Intune" | "Unknown";
  firstSeen: string;
  lastSeen: string;
  ipAddress: string;
  deviceGroup: string;
  riskLevel: RiskLevel;
  exposureLevel: ExposureLevel;
  antivirusStatus: "Up to date" | "Not reporting" | "Disabled";
  primaryUser: string;
  tags: string[];
};

/* ------------------------------------------------------- response actions */

export type ResponseActionId =
  | "isolate-full"
  | "isolate-selective"
  | "restrict-app-execution"
  | "av-scan-quick"
  | "av-scan-full"
  | "collect-package"
  | "live-response"
  | "automated-investigation";

export type ResponseAction = {
  id: ResponseActionId;
  /** The label the portal uses. */
  label: string;
  group: "Isolation" | "Containment" | "Scanning" | "Investigation";
  /** What actually happens on the endpoint. */
  effect: string;
  /** What the person using the device loses. */
  userImpact: string;
  undoable: boolean;
  undoLabel: string | null;
  /** Preconditions the portal enforces before the action is offered. */
  requires: string[];
};

export const RESPONSE_ACTIONS: ResponseAction[] = [
  {
    id: "isolate-full",
    label: "Isolate device (Full)",
    group: "Isolation",
    effect:
      "Cuts every network connection except the one to the Defender for Endpoint service, so the device stays manageable and investigable.",
    userImpact:
      "Total. No email, no Teams, no file shares, no internet. The user sees a notification explaining the device is isolated.",
    undoable: true,
    undoLabel: "Release from isolation",
    requires: ["Device is Active", "Windows 10 1703 or later"],
  },
  {
    id: "isolate-selective",
    label: "Isolate device (Selective)",
    group: "Isolation",
    effect:
      "Blocks network traffic but leaves Outlook, Microsoft Teams and Skype for Business working, so the user can still be contacted.",
    userImpact:
      "Heavy but not total — the user keeps the tools you need to talk to them while you investigate.",
    undoable: true,
    undoLabel: "Release from isolation",
    requires: ["Device is Active", "Windows 10 1709 or later"],
  },
  {
    id: "restrict-app-execution",
    label: "Restrict app execution",
    group: "Containment",
    effect:
      "Applies a code integrity policy that only allows binaries signed by Microsoft to run. The device stays on the network.",
    userImpact:
      "The device keeps working and keeps its connectivity — line-of-business applications stop, Microsoft-signed ones do not.",
    undoable: true,
    undoLabel: "Remove app restriction",
    requires: ["Device is Active", "Windows 10 1709 or later"],
  },
  {
    id: "av-scan-quick",
    label: "Run antivirus scan (Quick)",
    group: "Scanning",
    effect: "Scans the locations malware most commonly uses. Takes minutes.",
    userImpact: "Minimal, beyond the device being slower while it runs.",
    undoable: false,
    undoLabel: null,
    requires: ["Device is Active", "Microsoft Defender Antivirus is in active mode"],
  },
  {
    id: "av-scan-full",
    label: "Run antivirus scan (Full)",
    group: "Scanning",
    effect: "Scans every file and running program. Takes hours on a large disk.",
    userImpact: "Noticeable slowdown for the duration.",
    undoable: false,
    undoLabel: null,
    requires: ["Device is Active", "Microsoft Defender Antivirus is in active mode"],
  },
  {
    id: "collect-package",
    label: "Collect investigation package",
    group: "Investigation",
    effect:
      "Gathers autoruns, installed programs, network connections, prefetch files, processes, scheduled tasks, the security event log and more into a downloadable archive.",
    userImpact: "None. The user is not notified and nothing is blocked.",
    undoable: false,
    undoLabel: null,
    requires: ["Device is Active"],
  },
  {
    id: "live-response",
    label: "Initiate Live Response Session",
    group: "Investigation",
    effect:
      "Opens a remote shell on the device for running commands, pulling files and executing approved scripts from the library.",
    userImpact: "None visible, but everything done in the session is recorded.",
    undoable: false,
    undoLabel: null,
    requires: [
      "Device is Active",
      "Live response is enabled in Advanced features",
      "The device is not already in another session",
    ],
  },
  {
    id: "automated-investigation",
    label: "Initiate Automated Investigation",
    group: "Investigation",
    effect:
      "Starts an automated investigation of the device, which may remediate on its own or queue actions for approval depending on the device group's automation level.",
    userImpact: "None directly — it depends on what the investigation decides to do.",
    undoable: false,
    undoLabel: null,
    requires: ["Device is Active", "Automated investigation is enabled for the device group"],
  },
];

/**
 * Whether the portal would offer an action for this device.
 *
 * An inactive device cannot be acted on at all, which is the one precondition
 * that catches people — the response menu greys out rather than failing later.
 */
export function isActionAvailable(
  action: ResponseAction,
  device: DeviceDetails,
): { available: boolean; reason: string } {
  if (device.healthState !== "Active") {
    return {
      available: false,
      reason: `${device.name} is ${device.healthState.toLowerCase()}. Response actions need a device that is reporting — nothing can be sent to one that is not.`,
    };
  }
  if (device.onboardingStatus !== "Onboarded") {
    return {
      available: false,
      reason: `${device.name} is not onboarded, so Defender for Endpoint has no channel to it.`,
    };
  }
  return { available: true, reason: action.requires.join(" · ") };
}

/* --------------------------------------------- vulnerability management */

export type Vulnerability = {
  cveId: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  cvss: number;
  software: string;
  published: string;
  /** Exploit availability drives prioritisation more than CVSS does. */
  exploitAvailable: boolean;
  exploitInTheWild: boolean;
  description: string;
};

export type InstalledSoftware = {
  name: string;
  vendor: string;
  version: string;
  weaknesses: number;
  endOfSupport: boolean;
};

export type SecurityRecommendation = {
  id: string;
  title: string;
  weaknesses: number;
  /** Exposure points recovered by acting on it. */
  impact: number;
  remediationType: "Update" | "Configuration change" | "Attention required";
  status: "Active" | "Exception";
};

export type MissingKb = {
  id: string;
  name: string;
  osBuild: string;
  cvesAddressed: string[];
};

/* ----------------------------------------------------------- the estate */

const at = (msAgo: number) => new Date(LAB_NOW.getTime() - msAgo).toISOString();
const DAY = 86_400_000;

/** Details the generated telemetry cannot express, authored per device. */
const DETAIL_OVERRIDES: Record<
  string,
  Partial<DeviceDetails> & { vulnerabilities?: string[] }
> = {
  [IOC.victimDevice]: {
    riskLevel: "High",
    exposureLevel: "High",
    deviceGroup: "Finance workstations",
    tags: ["Finance", "Compromised"],
    antivirusStatus: "Up to date",
  },
  [IOC.pivotDevice]: {
    riskLevel: "High",
    exposureLevel: "Medium",
    deviceGroup: "Finance servers",
    tags: ["Finance", "Server"],
  },
  "DC-01.contoso.com": {
    riskLevel: "Medium",
    exposureLevel: "High",
    deviceGroup: "Domain controllers",
    tags: ["Tier 0"],
  },
  "HR-WS-09.contoso.com": {
    healthState: "Inactive",
    riskLevel: "Low",
    exposureLevel: "Medium",
    deviceGroup: "HR workstations",
    antivirusStatus: "Not reporting",
    tags: ["HR"],
  },
};

function riskFromAlerts(name: string): RiskLevel {
  const t = labTables();
  const evidence = t.AlertEvidence as Row[];
  const alerts = t.AlertInfo as Row[];
  const ids = new Set(
    evidence.filter((e) => e.DeviceName === name).map((e) => String(e.AlertId)),
  );
  const attached = alerts.filter((a) => ids.has(String(a.AlertId)));
  if (attached.some((a) => a.Severity === "High")) return "High";
  if (attached.some((a) => a.Severity === "Medium")) return "Medium";
  return attached.length > 0 ? "Low" : "No known risk";
}

export function buildDevices(): DeviceDetails[] {
  const t = labTables();
  const processes = t.DeviceProcessEvents as Row[];

  return DEVICES.map((d, i) => {
    const events = processes.filter((p) => p.DeviceName === d.name);
    const last = events[0]?.Timestamp as Date | undefined;
    const base: DeviceDetails = {
      id: d.id,
      name: d.name,
      domain: "contoso.com",
      os: d.os,
      osBuild: d.os.includes("Server") ? "20348.2402" : "22631.3447",
      healthState: "Active",
      onboardingStatus: "Onboarded",
      managedBy: "Microsoft Intune",
      firstSeen: at((120 + i * 9) * DAY),
      lastSeen: last ? last.toISOString() : at(DAY),
      ipAddress: `10.20.1.${20 + i}`,
      deviceGroup: "Workstations",
      riskLevel: riskFromAlerts(d.name),
      exposureLevel: "Low",
      antivirusStatus: "Up to date",
      primaryUser: `${d.user}@contoso.com`,
      tags: [],
    };
    return { ...base, ...DETAIL_OVERRIDES[d.name] };
  });
}

export function getDevice(id: string): DeviceDetails | undefined {
  return buildDevices().find((d) => d.id === id || d.name === id);
}

/* ---------------------------------------------------- per-device findings */

const SHARED_VULNS: Vulnerability[] = [
  {
    cveId: "CVE-2026-21412",
    severity: "Critical",
    cvss: 9.8,
    software: "Windows SmartScreen",
    published: "2026-02-13",
    exploitAvailable: true,
    exploitInTheWild: true,
    description:
      "Security feature bypass allowing a crafted file to run without a SmartScreen prompt. Exploited in the wild.",
  },
  {
    cveId: "CVE-2026-21351",
    severity: "High",
    cvss: 8.1,
    software: "Windows Kernel",
    published: "2026-01-09",
    exploitAvailable: true,
    exploitInTheWild: false,
    description: "Elevation of privilege in the kernel. Proof of concept published.",
  },
  {
    cveId: "CVE-2025-49114",
    severity: "Medium",
    cvss: 6.5,
    software: "Google Chrome",
    published: "2025-11-22",
    exploitAvailable: false,
    exploitInTheWild: false,
    description: "Use-after-free in the renderer, requiring user interaction.",
  },
  {
    cveId: "CVE-2025-40782",
    severity: "Low",
    cvss: 3.3,
    software: "7-Zip",
    published: "2025-09-04",
    exploitAvailable: false,
    exploitInTheWild: false,
    description: "Information disclosure when opening a malformed archive.",
  },
];

export function vulnerabilitiesFor(device: DeviceDetails): Vulnerability[] {
  if (device.exposureLevel === "High") return SHARED_VULNS;
  if (device.exposureLevel === "Medium") return SHARED_VULNS.slice(1);
  return SHARED_VULNS.slice(2);
}

export function softwareFor(device: DeviceDetails): InstalledSoftware[] {
  const base: InstalledSoftware[] = [
    { name: "Windows 11", vendor: "Microsoft", version: device.osBuild, weaknesses: 2, endOfSupport: false },
    { name: "Google Chrome", vendor: "Google", version: "132.0.6834.83", weaknesses: 1, endOfSupport: false },
    { name: "Microsoft 365 Apps", vendor: "Microsoft", version: "16.0.17328", weaknesses: 0, endOfSupport: false },
    { name: "7-Zip", vendor: "Igor Pavlov", version: "22.01", weaknesses: 1, endOfSupport: false },
  ];
  if (device.os.includes("Server")) {
    return [
      { name: "Windows Server 2022", vendor: "Microsoft", version: device.osBuild, weaknesses: 2, endOfSupport: false },
      { name: "SQL Server 2019", vendor: "Microsoft", version: "15.0.4345", weaknesses: 1, endOfSupport: false },
      { name: "Java Runtime Environment 8", vendor: "Oracle", version: "1.8.0_202", weaknesses: 3, endOfSupport: true },
    ];
  }
  return base;
}

export function recommendationsFor(device: DeviceDetails): SecurityRecommendation[] {
  const list: SecurityRecommendation[] = [
    {
      id: "sr-1",
      title: "Update Microsoft Windows 11",
      weaknesses: 2,
      impact: 4.2,
      remediationType: "Update",
      status: "Active",
    },
    {
      id: "sr-2",
      title: "Turn on attack surface reduction rules in block mode",
      weaknesses: 0,
      impact: 3.1,
      remediationType: "Configuration change",
      status: "Active",
    },
    {
      id: "sr-3",
      title: "Enable Credential Guard",
      weaknesses: 0,
      impact: 2.8,
      remediationType: "Configuration change",
      status: "Active",
    },
    {
      id: "sr-4",
      title: "Update Google Chrome",
      weaknesses: 1,
      impact: 1.4,
      remediationType: "Update",
      status: "Active",
    },
  ];
  if (device.antivirusStatus !== "Up to date") {
    list.unshift({
      id: "sr-0",
      title: "Fix Microsoft Defender Antivirus reporting",
      weaknesses: 0,
      impact: 5.0,
      remediationType: "Attention required",
      status: "Active",
    });
  }
  return list;
}

export function missingKbsFor(device: DeviceDetails): MissingKb[] {
  if (device.exposureLevel === "Low") return [];
  return [
    {
      id: "KB5034765",
      name: "2026-02 Cumulative Update",
      osBuild: device.osBuild,
      cvesAddressed: ["CVE-2026-21412", "CVE-2026-21351"],
    },
    {
      id: "KB5033375",
      name: "2026-01 Cumulative Update",
      osBuild: device.osBuild,
      cvesAddressed: ["CVE-2026-21351"],
    },
  ];
}

/** Device timeline, drawn from the same telemetry the hunting blade queries. */
export function timelineFor(device: DeviceDetails, limit = 40) {
  const t = labTables();
  const rows: { timestamp: string; type: string; detail: string }[] = [];

  for (const p of (t.DeviceProcessEvents as Row[]).filter((r) => r.DeviceName === device.name)) {
    rows.push({
      timestamp: (p.Timestamp as Date).toISOString(),
      type: "Process created",
      detail: `${String(p.FileName)} — ${String(p.ProcessCommandLine)}`,
    });
  }
  for (const n of (t.DeviceNetworkEvents as Row[]).filter((r) => r.DeviceName === device.name)) {
    rows.push({
      timestamp: (n.Timestamp as Date).toISOString(),
      type: "Network connection",
      detail: `${String(n.InitiatingProcessFileName)} → ${String(n.RemoteIP)}:${String(n.RemotePort)}`,
    });
  }
  for (const l of (t.DeviceLogonEvents as Row[]).filter((r) => r.DeviceName === device.name)) {
    rows.push({
      timestamp: (l.Timestamp as Date).toISOString(),
      type: "Logon",
      detail: `${String(l.AccountName)} · ${String(l.LogonType)} · ${String(l.ActionType)}`,
    });
  }

  return rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}

/** Alerts attached to a device, for the entity page's Alerts tab. */
export function alertsFor(device: DeviceDetails) {
  const t = labTables();
  const evidence = t.AlertEvidence as Row[];
  const alerts = t.AlertInfo as Row[];
  const ids = new Set(
    evidence.filter((e) => e.DeviceName === device.name).map((e) => String(e.AlertId)),
  );
  return alerts
    .filter((a) => ids.has(String(a.AlertId)))
    .map((a) => ({
      alertId: String(a.AlertId),
      title: String(a.Title),
      severity: String(a.Severity),
      category: String(a.Category),
      serviceSource: String(a.ServiceSource),
      techniques: String(a.AttackTechniques),
      timestamp: (a.Timestamp as Date).toISOString(),
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export const RISK_TONE: Record<string, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-accent-soft text-accent-text",
  "No known risk": "bg-surface-2 text-muted",
};
