import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc200ScenarioQuestions: Question[] = [
  // ---- repeated scenario: reducing alert noise ---------------------------
  {
    id: "sc200-s1",
    domainId: "operations",
    type: "meets-goal",
    scenario:
      "A nightly vulnerability scan run from a dedicated server named SCAN01 generates dozens of Microsoft Defender XDR alerts titled 'Suspicious network scanning activity'. The SOC must stop seeing these alerts for SCAN01 only. Detection for every other device must be unaffected, and the underlying telemetry must still be retained for hunting.",
    prompt:
      "Solution: You create an alert tuning rule that suppresses alerts with that title when the device is SCAN01.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "Alert tuning suppresses matching alerts using precise conditions such as device and alert title, leaving detection intact everywhere else. Suppression affects alert generation, not ingestion, so the underlying telemetry remains queryable in advanced hunting.",
    difficulty: 2,
    reference: { label: "Alert tuning", url: `${docs}/defender-xdr/investigate-alerts` },
  },
  {
    id: "sc200-s2",
    domainId: "operations",
    type: "meets-goal",
    scenario:
      "A nightly vulnerability scan run from a dedicated server named SCAN01 generates dozens of Microsoft Defender XDR alerts titled 'Suspicious network scanning activity'. The SOC must stop seeing these alerts for SCAN01 only. Detection for every other device must be unaffected, and the underlying telemetry must still be retained for hunting.",
    prompt:
      "Solution: You offboard SCAN01 from Microsoft Defender for Endpoint.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Offboarding stops the alerts, but it also stops all telemetry collection from SCAN01, so the hunting requirement fails and the server becomes a monitoring blind spot — a poor outcome for a machine that legitimately performs scanning activity.",
    difficulty: 2,
    reference: { label: "Offboard devices", url: `${docs}/defender-endpoint/offboard-machines` },
  },
  {
    id: "sc200-s3",
    domainId: "operations",
    type: "meets-goal",
    scenario:
      "A nightly vulnerability scan run from a dedicated server named SCAN01 generates dozens of Microsoft Defender XDR alerts titled 'Suspicious network scanning activity'. The SOC must stop seeing these alerts for SCAN01 only. Detection for every other device must be unaffected, and the underlying telemetry must still be retained for hunting.",
    prompt:
      "Solution: You place SCAN01 in a device group whose automation level is set to 'No automated response'.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Automation level controls whether remediation actions run after an alert is raised; it does not stop the alert being generated. The SOC would still see every alert in the queue, so the primary requirement is unmet.",
    difficulty: 2,
    reference: { label: "Automation levels", url: `${docs}/defender-endpoint/automation-levels` },
  },

  // ---- repeated scenario: long-term log retention ------------------------
  {
    id: "sc200-s4",
    domainId: "operations",
    type: "meets-goal",
    scenario:
      "Fabrikam must retain firewall logs for seven years to satisfy an audit obligation, keep ingestion costs low, and still be able to run analytics rules over the most recent 90 days of that data.",
    prompt:
      "Solution: You route the firewall logs into the Microsoft Sentinel data lake tier and create a KQL job that promotes the last 90 days into the analytics tier.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "The data lake tier provides cost-effective retention for up to 12 years, which covers the seven-year obligation, and KQL jobs promote selected data into the analytics tier where analytics rules and hunting can reach it.",
    difficulty: 3,
    reference: { label: "Sentinel data lake overview", url: `${docs}/azure/sentinel/datalake/sentinel-lake-overview` },
  },
  {
    id: "sc200-s5",
    domainId: "operations",
    type: "meets-goal",
    scenario:
      "Fabrikam must retain firewall logs for seven years to satisfy an audit obligation, keep ingestion costs low, and still be able to run analytics rules over the most recent 90 days of that data.",
    prompt:
      "Solution: You ingest all firewall logs into the analytics tier and set the workspace retention to seven years.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "This satisfies retention and analytics but fails the cost requirement. Keeping seven years of high-volume firewall data in the analytics tier is precisely the expense the data lake tier exists to avoid.",
    difficulty: 2,
    reference: { label: "Manage data tiers and retention", url: `${docs}/azure/sentinel/datalake/sentinel-lake-overview` },
  },

  // ---- statement grids ---------------------------------------------------
  {
    id: "sc200-s6",
    domainId: "operations",
    type: "statements",
    scenario:
      "A Microsoft Sentinel automation rule is configured to run on incident creation. It sets the incident severity to High, assigns an owner, and calls a playbook that posts a message to Microsoft Teams.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Setting the severity requires the playbook to run.", correct: false },
      { id: "b", text: "Posting to Microsoft Teams requires the playbook.", correct: true },
      { id: "c", text: "The playbook needs permission to act on the Sentinel workspace.", correct: true },
    ],
    correct: ["b", "c"],
    explanation:
      "Automation rules natively change incident properties such as severity, status, owner, and tags. Reaching an external service such as Teams needs a Logic App playbook, and that playbook must be authorised — ideally through a managed identity granted the appropriate Sentinel role.",
    difficulty: 2,
    reference: { label: "Automation rules", url: `${docs}/azure/sentinel/automate-incident-handling-with-automation-rules` },
  },
  {
    id: "sc200-s7",
    domainId: "hunting",
    type: "statements",
    scenario:
      "An analyst writes this advanced hunting query:\n\nDeviceProcessEvents\n| where Timestamp > ago(7d)\n| where FileName =~ \"powershell.exe\"\n| summarize arg_max(Timestamp, *) by DeviceId",
    prompt: "For each statement about the query, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The query returns one row per device.", correct: true },
      { id: "b", text: "The =~ operator makes the filename comparison case-insensitive.", correct: true },
      { id: "c", text: "As written, the query can be saved directly as a custom detection rule.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "arg_max returns the full row holding the latest Timestamp for each grouping key, so exactly one row per DeviceId. The =~ operator performs a case-insensitive string comparison. The query cannot become a custom detection rule as written because summarize drops ReportId, which such rules require alongside Timestamp and an entity column.",
    difficulty: 3,
    reference: { label: "Custom detection rules", url: `${docs}/defender-xdr/custom-detection-rules` },
  },
  {
    id: "sc200-s8",
    domainId: "response",
    type: "statements",
    scenario:
      "An analyst isolates a compromised Windows device from the Microsoft Defender portal using the standard (full) isolation action.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The Defender for Endpoint agent keeps communicating with the service.", correct: true },
      { id: "b", text: "Live response sessions can still be opened against the device.", correct: true },
      { id: "c", text: "The device's stored data is wiped as part of isolation.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "Isolation cuts general network connectivity while deliberately preserving the channel to the Defender service, which is what keeps live response and telemetry working during an investigation. Isolation never destroys data — that would eliminate the evidence you are trying to collect.",
    difficulty: 2,
    reference: { label: "Response actions on a device", url: `${docs}/defender-endpoint/respond-machine-alerts` },
  },

  // ---- ordering ----------------------------------------------------------
  {
    id: "sc200-s9",
    domainId: "operations",
    type: "ordering",
    prompt:
      "You must collect Windows security events from on-premises servers into Microsoft Sentinel, filtered to specific event IDs. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Connect the servers to Azure Arc so they can be managed as Azure resources" },
      { id: "b", text: "Install the Azure Monitor Agent on the servers" },
      { id: "c", text: "Create a data collection rule with an XPath filter for the required event IDs" },
      { id: "d", text: "Associate the data collection rule with the servers" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Non-Azure machines must be projected into Azure through Arc before the Azure Monitor Agent extension can be deployed to them. The data collection rule then defines which events are gathered, and it only takes effect on machines it is associated with.",
    difficulty: 3,
    reference: { label: "Windows Security Events via AMA", url: `${docs}/azure/sentinel/data-connectors/windows-security-events-via-ama` },
  },
  {
    id: "sc200-s10",
    domainId: "hunting",
    type: "ordering",
    prompt:
      "You want to turn a successful hunting query into an automated detection with a response action. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Refine the query so it returns a bounded, low-volume result set" },
      { id: "b", text: "Project Timestamp, ReportId, and an entity column such as DeviceId" },
      { id: "c", text: "Create a custom detection rule from the query and set its frequency" },
      { id: "d", text: "Select the response actions to run on the impacted entities" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "A noisy query produces alert fatigue, so tightening it comes first. The required columns must be present before the rule can be created at all, and response actions can only be chosen once the rule exists and knows which entities it returns.",
    difficulty: 3,
    reference: { label: "Custom detection rules", url: `${docs}/defender-xdr/custom-detection-rules` },
  },
  {
    id: "sc200-s11",
    domainId: "response",
    type: "ordering",
    prompt:
      "A user reports a phishing email that was delivered to many mailboxes. Arrange the response steps in the order a SOC analyst should perform them.",
    steps: [
      { id: "a", text: "Use Threat Explorer to identify every mailbox that received the message" },
      { id: "b", text: "Soft delete or purge the message from the affected mailboxes" },
      { id: "c", text: "Block the sender and any malicious URLs using indicators" },
      { id: "d", text: "Investigate whether any recipient clicked the link or entered credentials" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Scope the campaign first so you know what you are dealing with, then contain it by removing the message and blocking the infrastructure, and finally determine impact — which recipients interacted and therefore need credential resets or deeper investigation.",
    difficulty: 2,
    reference: { label: "Threat Explorer", url: `${docs}/defender-office-365/threat-explorer-threat-hunting` },
  },
  {
    id: "sc200-s12",
    domainId: "response",
    type: "ordering",
    prompt:
      "Microsoft Defender for Identity raises a Golden Ticket alert. Arrange the containment actions in the correct order.",
    steps: [
      { id: "a", text: "Confirm the alert and identify the affected domain and accounts" },
      { id: "b", text: "Reset the krbtgt account password once" },
      { id: "c", text: "Allow Active Directory replication to complete across all domain controllers" },
      { id: "d", text: "Reset the krbtgt account password a second time" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Kerberos keeps the current and previous krbtgt key, so a single reset leaves forged tickets valid. You must reset twice, and replication has to finish between the resets — otherwise domain controllers that have not yet received the first change will be unable to validate legitimate tickets.",
    difficulty: 3,
    reference: { label: "Defender for Identity alerts", url: `${docs}/defender-for-identity/persistence-privilege-escalation-alerts` },
  },
];
