import type { Dataset, Row, Tables } from "./kql/engine";

/**
 * Synthetic telemetry for the practice lab.
 *
 * Generated deterministically from a fixed seed so every learner sees the same
 * environment and lab exercises have stable, checkable answers. A real
 * intrusion is embedded in the noise — phishing, credential theft, lateral
 * movement, exfiltration — so hunting queries have something to find.
 */

function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The lab clock. Everything is generated relative to this instant. */
export const LAB_NOW = new Date("2026-03-10T12:00:00.000Z");
const DAY = 86_400_000;
const HOUR = 3_600_000;
const MIN = 60_000;

const ago = (ms: number) => new Date(LAB_NOW.getTime() - ms);

export const USERS = [
  { upn: "alice.chen@contoso.com", name: "alice.chen", display: "Alice Chen", dept: "Finance" },
  { upn: "bruno.ricci@contoso.com", name: "bruno.ricci", display: "Bruno Ricci", dept: "Finance" },
  { upn: "chloe.dubois@contoso.com", name: "chloe.dubois", display: "Chloe Dubois", dept: "Legal" },
  { upn: "david.okafor@contoso.com", name: "david.okafor", display: "David Okafor", dept: "IT" },
  { upn: "elena.petrova@contoso.com", name: "elena.petrova", display: "Elena Petrova", dept: "HR" },
  { upn: "farid.hassan@contoso.com", name: "farid.hassan", display: "Farid Hassan", dept: "IT" },
  { upn: "grace.lin@contoso.com", name: "grace.lin", display: "Grace Lin", dept: "Sales" },
  { upn: "svc_backup@contoso.com", name: "svc_backup", display: "Backup Service", dept: "IT" },
];

export const DEVICES = [
  { id: "d1a2b3", name: "FIN-WS-04.contoso.com", os: "Windows 11", user: "alice.chen" },
  { id: "d2b3c4", name: "FIN-WS-07.contoso.com", os: "Windows 11", user: "bruno.ricci" },
  { id: "d3c4d5", name: "LEG-WS-02.contoso.com", os: "Windows 11", user: "chloe.dubois" },
  { id: "d4d5e6", name: "IT-WS-01.contoso.com", os: "Windows 11", user: "david.okafor" },
  { id: "d5e6f7", name: "HR-WS-09.contoso.com", os: "Windows 10", user: "elena.petrova" },
  { id: "d6f7a8", name: "FIN-SRV-02.contoso.com", os: "Windows Server 2022", user: "svc_backup" },
  { id: "d7a8b9", name: "DC-01.contoso.com", os: "Windows Server 2022", user: "svc_backup" },
  { id: "d8b9c0", name: "SALES-WS-11.contoso.com", os: "Windows 11", user: "grace.lin" },
];

/** The attacker's infrastructure, so exercises can reference it precisely. */
export const IOC = {
  phishDomain: "contoso-benefits.com",
  phishSender: "hr-notice@contoso-benefits.com",
  phishUrl: "https://contoso-benefits.com/enrolment/verify",
  c2Ip: "185.220.101.44",
  c2Port: 443,
  victimUpn: "alice.chen@contoso.com",
  victimDevice: "FIN-WS-04.contoso.com",
  pivotDevice: "FIN-SRV-02.contoso.com",
  compromisedService: "svc_backup",
  dumpFile: "lsass_dump.bin",
  archiveFile: "fin_q1_archive.7z",
};

