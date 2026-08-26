import { describe, expect, it } from "vitest";
import { KqlError, runQuery, type Tables } from "./engine";

const NOW = new Date("2026-03-10T12:00:00Z");
const at = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

const tables: Tables = {
  DeviceProcessEvents: [
    { Timestamp: at(1), DeviceName: "WS-01", AccountName: "alice", FileName: "powershell.exe", ProcessCommandLine: "powershell -enc ABC", ReportId: "r1" },
    { Timestamp: at(2), DeviceName: "WS-01", AccountName: "alice", FileName: "cmd.exe", ProcessCommandLine: "cmd /c whoami", ReportId: "r2" },
    { Timestamp: at(3), DeviceName: "WS-02", AccountName: "bob", FileName: "powershell.exe", ProcessCommandLine: "powershell Get-Process", ReportId: "r3" },
    { Timestamp: at(50), DeviceName: "WS-03", AccountName: "carol", FileName: "notepad.exe", ProcessCommandLine: "notepad a.txt", ReportId: "r4" },
  ],
  DeviceNetworkEvents: [
    { Timestamp: at(1), DeviceName: "WS-01", RemoteIP: "10.0.0.5", RemotePort: 443 },
    { Timestamp: at(2), DeviceName: "WS-02", RemoteIP: "8.8.8.8", RemotePort: 53 },
  ],
  Alerts: [
    { AlertId: "a1", DeviceName: "WS-01", Severity: "High" },
    { AlertId: "a2", DeviceName: "WS-09", Severity: "Low" },
  ],
};

const run = (q: string) => runQuery(q, tables, { now: NOW });

describe("basic pipeline", () => {
  it("returns every row for a bare table", () => {
    expect(run("DeviceProcessEvents").totalRows).toBe(4);
  });

  it("filters with where", () => {
    const r = run('DeviceProcessEvents | where FileName == "powershell.exe"');
    expect(r.totalRows).toBe(2);
  });

  it("counts", () => {
    expect(run("DeviceProcessEvents | count").rows[0].Count).toBe(4);
  });

  it("takes n rows", () => {
    expect(run("DeviceProcessEvents | take 2").rows).toHaveLength(2);
  });

  it("reports the pre-cap total so truncation is visible", () => {
    const r = runQuery("DeviceProcessEvents", tables, { now: NOW, maxRows: 2 });
    expect(r.rows).toHaveLength(2);
    expect(r.totalRows).toBe(4);
  });

  it("ignores comments", () => {
    expect(run("DeviceProcessEvents // everything\n| count").rows[0].Count).toBe(4);
  });
});

describe("string operators", () => {
  it("contains is case-insensitive and substring based", () => {
    expect(run('DeviceProcessEvents | where ProcessCommandLine contains "WHOAMI"').totalRows).toBe(1);
  });

  it("has matches whole words only", () => {
    // "enc" appears as a whole token in "-enc ABC"
    expect(run('DeviceProcessEvents | where ProcessCommandLine has "enc"').totalRows).toBe(1);
    // "power" is a substring of powershell but not a whole word
    expect(run('DeviceProcessEvents | where ProcessCommandLine has "power"').totalRows).toBe(0);
    expect(run('DeviceProcessEvents | where ProcessCommandLine contains "power"').totalRows).toBe(2);
  });

  it("supports startswith and endswith", () => {
    expect(run('DeviceProcessEvents | where FileName startswith "power"').totalRows).toBe(2);
    expect(run('DeviceProcessEvents | where FileName endswith ".exe"').totalRows).toBe(4);
  });

  it("supports =~ for case-insensitive equality", () => {
    expect(run('DeviceProcessEvents | where FileName =~ "POWERSHELL.EXE"').totalRows).toBe(2);
  });

  it("supports in and negation", () => {
    expect(run('DeviceProcessEvents | where AccountName in ("alice", "bob")').totalRows).toBe(3);
    expect(run('DeviceProcessEvents | where AccountName !in ("alice")').totalRows).toBe(2);
    // cmd.exe and notepad.exe both lack "power"
    expect(run('DeviceProcessEvents | where FileName !contains "power"').totalRows).toBe(2);
  });

  it("supports matches regex", () => {
    expect(run('DeviceProcessEvents | where FileName matches regex "^power.*exe$"').totalRows).toBe(2);
  });
});

describe("time handling", () => {
  it("filters relative to now with ago()", () => {
    expect(run("DeviceProcessEvents | where Timestamp > ago(24h)").totalRows).toBe(3);
    expect(run("DeviceProcessEvents | where Timestamp > ago(7d)").totalRows).toBe(4);
  });

  it("parses timespan units", () => {
    expect(run("DeviceProcessEvents | where Timestamp > ago(90m)").totalRows).toBe(1);
  });

  it("buckets with bin()", () => {
    const r = run("DeviceProcessEvents | summarize Events=count() by bin(Timestamp, 1d)");
    expect(r.totalRows).toBe(2);
    expect(r.columns).toContain("Timestamp");
  });
});

describe("projection and extension", () => {
  it("projects and renames", () => {
    const r = run("DeviceProcessEvents | project Device=DeviceName, FileName | take 1");
    expect(r.columns).toEqual(["Device", "FileName"]);
  });

  it("extends without dropping columns", () => {
    const r = run("DeviceProcessEvents | extend Upper=toupper(FileName) | take 1");
    expect(r.columns).toContain("DeviceName");
    expect(r.rows[0].Upper).toBe("POWERSHELL.EXE");
  });

  it("removes columns with project-away", () => {
    const r = run("DeviceProcessEvents | project-away ProcessCommandLine, ReportId | take 1");
    expect(r.columns).not.toContain("ProcessCommandLine");
    expect(r.columns).toContain("DeviceName");
  });
});

