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
      { id: "c", text: "GET /api/vulnerabilities/{cveId}/software" },
      { id: "d", text: "GET /api/machines/{machineId}/vulnerabilities" },
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
      { id: "a", text: "A Microsoft Purview DLP policy that blocks script content on managed devices" },
      { id: "b", text: "A sensitivity label with encryption on script files" },
      { id: "c", text: "Attack surface reduction rules, such as blocking obfuscated scripts" },
      { id: "d", text: "A data retention policy for the device's local files" },
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
      "Microsoft Defender for Cloud shows a security recommendation that does not apply to a specific resource because a compensating control is in place. You want the resource excluded from the secure score calculation and the reason recorded. What should you use?",
    options: [
      { id: "a", text: "An alert suppression rule scoped to the resource" },
      { id: "b", text: "A recommendation exemption marked Mitigated or Risk accepted" },
      { id: "c", text: "Disabling the Defender plan on the subscription" },
      { id: "d", text: "A data loss prevention policy applied to the resource's resource group" },
    ],
    correct: ["b"],
    explanation:
      "Exemptions apply to a recommendation for a resource, resource group, subscription or management group, with a Mitigated or Risk accepted justification, and exempted resources no longer count against the secure score. Suppression rules only hide alerts and leave recommendations and secure score untouched.",
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
      { id: "a", text: "The rule reached the expiration date that was set on it" },
      { id: "b", text: "The alerts now differ from the criteria the rule was written for" },
      { id: "c", text: "The rule was not run through Simulate before it was saved" },
      { id: "d", text: "The subscription that the rule covers was renamed recently" },
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
      { id: "a", text: "Azure Arc-enable the servers, or connect the other cloud account" },
      { id: "b", text: "Deploy Azure Migrate on each server to replicate it" },
      { id: "c", text: "Enable the Defender for Servers plan on the Arc subscription" },
      { id: "d", text: "Deploy Azure SQL Edge to each server as a sensor" },
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
      { id: "a", text: "An IAM user with a static access key pair for Defender for Cloud" },
      { id: "b", text: "An IAM role assumed through federated identity, created by CloudFormation" },
      { id: "c", text: "A user risk policy in Entra ID Protection that signs in to AWS" },
      { id: "d", text: "A Microsoft Graph application permission that is granted to the connector app" },
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
      { id: "a", text: "*.handler.control.monitor.azure.com (control plane)" },
      { id: "b", text: "*.ods.opinsights.azure.com (workspace ingestion)" },
      { id: "c", text: "*.ingest.monitor.azure.com (DCE ingestion)" },
      { id: "d", text: "*.azure.com (all Azure services, one rule)" },
      { id: "e", text: "*.opinsights.azure.com (all Log Analytics hosts)" },
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
      { id: "c", text: "Microsoft Sentinel Contributor can create and edit analytics rules.", correct: true },
      { id: "d", text: "A user who builds playbooks needs Logic App Contributor in addition to a Sentinel role.", correct: true },
      { id: "e", text: "Creating or deleting workbooks needs the Workbook Contributor role as well as a Sentinel role.", correct: true },
    ],
    correct: ["a", "c", "d", "e"],
    explanation:
      "Reader is read-only, Responder adds incident management, and Contributor adds authoring of rules and other resources. Playbooks are Azure Logic Apps resources and workbooks are Azure Monitor workbook resources, so building either needs the matching Azure role (Logic App Contributor, Workbook Contributor) on top of the Sentinel role.",
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
      { id: "b", text: "Collect Event ID 4720 (user account created) from domain controllers" },
      { id: "c", text: "Choose an event set other than None on the data connector" },
      { id: "d", text: "Deploy the Entra ID Protection connector and enable its incidents" },
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
      "A Logic App you built cannot be selected as a playbook in a Microsoft Sentinel automation rule, because it has no Sentinel trigger. What should you do?",
    options: [
      { id: "a", text: "Assign the Microsoft Sentinel Reader role to the Logic App's identity" },
      { id: "b", text: "Add a Microsoft Sentinel trigger (incident, alert or entity) to the Logic App" },
      { id: "c", text: "Recreate the workflow as a scheduled analytics rule using the same actions" },
      { id: "d", text: "Export the Logic App and import it as an Azure Automation runbook" },
    ],
    correct: ["b"],
    explanation:
      "Sentinel can only invoke a playbook that starts with a Microsoft Sentinel trigger for incidents, alerts or entities. Adding that trigger makes the Logic App selectable. Roles, analytics rules and runbooks do not supply a trigger.",
    difficulty: 2,
    reference: { label: "Supported triggers and actions in Microsoft Sentinel playbooks", url: `${docs}/azure/sentinel/automation/playbook-triggers-actions` },
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
      { id: "a", text: "Set interactive retention to 550 days on the workspace or table" },
      { id: "b", text: "Create a workbook that exports the data to a file each day" },
      { id: "c", text: "Apply a sensitivity label to the workspace's resource group" },
      { id: "d", text: "Enable a daily cap on the workspace to control data volume" },
    ],
    correct: ["a"],
    explanation:
      "Interactive retention on the Log Analytics workspace or an individual table can be set up to 730 days, so 550 fits without any extra tiering. Workbooks only visualise data, labels classify content, and a daily cap limits ingestion.",
    difficulty: 2,
    reference: { label: "Configure data retention and archive in Azure Monitor Logs", url: `${docs}/azure/azure-monitor/logs/data-retention-configure` },
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
      { id: "d", text: "Add the user as a custodian to a new eDiscovery (Premium) case directly" },
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
      { id: "a", text: "Suspend the user in the app until the case has been reviewed" },
      { id: "b", text: "Notify the user and ask whether the activity was intentional" },
      { id: "c", text: "Sanction the cloud app in the app catalogue for all users" },
      { id: "d", text: "View how many files are shared publicly across the tenant" },
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
    type: "single",
    prompt:
      "You have configured email notifications and a workflow automation in Defender for Cloud and want to test them without touching any machines. What should you do?",
    options: [
      { id: "a", text: "Re-enable each Defender plan so it regenerates its historical alerts" },
      { id: "b", text: "Import alert JSON files from another tenant into the workspace" },
      { id: "c", text: "Create sample alerts from the Security alerts page for selected Defender plans" },
      { id: "d", text: "Lower the severity threshold so recommendations are converted into alerts" },
    ],
    correct: ["c"],
    explanation:
      "Sample alerts, created by a Subscription Contributor from the Security alerts page, appear like real alerts for simulated resources and flow to email notifications, SIEM exports and workflow automation. The other options do not produce test alerts. The older approach of renaming an executable to ASC_AlertTest_662jfi039N.exe has been replaced in current guidance.",
    difficulty: 2,
    reference: { label: "Validate alerts in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/alert-validation` },
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
      { id: "a", text: "AzureActivity | where OperationNameValue =~ \"MICROSOFT.STORAGE/STORAGEACCOUNTS/WRITE\" | where ActivityStatusValue in~ (\"Success\", \"Succeeded\")" },
      { id: "b", text: "AzureActivity | where OperationNameValue =~ \"MICROSOFT.STORAGE/STORAGEACCOUNTS/READ\" | where ActivityStatusValue in~ (\"Success\", \"Succeeded\")" },
      { id: "c", text: "SigninLogs | where AppDisplayName == \"Azure Portal\" | where ResultType == 0 | where ResourceDisplayName has \"storage\"" },
      { id: "d", text: "AzureActivity | where OperationNameValue =~ \"MICROSOFT.STORAGE/STORAGEACCOUNTS/WRITE\" | where ActivityStatusValue in~ (\"Failure\", \"Failed\")" },
    ],
    correct: ["a"],
    explanation:
      "Azure control-plane operations, including creating or updating a resource, are recorded in AzureActivity with the operation name, and filtering on a successful status avoids alerting on failed attempts. The READ variant would fire on every read of an account, the failure variant would only catch attempts that did not succeed, and SigninLogs records sign-ins rather than resource creation.",
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
      { id: "b", text: "| where CategoryValue has \"Delete\" and Level != \"Informational\"" },
      { id: "c", text: "| where Level == \"Delete\" or ActivityStatusValue == \"Deleted\"" },
      { id: "d", text: "| where ResourceGroup =~ \"delete\" or SubscriptionId has \"delete\"" },
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
      { id: "b", text: "SecurityIncident, filtering existing incidents on the title text of the alert" },
      { id: "c", text: "The Windows Security Events connector, Event ID 4720 only" },
      { id: "d", text: "Azure Lighthouse delegation logs for the managed tenant" },
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
      { id: "c", text: "Edit the query description and save the query again" },
      { id: "d", text: "Delete the query so the noisy rows stop appearing" },
    ],
    correct: ["a", "b"],
    explanation:
      "Bookmarks preserve selected result rows, and tags and notes make them easy to find and understand later, including when you attach them to incidents. Editing the query definition does not retain the rows that matched.",
    difficulty: 1,
    reference: { label: "Bookmarks in Microsoft Sentinel", url: `${docs}/azure/sentinel/bookmarks` },
  },

  // ===================================================== batch 2 (second PDF)
  // -------------------------------------------------------------- operations
  {
    id: "sc200-d37",
    domainId: "operations",
    type: "single",
    prompt:
      "You need to give a group of junior analysts the ability to run existing Microsoft Sentinel playbooks on incidents, without letting them create or edit the playbooks. Which role should you assign?",
    options: [
      { id: "a", text: "Microsoft Sentinel Playbook Operator" },
      { id: "b", text: "Logic App Contributor" },
      { id: "c", text: "Microsoft Sentinel Automation Contributor" },
      { id: "d", text: "Microsoft Sentinel Contributor" },
    ],
    correct: ["a"],
    explanation:
      "Playbook Operator lets a user list and manually run playbooks. Logic App Contributor is what lets someone create and edit them, and Automation Contributor is the role granted to the Sentinel service itself so that automation rules can run playbooks, not to people.",
    difficulty: 2,
    reference: { label: "Roles and permissions in Microsoft Sentinel", url: `${docs}/azure/sentinel/roles` },
  },
  {
    id: "sc200-d38",
    domainId: "operations",
    type: "single",
    prompt:
      "An analyst must be able to create and delete Microsoft Sentinel workbooks and nothing else beyond read access. Which role assignment meets this with the least privilege?",
    options: [
      { id: "a", text: "Microsoft Sentinel Responder on its own" },
      { id: "b", text: "Logic App Contributor plus Microsoft Sentinel Reader" },
      { id: "c", text: "Microsoft Sentinel Contributor on its own" },
      { id: "d", text: "Microsoft Sentinel Reader plus Workbook Contributor" },
    ],
    correct: ["d"],
    explanation:
      "Creating or deleting workbooks needs the Workbook Contributor role together with a Sentinel role, and Reader is the lowest that qualifies. None of the Sentinel roles alone grants workbook authoring, and Logic App Contributor only concerns playbooks.",
    difficulty: 3,
    reference: { label: "Roles and permissions in Microsoft Sentinel", url: `${docs}/azure/sentinel/roles` },
  },
  {
    id: "sc200-d39",
    domainId: "operations",
    type: "statements",
    scenario:
      "Your team uses Microsoft Defender for Cloud and follows least privilege when granting Azure roles at subscription scope.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Security Admin can edit security policies and enable or disable Defender plans.", correct: true },
      { id: "b", text: "Security Reader can dismiss alerts and edit security policies.", correct: false },
      { id: "c", text: "Applying a recommendation's Fix to a resource requires Contributor or Owner rights on that resource, which Security Admin alone does not provide.", correct: true },
    ],
    correct: ["a", "c"],
    explanation:
      "Security Admin manages Defender for Cloud settings and policy, whereas remediating a resource is a change to the resource itself and so needs write access to it. Security Reader is strictly read-only.",
    difficulty: 3,
    reference: { label: "Roles and permissions in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/permissions` },
  },
  {
    id: "sc200-d40",
    domainId: "operations",
    type: "single",
    prompt:
      "You must limit management-port exposure on the virtual machines in one resource group so that only RDP can be requested, for at most two hours per request, with minimal administrative effort. What should you configure?",
    options: [
      { id: "a", text: "A just-in-time access policy in Defender for Cloud (Servers Plan 2)" },
      { id: "b", text: "Microsoft Entra Privileged Identity Management for role activation" },
      { id: "c", text: "Azure Front Door with a web application firewall policy" },
      { id: "d", text: "Azure Bastion deployed into a new subnet for each VM" },
    ],
    correct: ["a"],
    explanation:
      "JIT policies let you choose the ports, protocol, allowed source and maximum request time per VM, and Defender for Cloud then opens NSG rules only for approved requests. PIM controls role activation, not network access, and Front Door is a web edge service.",
    difficulty: 2,
    reference: { label: "Just-in-time machine access", url: `${docs}/azure/defender-for-cloud/just-in-time-access-overview` },
  },
  {
    id: "sc200-d41",
    domainId: "operations",
    type: "single",
    prompt:
      "A third-party SIEM must receive high-severity Microsoft Defender for Cloud alerts continuously. Which continuous export target should you choose?",
    options: [
      { id: "a", text: "Azure Event Hubs" },
      { id: "b", text: "Azure Cosmos DB" },
      { id: "c", text: "Azure Data Lake Storage" },
      { id: "d", text: "Azure Event Grid" },
    ],
    correct: ["a"],
    explanation:
      "Continuous export supports a Log Analytics workspace and Event Hubs, and Event Hubs is the standard way to stream data to external SIEMs. Cosmos DB, Data Lake and Event Grid are not supported export destinations.",
    difficulty: 2,
    reference: { label: "Continuously export Defender for Cloud data", url: `${docs}/azure/defender-for-cloud/continuous-export` },
  },
  {
    id: "sc200-d42",
    domainId: "operations",
    type: "single",
    prompt:
      "A third-party SIEM must alert on Microsoft Entra sign-in events in near real time. How should you route the events?",
    options: [
      { id: "a", text: "Diagnostic settings in Entra ID that stream sign-in logs to an event hub" },
      { id: "b", text: "Diagnostic settings that archive all sign-in logs to a storage account daily" },
      { id: "c", text: "Enable the Security Events connector and query from Sentinel" },
      { id: "d", text: "Export the sign-in report to CSV each day and forward it" },
    ],
    correct: ["a"],
    explanation:
      "Streaming to an event hub is the supported near-real-time integration for external SIEM tools. Storage archival is batch and slow, and a Sentinel connector is not a route to a third-party product.",
    difficulty: 2,
    reference: { label: "Stream Microsoft Entra logs to an event hub", url: `${docs}/entra/identity/monitoring-health/howto-stream-logs-to-event-hub` },
  },
  {
    id: "sc200-d43",
    domainId: "operations",
    type: "single",
    prompt:
      "You connect an AWS account to Defender for Cloud and want Azure Arc to be deployed automatically to existing and future EC2 instances that have no agents. What must the instances already have for the automatic Arc onboarding to work?",
    options: [
      { id: "a", text: "AWS Systems Manager (SSM) agent" },
      { id: "b", text: "The Azure Pipelines agent" },
      { id: "c", text: "The Dependency agent" },
      { id: "d", text: "An Azure VM Agent" },
    ],
    correct: ["a"],
    explanation:
      "Auto-provisioning of the Azure Connected Machine agent on EC2 is executed through AWS Systems Manager, so SSM must be installed and the instances must be managed by it. The other agents are unrelated to Arc deployment.",
    difficulty: 3,
    reference: { label: "Connect your AWS account to Defender for Cloud", url: `${docs}/azure/defender-for-cloud/quickstart-onboard-aws` },
  },
  {
    id: "sc200-d44",
    domainId: "operations",
    type: "single",
    prompt:
      "You are onboarding a Google Cloud organization to Defender for Cloud and want every project created in the future to be onboarded automatically. What should you choose in the connector?",
    options: [
      { id: "a", text: "Onboard the GCP organization instead of a single project" },
      { id: "b", text: "Onboard each project individually and repeat quarterly" },
      { id: "c", text: "Enable Security Health Analytics only" },
      { id: "d", text: "Use a Log Analytics agent installation script on new projects" },
    ],
    correct: ["a"],
    explanation:
      "Connecting at organization scope makes Defender for Cloud discover the projects under it, including ones created afterwards. A single-project connector covers only that project.",
    difficulty: 2,
    reference: { label: "Connect your GCP project or organization", url: `${docs}/azure/defender-for-cloud/quickstart-onboard-gcp` },
  },
  {
    id: "sc200-d45",
    domainId: "operations",
    type: "single",
    prompt:
      "You need Defender for Cloud to assess the repositories in a GitHub account. What should you do first in the Defender for Cloud portal?",
    options: [
      { id: "a", text: "Add a GitHub environment under Environment settings" },
      { id: "b", text: "Enable the Defender for Servers plan on the subscription" },
      { id: "c", text: "Enable continuous export to a Log Analytics workspace" },
      { id: "d", text: "Create a suppression rule for the repositories' alerts" },
    ],
    correct: ["a"],
    explanation:
      "DevOps security starts by connecting the source-control system as an environment, which installs the GitHub app and lets Defender for Cloud discover repositories. Plans and exports come after that.",
    difficulty: 1,
    reference: { label: "Connect your GitHub organization", url: `${docs}/azure/defender-for-cloud/quickstart-onboard-github` },
  },
  {
    id: "sc200-d46",
    domainId: "operations",
    type: "single",
    prompt:
      "Defender for Cloud must surface exposed secrets found in the repositories of an Azure DevOps organization. What must be enabled on those repositories?",
    options: [
      { id: "a", text: "Azure Key Vault soft delete and purge protection" },
      { id: "b", text: "The CredScan tool in the Microsoft Security DevOps extension" },
      { id: "c", text: "GitHub Advanced Security for Azure DevOps" },
      { id: "d", text: "Just-in-time access on the pipeline build agents" },
    ],
    correct: ["c"],
    explanation:
      "Secret scanning findings for Azure DevOps repositories now come from GitHub Advanced Security for Azure DevOps and are surfaced in Defender for Cloud. The CredScan tool in the Microsoft Security DevOps extension was deprecated in September 2023, and Key Vault or JIT settings have no bearing on repository scanning.",
    difficulty: 3,
    reference: { label: "Protect code repository secrets with Defender for Cloud", url: `${docs}/azure/defender-for-cloud/secrets-scanning-code` },
  },
  {
    id: "sc200-d47",
    domainId: "operations",
    type: "single",
    prompt:
      "You deploy Sentinel data connectors with Azure Policy and want the configuration to apply to newly created resources and, through remediation, to existing ones as well. Which policy effect should the definition use?",
    options: [
      { id: "a", text: "DeployIfNotExists, with a remediation task" },
      { id: "b", text: "Audit, which only reports non-compliance" },
      { id: "c", text: "Deny, which blocks the deployment" },
      { id: "d", text: "Disabled, which turns the policy off" },
    ],
    correct: ["a"],
    explanation:
      "DeployIfNotExists deploys the missing configuration when a resource is created or updated, and a remediation task can apply it to resources that already exist. Audit only reports and Deny only blocks.",
    difficulty: 2,
    reference: { label: "Azure Policy definition effects", url: `${docs}/azure/governance/policy/concepts/effects` },
  },
  {
    id: "sc200-d48",
    domainId: "operations",
    type: "single",
    prompt:
      "Management asks for time to triage and time to closure metrics for incidents over the last 30 days. Which Microsoft Sentinel workbook template provides these metrics?",
    options: [
      { id: "a", text: "Security Operations Efficiency" },
      { id: "b", text: "Analytics Efficiency" },
      { id: "c", text: "Event Analyzer" },
      { id: "d", text: "Investigation Insights" },
    ],
    correct: ["a"],
    explanation:
      "The Security Operations Efficiency workbook reports SOC metrics such as time to triage, time to closure and incident volumes. Analytics Efficiency looks at rule performance, and the other two workbooks support investigations rather than SOC metrics.",
    difficulty: 2,
    reference: { label: "Manage SOC efficiency in Microsoft Sentinel", url: `${docs}/azure/sentinel/manage-soc-with-incident-metrics` },
  },
  {
    id: "sc200-d50",
    domainId: "operations",
    type: "single",
    prompt:
      "The built-in Fusion analytics rule is enabled in a new Microsoft Sentinel workspace but never generates alerts. What must you do for it to be able to detect multistage attacks?",
    options: [
      { id: "a", text: "Connect the data sources whose signals Fusion correlates" },
      { id: "b", text: "Disable the rule and re-enable it after a short wait" },
      { id: "c", text: "Create a hunting bookmark for each suspicious entity" },
      { id: "d", text: "Add a watchlist that contains every user in the tenant" },
    ],
    correct: ["a"],
    explanation:
      "Fusion correlates alerts from different products, so it can only fire when those sources are feeding the workspace. Toggling the rule does not supply any data.",
    difficulty: 2,
    reference: { label: "Advanced multistage attack detection in Microsoft Sentinel", url: `${docs}/azure/sentinel/fusion` },
  },
  {
    id: "sc200-d51",
    domainId: "operations",
    type: "single",
    prompt:
      "A custom scheduled analytics rule has been switched off automatically and its name now starts with AUTO DISABLED. Which of the following is a documented cause of this state?",
    options: [
      { id: "a", text: "Permissions to one of the data sources used by the rule query were changed" },
      { id: "b", text: "Occasional connectivity blips between a data source and Log Analytics" },
      { id: "c", text: "The rule query took a little too long on one run" },
      { id: "d", text: "An analyst opened the rule in the wizard" },
    ],
    correct: ["a"],
    explanation:
      "Sentinel auto-disables a rule after persistent failures, such as a deleted table or workspace, an invalid function it uses, or lost access to a data source. Transient issues like a single timeout or brief connectivity problem cause intermittent failures but not a permanent disable.",
    difficulty: 3,
    reference: { label: "Troubleshoot analytics rules", url: `${docs}/azure/sentinel/troubleshoot-analytics-rules` },
  },
  {
    id: "sc200-d52",
    domainId: "operations",
    type: "single",
    prompt:
      "A test analytics rule must alert on inbound access by test user accounts and the alerts must be grouped into one incident per user account. Which configuration achieves this?",
    options: [
      { id: "a", text: "Map the Account entity, then group alerts when the selected entity matches" },
      { id: "b", text: "Group all alerts from the rule into one single incident covering every user" },
      { id: "c", text: "Turn on suppression for 24 hours after each alert is generated" },
      { id: "d", text: "Raise the rule severity to High so each user's alerts are merged" },
    ],
    correct: ["a"],
    explanation:
      "Entity mapping makes the account a first-class entity, and the incident settings can then group alerts by matching entities so each user gets their own incident. Suppression and severity do not affect grouping.",
    difficulty: 2,
    reference: { label: "Create custom analytics rules", url: `${docs}/azure/sentinel/detect-threats-custom` },
  },
  {
    id: "sc200-d53",
    domainId: "operations",
    type: "ordering",
    prompt:
      "You need Microsoft Defender for Cloud to run a Logic App automatically when a specific alert appears, and to confirm it works. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Create a Logic App that starts with a Defender for Cloud alert trigger" },
      { id: "b", text: "Add a workflow automation in Defender for Cloud and filter on the alert name" },
      { id: "c", text: "Select the Logic App as the action and save the automation" },
      { id: "d", text: "Generate a test alert and check the Logic App run history" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The Logic App has to exist first so the automation can point at it. The automation defines when it runs (filters on alert names or severity) and what it calls, and only then can you validate end to end with a test alert.",
    difficulty: 2,
    reference: { label: "Use workflow automation in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/workflow-automation` },
  },
  {
    id: "sc200-d54",
    domainId: "operations",
    type: "single",
    prompt:
      "Employees who work outside the head office must be forced to use MFA, while people in the office are not prompted. Which Conditional Access element makes the office distinguishable?",
    options: [
      { id: "a", text: "A trusted named location used in the policy's location condition" },
      { id: "b", text: "A user risk policy that requires MFA when Entra ID reports medium risk" },
      { id: "c", text: "A fraud alert setting configured in the MFA service" },
      { id: "d", text: "A sign-in frequency control applied on its own" },
    ],
    correct: ["a"],
    explanation:
      "Named locations let a policy target any location and exclude the trusted office network, so MFA applies only to remote sign-ins. Risk policies react to detected risk, not to where the user is working.",
    difficulty: 1,
    reference: { label: "Conditional Access location condition", url: `${docs}/entra/identity/conditional-access/concept-assignment-network` },
  },
  {
    id: "sc200-d55",
    domainId: "operations",
    type: "multi",
    prompt:
      "Users must be able to open a remote shell to Windows devices from the Defender portal with least privilege. Which two things must be in place? (Choose two.)",
    options: [
      { id: "a", text: "Turn on live response in the Defender for Endpoint advanced features" },
      { id: "b", text: "Assign analysts a role that includes basic live response permission" },
      { id: "c", text: "Assign the Global Administrator role to each analyst who needs access" },
      { id: "d", text: "Enable custom network indicators for the tenant's device groups" },
    ],
    correct: ["a", "b"],
    explanation:
      "Live response has to be enabled tenant-wide and each user needs the live response permission, with basic being enough for read-only commands. Global Administrator is far more than needed, and network indicators are unrelated.",
    difficulty: 2,
    reference: { label: "Investigate entities on devices using live response", url: `${docs}/defender-endpoint/live-response` },
  },
  {
    id: "sc200-d56",
    domainId: "operations",
    type: "single",
    prompt:
      "You want Defender for Endpoint to block or allow specific IP addresses and URLs through indicators. Which advanced feature must be enabled for these network indicators to be enforced?",
    options: [
      { id: "a", text: "Custom network indicators, with network protection in block mode" },
      { id: "b", text: "EDR in block mode, applied to all onboarded devices in the tenant" },
      { id: "c", text: "Live response for servers, with unsigned scripts allowed" },
      { id: "d", text: "Web content filtering for the selected device groups" },
    ],
    correct: ["a"],
    explanation:
      "IP and URL indicators depend on the custom network indicators setting and network protection being enforced on the endpoints. EDR in block mode remediates malicious artefacts after detection and is not what blocks addresses.",
    difficulty: 3,
    reference: { label: "Create indicators for IPs and URLs/domains", url: `${docs}/defender-endpoint/indicator-ip-domain` },
  },
  {
    id: "sc200-d57",
    domainId: "operations",
    type: "multi",
    prompt:
      "Apps tagged as Unsanctioned in Defender for Cloud Apps must be blocked on Windows devices onboarded to Defender for Endpoint. Which two settings must be enabled? (Choose two.)",
    options: [
      { id: "a", text: "In Endpoints > Advanced features, turn on Custom network indicators" },
      { id: "b", text: "Edit the anomaly detection policies so they include the apps" },
      { id: "c", text: "Change the device onboarding method to Group Policy scripts" },
      { id: "d", text: "In Cloud Discovery > Defender for Endpoint, select Enforce app access" },
    ],
    correct: ["a", "d"],
    explanation:
      "Unsanctioned app domains are synced to Defender for Endpoint and blocked by network protection once Enforce app access is on and custom network indicators are enabled. Anomaly detection policies and the onboarding method do not control app blocking.",
    difficulty: 3,
    reference: { label: "Govern discovered apps using Defender for Endpoint", url: `${docs}/defender-cloud-apps/mde-govern` },
  },

  // ---------------------------------------------------------------- response
  {
    id: "sc200-d58",
    domainId: "response",
    type: "meets-goal",
    scenario:
      "You are configuring Microsoft Defender for Identity. You need to create several decoy accounts that are designed to be attacked, so any activity involving them raises an alert.",
    prompt: "Solution: You tag the accounts as Honeytoken accounts in the entity tags settings.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "Honeytoken accounts are decoys with no legitimate use, so any sign-in attempt or change involving them is treated as suspicious and alerts fire.",
    difficulty: 2,
    reference: { label: "Manage sensitive and honeytoken accounts", url: `${docs}/defender-for-identity/entity-tags` },
  },
  {
    id: "sc200-d59",
    domainId: "response",
    type: "meets-goal",
    scenario:
      "You are configuring Microsoft Defender for Identity. You need to create several decoy accounts that are designed to be attacked, so any activity involving them raises an alert.",
    prompt: "Solution: You configure a sign-in risk policy in Microsoft Entra ID Protection.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "A sign-in risk policy reacts to risk detections on real sign-ins. It does not mark any account as a decoy for Defender for Identity.",
    difficulty: 2,
    reference: { label: "Manage sensitive and honeytoken accounts", url: `${docs}/defender-for-identity/entity-tags` },
  },
  {
    id: "sc200-d60",
    domainId: "response",
    type: "meets-goal",
    scenario:
      "You are configuring Microsoft Defender for Identity. You need to create several decoy accounts that are designed to be attacked, so any activity involving them raises an alert.",
    prompt: "Solution: You add each account as a Sensitive account.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Sensitive tagging raises the profile of accounts that matter, such as administrators, so they get extra scrutiny. It is the opposite of a decoy, which is what honeytoken tagging provides.",
    difficulty: 2,
    reference: { label: "Manage sensitive and honeytoken accounts", url: `${docs}/defender-for-identity/entity-tags` },
  },
  {
    id: "sc200-d61",
    domainId: "response",
    type: "single",
    prompt:
      "Defender for Cloud Apps raises many impossible travel alerts for people who sign in from the company's offices in different cities. Which action best reduces these false positives without weakening detection elsewhere?",
    options: [
      { id: "a", text: "Set the impossible travel sensitivity slider to High" },
      { id: "b", text: "Tag the office IP ranges as Corporate in IP address ranges" },
      { id: "c", text: "Disable the impossible travel policy for every user" },
      { id: "d", text: "Create a file policy that exempts the office locations" },
    ],
    correct: ["b"],
    explanation:
      "When both sides of a trip come from IP addresses tagged as corporate, the travel is treated as trusted and does not trigger the detection, unless the sensitivity slider is set to High. Raising sensitivity therefore has the opposite effect, and disabling the policy removes the detection entirely.",
    difficulty: 2,
    reference: { label: "Anomaly detection policies", url: `${docs}/defender-cloud-apps/anomaly-detection-policy` },
  },
  {
    id: "sc200-d62",
    domainId: "response",
    type: "single",
    prompt:
      "You want an alert when a user signs in from a country that has never or rarely been used by anyone else in the organisation. Which Defender for Cloud Apps anomaly detection policy covers this?",
    options: [
      { id: "a", text: "Activity from infrequent country" },
      { id: "b", text: "Impossible travel" },
      { id: "c", text: "Activity from anonymous IP addresses" },
      { id: "d", text: "Malware detection" },
    ],
    correct: ["a"],
    explanation:
      "Activity from infrequent country compares the location with what the tenant normally sees. Impossible travel compares one user's consecutive locations, and the other policies look at anonymising infrastructure and malware.",
    difficulty: 2,
    reference: { label: "Anomaly detection policies", url: `${docs}/defender-cloud-apps/anomaly-detection-policy` },
  },
  {
    id: "sc200-d63",
    domainId: "response",
    type: "multi",
    prompt:
      "You need Defender for Cloud Apps to alert on, and remediate, external sharing of confidential files. Which two actions are needed? (Choose two.)",
    options: [
      { id: "a", text: "Enable file monitoring in the Information Protection settings" },
      { id: "b", text: "Create a file policy that matches the label and sets governance actions" },
      { id: "c", text: "Create an anomaly detection policy that watches external sharing" },
      { id: "d", text: "Add the sharing site to the sanctioned apps list in the catalogue" },
    ],
    correct: ["a", "b"],
    explanation:
      "Files are only visible to policies once file monitoring is on, and a file policy defines what to match and how to respond, such as alerting or removing external sharing. Anomaly detection and app tagging do not inspect file content.",
    difficulty: 2,
    reference: { label: "File policies in Defender for Cloud Apps", url: `${docs}/defender-cloud-apps/data-protection-policies` },
  },
  {
    id: "sc200-d64",
    domainId: "response",
    type: "single",
    prompt:
      "You need to see every change made to sensitivity labels across your Microsoft 365 tenant over the last seven days. Where should you look?",
    options: [
      { id: "a", text: "Activity explorer in Microsoft Purview" },
      { id: "b", text: "The Incidents queue in the Defender portal" },
      { id: "c", text: "DLP alert settings" },
      { id: "d", text: "Explorer in Defender for Office 365" },
    ],
    correct: ["a"],
    explanation:
      "Activity explorer records labelling events such as a label being applied, changed or removed and lets you filter by time. Incidents and DLP alerts only show detections, and Explorer covers email threats.",
    difficulty: 2,
    reference: { label: "Get started with activity explorer", url: `${docs}/purview/data-classification-activity-explorer` },
  },
  {
    id: "sc200-d65",
    domainId: "response",
    type: "single",
    prompt:
      "In the Defender portal you must quickly list all the entities, such as files, mailboxes and IPs, that are involved in an incident. Which tab should you use?",
    options: [
      { id: "a", text: "Evidence and Response" },
      { id: "b", text: "Investigations" },
      { id: "c", text: "Devices" },
      { id: "d", text: "Alerts" },
    ],
    correct: ["a"],
    explanation:
      "Evidence and Response aggregates the suspicious entities across all alerts in the incident and shows their remediation status. The Alerts tab lists alerts, and Devices shows just one entity type.",
    difficulty: 1,
    reference: { label: "Investigate incidents in Microsoft Defender XDR", url: `${docs}/defender-xdr/investigate-incidents` },
  },
  {
    id: "sc200-d66",
    domainId: "response",
    type: "single",
    prompt:
      "The Defender for Identity secure score reports unsecure Kerberos delegation on several computer accounts. How do you remediate it?",
    options: [
      { id: "a", text: "Change flagged accounts to constrained or resource-based delegation, or remove it" },
      { id: "b", text: "Install LAPS on the flagged computers to randomise admin passwords" },
      { id: "c", text: "Enforce LDAP signing and channel binding on the flagged computers and domain controllers" },
      { id: "d", text: "Grant those computers Trust this computer for delegation to any service" },
    ],
    correct: ["a"],
    explanation:
      "The risk is unconstrained delegation, which allows a compromised host to impersonate users to any service. Restricting delegation to specific services, or removing it, closes the gap. LAPS and LDAP signing address different weaknesses, and delegating to any service is the problem itself.",
    difficulty: 3,
    reference: { label: "Unsecure Kerberos delegation assessment", url: `${docs}/defender-for-identity/security-posture-assessments/accounts` },
  },
  {
    id: "sc200-d67",
    domainId: "response",
    type: "single",
    prompt:
      "You must find out who modified membership of the Domain Admins group in on-premises Active Directory during the last 30 days, using data from Defender for Identity. Which advanced hunting table should you query?",
    options: [
      { id: "a", text: "IdentityDirectoryEvents" },
      { id: "b", text: "IdentityLogonEvents" },
      { id: "c", text: "EmailEvents" },
      { id: "d", text: "DeviceRegistryEvents" },
    ],
    correct: ["a"],
    explanation:
      "IdentityDirectoryEvents records directory changes such as group membership changes and account modifications seen by Defender for Identity. IdentityLogonEvents is about authentication.",
    difficulty: 2,
    reference: { label: "IdentityDirectoryEvents table", url: `${docs}/defender-xdr/advanced-hunting-identitydirectoryevents-table` },
  },
  {
    id: "sc200-d68",
    domainId: "response",
    type: "single",
    prompt:
      "You need to check whether Microsoft Entra ID Protection has flagged a user's account as at risk of being compromised. Which report gives that view?",
    options: [
      { id: "a", text: "Identity Secure Score" },
      { id: "b", text: "Risky users" },
      { id: "c", text: "Conditional Access insights workbook" },
      { id: "d", text: "Authentication methods activity" },
    ],
    correct: ["b"],
    explanation:
      "The risky users report lists accounts that Identity Protection considers at risk, with their risk level and state. Secure score measures tenant posture, the Conditional Access workbook shows policy impact, and authentication methods activity reports MFA registration and usage.",
    difficulty: 2,
    reference: { label: "Investigate risk with Microsoft Entra ID Protection", url: `${docs}/entra/id-protection/howto-identity-protection-investigate-risk` },
  },
  {
    id: "sc200-d69",
    domainId: "response",
    type: "single",
    prompt:
      "Defender for Cloud alerts you to an unusually high volume of blob delete operations in a storage account. You need to know which blobs were deleted. What should you review?",
    options: [
      { id: "a", text: "The storage resource logs (StorageBlobLogs), sent to Log Analytics" },
      { id: "b", text: "The Azure activity log for the storage account resource" },
      { id: "c", text: "The alert's severity and description fields in Defender for Cloud" },
      { id: "d", text: "The Microsoft Entra ID audit log for the storage account's owner" },
    ],
    correct: ["a"],
    explanation:
      "Blob deletions are data-plane operations, and the Azure activity log only records control-plane actions on the account. Individual blob operations appear in the storage resource logs, provided diagnostic settings are on. The Entra ID audit log holds directory changes.",
    difficulty: 3,
    reference: { label: "Monitor Azure Blob Storage", url: `${docs}/azure/storage/blobs/monitor-blob-storage` },
  },
  {
    id: "sc200-d70",
    domainId: "response",
    type: "single",
    prompt:
      "Defender for Key Vault alerts on repeated access attempts to a vault from several suspicious IP addresses, including Tor exit nodes. You need to reduce secret exposure immediately with minimal impact on legitimate users. What should you do first?",
    options: [
      { id: "a", text: "Enable the Key Vault firewall and allow only known networks" },
      { id: "b", text: "Delete the vault and recreate it" },
      { id: "c", text: "Remove every access policy" },
      { id: "d", text: "Leave everything unchanged until the investigation has been fully completed" },
    ],
    correct: ["a"],
    explanation:
      "The vault firewall blocks traffic from unapproved networks at once and leaves users on trusted networks unaffected. Removing access policies or recreating the vault would disrupt legitimate consumers.",
    difficulty: 2,
    reference: { label: "Configure Azure Key Vault networking settings", url: `${docs}/azure/key-vault/general/how-to-azure-key-vault-network-security` },
  },
  {
    id: "sc200-d71",
    domainId: "response",
    type: "single",
    prompt:
      "In Defender for Cloud you open a security alert and want the recommended steps to resolve it. Where do you find them?",
    options: [
      { id: "a", text: "Take action, then the Mitigate the threat section" },
      { id: "b", text: "Take action, then the Prevent future attacks section" },
      { id: "c", text: "Regulatory compliance, then download the report" },
      { id: "d", text: "Recommendations, then download the CSV" },
    ],
    correct: ["a"],
    explanation:
      "Mitigate the threat lists remediation for the alert that is in front of you. Prevent future attacks points to recommendations that reduce the chance of a repeat, and the other options are reporting exports.",
    difficulty: 1,
    reference: { label: "Manage and respond to security alerts", url: `${docs}/azure/defender-for-cloud/managing-and-responding-alerts` },
  },
  {
    id: "sc200-d72",
    domainId: "response",
    type: "single",
    prompt:
      "You need to find every email in the mailboxes of the people who worked on Project1 that contains the word Project1 in the subject. Which Microsoft Purview tool fits?",
    options: [
      { id: "a", text: "A content search scoped to those mailboxes with a subject condition" },
      { id: "b", text: "An audit search over the same period, filtered to the project's users" },
      { id: "c", text: "A records management disposition review for the mailboxes" },
      { id: "d", text: "A sensitivity label policy scoped to the project's users" },
    ],
    correct: ["a"],
    explanation:
      "Content search searches mailbox content for keywords and lets you limit the locations to chosen mailboxes. Audit search finds activities, not the messages themselves.",
    difficulty: 1,
    reference: { label: "Content search in Microsoft Purview", url: `${docs}/purview/ediscovery-content-search` },
  },
  {
    id: "sc200-d73",
    domainId: "response",
    type: "ordering",
    prompt:
      "A suspicious PowerShell alert fired on VM1. You want to see what the attacker did on it afterwards, such as group membership changes and log clearing. Arrange the steps in Microsoft Sentinel.",
    steps: [
      { id: "a", text: "From the incident details pane, select Investigate" },
      { id: "b", text: "In the investigation graph, select the entity that represents VM1" },
      { id: "c", text: "Review the Insights for that entity" },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "The investigation graph is opened from the incident, and selecting the host entity gives access to its insights, including related events like account changes and log clearing.",
    difficulty: 2,
    reference: { label: "Investigate incidents with Microsoft Sentinel", url: `${docs}/azure/sentinel/investigate-cases` },
  },
  {
    id: "sc200-d74",
    domainId: "response",
    type: "single",
    prompt:
      "A Linux VM is protected by Defender for Servers, with the Defender for Endpoint agent installed and real-time protection enabled. Which action generates a test malware alert on it?",
    options: [
      { id: "a", text: "Run chmod 777 on the /etc directory, then log off from the shell session" },
      { id: "b", text: "Create a file named asc_alerttest in the /tmp directory" },
      { id: "c", text: "Stop and restart the Defender for Endpoint service twice" },
      { id: "d", text: "Download EICAR: curl -O https://secure.eicar.org/eicar.com.txt" },
    ],
    correct: ["d"],
    explanation:
      "The documented Linux simulation downloads the EICAR test file, which Defender for Endpoint detects and reports as an alert in Defender for Cloud within about ten minutes. Changing permissions, creating a file with a particular name or restarting the service does not trigger a detection.",
    difficulty: 2,
    reference: { label: "Validate alerts in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/alert-validation` },
  },

  // ----------------------------------------------------------------- hunting
  {
    id: "sc200-d75",
    domainId: "hunting",
    type: "single",
    prompt:
      "You use the Sentinel UEBA BehaviorAnalytics table to find failed sign-ins where the user connected from a country for the first time. Which filter completes this query?\n\nBehaviorAnalytics\n| where ActivityType == \"FailedLogOn\"\n| where ________",
    options: [
      { id: "a", text: "ActivityInsights.FirstTimeUserConnectedFromCountry == True" },
      { id: "b", text: "UsersInsights.IsNewAccount == True and SourceIPLocation != \"\"" },
      { id: "c", text: "InvestigationPriority >= 5 and SourceIPLocation != \"\"" },
      { id: "d", text: "SourceIPLocation == \"first\" and ActivityType == \"FailedLogOn\"" },
    ],
    correct: ["a"],
    explanation:
      "BehaviorAnalytics enriches activity with insight flags such as first-time-country connections. Dormant account is a user insight and unrelated to location, and the other columns do not exist in that form.",
    difficulty: 3,
    reference: { label: "Enable User and Entity Behavior Analytics", url: `${docs}/azure/sentinel/enable-entity-behavior-analytics` },
  },
  {
    id: "sc200-d76",
    domainId: "hunting",
    type: "single",
    prompt:
      "You are building a query and are unsure of the column names of a table, such as the field that holds the sign-in result. Where do you look first, without leaving the query editor?",
    options: [
      { id: "a", text: "The Tables schema pane in the Log Analytics query window" },
      { id: "b", text: "Azure Advisor recommendations for the subscription" },
      { id: "c", text: "The Azure activity log filtered by the table's name" },
      { id: "d", text: "Security alerts in Defender for Cloud for the workspace" },
    ],
    correct: ["a"],
    explanation:
      "The schema pane lists each table and its columns and types, and you can drag them into the query. The other places show recommendations, operations or alerts.",
    difficulty: 1,
    reference: { label: "Log Analytics tutorial", url: `${docs}/azure/azure-monitor/logs/log-analytics-tutorial` },
  },
  {
    id: "sc200-d77",
    domainId: "hunting",
    type: "single",
    prompt:
      "Your Microsoft Sentinel query must list DNS events from the last day whose response code is NXDOMAIN, and it should perform well. Which approach is best?",
    options: [
      { id: "a", text: "Use the ASIM parser's filter parameters, e.g. _Im_Dns(starttime=ago(1d), responsecodename='NXDOMAIN')" },
      { id: "b", text: "Call _Im_Dns() with no parameters, then filter the output using a where clause" },
      { id: "c", text: "Query each vendor's raw table separately and union the results manually in KQL" },
      { id: "d", text: "Export the events to CSV and filter the rows in a spreadsheet" },
    ],
    correct: ["a"],
    explanation:
      "ASIM parsers accept filter parameters that are pushed into the source-specific parsers, so less data is processed than if you filter after the union. Filtering after the call is correct but slower, and raw tables defeat normalisation.",
    difficulty: 3,
    reference: { label: "Using ASIM in your queries", url: `${docs}/azure/sentinel/normalization-about-parsers` },
  },
  {
    id: "sc200-d78",
    domainId: "hunting",
    type: "single",
    prompt:
      "The SecurityIncident table logs a new row each time an incident is updated. You need a workbook query that lists each incident once, using its most recent record. Which query does this?",
    options: [
      { id: "a", text: "SecurityIncident | summarize arg_max(TimeGenerated, *) by IncidentNumber" },
      { id: "b", text: "SecurityIncident | summarize arg_min(TimeGenerated, *) by IncidentNumber" },
      { id: "c", text: "SecurityIncident | distinct IncidentNumber, Title, Severity, Status" },
      { id: "d", text: "SecurityIncident | top 1 by TimeGenerated | project IncidentNumber, Title" },
    ],
    correct: ["a"],
    explanation:
      "arg_max returns the entire most recent row for each incident number. arg_min would return the oldest (creation) record, distinct still returns a row for every different combination of values across updates, and top 1 returns a single row for the whole table.",
    difficulty: 2,
    reference: { label: "arg_max() aggregation", url: `${docs}/kusto/query/arg-max-aggregation-function` },
  },
  {
    id: "sc200-d79",
    domainId: "hunting",
    type: "single",
    prompt:
      "You want to find devices that hold files received in emails from a known malicious sender, matched on the SHA256 hash. Which advanced hunting approach is right?",
    options: [
      { id: "a", text: "Filter EmailAttachmentInfo by sender, then join SHA256 to DeviceFileEvents" },
      { id: "b", text: "Join EmailUrlInfo to DeviceNetworkEvents on matching Timestamp values" },
      { id: "c", text: "Query IdentityLogonEvents for the sender's mail address" },
      { id: "d", text: "Search CloudAppEvents for the sender's display name" },
    ],
    correct: ["a"],
    explanation:
      "EmailAttachmentInfo records attachment hashes, and DeviceFileEvents records the files on endpoints, so a SHA256 join links the message to the devices. The other tables have no common hash column.",
    difficulty: 2,
    reference: { label: "Hunt for threats across devices, emails, apps, and identities", url: `${docs}/defender-xdr/advanced-hunting-query-emails-devices` },
  },
  {
    id: "sc200-d80",
    domainId: "hunting",
    type: "statements",
    scenario:
      "You are hunting in Defender XDR with this query:\n\nDeviceLogonEvents\n| where Timestamp > ago(7d)\n| where ActionType == \"LogonFailed\"\n| where DeviceName in~ (\"cfolaptop\", \"ceolaptop\", \"coolaptop\")\n| summarize Failures = count() by DeviceName",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The query returns one row per device that had failed logons.", correct: true },
      { id: "b", text: "in~ makes the device name comparison case-insensitive.", correct: true },
      { id: "c", text: "Replacing == with = would still be valid KQL for the ActionType filter.", correct: false },
      { id: "d", text: "The 7-day filter should be moved after summarize to improve speed.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "summarize by DeviceName yields a row per device, and in~ ignores case. KQL equality is ==, and filtering by time before summarizing reduces the data that has to be aggregated.",
    difficulty: 2,
    reference: { label: "in operator", url: `${docs}/kusto/query/in-operator` },
  },
  {
    id: "sc200-d81",
    domainId: "hunting",
    type: "single",
    prompt:
      "You want a query that returns users with successful sign-ins from more than one country in the last three hours. Which query is correct?",
    options: [
      { id: "a", text: "SigninLogs | where TimeGenerated > ago(3h) and ResultType == 0 | summarize Countries = dcount(Location) by UserPrincipalName | where Countries > 1" },
      { id: "b", text: "SigninLogs | where TimeGenerated > ago(3h) and ResultType == 0 | summarize Countries = count(Location) by UserPrincipalName | where Countries > 1" },
      { id: "c", text: "SigninLogs | where TimeGenerated > ago(3h) and ResultType == 1 | summarize Countries = dcount(Location) by UserPrincipalName | where Countries > 1" },
      { id: "d", text: "SigninLogs | where TimeGenerated > ago(3h) and ResultType == 0 | summarize Countries = dcount(Location) by IPAddress | where Countries > 1" },
    ],
    correct: ["a"],
    explanation:
      "ResultType 0 means a successful sign-in, dcount counts distinct countries per user, and the final where keeps users seen in more than one. count() would total sign-ins rather than countries, ResultType 1 selects failures, and grouping by IPAddress answers a different question.",
    difficulty: 2,
    reference: { label: "dcount() aggregation", url: `${docs}/kusto/query/dcount-aggregation-function` },
  },
  {
    id: "sc200-d82",
    domainId: "hunting",
    type: "single",
    prompt:
      "You want to hunt for callers who listed the access keys of several different storage accounts, excluding callers who listed keys for only one account. Which query pattern is right?",
    options: [
      { id: "a", text: "AzureActivity | where OperationNameValue =~ \"MICROSOFT.STORAGE/STORAGEACCOUNTS/LISTKEYS/ACTION\" | summarize Accounts = dcount(_ResourceId) by Caller | where Accounts > 1" },
      { id: "b", text: "AzureActivity | where OperationNameValue =~ \"MICROSOFT.STORAGE/STORAGEACCOUNTS/LISTKEYS/ACTION\" | summarize Calls = count() by Caller | where Calls > 1" },
      { id: "c", text: "AzureActivity | where OperationNameValue =~ \"MICROSOFT.STORAGE/STORAGEACCOUNTS/READ\" | summarize Accounts = dcount(_ResourceId) by Caller | where Accounts > 1" },
      { id: "d", text: "AzureActivity | where OperationNameValue =~ \"MICROSOFT.STORAGE/STORAGEACCOUNTS/LISTKEYS/ACTION\" | summarize Accounts = dcount(_ResourceId) by ResourceGroup | where Accounts > 1" },
    ],
    correct: ["a"],
    explanation:
      "Listing keys is a control-plane action captured in AzureActivity. Counting distinct resources per caller and keeping counts above one removes callers who only touched a single account. Counting calls would still include one account listed repeatedly, the READ operation is a different action, and grouping by resource group answers a different question.",
    difficulty: 3,
    reference: { label: "AzureActivity table reference", url: `${docs}/azure/azure-monitor/reference/tables/azureactivity` },
  },
  {
    id: "sc200-d83",
    domainId: "hunting",
    type: "single",
    prompt:
      "You need a Python-based Jupyter notebook for Sentinel hunting that includes ready-made functions for queries, threat intelligence lookups, IP geolocation and timelines, so you write as little code as possible. Which library should you use?",
    options: [
      { id: "a", text: "MSTICPy" },
      { id: "b", text: "TensorFlow" },
      { id: "c", text: "matplotlib alone" },
      { id: "d", text: "pandas alone" },
    ],
    correct: ["a"],
    explanation:
      "MSTICPy is Microsoft's security investigation library and wraps data querying, enrichment and visualisation for Sentinel notebooks. The others are general purpose and require you to build those features yourself.",
    difficulty: 2,
    reference: { label: "Jupyter notebooks with Microsoft Sentinel hunting", url: `${docs}/azure/sentinel/notebooks` },
  },

  // ===================================== batch 3 (Measureup PDF + .docx gaps)
  {
    id: "sc200-d84",
    domainId: "operations",
    type: "single",
    prompt:
      "You are building a Microsoft Sentinel workbook and want users to filter its data by Azure resources chosen from a drop-down list. Which parameter type should you add?",
    options: [
      { id: "a", text: "Time range picker, offering preset periods for the queries" },
      { id: "b", text: "Text, where users type the resource name by hand each time" },
      { id: "c", text: "Resource picker, which lists Azure resources for users to select" },
      { id: "d", text: "Subscription picker, narrowing every query to one subscription" },
    ],
    correct: ["c"],
    explanation:
      "The Resource picker parameter type presents Azure resources in a drop-down and passes the selected resource IDs into the queries. A time range picker filters by period, a text parameter needs manual entry, and a subscription picker only scopes to whole subscriptions.",
    difficulty: 1,
    reference: { label: "Workbook parameters", url: `${docs}/azure/azure-monitor/visualize/workbooks-parameters` },
  },
  {
    id: "sc200-d85",
    domainId: "operations",
    type: "single",
    prompt:
      "Compliance requires security logs to be kept for five years. Analysts query the last 180 days every day, and older data only occasionally, when retrieval on demand at low cost is acceptable. What should you configure on the table?",
    options: [
      { id: "a", text: "Set analytics retention to five years so that all of the data stays interactively queryable" },
      { id: "b", text: "Set analytics retention to 180 days and total retention to five years, then use search jobs for older data" },
      { id: "c", text: "Export the table to blob storage each month and then delete it from the workspace afterwards" },
      { id: "d", text: "Move the table to the Auxiliary plan and cut its total retention to 30 days to save money" },
    ],
    correct: ["b"],
    explanation:
      "Analytics retention can be at most 730 days, but total retention can be extended to 12 years. Data beyond the analytics period stays in low-cost long-term retention and is reached through search jobs or restore. Five years of analytics retention isn't possible, and the other choices either break querying or fail the five-year requirement.",
    difficulty: 3,
    reference: { label: "Manage data retention in a Log Analytics workspace", url: `${docs}/azure/azure-monitor/logs/data-retention-configure` },
  },
  {
    id: "sc200-d86",
    domainId: "hunting",
    type: "ordering",
    prompt:
      "You want to save a new custom hunting query, with entity mapping, in Microsoft Sentinel. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Open Hunting and select the Queries tab" },
      { id: "b", text: "Select New query from the command bar" },
      { id: "c", text: "Enter the name and KQL, then define the entity mappings" },
      { id: "d", text: "Select Create to save the query" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Custom hunting queries are created from the Queries tab of the Hunting page: choose New query, fill in the query details including the entity mappings that link results to entities, and select Create.",
    difficulty: 1,
    reference: { label: "Create custom hunting queries in Microsoft Sentinel", url: `${docs}/azure/sentinel/hunts-custom-queries` },
  },
  {
    id: "sc200-d87",
    domainId: "response",
    type: "single",
    prompt:
      "You are remediating a recommendation in Microsoft Defender for Cloud, but the recommendation has no Fix button. How should you remediate it?",
    options: [
      { id: "a", text: "Wait for the Fix button to appear after the next secure score refresh" },
      { id: "b", text: "Follow the manual remediation steps listed on the recommendation" },
      { id: "c", text: "Exempt the recommendation so that it stops affecting the secure score" },
      { id: "d", text: "Create a workflow automation that applies the fix in the background" },
    ],
    correct: ["b"],
    explanation:
      "Fix (quick fix) is only offered for recommendations that support one-click remediation. Where it is absent, the recommendation still lists manual remediation steps. Exempting hides the item rather than fixing it, and the button does not appear later.",
    difficulty: 1,
    reference: { label: "Remediate recommendations in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/implement-security-recommendations` },
  },
  {
    id: "sc200-d88",
    domainId: "response",
    type: "single",
    prompt:
      "You want Defender for Cloud Apps to recognise your branch offices' egress IP addresses and label them in logs and alerts. Where do you define them?",
    options: [
      { id: "a", text: "In Settings > Cloud Apps > IP address ranges, with a name, category and CIDR range" },
      { id: "b", text: "In a Cloud Discovery snapshot report uploaded from the branch firewall" },
      { id: "c", text: "In a file policy that is filtered on the branch offices' IP addresses" },
      { id: "d", text: "In an OAuth app policy that trusts sign-ins from the branch offices" },
    ],
    correct: ["a"],
    explanation:
      "IP address ranges are configured under Settings > Cloud Apps > System > IP address ranges and let you tag and categorise known addresses, such as offices, so activity and alerts are easier to interpret. Discovery reports, file policies and OAuth policies do not define address ranges.",
    difficulty: 2,
    reference: { label: "Organize IP addresses in Defender for Cloud Apps", url: `${docs}/defender-cloud-apps/ip-tags` },
  },
  {
    id: "sc200-d89",
    domainId: "response",
    type: "statements",
    scenario: "You maintain IP address ranges in Microsoft Defender for Cloud Apps.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Ranges are entered in CIDR notation, for example 192.168.1.0/24.", correct: true },
      { id: "b", text: "Two custom ranges may overlap as long as they use different categories.", correct: false },
      { id: "c", text: "A custom IP tag takes precedence over a built-in tag such as Risky for the same address.", correct: true },
      { id: "d", text: "Ranges can only be added one at a time in the portal, with no bulk method.", correct: false },
    ],
    correct: ["a", "c"],
    explanation:
      "Ranges use CIDR prefixes, and custom tags override built-in threat-intelligence tags. Overlapping ranges are not allowed, and ranges can be added in bulk through the IP address ranges API.",
    difficulty: 2,
    reference: { label: "Organize IP addresses in Defender for Cloud Apps", url: `${docs}/defender-cloud-apps/ip-tags` },
  },
  {
    id: "sc200-d90",
    domainId: "response",
    type: "single",
    prompt:
      "An analyst suspects a workstation was compromised and wants to reconstruct, in order, the processes, network connections and file events that took place on it. Which Defender for Endpoint view should they use first?",
    options: [
      { id: "a", text: "The Action center History tab for the workstation" },
      { id: "b", text: "The device timeline on the workstation's device page" },
      { id: "c", text: "The Threat analytics report for the suspected campaign" },
      { id: "d", text: "The security recommendations listed for the workstation" },
    ],
    correct: ["b"],
    explanation:
      "The device timeline shows chronological events for a device, including processes, network activity and file changes, which is what reconstructing an intrusion needs. The Action center lists response actions, threat analytics describes campaigns, and recommendations describe weaknesses.",
    difficulty: 1,
    reference: { label: "Investigate devices in Defender for Endpoint", url: `${docs}/defender-endpoint/device-timeline-event-flag` },
  },
  {
    id: "sc200-d91",
    domainId: "hunting",
    type: "single",
    prompt:
      "You have a table of known-bad IP addresses named BadIPs. You want only the SigninLogs rows whose IPAddress appears in that table, without adding any columns from BadIPs. Which query is correct?",
    options: [
      { id: "a", text: "SigninLogs | join kind=leftouter (BadIPs) on IPAddress" },
      { id: "b", text: "SigninLogs | join kind=leftanti (BadIPs) on IPAddress" },
      { id: "c", text: "SigninLogs | union BadIPs | distinct IPAddress" },
      { id: "d", text: "SigninLogs | join kind=leftsemi (BadIPs) on IPAddress" },
    ],
    correct: ["d"],
    explanation:
      "leftsemi returns only the left-side rows that have a match on the right, and none of the right-side columns. leftouter keeps every left row, leftanti returns the rows with no match, and union with distinct just lists IP values.",
    difficulty: 2,
    reference: { label: "join operator", url: `${docs}/kusto/query/join-operator` },
  },
  {
    id: "sc200-d92",
    domainId: "operations",
    type: "statements",
    scenario:
      "Your Microsoft Sentinel workspace holds a verbose table on the Basic plan. You plan to use a summary rule to reduce the cost of analysing it.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "A summary rule aggregates data on a schedule and writes the results to a custom log table.", correct: true },
      { id: "b", text: "The source table must be on the Analytics plan.", correct: false },
      { id: "c", text: "If the destination table already exists, the results are appended to it.", correct: true },
      { id: "d", text: "Summary rules can only be created from advanced hunting in the Defender portal.", correct: false },
    ],
    correct: ["a", "c"],
    explanation:
      "Summary rules aggregate data from Analytics or Basic tables at a regular cadence and send the results to a custom table, appending if the table exists. That lets analysts query compact, high-value data while the raw logs stay on a cheaper plan.",
    difficulty: 2,
    reference: { label: "Aggregate data with summary rules", url: `${docs}/azure/azure-monitor/logs/summary-rules` },
  },
  {
    id: "sc200-d93",
    domainId: "operations",
    type: "single",
    prompt:
      "Windows servers forward events with Windows Event Forwarding to a collector that runs the Azure Monitor Agent, and you ingest them with the Windows Forwarded Events connector. Which statement about the ingested data is correct?",
    options: [
      { id: "a", text: "The events land in SecurityEvent, alongside those from the Windows Security Events connector" },
      { id: "b", text: "The events land in Syslog, because Windows Event Forwarding uses a syslog-style transport" },
      { id: "c", text: "The events land in WindowsEvent, so rules written against SecurityEvent will not match them" },
      { id: "d", text: "The events land in CommonSecurityLog, because the collector normalises them to CEF" },
    ],
    correct: ["c"],
    explanation:
      "Events collected through Windows Event Forwarding are written to the WindowsEvent table, not SecurityEvent. Many built-in Windows Security Events analytics rules query SecurityEvent, so they must be adapted, for example with ASIM parsers, to cover forwarded events.",
    difficulty: 3,
    reference: { label: "Windows Forwarded Events connector", url: `${docs}/azure/sentinel/data-connectors/windows-forwarded-events` },
  },
];