const BENIGN_PROCESSES = [
  { file: "chrome.exe", cmd: "chrome.exe --type=renderer", parent: "explorer.exe" },
  { file: "outlook.exe", cmd: '"C:\\Program Files\\Microsoft Office\\OUTLOOK.EXE"', parent: "explorer.exe" },
  { file: "excel.exe", cmd: '"C:\\Program Files\\Microsoft Office\\EXCEL.EXE" budget.xlsx', parent: "explorer.exe" },
  { file: "teams.exe", cmd: "teams.exe --process-start-args", parent: "explorer.exe" },
  { file: "svchost.exe", cmd: "svchost.exe -k netsvcs", parent: "services.exe" },
  { file: "powershell.exe", cmd: "powershell.exe Get-ChildItem C:\\Reports", parent: "explorer.exe" },
  { file: "cmd.exe", cmd: "cmd.exe /c dir", parent: "explorer.exe" },
  { file: "MsMpEng.exe", cmd: "MsMpEng.exe", parent: "services.exe" },
  { file: "OneDrive.exe", cmd: "OneDrive.exe /background", parent: "explorer.exe" },
  { file: "code.exe", cmd: "code.exe --no-sandbox", parent: "explorer.exe" },
];

const BENIGN_DOMAINS = [
  "login.microsoftonline.com",
  "graph.microsoft.com",
  "outlook.office365.com",
  "teams.microsoft.com",
  "github.com",
  "update.microsoft.com",
  "contoso.sharepoint.com",
];

const COUNTRIES = ["GB", "GB", "GB", "IE", "US", "DE"];

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function id(prefix: string, n: number): string {
  return `${prefix}${String(n).padStart(6, "0")}`;
}

/* --------------------------------------------------------------- builders */

function buildProcessEvents(r: () => number): Dataset {
  const rows: Dataset = [];
  let n = 0;

  // Benign background over 7 days.
  for (let d = 7; d >= 0; d--) {
    for (const dev of DEVICES) {
      const count = 12 + Math.floor(r() * 10);
      for (let i = 0; i < count; i++) {
        const p = pick(BENIGN_PROCESSES, r);
        rows.push({
          Timestamp: ago(d * DAY - Math.floor(r() * 20 * HOUR)),
          DeviceId: dev.id,
          DeviceName: dev.name,
          ReportId: id("rp", n++),
          AccountName: dev.user,
          AccountDomain: "contoso",
          FileName: p.file,
          FolderPath: `C:\\Windows\\System32\\${p.file}`,
          SHA256: `benign${(Math.floor(r() * 1e12)).toString(16)}`,
          ProcessCommandLine: p.cmd,
          ProcessId: 1000 + Math.floor(r() * 8000),
          InitiatingProcessFileName: p.parent,
          InitiatingProcessCommandLine: p.parent,
          InitiatingProcessAccountName: dev.user,
        });
      }
    }
  }

  // --- Attack chain on the victim workstation, roughly 2 days ago ---
  const t0 = 2 * DAY + 3 * HOUR;
  const attack = [
    {
      off: 0,
      file: "powershell.exe",
      cmd: "powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA",
      parent: "outlook.exe",
      acct: "alice.chen",
    },
    {
      off: 4 * MIN,
      file: "cmd.exe",
      cmd: "cmd.exe /c whoami /all",
      parent: "powershell.exe",
      acct: "alice.chen",
    },
    {
      off: 9 * MIN,
      file: "net.exe",
      cmd: "net.exe group \"Domain Admins\" /domain",
      parent: "cmd.exe",
      acct: "alice.chen",
    },
    {
      off: 21 * MIN,
      file: "rundll32.exe",
      cmd: `rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 712 C:\\Users\\Public\\${IOC.dumpFile} full`,
      parent: "powershell.exe",
      acct: "alice.chen",
    },
    {
      off: 38 * MIN,
      file: "7z.exe",
      cmd: `7z.exe a -pInfected C:\\Users\\Public\\${IOC.archiveFile} C:\\Finance\\Q1\\*`,
      parent: "powershell.exe",
      acct: "alice.chen",
    },
  ];
  for (const a of attack) {
    rows.push({
      Timestamp: ago(t0 - a.off),
      DeviceId: "d1a2b3",
      DeviceName: IOC.victimDevice,
      ReportId: id("rp", n++),
      AccountName: a.acct,
      AccountDomain: "contoso",
      FileName: a.file,
      FolderPath: `C:\\Windows\\System32\\${a.file}`,
      SHA256: "3f8a1c7e9b2d4a6f0c5e8b1d7a4f2c9e6b3d8a1f5c7e2b9d4a6f8c1e3b7d5a9f",
      ProcessCommandLine: a.cmd,
      ProcessId: 4400 + Math.floor(r() * 200),
      InitiatingProcessFileName: a.parent,
      InitiatingProcessCommandLine: a.parent,
      InitiatingProcessAccountName: a.acct,
    });
  }

  // Lateral movement onto the file server using the service account.
  rows.push({
    Timestamp: ago(t0 - 52 * MIN),
    DeviceId: "d6f7a8",
    DeviceName: IOC.pivotDevice,
    ReportId: id("rp", n++),
    AccountName: IOC.compromisedService,
    AccountDomain: "contoso",
    FileName: "powershell.exe",
    FolderPath: "C:\\Windows\\System32\\powershell.exe",
    SHA256: "3f8a1c7e9b2d4a6f0c5e8b1d7a4f2c9e6b3d8a1f5c7e2b9d4a6f8c1e3b7d5a9f",
    ProcessCommandLine: "powershell.exe -nop -w hidden -enc RwBlAHQALQBDAGgAaQBsAGQASQB0AGUAbQAgAFwAXABGAEkATgAtAFMAUgBWAA==",
    ProcessId: 6612,
    InitiatingProcessFileName: "wmiprvse.exe",
    InitiatingProcessCommandLine: "wmiprvse.exe -secured -Embedding",
    InitiatingProcessAccountName: IOC.compromisedService,
  });

  return rows;
}

