import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc500Questions: Question[] = [
  // ------------------------------------------------ identity & governance
  {
    id: "sc500-q1",
    domainId: "identity",
    type: "single",
    prompt:
      "Twelve engineers hold permanent Owner on a production subscription. You must remove standing access while still letting them work when needed, with approval and MFA required each time. What should you implement?",
    options: [
      { id: "a", text: "Eligible assignments in Privileged Identity Management with approval and MFA required on activation" },
      { id: "b", text: "Downgrade all twelve to Contributor" },
      { id: "c", text: "A Conditional Access policy requiring MFA for the Microsoft Azure Management app" },
      { id: "d", text: "A resource lock on the subscription" },
    ],
    correct: ["a"],
    explanation:
      "Only eligible PIM assignments remove standing access — the user holds nothing until they activate. PIM role settings then supply the approval and MFA requirements. Downgrading to Contributor still leaves permanent access, and Conditional Access adds MFA without removing the standing assignment.",
    difficulty: 2,
    reference: { label: "PIM for Azure resources", url: `${docs}/entra/id-governance/privileged-identity-management/pim-resource-roles-assign-roles` },
  },
  {
    id: "sc500-q2",
    domainId: "identity",
    type: "single",
    prompt:
      "You must let users sign in without a password while keeping phishing resistance. Which authentication method best meets this?",
    options: [
      { id: "a", text: "FIDO2 security keys or passkeys" },
      { id: "b", text: "SMS one-time passcodes" },
      { id: "c", text: "Voice call verification" },
      { id: "d", text: "Security questions" },
    ],
    correct: ["a"],
    explanation:
      "FIDO2 and passkeys bind the credential to the origin, so a phishing site cannot replay it, and they remove the password entirely. SMS and voice are phishable and vulnerable to SIM swapping, and security questions are a knowledge factor rather than a passwordless method.",
    difficulty: 2,
    reference: { label: "Passwordless authentication options", url: `${docs}/entra/identity/authentication/concept-authentication-passwordless` },
  },
  {
    id: "sc500-q3",
    domainId: "identity",
    type: "single",
    prompt:
      "A workload running outside Azure must authenticate to Microsoft Entra ID with no stored client secret. What should you configure on the app registration?",
    options: [
      { id: "a", text: "A federated identity credential trusting the external OIDC issuer" },
      { id: "b", text: "A client secret with a short expiry, rotated automatically" },
      { id: "c", text: "A system-assigned managed identity" },
      { id: "d", text: "A certificate stored on the external host" },
    ],
    correct: ["a"],
    explanation:
      "Workload identity federation trusts an external issuer such as GitHub Actions or a Kubernetes cluster, exchanging its token for an Entra token so no credential is stored anywhere. Managed identities only exist for Azure resources, and both secrets and certificates remain credential material to protect.",
    difficulty: 2,
    reference: { label: "Workload identity federation", url: `${docs}/entra/workload-id/workload-identity-federation` },
  },
  {
    id: "sc500-q4",
    domainId: "identity",
    type: "single",
    prompt:
      "Users are consenting to third-party applications that request permission to read all mailboxes. You must stop that while still allowing consent to low-impact permissions. What should you configure?",
    options: [
      { id: "a", text: "An app consent policy that permits user consent only for permissions classified as low impact" },
      { id: "b", text: "Disable user consent for all applications" },
      { id: "c", text: "Block all app registrations tenant-wide" },
      { id: "d", text: "Require MFA before granting consent" },
    ],
    correct: ["a"],
    explanation:
      "Classifying permissions and applying an app consent policy lets low-risk scopes stay self-service while high-impact permissions such as Mail.Read require admin consent. Disabling consent entirely also blocks the low-impact cases the requirement preserves.",
    difficulty: 3,
    reference: { label: "Manage app consent policies", url: `${docs}/entra/identity/enterprise-apps/manage-app-consent-policies` },
  },
  {
    id: "sc500-q5",
    domainId: "identity",
    type: "single",
    prompt:
      "Which Key Vault permission model brings data-plane access under the same role assignments, PIM, and access reviews used for other Azure resources?",
    options: [
      { id: "a", text: "Azure role-based access control" },
      { id: "b", text: "Vault access policies" },
      { id: "c", text: "Shared access signatures" },
      { id: "d", text: "Key Vault firewall rules" },
    ],
    correct: ["a"],
    explanation:
      "The Azure RBAC model applies standard role assignments to Key Vault data operations, inheriting scope inheritance, PIM eligibility, and access reviews. Vault access policies are a separate legacy list managed only on the vault, with no inheritance.",
    difficulty: 2,
    reference: { label: "Key Vault RBAC guide", url: `${docs}/azure/key-vault/general/rbac-guide` },
  },
  {
    id: "sc500-q6",
    domainId: "identity",
    type: "single",
    prompt:
      "A key vault protects production encryption keys. You must guarantee a deleted key can be recovered and that nobody can permanently remove it during the retention period. What should you enable?",
    options: [
      { id: "a", text: "Soft delete together with purge protection" },
      { id: "b", text: "Soft delete alone" },
      { id: "c", text: "Automatic key rotation" },
      { id: "d", text: "A private endpoint on the vault" },
    ],
    correct: ["a"],
    explanation:
      "Soft delete makes deleted objects recoverable, but a caller with purge rights can still remove them early. Purge protection blocks that until the retention period expires, so the pair is required. Rotation and private endpoints address credential freshness and network exposure instead.",
    difficulty: 2,
    reference: { label: "Key Vault soft-delete and purge protection", url: `${docs}/azure/key-vault/general/soft-delete-overview` },
  },
  {
    id: "sc500-q7",
    domainId: "identity",
    type: "single",
    prompt:
      "Which capability scans your cloud estate for exposed secrets such as credentials committed alongside workloads?",
    options: [
      { id: "a", text: "Secrets scanning in Defender Cloud Security Posture Management" },
      { id: "b", text: "Azure Policy with the Audit effect" },
      { id: "c", text: "Key Vault firewall logging" },
      { id: "d", text: "Microsoft Entra access reviews" },
    ],
    correct: ["a"],
    explanation:
      "Defender CSPM includes agentless secrets scanning that surfaces plaintext credentials on machines and in code, and links them to what they unlock. Azure Policy evaluates resource configuration rather than file contents.",
    difficulty: 2,
    reference: { label: "Defender CSPM", url: `${docs}/azure/defender-for-cloud/concept-cloud-security-posture-management` },
  },
  {
    id: "sc500-q8",
    domainId: "identity",
    type: "single",
    prompt:
      "You must stop any storage account being created without secure transfer enabled, blocking the deployment rather than reporting it afterwards. Which Azure Policy effect should you use?",
    options: [
      { id: "a", text: "Deny" },
      { id: "b", text: "Audit" },
      { id: "c", text: "AuditIfNotExists" },
      { id: "d", text: "DeployIfNotExists" },
    ],
    correct: ["a"],
    explanation:
      "Deny is the only effect that prevents creation of a non-compliant resource. Audit effects record compliance without blocking, and DeployIfNotExists remediates after the resource already exists.",
    difficulty: 1,
    reference: { label: "Azure Policy effects", url: `${docs}/azure/governance/policy/concepts/effect-basics` },
  },
  {
    id: "sc500-q9",
    domainId: "identity",
    type: "single",
    prompt:
      "You need to find accounts holding far more permission than they actually use, in order to right-size them. Which approach fits?",
    options: [
      { id: "a", text: "Review Azure RBAC assignments against actual usage and remove unused privilege" },
      { id: "b", text: "Assign Owner to everyone and audit later" },
      { id: "c", text: "Enable resource locks on all subscriptions" },
      { id: "d", text: "Rotate all service principal secrets" },
    ],
    correct: ["a"],
    explanation:
      "Right-sizing means comparing granted permissions with the operations an identity actually performs and trimming the excess, which is exactly the overprivileged-access remediation the exam objective describes. Locks and secret rotation address different risks.",
    difficulty: 2,
    reference: { label: "Best practices for Azure RBAC", url: `${docs}/azure/role-based-access-control/best-practices` },
  },
  {
    id: "sc500-q10",
    domainId: "identity",
    type: "single",
    prompt:
      "Backups in a Recovery Services vault must survive a compromised administrator account attempting to delete them. Which control addresses this?",
    options: [
      { id: "a", text: "Multi-user authorization using a Resource Guard" },
      { id: "b", text: "Geo-redundant storage replication" },
      { id: "c", text: "A read-only lock on the vault" },
      { id: "d", text: "Longer retention on the backup policy" },
    ],
    correct: ["a"],
    explanation:
      "Multi-user authorization places destructive vault operations behind a Resource Guard held in a separate subscription or tenant, so one compromised administrator cannot disable protection or delete backups. Replication protects against outages, not malicious deletion.",
    difficulty: 3,
    reference: { label: "Multi-user authorization for Backup", url: `${docs}/azure/backup/multi-user-authorization` },
  },
  {
    id: "sc500-q11",
    domainId: "identity",
    type: "single",
    prompt:
      "Your team defines infrastructure in Bicep. You must catch insecure configurations before deployment rather than after. What should you do?",
    options: [
      { id: "a", text: "Scan the infrastructure-as-code templates in the pipeline and gate merges on the findings" },
      { id: "b", text: "Deploy first and rely on Defender for Cloud recommendations" },
      { id: "c", text: "Apply resource locks after each deployment" },
      { id: "d", text: "Grant the pipeline Owner so it can self-remediate" },
    ],
    correct: ["a"],
    explanation:
      "Shifting security left means scanning templates during the pipeline and failing the build on high-severity findings, so misconfigurations never reach the cloud. Relying on post-deployment recommendations means the exposure exists first, and granting the pipeline Owner widens the blast radius.",
    difficulty: 2,
    reference: { label: "DevOps security", url: `${docs}/azure/defender-for-cloud/defender-for-devops-introduction` },
  },

  // ------------------------------------------- storage, databases, network
  {
    id: "sc500-q12",
    domainId: "data-network",
    type: "single",
    prompt:
      "Your baseline requires that storage account keys cannot be used to authorise any request. What should you configure?",
    options: [
      { id: "a", text: "Set allowSharedKeyAccess to false so only Microsoft Entra authorization is accepted" },
      { id: "b", text: "Rotate the account keys every 24 hours" },
      { id: "c", text: "Enable the storage firewall for your virtual network only" },
      { id: "d", text: "Require secure transfer" },
    ],
    correct: ["a"],
    explanation:
      "Disabling shared key authorization rejects any request signed with the account keys, forcing all access through Entra identities and Azure RBAC. Rotation shortens exposure but keys still work, and firewall and HTTPS settings govern where and how requests arrive rather than how they authenticate.",
    difficulty: 2,
    reference: { label: "Prevent shared key authorization", url: `${docs}/azure/storage/common/shared-key-authorization-prevent` },
  },
  {
    id: "sc500-q13",
    domainId: "data-network",
    type: "single",
    prompt:
      "An external auditor needs read access to one blob container for 24 hours. The credential must be tied to an Entra identity and revocable immediately. What should you issue?",
    options: [
      { id: "a", text: "A user delegation SAS" },
      { id: "b", text: "An account SAS" },
      { id: "c", text: "A service SAS" },
      { id: "d", text: "The secondary account key" },
    ],
    correct: ["a"],
    explanation:
      "A user delegation SAS is signed with a key obtained from Entra ID rather than the account key, so it carries Entra identity and is revoked by revoking the delegation key. Account and service SAS tokens are signed with the account key, and sharing a key grants full access.",
    difficulty: 3,
    reference: { label: "User delegation SAS", url: `${docs}/rest/api/storageservices/create-a-user-delegation-sas` },
  },
  {
    id: "sc500-q14",
    domainId: "data-network",
    type: "single",
    prompt:
      "Which Defender plan scans blobs on upload for malware and alerts on anomalous access patterns such as data exfiltration?",
    options: [
      { id: "a", text: "Microsoft Defender for Storage" },
      { id: "b", text: "Microsoft Defender for Servers" },
      { id: "c", text: "Microsoft Defender for Key Vault" },
      { id: "d", text: "Microsoft Defender for Resource Manager" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Storage provides on-upload malware scanning, sensitive data threat detection, and alerting on unusual access. The other plans protect virtual machines, key vaults, and control-plane operations respectively.",
    difficulty: 1,
    reference: { label: "Overview of Defender for Storage", url: `${docs}/azure/defender-for-cloud/defender-for-storage-introduction` },
  },
  {
    id: "sc500-q15",
    domainId: "data-network",
    type: "single",
    prompt:
      "Regulators require that your organisation can revoke the key protecting an Azure SQL Database at any moment, immediately rendering it unreadable. What should you configure?",
    options: [
      { id: "a", text: "Transparent Data Encryption with a customer-managed key in Azure Key Vault" },
      { id: "b", text: "Transparent Data Encryption with the service-managed key" },
      { id: "c", text: "Dynamic data masking on sensitive columns" },
      { id: "d", text: "Azure Disk Encryption on the underlying host" },
    ],
    correct: ["a"],
    explanation:
      "With a customer-managed TDE protector the key lives in your vault, so disabling or revoking access makes the database inaccessible within minutes. A service-managed key is controlled by Microsoft, masking does not encrypt, and ADE does not apply to Azure SQL Database as a PaaS service.",
    difficulty: 2,
    reference: { label: "TDE with customer-managed keys", url: `${docs}/azure/azure-sql/database/transparent-data-encryption-byok-overview` },
  },
  {
    id: "sc500-q16",
    domainId: "data-network",
    type: "single",
    prompt:
      "Support staff must query a customer table but must not see real credit card numbers, while the stored data stays unchanged and other applications keep reading real values. What should you implement?",
    options: [
      { id: "a", text: "Dynamic data masking" },
      { id: "b", text: "Transparent Data Encryption" },
      { id: "c", text: "Always Encrypted" },
      { id: "d", text: "Row-level security" },
    ],
    correct: ["a"],
    explanation:
      "Dynamic data masking obscures values at query time for designated users while leaving stored data intact and unmasked for privileged callers. TDE is transparent to all queries, Always Encrypted would hide values from the engine and break other applications, and row-level security filters rows rather than columns.",
    difficulty: 2,
    reference: { label: "Dynamic data masking", url: `${docs}/azure/azure-sql/database/dynamic-data-masking-overview` },
  },
  {
    id: "sc500-q17",
    domainId: "data-network",
    type: "single",
    prompt:
      "A virtual machine must reach an Azure Storage account by private IP, and the same account must be reachable privately from on-premises over ExpressRoute. What should you implement?",
    options: [
      { id: "a", text: "A private endpoint for the storage account, with a matching private DNS zone" },
      { id: "b", text: "A service endpoint for Microsoft.Storage on the subnet" },
      { id: "c", text: "A user-defined route to a network virtual appliance" },
      { id: "d", text: "A network security group rule using the Storage service tag" },
    ],
    correct: ["a"],
    explanation:
      "A private endpoint projects the account into your virtual network as a NIC with a private IP, which is what makes it reachable from on-premises over ExpressRoute, and a privatelink DNS zone makes the existing hostname resolve there. Service endpoints keep the public IP and cannot be used from on-premises.",
    difficulty: 2,
    reference: { label: "Private endpoint overview", url: `${docs}/azure/private-link/private-endpoint-overview` },
  },
  {
    id: "sc500-q18",
    domainId: "data-network",
    type: "single",
    prompt:
      "You created a private endpoint but virtual machines still resolve the service's public IP address. What is missing?",
    options: [
      { id: "a", text: "A private DNS zone for the privatelink namespace, linked to the virtual network" },
      { id: "b", text: "A service endpoint on the subnet" },
      { id: "c", text: "An NSG rule allowing the service tag" },
      { id: "d", text: "A route table entry for the endpoint's IP" },
    ],
    correct: ["a"],
    explanation:
      "The endpoint creates the NIC, but name resolution must also be redirected. A privatelink DNS zone linked to the virtual network, holding an A record for the endpoint, makes existing connection strings resolve to the private IP without any application change.",
    difficulty: 3,
    reference: { label: "Private endpoint DNS configuration", url: `${docs}/azure/private-link/private-endpoint-dns` },
  },
  {
    id: "sc500-q19",
    domainId: "data-network",
    type: "single",
    prompt:
      "Your organisation has 60 virtual networks and needs a baseline blocking inbound SSH from the internet that individual network owners cannot override with their own NSG rules. What should you use?",
    options: [
      { id: "a", text: "Azure Virtual Network Manager security admin rules" },
      { id: "b", text: "An NSG deployed to every subnet by Azure Policy" },
      { id: "c", text: "Azure Firewall network rules" },
      { id: "d", text: "A route table with next hop None" },
    ],
    correct: ["a"],
    explanation:
      "Security admin rules are evaluated before NSGs and cannot be overridden by them, which is exactly the guardrail described. Deploying NSGs by policy still leaves owners able to edit those NSGs, and a firewall only sees traffic that routing sends to it.",
    difficulty: 2,
    reference: { label: "Security admin rules", url: `${docs}/azure/virtual-network-manager/concept-security-admins` },
  },
  {
    id: "sc500-q20",
    domainId: "data-network",
    type: "single",
    prompt:
      "You want NSG rules that reference groups of virtual machines by workload role rather than by IP address, so rules survive scaling. What should you use?",
    options: [
      { id: "a", text: "Application security groups" },
      { id: "b", text: "Service tags" },
      { id: "c", text: "Availability sets" },
      { id: "d", text: "Route tables" },
    ],
    correct: ["a"],
    explanation:
      "Application security groups let you group NICs by role and use those groups as rule sources and destinations, so membership follows the machines. Service tags represent Microsoft-managed ranges for Azure services, not your own workloads.",
    difficulty: 1,
    reference: { label: "Application security groups", url: `${docs}/azure/virtual-network/application-security-groups` },
  },
  {
    id: "sc500-q21",
    domainId: "data-network",
    type: "single",
    prompt:
      "Remote employees must reach specific internal applications without a full VPN tunnel granting broad network access. Which service is designed for this?",
    options: [
      { id: "a", text: "Microsoft Entra Private Access" },
      { id: "b", text: "A point-to-site VPN gateway" },
      { id: "c", text: "Azure Bastion" },
      { id: "d", text: "Azure Front Door" },
    ],
    correct: ["a"],
    explanation:
      "Entra Private Access publishes individual private applications with identity-based, per-application access and Conditional Access, rather than placing the device on the network as a VPN does. Bastion is for administrative RDP and SSH sessions.",
    difficulty: 2,
    reference: { label: "Microsoft Entra Private Access", url: `${docs}/entra/global-secure-access/concept-private-access` },
  },
  {
    id: "sc500-q22",
    domainId: "data-network",
    type: "single",
    prompt:
      "All outbound internet traffic from spoke virtual networks must be inspected by an Azure Firewall in a hub. What must you configure on the spoke subnets?",
    options: [
      { id: "a", text: "A user-defined route for 0.0.0.0/0 with next hop type Virtual appliance set to the firewall's private IP" },
      { id: "b", text: "An NSG rule denying outbound internet traffic" },
      { id: "c", text: "A service endpoint for Microsoft.Network" },
      { id: "d", text: "Gateway transit on the peering" },
    ],
    correct: ["a"],
    explanation:
      "Azure's default system route sends internet-bound traffic straight out, so it must be overridden with a UDR pointing at the firewall's private IP. NSGs can block traffic but cannot redirect it for inspection, and peering alone does not change routing.",
    difficulty: 2,
    reference: { label: "Azure Firewall in a hub network", url: `${docs}/azure/firewall/tutorial-hybrid-portal` },
  },
  {
    id: "sc500-q23",
    domainId: "data-network",
    type: "single",
    prompt:
      "Which Azure Network Watcher capability shows the aggregate NSG rules actually applied to a network interface, combining subnet-level and NIC-level rules?",
    options: [
      { id: "a", text: "Effective security rules" },
      { id: "b", text: "NSG flow logs" },
      { id: "c", text: "Connection monitor" },
      { id: "d", text: "Packet capture" },
    ],
    correct: ["a"],
    explanation:
      "Effective security rules merge the subnet NSG and the NIC NSG to show what is genuinely enforced, which is the fastest way to diagnose an unexpected block. Flow logs record what happened, and connection monitor tests reachability.",
    difficulty: 2,
    reference: { label: "Network Watcher", url: `${docs}/azure/network-watcher/network-watcher-overview` },
  },
  {
    id: "sc500-q24",
    domainId: "data-network",
    type: "single",
    prompt:
      "You must protect a public web application from SQL injection and cross-site scripting. Which service should you place in front of it?",
    options: [
      { id: "a", text: "Azure Web Application Firewall on Front Door or Application Gateway" },
      { id: "b", text: "Azure Firewall Standard" },
      { id: "c", text: "Azure DDoS Protection" },
      { id: "d", text: "Network security groups with service tags" },
    ],
    correct: ["a"],
    explanation:
      "WAF inspects HTTP and HTTPS with managed rule sets covering OWASP threats such as SQLi and XSS. Azure Firewall Standard filters at the network and FQDN level, DDoS Protection addresses volumetric attacks, and NSGs only filter by IP, port, and protocol.",
    difficulty: 1,
    reference: { label: "Azure Web Application Firewall", url: `${docs}/azure/web-application-firewall/overview` },
  },

  // -------------------------------------------------- compute, incl. AI
  {
    id: "sc500-q25",
    domainId: "compute",
    type: "single",
    prompt:
      "Administrators must open RDP and SSH sessions to virtual machines that have no public IP addresses, without maintaining a jump box. What should you deploy?",
    options: [
      { id: "a", text: "Azure Bastion" },
      { id: "b", text: "Just-in-time VM access alone" },
      { id: "c", text: "A site-to-site VPN gateway" },
      { id: "d", text: "Azure Firewall DNAT rules" },
    ],
    correct: ["a"],
    explanation:
      "Bastion is a managed service providing RDP and SSH over TLS from the portal to machines using only private IPs, with nothing for you to patch. JIT reduces the exposure window but still relies on a public endpoint.",
    difficulty: 1,
    reference: { label: "What is Azure Bastion?", url: `${docs}/azure/bastion/bastion-overview` },
  },
  {
    id: "sc500-q26",
    domainId: "compute",
    type: "single",
    prompt:
      "You must ensure a virtual machine boots only signed components and can attest to its boot integrity. Which feature set provides this?",
    options: [
      { id: "a", text: "Trusted launch with secure boot, vTPM, and integrity monitoring" },
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
    id: "sc500-q27",
    domainId: "compute",
    type: "single",
    prompt:
      "You must extend Defender for Servers protections to virtual machines running in AWS and on-premises. What must you do first?",
    options: [
      { id: "a", text: "Connect the machines to Azure Arc so they can be managed as Azure resources" },
      { id: "b", text: "Migrate the machines into Azure" },
      { id: "c", text: "Install the legacy Log Analytics agent only" },
      { id: "d", text: "Create a site-to-site VPN to each environment" },
    ],
    correct: ["a"],
    explanation:
      "Azure Arc projects non-Azure machines into Azure as resources, which is what lets Defender for Cloud, Azure Policy, and extensions target them. Migration is unnecessary and networking alone does not make them manageable.",
    difficulty: 2,
    reference: { label: "Azure Arc-enabled servers", url: `${docs}/azure/azure-arc/servers/overview` },
  },
  {
    id: "sc500-q28",
    domainId: "compute",
    type: "single",
    prompt:
      "You must assess Azure virtual machines for vulnerabilities without deploying or maintaining an agent inside each guest. Which Defender for Servers capability provides this?",
    options: [
      { id: "a", text: "Agentless machine scanning, which analyses a disk snapshot out of band" },
      { id: "b", text: "The Log Analytics agent with a vulnerability extension" },
      { id: "c", text: "Just-in-time VM access" },
      { id: "d", text: "Adaptive application controls" },
    ],
    correct: ["a"],
    explanation:
      "Agentless scanning snapshots the disk and inspects it in the Defender backend for software inventory, vulnerabilities, secrets, and malware, with no in-guest agent and no workload performance impact.",
    difficulty: 2,
    reference: { label: "Agentless machine scanning", url: `${docs}/azure/defender-for-cloud/concept-agentless-data-collection` },
  },
  {
    id: "sc500-q29",
    domainId: "compute",
    type: "single",
    prompt:
      "A pod in Azure Kubernetes Service must authenticate to Key Vault as its own Entra identity, scoped to that pod's service account rather than the whole node pool. What should you configure?",
    options: [
      { id: "a", text: "Microsoft Entra Workload ID with a federated credential bound to the Kubernetes service account" },
      { id: "b", text: "The kubelet managed identity of the node pool" },
      { id: "c", text: "A Kubernetes secret holding a service principal password" },
      { id: "d", text: "An AcrPull role assignment on the cluster identity" },
    ],
    correct: ["a"],
    explanation:
      "Workload ID federates the Kubernetes service account token with Entra, so each workload gets a least-privilege identity and no secret is stored. Using the node identity grants everything scheduled on that node the same rights.",
    difficulty: 3,
    reference: { label: "Microsoft Entra Workload ID with AKS", url: `${docs}/azure/aks/workload-identity-overview` },
  },
  {
    id: "sc500-q30",
    domainId: "compute",
    type: "single",
    prompt:
      "An AKS cluster must pull images from Azure Container Registry with no credentials stored in Kubernetes. What is the recommended approach?",
    options: [
      { id: "a", text: "Attach the registry to the cluster so the kubelet identity holds the AcrPull role" },
      { id: "b", text: "Create an image pull secret from the registry admin account" },
      { id: "c", text: "Enable anonymous pull on the registry" },
      { id: "d", text: "Store the registry password in a ConfigMap" },
    ],
    correct: ["a"],
    explanation:
      "Attaching ACR grants the cluster's managed identity AcrPull, so pulls are authorised by Entra with no stored secret. The admin account should remain disabled, anonymous pull removes access control, and ConfigMaps are not for secrets.",
    difficulty: 2,
    reference: { label: "Authenticate with ACR from AKS", url: `${docs}/azure/aks/cluster-container-registry-integration` },
  },
  {
    id: "sc500-q31",
    domainId: "compute",
    type: "single",
    prompt:
      "Which Defender plan detects misconfigurations and runtime threats in container workloads, including Kubernetes clusters and registries?",
    options: [
      { id: "a", text: "Microsoft Defender for Containers" },
      { id: "b", text: "Microsoft Defender for App Service" },
      { id: "c", text: "Microsoft Defender for Storage" },
      { id: "d", text: "Microsoft Defender for Resource Manager" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Containers covers image vulnerability assessment in registries, Kubernetes posture hardening, and runtime threat detection on cluster nodes and workloads.",
    difficulty: 1,
    reference: { label: "Defender for Containers", url: `${docs}/azure/defender-for-cloud/defender-for-containers-introduction` },
  },
  {
    id: "sc500-q32",
    domainId: "compute",
    type: "single",
    prompt:
      "An Azure Function must be reachable only from within your virtual network. Which combination achieves this?",
    options: [
      { id: "a", text: "A private endpoint for inbound access with public network access disabled, plus VNet integration for outbound calls" },
      { id: "b", text: "A function-level access key only" },
      { id: "c", text: "An NSG applied to the function app resource" },
      { id: "d", text: "Anonymous authentication with an IP restriction" },
    ],
    correct: ["a"],
    explanation:
      "Inbound and outbound are separate concerns: a private endpoint plus disabled public access controls who can reach the function, while VNet integration lets the function reach private resources. NSGs cannot be attached to a function app directly.",
    difficulty: 3,
    reference: { label: "App Service networking features", url: `${docs}/azure/app-service/networking-features` },
  },
  {
    id: "sc500-q33",
    domainId: "compute",
    type: "single",
    prompt:
      "Before deploying Microsoft 365 Copilot, leadership wants to know which SharePoint sites contain sensitive data shared too broadly. Which capability surfaces this?",
    options: [
      { id: "a", text: "Data risk assessments in Microsoft Purview DSPM for AI" },
      { id: "b", text: "Azure Policy compliance reporting" },
      { id: "c", text: "Defender for Storage malware scanning" },
      { id: "d", text: "Microsoft Entra access reviews" },
    ],
    correct: ["a"],
    explanation:
      "DSPM for AI runs data risk assessments over the most-used SharePoint sites, reporting sensitive content and oversharing such as 'anyone with the link' sharing, with remediation actions. This is the standard pre-Copilot oversharing check.",
    difficulty: 2,
    reference: { label: "Microsoft Purview DSPM for AI", url: `${docs}/purview/dspm-for-ai` },
  },
  {
    id: "sc500-q34",
    domainId: "compute",
    type: "single",
    prompt:
      "You must apply Conditional Access to the identities that AI agents use, so agent access is governed like any other identity. Which construct do these policies target?",
    options: [
      { id: "a", text: "Microsoft Entra Agent ID" },
      { id: "b", text: "The tenant's break-glass accounts" },
      { id: "c", text: "Azure resource locks" },
      { id: "d", text: "Storage account SAS policies" },
    ],
    correct: ["a"],
    explanation:
      "Entra Agent ID gives AI agents first-class identities in the directory, so Conditional Access, access management, and lifecycle governance apply to them as they do to users and workloads.",
    difficulty: 3,
    reference: { label: "Microsoft Entra Agent ID", url: `${docs}/entra/identity/` },
  },
  {
    id: "sc500-q35",
    domainId: "compute",
    type: "single",
    prompt:
      "An AI agent identity is suspected of being misused. You need to understand what that agent could reach in order to prioritise containment. Which capability helps most?",
    options: [
      { id: "a", text: "Blast radius analysis for the agent identity in Microsoft Defender XDR" },
      { id: "b", text: "A storage account access review" },
      { id: "c", text: "Azure Policy remediation tasks" },
      { id: "d", text: "Key Vault soft delete" },
    ],
    correct: ["a"],
    explanation:
      "Blast radius analysis traverses what an identity can reach, showing the assets and data exposed if it is compromised, which is exactly what prioritises containment. Access reviews and policy remediation address governance rather than incident scoping.",
    difficulty: 3,
    reference: { label: "Defender XDR", url: `${docs}/defender-xdr/microsoft-365-defender` },
  },
  {
    id: "sc500-q36",
    domainId: "compute",
    type: "single",
    prompt:
      "You must centralise authentication, rate limiting, and policy enforcement for calls that internal applications make to Microsoft Foundry model endpoints. What should you deploy?",
    options: [
      { id: "a", text: "AI Gateway capabilities in Azure API Management in front of the model endpoints" },
      { id: "b", text: "A public load balancer with health probes" },
      { id: "c", text: "Azure Front Door with caching enabled" },
      { id: "d", text: "A service endpoint for Microsoft.CognitiveServices" },
    ],
    correct: ["a"],
    explanation:
      "API Management acting as an AI gateway centralises authentication, token-based rate limiting, logging, and policy for model traffic, so individual applications do not each hold credentials or enforce their own limits.",
    difficulty: 3,
    reference: { label: "AI gateway capabilities in API Management", url: `${docs}/azure/api-management/genai-gateway-capabilities` },
  },
  {
    id: "sc500-q37",
    domainId: "compute",
    type: "single",
    prompt:
      "Which Defender for Cloud workload protection plan detects threats against deployed AI services, such as prompt injection attempts and data exfiltration through model calls?",
    options: [
      { id: "a", text: "Defender for AI Services" },
      { id: "b", text: "Defender for Servers" },
      { id: "c", text: "Defender for Containers" },
      { id: "d", text: "Defender for Resource Manager" },
    ],
    correct: ["a"],
    explanation:
      "Defender for AI Services is the cloud workload protection plan covering deployed AI workloads, raising alerts for threats specific to model usage. The other plans cover machines, containers, and control-plane operations.",
    difficulty: 2,
    reference: { label: "Defender for AI Services", url: `${docs}/azure/defender-for-cloud/ai-threat-protection` },
  },
  {
    id: "sc500-q38",
    domainId: "compute",
    type: "single",
    prompt:
      "You must ensure that Azure-managed servers keep a required security configuration and drift is detected and corrected. Which service should you use?",
    options: [
      { id: "a", text: "Azure Machine Configuration" },
      { id: "b", text: "Azure Update Manager" },
      { id: "c", text: "Azure Backup" },
      { id: "d", text: "Azure Monitor alerts" },
    ],
    correct: ["a"],
    explanation:
      "Azure Machine Configuration audits and enforces in-guest settings on Azure and Arc-enabled machines, reporting and optionally remediating configuration drift. Update Manager handles patching, which is a different concern.",
    difficulty: 2,
    reference: { label: "Azure Machine Configuration", url: `${docs}/azure/governance/machine-configuration/overview` },
  },

  // ------------------------------------------------ posture & monitoring
  {
    id: "sc500-q39",
    domainId: "posture",
    type: "single",
    prompt:
      "You must find every internet-exposed virtual machine that has a high-severity vulnerability and can reach a storage account holding sensitive data, as a single query. Which capability should you use?",
    options: [
      { id: "a", text: "Cloud security explorer, which queries the cloud security graph" },
      { id: "b", text: "Secure score recommendations" },
      { id: "c", text: "The regulatory compliance dashboard" },
      { id: "d", text: "Workflow automation" },
    ],
    correct: ["a"],
    explanation:
      "Cloud security explorer queries the security graph, combining exposure, vulnerability, identity, and data-sensitivity conditions in one search. Recommendations and compliance views report on controls individually rather than relationships between resources.",
    difficulty: 3,
    reference: { label: "Cloud security explorer", url: `${docs}/azure/defender-for-cloud/concept-attack-path` },
  },
  {
    id: "sc500-q40",
    domainId: "posture",
    type: "single",
    prompt:
      "How is the Microsoft Defender for Cloud secure score calculated?",
    options: [
      { id: "a", text: "Each security control awards points only when every recommendation in it is satisfied for a resource, weighted by the control's maximum score" },
      { id: "b", text: "Every recommendation contributes equally regardless of grouping" },
      { id: "c", text: "It is the percentage of resources with any Defender plan enabled" },
      { id: "d", text: "It is 100 minus the number of open high-severity alerts" },
    ],
    correct: ["a"],
    explanation:
      "Recommendations are grouped into security controls, and a resource earns a control's points only when it satisfies every recommendation in that group. Alerts do not affect secure score at all.",
    difficulty: 2,
    reference: { label: "Secure score", url: `${docs}/azure/defender-for-cloud/secure-score-security-controls` },
  },
  {
    id: "sc500-q41",
    domainId: "posture",
    type: "single",
    prompt:
      "Your organisation must track compliance against an internal standard that is not one of the built-in regulatory standards. What should you do?",
    options: [
      { id: "a", text: "Add a custom standard in Defender for Cloud backed by an Azure Policy initiative containing your controls" },
      { id: "b", text: "Track it manually in a spreadsheet exported from the dashboard" },
      { id: "c", text: "Use secure score as a proxy for the internal standard" },
      { id: "d", text: "Request that Microsoft add the standard" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Cloud supports custom compliance standards built from Azure Policy initiatives, so your own controls appear in the regulatory compliance dashboard alongside built-in standards such as the Microsoft cloud security benchmark.",
    difficulty: 2,
    reference: { label: "Custom security standards", url: `${docs}/azure/defender-for-cloud/custom-security-policies` },
  },
  {
    id: "sc500-q42",
    domainId: "posture",
    type: "single",
    prompt:
      "You must control exactly which Windows security event IDs are collected from Azure and Arc-enabled machines into a Log Analytics workspace. What defines that scope?",
    options: [
      { id: "a", text: "A data collection rule associated with the machines" },
      { id: "b", text: "The workspace pricing tier" },
      { id: "c", text: "A Sentinel analytics rule" },
      { id: "d", text: "A diagnostic setting on the machine resource" },
    ],
    correct: ["a"],
    explanation:
      "Data collection rules define what the Azure Monitor Agent gathers, including XPath filters for specific event IDs, and which destinations receive it. Diagnostic settings cover platform logs for Azure resources rather than in-guest event logs.",
    difficulty: 2,
    reference: { label: "Data collection rules", url: `${docs}/azure/azure-monitor/essentials/data-collection-rule-overview` },
  },
  {
    id: "sc500-q43",
    domainId: "posture",
    type: "single",
    prompt:
      "Several hundred servers cannot each run an agent, but their Windows security events must reach Microsoft Sentinel. Which approach fits?",
    options: [
      { id: "a", text: "Windows Event Forwarding to collector servers that run the Azure Monitor Agent" },
      { id: "b", text: "The Logs Ingestion API called directly from each server" },
      { id: "c", text: "Diagnostic settings on each server" },
      { id: "d", text: "Syslog via AMA on each server" },
    ],
    correct: ["a"],
    explanation:
      "Windows Event Forwarding concentrates events onto collectors, so only those collectors need the agent — the standard pattern where per-server agents are not viable. Syslog covers Linux, and diagnostic settings apply to Azure resources.",
    difficulty: 2,
    reference: { label: "Windows Forwarded Events connector", url: `${docs}/azure/sentinel/data-connectors/windows-forwarded-events` },
  },
  {
    id: "sc500-q44",
    domainId: "posture",
    type: "single",
    prompt:
      "A third-party firewall emits Common Event Format messages. What is required to ingest them into Microsoft Sentinel?",
    options: [
      { id: "a", text: "A Linux forwarder running the Azure Monitor Agent with CEF collection configured, with the appliance sending to it" },
      { id: "b", text: "A diagnostic setting on the firewall resource" },
      { id: "c", text: "The Windows Security Events via AMA connector" },
      { id: "d", text: "A summary rule over the CommonSecurityLog table" },
    ],
    correct: ["a"],
    explanation:
      "CEF collection needs an intermediate Linux forwarder running the Azure Monitor Agent, which receives syslog/CEF from the appliance and forwards it into the workspace, landing in CommonSecurityLog. Summary rules aggregate data that is already ingested.",
    difficulty: 2,
    reference: { label: "Ingest CEF logs via AMA", url: `${docs}/azure/sentinel/connect-cef-syslog-ama` },
  },
  {
    id: "sc500-q45",
    domainId: "posture",
    type: "single",
    prompt:
      "A bespoke application emits JSON audit records that no built-in connector understands. What is the supported way to land them in a workspace table?",
    options: [
      { id: "a", text: "Create a custom table and send records through a data collection endpoint and rule using the Logs Ingestion API" },
      { id: "b", text: "Rename the fields to match an existing built-in table" },
      { id: "c", text: "Use the Syslog via AMA connector with a custom facility" },
      { id: "d", text: "Store them in blob storage and query with externaldata only" },
    ],
    correct: ["a"],
    explanation:
      "The Logs Ingestion API posts custom JSON to a data collection endpoint where a data collection rule transforms it into a custom table you define. Forcing data into a built-in schema breaks the connector contract, and externaldata is a query-time convenience rather than ingestion.",
    difficulty: 3,
    reference: { label: "Logs Ingestion API", url: `${docs}/azure/azure-monitor/logs/logs-ingestion-api-overview` },
  },
  {
    id: "sc500-q46",
    domainId: "posture",
    type: "single",
    prompt:
      "Which Microsoft Sentinel role lets a user create and edit analytics rules, workbooks, and playbooks, but not grant permissions to others?",
    options: [
      { id: "a", text: "Microsoft Sentinel Contributor" },
      { id: "b", text: "Microsoft Sentinel Reader" },
      { id: "c", text: "Microsoft Sentinel Responder" },
      { id: "d", text: "Owner on the resource group" },
    ],
    correct: ["a"],
    explanation:
      "Sentinel Contributor can author workspace content. Reader can only view, Responder additionally manages incidents but does not author rules, and Owner would also permit granting access to others.",
    difficulty: 2,
    reference: { label: "Roles and permissions in Microsoft Sentinel", url: `${docs}/azure/sentinel/roles` },
  },
  {
    id: "sc500-q47",
    domainId: "posture",
    type: "single",
    prompt:
      "Where do you install packaged Microsoft Sentinel solutions containing connectors, analytics rules, workbooks, and hunting queries for a specific product?",
    options: [
      { id: "a", text: "The Content hub" },
      { id: "b", text: "The Repositories page" },
      { id: "c", text: "The Watchlist page" },
      { id: "d", text: "The Automation page" },
    ],
    correct: ["a"],
    explanation:
      "Content hub is the in-product marketplace for Sentinel solutions, installing connectors and detection content as a unit. Repositories is for deploying your own content from Git.",
    difficulty: 1,
    reference: { label: "Sentinel Content hub", url: `${docs}/azure/sentinel/sentinel-solutions` },
  },
  {
    id: "sc500-q48",
    domainId: "posture",
    type: "single",
    prompt:
      "You want a Sentinel incident automatically assigned to an analyst and raised to high severity whenever a particular rule fires, with no external service involved. What should you create?",
    options: [
      { id: "a", text: "An automation rule triggered on incident creation" },
      { id: "b", text: "A playbook with an HTTP trigger" },
      { id: "c", text: "A workbook with scheduled refresh" },
      { id: "d", text: "A data collection rule" },
    ],
    correct: ["a"],
    explanation:
      "Automation rules natively set incident properties such as owner, severity, status, and tags without any external call. A playbook is only required when the action reaches another service.",
    difficulty: 2,
    reference: { label: "Automation rules", url: `${docs}/azure/sentinel/automate-incident-handling-with-automation-rules` },
  },
  {
    id: "sc500-q49",
    domainId: "posture",
    type: "single",
    prompt:
      "Firewall logs must be retained for seven years at the lowest cost while analytics rules still query the last 60 days. What should you implement?",
    options: [
      { id: "a", text: "Ingest into the data lake tier and use a KQL job to promote the recent window into the analytics tier" },
      { id: "b", text: "Ingest everything into the analytics tier with seven-year retention" },
      { id: "c", text: "Export to blob storage and query only with externaldata" },
      { id: "d", text: "Enable a daily ingestion cap on the workspace" },
    ],
    correct: ["a"],
    explanation:
      "The data lake tier retains large volumes cheaply for up to 12 years, and KQL jobs promote selected data into the analytics tier where analytics rules can reach it. Seven years in the analytics tier is exactly the cost this avoids, and a daily cap creates blind spots.",
    difficulty: 3,
    reference: { label: "Sentinel data lake overview", url: `${docs}/azure/sentinel/datalake/sentinel-lake-overview` },
  },
  {
    id: "sc500-q50",
    domainId: "posture",
    type: "single",
    prompt:
      "Microsoft Defender External Attack Surface Management is best described as a service that:",
    options: [
      { id: "a", text: "Discovers your internet-facing assets, including ones you did not know about, and reports their exposures" },
      { id: "b", text: "Scans internal virtual machines for missing operating system patches" },
      { id: "c", text: "Blocks outbound connections to malicious domains" },
      { id: "d", text: "Encrypts data at rest across storage accounts" },
    ],
    correct: ["a"],
    explanation:
      "EASM continuously maps the external attack surface from an attacker's perspective — domains, hosts, IP blocks, and certificates — surfacing shadow IT and exposed services. Patch assessment belongs to Defender Vulnerability Management.",
    difficulty: 2,
    reference: { label: "Defender EASM overview", url: `${docs}/azure/external-attack-surface-management/` },
  },
  {
    id: "sc500-q51",
    domainId: "posture",
    type: "single",
    prompt:
      "Before analysts can use Microsoft Security Copilot, which prerequisite must an administrator complete?",
    options: [
      { id: "a", text: "Provision a Security Copilot workspace with capacity, then assign roles and enable plugins" },
      { id: "b", text: "Deploy an on-premises gateway server" },
      { id: "c", text: "Create a Sentinel watchlist of analyst accounts" },
      { id: "d", text: "Enable anonymous access to the Defender portal" },
    ],
    correct: ["a"],
    explanation:
      "Security Copilot requires provisioned capacity and a workspace, after which access is granted through roles and data sources are connected via plugins. Nothing on-premises is required.",
    difficulty: 2,
    reference: { label: "Get started with Security Copilot", url: `${docs}/copilot/security/get-started-security-copilot` },
  },
  {
    id: "sc500-q52",
    domainId: "posture",
    type: "single",
    prompt:
      "You need Defender for Cloud recommendations to carry an owner and a due date so unaddressed items are reported as overdue. What should you configure?",
    options: [
      { id: "a", text: "Governance rules with owners and remediation timeframes" },
      { id: "b", text: "Workflow automation on recommendation changes" },
      { id: "c", text: "A custom compliance standard" },
      { id: "d", text: "Continuous export to Event Hubs" },
    ],
    correct: ["a"],
    explanation:
      "Governance rules assign an owner and remediation timeframe to recommendations, producing accountability and overdue tracking in the governance report. Workflow automation can notify but does not manage ownership or due dates.",
    difficulty: 2,
    reference: { label: "Drive remediation with governance rules", url: `${docs}/azure/defender-for-cloud/governance-rules` },
  },
];
