import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/**
 * Additional SC-200 questions written against the official skills-measured outline
 * (study guide updated 2026-07-28), targeting objectives that were thinly covered.
 * Every answer was checked against Microsoft Learn.
 */
export const sc200MoreQuestions: Question[] = [
  // -------------------------------------------------------------- operations
  {
    id: "sc200-m1",
    domainId: "operations",
    type: "statements",
    scenario: "You are designing detections with Microsoft Sentinel near-real-time (NRT) analytics rules.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "NRT rules run once every minute and look at events ingested in the preceding minute.", correct: true },
      { id: "b", text: "NRT rules use the ingestion time of events rather than the TimeGenerated value.", correct: true },
      { id: "c", text: "A customer can define an unlimited number of NRT rules in a workspace.", correct: false },
      { id: "d", text: "An NRT rule can raise an unlimited number of single-event alerts per run.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "NRT rules are hard-coded to a one-minute cadence and use ingestion time, so source delay can largely be ignored. They are limited: currently no more than 50 rules per customer, and a run can produce up to 30 single-event alerts before the last one summarises the rest.",
    difficulty: 3,
    reference: { label: "Detect threats quickly with NRT analytics rules", url: `${docs}/azure/sentinel/near-real-time-rules` },
  },
  {
    id: "sc200-m2",
    domainId: "operations",
    type: "single",
    prompt:
      "A Windows server matches the membership rules of two Defender for Endpoint device groups, one ranked 2 and the other ranked 5. Which group is the server placed in?",
    options: [
      { id: "a", text: "Both groups, and it uses the more restrictive remediation level" },
      { id: "b", text: "The group that was created most recently of the two" },
      { id: "c", text: "The group ranked 2, because the highest-ranked matching group wins" },
      { id: "d", text: "Neither group, so it falls into the default ungrouped devices group" },
    ],
    correct: ["c"],
    explanation:
      "A device belongs to only one group. When it matches several matching rules, it is added to the highest-ranked group, and rank 1 is the highest. Groups are matched on device name, domain, tags and OS platform, and each group sets its own automated remediation level.",
    difficulty: 2,
    reference: { label: "Create and manage device groups", url: `${docs}/defender-endpoint/machine-groups` },
  },
  {
    id: "sc200-m3",
    domainId: "operations",
    type: "single",
    prompt:
      "Microsoft Defender Antivirus runs in passive mode on some servers next to a third-party antivirus. You want Defender for Endpoint to still remediate malicious artefacts that its behavioural detections find. Which setting should you turn on?",
    options: [
      { id: "a", text: "Auto-resolve alerts for the affected devices" },
      { id: "b", text: "EDR in block mode in the advanced features" },
      { id: "c", text: "Restrict correlation to scoped device groups" },
      { id: "d", text: "Custom network indicators for the servers" },
    ],
    correct: ["b"],
    explanation:
      "EDR in block mode provides protection from malicious artefacts even when Defender Antivirus is in passive mode. Auto-resolve closes alerts, correlation scoping limits how alerts are grouped, and custom network indicators block IPs and URLs.",
    difficulty: 2,
    reference: { label: "Configure advanced features in Defender for Endpoint", url: `${docs}/defender-endpoint/advanced-features` },
  },
  {
    id: "sc200-m4",
    domainId: "operations",
    type: "statements",
    scenario: "You are reviewing the advanced features in Microsoft Defender for Endpoint.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Auto-resolve closes alerts where no threats were found or where detected threats were remediated.", correct: true },
      { id: "b", text: "An alert an analyst manually set to In progress or Resolved is not overwritten by auto-resolve.", correct: true },
      { id: "c", text: "Auto-resolve never influences the device risk level.", correct: false },
      { id: "d", text: "EDR in block mode only works when Microsoft Defender Antivirus is the active antivirus.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "Auto-resolve respects manual analyst status changes, but because device risk is based on active alerts, resolving them can change the risk level. EDR in block mode is designed for the case where Defender Antivirus is passive.",
    difficulty: 3,
    reference: { label: "Configure advanced features in Defender for Endpoint", url: `${docs}/defender-endpoint/advanced-features` },
  },
  {
    id: "sc200-m5",
    domainId: "operations",
    type: "single",
    prompt:
      "Threat hunters need every PowerShell script execution on administrative workstations, which is more detail than Defender for Endpoint collects by default. What should you configure?",
    options: [
      { id: "a", text: "An attack surface reduction rule in audit mode for scripts" },
      { id: "b", text: "A live response library script that runs daily on each device" },
      { id: "c", text: "Custom data collection rules for the administrative workstations" },
      { id: "d", text: "A custom detection rule with a response action attached" },
    ],
    correct: ["c"],
    explanation:
      "Custom data collection expands telemetry beyond the default configuration with rules that define what extra data to collect, for example all PowerShell executions on admin workstations, to support hunting. ASR audit, live response scripts and detection rules do not widen the telemetry collected.",
    difficulty: 3,
    reference: { label: "Custom data collection in Defender for Endpoint", url: `${docs}/defender-endpoint/custom-data-collection` },
  },
  {
    id: "sc200-m6",
    domainId: "operations",
    type: "single",
    prompt:
      "Automatic attack disruption must never contain a small set of critical domain controllers, even if they appear in a high-confidence incident. What should you configure?",
    options: [
      { id: "a", text: "An exclusion for those devices in the automated response settings" },
      { id: "b", text: "A device group with the No automated response level" },
      { id: "c", text: "An alert suppression rule for the domain controllers" },
      { id: "d", text: "An indicator that allows the domain controllers' file hashes" },
    ],
    correct: ["a"],
    explanation:
      "Exclusions can be configured for supported users, devices and IP addresses so that critical assets are not automatically contained. Device group automation levels govern automated investigation remediation, and suppression rules or file indicators do not affect containment.",
    difficulty: 3,
    reference: { label: "Automatic attack disruption in Microsoft Defender XDR", url: `${docs}/defender-xdr/automatic-attack-disruption` },
  },
  {
    id: "sc200-m7",
    domainId: "operations",
    type: "statements",
    scenario: "You are explaining automatic attack disruption in Microsoft Defender XDR to the SOC.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "It uses signals correlated across endpoints, identities, email and SaaS apps to reach a high-confidence incident.", correct: true },
      { id: "b", text: "For device containment, Defender for Endpoint applies a containment policy on onboarded devices.", correct: true },
      { id: "c", text: "An analyst must approve every containment action before it is taken.", correct: false },
      { id: "d", text: "Detectors are deployed broadly without any validation period.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "Disruption acts automatically, without waiting for approval, once correlated signals give high confidence. Detectors are validated in audit mode and rolled out gradually before they can contain anything.",
    difficulty: 2,
    reference: { label: "Automatic attack disruption in Microsoft Defender XDR", url: `${docs}/defender-xdr/automatic-attack-disruption` },
  },
  {
    id: "sc200-m8",
    domainId: "operations",
    type: "single",
    prompt:
      "You want every analyst to follow the same triage checklist on new incidents in Microsoft Sentinel. Tasks should be added to incidents automatically. What is the least Sentinel role a user needs to add, view and edit tasks?",
    options: [
      { id: "a", text: "Microsoft Sentinel Reader" },
      { id: "b", text: "Microsoft Sentinel Responder" },
      { id: "c", text: "Microsoft Sentinel Contributor" },
      { id: "d", text: "Logic App Contributor" },
    ],
    correct: ["b"],
    explanation:
      "The Responder role can create automation rules and view and edit incidents, which together are needed to add, view and edit tasks. Reader cannot edit incidents, Contributor is broader than required, and Logic App Contributor is only needed to create playbooks.",
    difficulty: 3,
    reference: { label: "Use tasks to manage incidents in Microsoft Sentinel", url: `${docs}/azure/sentinel/incident-tasks` },
  },
  {
    id: "sc200-m9",
    domainId: "operations",
    type: "single",
    prompt:
      "A single anomaly in Microsoft Sentinel doesn't look conclusive. How does Microsoft describe the best way to use anomalies in detection work?",
    options: [
      { id: "a", text: "Treat each anomaly as proof of compromise and open an incident for it" },
      { id: "b", text: "Combine several anomalies along the kill chain as additional signals" },
      { id: "c", text: "Ignore anomalies unless they come from the UEBA engine" },
      { id: "d", text: "Convert every anomaly into a suppression rule for the entity" },
    ],
    correct: ["b"],
    explanation:
      "A single anomaly is not a strong signal of malicious behaviour, but several anomalies at different points on the kill chain send a clear message. They are additional signals, evidence during investigations and starting points for hunts. Anomalies are noisy, which is why customizable anomaly rules can be tuned.",
    difficulty: 2,
    reference: { label: "Use customizable anomalies to detect threats in Microsoft Sentinel", url: `${docs}/azure/sentinel/soc-ml-anomalies` },
  },
  {
    id: "sc200-m10",
    domainId: "operations",
    type: "single",
    prompt:
      "You want to collect indicators of compromise from a threat intelligence platform into Microsoft Sentinel using a REST API, without deploying a data connector. What should you use?",
    options: [
      { id: "a", text: "The Threat Intelligence upload API" },
      { id: "b", text: "The Threat Intelligence - TAXII data connector" },
      { id: "c", text: "The Microsoft Defender Threat Intelligence data connector" },
      { id: "d", text: "A watchlist imported from a CSV file each day" },
    ],
    correct: ["a"],
    explanation:
      "The upload API is the option that connects TI platforms or custom applications through a REST API and does not require a data connector. The TAXII and Defender Threat Intelligence options are data connectors, and a watchlist is reference data rather than indicators.",
    difficulty: 2,
    reference: { label: "Understand threat intelligence in Microsoft Sentinel", url: `${docs}/azure/sentinel/understand-threat-intelligence` },
  },

  // ---------------------------------------------------------------- response
  {
    id: "sc200-m11",
    domainId: "response",
    type: "statements",
    scenario: "You are reviewing how the Microsoft Defender portal creates incidents from alerts.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The portal correlates alerts from all connected sources using its own internal correlation logic.", correct: true },
      { id: "b", text: "Each Microsoft Sentinel workspace is treated as its own separate data source for correlation.", correct: true },
      { id: "c", text: "Administrators define the correlation criteria by editing a KQL rule.", correct: false },
      { id: "d", text: "An analyst can move an alert from one incident to another if it fits better there.", correct: true },
    ],
    correct: ["a", "b", "d"],
    explanation:
      "Correlation criteria are proprietary and not customer-editable. Analysts can still correct the result manually by moving an alert to a different incident, and where a whole incident belongs together with another, merging is preferable because it keeps the history.",
    difficulty: 2,
    reference: { label: "Alert correlation and incident merging in the Microsoft Defender portal", url: `${docs}/defender-xdr/alerts-incidents-correlation` },
  },
  {
    id: "sc200-m12",
    domainId: "response",
    type: "single",
    prompt:
      "You need to send Microsoft Graph activity logs to a Log Analytics workspace so you can investigate suspicious API calls. Which is the least privileged Microsoft Entra role that can set up the diagnostic setting?",
    options: [
      { id: "a", text: "Global Reader" },
      { id: "b", text: "Reports Reader" },
      { id: "c", text: "Security Administrator" },
      { id: "d", text: "Global Administrator" },
    ],
    correct: ["c"],
    explanation:
      "Microsoft Graph activity logs are turned on with a diagnostic setting, and Security Administrator is the only least privileged admin role supported for setting it up. Reader roles cannot configure it, and Global Administrator is more than required.",
    difficulty: 3,
    reference: { label: "Microsoft Graph activity logs", url: `${docs}/graph/microsoft-graph-activity-logs-overview` },
  },
  {
    id: "sc200-m13",
    domainId: "response",
    type: "single",
    prompt:
      "Graph activity logs are flowing into your Log Analytics workspace. Which table holds the audit trail of HTTP requests made to Microsoft Graph?",
    options: [
      { id: "a", text: "MicrosoftGraphActivityLogs" },
      { id: "b", text: "AADServicePrincipalSignInLogs" },
      { id: "c", text: "AADManagedIdentitySignInLogs" },
      { id: "d", text: "AADProvisioningLogs" },
    ],
    correct: ["a"],
    explanation:
      "MicrosoftGraphActivityLogs records the HTTP requests that Microsoft Graph receives and processes for the tenant, including requests from apps, SDKs and Microsoft's own services. Sign-in, Microsoft 365 workload and directory audit events are stored in different tables.",
    difficulty: 2,
    reference: { label: "Microsoft Graph activity logs", url: `${docs}/graph/microsoft-graph-activity-logs-overview` },
  },
  {
    id: "sc200-m14",
    domainId: "response",
    type: "single",
    prompt:
      "You need to find out who modified a role assignment in Microsoft Entra ID, using data you already ingest into Microsoft Sentinel. Which table records directory changes such as role assignments?",
    options: [
      { id: "a", text: "SigninLogs" },
      { id: "b", text: "AuditLogs" },
      { id: "c", text: "SecurityAlert" },
      { id: "d", text: "DeviceEvents" },
    ],
    correct: ["b"],
    explanation:
      "The AuditLogs table records Microsoft Entra directory changes, including role assignments and who performed them. SigninLogs records authentications, SecurityAlert stores alerts, and DeviceEvents holds endpoint telemetry.",
    difficulty: 1,
    reference: { label: "Microsoft Entra audit logs", url: `${docs}/entra/identity/monitoring-health/concept-audit-logs` },
  },

  // ----------------------------------------------------------------- hunting
  {
    id: "sc200-m15",
    domainId: "hunting",
    type: "single",
    prompt:
      "A KQL job in the Microsoft Sentinel data lake promotes results into a new analytics-tier table. What suffix does the new table's name get?",
    options: [
      { id: "a", text: "_CL, as with every custom table" },
      { id: "b", text: "_SRCH, as with search job results" },
      { id: "c", text: "_KQL_CL, to mark it as created by a KQL job" },
      { id: "d", text: "_RST, as with restored data tables" },
    ],
    correct: ["c"],
    explanation:
      "When a KQL job creates a new table in the analytics tier, the table name is suffixed with _KQL_CL to show it came from a KQL job. Search job results and restored tables use their own suffixes, and jobs can also append to an existing table instead.",
    difficulty: 3,
    reference: { label: "Create jobs in the Microsoft Sentinel data lake", url: `${docs}/azure/sentinel/datalake/kql-jobs` },
  },
  {
    id: "sc200-m16",
    domainId: "hunting",
    type: "statements",
    scenario: "You are evaluating Microsoft Sentinel graph for the hunting team.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Sentinel graph models relationships between assets, identities and activities as nodes and edges.", correct: true },
      { id: "b", text: "Blast radius analysis shows paths an attacker could take from a compromised entity to a critical asset.", correct: true },
      { id: "c", text: "Graph-based hunting reveals privileged access paths by traversing relationships between users and devices.", correct: true },
      { id: "d", text: "Sentinel graph replaces the analytics tier for storing detection results.", correct: false },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "Sentinel graph is a graph analytics capability that lets defenders and AI agents reason over interconnected entities, answering questions such as the blast radius of a compromised account or document. It complements tabular data and does not replace storage tiers.",
    difficulty: 2,
    reference: { label: "What is Microsoft Sentinel graph?", url: `${docs}/azure/sentinel/datalake/sentinel-graph-overview` },
  },
  {
    id: "sc200-m17",
    domainId: "hunting",
    type: "statements",
    scenario: "A team wants to connect AI agents to Microsoft Sentinel through its Model Context Protocol (MCP) support.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The MCP server interface is fully hosted, so no infrastructure has to be deployed for it.", correct: true },
      { id: "b", text: "It uses Microsoft Entra for identity.", correct: true },
      { id: "c", text: "It offers scenario-focused collections of security tools that agents can call in natural language.", correct: true },
      { id: "d", text: "You must run your own MCP server on a virtual machine for each workspace.", correct: false },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "Sentinel's MCP support is a hosted, unified server with Entra-based identity and ready-made, scenario-focused tool collections, so teams can connect compatible clients without deploying anything themselves.",
    difficulty: 2,
    reference: { label: "Microsoft Sentinel support for Model Context Protocol", url: `${docs}/azure/sentinel/datalake/sentinel-mcp-overview` },
  },
  {
    id: "sc200-m18",
    domainId: "hunting",
    type: "single",
    prompt:
      "In Microsoft Sentinel, which UEBA table stores identity details, such as group memberships and roles, that are synchronised from Microsoft Entra ID and from Active Directory through Defender for Identity?",
    options: [
      { id: "a", text: "IdentityInfo" },
      { id: "b", text: "BehaviorAnalytics" },
      { id: "c", text: "IdentityDirectoryEvents" },
      { id: "d", text: "Anomalies" },
    ],
    correct: ["a"],
    explanation:
      "IdentityInfo holds identity information synchronised to UEBA from Microsoft Entra ID and, through Defender for Identity, from on-premises Active Directory. BehaviorAnalytics holds UEBA's output, and IdentityDirectoryEvents is an advanced hunting table of directory changes.",
    difficulty: 3,
    reference: { label: "Microsoft Sentinel UEBA reference", url: `${docs}/azure/sentinel/ueba-reference` },
  },
  {
    id: "sc200-m19",
    domainId: "hunting",
    type: "single",
    prompt:
      "A BehaviorAnalytics record has an anomaly score of 9. What does this tell the analyst?",
    options: [
      { id: "a", text: "The activity deviates strongly from the entity's own baseline behaviour" },
      { id: "b", text: "The activity is benign and matches the entity's normal baseline exactly" },
      { id: "c", text: "The activity matched a known threat intelligence indicator with 90% confidence" },
      { id: "d", text: "The entity generated nine alerts in the last twenty-four hours" },
    ],
    correct: ["a"],
    explanation:
      "The UEBA anomaly score runs from 0 to 10, where 0 is benign and 10 is highly anomalous, and it quantifies how far the activity deviates from the entity's baseline. It is not a threat intelligence match or an alert count.",
    difficulty: 2,
    reference: { label: "Microsoft Sentinel UEBA reference", url: `${docs}/azure/sentinel/ueba-reference` },
  },
  {
    id: "sc200-m20",
    domainId: "hunting",
    type: "single",
    prompt:
      "You want a KQL query that lists alerts created by Microsoft Sentinel analytics rules and by connected security products in the workspace. Which table should you query?",
    options: [
      { id: "a", text: "SecurityAlert" },
      { id: "b", text: "SecurityRecommendation" },
      { id: "c", text: "SecurityBaseline" },
      { id: "d", text: "SecurityEvent" },
    ],
    correct: ["a"],
    explanation:
      "SecurityAlert stores the alerts generated by analytics rules and by connected products, and SecurityIncident stores the lifecycle of incidents built from them. The other names are either different tables with other purposes or do not hold alerts.",
    difficulty: 1,
    reference: { label: "Microsoft Sentinel security alert schema reference", url: `${docs}/azure/sentinel/security-alert-schema` },
  },
];
