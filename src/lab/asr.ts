import { DEVICES, IOC } from "./data";

/**
 * Attack surface reduction rules.
 *
 * The rule identifiers and names are the real ones, because the GUID is how
 * these are configured everywhere except the portal — Intune policy, Group
 * Policy, PowerShell — and recognising them matters more than recognising the
 * friendly name.
 *
 * The behaviour worth internalising is the state machine. A rule in **Audit**
 * generates exactly the same events as **Block** and prevents nothing, which is
 * why an environment can look thoroughly covered and stop nothing at all. And
 * one specific rule in this set would have broken the lab's own intrusion.
 */

export type AsrState = "Not configured" | "Audit" | "Block" | "Warn" | "Disabled";

export const ASR_STATES: AsrState[] = ["Not configured", "Audit", "Block", "Warn", "Disabled"];

export type AsrRule = {
  /** The GUID used in Intune, Group Policy and PowerShell. */
  id: string;
  name: string;
  description: string;
  state: AsrState;
  /** Rules that commonly break line-of-business software carry a warning. */
  breakageRisk: "Low" | "Medium" | "High";
  /** Whether the Warn state is supported — several rules do not support it. */
  supportsWarn: boolean;
};

export function defaultRules(): AsrRule[] {
  return [
    {
      id: "9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2",
      name: "Block credential stealing from the Windows local security authority subsystem (lsass.exe)",
      description:
        "Stops processes opening a handle to LSASS to read credentials from memory — the technique behind most lateral movement.",
      state: "Audit",
      breakageRisk: "Medium",
      supportsWarn: true,
    },
    {
      id: "d1e49aac-8f56-4280-b9ba-993a6d77406c",
      name: "Block process creations originating from PSExec and WMI commands",
      description:
        "Stops remote execution through PSExec and WMI, which is how an attacker moves to the next machine.",
      state: "Not configured",
      breakageRisk: "High",
      supportsWarn: false,
    },
    {
      id: "5beb7efe-fd9a-4556-801d-275e5ffc04cc",
      name: "Block execution of potentially obfuscated scripts",
      description: "Stops scripts that are encoded or obfuscated to hide what they do.",
      state: "Audit",
      breakageRisk: "Medium",
      supportsWarn: true,
    },
    {
      id: "be9ba2d9-53ea-4cdc-84e5-9b1eeee46550",
      name: "Block executable content from email client and webmail",
      description: "Stops executables and scripts arriving by mail from running.",
      state: "Block",
      breakageRisk: "Low",
      supportsWarn: true,
    },
    {
      id: "d4f940ab-401b-4efc-aadc-ad5f3c50688a",
      name: "Block all Office applications from creating child processes",
      description: "Stops a document spawning a shell, which is the classic macro payload.",
      state: "Block",
      breakageRisk: "Medium",
      supportsWarn: true,
    },
    {
      id: "3b576869-a4ec-4529-8536-b80a7769e899",
      name: "Block Office applications from creating executable content",
      description: "Stops Office writing an executable to disk.",
      state: "Audit",
      breakageRisk: "Low",
      supportsWarn: true,
    },
    {
      id: "92e97fa1-2edf-4476-bdd6-9dd0b4dddc7b",
      name: "Block Win32 API calls from Office macros",
      description: "Stops macros calling Win32 APIs directly.",
      state: "Audit",
      breakageRisk: "Medium",
      supportsWarn: true,
    },
    {
      id: "e6db77e5-3df2-4cf1-b95a-636979351e5b",
      name: "Block persistence through WMI event subscription",
      description: "Stops the WMI event subscription technique used to survive a reboot.",
      state: "Not configured",
      breakageRisk: "Low",
      supportsWarn: false,
    },
    {
      id: "d3e037e1-3eb8-44c8-a917-57927947596d",
      name: "Block JavaScript or VBScript from launching downloaded executable content",
      description: "Stops a downloaded script chaining into an executable.",
      state: "Block",
      breakageRisk: "Low",
      supportsWarn: false,
    },
    {
      id: "c1db55ab-c21a-4637-bb3f-a12568109d35",
      name: "Use advanced protection against ransomware",
      description: "Applies additional heuristics against file-encrypting behaviour.",
      state: "Audit",
      breakageRisk: "Low",
      supportsWarn: true,
    },
    {
      id: "b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4",
      name: "Block untrusted and unsigned processes that run from USB",
      description: "Stops unsigned executables running from removable media.",
      state: "Not configured",
      breakageRisk: "Low",
      supportsWarn: true,
    },
    {
      id: "56a863a9-875e-4185-98a7-b882c64b5ce5",
      name: "Block abuse of exploited vulnerable signed drivers",
      description: "Stops the bring-your-own-vulnerable-driver technique.",
      state: "Not configured",
      breakageRisk: "Medium",
      supportsWarn: false,
    },
  ];
}