function buildNetworkEvents(r: () => number): Dataset {
  const rows: Dataset = [];
  let n = 0;

  for (let d = 7; d >= 0; d--) {
    for (const dev of DEVICES) {
      const count = 8 + Math.floor(r() * 8);
      for (let i = 0; i < count; i++) {
        const host = pick(BENIGN_DOMAINS, r);
        rows.push({
          Timestamp: ago(d * DAY - Math.floor(r() * 20 * HOUR)),
          DeviceId: dev.id,
          DeviceName: dev.name,
          ReportId: id("nw", n++),
          ActionType: "ConnectionSuccess",
          RemoteIP: `20.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}`,
          RemotePort: 443,
          RemoteUrl: host,
          LocalIP: `10.20.${Math.floor(r() * 6)}.${Math.floor(r() * 200)}`,
          InitiatingProcessFileName: pick(["chrome.exe", "outlook.exe", "teams.exe"], r),
          InitiatingProcessCommandLine: "",
          InitiatingProcessAccountName: dev.user,
        });
      }
    }
  }

  // Command and control beaconing, then a bulk transfer.
  const t0 = 2 * DAY + 3 * HOUR;
  for (let i = 0; i < 14; i++) {
    rows.push({
      Timestamp: ago(t0 - i * 4 * MIN),
      DeviceId: "d1a2b3",
      DeviceName: IOC.victimDevice,
      ReportId: id("nw", n++),
      ActionType: "ConnectionSuccess",
      RemoteIP: IOC.c2Ip,
      RemotePort: IOC.c2Port,
      RemoteUrl: IOC.phishDomain,
      LocalIP: "10.20.1.44",
      InitiatingProcessFileName: "powershell.exe",
      InitiatingProcessCommandLine: "powershell.exe -nop -w hidden -enc",
      InitiatingProcessAccountName: "alice.chen",
    });
  }

  return rows;
}

