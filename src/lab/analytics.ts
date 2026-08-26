/**
 * Microsoft Sentinel scheduled analytics rules.
 *
 * The value here is not storing a rule — it is showing what the rule would
 * actually have caught against real telemetry, and warning about the mistakes
 * that make a rule useless in production: coverage gaps between runs, missing
 * entity mappings, and queries so broad they drown the queue.
 */
import { LAB_NOW, labTables } from "./data";
import { KqlError, runQuery, type Dataset } from "./kql/engine";

export type Severity = "High" | "Medium" | "Low" | "Informational";

export type EntityMapping = {
  /** Entity type as Sentinel names them. */
  entityType: "Account" | "Host" | "IP" | "FileHash" | "URL" | "Mailbox";
  /** Column in the query output that carries the identifier. */
  column: string;
};

export type EventGrouping = "SingleAlert" | "AlertPerRow";

export type AnalyticsRule = {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  tactics: string[];
  query: string;
  /** How often the rule runs, in minutes. */
  frequencyMin: number;
  /** How far back each run looks, in minutes. */
  lookbackMin: number;
  entityMappings: EntityMapping[];
  eventGrouping: EventGrouping;
  enabled: boolean;
};

export type RuleWarning = {
  level: "error" | "warning";
  message: string;
};

export type SimulationResult = {
  ok: boolean;
  /** Rows the query returns across the whole lab window. */
  rowCount: number;
  /** Alerts this rule would raise, given its event grouping. */
  alertCount: number;
  /** Distinct values found for each mapped entity. */
  entities: { entityType: string; column: string; values: string[]; missing: boolean }[];
  columns: string[];
  sample: Dataset;
  warnings: RuleWarning[];
  error?: string;
};

/** Rules per day, used to translate frequency into alert volume. */
export function runsPerDay(frequencyMin: number): number {
  return Math.max(1, Math.round((24 * 60) / Math.max(1, frequencyMin)));
}

/**
 * Static checks that do not need the data. These are the configuration mistakes
 * that quietly break a rule in production.
 */
