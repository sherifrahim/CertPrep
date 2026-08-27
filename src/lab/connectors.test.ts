import { describe, expect, it } from "vitest";
import { TABLES } from "./schema";
import {
  connectedTables,
  coverageSummary,
  defaultConnectors,
  detectionImpact,
  tableCoverage,
  type DataConnector,
} from "./connectors";

const connectors = defaultConnectors();
const off = (id: string): DataConnector[] =>
  connectors.map((c) => (c.id === id ? { ...c, status: "Not connected" as const } : c));
const on = (id: string): DataConnector[] =>
  connectors.map((c) => (c.id === id ? { ...c, status: "Connected" as const } : c));

describe("the connector catalogue", () => {
  it("uses unique ids and describes every connector", () => {
    expect(new Set(connectors.map((c) => c.id)).size).toBe(connectors.length);
    for (const c of connectors) {
      expect(c.description.length).toBeGreaterThan(20);
      expect(c.prerequisites.length).toBeGreaterThan(0);
      expect(c.tables.length).toBeGreaterThan(0);
    }
  });

  it("feeds every table in the hunting schema from some connector", () => {
    const claimed = new Set(connectors.flatMap((c) => c.tables));
    for (const t of TABLES) {
      expect(claimed.has(t.name), `${t.name} has no connector`).toBe(true);
    }
  });
});

describe("connectedTables", () => {
  it("includes tables only from connected sources", () => {
    const live = connectedTables(connectors);
    expect(live.has("SigninLogs")).toBe(true);
    // Azure Activity ships disconnected.
    expect(live.has("AzureActivity")).toBe(false);
  });

  it("empties a table when its connector is turned off", () => {
    expect(connectedTables(off("entra-id")).has("SigninLogs")).toBe(false);
  });

  it("fills a table when its connector is turned on", () => {
    expect(connectedTables(on("azure-activity")).has("AzureActivity")).toBe(true);
  });
});

describe("tableCoverage", () => {
  it("reports every schema table", () => {
    expect(tableCoverage(connectors)).toHaveLength(TABLES.length);
  });

  it("names the connectors that would feed each table", () => {
    const signin = tableCoverage(connectors).find((t) => t.table === "SigninLogs")!;
    expect(signin.connectors).toContain("Microsoft Entra ID");
    expect(signin.covered).toBe(true);
  });

  // A table with no connector is still listed — it is just empty.
  it("marks a table uncovered without removing it from the schema", () => {
    const rows = tableCoverage(off("cef"));
    const cef = rows.find((t) => t.table === "CommonSecurityLog")!;
    expect(cef.covered).toBe(false);
    expect(cef.connectors.length).toBeGreaterThan(0);
    expect(rows).toHaveLength(TABLES.length);
  });
});

describe("detectionImpact", () => {
  it("works for rules whose tables are all fed", () => {
    const impact = detectionImpact(connectors);
    const dumping = impact.find((i) => i.ruleName === "Credential dumping via comsvcs.dll")!;
    expect(dumping.working).toBe(true);
    expect(dumping.missing).toEqual([]);
  });

  // The point of the whole blade.
  it("silently disables a rule when its table loses its connector", () => {
    const impact = detectionImpact(off("entra-id"));
    const spray = impact.find((i) => i.ruleName === "Password spray from a single address")!;
    expect(spray.working).toBe(false);
    expect(spray.missing).toEqual(["SigninLogs"]);
    expect(spray.verdict).toContain("looks healthy while detecting nothing");
  });

  it("reports a rule broken when only one of several tables is missing", () => {
    const impact = detectionImpact(off("defender-xdr"));
    const phish = impact.find((i) => i.ruleName === "Phishing link clicked")!;
    expect(phish.working).toBe(false);
    expect(phish.missing).toContain("EmailEvents");
    expect(phish.missing).toContain("UrlClickEvents");
  });

  it("shows a rule already broken by a connector that was never enabled", () => {
    const controlPlane = detectionImpact(connectors).find(
      (i) => i.ruleName === "Suspicious control-plane activity",
    )!;
    expect(controlPlane.working).toBe(false);
    expect(controlPlane.missing).toEqual(["AzureActivity"]);
  });

  it("repairs that rule once the connector is enabled", () => {
    const controlPlane = detectionImpact(on("azure-activity")).find(
      (i) => i.ruleName === "Suspicious control-plane activity",
    )!;
    expect(controlPlane.working).toBe(true);
  });

  it("explains every rule either way", () => {
    for (const i of detectionImpact(connectors)) {
      expect(i.verdict.length).toBeGreaterThan(20);
    }
  });
});

describe("coverageSummary", () => {
  it("counts connectors, tables and working rules", () => {
    const s = coverageSummary(connectors);
    expect(s.connectorsTotal).toBe(connectors.length);
    expect(s.tablesTotal).toBe(TABLES.length);
    expect(s.rulesWorking).toBeLessThanOrEqual(s.rulesTotal);
    expect(s.connectorsOn).toBeLessThanOrEqual(s.connectorsTotal);
  });

  it("loses both tables and rules as connectors go off", () => {
    const before = coverageSummary(connectors);
    const after = coverageSummary(off("defender-xdr"));
    expect(after.tablesCovered).toBeLessThan(before.tablesCovered);
    expect(after.rulesWorking).toBeLessThan(before.rulesWorking);
  });
});