function buildLogonEvents(r: () => number): Dataset {
  const rows: Dataset = [];
  let n = 0;

  for (let d = 7; d >= 0; d--) {
    for (const dev of DEVICES) {
      rows.push({
        Timestamp: ago(d * DAY - 8 * HOUR - Math.floor(r() * HOUR)),
        DeviceId: dev.id,
        DeviceName: dev.name,
        ReportId: id("lg", n++),
        ActionType: "LogonSuccess",
        AccountName: dev.user,
        AccountDomain: "contoso",
        LogonType: "Interactive",
        RemoteIP: "",
        RemoteDeviceName: "",
        IsLocalAdmin: dev.user === "svc_backup",
      });
      if (r() > 0.75) {
        rows.push({
          Timestamp: ago(d * DAY - 9 * HOUR),
          DeviceId: dev.id,
          DeviceName: dev.name,
          ReportId: id("lg", n++),
          ActionType: "LogonFailed",
          AccountName: dev.user,
          AccountDomain: "contoso",
          LogonType: "Interactive",
          RemoteIP: "",
          RemoteDeviceName: "",
          IsLocalAdmin: false,
        });
      }
    }
  }

  // Lateral movement: remote interactive onto the pivot from the victim host.
  const t0 = 2 * DAY + 3 * HOUR;
  rows.push({
    Timestamp: ago(t0 - 55 * MIN),
    DeviceId: "d6f7a8",
    DeviceName: IOC.pivotDevice,
    ReportId: id("lg", n++),
    ActionType: "LogonSuccess",
    AccountName: IOC.compromisedService,
    AccountDomain: "contoso",
    LogonType: "RemoteInteractive",
    RemoteIP: "10.20.1.44",
    RemoteDeviceName: IOC.victimDevice,
    IsLocalAdmin: true,
  });
  // Failed attempts against the domain controller, right before it succeeded.
  for (let i = 0; i < 6; i++) {
    rows.push({
      Timestamp: ago(t0 - 44 * MIN - i * MIN),
      DeviceId: "d7a8b9",
      DeviceName: "DC-01.contoso.com",
      ReportId: id("lg", n++),
      ActionType: "LogonFailed",
      AccountName: pick(["administrator", "admin", "backup_admin"], r),
      AccountDomain: "contoso",
      LogonType: "Network",
      RemoteIP: "10.20.1.44",
      RemoteDeviceName: IOC.victimDevice,
      IsLocalAdmin: false,
    });
  }

  return rows;
}

function buildFileEvents(r: () => number): Dataset {
  const rows: Dataset = [];
  let n = 0;

  for (let d = 7; d >= 0; d--) {
    for (const dev of DEVICES.slice(0, 5)) {
      const count = 4 + Math.floor(r() * 5);
      for (let i = 0; i < count; i++) {
        rows.push({
          Timestamp: ago(d * DAY - Math.floor(r() * 18 * HOUR)),
          DeviceId: dev.id,
          DeviceName: dev.name,
          ReportId: id("fl", n++),
          ActionType: "FileCreated",
          FileName: pick(["report.docx", "budget.xlsx", "notes.txt", "deck.pptx"], r),
          FolderPath: "C:\\Users\\Public\\Documents",
          SHA256: `benign${Math.floor(r() * 1e12).toString(16)}`,
          FileSize: 10_000 + Math.floor(r() * 900_000),
          InitiatingProcessFileName: pick(["excel.exe", "winword.exe", "notepad.exe"], r),
          InitiatingProcessAccountName: dev.user,
        });
      }
    }
  }

  const t0 = 2 * DAY + 3 * HOUR;
  rows.push({
    Timestamp: ago(t0 - 22 * MIN),
    DeviceId: "d1a2b3",
    DeviceName: IOC.victimDevice,
    ReportId: id("fl", n++),
    ActionType: "FileCreated",
    FileName: IOC.dumpFile,
    FolderPath: "C:\\Users\\Public",
    SHA256: "9d4a6f8c1e3b7d5a9f3f8a1c7e9b2d4a6f0c5e8b1d7a4f2c9e6b3d8a1f5c7e2b",
    FileSize: 48_312_704,
    InitiatingProcessFileName: "rundll32.exe",
    InitiatingProcessAccountName: "alice.chen",
  });
  rows.push({
    Timestamp: ago(t0 - 39 * MIN),
    DeviceId: "d1a2b3",
    DeviceName: IOC.victimDevice,
    ReportId: id("fl", n++),
    ActionType: "FileCreated",
    FileName: IOC.archiveFile,
    FolderPath: "C:\\Users\\Public",
    SHA256: "1f5c7e2b9d4a6f8c1e3b7d5a9f3f8a1c7e9b2d4a6f0c5e8b1d7a4f2c9e6b3d8a",
    FileSize: 219_884_311,
    InitiatingProcessFileName: "7z.exe",
    InitiatingProcessAccountName: "alice.chen",
  });

  return rows;
}

