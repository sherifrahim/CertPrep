import { describe, expect, it } from "vitest";
import { IOC, LAB_NOW, labTables, tableRowCounts } from "./data";
import { runQuery } from "./kql/engine";
import { TABLES } from "./schema";

const tables = labTables();
const run = (q: string) => runQuery(q, tables, { now: LAB_NOW, maxRows: 10_000 });

describe("dataset shape", () => {
  it("provides every table declared in the schema", () => {
    for (const t of TABLES) {
      expect(Object.keys(tables)).toContain(t.name);
    }
  });

  it("has enough volume for hunting to be non-trivial", () => {
    const counts = tableRowCounts();
    expect(counts.DeviceProcessEvents).toBeGreaterThan(500);
    expect(counts.DeviceNetworkEvents).toBeGreaterThan(300);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(1500);
  });

  it("is deterministic, so lab answers stay stable", () => {
    expect(tableRowCounts()).toEqual(tableRowCounts());
  });

  it("only uses columns the schema advertises", () => {
    for (const t of TABLES) {
      const declared = new Set(t.columns.map((c) => c.name));
      const row = tables[t.name][0];
      if (!row) continue;
      for (const key of Object.keys(row)) {
        expect(declared.has(key), `${t.name}.${key} is not in the schema`).toBe(true);
      }
    }
  });

  it("returns newest rows first, like the portals do", () => {
    const rows = tables.DeviceProcessEvents;
    const first = rows[0].Timestamp as Date;
    const last = rows[rows.length - 1].Timestamp as Date;
    expect(first.getTime()).toBeGreaterThanOrEqual(last.getTime());
  });
});

describe("the embedded intrusion is discoverable", () => {
  it("phishing reached several mailboxes and exactly one user clicked", () => {
    const delivered = run(
      `EmailEvents | where SenderFromAddress =~ "${IOC.phishSender}"`,
    );
    expect(delivered.totalRows).toBe(6);

    const clicked = run("UrlClickEvents");
    expect(clicked.totalRows).toBe(1);
    expect(clicked.rows[0].AccountUpn).toBe(IOC.victimUpn);
  });

  it("joins email to clicks the way the exam expects", () => {
    const r = run(`EmailEvents
      | where ThreatTypes == "Phish"
      | join (UrlClickEvents) on NetworkMessageId
      | project RecipientEmailAddress, Url`);
    expect(r.totalRows).toBe(1);
    expect(r.rows[0].RecipientEmailAddress).toBe(IOC.victimUpn);
  });

  it("encoded PowerShell is findable on the victim device", () => {
    const r = run(`DeviceProcessEvents
      | where FileName =~ "powershell.exe"
      | where ProcessCommandLine has "-enc"`);
    expect(r.totalRows).toBeGreaterThanOrEqual(2);
    expect(r.rows.some((x) => x.DeviceName === IOC.victimDevice)).toBe(true);
  });

  it("credential dumping via comsvcs is findable", () => {
    const r = run(
      'DeviceProcessEvents | where ProcessCommandLine contains "comsvcs.dll" and ProcessCommandLine contains "MiniDump"',
    );
    expect(r.totalRows).toBe(1);
    expect(r.rows[0].DeviceName).toBe(IOC.victimDevice);
  });

  it("the risky sign-in stands out by risk level and missing MFA", () => {
    const r = run(`SigninLogs
      | where RiskLevelDuringSignIn == "high"
      | where AuthenticationRequirement == "singleFactorAuthentication"`);
    expect(r.totalRows).toBe(1);
    expect(r.rows[0].UserPrincipalName).toBe(IOC.victimUpn);
    expect(r.rows[0].IPAddress).toBe(IOC.c2Ip);
  });

  it("the same attacker address also sprayed other accounts", () => {
    const r = run(`SigninLogs
      | where IPAddress == "${IOC.c2Ip}"
      | summarize Attempts=count(), Users=dcount(UserPrincipalName)`);
    expect(Number(r.rows[0].Users)).toBeGreaterThanOrEqual(3);
  });

  it("beaconing to the C2 address is visible and repeated", () => {
    const r = run(`DeviceNetworkEvents
      | where RemoteIP == "${IOC.c2Ip}"
      | summarize Connections=count() by DeviceName`);
    expect(r.totalRows).toBe(1);
    expect(Number(r.rows[0].Connections)).toBeGreaterThan(10);
  });

  it("lateral movement shows as a remote interactive logon from the victim host", () => {
    const r = run(`DeviceLogonEvents
      | where LogonType == "RemoteInteractive"
      | where RemoteDeviceName == "${IOC.victimDevice}"`);
    expect(r.totalRows).toBe(1);
    expect(r.rows[0].DeviceName).toBe(IOC.pivotDevice);
    expect(r.rows[0].AccountName).toBe(IOC.compromisedService);
  });

  it("brute force against the domain controller is visible in SecurityEvent", () => {
    const r = run(`SecurityEvent
      | where EventID == 4625
      | summarize Failures=count() by Computer, IpAddress`);
    expect(r.totalRows).toBe(1);
    expect(Number(r.rows[0].Failures)).toBe(6);
  });

  it("the staged archive and the dump file exist on disk", () => {
    const r = run(
      `DeviceFileEvents | where FileName in ("${IOC.dumpFile}", "${IOC.archiveFile}")`,
    );
    expect(r.totalRows).toBe(2);
  });

  it("the bulk exfiltration is the largest firewall transfer", () => {
    const r = run("CommonSecurityLog | top 1 by SentBytes desc");
    expect(r.rows[0].DestinationIP).toBe(IOC.c2Ip);
    expect(Number(r.rows[0].SentBytes)).toBeGreaterThan(200_000_000);
  });

  it("alerts span the full kill chain", () => {
    const r = run("AlertInfo | summarize Alerts=count() by Category");
    const categories = r.rows.map((x) => String(x.Category));
    for (const stage of ["InitialAccess", "Execution", "CredentialAccess", "LateralMovement", "Exfiltration"]) {
      expect(categories).toContain(stage);
    }
  });

  it("alert evidence resolves to the victim device and account", () => {
    const r = run(`AlertInfo
      | where Severity == "High"
      | join (AlertEvidence) on AlertId
      | where EntityType == "Device"
      | distinct DeviceName`);
    expect(r.rows.map((x) => x.DeviceName)).toContain(IOC.victimDevice);
  });
});

describe("benign noise is present so hunting is not trivial", () => {
  it("most process events are unremarkable", () => {
    const all = run("DeviceProcessEvents | count").rows[0].Count as number;
    const suspicious = run(
      'DeviceProcessEvents | where ProcessCommandLine has "-enc"',
    ).totalRows;
    expect(suspicious / all).toBeLessThan(0.02);
  });

  it("many devices and users are active", () => {
    expect(run("DeviceProcessEvents | distinct DeviceName").totalRows).toBeGreaterThanOrEqual(8);
    expect(run("SigninLogs | distinct UserPrincipalName").totalRows).toBeGreaterThanOrEqual(7);
  });

  it("plain PowerShell use is common, so filtering on the binary alone is noisy", () => {
    const r = run('DeviceProcessEvents | where FileName =~ "powershell.exe"');
    expect(r.totalRows).toBeGreaterThan(20);
  });
});