describe("summarize", () => {
  it("counts by a grouping key", () => {
    const r = run("DeviceProcessEvents | summarize Count=count() by DeviceName");
    expect(r.totalRows).toBe(3);
    expect(r.rows.find((x) => x.DeviceName === "WS-01")?.Count).toBe(2);
  });

  it("supports dcount and countif", () => {
    const r = run(
      'DeviceProcessEvents | summarize Devices=dcount(DeviceName), Shells=countif(FileName == "powershell.exe")',
    );
    expect(r.rows[0].Devices).toBe(3);
    expect(r.rows[0].Shells).toBe(2);
  });

  it("supports make_set", () => {
    const r = run("DeviceProcessEvents | summarize Files=make_set(FileName) by DeviceName");
    const ws01 = r.rows.find((x) => x.DeviceName === "WS-01");
    expect(ws01?.Files).toEqual(["powershell.exe", "cmd.exe"]);
  });

  // arg_max is the canonical "latest row per entity" idiom
  it("returns the latest full row per key with arg_max(Timestamp, *)", () => {
    const r = run("DeviceProcessEvents | summarize arg_max(Timestamp, *) by DeviceName");
    expect(r.totalRows).toBe(3);
    const ws01 = r.rows.find((x) => x.DeviceName === "WS-01");
    expect(ws01?.FileName).toBe("powershell.exe"); // the 1h-ago row, not the 2h-ago one
  });

  it("returns named columns with arg_max(Timestamp, Col)", () => {
    const r = run("DeviceProcessEvents | summarize arg_max(Timestamp, FileName) by DeviceName");
    expect(r.rows.find((x) => x.DeviceName === "WS-01")?.FileName).toBe("powershell.exe");
  });
});

describe("ordering", () => {
  it("sorts descending by default, like Kusto", () => {
    const r = run("DeviceProcessEvents | sort by Timestamp");
    expect(r.rows[0].ReportId).toBe("r1");
  });

  it("sorts ascending when asked", () => {
    const r = run("DeviceProcessEvents | sort by Timestamp asc");
    expect(r.rows[0].ReportId).toBe("r4");
  });

  it("top returns the n highest overall, not per group", () => {
    const r = run("DeviceProcessEvents | summarize C=count() by DeviceName | top 1 by C desc");
    expect(r.totalRows).toBe(1);
    expect(r.rows[0].DeviceName).toBe("WS-01");
  });
});

describe("distinct", () => {
  it("returns unique combinations", () => {
    expect(run("DeviceProcessEvents | distinct DeviceName").totalRows).toBe(3);
    expect(run("DeviceProcessEvents | distinct DeviceName, AccountName").totalRows).toBe(3);
  });
});

describe("join", () => {
  it("inner join keeps only matches", () => {
    const r = run("Alerts | join (DeviceNetworkEvents) on DeviceName");
    expect(r.totalRows).toBe(1);
  });

  it("leftouter keeps unmatched left rows", () => {
    const r = run("Alerts | join kind=leftouter (DeviceNetworkEvents) on DeviceName");
    expect(r.totalRows).toBe(2);
  });

  it("leftanti finds rows with no counterpart", () => {
    const r = run("Alerts | join kind=leftanti (DeviceNetworkEvents) on DeviceName");
    expect(r.totalRows).toBe(1);
    expect(r.rows[0].AlertId).toBe("a2");
  });

  it("supports the $left/$right form", () => {
    const r = run(
      "Alerts | join (DeviceNetworkEvents) on $left.DeviceName == $right.DeviceName",
    );
    expect(r.totalRows).toBe(1);
  });
});

describe("union", () => {
  it("stacks tables and tags the source", () => {
    const r = run("DeviceNetworkEvents | union Alerts");
    expect(r.totalRows).toBe(4);
  });
});

describe("error handling", () => {
  it("rejects an unknown table by name", () => {
    expect(() => run("NoSuchTable")).toThrow(KqlError);
    expect(() => run("NoSuchTable")).toThrow(/does not exist/);
  });

  it("rejects an unsupported operator with a helpful list", () => {
    expect(() => run("DeviceProcessEvents | mv-expand X")).toThrow(/not supported/);
  });

  it("rejects an unsupported function by name", () => {
    expect(() => run("DeviceProcessEvents | extend X=geo_info_from_ip_address(RemoteIP)")).toThrow(
      /geo_info_from_ip_address/,
    );
  });

  it("explains that aggregations belong inside summarize", () => {
    expect(() => run("DeviceProcessEvents | extend C=count()")).toThrow(/inside 'summarize'/);
  });

  it("rejects an empty query", () => {
    expect(() => run("   ")).toThrow(/Enter a query/);
  });

  it("reports unterminated strings", () => {
    expect(() => run('DeviceProcessEvents | where FileName == "abc')).toThrow(/Unterminated/);
  });
});

describe("realistic hunting queries", () => {
  it("finds encoded PowerShell in the last day", () => {
    const r = run(`DeviceProcessEvents
      | where Timestamp > ago(1d)
      | where FileName =~ "powershell.exe"
      | where ProcessCommandLine has "-enc"
      | project Timestamp, DeviceName, AccountName, ProcessCommandLine`);
    expect(r.totalRows).toBe(1);
    expect(r.rows[0].DeviceName).toBe("WS-01");
  });

  it("ranks devices by process volume", () => {
    const r = run(`DeviceProcessEvents
      | summarize Events=count() by DeviceName
      | top 2 by Events desc`);
    expect(r.rows.map((x) => x.DeviceName)).toEqual(["WS-01", "WS-02"]);
  });
});