function buildEmail(r: () => number): { events: Dataset; urls: Dataset; clicks: Dataset } {
  const events: Dataset = [];
  const urls: Dataset = [];
  const clicks: Dataset = [];
  let n = 0;

  for (let d = 7; d >= 0; d--) {
    for (const u of USERS.slice(0, 7)) {
      const count = 3 + Math.floor(r() * 4);
      for (let i = 0; i < count; i++) {
        const mid = id("nm", n++);
        events.push({
          Timestamp: ago(d * DAY - Math.floor(r() * 16 * HOUR)),
          NetworkMessageId: mid,
          SenderFromAddress: pick(
            ["news@vendor.com", "billing@supplier.co.uk", "no-reply@github.com", "hr@contoso.com"],
            r,
          ),
          SenderDisplayName: "Notifications",
          SenderIPv4: `52.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}`,
          RecipientEmailAddress: u.upn,
          Subject: pick(["Weekly digest", "Invoice attached", "Build succeeded", "Policy update"], r),
          DeliveryAction: "Delivered",
          DeliveryLocation: "Inbox",
          ThreatTypes: "",
          AuthenticationDetails: "SPF: pass; DKIM: pass; DMARC: pass",
        });
      }
    }
  }

  // The phishing campaign: delivered to six mailboxes, one click.
  const phishTime = ago(2 * DAY + 5 * HOUR);
  const recipients = USERS.slice(0, 6);
  for (const u of recipients) {
    const mid = id("nm", n++);
    events.push({
      Timestamp: phishTime,
      NetworkMessageId: mid,
      SenderFromAddress: IOC.phishSender,
      SenderDisplayName: "Contoso Benefits",
      SenderIPv4: "185.220.101.44",
      RecipientEmailAddress: u.upn,
      Subject: "Action required: benefits enrolment closes today",
      DeliveryAction: "Delivered",
      DeliveryLocation: "Inbox",
      ThreatTypes: "Phish",
      AuthenticationDetails: "SPF: fail; DKIM: none; DMARC: fail",
    });
    urls.push({
      Timestamp: phishTime,
      NetworkMessageId: mid,
      Url: IOC.phishUrl,
      UrlDomain: IOC.phishDomain,
    });
    if (u.upn === IOC.victimUpn) {
      clicks.push({
        Timestamp: ago(2 * DAY + 4 * HOUR),
        NetworkMessageId: mid,
        AccountUpn: u.upn,
        Url: IOC.phishUrl,
        ActionType: "ClickAllowed",
        IPAddress: "10.20.1.44",
      });
    }
  }

  return { events, urls, clicks };
}

