import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc200Questions: Question[] = [
  // -------------------------------------------------------------- operations
  {
    id: "sc200-q1",
    domainId: "operations",
    type: "single",
    prompt:
      "You need a Microsoft Sentinel detection that runs every minute against incoming data with the lowest possible latency, without you defining a query schedule. Which analytics rule type should you create?",
    options: [
      { id: "a", text: "Scheduled query rule" },
      { id: "b", text: "Near-real-time (NRT) rule" },
      { id: "c", text: "Fusion rule" },
      { id: "d", text: "Microsoft security rule" },
    ],
    correct: ["b"],
    explanation:
      "NRT rules run once per minute on a fixed cadence you do not configure, giving the lowest detection latency. Scheduled rules require you to define frequency and lookback. Fusion uses machine learning to correlate multi-stage attacks, and Microsoft security rules simply create Sentinel incidents from alerts raised by other Microsoft products.",
    difficulty: 2,
    reference: { label: "Near-real-time detection rules", url: `${docs}/azure/sentinel/near-real-time-rules` },
  },
  {
    id: "sc200-q2",
    domainId: "operations",
    type: "single",
    prompt:
      "Security events from on-premises Windows domain controllers must be ingested into Microsoft Sentinel, and you need to control exactly which event IDs are collected. What should you configure?",
    options: [
      { id: "a", text: "The Windows Security Events via AMA connector with a data collection rule" },
      { id: "b", text: "The Syslog via AMA connector" },
      { id: "c", text: "The Common Event Format (CEF) via AMA connector" },
      { id: "d", text: "A custom log table populated by the Logs Ingestion API" },
    ],
    correct: ["a"],
    explanation:
      "The Windows Security Events via AMA connector uses the Azure Monitor Agent, and its data collection rule lets you pick a preset tier or supply an XPath filter for specific event IDs. Syslog and CEF connectors handle Linux and network appliance formats, not Windows event logs. A custom log table would require you to build the collection pipeline yourself.",
    difficulty: 2,
    reference: { label: "Windows Security Events via AMA", url: `${docs}/azure/sentinel/data-connectors/windows-security-events-via-ama` },
  },
  {
    id: "sc200-q3",
    domainId: "operations",
    type: "single",
    prompt:
      "In Microsoft Defender for Endpoint, you want a specific group of high-value servers to have alerts investigated automatically but never remediated without an analyst approving the action. What should you configure?",
    options: [
      { id: "a", text: "Set the device group's automation level to Full — remediate threats automatically" },
      { id: "b", text: "Set the device group's automation level to Semi — require approval for all remediation" },
      { id: "c", text: "Disable automated investigation for the device group" },
      { id: "d", text: "Add the servers to the exclusion list for attack surface reduction rules" },
    ],
    correct: ["b"],
    explanation:
      "Semi-automation levels run the automated investigation to completion but hold remediation actions in the Action center pending analyst approval. Full automation remediates without approval, disabling investigation removes the analysis entirely, and ASR exclusions are unrelated to investigation behaviour.",
    difficulty: 2,
    reference: { label: "Automation levels", url: `${docs}/defender-endpoint/automation-levels` },
  },
  {
    id: "sc200-q4",
    domainId: "operations",
    type: "multi",
    prompt:
      "Which two actions can a Microsoft Sentinel automation rule perform directly, without invoking a playbook? (Choose two.)",
    options: [
      { id: "a", text: "Change the severity of an incident" },
      { id: "b", text: "Assign an owner to an incident" },
      { id: "c", text: "Post an adaptive card to a Microsoft Teams channel" },
      { id: "d", text: "Isolate a device in Microsoft Defender for Endpoint" },
    ],
    correct: ["a", "b"],
    explanation:
      "Automation rules natively change incident properties such as severity, status, owner, and tags, and can suppress incidents. Actions that reach into other services — posting to Teams or isolating a device — require a playbook (Logic App), which an automation rule can call.",
    difficulty: 2,
    reference: { label: "Automation rules", url: `${docs}/azure/sentinel/automate-incident-handling-with-automation-rules` },
  },
  {
    id: "sc200-q13",
    domainId: "operations",
    type: "single",
    prompt:
      "You want to deploy an attack surface reduction rule that blocks Office applications from creating child processes, but you must first confirm it will not break a line-of-business macro. What should you do?",
    options: [
      { id: "a", text: "Set the rule to Audit mode and review the resulting events before switching to Block" },
      { id: "b", text: "Set the rule to Block and add the macro to the exclusion list pre-emptively" },
      { id: "c", text: "Set the rule to Warn so users can bypass it permanently" },
      { id: "d", text: "Enable the rule only on a test device group and leave it there" },
    ],
    correct: ["a"],
    explanation:
      "Audit mode records what the rule would have blocked without enforcing it, which is the standard way to measure impact before enforcement. Warn lets users unblock temporarily but is still enforcement, and blocking first risks the outage you are trying to avoid.",
    difficulty: 2,
    reference: { label: "Attack surface reduction rules deployment", url: `${docs}/defender-endpoint/attack-surface-reduction-rules-deployment` },
  },
  {
    id: "sc200-q14",
    domainId: "operations",
    type: "single",
    prompt:
      "A benign internal vulnerability scanner triggers dozens of Defender XDR alerts every night. You must stop those specific alerts being generated for that host without weakening detection elsewhere. What should you create?",
    options: [
      { id: "a", text: "An alert tuning (suppression) rule scoped to the scanner device and alert title" },
      { id: "b", text: "A device group with automation level set to no automated response" },
      { id: "c", text: "An indicator that allows the scanner's file hash" },
      { id: "d", text: "A global exclusion for the scanner's IP address in Defender Antivirus" },
    ],
    correct: ["a"],
    explanation:
      "Alert tuning lets you suppress or resolve alerts that match precise conditions such as device, alert title, or file, keeping the rest of the environment fully monitored. Changing automation levels does not stop alert generation, and antivirus exclusions address scanning rather than alerting.",
    difficulty: 2,
    reference: { label: "Alert tuning in Defender XDR", url: `${docs}/defender-xdr/investigate-alerts` },
  },
  {
    id: "sc200-q15",
    domainId: "operations",
    type: "single",
    prompt:
      "Which Microsoft Sentinel storage tier is designed for cost-effective retention of large volumes of security data for up to 12 years, queried with KQL and Python notebooks rather than powering real-time analytics?",
    options: [
      { id: "a", text: "The data lake tier" },
      { id: "b", text: "The analytics tier" },
      { id: "c", text: "The basic logs tier" },
      { id: "d", text: "The archive tier of a storage account" },
    ],
    correct: ["a"],
    explanation:
      "The Microsoft Sentinel data lake tier stores data in open Parquet format for long-term retention of up to 12 years and supports KQL exploration and Jupyter notebooks. The analytics tier is the high-performance tier that backs hunting, alerting, and incident management, and data in it is mirrored to the lake.",
    difficulty: 2,
    reference: { label: "Sentinel data lake overview", url: `${docs}/azure/sentinel/datalake/sentinel-lake-overview` },
  },
  {
    id: "sc200-q16",
    domainId: "operations",
    type: "single",
    prompt:
      "An investigation requires two-year-old firewall logs that currently sit only in the Microsoft Sentinel data lake tier, and you need them available to analytics rules and hunting for the next 30 days. What should you do?",
    options: [
      { id: "a", text: "Create a KQL job that promotes the required data from the data lake tier to the analytics tier" },
      { id: "b", text: "Re-ingest the logs from the original firewall appliance" },
      { id: "c", text: "Change the workspace retention setting to two years" },
      { id: "d", text: "Export the data to a storage account and import it as a watchlist" },
    ],
    correct: ["a"],
    explanation:
      "KQL jobs in the data lake run one-time or scheduled queries whose results are promoted into the analytics tier, making historical data available to the tools that only read that tier. Re-ingesting from source is rarely possible for old data, and retention settings do not retroactively move data between tiers.",
    difficulty: 3,
    reference: { label: "KQL and the Sentinel data lake", url: `${docs}/azure/sentinel/datalake/kql-overview` },
  },
  {
    id: "sc200-q17",
    domainId: "operations",
    type: "single",
    prompt:
      "High-volume network logs are expensive to keep in the analytics tier, but analysts still need daily aggregate counts per source IP for trend detection. Which Sentinel feature addresses this most directly?",
    options: [
      { id: "a", text: "Summary rules that aggregate verbose data into a compact summary table on a schedule" },
      { id: "b", text: "A workbook with a scheduled refresh" },
      { id: "c", text: "A watchlist populated from the logs" },
      { id: "d", text: "An automation rule that deletes old records" },
    ],
    correct: ["a"],
    explanation:
      "Summary rules run aggregation queries on a schedule and write compact results to a summary table, so you keep the analytical value of verbose logs at a fraction of the retention cost. Workbooks only visualize data that is already retained.",
    difficulty: 2,
    reference: { label: "Summary rules", url: `${docs}/azure/sentinel/summary-rules` },
  },
  {
    id: "sc200-q18",
    domainId: "operations",
    type: "single",
    prompt:
      "Which Microsoft Sentinel capability analyses your workspace and recommends actions such as adding missing detections or moving low-value tables to a cheaper tier?",
    options: [
      { id: "a", text: "SOC optimization recommendations" },
      { id: "b", text: "The MITRE ATT&CK coverage page" },
      { id: "c", text: "Entity behavior analytics" },
      { id: "d", text: "The Content hub" },
    ],
    correct: ["a"],
    explanation:
      "SOC optimization gives data-value and coverage recommendations tuned to your workspace, helping balance ingestion cost against detection coverage. The MITRE page shows technique coverage only, and Content hub is where you install solutions.",
    difficulty: 2,
    reference: { label: "SOC optimization", url: `${docs}/azure/sentinel/soc-optimization/soc-optimization-access` },
  },
  {
    id: "sc200-q19",
    domainId: "operations",
    type: "single",
    prompt:
      "A Linux web server farm must forward its syslog messages to Microsoft Sentinel. Which connector should you use?",
    options: [
      { id: "a", text: "Syslog via AMA" },
      { id: "b", text: "Windows Security Events via AMA" },
      { id: "c", text: "Microsoft Defender XDR connector" },
      { id: "d", text: "Azure Activity connector" },
    ],
    correct: ["a"],
    explanation:
      "Syslog via AMA collects standard syslog facilities from Linux machines using the Azure Monitor Agent and a data collection rule. CEF via AMA is the variant for appliances emitting Common Event Format, and the other connectors cover Windows events, Defender alerts, and Azure control-plane activity.",
    difficulty: 1,
    reference: { label: "Syslog and CEF via AMA", url: `${docs}/azure/sentinel/connect-cef-syslog-ama` },
  },
  {
    id: "sc200-q20",
    domainId: "operations",
    type: "single",
    prompt:
      "You must collect Windows security events from several hundred servers that cannot have an agent installed individually, using an existing collector infrastructure. Which approach fits?",
    options: [
      { id: "a", text: "Windows Event Forwarding to a collector server that runs the Azure Monitor Agent" },
      { id: "b", text: "Installing the Azure Monitor Agent on each server anyway" },
      { id: "c", text: "The Logs Ingestion API called from each server" },
      { id: "d", text: "Azure Policy with a diagnostic setting on each server" },
    ],
    correct: ["a"],
    explanation:
      "Windows Event Forwarding concentrates events onto collector servers, and only those collectors need the agent, which is the standard pattern where per-server agents are not viable. Diagnostic settings apply to Azure resources rather than in-guest Windows logs.",
    difficulty: 2,
    reference: { label: "Windows Event Forwarding", url: `${docs}/azure/sentinel/data-connectors/windows-forwarded-events` },
  },
  {
    id: "sc200-q21",
    domainId: "operations",
    type: "single",
    prompt:
      "You need Azure resource activity — who created, modified, or deleted resources — flowing into Microsoft Sentinel across every subscription, applied automatically to new subscriptions. What should you use?",
    options: [
      { id: "a", text: "The Azure Activity connector, deployed at scale using Azure Policy to configure diagnostic settings" },
      { id: "b", text: "The Windows Security Events via AMA connector" },
      { id: "c", text: "A summary rule over the AzureDiagnostics table" },
      { id: "d", text: "Microsoft Defender for Cloud continuous export only" },
    ],
    correct: ["a"],
    explanation:
      "Azure Activity is collected through diagnostic settings, and assigning an Azure Policy with a DeployIfNotExists effect at the management group scope ensures every current and future subscription is configured. Defender for Cloud export ships alerts and recommendations, not the full activity log.",
    difficulty: 2,
    reference: { label: "Azure Activity connector", url: `${docs}/azure/sentinel/data-connectors/azure-activity` },
  },
  {
    id: "sc200-q22",
    domainId: "operations",
    type: "single",
    prompt:
      "Your threat intelligence platform must push indicators of compromise into Microsoft Sentinel so analytics rules can match them against your telemetry. Which approach is appropriate?",
    options: [
      { id: "a", text: "Use a threat intelligence connector (TAXII or the upload API) and pair it with a Threat Intelligence analytics rule" },
      { id: "b", text: "Upload the indicators as a watchlist and rely on Fusion to use them" },
      { id: "c", text: "Add the indicators to a workbook parameter" },
      { id: "d", text: "Create a custom log table and query it manually each day" },
    ],
    correct: ["a"],
    explanation:
      "Sentinel ingests indicators through TAXII feeds or the upload indicators API into the threat intelligence store, and Threat Intelligence analytics rules automatically match them against your data to raise incidents. Watchlists hold reference data but do not drive TI-matching rules.",
    difficulty: 2,
    reference: { label: "Threat intelligence in Microsoft Sentinel", url: `${docs}/azure/sentinel/understand-threat-intelligence` },
  },
  {
    id: "sc200-q23",
    domainId: "operations",
    type: "single",
    prompt:
      "A bespoke internal application writes JSON audit records that no built-in connector understands. What is the supported way to get them into a Log Analytics workspace table?",
    options: [
      { id: "a", text: "Create a custom table and send records with the Logs Ingestion API through a data collection rule and endpoint" },
      { id: "b", text: "Rename the records to match an existing built-in table schema" },
      { id: "c", text: "Use the Syslog via AMA connector with a custom facility" },
      { id: "d", text: "Store them in a storage account and query with externaldata only" },
    ],
    correct: ["a"],
    explanation:
      "The Logs Ingestion API posts custom JSON to a data collection endpoint, where a data collection rule transforms it and writes it to a custom table you define. Forcing data into a built-in schema breaks the connector contract, and externaldata is a query-time convenience rather than ingestion.",
    difficulty: 3,
    reference: { label: "Logs Ingestion API", url: `${docs}/azure/azure-monitor/logs/logs-ingestion-api-overview` },
  },
  {
    id: "sc200-q24",
    domainId: "operations",
    type: "single",
    prompt:
      "You are converting an advanced hunting query into a custom detection rule in Microsoft Defender XDR. Which columns must the query return for the rule to be valid?",
    options: [
      { id: "a", text: "Timestamp, ReportId, and at least one entity identifier column such as DeviceId or AccountObjectId" },
      { id: "b", text: "Only Timestamp" },
      { id: "c", text: "AlertId and Severity" },
      { id: "d", text: "TenantId and SubscriptionId" },
    ],
    correct: ["a"],
    explanation:
      "Custom detection rules require Timestamp and ReportId so the alert can be anchored to a specific event, plus an entity column so the alert can be attributed to an impacted device, user, mailbox, or file — which is also what enables response actions.",
    difficulty: 2,
    reference: { label: "Create custom detection rules", url: `${docs}/defender-xdr/custom-detection-rules` },
  },
  {
    id: "sc200-q25",
    domainId: "operations",
    type: "single",
    prompt:
      "Which Microsoft Sentinel rule type creates incidents from alerts that Microsoft Defender for Cloud Apps has already raised, without you writing any KQL?",
    options: [
      { id: "a", text: "A Microsoft security analytics rule" },
      { id: "b", text: "A scheduled analytics rule" },
      { id: "c", text: "An anomaly rule" },
      { id: "d", text: "A summary rule" },
    ],
    correct: ["a"],
    explanation:
      "Microsoft security rules promote alerts generated by connected Microsoft security products into Sentinel incidents, with optional filtering by severity or alert name. Scheduled rules require your own query logic.",
    difficulty: 1,
    reference: { label: "Create incidents from Microsoft security alerts", url: `${docs}/azure/sentinel/create-incidents-from-alerts` },
  },
  {
    id: "sc200-q26",
    domainId: "operations",
    type: "single",
    prompt:
      "Why does entity mapping matter when you author a scheduled analytics rule in Microsoft Sentinel?",
    options: [
      { id: "a", text: "It binds query columns to entity types so incidents support investigation graphs, correlation, and grouping" },
      { id: "b", text: "It determines how often the rule runs" },
      { id: "c", text: "It sets the retention period of the resulting incident" },
      { id: "d", text: "It selects which workspace the rule queries" },
    ],
    correct: ["a"],
    explanation:
      "Entity mapping tells Sentinel which columns represent accounts, hosts, IPs, files, and so on. Without it, incidents carry no entities, so the investigation graph, entity pages, and alert grouping all lose their value.",
    difficulty: 2,
    reference: { label: "Map data fields to entities", url: `${docs}/azure/sentinel/map-data-fields-to-entities` },
  },
  {
    id: "sc200-q27",
    domainId: "operations",
    type: "single",
    prompt:
      "A playbook must isolate a device in Microsoft Defender for Endpoint when triggered by a Sentinel automation rule. What is the recommended way for the Logic App to authenticate?",
    options: [
      { id: "a", text: "A managed identity for the Logic App, granted the required Defender API permissions" },
      { id: "b", text: "A user account's credentials stored in the Logic App parameters" },
      { id: "c", text: "The Sentinel workspace key" },
      { id: "d", text: "An anonymous HTTP trigger" },
    ],
    correct: ["a"],
    explanation:
      "Using a managed identity means no credential is stored in the playbook and permissions are granted through role assignments and API permissions. Embedding user credentials creates a standing secret and ties automation to an individual's account.",
    difficulty: 2,
    reference: { label: "Authenticate playbooks to Microsoft Sentinel", url: `${docs}/azure/sentinel/authenticate-playbooks-to-sentinel` },
  },
  {
    id: "sc200-q28",
    domainId: "operations",
    type: "single",
    prompt:
      "Which statement about automatic attack disruption in Microsoft Defender XDR is correct?",
    options: [
      { id: "a", text: "It uses high-confidence signals to contain an attack in progress — for example disabling an account or isolating a device — before an analyst intervenes" },
      { id: "b", text: "It permanently deletes any file flagged by any alert" },
      { id: "c", text: "It requires an analyst to approve each containment action first" },
      { id: "d", text: "It only operates on Microsoft Sentinel incidents" },
    ],
    correct: ["a"],
    explanation:
      "Attack disruption acts automatically on very high-confidence detections of active attacks such as ransomware or business email compromise, containing the blast radius in real time, and surfaces the actions taken for analyst review and reversal.",
    difficulty: 2,
    reference: { label: "Automatic attack disruption", url: `${docs}/defender-xdr/automatic-attack-disruption` },
  },
  {
    id: "sc200-q29",
    domainId: "operations",
    type: "single",
    prompt:
      "Which Defender for Endpoint feature lets you collect additional forensic artifacts from devices by defining what should be gathered when an investigation runs?",
    options: [
      { id: "a", text: "Custom data collection settings, used alongside the investigation package" },
      { id: "b", text: "Attack surface reduction rules" },
      { id: "c", text: "Web content filtering" },
      { id: "d", text: "Network protection" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Endpoint advanced features include controls over what supplementary data is collected during investigations, complementing the standard investigation package. ASR, web filtering, and network protection are preventive controls rather than collection settings.",
    difficulty: 3,
    reference: { label: "Configure advanced features", url: `${docs}/defender-endpoint/advanced-features` },
  },
  {
    id: "sc200-q30",
    domainId: "operations",
    type: "single",
    prompt:
      "You want a specific SOC distribution list to receive an email whenever a high-severity incident is created in Microsoft Defender XDR. Where do you configure this?",
    options: [
      { id: "a", text: "Email notification rules in Defender XDR settings, filtered by severity" },
      { id: "b", text: "An Azure Monitor action group on the Log Analytics workspace" },
      { id: "c", text: "The device group configuration" },
      { id: "d", text: "A data collection rule" },
    ],
    correct: ["a"],
    explanation:
      "Defender XDR settings include email notification rules for incidents, actions, and threat analytics, with filters for severity and device group. Azure Monitor action groups serve Azure alerting, not Defender incident notifications.",
    difficulty: 1,
    reference: { label: "Configure email notifications", url: `${docs}/defender-xdr/m365d-notifications-incidents` },
  },
  {
    id: "sc200-q31",
    domainId: "operations",
    type: "single",
    prompt:
      "Which Microsoft Sentinel feature would you use to build an interactive dashboard showing sign-in failures by country over time for management reporting?",
    options: [
      { id: "a", text: "A workbook" },
      { id: "b", text: "A playbook" },
      { id: "c", text: "An analytics rule" },
      { id: "d", text: "A watchlist" },
    ],
    correct: ["a"],
    explanation:
      "Workbooks combine KQL queries with visualizations and parameters to produce interactive reports. Playbooks automate response, analytics rules detect, and watchlists store reference data.",
    difficulty: 1,
    reference: { label: "Visualize data with workbooks", url: `${docs}/azure/sentinel/monitor-your-data` },
  },
  {
    id: "sc200-q32",
    domainId: "operations",
    type: "single",
    prompt:
      "Microsoft Sentinel anomaly rules differ from scheduled analytics rules mainly because they:",
    options: [
      { id: "a", text: "Use built-in machine learning models with tunable thresholds and can be run in flighting mode before production" },
      { id: "b", text: "Cannot generate incidents under any circumstances" },
      { id: "c", text: "Only work on Microsoft first-party data" },
      { id: "d", text: "Require a data lake tier subscription" },
    ],
    correct: ["a"],
    explanation:
      "Anomaly rules ship with trained models whose parameters you can adjust, and you can run a customized copy in flighting alongside the production version to compare results before promoting it.",
    difficulty: 3,
    reference: { label: "Work with anomaly rules", url: `${docs}/azure/sentinel/work-with-anomaly-rules` },
  },
  {
    id: "sc200-q33",
    domainId: "operations",
    type: "multi",
    prompt:
      "Which two conditions must be true before a device group's automation level can act on a device in Microsoft Defender for Endpoint? (Choose two.)",
    options: [
      { id: "a", text: "The device must be onboarded to Defender for Endpoint" },
      { id: "b", text: "The device must match the device group's membership rule" },
      { id: "c", text: "The device must have a public IP address" },
      { id: "d", text: "The device must be joined to Microsoft Entra ID with a compliant status" },
    ],
    correct: ["a", "b"],
    explanation:
      "Automation applies to onboarded devices that fall into the group defined by its membership rule, and the group's automation level then governs remediation behaviour. Public addressing and compliance state are not prerequisites for automated investigation.",
    difficulty: 2,
    reference: { label: "Create and manage device groups", url: `${docs}/defender-endpoint/machine-groups` },
  },

  // ---------------------------------------------------------------- response
  {
    id: "sc200-q5",
    domainId: "response",
    type: "single",
    prompt:
      "A phishing email bypassed filtering and was delivered to 200 mailboxes. You must remove the message from all of those mailboxes. Which Microsoft Defender for Office 365 capability should you use?",
    options: [
      { id: "a", text: "Threat Explorer with a soft delete purge action" },
      { id: "b", text: "A mail flow rule that blocks the sender" },
      { id: "c", text: "Safe Links policy update" },
      { id: "d", text: "Content search in eDiscovery" },
    ],
    correct: ["a"],
    explanation:
      "Threat Explorer (or Advanced Hunting) lets you select the delivered messages and take action to soft delete or purge them from every mailbox, which is exactly the remediation required. Mail flow rules and Safe Links only affect future messages, and eDiscovery Content search locates content for investigation but is not the remediation path for mail removal.",
    difficulty: 2,
    reference: { label: "Threat hunting in Threat Explorer", url: `${docs}/defender-office-365/threat-explorer-threat-hunting` },
  },
  {
    id: "sc200-q6",
    domainId: "response",
    type: "single",
    prompt:
      "During an investigation you must collect forensic artifacts from a compromised Windows endpoint and run commands on it interactively from the Microsoft Defender portal. Which capability should you use?",
    options: [
      { id: "a", text: "Live response" },
      { id: "b", text: "Device isolation" },
      { id: "c", text: "Automated investigation and response" },
      { id: "d", text: "Advanced hunting" },
    ],
    correct: ["a"],
    explanation:
      "Live response gives an analyst a remote shell on the device to run commands, collect files, and execute scripts from the library. Isolation cuts network connectivity but gives no interactive access. AIR runs predefined playbooks automatically, and advanced hunting queries telemetry rather than touching the device.",
    difficulty: 1,
    reference: { label: "Investigate entities with live response", url: `${docs}/defender-endpoint/live-response` },
  },
  {
    id: "sc200-q7",
    domainId: "response",
    type: "single",
    prompt:
      "Microsoft Defender for Identity raises an alert indicating a Golden Ticket attack. Which action is the most appropriate immediate containment step?",
    options: [
      { id: "a", text: "Reset the krbtgt account password twice" },
      { id: "b", text: "Disable the affected user account only" },
      { id: "c", text: "Force a password reset for all domain administrators" },
      { id: "d", text: "Rebuild the domain controller from backup" },
    ],
    correct: ["a"],
    explanation:
      "A Golden Ticket is forged using the krbtgt account's hash, so any existing forged ticket remains valid until that key changes. Resetting krbtgt twice (allowing replication between resets) invalidates the forged tickets. Disabling a single user or resetting admin passwords does not revoke tickets already signed with the stolen key.",
    difficulty: 3,
    reference: { label: "Defender for Identity alerts", url: `${docs}/defender-for-identity/persistence-privilege-escalation-alerts` },
  },
  {
    id: "sc200-q8",
    domainId: "response",
    type: "single",
    prompt:
      "You need to determine who accessed and downloaded a specific SharePoint file over the past 90 days, including the client IP addresses. Which tool should you use?",
    options: [
      { id: "a", text: "Microsoft Purview Audit search" },
      { id: "b", text: "Activity explorer" },
      { id: "c", text: "Microsoft Defender for Cloud Apps file policy" },
      { id: "d", text: "Microsoft Sentinel workbook" },
    ],
    correct: ["a"],
    explanation:
      "Purview Audit records tenant-wide user and admin activity, including FileAccessed and FileDownloaded events with the acting user, timestamp, and client IP, and supports searching historical records. Activity explorer focuses on labelled-content activity, Defender for Cloud Apps file policies govern rather than retrospectively audit, and a Sentinel workbook only visualizes data already ingested.",
    difficulty: 2,
    reference: { label: "Search the audit log", url: `${docs}/purview/audit-search` },
  },
  {
    id: "sc200-q34",
    domainId: "response",
    type: "single",
    prompt:
      "An analyst must stop a compromised device communicating with attacker infrastructure while keeping the Defender for Endpoint agent connected so investigation can continue. Which action should they take?",
    options: [
      { id: "a", text: "Isolate the device, which blocks other network traffic but preserves the Defender service connection" },
      { id: "b", text: "Shut the device down remotely" },
      { id: "c", text: "Run a full antivirus scan" },
      { id: "d", text: "Remove the device from Microsoft Entra ID" },
    ],
    correct: ["a"],
    explanation:
      "Device isolation cuts general network connectivity while maintaining the channel to the Defender service, so live response and telemetry keep working. Shutting the device down destroys volatile evidence and ends the investigation.",
    difficulty: 2,
    reference: { label: "Response actions on a device", url: `${docs}/defender-endpoint/respond-machine-alerts` },
  },
  {
    id: "sc200-q35",
    domainId: "response",
    type: "single",
    prompt:
      "Which Defender for Endpoint action gathers a standard forensic bundle — running processes, network connections, autoruns, and event logs — for offline analysis?",
    options: [
      { id: "a", text: "Collect investigation package" },
      { id: "b", text: "Restrict app execution" },
      { id: "c", text: "Initiate automated investigation" },
      { id: "d", text: "Run antivirus scan" },
    ],
    correct: ["a"],
    explanation:
      "The investigation package is a downloadable archive of forensic artifacts captured at a point in time. Restrict app execution limits which binaries can run, and automated investigation analyses the alert rather than exporting evidence.",
    difficulty: 1,
    reference: { label: "Collect investigation package", url: `${docs}/defender-endpoint/respond-machine-alerts` },
  },
  {
    id: "sc200-q36",
    domainId: "response",
    type: "single",
    prompt:
      "Where do analysts review and approve remediation actions that an automated investigation has proposed but not yet executed?",
    options: [
      { id: "a", text: "The Action center" },
      { id: "b", text: "The Incidents queue" },
      { id: "c", text: "Advanced hunting" },
      { id: "d", text: "The Threat analytics report" },
    ],
    correct: ["a"],
    explanation:
      "The Action center lists pending and completed remediation actions across Defender XDR, where analysts approve, reject, or undo them. It is the natural companion to semi-automated device groups.",
    difficulty: 1,
    reference: { label: "Action center overview", url: `${docs}/defender-xdr/m365d-action-center` },
  },
  {
    id: "sc200-q37",
    domainId: "response",
    type: "single",
    prompt:
      "Microsoft Entra ID Protection flags a user as high risk after impossible-travel sign-ins. Which response both contains the account and allows the user to recover access themselves?",
    options: [
      { id: "a", text: "A Conditional Access policy requiring secure password change for high user risk" },
      { id: "b", text: "Permanently deleting the user account" },
      { id: "c", text: "Adding the user's device to an isolated device group" },
      { id: "d", text: "Suppressing the risk detection" },
    ],
    correct: ["a"],
    explanation:
      "A risk-based Conditional Access policy can force MFA and a secure password change, which invalidates the compromised credential and lets the legitimate user self-remediate, automatically clearing the risk state. Deleting the account is disproportionate, and suppression ignores a real signal.",
    difficulty: 2,
    reference: { label: "Remediate risks in ID Protection", url: `${docs}/entra/id-protection/howto-identity-protection-remediate-unblock` },
  },
  {
    id: "sc200-q38",
    domainId: "response",
    type: "single",
    prompt:
      "Which Microsoft Defender for Identity alert indicates that an attacker is replicating directory data from a domain controller, typically to extract password hashes?",
    options: [
      { id: "a", text: "Suspected DCSync attack (replication of directory services)" },
      { id: "b", text: "Suspected Golden Ticket usage" },
      { id: "c", text: "Suspected brute force attack" },
      { id: "d", text: "Suspected DCShadow attack (domain controller promotion)" },
    ],
    correct: ["a"],
    explanation:
      "DCSync abuses directory replication permissions to pull password data from a domain controller as if it were another DC. DCShadow, by contrast, registers a rogue domain controller to inject changes.",
    difficulty: 2,
    reference: { label: "Credential access alerts", url: `${docs}/defender-for-identity/credential-access-alerts` },
  },
  {
    id: "sc200-q39",
    domainId: "response",
    type: "single",
    prompt:
      "You must prevent users from downloading sensitive files to unmanaged devices during an active session in a cloud app, without blocking the app entirely. What should you configure?",
    options: [
      { id: "a", text: "A Microsoft Defender for Cloud Apps session policy using Conditional Access App Control" },
      { id: "b", text: "A Defender for Cloud Apps file policy" },
      { id: "c", text: "An anomaly detection policy" },
      { id: "d", text: "A Defender for Endpoint indicator" },
    ],
    correct: ["a"],
    explanation:
      "Session policies proxy the user's session through Conditional Access App Control, allowing real-time controls such as blocking download, cut/copy, or print on unmanaged devices. File policies scan content at rest and act afterwards rather than in-session.",
    difficulty: 3,
    reference: { label: "Session policies", url: `${docs}/defender-cloud-apps/session-policy-aad` },
  },
  {
    id: "sc200-q40",
    domainId: "response",
    type: "single",
    prompt:
      "Which Microsoft Defender XDR capability groups related alerts across email, identity, endpoint, and cloud apps into a single investigation with a shared attack story?",
    options: [
      { id: "a", text: "Incident correlation" },
      { id: "b", text: "Alert tuning" },
      { id: "c", text: "Threat analytics" },
      { id: "d", text: "Secure score" },
    ],
    correct: ["a"],
    explanation:
      "Defender XDR correlates alerts sharing entities and timelines into one incident, so a multistage attack appears as a single case rather than dozens of disconnected alerts. Analysts can also merge or unmerge incidents manually.",
    difficulty: 1,
    reference: { label: "Incidents in Defender XDR", url: `${docs}/defender-xdr/incidents-overview` },
  },
  {
    id: "sc200-q41",
    domainId: "response",
    type: "single",
    prompt:
      "Your SOC needs to track investigation tasks, evidence, and collaborator notes for a long-running breach investigation inside the Defender portal. Which capability supports this?",
    options: [
      { id: "a", text: "Case management" },
      { id: "b", text: "Hunting bookmarks only" },
      { id: "c", text: "Threat analytics reports" },
      { id: "d", text: "Device inventory tags" },
    ],
    correct: ["a"],
    explanation:
      "Case management lets teams group incidents and evidence into a case with tasks, assignments, and an audit trail — designed for investigations that outlive a single incident. Bookmarks capture individual hunting findings but provide no workflow.",
    difficulty: 2,
    reference: { label: "Case management", url: `${docs}/unified-secops-platform/cases-overview` },
  },
  {
    id: "sc200-q42",
    domainId: "response",
    type: "single",
    prompt:
      "How does embedded Microsoft Security Copilot most directly help an analyst triaging a Defender XDR incident?",
    options: [
      { id: "a", text: "It summarises the incident, explains scripts and artifacts in natural language, and suggests response steps" },
      { id: "b", text: "It replaces the need for analytics rules" },
      { id: "c", text: "It automatically closes low-severity incidents without review" },
      { id: "d", text: "It provides long-term log retention" },
    ],
    correct: ["a"],
    explanation:
      "Security Copilot embedded in the Defender portal produces incident summaries, decodes obfuscated scripts and command lines, and recommends next actions — accelerating triage rather than replacing detection engineering or storage.",
    difficulty: 2,
    reference: { label: "Security Copilot in Defender XDR", url: `${docs}/defender-xdr/security-copilot-in-microsoft-365-defender` },
  },
  {
    id: "sc200-q43",
    domainId: "response",
    type: "single",
    prompt:
      "Which Microsoft Purview Audit capability is required to investigate exactly which messages an attacker read in a compromised mailbox?",
    options: [
      { id: "a", text: "Audit (Premium), which records the MailItemsAccessed event" },
      { id: "b", text: "Audit (Standard), which records MailItemsAccessed by default" },
      { id: "c", text: "Content search in eDiscovery" },
      { id: "d", text: "Activity explorer" },
    ],
    correct: ["a"],
    explanation:
      "MailItemsAccessed is a high-value Audit (Premium) event that logs mailbox item access, which is precisely what breach scoping needs. Content search finds content but does not tell you who read what and when.",
    difficulty: 3,
    reference: { label: "Audit (Premium)", url: `${docs}/purview/audit-premium` },
  },
  {
    id: "sc200-q44",
    domainId: "response",
    type: "single",
    prompt:
      "Which data source records every API call an application made against Microsoft Graph on behalf of a user or itself, useful for investigating token abuse?",
    options: [
      { id: "a", text: "Microsoft Graph activity logs" },
      { id: "b", text: "Microsoft Entra sign-in logs only" },
      { id: "c", text: "Azure Activity log" },
      { id: "d", text: "Defender for Endpoint device timeline" },
    ],
    correct: ["a"],
    explanation:
      "Graph activity logs capture the individual Graph API requests made with a token, letting investigators see what an attacker actually did after obtaining access. Sign-in logs show the authentication event but not subsequent API activity.",
    difficulty: 3,
    reference: { label: "Microsoft Graph activity logs", url: `${docs}/graph/microsoft-graph-activity-logs-overview` },
  },
  {
    id: "sc200-q45",
    domainId: "response",
    type: "single",
    prompt:
      "You must block a specific malicious file across the estate immediately, based on its hash. What should you create in Microsoft Defender XDR?",
    options: [
      { id: "a", text: "An indicator of compromise with a block action for the file hash" },
      { id: "b", text: "An attack surface reduction rule" },
      { id: "c", text: "A custom detection rule with no response action" },
      { id: "d", text: "A device group" },
    ],
    correct: ["a"],
    explanation:
      "Indicators let you allow or block files, IPs, URLs, and certificates across onboarded devices, taking effect quickly. A custom detection rule alerts on the activity but without a response action does not block it.",
    difficulty: 1,
    reference: { label: "Manage indicators", url: `${docs}/defender-endpoint/manage-indicators` },
  },
  {
    id: "sc200-q46",
    domainId: "response",
    type: "single",
    prompt:
      "Microsoft Defender for Cloud raises an alert that a virtual machine is communicating with a known cryptomining pool. Which Defender plan generated this workload protection alert?",
    options: [
      { id: "a", text: "Microsoft Defender for Servers" },
      { id: "b", text: "Microsoft Defender for Office 365" },
      { id: "c", text: "Microsoft Defender for Identity" },
      { id: "d", text: "Microsoft Defender for Cloud Apps" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Servers provides threat detection for virtual machines, including malicious network activity and cryptomining behaviour, surfaced in Defender for Cloud and correlated into Defender XDR incidents.",
    difficulty: 1,
    reference: { label: "Defender for Servers", url: `${docs}/azure/defender-for-cloud/defender-for-servers-introduction` },
  },
  {
    id: "sc200-q47",
    domainId: "response",
    type: "multi",
    prompt:
      "Which two steps are appropriate when closing a Defender XDR incident that turned out to be authorised penetration testing? (Choose two.)",
    options: [
      { id: "a", text: "Classify the incident as a true positive with the appropriate determination such as security testing" },
      { id: "b", text: "Create a tuning rule so identical future activity from the test range is suppressed" },
      { id: "c", text: "Delete the incident and its alerts permanently" },
      { id: "d", text: "Disable all analytics rules that contributed to the incident" },
    ],
    correct: ["a", "b"],
    explanation:
      "Accurate classification feeds Microsoft's detection quality and your own metrics, and scoped tuning prevents repeat noise from the known test source. Deleting evidence and disabling whole rules would destroy the audit trail and create blind spots.",
    difficulty: 2,
    reference: { label: "Manage incidents", url: `${docs}/defender-xdr/manage-incidents` },
  },

  // ----------------------------------------------------------------- hunting
  {
    id: "sc200-q9",
    domainId: "hunting",
    type: "single",
    prompt:
      "In Microsoft Defender XDR advanced hunting, which table should you query to find process creation events on onboarded endpoints?",
    options: [
      { id: "a", text: "DeviceProcessEvents" },
      { id: "b", text: "DeviceEvents" },
      { id: "c", text: "DeviceNetworkEvents" },
      { id: "d", text: "DeviceLogonEvents" },
    ],
    correct: ["a"],
    explanation:
      "DeviceProcessEvents contains process creation telemetry, including FileName, ProcessCommandLine, and InitiatingProcessFileName. DeviceEvents is a catch-all for miscellaneous event types, DeviceNetworkEvents covers connections, and DeviceLogonEvents covers sign-in activity.",
    difficulty: 1,
    reference: { label: "Advanced hunting schema", url: `${docs}/defender-xdr/advanced-hunting-schema-tables` },
  },
  {
    id: "sc200-q10",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which KQL operator should you use to return only the first row for each distinct DeviceId, ordered by the most recent Timestamp?",
    options: [
      { id: "a", text: "summarize arg_max(Timestamp, *) by DeviceId" },
      { id: "b", text: "distinct DeviceId, Timestamp" },
      { id: "c", text: "top 1 by Timestamp desc" },
      { id: "d", text: "project DeviceId, Timestamp | take 1" },
    ],
    correct: ["a"],
    explanation:
      "arg_max(Timestamp, *) inside summarize returns the full row holding the maximum Timestamp for each grouping key, which is exactly one latest row per DeviceId. distinct returns unique combinations rather than latest rows, and both top and take limit the whole result set to a single row overall.",
    difficulty: 3,
    reference: { label: "KQL quick reference", url: `${docs}/azure/data-explorer/kql-quick-reference` },
  },
  {
    id: "sc200-q11",
    domainId: "hunting",
    type: "single",
    prompt:
      "You want to measure how well your current Sentinel analytics rules cover adversary techniques and identify gaps. Which Sentinel feature should you use?",
    options: [
      { id: "a", text: "The MITRE ATT&CK page" },
      { id: "b", text: "The Threat intelligence page" },
      { id: "c", text: "The Entity behavior page" },
      { id: "d", text: "The Watchlist page" },
    ],
    correct: ["a"],
    explanation:
      "Sentinel's MITRE ATT&CK page maps your active analytics rules and hunting queries onto the ATT&CK matrix so you can see which tactics and techniques have detection coverage and which do not. Threat intelligence manages indicators, entity behavior surfaces UEBA insights, and watchlists store reference data.",
    difficulty: 2,
    reference: { label: "MITRE ATT&CK coverage", url: `${docs}/azure/sentinel/mitre-coverage` },
  },
  {
    id: "sc200-q12",
    domainId: "hunting",
    type: "multi",
    prompt:
      "Which two statements about custom detection rules in Microsoft Defender XDR are correct? (Choose two.)",
    options: [
      { id: "a", text: "They are created from an advanced hunting query that returns specific required columns" },
      { id: "b", text: "They can trigger response actions such as isolating a device or quarantining a file" },
      { id: "c", text: "They run only against data in Microsoft Sentinel workspaces" },
      { id: "d", text: "They can run at most once per day" },
    ],
    correct: ["a", "b"],
    explanation:
      "A custom detection rule is built from an advanced hunting query that must return Timestamp, ReportId, and an entity identifier column so alerts can be attributed. Such rules can also take automated response actions on affected devices, files, and users. They operate on Defender XDR data and support frequencies far more often than daily.",
    difficulty: 2,
    reference: { label: "Custom detection rules", url: `${docs}/defender-xdr/custom-detection-rules` },
  },
  {
    id: "sc200-q48",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which advanced hunting table would you query to find all messages that delivered a particular attachment hash to your organisation?",
    options: [
      { id: "a", text: "EmailAttachmentInfo, joined to EmailEvents on NetworkMessageId" },
      { id: "b", text: "DeviceFileEvents" },
      { id: "c", text: "CloudAppEvents" },
      { id: "d", text: "IdentityDirectoryEvents" },
    ],
    correct: ["a"],
    explanation:
      "EmailAttachmentInfo holds attachment metadata including file hashes, and joining it to EmailEvents on NetworkMessageId gives sender, recipient, and delivery outcome. DeviceFileEvents would only show the file once it reached an endpoint.",
    difficulty: 2,
    reference: { label: "EmailAttachmentInfo table", url: `${docs}/defender-xdr/advanced-hunting-emailattachmentinfo-table` },
  },
  {
    id: "sc200-q49",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which advanced hunting table records activities performed in cloud applications monitored by Microsoft Defender for Cloud Apps?",
    options: [
      { id: "a", text: "CloudAppEvents" },
      { id: "b", text: "DeviceEvents" },
      { id: "c", text: "AlertEvidence" },
      { id: "d", text: "UrlClickEvents" },
    ],
    correct: ["a"],
    explanation:
      "CloudAppEvents contains activity from connected SaaS applications, including the acting account, IP, and activity type. AlertEvidence links entities to alerts, and UrlClickEvents records Safe Links click-throughs.",
    difficulty: 2,
    reference: { label: "CloudAppEvents table", url: `${docs}/defender-xdr/advanced-hunting-cloudappevents-table` },
  },
  {
    id: "sc200-q50",
    domainId: "hunting",
    type: "single",
    prompt:
      "You need to correlate sign-in events with subsequent process executions on the same device within five minutes. Which KQL construct is most appropriate?",
    options: [
      { id: "a", text: "A join between the two tables on DeviceId, with a timestamp difference filter" },
      { id: "b", text: "A union of the two tables" },
      { id: "c", text: "A distinct on DeviceId" },
      { id: "d", text: "A render timechart" },
    ],
    correct: ["a"],
    explanation:
      "Joining on the shared key and then filtering on the time delta correlates related events across tables. A union stacks rows without relating them, and distinct or render address deduplication and visualization instead.",
    difficulty: 3,
    reference: { label: "KQL join operator", url: `${docs}/kusto/query/join-operator` },
  },
  {
    id: "sc200-q51",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which KQL function groups a timestamp column into fixed intervals so you can chart event counts per hour?",
    options: [
      { id: "a", text: "bin(Timestamp, 1h)" },
      { id: "b", text: "ago(1h)" },
      { id: "c", text: "now()" },
      { id: "d", text: "todatetime(Timestamp)" },
    ],
    correct: ["a"],
    explanation:
      "bin() rounds values down to a multiple of the given bin size, which is how you bucket time series for summarize and render. ago() produces a relative time for filtering, and the others convert or return the current time.",
    difficulty: 1,
    reference: { label: "bin() function", url: `${docs}/kusto/query/bin-function` },
  },
  {
    id: "sc200-q52",
    domainId: "hunting",
    type: "single",
    prompt:
      "During a hunt you find a suspicious command line and want to preserve it, with its entity context, so it can be attached to an investigation later. What should you create?",
    options: [
      { id: "a", text: "A hunting bookmark" },
      { id: "b", text: "A watchlist entry" },
      { id: "c", text: "A workbook tile" },
      { id: "d", text: "A summary rule" },
    ],
    correct: ["a"],
    explanation:
      "Bookmarks save query results with their entities and notes so findings survive the session and can be promoted to an incident or added to an existing one. Watchlists hold reference data rather than findings.",
    difficulty: 1,
    reference: { label: "Keep track of data with bookmarks", url: `${docs}/azure/sentinel/bookmarks` },
  },
  {
    id: "sc200-q53",
    domainId: "hunting",
    type: "single",
    prompt:
      "What does a hunting graph showing blast radius help an analyst determine?",
    options: [
      { id: "a", text: "Which additional assets and identities a compromised entity could reach, revealing potential lateral movement paths" },
      { id: "b", text: "The financial cost of an incident" },
      { id: "c", text: "The retention period of the underlying data" },
      { id: "d", text: "Which analytics rules are disabled" },
    ],
    correct: ["a"],
    explanation:
      "Blast radius analysis traverses relationships from a compromised entity to show what else is reachable, helping prioritise containment. It is about exposure and lateral movement potential rather than cost or configuration.",
    difficulty: 2,
    reference: { label: "Hunting graphs", url: `${docs}/defender-xdr/advanced-hunting-overview` },
  },
  {
    id: "sc200-q54",
    domainId: "hunting",
    type: "single",
    prompt:
      "Sentinel Graph is primarily used by analysts to:",
    options: [
      { id: "a", text: "Explore relationships between entities such as users, devices, and resources to trace attack paths" },
      { id: "b", text: "Render bar charts of alert volume" },
      { id: "c", text: "Manage data connector health" },
      { id: "d", text: "Configure retention tiers" },
    ],
    correct: ["a"],
    explanation:
      "Sentinel Graph models entities and their relationships so analysts can traverse how an attacker could move between identities, devices, and cloud resources, rather than reading isolated event rows.",
    difficulty: 2,
    reference: { label: "Sentinel Graph", url: `${docs}/azure/sentinel/datalake/sentinel-graph-overview` },
  },
  {
    id: "sc200-q55",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which environment lets you run Python libraries and machine learning models against Microsoft Sentinel data lake content for deep forensic analysis?",
    options: [
      { id: "a", text: "Jupyter notebooks in the data lake" },
      { id: "b", text: "Workbooks" },
      { id: "c", text: "Playbooks" },
      { id: "d", text: "The KQL query editor only" },
    ],
    correct: ["a"],
    explanation:
      "Notebooks bring Python and its data science ecosystem to Sentinel data, supporting machine learning, rich visualisation, and scheduled runs that can summarise or promote data. Workbooks are KQL-driven dashboards and cannot run arbitrary Python.",
    difficulty: 2,
    reference: { label: "Notebooks in the Sentinel data lake", url: `${docs}/azure/sentinel/datalake/notebooks-overview` },
  },
  {
    id: "sc200-q56",
    domainId: "hunting",
    type: "single",
    prompt:
      "What does the Microsoft Sentinel MCP server enable for threat hunting?",
    options: [
      { id: "a", text: "It exposes Sentinel data and capabilities to AI agents and development tools through the Model Context Protocol" },
      { id: "b", text: "It replaces data connectors for log ingestion" },
      { id: "c", text: "It provides physical infrastructure for the data lake" },
      { id: "d", text: "It is a managed certificate provider" },
    ],
    correct: ["a"],
    explanation:
      "The MCP server lets AI agents and tooling query Sentinel context in a structured way, so hunting workflows and notebooks can be driven by agents. It complements rather than replaces ingestion.",
    difficulty: 3,
    reference: { label: "Sentinel MCP server", url: `${docs}/azure/sentinel/datalake/sentinel-mcp-overview` },
  },
  {
    id: "sc200-q57",
    domainId: "hunting",
    type: "single",
    prompt:
      "A threat analytics report in Microsoft Defender XDR tells an analyst which of the following?",
    options: [
      { id: "a", text: "Whether the organisation is exposed or has been impacted by a tracked campaign, with recommended mitigations" },
      { id: "b", text: "The current secure score of Azure subscriptions" },
      { id: "c", text: "Which users hold privileged Entra roles" },
      { id: "d", text: "The retention configuration of the workspace" },
    ],
    correct: ["a"],
    explanation:
      "Threat analytics is Microsoft's in-product threat intelligence, correlating tracked actors and campaigns against your own telemetry to show impacted assets, exposure from misconfiguration, and recommended actions.",
    difficulty: 2,
    reference: { label: "Threat analytics", url: `${docs}/defender-xdr/threat-analytics` },
  },
  {
    id: "sc200-q58",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which KQL operator would you use to reduce a large result set to the 10 devices with the highest event counts?",
    options: [
      { id: "a", text: "summarize count() by DeviceName | top 10 by count_ desc" },
      { id: "b", text: "take 10" },
      { id: "c", text: "limit 10 by DeviceName" },
      { id: "d", text: "distinct DeviceName | take 10" },
    ],
    correct: ["a"],
    explanation:
      "Aggregating first with summarize and then selecting the highest counts with top gives a deterministic ranked answer. take and limit return an arbitrary sample with no ordering guarantee.",
    difficulty: 2,
    reference: { label: "top operator", url: `${docs}/kusto/query/top-operator` },
  },
  {
    id: "sc200-q59",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which advanced hunting table would you use to investigate changes made to Microsoft Entra ID objects, such as a user being added to a privileged group?",
    options: [
      { id: "a", text: "IdentityDirectoryEvents" },
      { id: "b", text: "IdentityLogonEvents" },
      { id: "c", text: "DeviceLogonEvents" },
      { id: "d", text: "AlertInfo" },
    ],
    correct: ["a"],
    explanation:
      "IdentityDirectoryEvents captures directory changes and domain controller activity monitored by Defender for Identity, including group membership modifications. IdentityLogonEvents records authentication events instead.",
    difficulty: 2,
    reference: { label: "IdentityDirectoryEvents table", url: `${docs}/defender-xdr/advanced-hunting-identitydirectoryevents-table` },
  },
  {
    id: "sc200-q60",
    domainId: "hunting",
    type: "multi",
    prompt:
      "Which two practices make a hunting query suitable for promotion into a scheduled analytics rule? (Choose two.)",
    options: [
      { id: "a", text: "It returns a bounded, low-volume result set rather than thousands of rows per run" },
      { id: "b", text: "It maps output columns to entities so incidents carry investigable context" },
      { id: "c", text: "It uses a very wide unbounded time range on every execution" },
      { id: "d", text: "It relies on take to sample results randomly" },
    ],
    correct: ["a", "b"],
    explanation:
      "Detection rules must be selective enough to avoid alert fatigue and must map entities so analysts can pivot from the incident. Unbounded time ranges make each run expensive and duplicate alerts, and random sampling makes detection non-deterministic.",
    difficulty: 3,
    reference: { label: "Create scheduled analytics rules", url: `${docs}/azure/sentinel/detect-threats-custom` },
  },
];
