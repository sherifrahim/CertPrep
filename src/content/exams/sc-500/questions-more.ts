import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/**
 * Additional SC-500 questions written against the official skills-measured outline
 * (study guide updated 2026-05-13). Each answer was checked against Microsoft Learn.
 */
export const sc500MoreQuestions: Question[] = [
  // ---------------------------------------------------------------- identity
  {
    id: "sc500-m1",
    domainId: "identity",
    type: "single",
    prompt:
      "A regulator requires that subscription owners and resource group administrators must not be able to administer the service that stores your encryption keys. Which service meets this?",
    options: [
      { id: "a", text: "Azure Key Vault Standard, with the Azure RBAC permission model" },
      { id: "b", text: "Azure Key Vault Managed HSM, using its local RBAC model" },
      { id: "c", text: "Azure Key Vault Premium, with access policies for admins only" },
      { id: "d", text: "A storage account with customer-managed keys and a resource lock" },
    ],
    correct: ["b"],
    explanation:
      "Managed HSM is a single-tenant service with its own local RBAC. Designated HSM administrators have control that management group, subscription and resource group administrators cannot override. Vaults governed by Azure RBAC or access policies remain reachable through Azure-level roles.",
    difficulty: 3,
    reference: { label: "What is Azure Key Vault Managed HSM?", url: `${docs}/azure/key-vault/managed-hsm/overview` },
  },
  {
    id: "sc500-m2",
    domainId: "identity",
    type: "statements",
    scenario: "You are reviewing the data protection settings of a newly created Azure Key Vault.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Soft-delete is enabled by default on a new vault and cannot be disabled afterwards.", correct: true },
      { id: "b", text: "The soft-delete retention interval can be anything from 7 to 90 days, set when the vault is created.", correct: true },
      { id: "c", text: "Purge protection is enabled by default on every new vault.", correct: false },
      { id: "d", text: "The retention interval can be changed on an existing vault whenever policy requires it.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "New vaults always have soft-delete, with a 7 to 90 day retention interval (90 by default) that is fixed at creation. Purge protection is an optional setting that is off by default and is recommended when keys encrypt data, because it stops deleted objects being purged before retention ends.",
    difficulty: 2,
    reference: { label: "Azure Key Vault soft-delete overview", url: `${docs}/azure/key-vault/general/soft-delete-overview` },
  },
  {
    id: "sc500-m3",
    domainId: "identity",
    type: "statements",
    scenario: "You are protecting production resources with Azure resource locks.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "A CanNotDelete lock lets authorised users read and modify a resource but not delete it.", correct: true },
      { id: "b", text: "A ReadOnly lock is similar to restricting every authorised user to the Reader role.", correct: true },
      { id: "c", text: "Locks also block data plane operations, such as reading blobs in a locked storage account.", correct: false },
      { id: "d", text: "A lock on a resource group is inherited by resources that are added to it later.", correct: true },
    ],
    correct: ["a", "b", "d"],
    explanation:
      "Locks act on control plane operations sent to Azure Resource Manager, so they do not stop data plane access such as reading blob contents. Locks are inherited from the parent scope, including by resources created afterwards, and the most restrictive lock in the chain wins.",
    difficulty: 2,
    reference: { label: "Lock your resources to protect your infrastructure", url: `${docs}/azure/azure-resource-manager/management/lock-resources` },
  },
  {
    id: "sc500-m4",
    domainId: "identity",
    type: "single",
    prompt:
      "Dozens of existing virtual machines are non-compliant with a DeployIfNotExists policy that installs a monitoring extension. How do you bring the existing machines into compliance?",
    options: [
      { id: "a", text: "Create a remediation task that deploys the template through the assignment's managed identity" },
      { id: "b", text: "Save the policy definition again so it re-evaluates every existing resource" },
      { id: "c", text: "Assign Owner to each machine's administrator and ask them to install it" },
      { id: "d", text: "Switch the policy effect to Deny so that the machines are corrected" },
    ],
    correct: ["a"],
    explanation:
      "Non-compliant resources under deployIfNotExists or modify policies are remediated through remediation tasks, which run the deployment with the managed identity associated with the policy assignment. Re-saving the definition does not change resources, and Deny only blocks new non-compliant deployments.",
    difficulty: 2,
    reference: { label: "Remediate non-compliant resources with Azure Policy", url: `${docs}/azure/governance/policy/how-to/remediate-resources` },
  },

  // ------------------------------------------------------------ data-network
  {
    id: "sc500-m5",
    domainId: "data-network",
    type: "single",
    prompt:
      "You must record database activity for Azure SQL Database so that it can be analysed with KQL and also streamed to an external SIEM. Which pair of audit destinations should you configure?",
    options: [
      { id: "a", text: "A Log Analytics workspace and an event hub" },
      { id: "b", text: "A storage account and Azure Monitor metrics" },
      { id: "c", text: "Microsoft Sentinel and Microsoft Purview Audit" },
      { id: "d", text: "An event hub and the Azure activity log" },
    ],
    correct: ["a"],
    explanation:
      "Azure SQL auditing writes to an Azure Storage account, a Log Analytics workspace or Event Hubs. Log Analytics supports KQL analysis and Event Hubs supports streaming to external tools. Sentinel, Purview Audit, metrics and the activity log are not audit destinations.",
    difficulty: 2,
    reference: { label: "Auditing for Azure SQL Database", url: `${docs}/azure/azure-sql/database/auditing-overview` },
  },
  {
    id: "sc500-m6",
    domainId: "data-network",
    type: "single",
    prompt:
      "A logical server hosts many busy databases and server-level auditing writes such large volumes to the storage account that retrieving one database's records is slow. What is the recommended change?",
    options: [
      { id: "a", text: "Turn off auditing for the databases that generate the most events" },
      { id: "b", text: "Send the audit logs to a second server-level storage account" },
      { id: "c", text: "Switch to database-level auditing so each database writes to its own folder" },
      { id: "d", text: "Increase the audit retention so that older records are kept longer" },
    ],
    correct: ["c"],
    explanation:
      "With database-level auditing each database writes to its own audit log folder, which reduces the volume that has to be scanned and speeds retrieval. Turning auditing off removes evidence, and duplicating the destination or extending retention does not reduce the volume of any single query.",
    difficulty: 3,
    reference: { label: "Auditing for Azure SQL Database", url: `${docs}/azure/azure-sql/database/auditing-overview` },
  },
  {
    id: "sc500-m7",
    domainId: "data-network",
    type: "single",
    prompt:
      "You must protect Azure Database for PostgreSQL flexible servers and Amazon RDS instances against anomalous access. Which Defender for Databases plan should you enable?",
    options: [
      { id: "a", text: "Defender for Azure Cosmos DB" },
      { id: "b", text: "Defender for SQL servers on machines" },
      { id: "c", text: "Defender for Azure SQL Database servers" },
      { id: "d", text: "Defender for Open-Source Relational Databases" },
    ],
    correct: ["d"],
    explanation:
      "The Open-Source Relational Databases plan covers Azure Database for PostgreSQL and MySQL flexible servers and Amazon RDS engines such as Aurora and PostgreSQL. The other plans cover Cosmos DB, SQL Server on machines and Azure SQL.",
    difficulty: 2,
    reference: { label: "Defender for Open-Source Relational Databases", url: `${docs}/azure/defender-for-cloud/defender-for-databases-introduction` },
  },
  {
    id: "sc500-m8",
    domainId: "data-network",
    type: "multi",
    prompt:
      "Which two capabilities does Microsoft Defender for Storage provide? (Choose two.)",
    options: [
      { id: "a", text: "Malware scanning of blobs and files when uploaded or on demand" },
      { id: "b", text: "Automatic rotation of storage account keys every ninety days" },
      { id: "c", text: "Detection of suspicious activity involving sensitive data" },
      { id: "d", text: "Enforcement of version-level immutability on every container" },
    ],
    correct: ["a", "c"],
    explanation:
      "Defender for Storage combines activity monitoring, sensitive data threat detection and malware scanning. Key rotation and immutability are configured through storage account features and policy, not provided by the Defender plan.",
    difficulty: 2,
    reference: { label: "Defender for Storage introduction", url: `${docs}/azure/defender-for-cloud/defender-for-storage-introduction` },
  },
  {
    id: "sc500-m9",
    domainId: "data-network",
    type: "single",
    prompt:
      "Invoices must be kept in a tamper-proof state during a legal dispute that has no known end date. They must not be modified or deleted until counsel lifts the restriction. What should you apply?",
    options: [
      { id: "a", text: "A time-based retention policy of ten years" },
      { id: "b", text: "Blob soft delete with the longest retention period" },
      { id: "c", text: "Blob versioning combined with a read-only lock" },
      { id: "d", text: "A legal hold on the container or blob versions" },
    ],
    correct: ["d"],
    explanation:
      "A legal hold keeps data immutable until it is explicitly cleared, which fits an open-ended matter. A time-based policy ends after a fixed interval, soft delete is recoverable rather than immutable, and a lock plus versioning does not stop authorised deletion of data.",
    difficulty: 2,
    reference: { label: "Immutable storage for Azure Blob Storage", url: `${docs}/azure/storage/blobs/immutable-storage-overview` },
  },
  {
    id: "sc500-m10",
    domainId: "data-network",
    type: "single",
    prompt:
      "An application must grant time-limited access to blobs using a shared access signature. Which type does Microsoft recommend, because it is secured with Microsoft Entra credentials rather than the account key?",
    options: [
      { id: "a", text: "An account SAS signed with the primary key" },
      { id: "b", text: "A service SAS signed with the secondary key" },
      { id: "c", text: "A user delegation SAS" },
      { id: "d", text: "A SAS that is stored in an app setting" },
    ],
    correct: ["c"],
    explanation:
      "A user delegation SAS is signed with a user delegation key obtained through Microsoft Entra ID and is limited by the permissions of the identity that requested it. Account and service SAS tokens are signed with the account key, and where a token is stored does not change how it is secured.",
    difficulty: 2,
    reference: { label: "Grant limited access with shared access signatures", url: `${docs}/azure/storage/common/storage-sas-overview` },
  },
  {
    id: "sc500-m11",
    domainId: "data-network",
    type: "single",
    prompt:
      "Traffic between branches, virtual networks and the internet in an Azure Virtual WAN must pass through Azure Firewall, and you don't want to write and maintain user-defined routes for it. What should you do?",
    options: [
      { id: "a", text: "Convert the virtual hub into a secured virtual hub using Azure Firewall Manager" },
      { id: "b", text: "Add a user-defined route on each branch device pointing at the firewall" },
      { id: "c", text: "Deploy a network virtual appliance in every spoke and peer them together" },
      { id: "d", text: "Attach a network security group to the hub with the required service tags" },
    ],
    correct: ["a"],
    explanation:
      "A secured virtual hub runs Azure Firewall in the hub and Firewall Manager automates routing of traffic to it, so no hand-built routes are needed. Manual routes, per-spoke appliances and NSGs all add administrative work or cannot inspect hub traffic.",
    difficulty: 2,
    reference: { label: "Secure your virtual hub using Azure Firewall Manager", url: `${docs}/azure/firewall-manager/secure-cloud-network` },
  },
  {
    id: "sc500-m12",
    domainId: "data-network",
    type: "single",
    prompt:
      "A user cannot reach a virtual machine on port 443. You need to confirm whether a specific packet is allowed or denied and which security rule made that decision. Which Network Watcher tool should you use?",
    options: [
      { id: "a", text: "Packet capture on the virtual machine" },
      { id: "b", text: "Connection monitor between the two endpoints" },
      { id: "c", text: "Topology view of the virtual network" },
      { id: "d", text: "IP flow verify for the specific packet" },
    ],
    correct: ["d"],
    explanation:
      "IP flow verify reports whether a packet is allowed or denied to or from a VM based on the configured security rules, and names the rule and network security group responsible. Packet capture, connection monitoring and topology do not name the deciding rule.",
    difficulty: 2,
    reference: { label: "IP flow verify overview", url: `${docs}/azure/network-watcher/ip-flow-verify-overview` },
  },
  {
    id: "sc500-m13",
    domainId: "data-network",
    type: "statements",
    scenario: "You are comparing Azure Firewall SKUs for a hub network.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "TLS inspection in Azure Firewall Premium decrypts outbound traffic, inspects it, then re-encrypts it.", correct: true },
      { id: "b", text: "IDPS monitors network activity for malicious behaviour and can optionally block it.", correct: true },
      { id: "c", text: "URL filtering only evaluates the fully qualified domain name and ignores the path.", correct: false },
      { id: "d", text: "TLS inspection and IDPS are available on the Standard SKU.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "Premium adds TLS inspection, IDPS, URL filtering and web categories. URL filtering extends FQDN filtering to the entire URL including the path, and these capabilities are not part of the Standard SKU.",
    difficulty: 2,
    reference: { label: "Azure Firewall Premium features", url: `${docs}/azure/firewall/premium-features` },
  },
  {
    id: "sc500-m14",
    domainId: "data-network",
    type: "single",
    prompt:
      "Remote administrators connect through a point-to-site VPN gateway that is configured for Microsoft Entra ID authentication. Which client should they use?",
    options: [
      { id: "a", text: "The built-in Windows SSTP client with a certificate profile" },
      { id: "b", text: "The Azure VPN Client, signing in with Microsoft Entra ID" },
      { id: "c", text: "A strongSwan IKEv2 profile imported on each device" },
      { id: "d", text: "Any OpenVPN client using a shared pre-shared key" },
    ],
    correct: ["b"],
    explanation:
      "Microsoft Entra ID authentication for P2S gateways is delivered through the Azure VPN Client, which signs the user in with Entra ID and so supports Conditional Access. Certificate and pre-shared key profiles use different authentication types.",
    difficulty: 2,
    reference: { label: "Configure P2S VPN Gateway for Microsoft Entra ID authentication", url: `${docs}/azure/vpn-gateway/point-to-site-entra-gateway` },
  },

  // ----------------------------------------------------------------- compute
  {
    id: "sc500-m15",
    domainId: "compute",
    type: "single",
    prompt:
      "An Azure Container Apps application must pull images from a private Azure Container Registry without a stored username and password. What should you configure?",
    options: [
      { id: "a", text: "A managed identity for the container app, granted pull access to the registry" },
      { id: "b", text: "The registry admin account with its credentials saved as an app secret" },
      { id: "c", text: "Anonymous pull access enabled on the registry for the app's subnet" },
      { id: "d", text: "A service principal secret stored in an environment variable" },
    ],
    correct: ["a"],
    explanation:
      "A managed identity can authenticate to a private Azure Container Registry to pull images, so no credentials need to be stored. The other options all keep a secret or open the registry to unauthenticated pulls.",
    difficulty: 1,
    reference: { label: "Managed identities in Azure Container Apps", url: `${docs}/azure/container-apps/managed-identity` },
  },
  {
    id: "sc500-m16",
    domainId: "compute",
    type: "statements",
    scenario: "You are adding a managed identity to a running Azure Container Apps application.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The identity can authenticate to any service that supports Microsoft Entra authentication.", correct: true },
      { id: "b", text: "Permissions for the identity are granted with role-based access control.", correct: true },
      { id: "c", text: "Adding or changing the identity restarts the app and creates a new revision.", correct: false },
      { id: "d", text: "The app must store a client secret so that the identity can sign in.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "A managed identity removes the need to manage credentials and is authorised through RBAC. Adding, deleting or modifying it on a running app neither restarts the app nor creates a revision.",
    difficulty: 2,
    reference: { label: "Managed identities in Azure Container Apps", url: `${docs}/azure/container-apps/managed-identity` },
  },
  {
    id: "sc500-m17",
    domainId: "compute",
    type: "single",
    prompt:
      "A container group is deployed into a delegated subnet of a virtual network, and its containers need outbound internet access. Which outbound configuration is supported?",
    options: [
      { id: "a", text: "A public IP address assigned directly to the container group" },
      { id: "b", text: "A load balancer with outbound rules in front of the subnet" },
      { id: "c", text: "A NAT gateway associated with the container subnet" },
      { id: "d", text: "A service endpoint for Microsoft.ContainerInstance on it" },
    ],
    correct: ["c"],
    explanation:
      "When a container group is deployed into a virtual network, a NAT gateway is the only supported configuration for outbound connectivity. A public IP cannot be attached to the group in that mode, and load balancer rules or service endpoints do not provide outbound egress for it.",
    difficulty: 3,
    reference: { label: "Deploy container instances into an Azure virtual network", url: `${docs}/azure/container-instances/container-instances-vnet` },
  },
  {
    id: "sc500-m18",
    domainId: "compute",
    type: "single",
    prompt:
      "An operations team must be able to enable, disable and resubmit workflows in a Standard logic app and create connections, but must not create or edit workflow definitions. Which built-in role fits?",
    options: [
      { id: "a", text: "Logic Apps Standard Contributor" },
      { id: "b", text: "Logic Apps Standard Reader" },
      { id: "c", text: "Logic Apps Standard Developer" },
      { id: "d", text: "Logic Apps Standard Operator" },
    ],
    correct: ["d"],
    explanation:
      "The Operator role can enable, resubmit and disable workflows and create connections for a Standard logic app. Developer creates and edits workflows, Contributor has broad management rights, and Reader is read-only.",
    difficulty: 2,
    reference: { label: "Secure access and data in Azure Logic Apps", url: `${docs}/azure/logic-apps/logic-apps-securing-a-logic-app` },
  },
  {
    id: "sc500-m19",
    domainId: "compute",
    type: "single",
    prompt:
      "Deployments to an App Service app use FTP, and credentials and content are currently sent in clear text. What should you configure?",
    options: [
      { id: "a", text: "Enforce FTPS-only, or disable FTP deployment altogether" },
      { id: "b", text: "Turn on Always On so that the app keeps its FTP session" },
      { id: "c", text: "Add an access restriction rule for the developers' addresses" },
      { id: "d", text: "Require client certificates for every incoming request" },
    ],
    correct: ["a"],
    explanation:
      "FTPS-only mode, or disabling FTP entirely, stops credentials and content being sent unencrypted. Always On, IP access restrictions and client certificates address availability and inbound access rather than the FTP transport.",
    difficulty: 1,
    reference: { label: "Security in Azure App Service", url: `${docs}/azure/app-service/overview-security` },
  },
  {
    id: "sc500-m20",
    domainId: "compute",
    type: "single",
    prompt:
      "You want an App Service app to accept requests only from a set of office IP addresses and from a specific subnet in your virtual network. What should you configure?",
    options: [
      { id: "a", text: "Outbound VNet integration on the app's subnet for the app's egress traffic" },
      { id: "b", text: "Access restrictions with IP address rules and a service endpoint rule for the subnet" },
      { id: "c", text: "A managed identity that is granted the Reader role on the virtual network" },
      { id: "d", text: "Basic authentication enabled on the SCM endpoint for the office users" },
    ],
    correct: ["b"],
    explanation:
      "Access restrictions define an allow list of IP addresses and subnets for inbound traffic, and service endpoint restrictions work alongside IP rules for subnet-level filtering. VNet integration governs outbound traffic, and identities or basic auth do not filter inbound access.",
    difficulty: 2,
    reference: { label: "Security in Azure App Service", url: `${docs}/azure/app-service/overview-security` },
  },
  {
    id: "sc500-m21",
    domainId: "compute",
    type: "single",
    prompt:
      "You need Microsoft-managed rule sets and bot protection on a Web Application Firewall attached to Azure Front Door. Which Front Door tier must you use?",
    options: [
      { id: "a", text: "Premium, which supports the full set of WAF capabilities" },
      { id: "b", text: "Standard, which supports only custom WAF rules" },
      { id: "c", text: "Either tier, as long as the policy is in Prevention mode" },
      { id: "d", text: "Classic, which is the only tier with managed rule sets" },
    ],
    correct: ["a"],
    explanation:
      "Azure WAF is natively integrated with Azure Front Door Premium with full capabilities, including managed rule sets and the IP reputation rule set, whereas Front Door Standard supports custom rules only.",
    difficulty: 3,
    reference: { label: "Azure Web Application Firewall on Azure Front Door", url: `${docs}/azure/web-application-firewall/afds/afds-overview` },
  },
  {
    id: "sc500-m22",
    domainId: "compute",
    type: "single",
    prompt:
      "You are piloting a new Front Door WAF policy and want matching requests recorded in the WAF logs without any request being blocked. Which mode should you use?",
    options: [
      { id: "a", text: "Prevention mode with all rule actions set to Log" },
      { id: "b", text: "Prevention mode with the managed rule set disabled" },
      { id: "c", text: "Detection mode, which only monitors and logs" },
      { id: "d", text: "Detection mode with a custom rule set to Block" },
    ],
    correct: ["c"],
    explanation:
      "In Detection mode the WAF only monitors and logs the request and the rule it matched, and takes no other action. It is the standard way to tune a policy before switching to Prevention.",
    difficulty: 1,
    reference: { label: "Azure Web Application Firewall on Azure Front Door", url: `${docs}/azure/web-application-firewall/afds/afds-overview` },
  },
  {
    id: "sc500-m23",
    domainId: "compute",
    type: "statements",
    scenario: "You are protecting a back-end API published through Azure API Management with policies.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The validate-jwt policy rejects requests that do not carry a valid JSON Web Token.", correct: true },
      { id: "b", text: "The rate-limit policy caps the number of calls allowed in a renewal period.", correct: true },
      { id: "c", text: "The ip-filter policy allows or denies calls from specific IP addresses or ranges.", correct: true },
      { id: "d", text: "The rate-limit policy blocks callers from particular IP addresses.", correct: false },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "validate-jwt authenticates callers by token, rate-limit throttles usage, and ip-filter restricts by source address. Blocking by address is the job of ip-filter, not rate-limit.",
    difficulty: 2,
    reference: { label: "API Management access restriction policies", url: `${docs}/azure/api-management/api-management-access-restriction-policies` },
  },
  {
    id: "sc500-m24",
    domainId: "compute",
    type: "single",
    prompt:
      "Several applications share one Microsoft Foundry model deployment and one of them is consuming most of the tokens per minute. Which API Management capability limits each consumer?",
    options: [
      { id: "a", text: "A token limit policy on the LLM API, keyed per consumer" },
      { id: "b", text: "A response caching policy on the operation" },
      { id: "c", text: "A CORS policy that lists the calling applications" },
      { id: "d", text: "A URL rewrite policy that adds a per-app path" },
    ],
    correct: ["a"],
    explanation:
      "The token limit policy enforces tokens-per-minute limits or quotas per consumer, using a counter key such as the subscription key or client IP. Caching, CORS and URL rewrite do not limit token consumption.",
    difficulty: 3,
    reference: { label: "AI gateway capabilities in Azure API Management", url: `${docs}/azure/api-management/genai-gateway-capabilities` },
  },
  {
    id: "sc500-m25",
    domainId: "compute",
    type: "single",
    prompt:
      "Which Defender for Containers capability finds vulnerabilities in registry images and running containers without installing anything on the nodes?",
    options: [
      { id: "a", text: "Runtime threat detection with the Defender sensor" },
      { id: "b", text: "Agentless vulnerability assessment of images and containers" },
      { id: "c", text: "Admission control with Azure Policy for Kubernetes" },
      { id: "d", text: "Network policy enforcement on the cluster nodes" },
    ],
    correct: ["b"],
    explanation:
      "Defender for Containers performs agentless vulnerability assessment of registry images, running containers and supported Kubernetes nodes. The Defender sensor and policy add-on are sensor-based capabilities, and network policy is not a scanning feature.",
    difficulty: 2,
    reference: { label: "Defender for Containers introduction", url: `${docs}/azure/defender-for-cloud/defender-for-containers-introduction` },
  },
  {
    id: "sc500-m26",
    domainId: "compute",
    type: "single",
    prompt:
      "Which Defender for Cloud capability detects threats to generative AI applications in real time, such as prompt attacks, and includes the offending prompt as evidence in its alerts?",
    options: [
      { id: "a", text: "AI threat protection in Defender for Cloud" },
      { id: "b", text: "Regulatory compliance assessment of AI workloads" },
      { id: "c", text: "Just-in-time access for model endpoints" },
      { id: "d", text: "Adaptive application controls for AI services" },
    ],
    correct: ["a"],
    explanation:
      "AI threat protection provides activity monitoring and prompt evidence in security alerts for AI services, and its alerts also flow into the Defender XDR portal. Compliance, JIT and application controls do not analyse prompts.",
    difficulty: 2,
    reference: { label: "AI threat protection in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/ai-threat-protection` },
  },

  // ----------------------------------------------------------------- posture
  {
    id: "sc500-m27",
    domainId: "posture",
    type: "single",
    prompt:
      "You need to find AI workloads whose endpoints are reachable from the internet and rely on weak authentication, and see how an attacker could chain those weaknesses. Which capability helps?",
    options: [
      { id: "a", text: "Attack path analysis in Defender Cloud Security Posture Management" },
      { id: "b", text: "Secure score, filtered to the AI resource types only" },
      { id: "c", text: "Regulatory compliance dashboard for the AI standards" },
      { id: "d", text: "Workflow automation triggered by AI recommendations" },
    ],
    correct: ["a"],
    explanation:
      "Attack path analysis in Defender CSPM detects and shows risk chains for AI workloads, including externally reachable endpoints with weak or missing authentication. Secure score, compliance views and workflow automation don't model attack routes.",
    difficulty: 2,
    reference: { label: "AI security posture in Defender for Cloud", url: `${docs}/azure/defender-for-cloud/ai-security-posture` },
  },
  {
    id: "sc500-m28",
    domainId: "posture",
    type: "single",
    prompt:
      "You must onboard servers and enable file integrity monitoring plus agentless scanning for machine posture. Which Defender for Servers plan provides both?",
    options: [
      { id: "a", text: "Plan 2, which builds on Plan 1" },
      { id: "b", text: "Plan 1, which focuses on Defender for Endpoint EDR" },
      { id: "c", text: "Either plan, as both include the same feature set" },
      { id: "d", text: "Neither, as they require Defender CSPM to be enabled" },
    ],
    correct: ["a"],
    explanation:
      "Plan 1 focuses on EDR through the Defender for Endpoint integration. Plan 2 includes those features and adds agentless scanning, compliance assessment, premium Defender Vulnerability Management and file integrity monitoring.",
    difficulty: 2,
    reference: { label: "Select a Defender for Servers plan", url: `${docs}/azure/defender-for-cloud/plan-defender-for-servers-select-plan` },
  },
  {
    id: "sc500-m29",
    domainId: "posture",
    type: "single",
    prompt:
      "You connect a Google Cloud organization to Defender for Cloud. How does Defender for Cloud establish trust with Google Cloud?",
    options: [
      { id: "a", text: "A long-lived service account key uploaded to Defender for Cloud" },
      { id: "b", text: "Workload identity federation with service account impersonation" },
      { id: "c", text: "A shared password stored in an Azure Key Vault secret" },
      { id: "d", text: "An IPsec tunnel between the organization and Azure" },
    ],
    correct: ["b"],
    explanation:
      "The GCP connector uses workload identity federation and service account impersonation, so no long-lived key is handed over. A key file, shared password or tunnel is not how the connector authenticates.",
    difficulty: 2,
    reference: { label: "Connect your GCP project or organization", url: `${docs}/azure/defender-for-cloud/quickstart-onboard-gcp` },
  },
  {
    id: "sc500-m30",
    domainId: "posture",
    type: "single",
    prompt:
      "You need to run one KQL query that returns SecurityEvent records from two different Log Analytics workspaces in a Microsoft Sentinel environment. Which approach is correct?",
    options: [
      { id: "a", text: "Query the first workspace and import the second one's table with a watchlist" },
      { id: "b", text: "Use the workspace() function for each workspace and combine them with union" },
      { id: "c", text: "Enable a data connector that copies each workspace into the other" },
      { id: "d", text: "Export both tables to a storage account and query with externaldata" },
    ],
    correct: ["b"],
    explanation:
      "Cross-workspace queries reference each workspace with the workspace() function and combine tables with the union operator. The other approaches copy or export data unnecessarily.",
    difficulty: 2,
    reference: { label: "Extend Microsoft Sentinel across workspaces and tenants", url: `${docs}/azure/sentinel/extend-sentinel-across-workspaces-tenants` },
  },
  {
    id: "sc500-m31",
    domainId: "posture",
    type: "statements",
    scenario: "You are using the Microsoft Sentinel Content hub to deploy detection content.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Content can be installed from a solution all at once or item by item.", correct: true },
      { id: "b", text: "Standalone content updates automatically, while solutions show their updates for you to apply.", correct: true },
      { id: "c", text: "Content hub can only deliver content that is stored in your own Git repository.", correct: false },
      { id: "d", text: "Installing a solution removes any analytics rules you created yourself.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "The Content hub is the in-product place to discover and install packaged solutions and standalone content, with update handling that differs between the two. Deploying your own content from Git is the separate Repositories feature.",
    difficulty: 2,
    reference: { label: "Discover and deploy Microsoft Sentinel out-of-the-box content", url: `${docs}/azure/sentinel/sentinel-solutions-deploy` },
  },
  {
    id: "sc500-m32",
    domainId: "posture",
    type: "single",
    prompt:
      "Which statement about the roles that control access to Microsoft Security Copilot is correct?",
    options: [
      { id: "a", text: "Copilot owner and contributor are Microsoft Entra roles that also grant access to all security data" },
      { id: "b", text: "Copilot owner and contributor are Security Copilot roles, not Entra roles, and grant no security data access alone" },
      { id: "c", text: "Access is controlled only through Azure RBAC roles on the resource group" },
      { id: "d", text: "Only Global Administrators can use Security Copilot after it is set up" },
    ],
    correct: ["b"],
    explanation:
      "Security Copilot introduces two roles, owner and contributor, that work like access groups. They are defined in Copilot rather than in Entra ID and only control access to its capabilities. Data access comes from Entra and Azure roles, and some Entra roles such as Security Administrator automatically inherit owner access.",
    difficulty: 3,
    reference: { label: "Understand authentication in Microsoft Security Copilot", url: `${docs}/copilot/security/authentication` },
  },
  {
    id: "sc500-m33",
    domainId: "posture",
    type: "single",
    prompt:
      "Security Copilot is consuming more capacity than expected. Where do administrators see how many security compute units are used, and which workspace uses them?",
    options: [
      { id: "a", text: "The usage monitoring dashboard in Security Copilot" },
      { id: "b", text: "The secure score page in Defender for Cloud" },
      { id: "c", text: "The Sentinel workbook for incident metrics" },
      { id: "d", text: "The Entra sign-in logs for the analysts" },
    ],
    correct: ["a"],
    explanation:
      "The usage monitoring dashboard shows SCUs consumed over time, provisioned and overage units, and the workspace consuming each capacity. Secure score, Sentinel incident metrics and sign-in logs do not report Copilot capacity.",
    difficulty: 2,
    reference: { label: "Manage security compute unit usage in Security Copilot", url: `${docs}/copilot/security/manage-usage` },
  },
  {
    id: "sc500-m34",
    domainId: "posture",
    type: "single",
    prompt:
      "As a Security Copilot owner, you want to stop contributors from publishing custom plugins to the whole organization while still letting them use plugins in their own sessions. Where do you configure this?",
    options: [
      { id: "a", text: "The plugin settings page, by an owner" },
      { id: "b", text: "A Conditional Access policy for the Copilot app" },
      { id: "c", text: "The Sentinel automation rules page" },
      { id: "d", text: "An Azure Policy assignment on the resource group" },
    ],
    correct: ["a"],
    explanation:
      "Owners control plugin behaviour on the plugin settings page, including whether contributors may add custom plugins for their sessions and whether they may publish custom plugins for everyone. Conditional Access, automation rules and Azure Policy do not manage Copilot plugins.",
    difficulty: 2,
    reference: { label: "Manage plugins in Microsoft Security Copilot", url: `${docs}/copilot/security/manage-plugins` },
  },
];