function buildSignins(r: () => number): Dataset {
  const rows: Dataset = [];

  for (let d = 7; d >= 0; d--) {
    for (const u of USERS.slice(0, 7)) {
      rows.push({
        TimeGenerated: ago(d * DAY - 8 * HOUR - Math.floor(r() * 2 * HOUR)),
        UserPrincipalName: u.upn,
        AppDisplayName: pick(["Microsoft Teams", "Office 365 Exchange Online", "Azure Portal"], r),
        IPAddress: `81.2.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}`,
        Location: pick(COUNTRIES, r),
        ResultType: "0",
        ResultDescription: "Success",
        RiskLevelDuringSignIn: "none",
        ConditionalAccessStatus: "success",
        AuthenticationRequirement: "multiFactorAuthentication",
        UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      });
    }
  }

  // Credential replay from attacker infrastructure, no MFA, flagged high risk.
  rows.push({
    TimeGenerated: ago(2 * DAY + 3 * HOUR + 40 * MIN),
    UserPrincipalName: IOC.victimUpn,
    AppDisplayName: "Office 365 Exchange Online",
    IPAddress: IOC.c2Ip,
    Location: "RO",
    ResultType: "0",
    ResultDescription: "Success",
    RiskLevelDuringSignIn: "high",
    ConditionalAccessStatus: "notApplied",
    AuthenticationRequirement: "singleFactorAuthentication",
    UserAgent: "python-requests/2.31.0",
  });
  // Failed spray against other Finance users from the same address.
  for (const u of [USERS[1], USERS[6]]) {
    rows.push({
      TimeGenerated: ago(2 * DAY + 3 * HOUR + 50 * MIN),
      UserPrincipalName: u.upn,
      AppDisplayName: "Office 365 Exchange Online",
      IPAddress: IOC.c2Ip,
      Location: "RO",
      ResultType: "50126",
      ResultDescription: "Invalid username or password",
      RiskLevelDuringSignIn: "medium",
      ConditionalAccessStatus: "notApplied",
      AuthenticationRequirement: "singleFactorAuthentication",
      UserAgent: "python-requests/2.31.0",
    });
  }

  return rows;
}

function buildAlerts(): { info: Dataset; evidence: Dataset } {
  const t0 = 2 * DAY + 3 * HOUR;
  const defs = [
    {
      id: "al-1001",
      title: "Suspicious PowerShell command line",
      cat: "Execution",
      sev: "Medium",
      src: "Microsoft Defender for Endpoint",
      tech: "T1059.001",
      off: 0,
      device: IOC.victimDevice,
      upn: IOC.victimUpn,
    },
    {
      id: "al-1002",
      title: "Possible credential dumping from LSASS",
      cat: "CredentialAccess",
      sev: "High",
      src: "Microsoft Defender for Endpoint",
      tech: "T1003.001",
      off: 21 * MIN,
      device: IOC.victimDevice,
      upn: IOC.victimUpn,
    },
    {
      id: "al-1003",
      title: "Atypical travel sign-in",
      cat: "InitialAccess",
      sev: "High",
      src: "Microsoft Entra ID Protection",
      tech: "T1078",
      off: 40 * MIN,
      device: "",
      upn: IOC.victimUpn,
    },
    {
      id: "al-1004",
      title: "Phishing message delivered to mailboxes",
      cat: "InitialAccess",
      sev: "Medium",
      src: "Microsoft Defender for Office 365",
      tech: "T1566.002",
      off: -2 * HOUR,
      device: "",
      upn: IOC.victimUpn,
    },
    {
      id: "al-1005",
      title: "Suspicious remote activity on a server",
      cat: "LateralMovement",
      sev: "High",
      src: "Microsoft Defender for Identity",
      tech: "T1021.006",
      off: 55 * MIN,
      device: IOC.pivotDevice,
      upn: `${IOC.compromisedService}@contoso.com`,
    },
    {
      id: "al-1006",
      title: "Anomalous outbound data transfer",
      cat: "Exfiltration",
      sev: "Medium",
      src: "Microsoft Defender for Endpoint",
      tech: "T1041",
      off: 42 * MIN,
      device: IOC.victimDevice,
      upn: IOC.victimUpn,
    },
  ];

  const info: Dataset = [];
  const evidence: Dataset = [];
  for (const d of defs) {
    const ts = ago(t0 - d.off);
    info.push({
      Timestamp: ts,
      AlertId: d.id,
      Title: d.title,
      Category: d.cat,
      Severity: d.sev,
      ServiceSource: d.src,
      DetectionSource: d.src,
      AttackTechniques: d.tech,
    });
    if (d.device) {
      evidence.push({
        Timestamp: ts,
        AlertId: d.id,
        EntityType: "Device",
        DeviceName: d.device,
        AccountUpn: "",
        FileName: "",
        RemoteIP: "",
        SHA256: "",
      });
    }
    evidence.push({
      Timestamp: ts,
      AlertId: d.id,
      EntityType: "User",
      DeviceName: "",
      AccountUpn: d.upn,
      FileName: "",
      RemoteIP: "",
      SHA256: "",
    });
  }
  evidence.push({
    Timestamp: ago(t0 - 21 * MIN),
    AlertId: "al-1002",
    EntityType: "File",
    DeviceName: IOC.victimDevice,
    AccountUpn: "",
    FileName: IOC.dumpFile,
    RemoteIP: "",
    SHA256: "9d4a6f8c1e3b7d5a9f3f8a1c7e9b2d4a6f0c5e8b1d7a4f2c9e6b3d8a1f5c7e2b",
  });
  evidence.push({
    Timestamp: ago(t0 - 42 * MIN),
    AlertId: "al-1006",
    EntityType: "Ip",
    DeviceName: IOC.victimDevice,
    AccountUpn: "",
    FileName: "",
    RemoteIP: IOC.c2Ip,
    SHA256: "",
  });

  return { info, evidence };
}

