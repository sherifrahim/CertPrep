import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/** Third pass: objectives not covered by the first two question files. */
export const az500ExtraQuestions: Question[] = [
  // ---------------------------------------------------------------- identity
  {
    id: "az500-x1",
    domainId: "identity",
    type: "single",
    prompt:
      "A GitHub Actions workflow must deploy to Azure without any client secret stored in GitHub. What should you configure on the app registration?",
    options: [
      { id: "a", text: "A federated identity credential naming the GitHub repository, branch, and issuer" },
      { id: "b", text: "A client secret with a 7-day expiry, rotated by the workflow" },
      { id: "c", text: "A certificate uploaded to both GitHub and the app registration" },
      { id: "d", text: "A system-assigned managed identity on the app registration" },
    ],
    correct: ["a"],
    explanation:
      "A federated identity credential establishes trust with GitHub's OIDC issuer for a specific repository and branch, so the workflow exchanges a GitHub token for an Entra token with nothing stored. Managed identities are not available to app registrations used from outside Azure.",
    difficulty: 2,
    reference: { label: "Workload identity federation", url: `${docs}/entra/workload-id/workload-identity-federation` },
  },
  {
    id: "az500-x2",
    domainId: "identity",
    type: "single",
    prompt:
      "You must stop users from consenting to third-party applications that request permission to read all mailboxes, while still allowing consent to low-impact permissions. What should you configure?",
    options: [
      { id: "a", text: "An app consent policy permitting user consent only for permissions you classify as low impact" },
      { id: "b", text: "Disable user consent for all applications" },
      { id: "c", text: "A Conditional Access policy requiring MFA for consent" },
      { id: "d", text: "Remove the Application Developer role from all users" },
    ],
    correct: ["a"],
    explanation:
      "Classifying permissions and applying an app consent policy lets users self-serve for low-risk scopes while high-impact permissions such as Mail.Read require admin consent. Disabling consent entirely works but blocks the low-impact cases the requirement wants to keep.",
    difficulty: 3,
    reference: { label: "Manage app consent policies", url: `${docs}/entra/identity/enterprise-apps/manage-app-consent-policies` },
  },
  {
    id: "az500-x3",
    domainId: "identity",
    type: "single",
    prompt:
      "Contoso wants to prevent users from downloading files from SharePoint Online when signing in from an unmanaged device, without blocking access outright. Which Conditional Access capability should you use?",
    options: [
      { id: "a", text: "A session control applying app-enforced restrictions or Conditional Access App Control" },
      { id: "b", text: "A grant control requiring a compliant device" },
      { id: "c", text: "A grant control requiring MFA" },
      { id: "d", text: "A sign-in frequency session control" },
    ],
    correct: ["a"],
    explanation:
      "Session controls pass a restriction to the app or proxy the session, allowing browser-only access where download, print, and copy can be blocked. Requiring a compliant device would deny unmanaged devices entirely rather than limiting what they can do.",
    difficulty: 3,
    reference: { label: "Conditional Access session controls", url: `${docs}/entra/identity/conditional-access/concept-conditional-access-session` },
  },
  {
    id: "az500-x4",
    domainId: "identity",
    type: "statements",
    scenario:
      "A user holds an eligible Privileged Identity Management assignment for the Owner role on a subscription. The role setting requires MFA and approval on activation, with a maximum activation duration of four hours.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Before activation, the user can modify resources in the subscription.", correct: false },
      { id: "b", text: "After the four hours elapse, the permissions are removed automatically.", correct: true },
      { id: "c", text: "The approver can be a different user from the requester.", correct: true },
    ],
    correct: ["b", "c"],
    explanation:
      "An eligible assignment grants nothing until activated, which is the entire point of removing standing access. Activation is time-bound and expires automatically, and role settings let you nominate specific approvers who are necessarily separate from the requester.",
    difficulty: 2,
    reference: { label: "PIM role settings", url: `${docs}/entra/id-governance/privileged-identity-management/pim-how-to-change-default-settings` },
  },
  {
    id: "az500-x5",
    domainId: "identity",
    type: "meets-goal",
    scenario:
      "An application team needs read-only access to metrics for every resource in a subscription. The access must expire automatically after 90 days, and no permanent assignment may exist.",
    prompt:
      "Solution: You create a PIM for Groups eligible assignment to a group that holds the Monitoring Reader role at the subscription scope, and set the assignment to expire after 90 days.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "PIM for Groups makes membership itself time-bound and eligible, so the role granted through the group is only available on activation and the assignment expires on the set date. Monitoring Reader provides the read-only metrics access described.",
    difficulty: 3,
    reference: { label: "PIM for Groups", url: `${docs}/entra/id-governance/privileged-identity-management/concept-pim-for-groups` },
  },

  // ----------------------------------------------------------------- network
  {
    id: "az500-x6",
    domainId: "network",
    type: "single",
    prompt:
      "You created a private endpoint for a storage account. Virtual machines in the virtual network still resolve the storage account's public IP address. What is missing?",
    options: [
      { id: "a", text: "A private DNS zone for privatelink.blob.core.windows.net linked to the virtual network" },
      { id: "b", text: "A service endpoint for Microsoft.Storage on the subnet" },
      { id: "c", text: "An NSG rule allowing the Storage service tag" },
      { id: "d", text: "A user-defined route for the storage account's IP range" },
    ],
    correct: ["a"],
    explanation:
      "A private endpoint creates the NIC but name resolution must be redirected too. The privatelink DNS zone, linked to the virtual network and holding an A record for the endpoint, is what makes the existing hostname resolve to the private IP without changing application connection strings.",
    difficulty: 3,
    reference: { label: "Private endpoint DNS configuration", url: `${docs}/azure/private-link/private-endpoint-dns` },
  },
  {
    id: "az500-x7",
    domainId: "network",
    type: "single",
    prompt:
      "Your security team requires encryption of ExpressRoute traffic at layer 2 between your edge routers and Microsoft's routers. Which technology should you use?",
    options: [
      { id: "a", text: "MACsec on the ExpressRoute Direct ports" },
      { id: "b", text: "An IPsec VPN tunnel over ExpressRoute private peering" },
      { id: "c", text: "TLS termination at Application Gateway" },
      { id: "d", text: "Azure Firewall Premium TLS inspection" },
    ],
    correct: ["a"],
    explanation:
      "MACsec encrypts at layer 2 on ExpressRoute Direct ports between your routers and Microsoft's. An IPsec tunnel over private peering also encrypts ExpressRoute traffic but operates at layer 3, which does not satisfy a layer-2 requirement.",
    difficulty: 3,
    reference: { label: "ExpressRoute encryption", url: `${docs}/azure/expressroute/expressroute-about-encryption` },
  },
  {
    id: "az500-x8",
    domainId: "network",
    type: "single",
    prompt:
      "Virtual machines in a subnet need outbound internet access for patching, but must not be reachable inbound and must present a predictable set of source IP addresses. What should you deploy?",
    options: [
      { id: "a", text: "A NAT gateway associated with the subnet" },
      { id: "b", text: "A public IP address on each virtual machine" },
      { id: "c", text: "An Azure Load Balancer with inbound NAT rules" },
      { id: "d", text: "A service endpoint for Microsoft.Network" },
    ],
    correct: ["a"],
    explanation:
      "A NAT gateway provides outbound-only connectivity from a fixed set of public IPs with no inbound path, and it scales SNAT ports far better than default outbound access. Assigning public IPs to VMs would expose them inbound.",
    difficulty: 2,
    reference: { label: "What is Azure NAT Gateway?", url: `${docs}/azure/nat-gateway/nat-overview` },
  },
  {
    id: "az500-x9",
    domainId: "network",
    type: "single",
    prompt:
      "You need aggregated visibility into which flows were allowed and denied across many NSGs, with geographic and threat context, rather than raw log records. What should you enable?",
    options: [
      { id: "a", text: "Traffic analytics over NSG flow logs" },
      { id: "b", text: "Effective security rules in Network Watcher" },
      { id: "c", text: "Connection troubleshoot" },
      { id: "d", text: "Azure Monitor metric alerts on the NSG resource" },
    ],
    correct: ["a"],
    explanation:
      "Traffic analytics processes flow logs into a Log Analytics workspace and presents aggregated topology, top talkers, malicious flow detection, and geography. Effective security rules only explain configuration for one interface.",
    difficulty: 2,
    reference: { label: "Traffic analytics", url: `${docs}/azure/network-watcher/traffic-analytics` },
  },
  {
    id: "az500-x10",
    domainId: "network",
    type: "ordering",
    prompt:
      "You must publish an internal web application through Azure Application Gateway with a WAF policy and end-to-end TLS. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Import the TLS certificate into Azure Key Vault" },
      { id: "b", text: "Grant the gateway's managed identity permission to read the certificate" },
      { id: "c", text: "Create the listener referencing the Key Vault certificate" },
      { id: "d", text: "Associate a WAF policy with the listener and enable Prevention mode" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The certificate must exist in Key Vault and the gateway identity must be able to read it before a listener can reference it. The WAF policy is then attached, and Prevention mode is normally enabled only after a period in Detection mode confirms no legitimate traffic is blocked.",
    difficulty: 3,
    reference: { label: "TLS termination with Key Vault certificates", url: `${docs}/azure/application-gateway/key-vault-certs` },
  },

  // ----------------------------------------------------------------- compute
  {
    id: "az500-x11",
    domainId: "compute",
    type: "single",
    prompt:
      "You must ensure a virtual machine boots only trusted, signed components and can attest to its boot integrity. Which VM feature set provides this?",
    options: [
      { id: "a", text: "Trusted launch with secure boot, vTPM, and boot integrity monitoring" },
      { id: "b", text: "Azure Disk Encryption with a customer-managed key" },
      { id: "c", text: "Encryption at host" },
      { id: "d", text: "Just-in-time VM access" },
    ],
    correct: ["a"],
    explanation:
      "Trusted launch combines secure boot to block unsigned boot components, a virtual TPM to measure the boot chain, and integrity monitoring so Defender for Cloud can alert on rootkit-style tampering. Disk encryption protects data at rest but says nothing about boot integrity.",
    difficulty: 2,
    reference: { label: "Trusted launch for Azure VMs", url: `${docs}/azure/virtual-machines/trusted-launch` },
  },
  {
    id: "az500-x12",
    domainId: "compute",
    type: "single",
    prompt:
      "A pod in an AKS cluster must authenticate to Azure Key Vault as a specific Microsoft Entra identity, scoped to that pod's service account rather than the whole node pool. What should you configure?",
    options: [
      { id: "a", text: "Microsoft Entra Workload ID with a federated credential bound to the Kubernetes service account" },
      { id: "b", text: "The kubelet managed identity of the node pool" },
      { id: "c", text: "A Kubernetes secret containing a service principal password" },
      { id: "d", text: "An AcrPull role assignment on the cluster identity" },
    ],
    correct: ["a"],
    explanation:
      "Workload ID federates the Kubernetes service account token with Entra, so each workload gets its own identity and least-privilege access without stored secrets. Using the node identity grants everything on the node the same rights, and Kubernetes secrets reintroduce a credential to manage.",
    difficulty: 3,
    reference: { label: "Microsoft Entra Workload ID with AKS", url: `${docs}/azure/aks/workload-identity-overview` },
  },
  {
    id: "az500-x13",
    domainId: "compute",
    type: "single",
    prompt:
      "Newly pushed container images must be blocked from deployment until they have been scanned and found free of high-severity vulnerabilities. Which Azure Container Registry capability supports this workflow?",
    options: [
      { id: "a", text: "Quarantine mode, which keeps images unavailable until a scanner marks them as passed" },
      { id: "b", text: "Geo-replication of the registry" },
      { id: "c", text: "Anonymous pull access" },
      { id: "d", text: "Registry retention policies for untagged manifests" },
    ],
    correct: ["a"],
    explanation:
      "With quarantine enabled, a pushed image stays inaccessible to normal pulls until a scanning process explicitly marks it as passed, which enforces the gate described. Geo-replication and retention policies address availability and cleanup instead.",
    difficulty: 3,
    reference: { label: "ACR image quarantine", url: `${docs}/azure/container-registry/container-registry-faq` },
  },
  {
    id: "az500-x14",
    domainId: "compute",
    type: "statements",
    scenario:
      "A storage account has hierarchical namespace disabled, blob soft delete enabled for 7 days, blob versioning enabled, and a locked time-based immutability policy of 1 year on one container.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "A blob in the immutable container can be deleted by the subscription owner before the year elapses.", correct: false },
      { id: "b", text: "A blob overwritten in a different container can be restored to its previous state.", correct: true },
      { id: "c", text: "The immutability policy retention period can be shortened once locked.", correct: false },
    ],
    correct: ["b"],
    explanation:
      "A locked time-based policy enforces WORM semantics that nobody can bypass or shorten, though it can be extended. Versioning captures the prior state whenever a blob is overwritten elsewhere, making restoration straightforward.",
    difficulty: 3,
    reference: { label: "Immutable storage overview", url: `${docs}/azure/storage/blobs/immutable-storage-overview` },
  },
  {
    id: "az500-x15",
    domainId: "compute",
    type: "meets-goal",
    scenario:
      "A finance application must connect to Azure SQL Database. The database must reject any connection that does not originate from the application's virtual network, and administrators must authenticate with Microsoft Entra accounts rather than SQL logins.",
    prompt:
      "Solution: You create a private endpoint for the logical server, set Public network access to Disabled, and configure a Microsoft Entra admin for the server.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "Disabling public network access forces all traffic through the private endpoint in the application's virtual network, and assigning a Microsoft Entra admin enables directory-based authentication for administrators. Both requirements are met.",
    difficulty: 2,
    reference: { label: "Azure SQL private link", url: `${docs}/azure/azure-sql/database/private-endpoint-overview` },
  },

  // ---------------------------------------------------------------- defender
  {
    id: "az500-x16",
    domainId: "defender",
    type: "single",
    prompt:
      "You want to find every internet-exposed virtual machine that has a high-severity vulnerability and holds a managed identity with write access to a storage account, expressed as a single query across your cloud estate. Which Defender for Cloud capability should you use?",
    options: [
      { id: "a", text: "Cloud security explorer, which queries the cloud security graph" },
      { id: "b", text: "Secure score recommendations" },
      { id: "c", text: "The regulatory compliance dashboard" },
      { id: "d", text: "Workflow automation" },
    ],
    correct: ["a"],
    explanation:
      "Cloud security explorer queries the security graph, letting you combine exposure, vulnerability, and permission conditions in one search. Recommendations and compliance views report on individual controls rather than relationships between resources.",
    difficulty: 3,
    reference: { label: "Cloud security explorer", url: `${docs}/azure/defender-for-cloud/concept-attack-path` },
  },
  {
    id: "az500-x17",
    domainId: "defender",
    type: "single",
    prompt:
      "Defender for Cloud shows an attack path indicating an internet-facing VM can reach a database holding sensitive data. What makes attack path analysis more actionable than a plain list of recommendations?",
    options: [
      { id: "a", text: "It chains related weaknesses into an exploitable route, so you can break the path at its most effective point" },
      { id: "b", text: "It automatically remediates every finding in the path" },
      { id: "c", text: "It replaces the need for vulnerability assessment" },
      { id: "d", text: "It only reports findings that have already been exploited" },
    ],
    correct: ["a"],
    explanation:
      "Attack paths model how individually moderate issues combine into a route to a sensitive asset, letting you prioritise the single fix that breaks the chain rather than working through unranked recommendations. It prioritises rather than remediates.",
    difficulty: 2,
    reference: { label: "Identify and remediate attack paths", url: `${docs}/azure/defender-for-cloud/how-to-manage-attack-path` },
  },
  {
    id: "az500-x18",
    domainId: "defender",
    type: "single",
    prompt:
      "Your organisation must assign owners and due dates to Defender for Cloud recommendations so that unaddressed items are reported as overdue to management. What should you configure?",
    options: [
      { id: "a", text: "Governance rules with owners and remediation timeframes" },
      { id: "b", text: "Workflow automation triggered on recommendation changes" },
      { id: "c", text: "A custom compliance standard" },
      { id: "d", text: "Continuous export to Event Hubs" },
    ],
    correct: ["a"],
    explanation:
      "Governance rules assign an owner and a remediation timeframe to recommendations, producing accountability and overdue tracking in the governance report. Workflow automation can notify but does not manage ownership or due dates.",
    difficulty: 2,
    reference: { label: "Drive remediation with governance rules", url: `${docs}/azure/defender-for-cloud/governance-rules` },
  },
  {
    id: "az500-x19",
    domainId: "defender",
    type: "single",
    prompt:
      "Which Microsoft Sentinel capability builds behavioural baselines for users and hosts so that deviations such as a first-time sign-in from an unusual country are surfaced with context?",
    options: [
      { id: "a", text: "Entity behavior analytics (UEBA)" },
      { id: "b", text: "Watchlists" },
      { id: "c", text: "Summary rules" },
      { id: "d", text: "The Content hub" },
    ],
    correct: ["a"],
    explanation:
      "UEBA profiles entities over time and enriches events with baseline deviations and peer comparisons, surfaced on entity pages and usable in queries. Watchlists hold static reference data and Content hub distributes solutions.",
    difficulty: 2,
    reference: { label: "Entity behavior analytics", url: `${docs}/azure/sentinel/identify-threats-with-entity-behavior-analytics` },
  },
  {
    id: "az500-x20",
    domainId: "defender",
    type: "single",
    prompt:
      "Audit requires that Log Analytics data cannot be modified or deleted by an administrator for the duration of its retention. Which workspace feature addresses this?",
    options: [
      { id: "a", text: "Immutability via data export to immutable storage, combined with workspace retention locks on tables" },
      { id: "b", text: "Raising the daily ingestion cap" },
      { id: "c", text: "Enabling the Basic logs plan on all tables" },
      { id: "d", text: "Deleting the workspace access keys" },
    ],
    correct: ["a"],
    explanation:
      "Log Analytics tables are append-only in normal operation, but a tamper-evident audit trail is achieved by exporting to storage protected with an immutability policy, alongside retention configuration on the tables. Basic logs actually reduce retention and query capability.",
    difficulty: 3,
    reference: { label: "Log Analytics data export", url: `${docs}/azure/azure-monitor/logs/logs-data-export` },
  },
  {
    id: "az500-x21",
    domainId: "defender",
    type: "single",
    prompt:
      "You must ensure Azure virtual machines receive operating system updates on a defined schedule with compliance reporting, without deploying a third-party tool. Which service should you use?",
    options: [
      { id: "a", text: "Azure Update Manager" },
      { id: "b", text: "Microsoft Defender Vulnerability Management" },
      { id: "c", text: "Azure Automation State Configuration" },
      { id: "d", text: "Azure Policy with the Audit effect" },
    ],
    correct: ["a"],
    explanation:
      "Azure Update Manager assesses and deploys OS updates on schedules with maintenance windows and compliance reporting across Azure and Arc-enabled machines. Defender Vulnerability Management identifies missing patches as findings but does not orchestrate their deployment.",
    difficulty: 2,
    reference: { label: "Azure Update Manager overview", url: `${docs}/azure/update-manager/overview` },
  },
  {
    id: "az500-x22",
    domainId: "defender",
    type: "multi",
    prompt:
      "Which two statements about Microsoft Defender for Key Vault are correct? (Choose two.)",
    options: [
      { id: "a", text: "It alerts on anomalous access patterns such as unusual users or locations retrieving secrets" },
      { id: "b", text: "It can alert when a suspicious application enumerates many secrets in a short period" },
      { id: "c", text: "It encrypts key vault contents with a second layer of encryption" },
      { id: "d", text: "It automatically rotates keys that are near expiry" },
    ],
    correct: ["a", "b"],
    explanation:
      "Defender for Key Vault is a detection plan: it watches data-plane access and alerts on anomalies such as access from unfamiliar identities, TOR exit nodes, or bulk secret enumeration. Encryption and rotation are Key Vault platform features, not Defender ones.",
    difficulty: 2,
    reference: { label: "Defender for Key Vault", url: `${docs}/azure/defender-for-cloud/defender-for-key-vault-introduction` },
  },
];
