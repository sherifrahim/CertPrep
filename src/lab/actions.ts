import { IOC, LAB_NOW } from "./data";

/**
 * The Defender XDR Action center.
 *
 * Two things are modelled here, because they are the two things learners get
 * wrong. First, the split between actions an automated investigation may take
 * on its own and actions that sit waiting for a human — which is decided by the
 * device group's automation level, not by the severity of the alert. Second,
 * which actions can be undone, since "quarantine" and "hard delete" read alike
 * in a menu and are not alike at all afterwards.
 *
 * Automation levels are the real ones from Defender for Endpoint device groups.
 */

export type AutomationLevel =
  | "Full - remediate threats automatically"
  | "Semi - require approval for any remediation"
  | "Semi - require approval for core folders remediation"
  | "Semi - require approval for non-temp folders remediation"
  | "No automated response";

export const AUTOMATION_LEVELS: AutomationLevel[] = [
  "Full - remediate threats automatically",
  "Semi - require approval for any remediation",
  "Semi - require approval for core folders remediation",
  "Semi - require approval for non-temp folders remediation",
  "No automated response",
];

export type EntityType = "Device" | "File" | "Process" | "User" | "Email" | "Url" | "Persistence";

/** Where the action came from. Only investigation actions face the automation gate. */
export type ActionSource = "Automated investigation" | "Manual" | "Custom detection";

export type ActionStatus = "Pending approval" | "Approved" | "Rejected" | "Completed" | "Undone";

export type RemediationAction = {
  id: string;
  /** The action as the portal names it. */
  type: string;
  entityType: EntityType;
  entity: string;
  /** Present for file and process actions — decides the core/temp folder gate. */
  folderPath?: string;
  device: string | null;
  source: ActionSource;
  investigationId: string | null;
  incidentId: string;
  createdAt: string;
  status: ActionStatus;
  /** What the action actually does, since the names understate the differences. */
  effect: string;
  /** What it costs if you approve it wrongly. Approval is a judgement, not a reflex. */
  blastRadius: string;
  /** Undo exists for some actions and not others — this is the examinable part. */
  undoable: boolean;
  undoLabel: string | null;
  /** Run this before approving. The lab's whole point is verify, then act. */
  verifyQuery: string;
};

/* ------------------------------------------------- the automation level gate */

/**
 * Core folders are the operating-system directories. "Non-temp" is the
 * complement of the per-user temporary and download locations, which is why the
 * two semi-automatic levels differ: one holds back remediation in Windows and
 * Program Files, the other holds back everything *except* temp.
 */
const CORE_FOLDER_PREFIXES = [
  "c:\\windows",
  "c:\\program files",
  "c:\\program files (x86)",
  "c:\\programdata\\microsoft\\windows",
];

const TEMP_FOLDER_MARKERS = ["\\appdata\\local\\temp", "\\windows\\temp", "\\downloads"];