export function lintRule(rule: AnalyticsRule): RuleWarning[] {
  const warnings: RuleWarning[] = [];

  if (!rule.name.trim()) {
    warnings.push({ level: "error", message: "Give the rule a name." });
  }
  if (!rule.query.trim()) {
    warnings.push({ level: "error", message: "The rule needs a query." });
  }
  if (rule.frequencyMin < 5) {
    warnings.push({ level: "error", message: "Sentinel does not run scheduled rules more often than every 5 minutes." });
  }
  if (rule.lookbackMin > 14 * 24 * 60) {
    warnings.push({ level: "error", message: "Lookback cannot exceed 14 days." });
  }

  // The mistake that silently loses events: looking back less far than the gap
  // between runs, so anything in between is never evaluated.
  if (rule.lookbackMin < rule.frequencyMin) {
    warnings.push({
      level: "error",
      message:
        `Coverage gap: the rule runs every ${rule.frequencyMin} minutes but only looks back ` +
        `${rule.lookbackMin}. Events in the ${rule.frequencyMin - rule.lookbackMin} minute gap between ` +
        `runs are never evaluated. Set lookback greater than or equal to frequency.`,
    });
  } else if (rule.lookbackMin === rule.frequencyMin) {
    warnings.push({
      level: "warning",
      message:
        "Lookback equals frequency, which leaves no margin for ingestion delay. A slightly longer lookback is usual, accepting some duplicate evaluation.",
    });
  }

  if (rule.entityMappings.length === 0) {
    warnings.push({
      level: "warning",
      message:
        "No entities mapped. Alerts will carry no investigable context, so the investigation graph, entity pages and alert grouping will all be empty.",
    });
  }
  // People habitually paste a time filter into the query. Sentinel already
  // applies the lookback per run, so a second, different window silently wins.
  if (/\bago\s*\(/.test(rule.query)) {
    warnings.push({
      level: "warning",
      message:
        "The query contains its own ago() filter. Sentinel already scopes each run to the lookback " +
        "period, so an in-query window can conflict with it — usually narrowing the rule further than intended.",
    });
  }
  if (rule.tactics.length === 0) {
    warnings.push({
      level: "warning",
      message: "No MITRE tactics selected, so this rule will not appear on the ATT&CK coverage view.",
    });
  }

  return warnings;
}

/**
 * Runs the rule against the lab data and reports what it would have produced.
 *
 * The whole seven-day lab window is evaluated, standing in for the rule having
 * run continuously across that period — the lookback setting is what would
 * scope each individual run in production.
 */
export function simulateRule(rule: AnalyticsRule): SimulationResult {
  const warnings = lintRule(rule);
  const base: SimulationResult = {
    ok: false,
    rowCount: 0,
    alertCount: 0,
    entities: [],
    columns: [],
    sample: [],
    warnings,
  };

  if (warnings.some((w) => w.level === "error" && w.message.includes("query"))) {
    return { ...base, error: "The rule needs a query." };
  }

  let result;
  try {
    result = runQuery(rule.query, labTables(), { now: LAB_NOW, maxRows: 5000 });
  } catch (error) {
    return {
      ...base,
      error: error instanceof KqlError ? error.message : "The query could not be run.",
    };
  }

  const rowCount = result.totalRows;
  const alertCount = rule.eventGrouping === "AlertPerRow" ? rowCount : rowCount > 0 ? 1 : 0;

  const entities = rule.entityMappings.map((m) => {
    const present = result.columns.some((c) => c.toLowerCase() === m.column.toLowerCase());
    const values = present
      ? [
          ...new Set(
            result.rows
              .map((r) => {
                const key = result.columns.find((c) => c.toLowerCase() === m.column.toLowerCase())!;
                const v = r[key];
                return v === null ? "" : String(v);
              })
              .filter(Boolean),
          ),
        ].slice(0, 10)
      : [];
    return { entityType: m.entityType, column: m.column, values, missing: !present };
  });

  for (const e of entities) {
    if (e.missing) {
      warnings.push({
        level: "error",
        message: `Entity mapping refers to column '${e.column}', which the query does not return. Project it or the mapping is dropped.`,
      });
    }
  }

  if (rowCount === 0) {
    warnings.push({
      level: "warning",
      message:
        "The query returns nothing against the current data. That may be correct for a rare technique, but verify it fires when the behaviour is present.",
    });
  }

  // Alert fatigue: extrapolate the daily volume this grouping would produce.
  const perDay = alertCount * runsPerDay(rule.frequencyMin);
  if (rule.eventGrouping === "AlertPerRow" && rowCount > 50) {
    warnings.push({
      level: "error",
      message:
        `One alert per row over ${rowCount} rows would create roughly ${perDay.toLocaleString()} alerts a day. ` +
        "Group into a single alert, or tighten the query.",
    });
  } else if (rowCount > 500) {
    warnings.push({
      level: "warning",
      message: `${rowCount.toLocaleString()} matching rows is very broad for a detection. Consider narrowing it.`,
    });
  }

  return {
    ...base,
    ok: !warnings.some((w) => w.level === "error"),
    rowCount,
    alertCount,
    entities,
    columns: result.columns,
    sample: result.rows.slice(0, 10),
    warnings,
  };
}

export const TACTICS = [
  "InitialAccess",
  "Execution",
  "Persistence",
  "PrivilegeEscalation",
  "DefenseEvasion",
  "CredentialAccess",
  "Discovery",
  "LateralMovement",
  "Collection",
  "CommandAndControl",
  "Exfiltration",
  "Impact",
];

export const ENTITY_TYPES: EntityMapping["entityType"][] = [
  "Account",
  "Host",
  "IP",
  "FileHash",
  "URL",
  "Mailbox",
];

export function blankRule(): AnalyticsRule {
  return {
    id: "new",
    name: "",
    description: "",
    severity: "Medium",
    tactics: [],
    query: `DeviceProcessEvents
| where ProcessCommandLine has "-enc"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine`,
    frequencyMin: 60,
    lookbackMin: 60,
    entityMappings: [],
    eventGrouping: "SingleAlert",
    enabled: true,
  };
}

/** Rules already present in the workspace, including one deliberately flawed. */
export const PREBUILT_RULES: AnalyticsRule[] = [
  {
    id: "ar-001",
    name: "Encoded PowerShell execution",
    description:
      "Detects PowerShell launched with an encoded command, a common way to hide payloads.",
    severity: "Medium",
    tactics: ["Execution", "DefenseEvasion"],
    query: `DeviceProcessEvents
| where FileName =~ "powershell.exe"
| where ProcessCommandLine has "-enc"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine, ReportId`,
    frequencyMin: 60,
    lookbackMin: 75,
    entityMappings: [
      { entityType: "Host", column: "DeviceName" },
      { entityType: "Account", column: "AccountName" },
    ],
    eventGrouping: "SingleAlert",
    enabled: true,
  },
  {
    id: "ar-002",
    name: "Credential dumping via comsvcs",
    description: "Detects the comsvcs.dll MiniDump technique used to dump LSASS.",
    severity: "High",
    tactics: ["CredentialAccess"],
    query: `DeviceProcessEvents
| where ProcessCommandLine contains "comsvcs.dll"
| where ProcessCommandLine contains "MiniDump"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine`,
    frequencyMin: 30,
    lookbackMin: 45,
    entityMappings: [{ entityType: "Host", column: "DeviceName" }],
    eventGrouping: "SingleAlert",
    enabled: true,
  },
  {
    id: "ar-003",
    name: "Risky sign-in without MFA",
    description: "High or medium risk sign-in that only satisfied a single factor.",
    severity: "High",
    tactics: ["InitialAccess"],
    query: `SigninLogs
| where RiskLevelDuringSignIn in ("high", "medium")
| where AuthenticationRequirement == "singleFactorAuthentication"
| project TimeGenerated, UserPrincipalName, IPAddress, Location, RiskLevelDuringSignIn`,
    frequencyMin: 15,
    lookbackMin: 20,
    entityMappings: [
      { entityType: "Account", column: "UserPrincipalName" },
      { entityType: "IP", column: "IPAddress" },
    ],
    eventGrouping: "SingleAlert",
    enabled: true,
  },
  {
    id: "ar-004",
    name: "All PowerShell activity",
    description:
      "Deliberately over-broad, to show what alert fatigue looks like before you ship it.",
    severity: "Low",
    tactics: [],
    query: `DeviceProcessEvents
| where FileName =~ "powershell.exe"
| project Timestamp, DeviceName, ProcessCommandLine`,
    frequencyMin: 15,
    lookbackMin: 10,
    entityMappings: [],
    eventGrouping: "AlertPerRow",
    enabled: false,
  },
];
