import { IOC, LAB_NOW, labTables } from "./data";
import type { Row } from "./kql/engine";

/**
 * Incidents as Defender XDR presents them: alerts correlated into one case by
 * shared entities, with the impacted assets rolled up.
 */
export type Severity = "High" | "Medium" | "Low" | "Informational";
export type IncidentStatus = "Active" | "In progress" | "Resolved";
export type Classification =
  | "Not set"
  | "True positive"
  | "Informational, expected activity"
  | "False positive";

export type IncidentAlert = {
  alertId: string;
  title: string;
  severity: Severity;
  category: string;
  serviceSource: string;
  techniques: string;
  timestamp: string;
};

export type Incident = {
  id: string;
  title: string;
  severity: Severity;
  /** Default state; user triage is layered on top in the browser. */
  status: IncidentStatus;
  classification: Classification;
  firstActivity: string;
  lastActivity: string;
  alerts: IncidentAlert[];
  devices: string[];
  users: string[];
  /** Attack stages present, ordered as the kill chain runs. */
  categories: string[];
  summary: string;
  /** Investigation prompts, so the queue teaches rather than just displays. */
  investigation: { question: string; query: string }[];
};

const KILL_CHAIN = [
  "InitialAccess",
  "Execution",
  "Persistence",
  "PrivilegeEscalation",
  "CredentialAccess",
  "Discovery",
  "LateralMovement",
  "Exfiltration",
  "Impact",
];

function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v ?? "");
}

/**
 * Correlates the generated alerts into incidents. The intrusion alerts share
 * entities so they collapse into one case, exactly as XDR would; the remaining
 * alerts stand alone to keep the queue realistic.
 */
