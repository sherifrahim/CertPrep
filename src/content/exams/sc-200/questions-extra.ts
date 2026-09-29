import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc200ExtraQuestions: Question[] = [
  // -------------------------------------------------------------- operations
  {
    id: "sc200-x1",
    domainId: "operations",
    type: "single",
    prompt:
      "You must reduce Microsoft Sentinel ingestion cost for a verbose table that analysts rarely query interactively but which must remain searchable for investigations. Which table plan should you consider?",
    options: [
      { id: "a", text: "The Basic or Auxiliary logs plan, trading query features for lower cost" },
      { id: "b", text: "The Analytics plan, with a longer interactive retention period for the table" },
      { id: "c", text: "Deleting the table and re-ingesting the data on demand" },
      { id: "d", text: "A daily cap on the whole workspace to limit ingestion volume" },
    ],
    correct: ["a"],
    explanation:
      "Reduced-cost table plans lower ingestion charges for high-volume, low-value data while keeping it searchable, at the cost of restricted query features and no use in scheduled alerts. A workspace-wide daily cap would drop all data indiscriminately once hit.",
    difficulty: 3,
    reference: { label: "Table plans in Azure Monitor Logs", url: `${docs}/azure/azure-monitor/logs/data-platform-logs` },
  },
  {
    id: "sc200-x2",
    domainId: "operations",
    type: "single",
    prompt:
      "Where do you install Microsoft Sentinel solutions containing packaged data connectors, analytics rules, workbooks, and hunting queries for a specific product?",
    options: [
      { id: "a", text: "The Content hub" },
      { id: "b", text: "The Repositories page" },
      { id: "c", text: "The Watchlist page" },
      { id: "d", text: "The Automation page" },
    ],
    correct: ["a"],
    explanation:
      "Content hub is the in-product marketplace for Sentinel solutions, bundling connectors and detection content per product. Repositories is for CI/CD deployment of your own content from Git.",
    difficulty: 1,
    reference: { label: "Sentinel Content hub", url: `${docs}/azure/sentinel/sentinel-solutions` },
  },
  {
    id: "sc200-x3",
    domainId: "operations",
    type: "single",
    prompt:
      "Your team maintains Sentinel analytics rules as code and needs changes reviewed and deployed automatically from a Git branch. Which Sentinel feature supports this?",
    options: [
      { id: "a", text: "Repositories, connecting a GitHub or Azure DevOps repo for CI/CD" },
      { id: "b", text: "Automation rules that run playbooks automatically when new incidents are created" },
      { id: "c", text: "The Content hub, which installs packaged solutions" },
      { id: "d", text: "Data collection rules that route logs into tables" },
    ],
    correct: ["a"],
    explanation:
      "Sentinel Repositories establishes a connection to GitHub or Azure DevOps so workspace content is deployed from source control, giving you review, versioning, and promotion between environments.",
    difficulty: 2,
    reference: { label: "Sentinel CI/CD with repositories", url: `${docs}/azure/sentinel/ci-cd` },
  },
  {
    id: "sc200-x4",
    domainId: "operations",
    type: "single",
    prompt:
      "An analytics rule fires many alerts for the same brute-force campaign against one account. You want a single incident per account per day instead of one incident per alert. What should you configure on the rule?",
    options: [
      { id: "a", text: "Alert grouping in incident settings, by matching entities in a time window" },
      { id: "b", text: "Event grouping set to raise a separate alert for every single event in the query" },
      { id: "c", text: "A suppression automation rule that closes duplicates for 24 hours" },
      { id: "d", text: "A lower query frequency so fewer alerts are created each day" },
    ],
    correct: ["a"],
    explanation:
      "Alert grouping consolidates alerts sharing selected entities into a single incident over a configurable window, which is exactly the requirement. Suppression would hide the activity entirely rather than consolidating it.",
    difficulty: 3,
    reference: { label: "Create scheduled analytics rules", url: `${docs}/azure/sentinel/detect-threats-custom` },
  },
  {
    id: "sc200-x5",
    domainId: "operations",
    type: "statements",
    scenario:
      "A Microsoft Sentinel workspace ingests Defender XDR alerts through the Defender XDR connector and also has the Microsoft Defender for Endpoint device tables enabled.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Defender XDR incidents can be synchronised bi-directionally with Sentinel incidents.", correct: true },
      { id: "b", text: "Enabling the device tables lets you write KQL against DeviceProcessEvents in the workspace.", correct: true },
      { id: "c", text: "Ingesting the device tables is always free of ingestion charges.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "The Defender XDR connector supports bi-directional incident sync, so status and owner changes flow both ways, and enabling the raw device tables makes them queryable in the workspace. Those tables are billable like any other ingestion, which is exactly why you choose them deliberately.",
    difficulty: 2,
    reference: { label: "Connect Defender XDR to Sentinel", url: `${docs}/azure/sentinel/connect-microsoft-365-defender` },
  },
  {
    id: "sc200-x6",
    domainId: "operations",
    type: "ordering",
    prompt:
      "You are onboarding a new third-party firewall that emits CEF over syslog. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Deploy a Linux machine to act as the log forwarder and connect it to Azure Arc if it is on-premises" },
      { id: "b", text: "Install the Azure Monitor Agent and run the CEF collection setup on the forwarder" },
      { id: "c", text: "Configure the firewall to send CEF messages to the forwarder" },
      { id: "d", text: "Verify records arrive in the CommonSecurityLog table and enable the relevant analytics rules" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "CEF collection needs a forwarder that Azure can manage, so the machine is provisioned and Arc-enabled first, then the agent and CEF configuration are applied. Only once the forwarder is listening does pointing the firewall at it make sense, and verification precedes enabling detections.",
    difficulty: 3,
    reference: { label: "Ingest CEF logs via AMA", url: `${docs}/azure/sentinel/connect-cef-syslog-ama` },
  },

  // ---------------------------------------------------------------- response
  {
    id: "sc200-x7",
    domainId: "response",
    type: "single",
    prompt:
      "Microsoft Defender for Office 365 quarantined a message a user insists is legitimate. What is the correct analyst action to release it and improve future accuracy?",
    options: [
      { id: "a", text: "Release it from quarantine and submit it to Microsoft as a false positive" },
      { id: "b", text: "Disable the anti-phishing policy for that recipient and every other user" },
      { id: "c", text: "Add the sender's domain to the tenant allow list permanently without any review" },
      { id: "d", text: "Delete the quarantine policy" },
    ],
    correct: ["a"],
    explanation:
      "Releasing the message restores delivery, and submitting it through Microsoft's admin submission improves filter accuracy for everyone. Disabling policies or blanket-allowing a domain creates lasting exposure that attackers can abuse through spoofing.",
    difficulty: 2,
    reference: { label: "Admin submissions", url: `${docs}/defender-office-365/submissions-admin` },
  },
  {
    id: "sc200-x8",
    domainId: "response",
    type: "single",
    prompt:
      "Which Microsoft Defender for Office 365 feature detonates attachments and links in a sandbox before delivery, so unknown malware is caught?",
    options: [
      { id: "a", text: "Safe Attachments and Safe Links, using detonation" },
      { id: "b", text: "Anti-spam policies with a strict bulk email threshold" },
      { id: "c", text: "DKIM signing for outbound messages from the domain" },
      { id: "d", text: "Mail flow rules that quarantine risky file extensions" },
    ],
    correct: ["a"],
    explanation:
      "Safe Attachments detonates files and Safe Links rewrites and checks URLs at click time, both using sandbox detonation for unknown content. DKIM addresses sender authentication rather than payload analysis.",
    difficulty: 1,
    reference: { label: "Safe Attachments", url: `${docs}/defender-office-365/safe-attachments-about` },
  },
  {
    id: "sc200-x9",
    domainId: "response",
    type: "single",
    prompt:
      "A Defender for Cloud Apps alert reports impossible travel for a user. Which action best confirms whether the sign-in was genuinely malicious before you disable the account?",
    options: [
      { id: "a", text: "Review the Entra sign-in logs: IP reputation, device, and MFA result" },
      { id: "b", text: "Immediately delete the user account and its mailbox to stop the attacker" },
      { id: "c", text: "Suppress the alert as a false positive and close the case" },
      { id: "d", text: "Run a full antivirus scan on the user's device before anything else" },
    ],
    correct: ["a"],
    explanation:
      "Impossible travel is frequently benign — VPNs and mobile roaming trigger it. Correlating with sign-in logs for IP reputation, device compliance, and MFA satisfaction is what distinguishes a real compromise from noise before you take disruptive action.",
    difficulty: 2,
    reference: { label: "Investigate anomaly detection alerts", url: `${docs}/defender-cloud-apps/investigate-anomaly-alerts` },
  },
  {
    id: "sc200-x10",
    domainId: "response",
    type: "single",
    prompt:
      "You need to prevent a compromised user's existing access tokens from continuing to work after you reset their password. What should you do?",
    options: [
      { id: "a", text: "Revoke the user's refresh tokens (revoke sessions) in Entra ID" },
      { id: "b", text: "Reset the password a second time using a longer, more complex value" },
      { id: "c", text: "Remove the user from all of their group memberships" },
      { id: "d", text: "Delete the user's registered devices from Entra ID" },
    ],
    correct: ["a"],
    explanation:
      "Access tokens remain valid until they expire, so a password reset alone does not end active sessions. Revoking sessions invalidates refresh tokens and forces reauthentication, which is the step that actually cuts the attacker off.",
    difficulty: 2,
    reference: { label: "Revoke user access", url: `${docs}/entra/identity/users/users-revoke-access` },
  },
  {
    id: "sc200-x11",
    domainId: "response",
    type: "single",
    prompt:
      "Which Defender for Endpoint response action prevents unsigned or untrusted applications from running on a compromised device while leaving business applications functional?",
    options: [
      { id: "a", text: "Restrict app execution" },
      { id: "b", text: "Full device isolation" },
      { id: "c", text: "Run antivirus scan" },
      { id: "d", text: "Collect investigation package" },
    ],
    correct: ["a"],
    explanation:
      "Restrict app execution applies a code integrity policy that only permits Microsoft-signed binaries, limiting attacker tooling while the device keeps operating. Isolation cuts networking entirely, which is a heavier intervention.",
    difficulty: 2,
    reference: { label: "Response actions on a device", url: `${docs}/defender-endpoint/respond-machine-alerts` },
  },
  {
    id: "sc200-x12",
    domainId: "response",
    type: "single",
    prompt:
      "A Microsoft Purview DLP alert indicates a user emailed a spreadsheet of customer records externally. Where should a security operations analyst triage and act on this alert?",
    options: [
      { id: "a", text: "The DLP alerts page in Microsoft Purview or the linked Defender XDR alert" },
      { id: "b", text: "The Azure Activity log for the mailbox's resource group" },
      { id: "c", text: "The Defender for Endpoint device timeline for the sender's laptop and mailbox" },
      { id: "d", text: "Microsoft Entra sign-in logs filtered to the user's account" },
    ],
    correct: ["a"],
    explanation:
      "DLP alerts are triaged in the Purview portal's DLP alerts experience, and they also surface in Defender XDR so SOC analysts can handle them alongside other incidents. Device timelines and sign-in logs provide supporting context, not the alert itself.",
    difficulty: 2,
    reference: { label: "Investigate DLP alerts", url: `${docs}/purview/dlp-alerts-dashboard-learn` },
  },
  {
    id: "sc200-x13",
    domainId: "response",
    type: "statements",
    scenario:
      "Automatic attack disruption triggers on a confirmed human-operated ransomware incident and contains a compromised user account.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The containment action appears in the Action center and can be undone by an analyst.", correct: true },
      { id: "b", text: "Attack disruption requires an analyst to approve the action first.", correct: false },
      { id: "c", text: "Attack disruption only acts on very high-confidence detections.", correct: true },
    ],
    correct: ["a", "c"],
    explanation:
      "Attack disruption acts autonomously precisely because waiting for approval would let the attack progress, and it is deliberately restricted to very high-confidence signals to keep false positives negligible. Every action is recorded in the Action center where it can be reversed.",
    difficulty: 2,
    reference: { label: "Automatic attack disruption", url: `${docs}/defender-xdr/automatic-attack-disruption` },
  },
  {
    id: "sc200-x14",
    domainId: "response",
    type: "meets-goal",
    scenario:
      "A laptop shows signs of active credential theft. You must stop the attacker reaching other systems from that laptop, keep the ability to run forensic commands on it, and preserve volatile evidence.",
    prompt:
      "Solution: You isolate the device using the standard isolation action, then open a live response session to collect artifacts.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "Standard isolation blocks general network traffic while deliberately preserving the Defender service channel, so lateral movement stops but live response still works and the machine stays powered on, keeping volatile evidence intact.",
    difficulty: 2,
    reference: { label: "Response actions on a device", url: `${docs}/defender-endpoint/respond-machine-alerts` },
  },
  {
    id: "sc200-x15",
    domainId: "response",
    type: "meets-goal",
    scenario:
      "A laptop shows signs of active credential theft. You must stop the attacker reaching other systems from that laptop, keep the ability to run forensic commands on it, and preserve volatile evidence.",
    prompt:
      "Solution: You shut down the device remotely and then collect the investigation package when it next comes online.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Shutting the device down does halt lateral movement, but it destroys volatile evidence such as running processes and in-memory artifacts, and no forensic commands can be run while it is off. Two of the three requirements fail.",
    difficulty: 2,
    reference: { label: "Response actions on a device", url: `${docs}/defender-endpoint/respond-machine-alerts` },
  },
  {
    id: "sc200-x16",
    domainId: "response",
    type: "ordering",
    prompt:
      "A user's account is confirmed compromised through token theft. Arrange the containment steps in the most effective order.",
    steps: [
      { id: "a", text: "Reset the user's password" },
      { id: "b", text: "Revoke the user's refresh tokens to end active sessions" },
      { id: "c", text: "Review sign-in and Graph activity logs for actions taken by the attacker" },
      { id: "d", text: "Remove any malicious inbox rules, app consents, or MFA methods the attacker added" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Resetting the password first stops new sign-ins, but existing tokens survive until revoked — so revocation must follow immediately. Only then do you investigate what the attacker did and undo their persistence mechanisms, which are commonly overlooked.",
    difficulty: 3,
    reference: { label: "Revoke user access", url: `${docs}/entra/identity/users/users-revoke-access` },
  },
  {
    id: "sc200-x17",
    domainId: "response",
    type: "single",
    prompt:
      "Which persistence mechanism should you always check for after a business email compromise, because it silently forwards a victim's mail to an attacker?",
    options: [
      { id: "a", text: "Malicious inbox rules and mailbox forwarding settings" },
      { id: "b", text: "Scheduled tasks on the mail server that read new messages" },
      { id: "c", text: "Registry run keys created in the victim's mailbox profile" },
      { id: "d", text: "Group Policy preferences that redirect the user's mail client" },
    ],
    correct: ["a"],
    explanation:
      "Attackers routinely create inbox rules or forwarding settings that redirect or hide mail, keeping visibility even after credentials are reset. Auditing and removing them is a standard BEC remediation step.",
    difficulty: 2,
    reference: { label: "Respond to a compromised email account", url: `${docs}/defender-office-365/responding-to-a-compromised-email-account` },
  },

  // ----------------------------------------------------------------- hunting
  {
    id: "sc200-x18",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which KQL operator lets you enrich query results with columns from a watchlist or another table where a match exists, keeping all rows from the original table?",
    options: [
      { id: "a", text: "join kind=leftouter" },
      { id: "b", text: "join kind=inner" },
      { id: "c", text: "union" },
      { id: "d", text: "mv-expand" },
    ],
    correct: ["a"],
    explanation:
      "A leftouter join preserves every row from the left table and adds columns from the right where a match exists, which is the standard enrichment pattern. An inner join would discard unmatched rows and change your result set.",
    difficulty: 2,
    reference: { label: "KQL join operator", url: `${docs}/kusto/query/join-operator` },
  },
  {
    id: "sc200-x19",
    domainId: "hunting",
    type: "single",
    prompt:
      "You want to detect accounts whose sign-in count today is far above their own 14-day average. Which KQL approach fits best?",
    options: [
      { id: "a", text: "Aggregate per account per day, then compare to baseline avg and stdev" },
      { id: "b", text: "Use distinct on the account column and count the rows" },
      { id: "c", text: "Use take 100 to sample the data, then eyeball the trend" },
      { id: "d", text: "Use project-away to remove columns, then sort the rows by TimeGenerated" },
    ],
    correct: ["a"],
    explanation:
      "Per-entity anomaly detection needs a baseline: aggregate into a time series per account and either apply series_decompose_anomalies or compare today's value against the mean and standard deviation of the preceding window. The other operators reshape results without establishing a baseline.",
    difficulty: 3,
    reference: { label: "series_decompose_anomalies", url: `${docs}/kusto/query/series-decompose-anomalies-function` },
  },
  {
    id: "sc200-x20",
    domainId: "hunting",
    type: "single",
    prompt:
      "Which advanced hunting table records the URLs contained in email messages, letting you pivot from a malicious domain to every recipient who received it?",
    options: [
      { id: "a", text: "EmailUrlInfo" },
      { id: "b", text: "UrlClickEvents" },
      { id: "c", text: "DeviceNetworkEvents" },
      { id: "d", text: "AlertEvidence" },
    ],
    correct: ["a"],
    explanation:
      "EmailUrlInfo holds URLs found in messages and joins to EmailEvents on NetworkMessageId to reveal recipients. UrlClickEvents records only the subset of users who actually clicked a Safe Links-protected URL.",
    difficulty: 2,
    reference: { label: "EmailUrlInfo table", url: `${docs}/defender-xdr/advanced-hunting-emailurlinfo-table` },
  },
  {
    id: "sc200-x21",
    domainId: "hunting",
    type: "single",
    prompt:
      "In Microsoft Sentinel, what does the 'Go hunt' action on an entity do during an investigation?",
    options: [
      { id: "a", text: "Runs predefined queries scoped to that entity to show its recent activity" },
      { id: "b", text: "Permanently blocks the entity across the whole tenant until reviewed" },
      { id: "c", text: "Creates a new scheduled analytics rule that watches only that entity" },
      { id: "d", text: "Exports the entity's details into a watchlist for later joins" },
    ],
    correct: ["a"],
    explanation:
      "Go hunt pivots straight from an entity to a curated set of queries filtered to it, collapsing what would otherwise be several manual KQL steps during triage. It is an investigative shortcut, not an enforcement action.",
    difficulty: 2,
    reference: { label: "Hunt for threats with Microsoft Sentinel", url: `${docs}/azure/sentinel/hunting` },
  },
  {
    id: "sc200-x22",
    domainId: "hunting",
    type: "statements",
    scenario:
      "An analyst runs a hunting query in the Microsoft Sentinel data lake tier and saves the output as a KQL job scheduled daily.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The job can promote its results into the analytics tier.", correct: true },
      { id: "b", text: "Data lake queries can use the full range of KQL, including machine learning functions.", correct: true },
      { id: "c", text: "Running the job is not recorded anywhere.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "KQL jobs exist precisely to promote lake data into the analytics tier on a one-time or scheduled basis, and the lake supports the full KQL surface including ML functions. Data lake activity — queries, notebook runs, and job lifecycle — is audited by default.",
    difficulty: 3,
    reference: { label: "KQL and the Sentinel data lake", url: `${docs}/azure/sentinel/datalake/kql-overview` },
  },
];
