import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const az500Questions: Question[] = [
  // ---------------------------------------------------------------- identity
  {
    id: "az500-q1",
    domainId: "identity",
    type: "single",
    prompt:
      "You need to grant a support engineer the ability to restart virtual machines in a resource group, but not to create, delete, or reconfigure them. You want to follow least privilege. What should you do?",
    options: [
      { id: "a", text: "Assign the built-in Contributor role at the resource group scope" },
      { id: "b", text: "Assign the built-in Virtual Machine Contributor role at the subscription scope" },
      { id: "c", text: "Create a custom role with the Microsoft.Compute/virtualMachines/restart/action permission and assign it at the resource group scope" },
      { id: "d", text: "Assign the built-in Reader role at the resource group scope and add the engineer to the Azure VM Administrator Login group" },
    ],
    correct: ["c"],
    explanation:
      "No built-in role grants only restart rights. Virtual Machine Contributor and Contributor both allow full VM management, which exceeds the requirement, and Reader grants no write actions at all. A custom role scoped to the resource group containing Microsoft.Compute/virtualMachines/restart/action (plus read actions) is the least-privilege answer.",
    difficulty: 2,
    reference: { label: "Azure custom roles", url: `${docs}/azure/role-based-access-control/custom-roles` },
  },
  {
    id: "az500-q2",
    domainId: "identity",
    type: "single",
    prompt:
      "An Azure Function must read secrets from Azure Key Vault. The solution must avoid storing any credentials in application settings or code. What should you configure?",
    options: [
      { id: "a", text: "A system-assigned managed identity for the function app, granted access to the key vault" },
      { id: "b", text: "An app registration with a client secret stored in the function app settings" },
      { id: "c", text: "A service principal with a certificate uploaded to the function app" },
      { id: "d", text: "A shared access signature (SAS) token for the key vault" },
    ],
    correct: ["a"],
    explanation:
      "A managed identity is created and rotated by Azure, so no credential ever lives in code or configuration. App registrations with secrets or certificates still require credential material to be stored and rotated. Key Vault does not use SAS tokens — those are a storage account feature.",
    difficulty: 1,
    reference: { label: "Managed identities overview", url: `${docs}/entra/identity/managed-identities-azure-resources/overview` },
  },
  {
    id: "az500-q3",
    domainId: "identity",
    type: "multi",
    prompt:
      "Which two configurations can you apply in Microsoft Entra Privileged Identity Management to reduce standing access to an Azure subscription? (Choose two.)",
    options: [
      { id: "a", text: "Make role assignments eligible rather than active" },
      { id: "b", text: "Require approval to activate the role" },
      { id: "c", text: "Add the subscription to a management group" },
      { id: "d", text: "Enable Azure AD Connect password hash synchronization" },
    ],
    correct: ["a", "b"],
    explanation:
      "Eligible assignments mean the user holds no permissions until they activate, which directly removes standing access. Requiring approval adds a second control on that activation. Management groups affect scope inheritance, not standing access, and password hash sync is a hybrid identity feature unrelated to PIM.",
    difficulty: 2,
    reference: { label: "PIM for Azure resources", url: `${docs}/entra/id-governance/privileged-identity-management/pim-resource-roles-assign-roles` },
  },
  {
    id: "az500-q13",
    domainId: "identity",
    type: "single",
    prompt:
      "A user is assigned Reader at the subscription scope and Contributor at a resource group inside that subscription. What effective permissions does the user have on resources in that resource group?",
    options: [
      { id: "a", text: "Reader only, because the assignment at the higher scope wins" },
      { id: "b", text: "Contributor, because Azure RBAC assignments are additive and the most permissive union applies" },
      { id: "c", text: "No access, because conflicting assignments cancel each other out" },
      { id: "d", text: "Contributor on existing resources but Reader on new resources" },
    ],
    correct: ["b"],
    explanation:
      "Azure RBAC role assignments are additive: a user's effective permissions are the union of every assignment that applies at or above the resource scope. Only a deny assignment (used by Azure Blueprints and managed apps) can subtract permissions.",
    difficulty: 2,
    reference: { label: "How Azure RBAC determines access", url: `${docs}/azure/role-based-access-control/overview` },
  },
  {
    id: "az500-q14",
    domainId: "identity",
    type: "single",
    prompt:
      "You must require multifactor authentication for anyone performing management operations in the Azure portal, Azure CLI, or Azure PowerShell, without affecting access to other cloud apps. Which Conditional Access target should you select?",
    options: [
      { id: "a", text: "The Microsoft Azure Management cloud app" },
      { id: "b", text: "All cloud apps, with Office 365 excluded" },
      { id: "c", text: "The Microsoft Graph API app" },
      { id: "d", text: "The Windows Azure Active Directory app" },
    ],
    correct: ["a"],
    explanation:
      "The Microsoft Azure Management cloud app covers the Azure portal, Azure Resource Manager, the CLI, and Azure PowerShell in a single target, so the policy applies to management operations only. Targeting all cloud apps would reach far more than management, and the other apps listed do not represent the ARM control plane.",
    difficulty: 2,
    reference: { label: "Conditional Access: cloud apps", url: `${docs}/entra/identity/conditional-access/concept-conditional-access-cloud-apps` },
  },
  {
    id: "az500-q15",
    domainId: "identity",
    type: "single",
    prompt:
      "A developer registers an application that needs to read all users' calendars without a signed-in user. Which permission type must be granted, and who must consent?",
    options: [
      { id: "a", text: "Delegated permission, consented by each user individually" },
      { id: "b", text: "Application permission, requiring admin consent" },
      { id: "c", text: "Delegated permission, requiring admin consent on behalf of the organization" },
      { id: "d", text: "Application permission, consented by the application owner" },
    ],
    correct: ["b"],
    explanation:
      "Without a signed-in user the app acts as itself, which requires application permissions (app roles). Application permissions always require an administrator to grant tenant-wide admin consent. Delegated permissions only work when a user is present, and app owners cannot self-consent to application permissions.",
    difficulty: 2,
    reference: { label: "Permissions and consent", url: `${docs}/entra/identity-platform/permissions-consent-overview` },
  },
  {
    id: "az500-q16",
    domainId: "identity",
    type: "single",
    prompt:
      "Ten virtual machines across three resource groups must all authenticate to the same Azure Storage account. You want one identity that survives the deletion of any individual VM. What should you use?",
    options: [
      { id: "a", text: "A system-assigned managed identity on each VM" },
      { id: "b", text: "A single user-assigned managed identity attached to all ten VMs" },
      { id: "c", text: "A service principal with a shared client secret" },
      { id: "d", text: "The storage account access key stored in each VM's local configuration" },
    ],
    correct: ["b"],
    explanation:
      "A user-assigned managed identity is a standalone Azure resource with its own lifecycle, so it can be attached to many VMs and is unaffected when one is deleted — and you grant the storage role once. System-assigned identities are per-resource and die with the resource, meaning ten separate role assignments.",
    difficulty: 2,
    reference: { label: "Managed identity types", url: `${docs}/entra/identity/managed-identities-azure-resources/overview` },
  },
  {
    id: "az500-q17",
    domainId: "identity",
    type: "single",
    prompt:
      "Which statement correctly distinguishes Azure RBAC roles from Microsoft Entra roles?",
    options: [
      { id: "a", text: "Azure RBAC roles control access to Azure resources; Entra roles control access to directory objects and Microsoft 365 services" },
      { id: "b", text: "Entra roles control access to Azure resources; Azure RBAC roles control directory objects" },
      { id: "c", text: "They are the same roles exposed through two different portals" },
      { id: "d", text: "Azure RBAC roles can only be assigned at subscription scope, Entra roles only at tenant scope" },
    ],
    correct: ["a"],
    explanation:
      "Azure RBAC governs the Azure control plane — management groups, subscriptions, resource groups, and resources. Entra roles (such as Global Administrator or User Administrator) govern the directory itself and Microsoft 365 services. A Global Administrator has no Azure resource access by default until they elevate access.",
    difficulty: 1,
    reference: { label: "Azure roles vs Entra roles", url: `${docs}/azure/role-based-access-control/rbac-and-directory-admin-roles` },
  },
  {
    id: "az500-q18",
    domainId: "identity",
    type: "single",
    prompt:
      "You want guest accounts with access to a production subscription to be recertified by their sponsor every 90 days, with access removed automatically if the reviewer does not respond. Which feature should you configure?",
    options: [
      { id: "a", text: "A Microsoft Entra ID Governance access review" },
      { id: "b", text: "A PIM activation approval workflow" },
      { id: "c", text: "A Conditional Access policy with a sign-in frequency control" },
      { id: "d", text: "An Azure Policy assignment with the Deny effect" },
    ],
    correct: ["a"],
    explanation:
      "Access reviews recur on a schedule, route to designated reviewers, and support an 'if reviewers don't respond' action such as Remove access. PIM approvals gate activation rather than recertify standing membership, sign-in frequency only forces reauthentication, and Azure Policy governs resource configuration.",
    difficulty: 2,
    reference: { label: "Access reviews", url: `${docs}/entra/id-governance/access-reviews-overview` },
  },
  {
    id: "az500-q19",
    domainId: "identity",
    type: "single",
    prompt:
      "When creating a custom Azure role, which property determines where the role can be assigned?",
    options: [
      { id: "a", text: "AssignableScopes" },
      { id: "b", text: "Actions" },
      { id: "c", text: "NotActions" },
      { id: "d", text: "DataActions" },
    ],
    correct: ["a"],
    explanation:
      "AssignableScopes lists the management groups, subscriptions, or resource groups where the role definition may be used. Actions and NotActions define control-plane operations granted and excluded, and DataActions defines data-plane operations such as reading blob contents.",
    difficulty: 1,
    reference: { label: "Azure custom roles", url: `${docs}/azure/role-based-access-control/custom-roles` },
  },
  {
    id: "az500-q20",
    domainId: "identity",
    type: "multi",
    prompt:
      "An application registration authenticates with a client secret that expires in 30 days. Which two approaches remove the recurring expiry problem entirely? (Choose two.)",
    options: [
      { id: "a", text: "Replace the client secret with a managed identity where the workload runs on an Azure resource that supports it" },
      { id: "b", text: "Configure workload identity federation so an external token is exchanged for an Entra token" },
      { id: "c", text: "Set the client secret expiry to the maximum allowed period" },
      { id: "d", text: "Store the client secret in Azure Key Vault" },
    ],
    correct: ["a", "b"],
    explanation:
      "Managed identities and workload identity federation both remove the stored credential completely — Azure or a trusted external issuer handles the token exchange, so there is nothing to expire. Extending the expiry only delays the problem, and Key Vault protects the secret without stopping it from expiring.",
    difficulty: 3,
    reference: { label: "Workload identity federation", url: `${docs}/entra/workload-id/workload-identity-federation` },
  },

  // ----------------------------------------------------------------- network
  {
    id: "az500-q4",
    domainId: "network",
    type: "single",
    prompt:
      "A virtual machine in Subnet1 must reach an Azure Storage account over the Microsoft backbone using a private IP address from your virtual network. Traffic must not traverse the public internet, and the storage account must be reachable by its private IP from on-premises over ExpressRoute. What should you implement?",
    options: [
      { id: "a", text: "A virtual network service endpoint for Microsoft.Storage on Subnet1" },
      { id: "b", text: "A private endpoint for the storage account in Subnet1" },
      { id: "c", text: "A user-defined route sending 0.0.0.0/0 to a virtual appliance" },
      { id: "d", text: "A network security group rule allowing the Storage service tag" },
    ],
    correct: ["b"],
    explanation:
      "A private endpoint projects the storage account into your virtual network as a NIC with a private IP, which is what makes it reachable privately from on-premises over ExpressRoute. Service endpoints keep traffic on the Microsoft backbone but the service keeps its public IP and on-premises networks cannot use them. UDRs and NSG rules control routing and filtering, not private addressing.",
    difficulty: 2,
    reference: { label: "Private Endpoint vs Service Endpoint", url: `${docs}/azure/private-link/private-endpoint-overview` },
  },
  {
    id: "az500-q5",
    domainId: "network",
    type: "single",
    prompt:
      "You have an NSG with these inbound rules: priority 100 Deny TCP 3389 from Internet, priority 200 Allow TCP 3389 from 10.0.0.0/8, priority 300 Allow TCP 443 from Internet. An RDP connection arrives from 10.1.2.3. What happens?",
    options: [
      { id: "a", text: "The connection is denied, because rule 100 is evaluated first" },
      { id: "b", text: "The connection is allowed, because rule 200 matches the source address" },
      { id: "c", text: "The connection is denied by the default DenyAllInbound rule" },
      { id: "d", text: "The connection is allowed, because 443 is open" },
    ],
    correct: ["b"],
    explanation:
      "NSG rules are processed in priority order, but only rules whose source, destination, port, and protocol all match are considered. Rule 100 only matches the Internet service tag, and 10.1.2.3 is a private address that falls under VirtualNetwork, so rule 100 does not match. Rule 200 is the first matching rule and allows the traffic.",
    difficulty: 3,
    reference: { label: "How network security groups filter traffic", url: `${docs}/azure/virtual-network/network-security-group-how-it-works` },
  },
  {
    id: "az500-q6",
    domainId: "network",
    type: "single",
    prompt:
      "You must protect a public web application from SQL injection and cross-site scripting at the edge, with global load balancing across regions. Which service should you use?",
    options: [
      { id: "a", text: "Azure Firewall Premium with TLS inspection" },
      { id: "b", text: "Azure Front Door with Web Application Firewall" },
      { id: "c", text: "Azure DDoS Protection Standard" },
      { id: "d", text: "Network security groups with application security groups" },
    ],
    correct: ["b"],
    explanation:
      "WAF on Azure Front Door inspects HTTP/HTTPS at the global edge with managed rule sets covering OWASP threats such as SQLi and XSS, and Front Door provides global load balancing. Azure Firewall is a regional network firewall, DDoS Protection addresses volumetric attacks rather than application-layer injection, and NSGs filter by IP, port, and protocol only.",
    difficulty: 1,
    reference: { label: "Azure Web Application Firewall", url: `${docs}/azure/web-application-firewall/overview` },
  },
  {
    id: "az500-q21",
    domainId: "network",
    type: "single",
    prompt:
      "All outbound internet traffic from a spoke virtual network must be inspected by an Azure Firewall in a hub virtual network. What must you configure on the spoke subnets?",
    options: [
      { id: "a", text: "A user-defined route for 0.0.0.0/0 with next hop type Virtual appliance set to the firewall's private IP" },
      { id: "b", text: "A network security group rule denying all outbound internet traffic" },
      { id: "c", text: "A service endpoint for Microsoft.Network" },
      { id: "d", text: "Virtual network peering with gateway transit enabled" },
    ],
    correct: ["a"],
    explanation:
      "Azure's default system route sends 0.0.0.0/0 straight to the internet. Overriding it with a UDR whose next hop is the firewall's private IP forces egress through the firewall. NSGs can block traffic but cannot redirect it, service endpoints target PaaS services, and peering alone does not change routing.",
    difficulty: 2,
    reference: { label: "Azure Firewall in a hub network", url: `${docs}/azure/firewall/tutorial-hybrid-portal` },
  },
  {
    id: "az500-q22",
    domainId: "network",
    type: "single",
    prompt:
      "You want to write NSG rules that reference groups of virtual machines by function — for example allowing the web tier to reach the database tier — without hardcoding IP addresses that change as VMs scale. What should you use?",
    options: [
      { id: "a", text: "Application security groups (ASGs)" },
      { id: "b", text: "Service tags" },
      { id: "c", text: "Availability sets" },
      { id: "d", text: "Route tables" },
    ],
    correct: ["a"],
    explanation:
      "ASGs let you group NICs by workload role and then use those groups as the source or destination in NSG rules, so membership follows the VMs rather than their addresses. Service tags represent Microsoft-managed address ranges for Azure services, not your own workloads.",
    difficulty: 1,
    reference: { label: "Application security groups", url: `${docs}/azure/virtual-network/application-security-groups` },
  },
  {
    id: "az500-q23",
    domainId: "network",
    type: "single",
    prompt:
      "Your organization has 60 virtual networks and needs a baseline rule blocking inbound SSH from the internet that individual network owners cannot override with their own NSG rules. What should you use?",
    options: [
      { id: "a", text: "Azure Virtual Network Manager security admin rules" },
      { id: "b", text: "An NSG applied to every subnet by Azure Policy" },
      { id: "c", text: "Azure Firewall network rules" },
      { id: "d", text: "A route table with next hop None" },
    ],
    correct: ["a"],
    explanation:
      "Security admin rules in Azure Virtual Network Manager are evaluated before NSGs and cannot be overridden by them, which is exactly the guardrail described. Deploying NSGs by policy still leaves owners able to edit those NSGs, and Azure Firewall does not intercept traffic unless routing sends it there.",
    difficulty: 2,
    reference: { label: "Security admin rules", url: `${docs}/azure/virtual-network-manager/concept-security-admins` },
  },
  {
    id: "az500-q24",
    domainId: "network",
    type: "single",
    prompt:
      "A partner organization must consume a service running behind a Standard Load Balancer in your virtual network, using a private endpoint in their own tenant. What must you create?",
    options: [
      { id: "a", text: "A Private Link service in front of the load balancer" },
      { id: "b", text: "A private endpoint in your virtual network" },
      { id: "c", text: "A virtual network peering to the partner's network" },
      { id: "d", text: "A service endpoint policy" },
    ],
    correct: ["a"],
    explanation:
      "A Private Link service publishes your own service, fronted by a Standard Load Balancer, so consumers in other tenants can attach private endpoints to it. Private endpoints are what the consumer creates; peering would join the networks entirely, which is far broader than required.",
    difficulty: 2,
    reference: { label: "What is Azure Private Link service?", url: `${docs}/azure/private-link/private-link-service-overview` },
  },
  {
    id: "az500-q25",
    domainId: "network",
    type: "single",
    prompt:
      "A subnet has a service endpoint enabled for Microsoft.Storage. You must ensure VMs on that subnet can reach only your own storage accounts and not any other storage account in Azure. What should you configure?",
    options: [
      { id: "a", text: "A service endpoint policy on the subnet" },
      { id: "b", text: "A storage account firewall rule allowing the subnet" },
      { id: "c", text: "An NSG rule using the Storage service tag" },
      { id: "d", text: "A private endpoint for each storage account" },
    ],
    correct: ["a"],
    explanation:
      "Service endpoint policies restrict service endpoint traffic to a specified list of Azure resources, preventing exfiltration to arbitrary storage accounts. Storage firewall rules protect your account from others but do not stop your VMs reaching third-party accounts, and the Storage service tag covers the whole service.",
    difficulty: 3,
    reference: { label: "Service endpoint policies", url: `${docs}/azure/virtual-network/virtual-network-service-endpoint-policies-overview` },
  },
  {
    id: "az500-q26",
    domainId: "network",
    type: "single",
    prompt:
      "Which Azure Network Watcher capability shows you the aggregate NSG rules actually applied to a network interface, combining subnet-level and NIC-level rules?",
    options: [
      { id: "a", text: "Effective security rules" },
      { id: "b", text: "NSG flow logs" },
      { id: "c", text: "Connection monitor" },
      { id: "d", text: "Packet capture" },
    ],
    correct: ["a"],
    explanation:
      "Effective security rules merge the NSG associated with the subnet and the NSG associated with the NIC to show what is genuinely enforced — the fastest way to diagnose an unexpected block. Flow logs record traffic that was allowed or denied, connection monitor tests reachability, and packet capture records payloads.",
    difficulty: 2,
    reference: { label: "Network Watcher", url: `${docs}/azure/network-watcher/network-watcher-overview` },
  },
  {
    id: "az500-q27",
    domainId: "network",
    type: "single",
    prompt:
      "You are designing point-to-site VPN access for remote administrators and must support Microsoft Entra ID authentication with Conditional Access. Which tunnel type must the gateway use?",
    options: [
      { id: "a", text: "OpenVPN (SSL/TLS)" },
      { id: "b", text: "IKEv2" },
      { id: "c", text: "SSTP" },
      { id: "d", text: "L2TP/IPsec" },
    ],
    correct: ["a"],
    explanation:
      "Microsoft Entra ID authentication for point-to-site VPN is only supported with the OpenVPN tunnel type. IKEv2 and SSTP support certificate or RADIUS authentication, and L2TP/IPsec is not offered for Azure point-to-site gateways.",
    difficulty: 3,
    reference: { label: "P2S VPN with Entra ID authentication", url: `${docs}/azure/vpn-gateway/point-to-site-about` },
  },
  {
    id: "az500-q28",
    domainId: "network",
    type: "single",
    prompt:
      "Which statement about Azure DDoS Protection is correct?",
    options: [
      { id: "a", text: "Basic platform protection is always on at no cost; the paid tiers add tuned per-resource mitigation, telemetry, attack analytics, and cost protection" },
      { id: "b", text: "DDoS protection must be enabled per virtual machine and inspects application-layer payloads" },
      { id: "c", text: "DDoS protection replaces the need for a web application firewall" },
      { id: "d", text: "DDoS protection is only available for resources behind Azure Front Door" },
    ],
    correct: ["a"],
    explanation:
      "Azure provides always-on basic infrastructure-level protection free of charge. The paid tiers apply adaptive tuning to your public IPs, add rich telemetry and post-attack reports, and include cost protection for scale-out during an attack. Application-layer attacks such as SQL injection still require a WAF.",
    difficulty: 2,
    reference: { label: "Azure DDoS Protection overview", url: `${docs}/azure/ddos-protection/ddos-protection-overview` },
  },
  {
    id: "az500-q29",
    domainId: "network",
    type: "single",
    prompt:
      "An App Service web app must call an internal API hosted on a VM in your virtual network, and must not be reachable from the public internet. Which combination achieves this?",
    options: [
      { id: "a", text: "Regional VNet integration for outbound calls, plus a private endpoint for inbound access" },
      { id: "b", text: "A private endpoint only" },
      { id: "c", text: "Regional VNet integration only" },
      { id: "d", text: "An App Service Environment is the only option" },
    ],
    correct: ["a"],
    explanation:
      "The two directions need different features. VNet integration gives the app outbound access into the virtual network so it can reach the VM, while a private endpoint gives the app a private inbound address and lets you disable public access. An App Service Environment provides isolation but is not required for this scenario.",
    difficulty: 3,
    reference: { label: "App Service networking features", url: `${docs}/azure/app-service/networking-features` },
  },
  {
    id: "az500-q30",
    domainId: "network",
    type: "single",
    prompt:
      "You are deploying Azure Virtual WAN and need centralized firewalling for traffic between branches, virtual networks, and the internet. What should you deploy?",
    options: [
      { id: "a", text: "A secured virtual hub with Azure Firewall, managed through Azure Firewall Manager" },
      { id: "b", text: "An NSG applied to the virtual hub subnet" },
      { id: "c", text: "A network virtual appliance in each spoke virtual network" },
      { id: "d", text: "Azure Front Door with WAF policies" },
    ],
    correct: ["a"],
    explanation:
      "Converting a Virtual WAN hub into a secured virtual hub deploys Azure Firewall inside the hub and centralizes policy through Azure Firewall Manager, inspecting branch, VNet, and internet traffic. NSGs cannot be applied to hub subnets, and per-spoke appliances defeat the point of centralization.",
    difficulty: 2,
    reference: { label: "Secured virtual hub", url: `${docs}/azure/firewall-manager/secured-virtual-hub` },
  },
  {
    id: "az500-q31",
    domainId: "network",
    type: "multi",
    prompt:
      "Which two capabilities are available only in Azure Firewall Premium and not in the Standard tier? (Choose two.)",
    options: [
      { id: "a", text: "TLS inspection" },
      { id: "b", text: "IDPS (intrusion detection and prevention system)" },
      { id: "c", text: "Application rules with FQDN filtering" },
      { id: "d", text: "Network rules with service tags" },
    ],
    correct: ["a", "b"],
    explanation:
      "TLS inspection and signature-based IDPS are Premium-only features, along with URL filtering and web categories. Application rules with FQDN filtering and network rules using service tags are available in the Standard tier.",
    difficulty: 2,
    reference: { label: "Azure Firewall Premium features", url: `${docs}/azure/firewall/premium-features` },
  },

  // ----------------------------------------------------------------- compute
  {
    id: "az500-q7",
    domainId: "compute",
    type: "single",
    prompt:
      "Administrators must connect to Azure VMs over RDP and SSH without the VMs having public IP addresses and without deploying a jump box you have to patch. What should you deploy?",
    options: [
      { id: "a", text: "Azure Bastion" },
      { id: "b", text: "Just-in-time VM access in Microsoft Defender for Cloud" },
      { id: "c", text: "A site-to-site VPN gateway" },
      { id: "d", text: "Azure Firewall with DNAT rules" },
    ],
    correct: ["a"],
    explanation:
      "Azure Bastion is a fully managed PaaS service that provides RDP and SSH over TLS directly in the portal to VMs using only private IPs, so there is no public IP and no jump box to maintain. JIT access reduces the exposure window but still relies on a public endpoint. VPN and Firewall DNAT both require additional infrastructure you manage.",
    difficulty: 1,
    reference: { label: "What is Azure Bastion?", url: `${docs}/azure/bastion/bastion-overview` },
  },
  {
    id: "az500-q8",
    domainId: "compute",
    type: "single",
    prompt:
      "A compliance requirement states that blob data must not be deletable or modifiable for seven years, including by subscription owners. What should you configure?",
    options: [
      { id: "a", text: "Blob soft delete with a 2555-day retention period" },
      { id: "b", text: "A time-based immutability policy that has been locked" },
      { id: "c", text: "Blob versioning combined with a resource lock" },
      { id: "d", text: "A legal hold tag on the storage account" },
    ],
    correct: ["b"],
    explanation:
      "A locked time-based retention (immutability) policy enforces WORM storage that nobody, including the subscription owner, can shorten or remove until the interval elapses. Soft delete and versioning protect against accidental loss but can be reconfigured by an owner, and resource locks can be removed by owners.",
    difficulty: 2,
    reference: { label: "Immutable storage for Blob Storage", url: `${docs}/azure/storage/blobs/immutable-storage-overview` },
  },
  {
    id: "az500-q9",
    domainId: "compute",
    type: "single",
    prompt:
      "Support staff must be able to query a customer table in Azure SQL Database, but credit card numbers must appear obfuscated in the results. The stored data itself must remain unchanged and other applications must still read the real values. What should you implement?",
    options: [
      { id: "a", text: "Transparent Data Encryption (TDE)" },
      { id: "b", text: "Always Encrypted with deterministic encryption" },
      { id: "c", text: "Dynamic data masking" },
      { id: "d", text: "Row-level security" },
    ],
    correct: ["c"],
    explanation:
      "Dynamic data masking obfuscates values at query time for designated users while leaving the stored data intact and unmasked for privileged callers. TDE encrypts data at rest and is transparent to all queries. Always Encrypted hides values from the database engine entirely, which would break other applications. Row-level security filters rows, not columns.",
    difficulty: 2,
    reference: { label: "Dynamic data masking", url: `${docs}/azure/azure-sql/database/dynamic-data-masking-overview` },
  },
  {
    id: "az500-q32",
    domainId: "compute",
    type: "single",
    prompt:
      "You must ensure that data on a VM's OS disk, data disks, temporary disk, and host caches is all encrypted, without installing or managing anything inside the guest operating system. What should you enable?",
    options: [
      { id: "a", text: "Encryption at host" },
      { id: "b", text: "Azure Disk Encryption (ADE)" },
      { id: "c", text: "Storage service encryption with customer-managed keys" },
      { id: "d", text: "Confidential computing with a DCasv5 VM size" },
    ],
    correct: ["a"],
    explanation:
      "Encryption at host encrypts data on the Azure host before it is written to storage, covering temp disks and disk caches, and needs no in-guest agent. ADE uses BitLocker or dm-crypt inside the guest and does not cover host caches the same way. Storage service encryption applies to storage accounts rather than managed disk hosts.",
    difficulty: 2,
    reference: { label: "Encryption at host", url: `${docs}/azure/virtual-machines/disk-encryption` },
  },
  {
    id: "az500-q33",
    domainId: "compute",
    type: "single",
    prompt:
      "You must give an external auditor read access to one blob container for 24 hours. The credential must be revocable immediately and must be tied to a Microsoft Entra identity rather than the storage account key. What should you issue?",
    options: [
      { id: "a", text: "A user delegation SAS" },
      { id: "b", text: "An account SAS" },
      { id: "c", text: "A service SAS" },
      { id: "d", text: "The storage account's secondary access key" },
    ],
    correct: ["a"],
    explanation:
      "A user delegation SAS is signed with a key obtained from Microsoft Entra ID rather than the account key, so it inherits Entra identity and can be revoked by revoking the user delegation key. Account and service SAS tokens are signed with the storage account key, and sharing an account key grants full access.",
    difficulty: 3,
    reference: { label: "User delegation SAS", url: `${docs}/rest/api/storageservices/create-a-user-delegation-sas` },
  },
  {
    id: "az500-q34",
    domainId: "compute",
    type: "single",
    prompt:
      "Your security baseline requires that no one can authenticate to a storage account using its access keys. What should you configure?",
    options: [
      { id: "a", text: "Disable shared key authorization on the storage account so only Microsoft Entra authorization is accepted" },
      { id: "b", text: "Rotate the storage account keys every 24 hours" },
      { id: "c", text: "Enable the storage firewall and restrict it to your virtual network" },
      { id: "d", text: "Require secure transfer (HTTPS only)" },
    ],
    correct: ["a"],
    explanation:
      "Setting allowSharedKeyAccess to false rejects any request signed with the account keys, forcing all access through Microsoft Entra identities and Azure RBAC. Rotation limits exposure but keys still work, and the firewall and HTTPS settings control where and how requests arrive rather than how they authenticate.",
    difficulty: 2,
    reference: { label: "Prevent shared key authorization", url: `${docs}/azure/storage/common/shared-key-authorization-prevent` },
  },
  {
    id: "az500-q35",
    domainId: "compute",
    type: "single",
    prompt:
      "An Azure Kubernetes Service cluster must not expose its API server to the public internet. What should you deploy?",
    options: [
      { id: "a", text: "A private AKS cluster, where the API server has a private endpoint in your virtual network" },
      { id: "b", text: "A network policy denying all ingress" },
      { id: "c", text: "An internal load balancer for the ingress controller" },
      { id: "d", text: "A Kubernetes RBAC role binding restricting cluster-admin" },
    ],
    correct: ["a"],
    explanation:
      "A private cluster gives the managed API server a private endpoint so the control plane is reachable only from the virtual network or peered networks. Network policies govern pod-to-pod traffic, an internal load balancer affects workload ingress rather than the API server, and RBAC governs authorization once you can already reach the endpoint.",
    difficulty: 2,
    reference: { label: "Private AKS cluster", url: `${docs}/azure/aks/private-clusters` },
  },
  {
    id: "az500-q36",
    domainId: "compute",
    type: "single",
    prompt:
      "You need to restrict which pods in an AKS cluster can communicate with each other at the network layer. What should you configure?",
    options: [
      { id: "a", text: "Kubernetes network policies" },
      { id: "b", text: "Network security groups on the node subnet" },
      { id: "c", text: "Azure Firewall application rules" },
      { id: "d", text: "Pod security admission" },
    ],
    correct: ["a"],
    explanation:
      "Network policies define allowed ingress and egress between pods using label selectors, which is the pod-level segmentation asked for. NSGs operate on the node subnet and cannot see individual pods, and pod security admission constrains pod security context rather than traffic.",
    difficulty: 2,
    reference: { label: "Secure traffic between pods", url: `${docs}/azure/aks/use-network-policies` },
  },
  {
    id: "az500-q37",
    domainId: "compute",
    type: "single",
    prompt:
      "An AKS cluster must pull images from an Azure Container Registry without any credentials being stored in Kubernetes secrets. What is the recommended approach?",
    options: [
      { id: "a", text: "Attach the registry to the cluster so the kubelet identity is granted the AcrPull role" },
      { id: "b", text: "Create an image pull secret from the registry admin account" },
      { id: "c", text: "Enable anonymous pull access on the registry" },
      { id: "d", text: "Store the registry password in a Kubernetes ConfigMap" },
    ],
    correct: ["a"],
    explanation:
      "Attaching ACR to AKS grants the cluster's managed identity the AcrPull role, so image pulls are authorized by Entra with no stored secret. The admin account should stay disabled, anonymous pull removes access control entirely, and ConfigMaps are not for secrets.",
    difficulty: 2,
    reference: { label: "Authenticate with ACR from AKS", url: `${docs}/azure/aks/cluster-container-registry-integration` },
  },
  {
    id: "az500-q38",
    domainId: "compute",
    type: "single",
    prompt:
      "Azure Files must be accessed by domain-joined Windows clients using their existing Active Directory identities, with NTFS permissions honoured. What should you configure?",
    options: [
      { id: "a", text: "Identity-based authentication for the file share using AD DS or Microsoft Entra Domain Services" },
      { id: "b", text: "A storage account SAS token distributed to each user" },
      { id: "c", text: "The storage account key configured in each client's credential manager" },
      { id: "d", text: "A private endpoint for the file share" },
    ],
    correct: ["a"],
    explanation:
      "Identity-based authentication lets Azure Files honour Kerberos tickets from AD DS or Entra Domain Services and enforce share-level RBAC alongside NTFS ACLs. SAS tokens and account keys bypass user identity entirely, and a private endpoint changes reachability rather than authentication.",
    difficulty: 2,
    reference: { label: "Azure Files identity-based authentication", url: `${docs}/azure/storage/files/storage-files-active-directory-overview` },
  },
  {
    id: "az500-q39",
    domainId: "compute",
    type: "single",
    prompt:
      "Regulatory rules require that the encryption key protecting an Azure SQL Database can be revoked by your organization at any moment, immediately rendering the database unreadable. What should you configure?",
    options: [
      { id: "a", text: "Transparent Data Encryption with a customer-managed key in Azure Key Vault (BYOK)" },
      { id: "b", text: "Transparent Data Encryption with the service-managed key" },
      { id: "c", text: "Dynamic data masking on all sensitive columns" },
      { id: "d", text: "Azure Disk Encryption on the underlying host" },
    ],
    correct: ["a"],
    explanation:
      "With a customer-managed TDE protector, the key lives in your key vault, so revoking access or disabling the key makes the database inaccessible within minutes. A service-managed key is controlled by Microsoft, masking does not encrypt, and ADE does not apply to Azure SQL Database as a PaaS service.",
    difficulty: 2,
    reference: { label: "TDE with customer-managed keys", url: `${docs}/azure/azure-sql/database/transparent-data-encryption-byok-overview` },
  },
  {
    id: "az500-q40",
    domainId: "compute",
    type: "single",
    prompt:
      "Which Azure SQL feature ensures that sensitive column values are never visible in plaintext to the database engine or to a database administrator?",
    options: [
      { id: "a", text: "Always Encrypted" },
      { id: "b", text: "Transparent Data Encryption" },
      { id: "c", text: "Dynamic data masking" },
      { id: "d", text: "Auditing with Log Analytics" },
    ],
    correct: ["a"],
    explanation:
      "Always Encrypted performs encryption and decryption in the client driver, so the engine only ever sees ciphertext and a DBA cannot read the values. TDE protects data at rest but the engine decrypts transparently, and masking only affects presentation for non-privileged users.",
    difficulty: 2,
    reference: { label: "Always Encrypted", url: `${docs}/sql/relational-databases/security/encryption/always-encrypted-database-engine` },
  },
  {
    id: "az500-q41",
    domainId: "compute",
    type: "single",
    prompt:
      "Just-in-time VM access has been enabled for a virtual machine. What actually happens when a user requests access?",
    options: [
      { id: "a", text: "Defender for Cloud adds a temporary allow rule to the NSG for the requester's source IP and port, which expires automatically" },
      { id: "b", text: "The VM is started from a deallocated state for the requested period" },
      { id: "c", text: "A Bastion session is provisioned for the requester" },
      { id: "d", text: "The VM's public IP address is created on demand and deleted afterwards" },
    ],
    correct: ["a"],
    explanation:
      "JIT works by keeping management ports closed in the NSG (and Azure Firewall where applicable) and inserting a time-limited allow rule scoped to the approved source and port when an authorized user requests access. The rule is removed when the window ends.",
    difficulty: 2,
    reference: { label: "Just-in-time VM access", url: `${docs}/azure/defender-for-cloud/just-in-time-access-overview` },
  },
  {
    id: "az500-q42",
    domainId: "compute",
    type: "multi",
    prompt:
      "Which two storage account settings help you recover blob data that a user overwrote or deleted by mistake? (Choose two.)",
    options: [
      { id: "a", text: "Blob versioning" },
      { id: "b", text: "Blob soft delete" },
      { id: "c", text: "Infrastructure encryption" },
      { id: "d", text: "Secure transfer required" },
    ],
    correct: ["a", "b"],
    explanation:
      "Versioning automatically preserves a previous version whenever a blob is modified or deleted, and soft delete retains deleted blobs for a configured retention period so they can be undeleted. Infrastructure encryption adds a second layer of encryption at rest, and secure transfer enforces HTTPS — neither aids recovery.",
    difficulty: 1,
    reference: { label: "Data protection for Blob Storage", url: `${docs}/azure/storage/blobs/data-protection-overview` },
  },

  // ---------------------------------------------------------------- defender
  {
    id: "az500-q10",
    domainId: "defender",
    type: "single",
    prompt:
      "You must prevent any new storage account in a subscription from being created with public blob access enabled, and the control must block the deployment rather than just report it. What should you use?",
    options: [
      { id: "a", text: "An Azure Policy assignment with the Deny effect" },
      { id: "b", text: "An Azure Policy assignment with the Audit effect" },
      { id: "c", text: "A Microsoft Defender for Cloud recommendation" },
      { id: "d", text: "A read-only resource lock on the subscription" },
    ],
    correct: ["a"],
    explanation:
      "Only the Deny effect stops a non-compliant resource from being created. Audit records compliance state without blocking, Defender for Cloud recommendations are advisory, and a read-only lock would block all deployments rather than just non-compliant ones.",
    difficulty: 1,
    reference: { label: "Azure Policy effects", url: `${docs}/azure/governance/policy/concepts/effect-basics` },
  },
  {
    id: "az500-q11",
    domainId: "defender",
    type: "single",
    prompt:
      "A key vault holds keys used to encrypt production data. You must ensure a deleted key can be recovered and that neither an administrator nor an attacker can permanently remove it during the retention period. What should you enable?",
    options: [
      { id: "a", text: "Soft delete only" },
      { id: "b", text: "Soft delete and purge protection" },
      { id: "c", text: "Automatic key rotation" },
      { id: "d", text: "A private endpoint for the key vault" },
    ],
    correct: ["b"],
    explanation:
      "Soft delete puts deleted objects into a recoverable state, but a user with purge rights can still remove them immediately. Purge protection blocks that purge until the retention period expires, so both settings together satisfy the requirement. Key rotation and private endpoints address credential freshness and network exposure, not deletion.",
    difficulty: 2,
    reference: { label: "Key Vault soft-delete and purge protection", url: `${docs}/azure/key-vault/general/soft-delete-overview` },
  },
  {
    id: "az500-q12",
    domainId: "defender",
    type: "multi",
    prompt:
      "You want Microsoft Sentinel to automatically assign an incident to a specific analyst and change its severity whenever a particular analytics rule fires. Which two Sentinel features can accomplish this? (Choose two.)",
    options: [
      { id: "a", text: "An automation rule triggered on incident creation" },
      { id: "b", text: "A playbook based on a Logic App with the incident trigger" },
      { id: "c", text: "A workbook with a scheduled refresh" },
      { id: "d", text: "A data connector with a custom log table" },
    ],
    correct: ["a", "b"],
    explanation:
      "Automation rules run on incident creation or update and can set owner, severity, and status without any external service. Playbooks are Logic Apps that can perform the same changes and more, and are typically invoked by an automation rule. Workbooks only visualize data, and data connectors only ingest it.",
    difficulty: 2,
    reference: { label: "Automate incident handling", url: `${docs}/azure/sentinel/automate-incident-handling-with-automation-rules` },
  },
  {
    id: "az500-q43",
    domainId: "defender",
    type: "single",
    prompt:
      "Existing virtual machines were deployed without the required monitoring agent. You want Azure Policy to install it on non-compliant machines automatically, including those already deployed. Which effect and follow-up action are required?",
    options: [
      { id: "a", text: "DeployIfNotExists, followed by creating a remediation task for existing resources" },
      { id: "b", text: "Deny, followed by redeploying the machines" },
      { id: "c", text: "Audit, followed by manual installation" },
      { id: "d", text: "Modify, which applies retroactively without further action" },
    ],
    correct: ["a"],
    explanation:
      "DeployIfNotExists runs an ARM deployment when a resource is non-compliant, but it only triggers on create or update, so existing resources need a remediation task to be brought into line. The policy assignment also needs a managed identity with rights to perform the deployment.",
    difficulty: 3,
    reference: { label: "Remediate non-compliant resources", url: `${docs}/azure/governance/policy/how-to/remediate-resources` },
  },
  {
    id: "az500-q44",
    domainId: "defender",
    type: "single",
    prompt:
      "How is the Microsoft Defender for Cloud secure score calculated?",
    options: [
      { id: "a", text: "Each security control awards points only when every recommendation in that control is satisfied for a resource, weighted by the control's max score" },
      { id: "b", text: "Each individual recommendation contributes equally, regardless of grouping" },
      { id: "c", text: "It is the percentage of resources with any Defender plan enabled" },
      { id: "d", text: "It is the count of open high-severity alerts subtracted from 100" },
    ],
    correct: ["a"],
    explanation:
      "Recommendations are grouped into security controls, and a resource only earns that control's points when it satisfies all recommendations in the group. The overall score is the sum of achieved points across controls divided by the maximum available. Alerts do not affect secure score.",
    difficulty: 2,
    reference: { label: "Secure score", url: `${docs}/azure/defender-for-cloud/secure-score-security-controls` },
  },
  {
    id: "az500-q45",
    domainId: "defender",
    type: "single",
    prompt:
      "Your organization must track compliance against an internal security standard that is not one of the built-in regulatory standards in Microsoft Defender for Cloud. What should you do?",
    options: [
      { id: "a", text: "Create a custom standard in Defender for Cloud built from an Azure Policy initiative containing your controls" },
      { id: "b", text: "Ask Microsoft to add the standard to the built-in list" },
      { id: "c", text: "Export the regulatory compliance dashboard and track it in a spreadsheet" },
      { id: "d", text: "Use secure score as a proxy for the internal standard" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Cloud lets you add custom compliance standards backed by an Azure Policy initiative, so your own controls appear in the regulatory compliance dashboard alongside built-in standards such as the Microsoft cloud security benchmark.",
    difficulty: 2,
    reference: { label: "Custom security standards", url: `${docs}/azure/defender-for-cloud/custom-security-policies` },
  },
  {
    id: "az500-q46",
    domainId: "defender",
    type: "single",
    prompt:
      "You must assess Azure virtual machines for software vulnerabilities without deploying or maintaining an agent on each machine. Which Defender for Servers capability provides this?",
    options: [
      { id: "a", text: "Agentless scanning for machines, which uses disk snapshots to inspect the VM out of band" },
      { id: "b", text: "The Log Analytics agent with the vulnerability assessment extension" },
      { id: "c", text: "Just-in-time VM access" },
      { id: "d", text: "Adaptive application controls" },
    ],
    correct: ["a"],
    explanation:
      "Agentless scanning takes a snapshot of the VM disk and analyses it in the Defender backend, so software inventory, vulnerabilities, and secrets can be assessed without installing anything in the guest. The other options either require agents or address different controls entirely.",
    difficulty: 2,
    reference: { label: "Agentless machine scanning", url: `${docs}/azure/defender-for-cloud/concept-agentless-data-collection` },
  },
  {
    id: "az500-q47",
    domainId: "defender",
    type: "single",
    prompt:
      "You need Microsoft Defender for Cloud to assess resources in an Amazon Web Services account. What must you configure?",
    options: [
      { id: "a", text: "A multicloud connector for AWS in Defender for Cloud, which uses a role in the AWS account to collect configuration data" },
      { id: "b", text: "An ExpressRoute circuit to the AWS account" },
      { id: "c", text: "Azure Arc on every EC2 instance, which is the only supported method" },
      { id: "d", text: "A Sentinel data connector for AWS CloudTrail" },
    ],
    correct: ["a"],
    explanation:
      "The AWS connector establishes a trust relationship so Defender for Cloud can read configuration and generate recommendations and secure score for AWS resources. Azure Arc is used to extend server-level protections onto EC2 machines but is not what enables the connection, and the Sentinel CloudTrail connector serves SIEM ingestion instead.",
    difficulty: 2,
    reference: { label: "Connect your AWS account", url: `${docs}/azure/defender-for-cloud/quickstart-onboard-aws` },
  },
  {
    id: "az500-q48",
    domainId: "defender",
    type: "single",
    prompt:
      "You want Defender for Cloud to notify a Microsoft Teams channel and open a ticket whenever a high-severity alert is raised. Which feature should you configure?",
    options: [
      { id: "a", text: "Workflow automation, which triggers a Logic App on alert or recommendation events" },
      { id: "b", text: "Continuous export to a Log Analytics workspace" },
      { id: "c", text: "An Azure Policy assignment with the AuditIfNotExists effect" },
      { id: "d", text: "An Azure Monitor metric alert" },
    ],
    correct: ["a"],
    explanation:
      "Workflow automation in Defender for Cloud invokes a Logic App when alerts or recommendations match your conditions, and the Logic App can post to Teams, create tickets, or call any connector. Continuous export moves data for analysis but takes no action.",
    difficulty: 2,
    reference: { label: "Workflow automation", url: `${docs}/azure/defender-for-cloud/workflow-automation` },
  },
  {
    id: "az500-q49",
    domainId: "defender",
    type: "single",
    prompt:
      "Which Key Vault permission model should you choose to manage access with the same role assignment tooling, PIM, and conditional access used for other Azure resources?",
    options: [
      { id: "a", text: "Azure role-based access control (RBAC) for the data plane" },
      { id: "b", text: "Vault access policies" },
      { id: "c", text: "Shared access signatures" },
      { id: "d", text: "Managed HSM local RBAC only" },
    ],
    correct: ["a"],
    explanation:
      "The Azure RBAC permission model brings Key Vault data-plane access under standard role assignments, so it inherits scope inheritance, PIM eligibility, and access reviews. Vault access policies are a separate legacy list managed only on the vault itself.",
    difficulty: 2,
    reference: { label: "Key Vault RBAC guide", url: `${docs}/azure/key-vault/general/rbac-guide` },
  },
  {
    id: "az500-q50",
    domainId: "defender",
    type: "single",
    prompt:
      "Company policy requires encryption keys in Azure Key Vault to be replaced every 12 months with no manual intervention. What should you configure?",
    options: [
      { id: "a", text: "A key rotation policy on the key, specifying a rotation time based on key creation or expiry" },
      { id: "b", text: "An Azure Automation runbook that deletes and recreates the key" },
      { id: "c", text: "Purge protection with a 12-month retention period" },
      { id: "d", text: "A managed identity with the Key Vault Crypto Officer role" },
    ],
    correct: ["a"],
    explanation:
      "Key Vault supports a native rotation policy that generates a new key version automatically at the configured interval, with optional near-expiry event notifications. Deleting and recreating keys with a runbook would break anything referencing the prior version, and purge protection concerns deletion rather than rotation.",
    difficulty: 2,
    reference: { label: "Configure key auto-rotation", url: `${docs}/azure/key-vault/keys/how-to-configure-key-rotation` },
  },
  {
    id: "az500-q51",
    domainId: "defender",
    type: "single",
    prompt:
      "Which Microsoft Sentinel role allows a user to create and edit analytics rules, workbooks, and playbooks, but not to grant permissions to other users?",
    options: [
      { id: "a", text: "Microsoft Sentinel Contributor" },
      { id: "b", text: "Microsoft Sentinel Reader" },
      { id: "c", text: "Microsoft Sentinel Responder" },
      { id: "d", text: "Owner on the resource group" },
    ],
    correct: ["a"],
    explanation:
      "Microsoft Sentinel Contributor can create and edit workspace content such as analytics rules and workbooks. Reader can only view, Responder can additionally manage incidents but not author rules, and Owner would also allow granting access to others.",
    difficulty: 2,
    reference: { label: "Roles and permissions in Microsoft Sentinel", url: `${docs}/azure/sentinel/roles` },
  },
  {
    id: "az500-q52",
    domainId: "defender",
    type: "single",
    prompt:
      "You must control exactly which Windows security event IDs are collected from Azure VMs into a Log Analytics workspace using the Azure Monitor Agent. What defines that scope?",
    options: [
      { id: "a", text: "A data collection rule (DCR) associated with the target machines" },
      { id: "b", text: "The workspace's pricing tier" },
      { id: "c", text: "A Sentinel analytics rule" },
      { id: "d", text: "A diagnostic setting on the virtual machine resource" },
    ],
    correct: ["a"],
    explanation:
      "Data collection rules define what the Azure Monitor Agent collects — including XPath filters for specific Windows event IDs — and which destinations receive it. Diagnostic settings cover platform logs for Azure resources rather than in-guest event logs.",
    difficulty: 2,
    reference: { label: "Data collection rules", url: `${docs}/azure/azure-monitor/essentials/data-collection-rule-overview` },
  },
  {
    id: "az500-q53",
    domainId: "defender",
    type: "single",
    prompt:
      "Which Defender for Cloud plan scans blobs uploaded to a storage account for malware and detects suspicious access patterns?",
    options: [
      { id: "a", text: "Microsoft Defender for Storage" },
      { id: "b", text: "Microsoft Defender for Servers" },
      { id: "c", text: "Microsoft Defender for Key Vault" },
      { id: "d", text: "Microsoft Defender for Resource Manager" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Storage provides on-upload malware scanning, sensitive data threat detection, and alerts for anomalous access such as data exfiltration patterns. The other plans protect virtual machines, key vaults, and control-plane operations respectively.",
    difficulty: 1,
    reference: { label: "Overview of Defender for Storage", url: `${docs}/azure/defender-for-cloud/defender-for-storage-introduction` },
  },
  {
    id: "az500-q54",
    domainId: "defender",
    type: "single",
    prompt:
      "You must detect secrets and misconfigurations in application source code held in GitHub and Azure DevOps repositories, surfaced in Defender for Cloud. What should you configure?",
    options: [
      { id: "a", text: "A DevOps security connector for GitHub or Azure DevOps" },
      { id: "b", text: "Defender for Containers on the build agents" },
      { id: "c", text: "A Sentinel data connector for GitHub audit logs" },
      { id: "d", text: "Azure Policy assigned to the repository resource group" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Cloud DevOps security connects to GitHub, Azure DevOps, and GitLab to surface code, secret, dependency, and infrastructure-as-code findings alongside your cloud posture. The Sentinel connector ingests audit logs for detection rather than performing code scanning.",
    difficulty: 2,
    reference: { label: "DevOps security overview", url: `${docs}/azure/defender-for-cloud/defender-for-devops-introduction` },
  },
  {
    id: "az500-q55",
    domainId: "defender",
    type: "single",
    prompt:
      "A ransomware scenario requires that backups in a Recovery Services vault cannot be deleted by a compromised administrator account without an additional control. Which feature addresses this?",
    options: [
      { id: "a", text: "Multi-user authorization using a Resource Guard" },
      { id: "b", text: "Soft delete alone, which is enabled by default" },
      { id: "c", text: "Geo-redundant storage replication" },
      { id: "d", text: "A read-only lock on the recovery points" },
    ],
    correct: ["a"],
    explanation:
      "Multi-user authorization places critical vault operations behind a Resource Guard in a separate subscription or tenant, so a single compromised administrator cannot disable protection or delete backups. Soft delete provides a recovery window but is itself an operation an attacker may target, and replication protects against outages rather than malicious deletion.",
    difficulty: 3,
    reference: { label: "Multi-user authorization for Backup", url: `${docs}/azure/backup/multi-user-authorization` },
  },
  {
    id: "az500-q56",
    domainId: "defender",
    type: "single",
    prompt:
      "You need to enrich Microsoft Sentinel incidents with a curated list of high-value asset IP addresses that analysts maintain themselves. Which feature should you use?",
    options: [
      { id: "a", text: "A watchlist" },
      { id: "b", text: "A workbook" },
      { id: "c", text: "A hunting bookmark" },
      { id: "d", text: "A threat intelligence indicator feed" },
    ],
    correct: ["a"],
    explanation:
      "Watchlists let you import and maintain reference datasets such as VIP users, high-value assets, or approved IP ranges, and join them into analytics and hunting queries. Threat intelligence indicators are for external IOC feeds, and bookmarks preserve findings during a hunt.",
    difficulty: 2,
    reference: { label: "Watchlists in Microsoft Sentinel", url: `${docs}/azure/sentinel/watchlists` },
  },
  {
    id: "az500-q57",
    domainId: "defender",
    type: "single",
    prompt:
      "Which Microsoft Sentinel analytics rule type uses machine learning to correlate low-fidelity signals across multiple products into a single high-confidence multistage attack incident?",
    options: [
      { id: "a", text: "Fusion" },
      { id: "b", text: "Scheduled" },
      { id: "c", text: "Microsoft security" },
      { id: "d", text: "Threat intelligence" },
    ],
    correct: ["a"],
    explanation:
      "Fusion correlates anomalies and alerts across data sources using machine learning to surface multistage attacks that individual rules would miss. Microsoft security rules simply promote alerts from other Microsoft products into Sentinel incidents, and threat intelligence rules match indicators against your data.",
    difficulty: 2,
    reference: { label: "Advanced multistage attack detection", url: `${docs}/azure/sentinel/fusion` },
  },
  {
    id: "az500-q58",
    domainId: "defender",
    type: "single",
    prompt:
      "Microsoft Defender External Attack Surface Management (EASM) is best described as a tool that:",
    options: [
      { id: "a", text: "Discovers internet-facing assets belonging to your organization, including ones you did not know about, and reports their exposures" },
      { id: "b", text: "Scans internal virtual machines for missing operating system patches" },
      { id: "c", text: "Blocks outbound connections to malicious domains" },
      { id: "d", text: "Encrypts data at rest across storage accounts" },
    ],
    correct: ["a"],
    explanation:
      "EASM continuously discovers the external attack surface from an attacker's perspective — domains, hosts, IP blocks, and certificates linked to your organization — and surfaces shadow IT and exposed services. Patch assessment belongs to Defender Vulnerability Management.",
    difficulty: 2,
    reference: { label: "Defender EASM overview", url: `${docs}/azure/external-attack-surface-management/` },
  },
  {
    id: "az500-q59",
    domainId: "defender",
    type: "single",
    prompt:
      "You want a single Azure Policy assignment to apply an entire group of related security controls to a subscription. What should you assign?",
    options: [
      { id: "a", text: "A policy initiative (policy set definition)" },
      { id: "b", text: "Several individual policy definitions, one at a time" },
      { id: "c", text: "A management group" },
      { id: "d", text: "An Azure Blueprint artifact only" },
    ],
    correct: ["a"],
    explanation:
      "An initiative bundles many policy definitions so they can be assigned and reported on as one unit — the Microsoft cloud security benchmark is itself an initiative. Management groups are a scope, not a grouping of policies.",
    difficulty: 1,
    reference: { label: "Azure Policy initiatives", url: `${docs}/azure/governance/policy/concepts/initiative-definition-structure` },
  },
  {
    id: "az500-q60",
    domainId: "defender",
    type: "multi",
    prompt:
      "Which two actions reduce the blast radius if a Microsoft Sentinel workspace is compromised? (Choose two.)",
    options: [
      { id: "a", text: "Assign Sentinel roles at the resource group scope following least privilege rather than granting subscription Owner" },
      { id: "b", text: "Use table-level RBAC to restrict which analysts can read sensitive tables" },
      { id: "c", text: "Enable all data connectors so nothing is missed" },
      { id: "d", text: "Disable diagnostic logging on the workspace to reduce noise" },
    ],
    correct: ["a", "b"],
    explanation:
      "Scoped least-privilege role assignments and table-level RBAC both limit what a compromised account can reach. Enabling every connector increases data volume and cost without limiting blast radius, and disabling diagnostic logging destroys the audit trail you would need to investigate.",
    difficulty: 3,
    reference: { label: "Roles and permissions in Microsoft Sentinel", url: `${docs}/azure/sentinel/roles` },
  },
];
