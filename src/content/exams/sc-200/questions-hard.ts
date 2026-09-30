import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/**
 * Harder, exam-style SC-200 questions: KQL semantics with plausible wrong answers,
 * limits and licence traps, multi-requirement scenarios, and the Yes/No, ordering and
 * "same goal, different solution" formats. Behaviour was checked on Microsoft Learn.
 */
export const sc200HardQuestions: Question[] = [
  // --------------------------------------------------------------- KQL
  {
    id: "sc200-h1",
    domainId: "hunting",
    type: "single",
    prompt:
      "A hunter on a very large workspace writes this query and finds it slow:\n\nlet FailedUsers = SigninLogs\n| where TimeGenerated > ago(1d) and ResultType != '0'\n| summarize Failures = count() by UserPrincipalName;\nFailedUsers\n| where Failures > 10\n| join kind=inner (FailedUsers | where Failures > 100) on UserPrincipalName\n\nWhich statement about the let variable is correct?",
    options: [
      { id: "a", text: "FailedUsers is evaluated once when declared, so materialize() would change nothing" },
      { id: "b", text: "The name is bound to the calculation, so each reference re-runs it, and materialize() evaluates it once" },
      { id: "c", text: "let copies the rows into memory at declaration, so the slowness must come from the join alone" },
      { id: "d", text: "A let variable is only evaluated inside a where clause, never inside a join operand" },
    ],
    correct: ["b"],
    explanation:
      "A let statement binds a name to a calculation, not to its evaluated value, so every reference can run the subquery again. Wrapping it in materialize() evaluates it once and caches the result for reuse, which suits a subquery referenced twice.",
    difficulty: 3,
    reference: { label: "let statement", url: `${docs}/kusto/query/let-statement` },
  },
  {
    id: "sc200-h2",
    domainId: "hunting",
    type: "single",
    prompt:
      "A workbook query classifies alerts with:\n\nextend Level = case(Score > 80, 'critical', Score > 50, 'high', Score > 20, 'medium', 'low')\n\nWhat Level does a row with Score = 85 receive, and why?",
    options: [
      { id: "a", text: "critical, because case returns the result of the first predicate that is true" },
      { id: "b", text: "high, because case picks the most specific range that contains the score" },
      { id: "c", text: "medium, because case picks the last predicate that is satisfied by the score" },
      { id: "d", text: "An array of critical, high and medium, because all matching predicates are returned" },
    ],
    correct: ["a"],
    explanation:
      "case evaluates the predicates in order and returns the result for the first one that is satisfied, so order matters. A score of 85 is greater than 80 and returns critical. If the ranges were listed lowest first, every score above 20 would be labelled medium.",
    difficulty: 2,
    reference: { label: "case() function", url: `${docs}/kusto/query/case-function` },
  },
  {
    id: "sc200-h3",
    domainId: "hunting",
    type: "single",
    prompt:
      "For one sign-in row, DisplayName is an empty string and UserPrincipalName is 'a.smith@contoso.com'. What does coalesce(DisplayName, UserPrincipalName, 'unknown') return for that row?",
    options: [
      { id: "a", text: "An empty string, because DisplayName is not null" },
      { id: "b", text: "unknown, because the first two values are both considered missing" },
      { id: "c", text: "a.smith@contoso.com, because empty strings are skipped as well as nulls" },
      { id: "d", text: "An error, because the arguments have mixed null and empty states" },
    ],
    correct: ["c"],
    explanation:
      "coalesce returns the first non-null expression, or the first non-empty one for strings, so the empty DisplayName is skipped and the UPN is returned. This is a common way to build a display value without having to test for both null and empty.",
    difficulty: 3,
    reference: { label: "coalesce() function", url: `${docs}/kusto/query/coalesce-function` },
  },
  {
    id: "sc200-h4",
    domainId: "hunting",
    type: "single",
    prompt:
      "You need every row where the Department string column is missing, meaning either null or an empty string. Which filter returns both kinds of missing value?",
    options: [
      { id: "a", text: "where isnull(Department)" },
      { id: "b", text: "where Department == ''" },
      { id: "c", text: "where isempty(Department)" },
      { id: "d", text: "where isnotempty(Department)" },
    ],
    correct: ["c"],
    explanation:
      "isempty returns true for an empty string and for null. isnull would miss rows containing an empty string, comparing to '' would miss nulls, and isnotempty returns the opposite set.",
    difficulty: 2,
    reference: { label: "isempty() function", url: `${docs}/kusto/query/isempty-function` },
  },
  {
    id: "sc200-h5",
    domainId: "hunting",
    type: "single",
    prompt:
      "A SOC metrics query calculates time to triage:\n\nSecurityIncident\n| extend TriageMinutes = datetime_diff('minute', CreatedTime, FirstModifiedTime)\n\nEvery result is negative, although the incidents were triaged after creation. What is wrong?",
    options: [
      { id: "a", text: "The minute period must be replaced with second, because minutes cannot be negative" },
      { id: "b", text: "The arguments are reversed, because datetime_diff subtracts the second datetime from the first" },
      { id: "c", text: "CreatedTime holds local time and FirstModifiedTime holds UTC, so the sign flips" },
      { id: "d", text: "datetime_diff always returns negative values when it is used inside extend" },
    ],
    correct: ["b"],
    explanation:
      "datetime_diff(period, datetime1, datetime2) returns datetime1 minus datetime2, so the later time must come first. Here the earlier CreatedTime is first, giving negative values. Swap the two arguments to get positive minutes.",
    difficulty: 3,
    reference: { label: "datetime_diff() function", url: `${docs}/kusto/query/datetime-diff-function` },
  },
  {
    id: "sc200-h6",
    domainId: "hunting",
    type: "single",
    prompt:
      "You must list the devices in DeviceInfo that have never produced an AntivirusReport event in DeviceEvents during the period. Which query is correct?",
    options: [
      { id: "a", text: "DeviceInfo | join kind=leftsemi (DeviceEvents | where ActionType == 'AntivirusReport') on DeviceId" },
      { id: "b", text: "DeviceInfo | join kind=leftouter (DeviceEvents | where ActionType == 'AntivirusReport') on DeviceId" },
      { id: "c", text: "DeviceInfo | join kind=leftanti (DeviceEvents | where ActionType == 'AntivirusReport') on DeviceId" },
      { id: "d", text: "DeviceInfo | join kind=inner (DeviceEvents | where ActionType != 'AntivirusReport') on DeviceId" },
    ],
    correct: ["c"],
    explanation:
      "leftanti returns the left-side rows that have no match on the right, which is exactly the devices without an antivirus event. leftsemi returns the ones that do have a match, leftouter returns every device, and joining to the non-AV events only finds devices that had some other event.",
    difficulty: 3,
    reference: { label: "join operator", url: `${docs}/kusto/query/join-operator` },
  },
  {
    id: "sc200-h7",
    domainId: "operations",
    type: "single",
    prompt:
      "You save a Microsoft Sentinel scheduled analytics rule whose query begins with search * | where TimeGenerated > ago(1h) and the rule is rejected. What is the cause and the correct fix?",
    options: [
      { id: "a", text: "Rule queries cannot contain search *, so name the tables and use where" },
      { id: "b", text: "The query is shorter than the minimum length, so pad it with a let statement" },
      { id: "c", text: "Rule queries cannot filter on TimeGenerated, so set the lookback instead" },
      { id: "d", text: "search only works in hunting queries, so save it as a bookmark instead" },
    ],
    correct: ["a"],
    explanation:
      "A scheduled rule query must be between 1 and 10,000 characters and can't contain search *. Search across all tables is also slow, so the fix is to name the tables you need and filter with where. Filtering on TimeGenerated is allowed.",
    difficulty: 3,
    reference: { label: "Scheduled analytics rules in Microsoft Sentinel", url: `${docs}/azure/sentinel/scheduled-rules-overview` },
  },
  {
    id: "sc200-h8",
    domainId: "hunting",
    type: "single",
    prompt:
      "A workbook timechart of failed sign-ins per hour shows gaps where no failures happened. You want those hours plotted as zero. Which operator produces a continuous series?",
    options: [
      { id: "a", text: "summarize count() by bin(TimeGenerated, 1h), which emits a row for every hour" },
      { id: "b", text: "make-series count() default=0 on TimeGenerated step 1h" },
      { id: "c", text: "extend and coalesce, which add missing hours after the data is aggregated" },
      { id: "d", text: "render timechart with kind=default, which fills any absent bins" },
    ],
    correct: ["b"],
    explanation:
      "summarize by bin only produces rows for bins that contain data, so empty hours are missing. make-series creates a continuous series over the axis with a default value for absent bins, and the default is 0.",
    difficulty: 3,
    reference: { label: "make-series operator", url: `${docs}/kusto/query/make-series-operator` },
  },
  {
    id: "sc200-h9",
    domainId: "hunting",
    type: "multi",
    prompt:
      "Your Defender advanced hunting queries are hitting CPU quotas and timing out in a large tenant. Which two practices does Microsoft recommend? (Choose two.)",
    options: [
      { id: "a", text: "Size an unfamiliar query with count first, then use take or limit while developing" },
      { id: "b", text: "Use search * to find events, because it scans every table in the schema at once" },
      { id: "c", text: "Specify kind=inner on joins to avoid the default flavour's left-side deduplication" },
      { id: "d", text: "Remove all time filters so that the service can use cached results for repeated queries" },
    ],
    correct: ["a", "c"],
    explanation:
      "Counting first and limiting results while developing keeps queries cheap, and specifying kind=inner avoids the default innerunique flavour, which deduplicates the left side. search across all tables can exceed query size limits, and dropping time filters increases the data scanned.",
    difficulty: 3,
    reference: { label: "Advanced hunting query best practices", url: `${docs}/defender-xdr/advanced-hunting-best-practices` },
  },
  {
    id: "sc200-h10",
    domainId: "operations",
    type: "statements",
    scenario: "You are configuring a scheduled analytics rule in Microsoft Sentinel.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The query frequency and the lookback period can each be set anywhere from 5 minutes to 14 days.", correct: true },
      { id: "b", text: "The rule accepts a frequency of 1 hour with a lookback period of 30 minutes.", correct: false },
      { id: "c", text: "A frequency shorter than the lookback period makes the query windows overlap and can duplicate results.", correct: true },
      { id: "d", text: "The query text can be up to 100,000 characters long if it avoids user-defined functions.", correct: false },
    ],
    correct: ["a", "c"],
    explanation:
      "Frequency and lookback both range from 5 minutes to 14 days, and validation does not allow a frequency longer than the lookback because events would be skipped. A shorter frequency overlaps windows, which is acceptable but can duplicate results. The query must be 1 to 10,000 characters, and functions help stay under that limit.",
    difficulty: 3,
    reference: { label: "Scheduled analytics rules in Microsoft Sentinel", url: `${docs}/azure/sentinel/scheduled-rules-overview` },
  },
  {
    id: "sc200-h11",
    domainId: "operations",
    type: "single",
    prompt:
      "You want a custom detection rule in Microsoft Defender XDR that alerts on accounts with many failed sign-ins. The query summarises IdentityLogonEvents per AccountObjectId, and the rule is rejected because the results lack Timestamp and ReportId. What is the correct fix?",
    options: [
      { id: "a", text: "Add arg_max(Timestamp, ReportId) to the summarize so each account keeps its latest event's values" },
      { id: "b", text: "Add extend Timestamp = now() and ReportId = new_guid() after the summarize" },
      { id: "c", text: "Remove the summarize so the rule receives the raw rows and counts them itself" },
      { id: "d", text: "Project DeviceId in place of AccountObjectId, because entities must be devices" },
    ],
    correct: ["a"],
    explanation:
      "For tables other than Defender for Endpoint's, the query results must include Timestamp and ReportId. After an aggregation you can still return them by taking them from the most recent event for each unique identifier, for example with arg_max. Invented values would point at no real event.",
    difficulty: 3,
    reference: { label: "Create and manage custom detection rules", url: `${docs}/defender-xdr/custom-detection-rules` },
  },

  // ------------------------------------------- limits, licences, roles
  {
    id: "sc200-h12",
    domainId: "operations",
    type: "statements",
    scenario: "You are planning Microsoft Sentinel automation rules for incident handling.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "An automation rule can be triggered when an incident is created.", correct: true },
      { id: "b", text: "An automation rule can be triggered when an incident is updated.", correct: true },
      { id: "c", text: "An automation rule can be triggered when an alert is created.", correct: true },
      { id: "d", text: "Basing playbooks on the alert trigger is preferable to the incident trigger for most use cases.", correct: false },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "Automation rules run on incident creation, incident update or alert creation. For most use cases incident-triggered automation is preferable, because an incident aggregates the related alerts and evidence, so playbooks are best built on the Microsoft Sentinel incident trigger.",
    difficulty: 2,
    reference: { label: "Automate incident handling in Microsoft Sentinel with automation rules", url: `${docs}/azure/sentinel/automate-incident-handling-with-automation-rules` },
  },
  {
    id: "sc200-h13",
    domainId: "operations",
    type: "single",
    prompt:
      "You collect Windows Security events with the Windows Security Events via AMA connector. You need a full user audit trail that includes both sign-in and sign-out events, but with a smaller volume than collecting every event. Which event set should you select?",
    options: [
      { id: "a", text: "Minimal, which holds sign-in events but no sign-out events or full audit trail" },
      { id: "b", text: "All events, which is the only set that includes the full audit trail" },
      { id: "c", text: "Common, which keeps a full audit trail while reducing the volume" },
      { id: "d", text: "None, with a custom XPath filter added afterwards on the workspace" },
    ],
    correct: ["c"],
    explanation:
      "The Common set contains both sign-in and sign-out events (4624 and 4634) and other auditing events, so it maintains a full audit trail at a lower volume than All events. Minimal covers only events that might indicate a breach and does not contain a full audit trail.",
    difficulty: 3,
    reference: { label: "Windows security event sets that can be sent to Microsoft Sentinel", url: `${docs}/azure/sentinel/windows-security-event-id-reference` },
  },
  {
    id: "sc200-h14",
    domainId: "response",
    type: "single",
    prompt:
      "During an insider investigation you must retrieve SharePoint audit records from ten months ago for a user who holds only a Microsoft 365 E3 licence. The tenant has no custom audit retention policies. What is the outcome?",
    options: [
      { id: "a", text: "The records are available, because the default retention policy keeps every record for one year" },
      { id: "b", text: "The records are available from CloudAppEvents in advanced hunting, which keeps them for one year" },
      { id: "c", text: "The records are gone, because Audit (Standard) keeps them 180 days and the one-year default needs E5 licensing" },
      { id: "d", text: "The records are available if you export them from Content search with a legal hold" },
    ],
    correct: ["c"],
    explanation:
      "Audit (Standard) retains records for 180 days. The default one-year retention of Exchange, SharePoint, OneDrive and Entra records applies only to users with Microsoft 365 E5 or equivalent Audit (Premium) licensing, so an E3 user's ten-month-old records are no longer available unless a retention policy and licence were in place earlier.",
    difficulty: 3,
    reference: { label: "Manage audit log retention policies", url: `${docs}/purview/audit-log-retention-policies` },
  },
  {
    id: "sc200-h15",
    domainId: "response",
    type: "statements",
    scenario:
      "Your SOC uses Microsoft Entra ID Protection. You are delegating work with least privilege: some staff dismiss risky users, some create risk-based policies, some reset passwords, and some create Conditional Access policies.",
    prompt: "For each assignment, select Yes if the role is the least privileged one for the task. Otherwise select No.",
    statements: [
      { id: "a", text: "Security Operator to dismiss user risk.", correct: true },
      { id: "b", text: "Security Administrator to create or edit risk-based policies.", correct: true },
      { id: "c", text: "User Administrator to reset a user's password.", correct: true },
      { id: "d", text: "Global Administrator to create or edit Conditional Access policies.", correct: false },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "The least privileged roles are Security Operator for dismissing user risk, Security Administrator for risk-based policies, and User Administrator for password resets. Conditional Access policies are managed by the Conditional Access Administrator, so Global Administrator is far more than required.",
    difficulty: 3,
    reference: { label: "Remediate risks and unblock users", url: `${docs}/entra/id-protection/howto-identity-protection-remediate-unblock` },
  },
  {
    id: "sc200-h16",
    domainId: "operations",
    type: "single",
    prompt:
      "You need to import a 400 MB CSV of asset owners into Microsoft Sentinel as a watchlist so that analytics rules can look it up. How should you create it?",
    options: [
      { id: "a", text: "Upload the file from your computer in the watchlist wizard" },
      { id: "b", text: "Split it into 4 MB pieces and merge them into one watchlist" },
      { id: "c", text: "Upload it to Azure Storage and give Sentinel a SAS URL to retrieve it" },
      { id: "d", text: "Convert it into a summary rule table and query that instead" },
    ],
    correct: ["c"],
    explanation:
      "Local file uploads are limited to 3.8 MB, while a file of up to 500 MB can be uploaded to an Azure Storage account and read by Sentinel through a shared access signature URL. A workspace can hold a maximum of 10 million active watchlist items in total.",
    difficulty: 3,
    reference: { label: "Create watchlists in Microsoft Sentinel", url: `${docs}/azure/sentinel/watchlists` },
  },
  {
    id: "sc200-h17",
    domainId: "operations",
    type: "single",
    prompt:
      "Servers send very chatty debug events that you never query, and they inflate ingestion cost. You want to drop them before they are stored in the workspace. What should you use?",
    options: [
      { id: "a", text: "A scheduled analytics rule that deletes the events after they arrive" },
      { id: "b", text: "A transformation in the data collection rule that filters them out" },
      { id: "c", text: "A shorter interactive retention period on the destination table" },
      { id: "d", text: "A workbook parameter that hides the events from analysts" },
    ],
    correct: ["b"],
    explanation:
      "Transformations in a data collection rule filter or modify incoming data after the source delivers it and before it is sent to the workspace, so dropped events are never ingested or billed. Analytics rules, retention settings and workbooks all act after ingestion.",
    difficulty: 2,
    reference: { label: "Data collection transformations in Azure Monitor", url: `${docs}/azure/azure-monitor/data-collection/data-collection-transformations` },
  },
  {
    id: "sc200-h18",
    domainId: "response",
    type: "single",
    prompt:
      "An analyst tries to open a live response session to a domain controller that was onboarded to Defender for Endpoint as a high-value asset, and the option is unavailable. What is the most likely reason?",
    options: [
      { id: "a", text: "Live response only works on workstations, never on servers of any kind" },
      { id: "b", text: "The selective response actions defined at onboarding restrict live response for that device" },
      { id: "c", text: "The device needs an investigation package collected before live response unlocks" },
      { id: "d", text: "Live response is disabled for any device that is a member of a device group" },
    ],
    correct: ["b"],
    explanation:
      "Live response can be restricted on devices onboarded as high-value assets, based on the selective response actions defined when the device was onboarded. Review those settings if a device does not offer live response.",
    difficulty: 3,
    reference: { label: "Respond to alerts on devices in Defender for Endpoint", url: `${docs}/defender-endpoint/respond-machine-alerts` },
  },

  // ------------------------------------------------ ordering & series
  {
    id: "sc200-h19",
    domainId: "hunting",
    type: "ordering",
    prompt:
      "You are writing a Sentinel query that returns the five users with more than ten failed sign-ins in the last day. Arrange the pipeline stages in the order that works.",
    steps: [
      { id: "a", text: "where TimeGenerated > ago(1d) and ResultType != '0'" },
      { id: "b", text: "summarize Failures = count() by UserPrincipalName" },
      { id: "c", text: "where Failures > 10" },
      { id: "d", text: "top 5 by Failures desc" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Filter the raw rows by time and failure first, so less data is aggregated. Aggregate per user next, then filter on the aggregated column, which only exists after summarize, and finally take the top five.",
    difficulty: 2,
    reference: { label: "summarize operator", url: `${docs}/kusto/query/summarize-operator` },
  },
  {
    id: "sc200-h20",
    domainId: "operations",
    type: "meets-goal",
    scenario:
      "The SOC must be alerted within about one minute whenever a break-glass administrator account signs in. The rule's query must run against incoming SigninLogs data, and the alert must create an incident that maps the account entity.",
    prompt:
      "Solution: You create a near-real-time (NRT) analytics rule that queries SigninLogs for the account and maps the account to an entity.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "NRT rules run once every minute on the events ingested in the preceding minute, so alerts appear within about a minute, and they can map entities and create incidents.",
    difficulty: 2,
    reference: { label: "Detect threats quickly with NRT analytics rules", url: `${docs}/azure/sentinel/near-real-time-rules` },
  },
  {
    id: "sc200-h21",
    domainId: "operations",
    type: "meets-goal",
    scenario:
      "The SOC must be alerted within about one minute whenever a break-glass administrator account signs in. The rule's query must run against incoming SigninLogs data, and the alert must create an incident that maps the account entity.",
    prompt:
      "Solution: You create a scheduled analytics rule that runs every hour and looks back one hour.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "A scheduled rule that runs hourly can delay an alert by up to an hour, far beyond the one-minute goal. Scheduled rules can run as often as every five minutes at best, whereas NRT rules run every minute.",
    difficulty: 2,
    reference: { label: "Scheduled analytics rules in Microsoft Sentinel", url: `${docs}/azure/sentinel/scheduled-rules-overview` },
  },
  {
    id: "sc200-h22",
    domainId: "operations",
    type: "meets-goal",
    scenario:
      "The SOC must be alerted within about one minute whenever a break-glass administrator account signs in. The rule's query must run against incoming SigninLogs data, and the alert must create an incident that maps the account entity.",
    prompt:
      "Solution: You create a workbook that queries SigninLogs for the account and set it to refresh every minute.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "A workbook only visualises data when someone has it open. It doesn't generate alerts or incidents, and it can't map entities to an incident, so it cannot notify the SOC.",
    difficulty: 2,
    reference: { label: "Visualize your data using workbooks in Microsoft Sentinel", url: `${docs}/azure/sentinel/monitor-your-data` },
  },

  // -------------------------------------------------- long scenarios
  {
    id: "sc200-h23",
    domainId: "operations",
    type: "multi",
    prompt:
      "Tailspin's firewalls send about 400 GB a day of verbose logs to Microsoft Sentinel. Requirements: (1) events from a known-noisy scanner subnet must never be stored; (2) analysts need daily per-source-IP counts for trend dashboards without querying the raw data; (3) the raw logs must remain available for ad hoc investigation at the lowest possible cost. Which two actions should you take? (Choose two.)",
    options: [
      { id: "a", text: "Add a filter transformation to the data collection rule for the scanner subnet" },
      { id: "b", text: "Delete the scanner events with a scheduled analytics rule that runs each night" },
      { id: "c", text: "Create a summary rule that aggregates the logs per source IP into a custom table" },
      { id: "d", text: "Set the analytics retention on the table to two years so that dashboards stay fast" },
      { id: "e", text: "Convert the trend dashboards into hunting bookmarks that analysts refresh manually" },
    ],
    correct: ["a", "c"],
    explanation:
      "A transformation in the data collection rule filters events before they are stored, meeting requirement one. A summary rule aggregates verbose data on a schedule into a compact custom table for dashboards, while the raw table can stay on a low-cost plan. Deleting after ingestion still incurs the cost, retention does not reduce volume, and bookmarks are not dashboards.",
    difficulty: 3,
    reference: { label: "Aggregate data with summary rules", url: `${docs}/azure/azure-monitor/logs/summary-rules` },
  },
  {
    id: "sc200-h24",
    domainId: "response",
    type: "single",
    prompt:
      "Contoso's Microsoft Entra ID Protection flags a user as high risk. The user remembers their password and can complete MFA. Requirements: (1) the user must regain access without contacting the helpdesk; (2) the user's risk must be remediated automatically; (3) no analyst should have to dismiss the risk manually. Which configuration meets all three?",
    options: [
      { id: "a", text: "A user risk policy that blocks access at high risk, until an administrator dismisses the user's risk" },
      { id: "b", text: "A sign-in risk policy that requires MFA at high risk, with an analyst confirming the account is safe afterwards" },
      { id: "c", text: "A user risk policy that requires a secure password change at high risk, with MFA before the change" },
      { id: "d", text: "A sign-in risk policy that requires a compliant device, so the risk falls once the sign-in succeeds" },
    ],
    correct: ["c"],
    explanation:
      "A risk-based Conditional Access policy that requires a secure password change lets a user who knows their password authenticate with MFA and change it, which remediates the user risk automatically without helpdesk or analyst involvement. Blocking requires an administrator, and sign-in risk policies address the sign-in rather than the user's risk state.",
    difficulty: 3,
    reference: { label: "Remediate risks and unblock users", url: `${docs}/entra/id-protection/howto-identity-protection-remediate-unblock` },
  },
];