function buildIdentityLogons(r: () => number): Dataset {
  const rows: Dataset = [];
  for (let d = 7; d >= 0; d--) {
    for (const u of USERS.slice(0, 7)) {
      rows.push({
        Timestamp: ago(d * DAY - 8 * HOUR - Math.floor(r() * HOUR)),
        ActionType: "LogonSuccess",
        AccountUpn: u.upn,
        AccountName: u.name,
        DeviceName: pick(DEVICES, r).name,
        IPAddress: `10.20.${Math.floor(r() * 6)}.${Math.floor(r() * 200)}`,
        LogonType: "Kerberos",
        Protocol: "Kerberos",
      });
    }
  }
  const t0 = 2 * DAY + 3 * HOUR;
  rows.push({
    Timestamp: ago(t0 - 55 * MIN),
    ActionType: "LogonSuccess",
    AccountUpn: `${IOC.compromisedService}@contoso.com`,
    AccountName: IOC.compromisedService,
    DeviceName: IOC.pivotDevice,
    IPAddress: "10.20.1.44",
    LogonType: "NTLM",
    Protocol: "Ntlm",
  });
  return rows;
}

function buildCloudApp(r: () => number): Dataset {
  const rows: Dataset = [];
  for (let d = 7; d >= 0; d--) {
    for (const u of USERS.slice(0, 7)) {
      rows.push({
        Timestamp: ago(d * DAY - Math.floor(r() * 12 * HOUR)),
        Application: pick(["Microsoft SharePoint Online", "Microsoft Exchange Online", "OneDrive"], r),
        ActionType: pick(["FileAccessed", "FileModified", "MailItemsAccessed"], r),
        AccountDisplayName: u.display,
        IPAddress: `81.2.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}`,
        CountryCode: pick(COUNTRIES, r),
        ObjectName: pick(["Q1 Budget.xlsx", "Contracts.docx", "Roadmap.pptx"], r),
        IsAdminOperation: false,
      });
    }
  }
  const t0 = 2 * DAY + 3 * HOUR;
  for (let i = 0; i < 9; i++) {
    rows.push({
      Timestamp: ago(t0 - 45 * MIN - i * MIN),
      Application: "Microsoft SharePoint Online",
      ActionType: "FileDownloaded",
      AccountDisplayName: "Alice Chen",
      IPAddress: IOC.c2Ip,
      CountryCode: "RO",
      ObjectName: `Finance Q1 - part ${i + 1}.xlsx`,
      IsAdminOperation: false,
    });
  }
  return rows;
}

