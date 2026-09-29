import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/**
 * Questions written from the topic coverage of a legacy SC-200 practice PDF.
 * Wording is original, product names and portals are current, and every answer key
 * was re-checked against Microsoft Learn rather than carried over from the source.
 */
export const sc200DumpQuestions: Question[] = [
  // -------------------------------------------------------------- operations
  {
    id: "sc200-d1",
    domainId: "operations",
    type: "single",
    prompt:
      "Users complain that emails with attachments arrive late while Defender for Office 365 scans them. You want the message body delivered immediately, with the attachment following once it has been scanned and found safe. Which Safe Attachments action should the policy use?",
    options: [
      { id: "a", text: "Block" },
      { id: "b", text: "Dynamic Delivery" },
      { id: "c", text: "Off" },
      { id: "d", text: "Quarantine all attachments for admin review" },
    ],
    correct: ["b"],
    explanation:
      "Dynamic Delivery delivers the message body straight away with a placeholder for the attachment and reattaches it after detonation reports it clean, so users are not blocked waiting on the scan. Block holds the whole message, and Off removes the protection you were asked to keep.",
    difficulty: 1,
    reference: { label: "Safe Attachments", url: `${docs}/defender-office-365/safe-attachments-about` },
  },
  {
    id: "sc200-d2",
    domainId: "operations",
    type: "multi",
    prompt:
      "You need to turn on Safe Attachments for SharePoint, OneDrive, and Microsoft Teams, and stop users downloading files that are detected as malicious. Which two commands should you run? (Choose two.)",
    options: [
      { id: "a", text: "In Exchange Online PowerShell: Set-AtpPolicyForO365 -EnableATPForSPOTeamsODB $true" },
      { id: "b", text: "In Exchange Online PowerShell: Get-AtpPolicyForO365 -EnableATPForSPOTeamsODB $true" },
      { id: "c", text: "In SharePoint Online PowerShell: Set-SPOTenant -DisallowInfectedFileDownload $true" },
      { id: "d", text: "In SharePoint Online PowerShell: Get-SPOTenant -DisallowInfectedFileDownload $true" },
      { id: "e", text: "In Exchange Online PowerShell: Set-SPOTenant -DisallowInfectedFileDownload $true" },
    ],
    correct: ["a", "c"],
    explanation:
      "Protection is switched on by Set-AtpPolicyForO365 in Exchange Online PowerShell, and blocking download of files that were detected as malicious is a SharePoint tenant setting changed with Set-SPOTenant in the SharePoint Online module. Get- cmdlets only read settings, and each cmdlet only exists in its own module.",
    difficulty: 2,
    reference: {
      label: "Turn on Safe Attachments for SharePoint, OneDrive, and Teams",
      url: `${docs}/defender-office-365/safe-attachments-for-spo-odfb-teams-configure`,
    },
  },
  {
    id: "sc200-d3",
    domainId: "operations",
    type: "single",
    prompt:
      "A Defender for Endpoint API integration must list every device affected by a specific CVE. Which request returns the devices associated with a vulnerability ID?",
    options: [
      { id: "a", text: "GET /api/vulnerabilities/{cveId}" },
      { id: "b", text: "GET /api/vulnerabilities/{cveId}/machineReferences" },
      { id: "c", text: "GET /api/vulnerabilities" },
      { id: "d", text: "GET /api/machines/{id}/vulnerabilities" },
    ],
    correct: ["b"],
    explanation:
      "The machineReferences sub-resource of a vulnerability lists the devices exposed to it. Reading the vulnerability itself returns its metadata only, and listing all vulnerabilities returns no per-device data.",
    difficulty: 3,
    reference: { label: "Get devices by vulnerability", url: `${docs}/defender-endpoint/api/get-machines-by-vulnerability` },
  },
  {
    id: "sc200-d4",
    domainId: "operations",
    type: "single",
    prompt:
      "An application on a company laptop keeps launching obfuscated PowerShell and JavaScript. You want to restrict this behaviour on managed Windows devices without blocking the application entirely. What should you deploy?",
    options: [
      { id: "a", text: "A Microsoft Purview DLP policy" },
      { id: "b", text: "A sensitivity label with encryption" },
      { id: "c", text: "Attack surface reduction rules, such as blocking execution of potentially obfuscated scripts" },
      { id: "d", text: "A data retention policy" },
    ],
    correct: ["c"],
    explanation:
      "ASR rules target risky software behaviours, including running obfuscated scripts, and can be set to audit before enforcing. DLP, labels and retention govern data, not process behaviour.",
    difficulty: 1,
    reference: { label: "Attack surface reduction rules reference", url: `${docs}/defender-endpoint/attack-surface-reduction-rules-reference` },
  },
  {
    id: "sc200-d5",
    domainId: "operations",
    type: "single",
    prompt:
      "Microsoft Defender for Cloud shows a security recommendation that does not apply to a specific resource because a compensating control is in place. You want to remove it from the secure score for that resource and record why. What should you use?",
    options: [
      { id: "a", text: "An alert suppression rule" },
      { id: "b", text: "A recommendation exemption with the Mitigated or Waiver category" },
      { id: "c", text: "Disabling the Defender plan on the subscription" },
      { id: "d", text: "A data loss prevention policy" },
    ],
    correct: ["b"],
    explanation:
      "Exemptions apply to recommendations, scoped to a resource, resource group, subscription or management group, with a justification category. Suppression rules only hide alerts and do not change recommendations or the secure score.",
    difficulty: 2,
    reference: { label: "Exempt resources from recommendations", url: `${docs}/azure/defender-for-cloud/exempt-resource` },
  },
  {
    id: "sc200-d6",
    domainId: "operations",
    type: "statements",
    scenario:
      "Defender for Cloud produces recommendations about resource configuration and separate security alerts about detected threats. Your team wants to reduce noise from both.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "An alert suppression rule hides a false-positive alert type for the entities and criteria you define.", correct: true },
      { id: "b", text: "Creating a suppression rule removes the related security recommendation from the secure score.", correct: false },
      { id: "c", text: "A suppression rule can be set to expire on a date you choose.", correct: true },
      { id: "d", text: "A recommendation exemption stops the underlying alert from being generated.", correct: false },
    ],
    correct: ["a", "c"],
    explanation:
      "Suppression rules act on alerts, take criteria such as alert type and entity, and can carry an expiry date. Recommendations and secure score are handled separately by exemptions, and neither mechanism alters the other. An expired or edited-out criterion is also the classic reason a rule that once worked stops matching.",
    difficulty: 2,
    reference: { label: "Suppress alerts from Defender for Cloud", url: `${docs}/azure/defender-for-cloud/alerts-suppression-rules` },
  },
  {
    id: "sc200-d7",
    domainId: "operations",
    type: "multi",
    prompt:
      "Defender for Cloud email notifications currently go to the default recipients for alerts of every severity. Recipients say low-severity alerts are noise, and you must also add two Contributor-role users while keeping the current recipients. Which two changes should you make? (Choose two.)",
    options: [
      { id: "a", text: "Raise the minimum notification severity to Medium" },
      { id: "b", text: "Add the two users' addresses under Additional email addresses" },
      { id: "c", text: "Remove all existing recipients and re-add them by role" },
      { id: "d", text: "Set the minimum severity to High so only critical alerts are sent" },
    ],
    correct: ["a", "b"],
    explanation:
      "Raising the severity threshold to Medium drops Low and Informational alerts while keeping what recipients still want, and extra addresses can be listed alongside the role-based recipients. Setting the threshold to High would silence Medium alerts nobody asked to lose, and rebuilding recipients is unnecessary.",
    difficulty: 2,
    reference: { label: "Configure email notifications in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/configure-email-notifications` },
  },
  {
    id: "sc200-d8",
    domainId: "operations",
    type: "multi",
    prompt:
      "A suppression rule that reliably hid a noisy Defender for Cloud alert has stopped working, and nobody edited it after creation. Which two causes are the most likely? (Choose two.)",
    options: [
      { id: "a", text: "The rule's expiration date has passed" },
      { id: "b", text: "The alerts now differ from the criteria the rule was written against" },
      { id: "c", text: "The rule was not run through Simulate before saving" },
      { id: "d", text: "The subscription was renamed" },
    ],
    correct: ["a", "b"],
    explanation:
      "A rule only suppresses alerts that match its entity and alert-type criteria while it is active. Once it expires, or the alert contents drift from the criteria, it silently stops applying. Simulate is an optional pre-check, and renaming a subscription does not change its ID.",
    difficulty: 2,
    reference: { label: "Suppress alerts from Defender for Cloud", url: `${docs}/azure/defender-for-cloud/alerts-suppression-rules` },
  },
  {
    id: "sc200-d9",
    domainId: "operations",
    type: "multi",
    prompt:
      "You need to extend Defender for Servers protection to Windows and Linux servers that run on-premises and in other clouds. Which two things bring such servers under Defender for Cloud management? (Choose two.)",
    options: [
      { id: "a", text: "Azure Arc-enable the servers, or connect the other cloud account so Arc onboarding is automated" },
      { id: "b", text: "Deploy Azure Migrate on each server" },
      { id: "c", text: "Enable the Defender for Servers plan on the subscription that holds the Arc resources" },
      { id: "d", text: "Deploy Azure SQL Edge to each server" },
    ],
    correct: ["a", "c"],
    explanation:
      "Non-Azure machines must be represented as Azure resources through Azure Arc, and the Defender for Servers plan is enabled on the subscription containing them. Azure Migrate is a migration tool and SQL Edge is an unrelated database runtime.",
    difficulty: 2,
    reference: { label: "Connect non-Azure machines to Defender for Cloud", url: `${docs}/azure/defender-for-cloud/quickstart-onboard-machines` },
  },
  {
    id: "sc200-d10",
    domainId: "operations",
    type: "single",
    prompt:
      "You connect an AWS account to Microsoft Defender for Cloud. How does the connector authenticate to AWS without you storing long-lived access keys?",
    options: [
      { id: "a", text: "An IAM user with a static access key pair created for Defender for Cloud" },
      { id: "b", text: "An IAM role that Defender for Cloud assumes through federated identity, deployed by the generated CloudFormation template" },
      { id: "c", text: "A user risk policy in Microsoft Entra ID Protection" },
      { id: "d", text: "A Microsoft Graph application permission" },
    ],
    correct: ["b"],
    explanation:
      "The AWS connector creates IAM roles trusted by Defender for Cloud's identity provider, so it obtains short-lived credentials on demand rather than holding a secret. Static keys are exactly what the role-based design avoids, and Entra risk policies or Graph permissions play no part in cross-cloud onboarding.",
    difficulty: 2,
    reference: { label: "Connect your AWS account to Defender for Cloud", url: `${docs}/azure/defender-for-cloud/quickstart-onboard-aws` },
  },
  {
    id: "sc200-d11",
    domainId: "operations",
    type: "multi",
    prompt:
      "Windows servers stop sending data through the Azure Monitor Agent because a local firewall blocks outbound traffic. You want to allow only the required endpoints and keep the rules narrow. Which three HTTPS endpoints should you allow? (Choose three.)",
    options: [
      { id: "a", text: "*.handler.control.monitor.azure.com (configuration and data collection rules)" },
      { id: "b", text: "*.ods.opinsights.azure.com (data ingestion to the workspace)" },
      { id: "c", text: "*.ingest.monitor.azure.com (ingestion through a data collection endpoint)" },
      { id: "d", text: "*.azure.com" },
      { id: "e", text: "*.opinsights.azure.com" },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "The agent fetches its data collection rules from the regional control handler and sends data to the workspace ingestion endpoints. A blanket *.azure.com or *.opinsights.azure.com rule works but defeats the goal of keeping the rules as specific as possible.",
    difficulty: 3,
    reference: { label: "Azure Monitor Agent network requirements", url: `${docs}/azure/azure-monitor/agents/azure-monitor-agent-requirements` },
  },
  {
    id: "sc200-d12",
    domainId: "operations",
    type: "statements",
    scenario:
      "You are assigning Azure RBAC roles to the SOC so that it can work in Microsoft Sentinel. Apply the built-in Sentinel roles.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Microsoft Sentinel Responder can view data and manage incidents, for example by assigning an owner or closing them.", correct: true },
      { id: "b", text: "Microsoft Sentinel Reader can create and edit analytics rules.", correct: false },
      { id: "c", text: "Microsoft Sentinel Contributor can create and edit workbooks and analytics rules.", correct: true },
      { id: "d", text: "A user who needs to build a playbook also needs Logic App Contributor on the playbook's resource group.", correct: true },
    ],
    correct: ["a", "c", "d"],
    explanation:
      "Reader is read-only, Responder adds incident management, and Contributor adds authoring of rules and workbooks. Playbooks are Logic Apps resources, so building one needs Logic Apps permissions in addition to the Sentinel role, which is why Contributor alone is not enough.",
    difficulty: 2,
    reference: { label: "Roles and permissions in Microsoft Sentinel", url: `${docs}/azure/sentinel/roles` },
  },
  {
    id: "sc200-d13",
    domainId: "operations",
    type: "single",
    prompt:
      "You want to enforce a user risk policy and a sign-in risk policy in Microsoft Entra ID Protection and to ingest its risk detections into Microsoft Sentinel. What is the lowest Entra ID licence that supports this?",
    options: [
      { id: "a", text: "Microsoft Entra ID Free" },
      { id: "b", text: "Microsoft Entra ID P1" },
      { id: "c", text: "Microsoft Entra ID P2" },
      { id: "d", text: "Microsoft 365 E3 without add-ons" },
    ],
    correct: ["c"],
    explanation:
      "Risk-based Conditional Access and the full Identity Protection experience, including risk detections, require Microsoft Entra ID P2. P1 gives Conditional Access without risk signals.",
    difficulty: 1,
    reference: { label: "What is Microsoft Entra ID Protection?", url: `${docs}/entra/id-protection/overview-identity-protection` },
  },
  {
    id: "sc200-d14",
    domainId: "operations",
    type: "multi",
    prompt:
      "You want to enable the Anomalous RDP Login Detection machine learning rule in Microsoft Sentinel. Which two prerequisites must be met? (Choose two.)",
    options: [
      { id: "a", text: "Collect Security or Windows Security Events that include Event ID 4624" },
      { id: "b", text: "Collect Event ID 4720 (user account created)" },
      { id: "c", text: "Select an event set other than None on the connector" },
      { id: "d", text: "Deploy the Entra ID Protection connector" },
    ],
    correct: ["a", "c"],
    explanation:
      "The model learns RDP behaviour from successful logon events (4624), so those must be collected, and a connector set to None collects nothing. Event 4720 records account creation, which is unrelated to RDP logons.",
    difficulty: 2,
    reference: { label: "Anomalies detected by Microsoft Sentinel machine learning", url: `${docs}/azure/sentinel/soc-ml-anomalies` },
  },
  {
    id: "sc200-d15",
    domainId: "operations",
    type: "multi",
    prompt:
      "You are creating a scheduled analytics rule that must run every hour and stop running its query once it has produced an alert. Which two settings in the rule wizard do you configure? (Choose two.)",
    options: [
      { id: "a", text: "Set Run query every to 1 hour" },
      { id: "b", text: "Turn on Stop running query after alert is generated and choose a duration" },
      { id: "c", text: "Set Event grouping to Group all events into a single alert" },
      { id: "d", text: "Set the lookback period to 1 hour" },
    ],
    correct: ["a", "b"],
    explanation:
      "Query frequency controls how often the rule runs, and the suppression setting pauses the rule for the chosen time after it fires. Event grouping only changes how results become alerts, and lookback controls how far back each run reads, not when it runs.",
    difficulty: 2,
    reference: { label: "Create scheduled analytics rules", url: `${docs}/azure/sentinel/create-analytics-rules` },
  },
  {
    id: "sc200-d16",
    domainId: "operations",
    type: "single",
    prompt:
      "A Microsoft Sentinel playbook does not run when an automation rule calls it, and its list entry shows the trigger kind as Not initialized. What should you do?",
    options: [
      { id: "a", text: "Add a Microsoft Sentinel trigger (incident, alert or entity) and actions to the Logic App" },
      { id: "b", text: "Run the playbook manually every time" },
      { id: "c", text: "Edit the analytics rule that produced the incident" },
      { id: "d", text: "Assign the Sentinel Reader role to the playbook" },
    ],
    correct: ["a"],
    explanation:
      "Not initialized means the Logic App has no Sentinel trigger yet, so nothing can invoke it. Once a trigger and actions are added, an automation rule can select it. Editing the analytics rule or adding roles cannot create a missing trigger.",
    difficulty: 2,
    reference: { label: "Automate threat response with playbooks", url: `${docs}/azure/sentinel/automate-responses-with-playbooks` },
  },
  {
    id: "sc200-d17",
    domainId: "operations",
    type: "single",
    prompt:
      "A playbook must call the API of a widely used SaaS product, such as ServiceNow or Teams, as one step in its Logic App. Which kind of connector should you use first?",
    options: [
      { id: "a", text: "A managed connector from the Logic Apps catalogue" },
      { id: "b", text: "A custom connector that you build from an OpenAPI definition" },
      { id: "c", text: "A Sentinel workbook" },
      { id: "d", text: "A data collection rule" },
    ],
    correct: ["a"],
    explanation:
      "Managed connectors wrap popular services and are the quickest option. A custom connector is the fallback when the service or API has no prebuilt connector.",
    difficulty: 1,
    reference: { label: "Connectors overview for Azure Logic Apps", url: `${docs}/connectors/connectors` },
  },
  {
    id: "sc200-d18",
    domainId: "operations",
    type: "single",
    prompt:
      "A parent ARM template deploys a nested template through a Microsoft.Resources/deployments resource, and you want template expressions such as parameters() to be evaluated in the nested template's own scope. What should you set expressionEvaluationOptions.scope to?",
    options: [
      { id: "a", text: "outer" },
      { id: "b", text: "inner" },
      { id: "c", text: "Incremental" },
      { id: "d", text: "Complete" },
    ],
    correct: ["b"],
    explanation:
      "inner evaluates expressions in the nested template using its own parameters and variables. The default outer scope evaluates them in the parent, and Incremental and Complete are deployment modes, not evaluation scopes.",
    difficulty: 3,
    reference: { label: "Linked and nested templates", url: `${docs}/azure/azure-resource-manager/templates/linked-templates` },
  },
  {
    id: "sc200-d19",
    domainId: "operations",
    type: "single",
    prompt:
      "Compliance requires 550 days of log data to stay queryable in the Microsoft Sentinel analytics tier. How should you meet this?",
    options: [
      { id: "a", text: "Set the interactive retention on the workspace or table to 550 days" },
      { id: "b", text: "Create a workbook that exports data each day" },
      { id: "c", text: "Apply a sensitivity label to the workspace" },
      { id: "d", text: "Enable a daily cap on the workspace" },
    ],
    correct: ["a"],
    explanation:
      "Interactive retention on the Log Analytics workspace or an individual table can be set up to 730 days, so 550 fits without any extra tiering. Workbooks only visualise data, labels classify content, and a daily cap limits ingestion.",
    difficulty: 2,
    reference: { label: "Configure data retention and archive in Azure Monitor Logs", url: `${docs}/azure/azure-monitor/logs/data-retention-configure` },
  },
  {
    id: "sc200-d20",
    domainId: "operations",
    type: "single",
    prompt:
      "You are adding the Analytics Efficiency workbook template in Microsoft Sentinel to see how well analytics rules perform. Which data must exist in the workspace for it to show results?",
    options: [
      { id: "a", text: "Incidents created from your analytics rules (the SecurityIncident table)" },
      { id: "b", text: "Only raw Windows security events" },
      { id: "c", text: "Watchlist items" },
      { id: "d", text: "Threat intelligence indicators" },
    ],
    correct: ["a"],
    explanation:
      "The workbook measures how rules turn into incidents and how those incidents are closed, so it reads incident data. Raw events, watchlists and indicators do not say anything about rule outcomes.",
    difficulty: 2,
    reference: { label: "Visualize and monitor your data with workbooks", url: `${docs}/azure/sentinel/monitor-your-data` },
  },
  {
    id: "sc200-d21",
    domainId: "operations",
    type: "single",
    prompt:
      "A workbook text control must display the friendly label of the selected time range, such as \"Last 24 hours\". Which reference should the text use, assuming the time range parameter is named TimeRange?",
    options: [
      { id: "a", text: "{TimeRange:label}" },
      { id: "b", text: "{TimeRange:query}" },
      { id: "c", text: "{TimeRange:start}" },
      { id: "d", text: "{TimeRange:escape}" },
    ],
    correct: ["a"],
    explanation:
      "The :label format returns the display name of the selection. :query gives a KQL time filter, :start gives the start time, and :escape is for escaping values in other contexts.",
    difficulty: 3,
    reference: { label: "Workbook parameters", url: `${docs}/azure/azure-monitor/visualize/workbooks-parameters` },
  },

  // ---------------------------------------------------------------- response
  {
    id: "sc200-d22",
    domainId: "response",
    type: "single",
    prompt:
      "An insider risk management alert for a departing employee needs deeper investigation with eDiscovery (Premium). What should you do first?",
    options: [
      { id: "a", text: "Confirm the alert and create an insider risk management case" },
      { id: "b", text: "Send the user a notice" },
      { id: "c", text: "Resolve the alert as benign" },
      { id: "d", text: "Add the user as a custodian to a new eDiscovery case" },
    ],
    correct: ["a"],
    explanation:
      "Escalation starts from an insider risk case, and from that case you can open an eDiscovery (Premium) case to collect and review content. Resolving the alert or only sending a notice does not escalate anything.",
    difficulty: 2,
    reference: { label: "Insider risk management cases", url: `${docs}/purview/insider-risk-management-cases` },
  },
  {
    id: "sc200-d23",
    domainId: "response",
    type: "single",
    prompt:
      "A team lead needs to see insider risk management alerts and analytics but must not be able to open Content explorer. Which role group fits?",
    options: [
      { id: "a", text: "Insider Risk Management Analysts" },
      { id: "b", text: "Insider Risk Management Investigators" },
      { id: "c", text: "Insider Risk Management Admins" },
      { id: "d", text: "Insider Risk Management Auditors" },
    ],
    correct: ["a"],
    explanation:
      "Analysts review alerts, cases and analytics but have no Content explorer access, whereas Investigators can also inspect activity content. Admins configure the solution, and Auditors work with the audit log of the solution.",
    difficulty: 2,
    reference: { label: "Insider risk management permissions", url: `${docs}/purview/insider-risk-management-configure` },
  },
  {
    id: "sc200-d24",
    domainId: "response",
    type: "single",
    prompt:
      "You are closing a Microsoft Sentinel incident. After investigating, you find the alerts were raised by an analytics rule whose query is faulty. Which classification is correct?",
    options: [
      { id: "a", text: "Benign positive – suspicious but expected" },
      { id: "b", text: "False positive – incorrect alert logic" },
      { id: "c", text: "False positive – incorrect data" },
      { id: "d", text: "True positive – suspicious activity" },
    ],
    correct: ["b"],
    explanation:
      "The alerts are false because the rule logic is wrong, which is precisely what the incorrect alert logic reason records. Incorrect data would be used when the input data was wrong, and benign positive means real but expected activity.",
    difficulty: 1,
    reference: { label: "Investigate incidents in Microsoft Sentinel", url: `${docs}/azure/sentinel/investigate-cases` },
  },
  {
    id: "sc200-d25",
    domainId: "response",
    type: "multi",
    prompt:
      "You are investigating a Defender XDR alert that you now believe belongs in a second incident, and the investigation is still ongoing. Which two actions in the Manage alert pane are appropriate? (Choose two.)",
    options: [
      { id: "a", text: "Use Link alert to another incident and select the target incident" },
      { id: "b", text: "Set the alert status to In progress" },
      { id: "c", text: "Type the second incident's ID into the comment field and do nothing else" },
      { id: "d", text: "Set the status to New" },
    ],
    correct: ["a", "b"],
    explanation:
      "Linking is a built-in action that moves the alert into the other incident, and In progress tells teammates that work is still under way. A comment only mentions the incident without associating it, and New would misstate the work as not yet started.",
    difficulty: 2,
    reference: { label: "Manage incidents in Microsoft Defender XDR", url: `${docs}/defender-xdr/manage-incidents` },
  },
  {
    id: "sc200-d26",
    domainId: "response",
    type: "multi",
    prompt:
      "Defender for Cloud Apps shows that an accountant accessed a risky IP address in breach of a policy, and you need to contain the risk right away. Which two governance actions are appropriate? (Choose two.)",
    options: [
      { id: "a", text: "Suspend the user until the case is reviewed" },
      { id: "b", text: "Notify the user and ask whether the activity was intentional" },
      { id: "c", text: "Sanction the cloud app" },
      { id: "d", text: "View how many files are shared publicly" },
    ],
    correct: ["a", "b"],
    explanation:
      "Suspending the user and contacting them are governance actions that act on the person involved. Sanctioning an app is an app-catalogue decision, and file-sharing views are reporting, neither of which contains this incident.",
    difficulty: 2,
    reference: { label: "Governance actions in Defender for Cloud Apps", url: `${docs}/defender-cloud-apps/governance-actions` },
  },
  {
    id: "sc200-d27",
    domainId: "response",
    type: "single",
    prompt:
      "Your manager asks which unsanctioned cloud apps employees use that may violate security policy. Which capability answers this?",
    options: [
      { id: "a", text: "Cloud Discovery in Microsoft Defender for Cloud Apps" },
      { id: "b", text: "Azure Monitor metrics" },
      { id: "c", text: "Microsoft Entra ID Protection risk detections" },
      { id: "d", text: "Azure Lighthouse" },
    ],
    correct: ["a"],
    explanation:
      "Cloud Discovery analyses traffic logs to identify apps in use, scores their risk, and lets you tag apps as sanctioned or unsanctioned. The other choices deal with metrics, identity risk and cross-tenant management.",
    difficulty: 1,
    reference: { label: "Set up Cloud Discovery", url: `${docs}/defender-cloud-apps/set-up-cloud-discovery` },
  },
  {
    id: "sc200-d28",
    domainId: "response",
    type: "multi",
    prompt:
      "You want a Cloud Discovery policy in Defender for Cloud Apps to detect new cloud apps in use across the IT department. Which two data sources provide the traffic data it needs? (Choose two.)",
    options: [
      { id: "a", text: "Integration with Microsoft Defender for Endpoint" },
      { id: "b", text: "Automatic log upload from firewalls and proxies" },
      { id: "c", text: "An app connector for a SaaS app" },
      { id: "d", text: "A naming convention for service accounts" },
    ],
    correct: ["a", "b"],
    explanation:
      "Cloud Discovery reads network traffic, from onboarded endpoints through the Defender for Endpoint integration or from firewall and proxy logs uploaded continuously. App connectors read API data from a single SaaS app rather than discovering others.",
    difficulty: 2,
    reference: { label: "Set up Cloud Discovery", url: `${docs}/defender-cloud-apps/set-up-cloud-discovery` },
  },
  {
    id: "sc200-d29",
    domainId: "response",
    type: "multi",
    prompt:
      "Microsoft Defender for Identity must be deployed to protect an Active Directory forest that also uses AD FS. Which three server types can host a sensor? (Choose three.)",
    options: [
      { id: "a", text: "Domain controllers" },
      { id: "b", text: "AD FS servers" },
      { id: "c", text: "AD CS servers" },
      { id: "d", text: "A standalone RADIUS server" },
      { id: "e", text: "A file server that is not part of the directory infrastructure" },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "Sensors run directly on domain controllers, AD FS and AD CS servers (and Microsoft Entra Connect servers), because they read local events and traffic. RADIUS and unrelated file servers can send data as event sources but do not host the sensor.",
    difficulty: 2,
    reference: { label: "What is Microsoft Defender for Identity?", url: `${docs}/defender-for-identity/what-is` },
  },
  {
    id: "sc200-d30",
    domainId: "response",
    type: "multi",
    prompt:
      "You want to confirm that Defender for Servers alerts fire on a test Windows VM. Which two actions from the documented alert validation procedure should you perform? (Choose two.)",
    options: [
      { id: "a", text: "Copy an executable such as cmd.exe to the machine and rename it to the documented test name (ASC_AlertTest_662jfi039N.exe)" },
      { id: "b", text: "Run the renamed executable from a command prompt, passing the documented argument" },
      { id: "c", text: "Create a DLP policy for the VM" },
      { id: "d", text: "Create a Syslog connector" },
    ],
    correct: ["a", "b"],
    explanation:
      "The validation alert is triggered by executing a copy of a benign binary that is named to match the known test pattern. DLP policies and connectors do not generate Defender for Servers alerts.",
    difficulty: 2,
    reference: { label: "Alert validation in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/alert-validation` },
  },

  // ----------------------------------------------------------------- hunting
  {
    id: "sc200-d31",
    domainId: "hunting",
    type: "multi",
    prompt:
      "A Defender XDR advanced hunting query looks for one process. You need to restrict it to the last 14 days and return the 50 most recent rows. Which two lines do you add? (Choose two.)",
    options: [
      { id: "a", text: "| where Timestamp > ago(14d)" },
      { id: "b", text: "| top 50 by Timestamp" },
      { id: "c", text: "| join Timestamp > ago(14d)" },
      { id: "d", text: "| limit Timestamp > ago(14d)" },
    ],
    correct: ["a", "b"],
    explanation:
      "where filters rows by the time window and top 50 by Timestamp sorts descending and keeps 50. join combines tables and does not filter by a predicate, and limit takes a row count, never a condition.",
    difficulty: 2,
    reference: { label: "top operator", url: `${docs}/kusto/query/top-operator` },
  },
  {
    id: "sc200-d32",
    domainId: "hunting",
    type: "single",
    prompt:
      "You want a Microsoft Sentinel analytics rule that alerts whenever anyone creates a storage account in Azure. Which query logic is correct?",
    options: [
      { id: "a", text: "AzureActivity | where OperationNameValue =~ \"MICROSOFT.STORAGE/STORAGEACCOUNTS/WRITE\" and ActivityStatusValue =~ \"Success\"" },
      { id: "b", text: "SecurityIncident | where Title has \"storage\"" },
      { id: "c", text: "SigninLogs | where AppDisplayName == \"Storage\"" },
      { id: "d", text: "Heartbeat | where Category == \"Storage\"" },
    ],
    correct: ["a"],
    explanation:
      "Azure control-plane operations, including creating or updating a resource, are recorded in AzureActivity with the operation name. Filtering on success avoids alerting on failed attempts. The other tables hold incidents, sign-ins and agent health, none of which record resource creation.",
    difficulty: 2,
    reference: { label: "AzureActivity table reference", url: `${docs}/azure/azure-monitor/reference/tables/azureactivity` },
  },
  {
    id: "sc200-d33",
    domainId: "hunting",
    type: "single",
    prompt:
      "You must list every delete operation performed on Azure resources, using the AzureActivity table. Which where clause is the best fit?",
    options: [
      { id: "a", text: "| where OperationNameValue endswith \"/DELETE\"" },
      { id: "b", text: "| where CategoryValue == \"Delete\"" },
      { id: "c", text: "| where Level == \"Delete\"" },
      { id: "d", text: "| where ResourceGroup == \"delete\"" },
    ],
    correct: ["a"],
    explanation:
      "Azure operation names end in the verb, for example .../DELETE, so an endswith on OperationNameValue finds them. CategoryValue holds categories such as Administrative or Policy, and Level holds severity.",
    difficulty: 2,
    reference: { label: "AzureActivity table reference", url: `${docs}/azure/azure-monitor/reference/tables/azureactivity` },
  },
  {
    id: "sc200-d34",
    domainId: "hunting",
    type: "single",
    prompt:
      "You want to know when any user creates an Azure role assignment on a subscription or resource. Which data source and operation should the detection query on?",
    options: [
      { id: "a", text: "AzureActivity, operation MICROSOFT.AUTHORIZATION/ROLEASSIGNMENTS/WRITE" },
      { id: "b", text: "SecurityIncident, filtering on incident title" },
      { id: "c", text: "The Windows Security Events connector, Event ID 4720" },
      { id: "d", text: "Azure Lighthouse delegation logs" },
    ],
    correct: ["a"],
    explanation:
      "Azure RBAC role assignments are control-plane writes to Microsoft.Authorization/roleAssignments and are captured in the Azure Activity log. SecurityIncident only shows incidents that already exist, and event 4720 is a local account creation. Entra directory role assignments would be found in AuditLogs instead.",
    difficulty: 3,
    reference: { label: "View activity logs to audit actions on resources", url: `${docs}/azure/azure-resource-manager/management/view-activity-logs` },
  },
  {
    id: "sc200-d35",
    domainId: "hunting",
    type: "statements",
    scenario:
      "A manager asks you to compare traffic trends over the past ten days in a Sentinel workbook. You write:\n\nCommonSecurityLog\n| where TimeGenerated > ago(10d)\n| summarize Events = count() by bin(TimeGenerated, 1d)\n| render timechart",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The query returns one row per day that has events.", correct: true },
      { id: "b", text: "Changing bin(TimeGenerated, 1d) to bin(TimeGenerated, 1h) gives hourly counts.", correct: true },
      { id: "c", text: "render timechart filters the rows so that only recent data is included.", correct: false },
      { id: "d", text: "The ago(10d) filter should appear after summarize for best performance.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "summarize with bin creates a bucket per day and the bin width controls the granularity. render only affects visualisation, and filtering by time before summarizing is best practice because it reduces the data processed.",
    difficulty: 2,
    reference: { label: "bin function", url: `${docs}/kusto/query/bin-function` },
  },
  {
    id: "sc200-d36",
    domainId: "hunting",
    type: "multi",
    prompt:
      "In Microsoft Sentinel hunting you found rows in query results that suggest active malicious activity, and you want to keep them with context for later investigation. Which two actions should you take? (Choose two.)",
    options: [
      { id: "a", text: "Select the relevant result rows and choose Add bookmark" },
      { id: "b", text: "Add tags and notes in the bookmark pane before saving" },
      { id: "c", text: "Edit the query description and save the query" },
      { id: "d", text: "Delete the query to remove noise" },
    ],
    correct: ["a", "b"],
    explanation:
      "Bookmarks preserve selected result rows, and tags and notes make them easy to find and understand later, including when you attach them to incidents. Editing the query definition does not retain the rows that matched.",
    difficulty: 1,
    reference: { label: "Bookmarks in Microsoft Sentinel", url: `${docs}/azure/sentinel/bookmarks` },
  },
];