export function buildIncidents(): Incident[] {
  const t = labTables();
  const alerts = t.AlertInfo as Row[];
  const evidence = t.AlertEvidence as Row[];

  const evidenceFor = (alertId: string) => evidence.filter((e) => e.AlertId === alertId);

  const toAlert = (a: Row): IncidentAlert => ({
    alertId: String(a.AlertId),
    title: String(a.Title),
    severity: String(a.Severity) as Severity,
    category: String(a.Category),
    serviceSource: String(a.ServiceSource),
    techniques: String(a.AttackTechniques),
    timestamp: iso(a.Timestamp),
  });

  const intrusionIds = ["al-1001", "al-1002", "al-1003", "al-1004", "al-1005", "al-1006"];
  const intrusionAlerts = alerts
    .filter((a) => intrusionIds.includes(String(a.AlertId)))
    .map(toAlert)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const devices = new Set<string>();
  const users = new Set<string>();
  for (const id of intrusionIds) {
    for (const e of evidenceFor(id)) {
      if (e.DeviceName) devices.add(String(e.DeviceName));
      if (e.AccountUpn) users.add(String(e.AccountUpn));
    }
  }

  const categories = [...new Set(intrusionAlerts.map((a) => a.category))].sort(
    (a, b) => KILL_CHAIN.indexOf(a) - KILL_CHAIN.indexOf(b),
  );

  const primary: Incident = {
    id: "INC-2041",
    title:
      "Multi-stage incident involving phishing, credential access and exfiltration on one endpoint",
    severity: "High",
    status: "Active",
    classification: "Not set",
    firstActivity: intrusionAlerts[0]?.timestamp ?? "",
    lastActivity: intrusionAlerts[intrusionAlerts.length - 1]?.timestamp ?? "",
    alerts: intrusionAlerts,
    devices: [...devices],
    users: [...users],
    categories,
    summary:
      `A phishing message reached six mailboxes. One recipient clicked, their credentials were ` +
      `replayed from an external address without multifactor authentication, and follow-on activity ` +
      `on their workstation dumped credentials and moved to a file server before data left the network.`,
    investigation: [
      {
        question: "Who received the phishing message, and who actually clicked it?",
        query: `EmailEvents
| where ThreatTypes == "Phish"
| join kind=leftouter (UrlClickEvents) on NetworkMessageId
| project RecipientEmailAddress, Subject, Clicked = isnotempty(AccountUpn)`,
      },
      {
        question: "Was the sign-in that followed protected by MFA?",
        query: `SigninLogs
| where UserPrincipalName == "${IOC.victimUpn}"
| project TimeGenerated, IPAddress, Location, RiskLevelDuringSignIn, AuthenticationRequirement, ConditionalAccessStatus`,
      },
      {
        question: "Did the same address touch any other accounts?",
        query: `SigninLogs
| where IPAddress == "${IOC.c2Ip}"
| summarize Attempts = count(), Users = dcount(UserPrincipalName), Failed = countif(ResultType != "0")`,
      },
      {
        question: "What ran on the endpoint after the click?",
        query: `DeviceProcessEvents
| where DeviceName == "${IOC.victimDevice}"
| where ProcessCommandLine has "-enc" or ProcessCommandLine contains "MiniDump" or FileName =~ "7z.exe"
| project Timestamp, FileName, InitiatingProcessFileName, ProcessCommandLine
| sort by Timestamp asc`,
      },
      {
        question: "How far did the attacker move?",
        query: `DeviceLogonEvents
| where RemoteDeviceName == "${IOC.victimDevice}"
| project Timestamp, DeviceName, AccountName, LogonType, ActionType`,
      },
      {
        question: "How much data left, and to where?",
        query: `CommonSecurityLog
| summarize TotalSent = sum(SentBytes) by SourceIP, DestinationIP
| top 3 by TotalSent desc`,
      },
    ],
  };

  // Standalone lower-severity cases so the queue is not a single row.
  const filler: Incident[] = [
    {
      id: "INC-2038",
      title: "Malware detected in a downloaded file",
      severity: "Medium",
      status: "Resolved",
      classification: "True positive",
      firstActivity: new Date(LAB_NOW.getTime() - 4 * 86_400_000).toISOString(),
      lastActivity: new Date(LAB_NOW.getTime() - 4 * 86_400_000 + 900_000).toISOString(),
      alerts: [
        {
          alertId: "al-0980",
          title: "Malware was prevented from running",
          severity: "Medium",
          category: "Malware",
          serviceSource: "Microsoft Defender for Endpoint",
          techniques: "T1204.002",
          timestamp: new Date(LAB_NOW.getTime() - 4 * 86_400_000).toISOString(),
        },
      ],
      devices: ["SALES-WS-11.contoso.com"],
      users: ["grace.lin@contoso.com"],
      categories: ["Malware"],
      summary:
        "Defender Antivirus blocked a file on download. No execution followed and the file was quarantined.",
      investigation: [
        {
          question: "Did anything else run on that device around the same time?",
          query: `DeviceProcessEvents
| where DeviceName == "SALES-WS-11.contoso.com"
| where Timestamp > ago(5d)
| project Timestamp, FileName, ProcessCommandLine
| take 30`,
        },
      ],
    },
    {
      id: "INC-2035",
      title: "Sign-in from an unfamiliar location",
      severity: "Low",
      status: "Resolved",
      classification: "False positive",
      firstActivity: new Date(LAB_NOW.getTime() - 6 * 86_400_000).toISOString(),
      lastActivity: new Date(LAB_NOW.getTime() - 6 * 86_400_000 + 300_000).toISOString(),
      alerts: [
        {
          alertId: "al-0951",
          title: "Sign-in from an unfamiliar location",
          severity: "Low",
          category: "InitialAccess",
          serviceSource: "Microsoft Entra ID Protection",
          techniques: "T1078",
          timestamp: new Date(LAB_NOW.getTime() - 6 * 86_400_000).toISOString(),
        },
      ],
      devices: [],
      users: ["david.okafor@contoso.com"],
      categories: ["InitialAccess"],
      summary:
        "A user signed in from a new country while travelling. MFA was satisfied and the device was compliant, so this was closed as a false positive.",
      investigation: [
        {
          question: "Was MFA satisfied on that sign-in?",
          query: `SigninLogs
| where UserPrincipalName == "david.okafor@contoso.com"
| project TimeGenerated, IPAddress, Location, AuthenticationRequirement, ConditionalAccessStatus`,
        },
      ],
    },
  ];

  return [primary, ...filler];
}

export function getIncident(id: string): Incident | undefined {
  return buildIncidents().find((i) => i.id === id);
}

export const SEVERITY_ORDER: Severity[] = ["High", "Medium", "Low", "Informational"];

export const CLASSIFICATIONS: Classification[] = [
  "Not set",
  "True positive",
  "Informational, expected activity",
  "False positive",
];

export const STATUSES: IncidentStatus[] = ["Active", "In progress", "Resolved"];

export const ANALYSTS = [
  "Unassigned",
  "You",
  "Priya Nair",
  "Tom Baxter",
  "Sofia Marchetti",
];
