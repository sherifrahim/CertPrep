/**
 * Table schemas for the practice lab.
 *
 * These mirror the shape of the real Microsoft Defender XDR advanced hunting
 * and Microsoft Sentinel tables closely enough that queries written here
 * transfer to the real portal. They are not exhaustive — each table carries the
 * columns that actually come up in SC-200 and SC-500 hunting, not all 100+.
 */
export type ColumnType = "string" | "int" | "long" | "real" | "bool" | "datetime" | "dynamic";

export type Column = { name: string; type: ColumnType; description: string };

export type TableSchema = {
  name: string;
  /** Which product surfaces this table, shown in the schema browser. */
  source: "Defender XDR" | "Microsoft Sentinel" | "Microsoft Entra ID";
  description: string;
  columns: Column[];
};

const t = (name: string, type: ColumnType, description: string): Column => ({
  name,
  type,
  description,
});

const COMMON_DEVICE: Column[] = [
  t("Timestamp", "datetime", "When the event was recorded (UTC)"),
  t("DeviceId", "string", "Unique device identifier"),
  t("DeviceName", "string", "Fully qualified device name"),
  t("ReportId", "string", "Event identifier, required by custom detection rules"),
];

export const TABLES: TableSchema[] = [
  {
    name: "DeviceProcessEvents",
    source: "Defender XDR",
    description: "Process creation on onboarded devices — the first place to look for execution.",
    columns: [
      ...COMMON_DEVICE,
      t("AccountName", "string", "Account that ran the process"),
      t("AccountDomain", "string", "Domain of the account"),
      t("FileName", "string", "Name of the process image"),
      t("FolderPath", "string", "Full path of the process image"),
      t("SHA256", "string", "Hash of the process image"),
      t("ProcessCommandLine", "string", "Full command line"),
      t("ProcessId", "int", "Process identifier"),
      t("InitiatingProcessFileName", "string", "Parent process image"),
      t("InitiatingProcessCommandLine", "string", "Parent command line"),
      t("InitiatingProcessAccountName", "string", "Account of the parent process"),
    ],
  },
  {
    name: "DeviceNetworkEvents",
    source: "Defender XDR",
    description: "Outbound and inbound network connections observed on devices.",
    columns: [
      ...COMMON_DEVICE,
      t("ActionType", "string", "ConnectionSuccess, ConnectionFailed, InboundConnectionAccepted"),
      t("RemoteIP", "string", "Remote address"),
      t("RemotePort", "int", "Remote port"),
      t("RemoteUrl", "string", "Remote hostname or URL where known"),
      t("LocalIP", "string", "Local address"),
      t("InitiatingProcessFileName", "string", "Process that made the connection"),
      t("InitiatingProcessCommandLine", "string", "Command line of that process"),
      t("InitiatingProcessAccountName", "string", "Account the process ran as"),
    ],
  },
  {
    name: "DeviceLogonEvents",
    source: "Defender XDR",
    description: "Sign-ins observed on devices, including logon type and result.",
    columns: [
      ...COMMON_DEVICE,
      t("ActionType", "string", "LogonSuccess or LogonFailed"),
      t("AccountName", "string", "Account that signed in"),
      t("AccountDomain", "string", "Domain of the account"),
      t("LogonType", "string", "Interactive, Network, RemoteInteractive, Batch, Service"),
      t("RemoteIP", "string", "Source address for remote logons"),
      t("RemoteDeviceName", "string", "Source device for remote logons"),
      t("IsLocalAdmin", "bool", "Whether the account is a local administrator"),
    ],
  },
  {
    name: "DeviceFileEvents",
    source: "Defender XDR",
    description: "File creation, modification, and deletion on devices.",
    columns: [
      ...COMMON_DEVICE,
      t("ActionType", "string", "FileCreated, FileModified, FileDeleted, FileRenamed"),
      t("FileName", "string", "Name of the file"),
      t("FolderPath", "string", "Directory containing the file"),
      t("SHA256", "string", "File hash"),
      t("FileSize", "long", "Size in bytes"),
      t("InitiatingProcessFileName", "string", "Process that touched the file"),
      t("InitiatingProcessAccountName", "string", "Account the process ran as"),
    ],
  },
  {
    name: "EmailEvents",
    source: "Defender XDR",
    description: "Message delivery, including sender, recipient, and verdict.",
    columns: [
      t("Timestamp", "datetime", "When the message was processed"),
      t("NetworkMessageId", "string", "Message identifier — the join key for email tables"),
      t("SenderFromAddress", "string", "From address"),
      t("SenderDisplayName", "string", "Display name shown to the recipient"),
      t("SenderIPv4", "string", "Sending IP address"),
      t("RecipientEmailAddress", "string", "Recipient"),
      t("Subject", "string", "Message subject"),
      t("DeliveryAction", "string", "Delivered, Blocked, Junked, Replaced"),
      t("DeliveryLocation", "string", "Inbox, JunkFolder, Quarantine, Deleted"),
      t("ThreatTypes", "string", "Phish, Malware, Spam, or empty"),
      t("AuthenticationDetails", "string", "SPF, DKIM, DMARC results"),
    ],
  },
  {
    name: "EmailUrlInfo",
    source: "Defender XDR",
    description: "URLs found inside messages. Join to EmailEvents on NetworkMessageId.",
    columns: [
      t("Timestamp", "datetime", "When the message was processed"),
      t("NetworkMessageId", "string", "Message identifier"),
      t("Url", "string", "URL contained in the message"),
      t("UrlDomain", "string", "Domain portion of the URL"),
    ],
  },
  {
    name: "UrlClickEvents",
    source: "Defender XDR",
    description: "Safe Links click-throughs — who actually clicked, not just who received.",
    columns: [
      t("Timestamp", "datetime", "When the link was clicked"),
      t("NetworkMessageId", "string", "Message identifier"),
      t("AccountUpn", "string", "User who clicked"),
      t("Url", "string", "URL that was clicked"),
      t("ActionType", "string", "ClickAllowed, ClickBlocked, UrlScanInProgress"),
      t("IPAddress", "string", "Client address at click time"),
    ],
  },
  {
    name: "IdentityLogonEvents",
    source: "Defender XDR",
    description: "Authentication seen by Defender for Identity across the directory.",
    columns: [
      t("Timestamp", "datetime", "When the logon occurred"),
      t("ActionType", "string", "LogonSuccess or LogonFailed"),
      t("AccountUpn", "string", "Account principal name"),
      t("AccountName", "string", "SAM account name"),
      t("DeviceName", "string", "Device the logon targeted"),
      t("IPAddress", "string", "Source address"),
      t("LogonType", "string", "Kerberos, NTLM, LDAP"),
      t("Protocol", "string", "Authentication protocol"),
    ],
  },
  {
    name: "SigninLogs",
    source: "Microsoft Entra ID",
    description: "Interactive sign-ins to cloud applications, with risk and MFA detail.",
    columns: [
      t("TimeGenerated", "datetime", "When the sign-in occurred"),
      t("UserPrincipalName", "string", "Signing-in user"),
      t("AppDisplayName", "string", "Application signed into"),
      t("IPAddress", "string", "Source address"),
      t("Location", "string", "Country code resolved from the IP"),
      t("ResultType", "string", "0 for success, otherwise an error code"),
      t("ResultDescription", "string", "Human readable outcome"),
      t("RiskLevelDuringSignIn", "string", "none, low, medium, high"),
      t("ConditionalAccessStatus", "string", "success, failure, notApplied"),
      t("AuthenticationRequirement", "string", "singleFactorAuthentication or multiFactorAuthentication"),
      t("UserAgent", "string", "Client user agent"),
    ],
  },
  {
    name: "CloudAppEvents",
    source: "Defender XDR",
    description: "Activity in connected SaaS applications, from Defender for Cloud Apps.",
    columns: [
      t("Timestamp", "datetime", "When the activity occurred"),
      t("Application", "string", "Application name"),
      t("ActionType", "string", "Activity performed"),
      t("AccountDisplayName", "string", "Acting user"),
      t("IPAddress", "string", "Source address"),
      t("CountryCode", "string", "Country resolved from the IP"),
      t("ObjectName", "string", "Object acted on, such as a file"),
      t("IsAdminOperation", "bool", "Whether the action was administrative"),
    ],
  },
  {
    name: "AlertInfo",
    source: "Defender XDR",
    description: "One row per alert. Join to AlertEvidence to reach the affected entities.",
    columns: [
      t("Timestamp", "datetime", "When the alert was raised"),
      t("AlertId", "string", "Alert identifier"),
      t("Title", "string", "Alert title"),
      t("Category", "string", "MITRE tactic category"),
      t("Severity", "string", "Informational, Low, Medium, High"),
      t("ServiceSource", "string", "Product that raised the alert"),
      t("DetectionSource", "string", "Detection technology"),
      t("AttackTechniques", "string", "MITRE ATT&CK technique identifiers"),
    ],
  },
  {
    name: "AlertEvidence",
    source: "Defender XDR",
    description: "Entities attached to each alert — devices, accounts, files, addresses.",
    columns: [
      t("Timestamp", "datetime", "When the alert was raised"),
      t("AlertId", "string", "Alert identifier"),
      t("EntityType", "string", "Device, User, File, Ip, Url, Mailbox"),
      t("DeviceName", "string", "Device, where the entity is a device"),
      t("AccountUpn", "string", "Account, where the entity is a user"),
      t("FileName", "string", "File, where the entity is a file"),
      t("RemoteIP", "string", "Address, where the entity is an IP"),
      t("SHA256", "string", "Hash, where the entity is a file"),
    ],
  },
  {
    name: "SecurityEvent",
    source: "Microsoft Sentinel",
    description: "Windows security event log collected by the Azure Monitor Agent.",
    columns: [
      t("TimeGenerated", "datetime", "When the event was recorded"),
      t("Computer", "string", "Reporting computer"),
      t("EventID", "int", "Windows event identifier"),
      t("Activity", "string", "Event description"),
      t("Account", "string", "Account involved"),
      t("LogonType", "int", "Numeric logon type"),
      t("IpAddress", "string", "Source address"),
      t("Process", "string", "Process associated with the event"),
    ],
  },
  {
    name: "CommonSecurityLog",
    source: "Microsoft Sentinel",
    description: "CEF records forwarded from network appliances such as firewalls.",
    columns: [
      t("TimeGenerated", "datetime", "When the record was received"),
      t("DeviceVendor", "string", "Appliance vendor"),
      t("DeviceProduct", "string", "Appliance product"),
      t("Activity", "string", "Action taken"),
      t("SourceIP", "string", "Source address"),
      t("DestinationIP", "string", "Destination address"),
      t("DestinationPort", "int", "Destination port"),
      t("DeviceAction", "string", "allow, deny, drop"),
      t("ReceivedBytes", "long", "Bytes received"),
      t("SentBytes", "long", "Bytes sent"),
    ],
  },
];

export const TABLE_BY_NAME = new Map(TABLES.map((table) => [table.name.toLowerCase(), table]));

export function getTable(name: string): TableSchema | undefined {
  return TABLE_BY_NAME.get(name.toLowerCase());
}