/* ------------------------------------------------------------- semantics */

export type StateEffect = {
  /** Whether the technique is actually stopped. */
  prevents: boolean;
  /** Whether an event is written for hunting and reporting. */
  audits: boolean;
  /** Whether the user can choose to proceed anyway. */
  userCanBypass: boolean;
  explanation: string;
};

/**
 * What a state actually does.
 *
 * Audit and Block are identical from a telemetry point of view and opposite
 * from a protection point of view, which is the trap: a coverage report built
 * on "rule is configured" counts them the same.
 */
export function stateEffect(state: AsrState): StateEffect {
  switch (state) {
    case "Block":
      return {
        prevents: true,
        audits: true,
        userCanBypass: false,
        explanation: "The technique is stopped and an event is written.",
      };
    case "Audit":
      return {
        prevents: false,
        audits: true,
        userCanBypass: false,
        explanation:
          "An event is written and nothing is stopped. The telemetry is identical to Block, so a report counting configured rules cannot tell the two apart.",
      };
    case "Warn":
      return {
        prevents: true,
        audits: true,
        userCanBypass: true,
        explanation:
          "The action is blocked but the user is shown a prompt and may unblock it for 24 hours. Protection that a user can dismiss is not protection against a user who wants to proceed.",
      };
    case "Disabled":
      return {
        prevents: false,
        audits: false,
        userCanBypass: false,
        explanation: "The rule is explicitly off. Nothing is stopped and nothing is recorded.",
      };
    case "Not configured":
      return {
        prevents: false,
        audits: false,
        userCanBypass: false,
        explanation:
          "The rule has never been set. Identical in effect to Disabled, but it means nobody decided rather than somebody deciding against it.",
      };
  }
}

/* --------------------------------------------------- the lab's intrusion */

/**
 * Stages of the embedded intrusion, and the rule that would have stopped each.
 *
 * This is the exercise: the attack in the telemetry is not hypothetical, and
 * the rules that would have broken it are sitting in Audit.
 */
export type AttackStage = {
  stage: string;
  observed: string;
  device: string;
  /** The ASR rule id that covers this technique, if one does. */
  ruleId: string | null;
  huntQuery: string;
};

