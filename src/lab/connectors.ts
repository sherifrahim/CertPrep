import { TABLES } from "./schema";

/**
 * Microsoft Sentinel data connectors.
 *
 * This blade exists to make one dependency concrete: **a connector is what puts
 * rows in a table.** Turn it off and the table does not error, it goes empty —
 * so every hunting query and every analytics rule that reads it quietly returns
 * nothing and stops alerting. Detection coverage silently becomes a function of
 * ingestion, and nothing in the analytics blade says so.
 */

export type ConnectorStatus = "Connected" | "Not connected";

export type DataConnector = {
  id: string;
  name: string;
  provider: string;
  status: ConnectorStatus;
  description: string;
  /** Tables this connector populates, matching the hunting schema. */
  tables: string[];
  prerequisites: string[];
  /** Roughly what it costs to ingest, since that is the real constraint. */
  ingestion: string;
};

export function defaultConnectors(): DataConnector[] {
  return [
    {
      id: "entra-id",
      name: "Microsoft Entra ID",
      provider: "Microsoft",
      status: "Connected",
      description:
        "Sign-in and audit activity from the directory, including risk and Conditional Access outcomes.",
      tables: ["SigninLogs"],
      prerequisites: [
        "Microsoft Entra ID P1 or P2",
        "Security Administrator or Global Administrator on the tenant",
      ],
      ingestion: "Billable. Sign-in logs are usually the largest single source.",
    },
    {
      id: "defender-xdr",
      name: "Microsoft Defender XDR",
      provider: "Microsoft",
      status: "Connected",
      description:
        "Alerts and raw device, email and identity telemetry from Defender, streamed into the workspace.",
      tables: [
        "DeviceProcessEvents",
        "DeviceNetworkEvents",
        "DeviceLogonEvents",
        "DeviceFileEvents",
        "EmailEvents",
        "EmailUrlInfo",
        "UrlClickEvents",
        "IdentityLogonEvents",
        "CloudAppEvents",
        "AlertInfo",
        "AlertEvidence",
      ],
      prerequisites: ["A Defender XDR licence", "Global Administrator or Security Administrator"],
      ingestion: "Alerts are free to ingest. The raw event tables are billable and large.",
    },
    {
      id: "security-events",
      name: "Windows Security Events via AMA",
      provider: "Microsoft",
      status: "Connected",
      description:
        "Windows security event log collected by the Azure Monitor Agent, with a selectable event set.",
      tables: ["SecurityEvent"],
      prerequisites: [
        "Azure Monitor Agent deployed to the machines",
        "A data collection rule scoping which events are gathered",
      ],
      ingestion: "Billable, and the event set you choose drives the volume more than anything else.",
    },
    {
      id: "cef",
      name: "Common Event Format (CEF) via AMA",
      provider: "Any",
      status: "Connected",
      description: "Syslog CEF records forwarded from network appliances such as firewalls.",
      tables: ["CommonSecurityLog"],
      prerequisites: [
        "A Linux forwarder running the Azure Monitor Agent",
        "The appliance configured to send CEF to the forwarder",
      ],
      ingestion: "Billable. Firewall logs are high volume and usually need filtering at the source.",
    },
    {
      id: "azure-activity",
      name: "Azure Activity",
      provider: "Microsoft",
      status: "Not connected",
      description: "Control-plane operations across subscriptions — who changed what, and when.",
      tables: ["AzureActivity"],
      prerequisites: ["Reader on the subscriptions being connected"],
      ingestion: "Free to ingest.",
    },
    {
      id: "threat-intelligence",
      name: "Threat Intelligence Platforms",
      provider: "Microsoft",
      status: "Not connected",
      description: "Indicators from a TI platform, for matching against ingested telemetry.",
      tables: ["ThreatIntelligenceIndicator"],
      prerequisites: [
        "An application registration with the ThreatIndicators.ReadWrite.OwnedBy permission",
      ],
      ingestion: "Free to ingest.",
    },
  ];
}

/* -------------------------------------------------------- table coverage */

/** Tables that currently receive data, given which connectors are on. */
export function connectedTables(connectors: DataConnector[]): Set<string> {
  const tables = new Set<string>();
  for (const c of connectors) {
    if (c.status !== "Connected") continue;
    for (const t of c.tables) tables.add(t);
  }
  return tables;
}

export type TableCoverage = {
  table: string;
  source: string;
  /** The connectors that would populate it. */
  connectors: string[];
  covered: boolean;
};

/**
 * Every table in the hunting schema, and whether anything is feeding it.
 *
 * A table with no connector is not an error state — queries against it parse
 * and run and return zero rows, which reads exactly like "nothing happened".
 */
export function tableCoverage(connectors: DataConnector[]): TableCoverage[] {
  const live = connectedTables(connectors);

  return TABLES.map((t) => {
    const feeding = connectors.filter((c) => c.tables.includes(t.name));
    return {
      table: t.name,
      source: t.source,
      connectors: feeding.map((c) => c.name),
      covered: live.has(t.name),
    };
  });
}

/* ------------------------------------------------- impact on detections */

export type DetectionImpact = {
  ruleName: string;
  tables: string[];
  /** Tables the rule needs that nothing is feeding. */
  missing: string[];
  working: boolean;
  verdict: string;
};

/** The analytics rules in the lab, and the tables each depends on. */
const RULE_DEPENDENCIES: { ruleName: string; tables: string[] }[] = [
  { ruleName: "Impossible travel sign-in", tables: ["SigninLogs"] },
  { ruleName: "Credential dumping via comsvcs.dll", tables: ["DeviceProcessEvents"] },
  { ruleName: "Phishing link clicked", tables: ["EmailEvents", "UrlClickEvents"] },
  { ruleName: "Password spray from a single address", tables: ["SigninLogs"] },
  {
    ruleName: "Large outbound transfer to a new destination",
    tables: ["CommonSecurityLog"],
  },
  { ruleName: "Suspicious control-plane activity", tables: ["AzureActivity"] },
];

/**
 * Which detections still work given the connector configuration.
 *
 * This is the payoff of the blade: a rule whose table has no connector does not
 * fail, it simply never fires.
 */
export function detectionImpact(connectors: DataConnector[]): DetectionImpact[] {
  const live = connectedTables(connectors);

  return RULE_DEPENDENCIES.map((rule) => {
    const missing = rule.tables.filter((t) => !live.has(t));
    return {
      ...rule,
      missing,
      working: missing.length === 0,
      verdict:
        missing.length === 0
          ? "Every table this rule reads is being fed."
          : `Never fires. ${missing.join(", ")} ${missing.length === 1 ? "has" : "have"} no connector, so the query returns nothing and the rule looks healthy while detecting nothing.`,
    };
  });
}

export function coverageSummary(connectors: DataConnector[]) {
  const coverage = tableCoverage(connectors);
  const impact = detectionImpact(connectors);
  return {
    tablesCovered: coverage.filter((c) => c.covered).length,
    tablesTotal: coverage.length,
    rulesWorking: impact.filter((i) => i.working).length,
    rulesTotal: impact.length,
    connectorsOn: connectors.filter((c) => c.status === "Connected").length,
    connectorsTotal: connectors.length,
  };
}
