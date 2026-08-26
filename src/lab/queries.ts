/** Starter queries shown beside the hunting console, grouped as the portal does. */
export type SampleQuery = {
  id: string;
  title: string;
  description: string;
  category: "Getting started" | "Email" | "Identity" | "Endpoint" | "Network" | "Alerts";
  query: string;
};

export const SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: "q-first",
    title: "Look at a table",
    description: "Every hunt starts by seeing what a table actually holds.",
    category: "Getting started",
    query: `DeviceProcessEvents
| take 20`,
  },
  {
    id: "q-timefilter",
    title: "Filter by time",
    description: "Always scope by time first — it is the cheapest filter.",
    category: "Getting started",
    query: `DeviceProcessEvents
| where Timestamp > ago(1d)
| project Timestamp, DeviceName, AccountName, FileName, ProcessCommandLine
| take 50`,
  },
  {
    id: "q-count-by",
    title: "Count events by device",
    description: "summarize with a grouping key is the workhorse of KQL.",
    category: "Getting started",
    query: `DeviceProcessEvents
| summarize Events = count() by DeviceName
| sort by Events desc`,
  },
  {
    id: "q-phish",
    title: "Find the phishing campaign",
    description: "Messages flagged as phish, and where they landed.",
    category: "Email",
    query: `EmailEvents
| where ThreatTypes == "Phish"
| project Timestamp, SenderFromAddress, RecipientEmailAddress, Subject, DeliveryAction, DeliveryLocation`,
  },
  {
    id: "q-clicks",
    title: "Who received it, and who clicked",
    description: "EmailEvents gives recipients; UrlClickEvents gives the subset that clicked.",
    category: "Email",
    query: `EmailEvents
| where ThreatTypes == "Phish"
| join kind=leftouter (UrlClickEvents) on NetworkMessageId
| project RecipientEmailAddress, Subject, Clicked = isnotempty(AccountUpn), Url`,
  },
  {
    id: "q-risky-signin",
    title: "Risky sign-ins without MFA",
    description: "High risk plus single factor is the combination that matters.",
    category: "Identity",
    query: `SigninLogs
| where RiskLevelDuringSignIn in ("high", "medium")
| where AuthenticationRequirement == "singleFactorAuthentication"
| project TimeGenerated, UserPrincipalName, IPAddress, Location, ResultDescription, ConditionalAccessStatus`,
  },
  {
    id: "q-spray",
    title: "One address, many accounts",
    description: "A classic spray signature: a single IP touching several users.",
    category: "Identity",
    query: `SigninLogs
| summarize Attempts = count(), Users = dcount(UserPrincipalName), Failures = countif(ResultType != "0") by IPAddress
| where Users > 1
| sort by Users desc`,
  },
  {
    id: "q-encoded-ps",
    title: "Encoded PowerShell",
    description: "Base64 encoded commands are a strong execution signal.",
    category: "Endpoint",
    query: `DeviceProcessEvents
| where FileName =~ "powershell.exe"
| where ProcessCommandLine has "-enc"
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName, ProcessCommandLine`,
  },
  {
    id: "q-lsass",
    title: "Credential dumping",
    description: "comsvcs.dll with MiniDump is a well-known LSASS dump technique.",
    category: "Endpoint",
    query: `DeviceProcessEvents
| where ProcessCommandLine contains "comsvcs.dll"
| where ProcessCommandLine contains "MiniDump"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine`,
  },
  {
    id: "q-latest-per-device",
    title: "Latest event per device",
    description: "arg_max returns the whole row holding the maximum, one per key.",
    category: "Endpoint",
    query: `DeviceProcessEvents
| summarize arg_max(Timestamp, *) by DeviceName
| project DeviceName, Timestamp, FileName, ProcessCommandLine`,
  },
  {
    id: "q-lateral",
    title: "Remote interactive logons",
    description: "Lateral movement usually shows up as a logon from another host.",
    category: "Endpoint",
    query: `DeviceLogonEvents
| where LogonType == "RemoteInteractive"
| project Timestamp, DeviceName, AccountName, RemoteDeviceName, RemoteIP, IsLocalAdmin`,
  },
  {
    id: "q-beacon",
    title: "Repeated outbound connections",
    description: "Beaconing looks like the same destination, over and over.",
    category: "Network",
    query: `DeviceNetworkEvents
| summarize Connections = count(), FirstSeen = min(Timestamp), LastSeen = max(Timestamp) by RemoteIP, DeviceName
| where Connections > 5
| sort by Connections desc`,
  },
  {
    id: "q-exfil",
    title: "Largest outbound transfers",
    description: "Firewall byte counts expose bulk exfiltration quickly.",
    category: "Network",
    query: `CommonSecurityLog
| summarize TotalSent = sum(SentBytes) by SourceIP, DestinationIP
| top 5 by TotalSent desc`,
  },
  {
    id: "q-alert-chain",
    title: "Alerts across the kill chain",
    description: "Grouping by category shows how far the attack progressed.",
    category: "Alerts",
    query: `AlertInfo
| summarize Alerts = count(), Titles = make_set(Title) by Category, Severity
| sort by Severity asc`,
  },
  {
    id: "q-alert-entities",
    title: "Alerts joined to their entities",
    description: "AlertInfo has the alert; AlertEvidence has the affected assets.",
    category: "Alerts",
    query: `AlertInfo
| where Severity == "High"
| join (AlertEvidence) on AlertId
| project Timestamp, Title, EntityType, DeviceName, AccountUpn, RemoteIP`,
  },
  {
    id: "q-firsttime",
    title: "Never seen before",
    description: "leftanti finds things present today with no history — a first-seen hunt.",
    category: "Endpoint",
    query: `DeviceProcessEvents
| where Timestamp > ago(3d)
| distinct FileName
| join kind=leftanti (
    DeviceProcessEvents
    | where Timestamp between (ago(8d) .. ago(3d))
    | distinct FileName
) on FileName`,
  },
];

export const QUERY_CATEGORIES = [
  "Getting started",
  "Email",
  "Identity",
  "Endpoint",
  "Network",
  "Alerts",
] as const;
