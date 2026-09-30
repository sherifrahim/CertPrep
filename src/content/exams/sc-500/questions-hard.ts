import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/**
 * Harder, exam-style SC-500 questions: networking and identity traps where the
 * intuitive answer is wrong, hard limits, and multi-requirement scenarios, in the
 * single, multi, Yes/No, ordering and "same goal, different solution" formats.
 * Behaviour was checked on Microsoft Learn.
 */
export const sc500HardQuestions: Question[] = [
  // ------------------------------------------------------ network traps
  {
    id: "sc500-h1",
    domainId: "data-network",
    type: "single",
    prompt:
      "A network security group on a web subnet has these inbound rules: priority 100 allows TCP 443 from the Internet service tag, and priority 200 denies TCP 443 from 185.220.101.0/24. A client at 185.220.101.7 connects to a web server on port 443. What happens?",
    options: [
      { id: "a", text: "The connection is denied, because the deny rule is more specific than the allow rule" },
      { id: "b", text: "The connection is allowed, because rule 100 matches first and processing then stops" },
      { id: "c", text: "The connection is denied, because a deny rule always overrides an allow rule" },
      { id: "d", text: "The connection is allowed only if the default DenyAllInbound rule is removed first" },
    ],
    correct: ["b"],
    explanation:
      "NSG rules are processed in priority order, lowest number first, and once traffic matches a rule processing stops. The client's address is part of the Internet service tag, so rule 100 allows it before rule 200 is reached. To block that range, its deny rule needs a lower priority number than the allow.",
    difficulty: 3,
    reference: { label: "Network security group security rules", url: `${docs}/azure/virtual-network/network-security-groups-overview` },
  },
  {
    id: "sc500-h2",
    domainId: "data-network",
    type: "single",
    prompt:
      "You create application security group AsgWeb containing network interfaces from VNet1, and AsgDb containing network interfaces from VNet2. You try to write an NSG rule with AsgWeb as the source and AsgDb as the destination, and it cannot be created. Why?",
    options: [
      { id: "a", text: "Application security groups can only be used as a destination and never as a source" },
      { id: "b", text: "Both groups' interfaces must be in the same virtual network for that rule to be valid" },
      { id: "c", text: "Network interfaces can belong to only one application security group at a time" },
      { id: "d", text: "An NSG rule can reference an application security group only from the same subscription" },
    ],
    correct: ["b"],
    explanation:
      "All network interfaces in an application security group must be in the same virtual network as the first interface assigned to it, and when ASGs are used as both source and destination their interfaces must be in the same virtual network. Here the two groups span different networks, so the rule is impossible.",
    difficulty: 3,
    reference: { label: "Application security groups", url: `${docs}/azure/virtual-network/application-security-groups` },
  },
  {
    id: "sc500-h3",
    domainId: "data-network",
    type: "single",
    prompt:
      "Two subnets in the same virtual network must not be able to talk to each other on any port. The default AllowVNetInBound rule currently allows it. Which change blocks the traffic?",
    options: [
      { id: "a", text: "Delete the AllowVNetInBound default rule from the network security group" },
      { id: "b", text: "Create a deny rule for the other subnet with a priority number between 100 and 4096" },
      { id: "c", text: "Create a deny rule for the other subnet with priority 65500 so that it overrides the default rule" },
      { id: "d", text: "Add a service tag for the virtual network to the existing default allow rule" },
    ],
    correct: ["b"],
    explanation:
      "AllowVNetInBound allows all communication between resources in the same virtual network, so an explicit deny rule is needed. Custom rules use priorities from 100 to 4096, and a lower number wins, so a custom deny is evaluated before the default rules. Default rules can't be deleted, and 65500 isn't a valid custom priority.",
    difficulty: 3,
    reference: { label: "Network security group security rules", url: `${docs}/azure/virtual-network/network-security-groups-overview` },
  },
  {
    id: "sc500-h4",
    domainId: "data-network",
    type: "single",
    prompt:
      "An Azure Firewall policy has an application rule collection at priority 50 that allows *.contoso.com, and a network rule collection at priority 100 that denies TCP 443 to 10.0.0.0/8. A client requests https://app.contoso.com, which resolves to 10.1.1.4. What happens?",
    options: [
      { id: "a", text: "The request is allowed, because the application rule has the higher priority" },
      { id: "b", text: "The request is denied, because network rules are processed before application rules" },
      { id: "c", text: "The request is allowed, because FQDN matches always override any IP-based rule" },
      { id: "d", text: "The request is denied, because DNAT rules are processed after application rules" },
    ],
    correct: ["b"],
    explanation:
      "Azure Firewall always processes DNAT rules, then network rules, then application rules, regardless of rule collection group or collection priority. The network rule matches TCP 443 to 10.1.1.4 and denies the traffic, and rule processing terminates on a match, so the application rule is never evaluated.",
    difficulty: 3,
    reference: { label: "Azure Firewall rule processing logic", url: `${docs}/azure/firewall/rule-processing` },
  },
  {
    id: "sc500-h5",
    domainId: "data-network",
    type: "single",
    prompt:
      "A child Azure Firewall policy inherits from a parent policy managed by the central security team. The child has a rule collection group with priority 100, and the parent has one with priority 500. Which group is processed first?",
    options: [
      { id: "a", text: "The child's group, because 100 is a higher priority than 500" },
      { id: "b", text: "The parent's group, because inherited groups always take precedence over the child's" },
      { id: "c", text: "Whichever group has fewer rules, because smaller groups are evaluated first" },
      { id: "d", text: "Both are merged into one group and ordered by the rule names alphabetically" },
    ],
    correct: ["b"],
    explanation:
      "If a policy inherits from a parent, the rule collection groups in the parent always take precedence, regardless of the priority number of the child policy's groups. This lets a central team enforce baseline rules that child policies cannot override.",
    difficulty: 3,
    reference: { label: "Azure Firewall rule processing logic", url: `${docs}/azure/firewall/rule-processing` },
  },
  {
    id: "sc500-h6",
    domainId: "data-network",
    type: "single",
    prompt:
      "Threat intelligence-based filtering is enabled on an Azure Firewall with its default settings, and a test shows a VM can still reach an address on Microsoft's malicious list. What explains this?",
    options: [
      { id: "a", text: "The default mode is alert only, so the traffic is logged but not blocked" },
      { id: "b", text: "Threat intelligence filtering applies only to inbound traffic and ignores outbound" },
      { id: "c", text: "The Microsoft feed covers only IP addresses and never FQDNs or URLs" },
      { id: "d", text: "The firewall needs the Premium SKU before it can deny any threat traffic" },
    ],
    correct: ["a"],
    explanation:
      "By default the firewall operates in alert-only mode when a threat intelligence rule is triggered. It can be changed to alert and deny mode, and allowlists can exempt specific addresses. The feed covers IP addresses, FQDNs and URLs, in both directions.",
    difficulty: 3,
    reference: { label: "Azure Firewall threat intelligence-based filtering", url: `${docs}/azure/firewall/threat-intel` },
  },
  {
    id: "sc500-h7",
    domainId: "data-network",
    type: "single",
    prompt:
      "Servers in your datacenter connect to Azure through ExpressRoute and must reach a storage account privately, without going over the internet. You have a service endpoint for Microsoft.Storage on a virtual network subnet. Will the datacenter servers use it?",
    options: [
      { id: "a", text: "Yes, because service endpoints extend to any network that connects to the virtual network" },
      { id: "b", text: "Yes, but only if the on-premises route table has an entry for the storage service tag" },
      { id: "c", text: "No, because service endpoints can't be used for traffic from on-premises, and a private endpoint is needed" },
      { id: "d", text: "No, because service endpoints work only for storage accounts in a different region" },
    ],
    correct: ["c"],
    explanation:
      "Service endpoints are enabled on subnets and can't be used for traffic that originates from on-premises services. A private endpoint gives the storage account a private IP address in your virtual network that on-premises clients can reach over VPN or ExpressRoute.",
    difficulty: 3,
    reference: { label: "Virtual network service endpoints", url: `${docs}/azure/virtual-network/virtual-network-service-endpoints-overview` },
  },
  {
    id: "sc500-h8",
    domainId: "data-network",
    type: "statements",
    scenario: "You are deploying Azure Bastion for administrators in several virtual networks.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Every SKU except Bastion Developer needs a dedicated subnet named AzureBastionSubnet in the virtual network.", correct: true },
      { id: "b", text: "A /26 or larger subnet is recommended so that host scaling is not limited.", correct: true },
      { id: "c", text: "The Shareable Link feature is available on the Basic SKU.", correct: false },
      { id: "d", text: "The public IP address for the deployment can use the Basic SKU.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "Bastion needs the AzureBastionSubnet in the same virtual network, and a /26 or larger allows more scale units. Deployments other than Developer and Private-only need a Standard SKU public IP address, and Shareable Link, like custom ports, requires the Standard SKU or higher.",
    difficulty: 3,
    reference: { label: "Azure Bastion configuration settings", url: `${docs}/azure/bastion/configuration-settings` },
  },

  // ------------------------------------------------ compute and identity
  {
    id: "sc500-h9",
    domainId: "compute",
    type: "single",
    prompt:
      "A new virtual machine must have its temporary disk and disk caches encrypted at rest, and the data must flow encrypted to storage. You are choosing an approach for new deployments. What does Microsoft recommend?",
    options: [
      { id: "a", text: "Azure Disk Encryption, which is the preferred option for new VMs and has no planned retirement" },
      { id: "b", text: "Server-side encryption alone, because it already covers temporary disks and caches" },
      { id: "c", text: "Encryption at host, which encrypts temp disks and caches and is recommended for new VMs" },
      { id: "d", text: "A customer-managed key on the OS disk only, with the caches left in plain text" },
    ],
    correct: ["c"],
    explanation:
      "Encryption at host enhances server-side encryption so that temporary disks and disk caches are encrypted at rest and flow encrypted to storage. Azure Disk Encryption is scheduled for retirement on September 15, 2028, and Microsoft recommends encryption at host for new VMs.",
    difficulty: 3,
    reference: { label: "Overview of managed disk encryption options", url: `${docs}/azure/virtual-machines/disk-encryption-overview` },
  },
  {
    id: "sc500-h10",
    domainId: "identity",
    type: "single",
    prompt:
      "Twenty virtual machines deployed by a template must all read the same key vault, and role assignments are made by a separate identity team. Deployments sometimes fail because the role assignment cannot exist before the VM. Which design fixes this and reduces administration?",
    options: [
      { id: "a", text: "Give each VM a system-assigned identity and assign roles to each one after each VM has been created and started" },
      { id: "b", text: "Create one user-assigned managed identity, grant it the role in advance, and attach it to every VM" },
      { id: "c", text: "Store a service principal secret in each VM's environment variables and rotate it every month" },
      { id: "d", text: "Give the deployment pipeline's identity access to the vault and let the VMs call the pipeline" },
    ],
    correct: ["b"],
    explanation:
      "System-assigned identities are created and deleted with the resource, so role assignments can't be created in advance. A user-assigned identity has a life cycle separate from the resources, can be granted roles beforehand, and one identity attached to many VMs means fewer identities and assignments to manage.",
    difficulty: 3,
    reference: { label: "Managed identity best practice recommendations", url: `${docs}/entra/identity/managed-identities-azure-resources/managed-identity-best-practice-recommendations` },
  },
  {
    id: "sc500-h11",
    domainId: "identity",
    type: "single",
    prompt:
      "A policy says privileged role activations in Privileged Identity Management must last a full 48 hours so that engineers can finish long maintenance windows. Which statement is correct?",
    options: [
      { id: "a", text: "Set the activation maximum duration to 48 hours in the role settings" },
      { id: "b", text: "The activation maximum duration can only be set between 1 and 24 hours" },
      { id: "c", text: "Activations are unlimited unless approval is required for the role" },
      { id: "d", text: "The limit is 72 hours, but only for roles assigned at the subscription scope" },
    ],
    correct: ["b"],
    explanation:
      "The activation maximum duration setting can be from 1 to 24 hours, so a 48-hour activation cannot be configured. Engineers would need to re-activate, or the requirement needs to change.",
    difficulty: 2,
    reference: { label: "Configure Azure resource role settings in PIM", url: `${docs}/entra/id-governance/privileged-identity-management/pim-resource-roles-configure-role-settings` },
  },
  {
    id: "sc500-h12",
    domainId: "identity",
    type: "single",
    prompt:
      "Before enforcing a new Conditional Access policy that blocks legacy authentication for all users, you want to see which sign-ins it would affect without denying anyone access. What should you do?",
    options: [
      { id: "a", text: "Set the policy to report-only and review the results in the sign-in logs" },
      { id: "b", text: "Assign it to a single test user and enforce it for everyone the next day" },
      { id: "c", text: "Enable it, then use the What If tool to reverse any blocks that happen" },
      { id: "d", text: "Deploy it as a Microsoft Entra ID Protection sign-in risk policy instead" },
    ],
    correct: ["a"],
    explanation:
      "Report-only mode evaluates policies during sign-in without enforcing them and logs the results in the Conditional Access and Report-only tabs of the sign-in log details. It's the recommended way to test the impact of most policies before turning them on.",
    difficulty: 2,
    reference: { label: "Conditional Access report-only mode", url: `${docs}/entra/identity/conditional-access/concept-conditional-access-report-only` },
  },
  {
    id: "sc500-h13",
    domainId: "identity",
    type: "single",
    prompt:
      "Administrators must use phishing-resistant sign-in methods to reach the Azure portal. A policy requiring multifactor authentication already exists, but SMS codes still satisfy it. What should you configure?",
    options: [
      { id: "a", text: "A Conditional Access policy that requires the built-in Phishing-resistant MFA authentication strength" },
      { id: "b", text: "The Require multifactor authentication grant control with number matching switched on for all administrators" },
      { id: "c", text: "The built-in Passwordless MFA strength, which excludes every non-passwordless method" },
      { id: "d", text: "A sign-in frequency session control that forces administrators to authenticate hourly" },
    ],
    correct: ["a"],
    explanation:
      "The Require multifactor authentication control accepts the same combinations as the MFA strength, which include weaker methods. The built-in Phishing-resistant MFA strength allows only methods such as Windows Hello for Business, platform credentials and FIDO2 security keys. Passwordless MFA is a different, broader built-in strength.",
    difficulty: 3,
    reference: { label: "Conditional Access authentication strengths", url: `${docs}/entra/identity/authentication/concept-authentication-strengths` },
  },
  {
    id: "sc500-h14",
    domainId: "identity",
    type: "statements",
    scenario: "You are reviewing how Azure Policy exemptions and effects behave in a landing zone.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "A policy exemption can use the waiver or the mitigated category.", correct: true },
      { id: "b", text: "An exempt resource counts toward overall compliance but is not evaluated by the exempted policy.", correct: true },
      { id: "c", text: "A policy exemption can exempt a single definition inside an initiative rather than the whole initiative.", correct: true },
      { id: "d", text: "The Deny effect brings existing non-compliant resources into compliance automatically.", correct: false },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "Exemptions can target a resource hierarchy or an individual resource, can be limited to specific definitions within an initiative, and use the waiver or mitigated category. Deny only blocks new or updated non-compliant resources; existing ones need remediation through a modify or deployIfNotExists effect.",
    difficulty: 3,
    reference: { label: "Azure Policy exemption structure", url: `${docs}/azure/governance/policy/concepts/exemption-structure` },
  },
  {
    id: "sc500-h15",
    domainId: "data-network",
    type: "single",
    prompt:
      "A privacy team wants analysts to see only the last four digits of a card number column in Azure SQL Database query results. The database owner must still see full values. Which feature fits, and what should you know about it?",
    options: [
      { id: "a", text: "Dynamic data masking, which masks for nonprivileged users while administrators see unmasked data" },
      { id: "b", text: "Transparent data encryption, which hides values in query results from analysts" },
      { id: "c", text: "Dynamic data masking, which encrypts the column so that even administrators only ever see masked values" },
      { id: "d", text: "Auditing, which redacts sensitive columns before results are returned to callers" },
    ],
    correct: ["a"],
    explanation:
      "Dynamic data masking limits sensitive data exposure by masking it for nonprivileged users, while users with administrative rights, and any users explicitly excluded or granted UNMASK, see the real values. It doesn't encrypt the data, and transparent data encryption protects data at rest, not query results.",
    difficulty: 3,
    reference: { label: "Dynamic data masking", url: `${docs}/azure/azure-sql/database/dynamic-data-masking-overview` },
  },

  // ------------------------------------------------ ordering and series
  {
    id: "sc500-h16",
    domainId: "data-network",
    type: "ordering",
    prompt:
      "A storage account must be reachable only through a private endpoint. Arrange the steps so that no client is cut off during the change.",
    steps: [
      { id: "a", text: "Create the private endpoint in the application virtual network and approve the connection" },
      { id: "b", text: "Create a private DNS zone for the blob service and link it to the virtual network" },
      { id: "c", text: "Verify that the storage account name resolves to the private IP address" },
      { id: "d", text: "Disable public network access on the storage account" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The private path and its name resolution must exist and be verified before public access is switched off, otherwise clients lose connectivity. Only an approved private endpoint can carry traffic, and the DNS zone makes the account name resolve to its private address.",
    difficulty: 3,
    reference: { label: "Azure Private Endpoint DNS configuration", url: `${docs}/azure/private-link/private-endpoint-dns` },
  },
  {
    id: "sc500-h17",
    domainId: "identity",
    type: "meets-goal",
    scenario:
      "Policy states that Azure resources may only be created in West Europe and North Europe, in every subscription of the tenant. Engineers keep the Contributor role. Existing resources elsewhere may remain.",
    prompt:
      "Solution: You assign the built-in Allowed locations policy with the Deny effect at the tenant root management group.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "Azure Policy evaluates create and update requests, and the Deny effect blocks resources in other regions. Assigning at the root management group covers every subscription, and existing resources are simply reported as non-compliant rather than removed.",
    difficulty: 2,
    reference: { label: "Azure Policy definition effects", url: `${docs}/azure/governance/policy/concepts/effects` },
  },
  {
    id: "sc500-h18",
    domainId: "identity",
    type: "meets-goal",
    scenario:
      "Policy states that Azure resources may only be created in West Europe and North Europe, in every subscription of the tenant. Engineers keep the Contributor role. Existing resources elsewhere may remain.",
    prompt:
      "Solution: You apply a CanNotDelete lock to every subscription.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "A CanNotDelete lock stops resources being deleted. It does nothing to control where resources are created, so engineers could still deploy to any region.",
    difficulty: 2,
    reference: { label: "Lock your resources to protect your infrastructure", url: `${docs}/azure/azure-resource-manager/management/lock-resources` },
  },
  {
    id: "sc500-h19",
    domainId: "identity",
    type: "meets-goal",
    scenario:
      "Policy states that Azure resources may only be created in West Europe and North Europe, in every subscription of the tenant. Engineers keep the Contributor role. Existing resources elsewhere may remain.",
    prompt:
      "Solution: You create a custom role for engineers whose NotActions exclude resource creation outside the two regions.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Azure RBAC actions aren't scoped by region, and NotActions is not a deny, so any other role assignment that grants the action still allows it. Engineers keep Contributor in this scenario, which would continue to permit creation anywhere.",
    difficulty: 3,
    reference: { label: "Azure custom roles", url: `${docs}/azure/role-based-access-control/custom-roles` },
  },
  {
    id: "sc500-h20",
    domainId: "data-network",
    type: "multi",
    prompt:
      "Which two statements about Azure Firewall rule processing are correct? (Choose two.)",
    options: [
      { id: "a", text: "DNAT rules are processed first, then network rules, then application rules" },
      { id: "b", text: "Application rules are processed before network rules when their collection has a lower priority number" },
      { id: "c", text: "Rule collection groups inherited from a parent policy always take precedence over the child's" },
      { id: "d", text: "A child policy can place its rule collection groups ahead of the parent's by using priority 100" },
    ],
    correct: ["a", "c"],
    explanation:
      "The firewall always processes DNAT rules, then network rules, then application rules, whatever the collection priority. Groups from a parent policy always come first, so a child cannot override them by using a lower priority number.",
    difficulty: 3,
    reference: { label: "Azure Firewall rule processing logic", url: `${docs}/azure/firewall/rule-processing` },
  },

  // --------------------------------------------------- long scenarios
  {
    id: "sc500-h21",
    domainId: "identity",
    type: "single",
    prompt:
      "Contoso's Azure DevOps pipelines run on Microsoft-hosted agents and read secrets from a key vault. The security team turns on the Key Vault firewall, selects Allow trusted Microsoft services to bypass this firewall, and denies public access otherwise. The next pipeline run fails with a network error. Requirements: keep the firewall on, avoid opening the vault to broad IP ranges, and avoid storing credentials in the pipeline. What should you do?",
    options: [
      { id: "a", text: "Nothing more, because Azure DevOps is on the trusted services list and the bypass covers it" },
      { id: "b", text: "Disable the firewall for the pipeline's run window and enable it again once the run completes" },
      { id: "c", text: "Run the pipeline on a self-hosted agent in a virtual network that reaches the vault privately" },
      { id: "d", text: "Add the Microsoft-hosted agents' entire regional IP ranges to the firewall's allowed list for the vault" },
    ],
    correct: ["c"],
    explanation:
      "The trusted services bypass doesn't cover every Azure service, and Azure DevOps isn't on the list, so the hosted agents remain blocked. A self-hosted agent placed in a virtual network with a service endpoint or private endpoint to the vault keeps the firewall enabled without broad IP allowances, and can authenticate with a managed identity or service connection instead of a stored secret.",
    difficulty: 3,
    reference: { label: "Configure Azure Key Vault networking settings", url: `${docs}/azure/key-vault/general/how-to-azure-key-vault-network-security` },
  },
  {
    id: "sc500-h22",
    domainId: "identity",
    type: "multi",
    prompt:
      "Woodgrove needs privileged administrators to hold access only when required. Requirements: (1) activations must require phishing-resistant authentication; (2) activations must expire automatically within the working day; (3) a Global Administrator must not be able to be activated without a written business reason. Which three settings should you configure? (Choose three.)",
    options: [
      { id: "a", text: "In the role settings, require a Conditional Access authentication context that enforces the Phishing-resistant MFA strength" },
      { id: "b", text: "In the role settings, set the activation maximum duration to a value between 1 and 24 hours" },
      { id: "c", text: "In the role settings, require justification on activation" },
      { id: "d", text: "In the role settings, set the activation maximum duration to 72 hours for all roles" },
      { id: "e", text: "Assign the role permanently and rely on a review each quarter to remove it" },
      { id: "f", text: "Require only the multifactor authentication check, since it accepts phishing-resistant methods too" },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "A Conditional Access authentication context with an authentication strength can require passwordless or phishing-resistant sign-in at activation, the activation maximum duration ranges from 1 to 24 hours so it can expire within the day, and justification can be required. 72 hours isn't possible, permanent assignment defeats the purpose, and plain MFA also accepts weaker methods.",
    difficulty: 3,
    reference: { label: "Configure Azure resource role settings in PIM", url: `${docs}/entra/id-governance/privileged-identity-management/pim-resource-roles-configure-role-settings` },
  },
  {
    id: "sc500-h23",
    domainId: "data-network",
    type: "single",
    prompt:
      "Fabrikam has a hub virtual network with Azure Firewall and two spokes. Requirements: (1) all internet-bound traffic from the spokes must be inspected by the hub firewall; (2) spoke administrators must not be able to loosen the central baseline rules; (3) a spoke team needs its own additional rules for its applications; (4) web rules must work by FQDN for HTTPS destinations. Which design meets all four?",
    options: [
      { id: "a", text: "A child firewall policy per team inheriting a central parent baseline policy, with default routes to the firewall" },
      { id: "b", text: "One firewall policy shared by all teams, with spoke administrators granted Contributor so they can add their rules" },
      { id: "c", text: "Network security groups on every spoke subnet only, with FQDN tags added to each NSG rule by the teams" },
      { id: "d", text: "A child firewall policy per team with baseline rules at priority 100, so the teams' rules are processed after the parent's" },
    ],
    correct: ["a"],
    explanation:
      "A parent policy holds the baseline and its rule collection groups always take precedence over child policies, so team administrators can add their own rules without overriding it. User-defined routes send spoke traffic to the firewall, and application rules match HTTPS destinations by FQDN. Sharing one policy or using NSGs can't protect the baseline, and a child can't win by using a low priority number.",
    difficulty: 3,
    reference: { label: "Azure Firewall rule processing logic", url: `${docs}/azure/firewall/rule-processing` },
  },
];