export const ATTACK_STAGES: AttackStage[] = [
  {
    stage: "Initial access",
    observed: "A phishing message reached six mailboxes and one recipient clicked the link.",
    device: IOC.victimDevice,
    ruleId: "be9ba2d9-53ea-4cdc-84e5-9b1eeee46550",
    huntQuery: [
      "EmailEvents",
      `| where SenderFromAddress == "${IOC.phishSender}"`,
      "| project Timestamp, RecipientEmailAddress, Subject, DeliveryAction",
    ].join("\n"),
  },
  {
    stage: "Execution",
    observed: "Encoded PowerShell ran on the workstation shortly after the click.",
    device: IOC.victimDevice,
    ruleId: "5beb7efe-fd9a-4556-801d-275e5ffc04cc",
    huntQuery: [
      "DeviceProcessEvents",
      `| where DeviceName == "${IOC.victimDevice}"`,
      '| where ProcessCommandLine has "-enc"',
      "| project Timestamp, FileName, ProcessCommandLine",
    ].join("\n"),
  },
  {
    stage: "Credential access",
    observed: "LSASS was dumped using comsvcs.dll MiniDump.",
    device: IOC.victimDevice,
    ruleId: "9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2",
    huntQuery: [
      "DeviceProcessEvents",
      `| where DeviceName == "${IOC.victimDevice}"`,
      '| where ProcessCommandLine has "comsvcs.dll" or ProcessCommandLine has "MiniDump"',
      "| project Timestamp, FileName, ProcessCommandLine",
    ].join("\n"),
  },
  {
    stage: "Lateral movement",
    observed: `The ${IOC.compromisedService} account authenticated to ${IOC.pivotDevice}.`,
    device: IOC.pivotDevice,
    ruleId: "d1e49aac-8f56-4280-b9ba-993a6d77406c",
    huntQuery: [
      "DeviceLogonEvents",
      `| where RemoteDeviceName == "${IOC.victimDevice}"`,
      "| project Timestamp, DeviceName, AccountName, LogonType, ActionType",
    ].join("\n"),
  },
  {
    stage: "Exfiltration",
    observed: "Finance data was archived and sent to the external address.",
    device: IOC.pivotDevice,
    ruleId: null,
    huntQuery: [
      "CommonSecurityLog",
      "| summarize TotalSent = sum(SentBytes) by SourceIP, DestinationIP",
      "| top 3 by TotalSent desc",
    ].join("\n"),
  },
];

export type StageCoverage = {
  stage: AttackStage;
  rule: AsrRule | null;
  /** Whether the rule as configured would have stopped this stage. */
  prevented: boolean;
  verdict: string;
};

/** How the current configuration would have fared against the real intrusion. */
export function coverage(rules: AsrRule[]): StageCoverage[] {
  return ATTACK_STAGES.map((stage) => {
    const rule = stage.ruleId ? (rules.find((r) => r.id === stage.ruleId) ?? null) : null;
    if (!rule) {
      return {
        stage,
        rule: null,
        prevented: false,
        verdict: "No attack surface reduction rule covers this stage — it needs a different control.",
      };
    }
    const effect = stateEffect(rule.state);
    return {
      stage,
      rule,
      prevented: effect.prevents,
      verdict: effect.prevents
        ? `Stopped by "${rule.name}" in ${rule.state}.`
        : `Not stopped. The covering rule is in ${rule.state} — ${effect.audits ? "it would have recorded the attempt and allowed it" : "it would not even have recorded it"}.`,
    };
  });
}

/* ------------------------------------------------------------ exclusions */

export type AsrExclusion = {
  path: string;
  /** Empty means the exclusion applies to every rule. */
  ruleIds: string[];
  justification: string;
};

export function isExcluded(exclusions: AsrExclusion[], ruleId: string, path: string): boolean {
  return exclusions.some((e) => {
    if (e.ruleIds.length > 0 && !e.ruleIds.includes(ruleId)) return false;
    const p = path.toLowerCase().replace(/\//g, "\\");
    const pattern = e.path.toLowerCase().replace(/\//g, "\\");
    if (pattern.endsWith("*")) return p.startsWith(pattern.slice(0, -1));
    return p === pattern;
  });
}

/* ------------------------------------------------------------- reporting */

export type RuleSummary = {
  blocking: number;
  auditing: number;
  warning: number;
  off: number;
  total: number;
  /** Devices reporting the configuration. */
  devices: number;
};

export function summarise(rules: AsrRule[]): RuleSummary {
  return {
    blocking: rules.filter((r) => r.state === "Block").length,
    auditing: rules.filter((r) => r.state === "Audit").length,
    warning: rules.filter((r) => r.state === "Warn").length,
    off: rules.filter((r) => r.state === "Disabled" || r.state === "Not configured").length,
    total: rules.length,
    devices: DEVICES.length,
  };
}