function buildSecurityEvent(r: () => number): Dataset {
  const rows: Dataset = [];
  for (let d = 7; d >= 0; d--) {
    for (const dev of DEVICES.slice(5)) {
      for (let i = 0; i < 6; i++) {
        rows.push({
          TimeGenerated: ago(d * DAY - Math.floor(r() * 20 * HOUR)),
          Computer: dev.name,
          EventID: pick([4624, 4624, 4634, 4672], r),
          Activity: "An account was successfully logged on",
          Account: `contoso\\${dev.user}`,
          LogonType: 3,
          IpAddress: `10.20.${Math.floor(r() * 6)}.${Math.floor(r() * 200)}`,
          Process: "-",
        });
      }
    }
  }
  const t0 = 2 * DAY + 3 * HOUR;
  for (let i = 0; i < 6; i++) {
    rows.push({
      TimeGenerated: ago(t0 - 44 * MIN - i * MIN),
      Computer: "DC-01.contoso.com",
      EventID: 4625,
      Activity: "An account failed to log on",
      Account: "contoso\\administrator",
      LogonType: 3,
      IpAddress: "10.20.1.44",
      Process: "-",
    });
  }
  return rows;
}

function buildFirewall(r: () => number): Dataset {
  const rows: Dataset = [];
  for (let d = 7; d >= 0; d--) {
    for (let i = 0; i < 30; i++) {
      rows.push({
        TimeGenerated: ago(d * DAY - Math.floor(r() * 22 * HOUR)),
        DeviceVendor: "Palo Alto Networks",
        DeviceProduct: "PAN-OS",
        Activity: "TRAFFIC",
        SourceIP: `10.20.${Math.floor(r() * 6)}.${Math.floor(r() * 200)}`,
        DestinationIP: `20.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}.${Math.floor(r() * 200)}`,
        DestinationPort: pick([443, 443, 80, 53], r),
        DeviceAction: "allow",
        ReceivedBytes: Math.floor(r() * 90_000),
        SentBytes: Math.floor(r() * 40_000),
      });
    }
  }
  const t0 = 2 * DAY + 3 * HOUR;
  rows.push({
    TimeGenerated: ago(t0 - 42 * MIN),
    DeviceVendor: "Palo Alto Networks",
    DeviceProduct: "PAN-OS",
    Activity: "TRAFFIC",
    SourceIP: "10.20.1.44",
    DestinationIP: IOC.c2Ip,
    DestinationPort: 443,
    DeviceAction: "allow",
    ReceivedBytes: 24_112,
    SentBytes: 219_884_311,
  });
  return rows;
}

/* ------------------------------------------------------------- assembly */

let cached: Tables | null = null;

/** Builds the lab dataset once per process and reuses it. */
export function labTables(): Tables {
  if (cached) return cached;

  const r = rng(20260310);
  const email = buildEmail(r);
  const alerts = buildAlerts();

  const tables: Tables = {
    DeviceProcessEvents: buildProcessEvents(r),
    DeviceNetworkEvents: buildNetworkEvents(r),
    DeviceLogonEvents: buildLogonEvents(r),
    DeviceFileEvents: buildFileEvents(r),
    EmailEvents: email.events,
    EmailUrlInfo: email.urls,
    UrlClickEvents: email.clicks,
    IdentityLogonEvents: buildIdentityLogons(r),
    SigninLogs: buildSignins(r),
    CloudAppEvents: buildCloudApp(r),
    AlertInfo: alerts.info,
    AlertEvidence: alerts.evidence,
    SecurityEvent: buildSecurityEvent(r),
    CommonSecurityLog: buildFirewall(r),
  };

  // Newest first, matching how the portals present results.
  for (const rows of Object.values(tables)) {
    rows.sort((a: Row, b: Row) => {
      const ta = (a.Timestamp ?? a.TimeGenerated) as Date | undefined;
      const tb = (b.Timestamp ?? b.TimeGenerated) as Date | undefined;
      return (tb?.getTime() ?? 0) - (ta?.getTime() ?? 0);
    });
  }

  cached = tables;
  return tables;
}

export function tableRowCounts(): Record<string, number> {
  const t = labTables();
  return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.length]));
}