export function isCoreFolder(path: string): boolean {
  const p = path.toLowerCase().replace(/\//g, "\\");
  return CORE_FOLDER_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export function isTempFolder(path: string): boolean {
  const p = path.toLowerCase().replace(/\//g, "\\");
  return TEMP_FOLDER_MARKERS.some((marker) => p.includes(marker));
}

export type Disposition = {
  /** True when the investigation may carry the action out unattended. */
  automatic: boolean;
  /** Why, phrased the way the portal's automation column would justify it. */
  reason: string;
};

/**
 * Decides whether an automated investigation remediates on its own or queues
 * the action for approval.
 *
 * Manual and custom-detection actions are never gated: a human already chose
 * them. Everything else is decided by the device group's automation level and,
 * for the two folder-scoped levels, by where the file sits.
 */
export function disposition(
  action: Pick<RemediationAction, "source" | "folderPath">,
  level: AutomationLevel,
): Disposition {
  if (action.source !== "Automated investigation") {
    return {
      automatic: true,
      reason: `${action.source} actions are not gated by automation level — an analyst already chose them.`,
    };
  }

  switch (level) {
    case "Full - remediate threats automatically":
      return {
        automatic: true,
        reason: "Full automation remediates every verdict without waiting for approval.",
      };
    case "No automated response":
      return {
        automatic: false,
        reason:
          "No automated response means the investigation only ever recommends — nothing is remediated for you.",
      };
    case "Semi - require approval for any remediation":
      return {
        automatic: false,
        reason: "This level holds every remediation for approval regardless of location.",
      };
    case "Semi - require approval for core folders remediation": {
      const path = action.folderPath ?? "";
      return isCoreFolder(path)
        ? {
            automatic: false,
            reason: `${path} is a core operating-system folder, so remediation waits for approval.`,
          }
        : {
            automatic: true,
            reason: `${path || "This location"} is outside the core folders, so it is remediated automatically.`,
          };
    }
    case "Semi - require approval for non-temp folders remediation": {
      const path = action.folderPath ?? "";
      return isTempFolder(path)
        ? {
            automatic: true,
            reason: `${path} is a temporary folder, so remediation runs automatically.`,
          }
        : {
            automatic: false,
            reason: `${path || "This location"} is not a temporary folder, so remediation waits for approval.`,
          };
    }
  }
}

/** Applies the gate across a queue, so a level's real effect is visible at once. */
export function applyAutomationLevel(
  actions: RemediationAction[],
  level: AutomationLevel,
): { action: RemediationAction; disposition: Disposition }[] {
  return actions.map((action) => ({ action, disposition: disposition(action, level) }));
}

/* --------------------------------------------------------------- the queue */

const at = (msAgo: number) => new Date(LAB_NOW.getTime() - msAgo).toISOString();
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

/**
 * Pending and completed actions arising from the embedded intrusion, plus a
 * couple of routine ones so the queue is not entirely one incident.
 */
export function buildActions(): RemediationAction[] {
  return [
    {
      id: "act-5001",
      type: "Quarantine file",
      entityType: "File",
      entity: IOC.dumpFile,
      folderPath: "C:\\Users\\alice.chen\\AppData\\Local\\Temp",
      device: IOC.victimDevice,
      source: "Automated investigation",
      investigationId: "inv-311",
      incidentId: "INC-2041",
      createdAt: at(3 * HOUR),
      status: "Pending approval",
      effect:
        "Removes the file from the device and holds a copy in quarantine, where it can be restored for 30 days.",
      blastRadius:
        "Low. The file is a credential dump, not a business document, and quarantine is reversible.",
      undoable: true,
      undoLabel: "Restore file from quarantine",
      verifyQuery: [
        "DeviceFileEvents",
        `| where DeviceName == "${IOC.victimDevice}"`,
        `| where FileName == "${IOC.dumpFile}"`,
        "| project Timestamp, ActionType, FolderPath, InitiatingProcessFileName",
      ].join("\n"),
    },
    {
      id: "act-5002",
      type: "Kill process",
      entityType: "Process",
      entity: "rundll32.exe",
      folderPath: "C:\\Windows\\System32",
      device: IOC.victimDevice,
      source: "Automated investigation",
      investigationId: "inv-311",
      incidentId: "INC-2041",
      createdAt: at(3 * HOUR - 5 * MIN),
      status: "Pending approval",
      effect: "Terminates the running process. It does not stop the same command running again.",
      blastRadius:
        "Medium. rundll32.exe sits in a core folder and is used legitimately, so confirm this instance is the comsvcs.dll MiniDump call before approving.",
      undoable: false,
      undoLabel: null,
      verifyQuery: [
        "DeviceProcessEvents",
        `| where DeviceName == "${IOC.victimDevice}"`,
        '| where ProcessCommandLine has "comsvcs.dll" or ProcessCommandLine has "MiniDump"',
        "| project Timestamp, FileName, ProcessCommandLine, InitiatingProcessFileName",
      ].join("\n"),
    },
    {
      id: "act-5003",
      type: "Isolate device",
      entityType: "Device",
      entity: IOC.victimDevice,
      device: IOC.victimDevice,
      source: "Manual",
      investigationId: null,
      incidentId: "INC-2041",
      createdAt: at(2 * HOUR),
      status: "Pending approval",
      effect:
        "Cuts the device off from the network while leaving the Defender connection up, so you can keep investigating it.",
      blastRadius:
        "High for the user — they lose everything except Defender. Selective isolation leaves Outlook, Teams and Skype for Business working.",
      undoable: true,
      undoLabel: "Release from isolation",
      verifyQuery: [
        "DeviceNetworkEvents",
        `| where DeviceName == "${IOC.victimDevice}"`,
        `| where RemoteIP == "${IOC.c2Ip}"`,
        "| summarize Connections = count(), LastSeen = max(Timestamp) by RemoteIP, RemotePort",
      ].join("\n"),
    },
    {
      id: "act-5004",
      type: "Disable user",
      entityType: "User",
      entity: `${IOC.compromisedService}@contoso.com`,
      device: null,
      source: "Manual",
      investigationId: null,
      incidentId: "INC-2041",
      createdAt: at(90 * MIN),
      status: "Pending approval",
      effect: "Blocks the account from signing in. Existing tokens keep working until they expire.",
      blastRadius:
        "High. This is a service account — disabling it stops the backup job as well as the attacker. Revoke sessions too, or the stolen token stays valid.",
      undoable: true,
      undoLabel: "Re-enable user",
      verifyQuery: [
        "DeviceLogonEvents",
        `| where AccountName == "${IOC.compromisedService}"`,
        `| where RemoteDeviceName == "${IOC.victimDevice}"`,
        "| project Timestamp, DeviceName, LogonType, ActionType, RemoteIP",
      ].join("\n"),
    },
    {
      id: "act-5005",
      type: "Soft delete email",
      entityType: "Email",
      entity: `Phishing message from ${IOC.phishSender}`,
      device: null,
      source: "Manual",
      investigationId: null,
      incidentId: "INC-2041",
      createdAt: at(4 * HOUR),
      status: "Pending approval",
      effect:
        "Moves the message to Deleted Items in all six mailboxes. Users can still recover it themselves.",
      blastRadius: "Low, and reversible. Hard delete is the one that cannot be taken back.",
      undoable: true,
      undoLabel: "Move back to inbox",
      verifyQuery: [
        "EmailEvents",
        `| where SenderFromAddress == "${IOC.phishSender}"`,
        "| project Timestamp, RecipientEmailAddress, Subject, DeliveryAction, DeliveryLocation, ThreatTypes",
      ].join("\n"),
    },
    {
      id: "act-5006",
      type: "Block URL",
      entityType: "Url",
      entity: IOC.phishUrl,
      device: null,
      source: "Custom detection",
      investigationId: null,
      incidentId: "INC-2041",
      createdAt: at(4 * HOUR + 10 * MIN),
      status: "Completed",
      effect: "Adds the URL to the custom indicator list so Safe Links and SmartScreen block it.",
      blastRadius: "Low. Scoped to one URL rather than the whole domain.",
      undoable: true,
      undoLabel: "Remove indicator",
      verifyQuery: [
        "UrlClickEvents",
        `| where Url == "${IOC.phishUrl}"`,
        "| project Timestamp, AccountUpn, ActionType, IPAddress",
      ].join("\n"),
    },
    {
      id: "act-5007",
      type: "Remove persistence",
      entityType: "Persistence",
      entity: "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDriveSyncHelper",
      folderPath: "C:\\Users\\alice.chen\\AppData\\Roaming",
      device: IOC.victimDevice,
      source: "Automated investigation",
      investigationId: "inv-311",
      incidentId: "INC-2041",
      createdAt: at(2 * HOUR + 20 * MIN),
      status: "Pending approval",
      effect: "Deletes the registry run key so the payload stops launching at sign-in.",
      blastRadius:
        "Low. The key impersonates a OneDrive helper but is not one — check the target binary before approving.",
      undoable: false,
      undoLabel: null,
      verifyQuery: [
        "DeviceProcessEvents",
        `| where DeviceName == "${IOC.victimDevice}"`,
        '| where InitiatingProcessFileName =~ "explorer.exe"',
        "| project Timestamp, FileName, FolderPath, ProcessCommandLine",
      ].join("\n"),
    },
    {
      id: "act-5008",
      type: "Quarantine file",
      entityType: "File",
      entity: "invoice_apr.exe",
      folderPath: "C:\\Users\\grace.lin\\Downloads",
      device: "SALES-WS-11.contoso.com",
      source: "Automated investigation",
      investigationId: "inv-298",
      incidentId: "INC-2038",
      createdAt: at(4 * DAY),
      status: "Completed",
      effect: "The file was quarantined automatically before it ran.",
      blastRadius: "None. Blocked on download.",
      undoable: true,
      undoLabel: "Restore file from quarantine",
      verifyQuery: [
        "DeviceFileEvents",
        '| where DeviceName == "SALES-WS-11.contoso.com"',
        '| where FileName == "invoice_apr.exe"',
        "| project Timestamp, ActionType, FolderPath, SHA256",
      ].join("\n"),
    },
    {
      id: "act-5009",
      type: "Run antivirus scan",
      entityType: "Device",
      entity: "HR-WS-09.contoso.com",
      device: "HR-WS-09.contoso.com",
      source: "Manual",
      investigationId: null,
      incidentId: "INC-2038",
      createdAt: at(3 * DAY),
      status: "Completed",
      effect: "Ran a full Defender Antivirus scan and reported the result to the device timeline.",
      blastRadius: "None beyond the device running slower while it scans.",
      undoable: false,
      undoLabel: null,
      verifyQuery: [
        "DeviceFileEvents",
        '| where DeviceName == "HR-WS-09.contoso.com"',
        "| summarize Events = count() by ActionType",
      ].join("\n"),
    },
  ];
}

export function pendingActions(actions: RemediationAction[]): RemediationAction[] {
  return actions.filter((a) => a.status === "Pending approval");
}

export function historyActions(actions: RemediationAction[]): RemediationAction[] {
  return actions.filter((a) => a.status !== "Pending approval");
}

/**
 * The outcome of an approval decision, returned as data so the console can
 * render the consequence rather than silently mutating a row.
 */
export type Decision = {
  actionId: string;
  approved: boolean;
  status: ActionStatus;
  consequence: string;
};

export function decide(action: RemediationAction, approved: boolean): Decision {
  if (!approved) {
    return {
      actionId: action.id,
      approved: false,
      status: "Rejected",
      consequence: `${action.type} was not carried out. The entity stays as it is, and the investigation records that a human declined.`,
    };
  }
  return {
    actionId: action.id,
    approved: true,
    status: "Approved",
    consequence: action.undoable
      ? `${action.type} ran. It can still be reversed — ${action.undoLabel?.toLowerCase()}.`
      : `${action.type} ran, and there is no undo for this one.`,
  };
}
