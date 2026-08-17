import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

/**
 * Items in the formats Microsoft uses beyond plain multiple choice: repeated
 * scenarios answered Yes/No, hot-area statement grids, and ordered sequences.
 */
export const az500ScenarioQuestions: Question[] = [
  // ---- repeated scenario: storage account exfiltration -------------------
  {
    id: "az500-s1",
    domainId: "compute",
    type: "meets-goal",
    scenario:
      "Your company stores customer records in an Azure Storage account named stcustomers. Security requires that the storage account is reachable only from the virtual network vnet-prod, that requests cannot be authorised with the account access keys, and that deleted blobs remain recoverable for 30 days.\n\nYou need to meet all three requirements.",
    prompt:
      "Solution: You create a private endpoint for stcustomers in vnet-prod, set allowSharedKeyAccess to false, and enable blob soft delete with a 30-day retention period.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "All three requirements are addressed. The private endpoint gives the account a private IP in vnet-prod and lets you disable public network access, setting allowSharedKeyAccess to false forces every request through Microsoft Entra ID and Azure RBAC, and blob soft delete with 30-day retention makes deletions recoverable for the required window.",
    difficulty: 2,
    reference: { label: "Prevent shared key authorization", url: `${docs}/azure/storage/common/shared-key-authorization-prevent` },
  },
  {
    id: "az500-s2",
    domainId: "compute",
    type: "meets-goal",
    scenario:
      "Your company stores customer records in an Azure Storage account named stcustomers. Security requires that the storage account is reachable only from the virtual network vnet-prod, that requests cannot be authorised with the account access keys, and that deleted blobs remain recoverable for 30 days.\n\nYou need to meet all three requirements.",
    prompt:
      "Solution: You enable a service endpoint for Microsoft.Storage on the vnet-prod subnet, rotate the storage account access keys every 30 days, and enable blob versioning.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "This fails two requirements. Rotating access keys does not stop them being used to authorise requests — only setting allowSharedKeyAccess to false does that. Versioning preserves prior versions but is not the same as a 30-day recovery window for deletions, which is what soft delete provides. The service endpoint alone also leaves the account's public endpoint in place.",
    difficulty: 3,
    reference: { label: "Data protection for Blob Storage", url: `${docs}/azure/storage/blobs/data-protection-overview` },
  },
  {
    id: "az500-s3",
    domainId: "compute",
    type: "meets-goal",
    scenario:
      "Your company stores customer records in an Azure Storage account named stcustomers. Security requires that the storage account is reachable only from the virtual network vnet-prod, that requests cannot be authorised with the account access keys, and that deleted blobs remain recoverable for 30 days.\n\nYou need to meet all three requirements.",
    prompt:
      "Solution: You configure the storage account firewall to allow only the vnet-prod subnet, assign Storage Blob Data Reader to the application's managed identity, and enable blob soft delete with a 30-day retention period.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Network restriction and soft delete are satisfied, but granting an RBAC role does not prevent anyone who holds the account keys from using them. Shared key authorization remains enabled unless you explicitly set allowSharedKeyAccess to false, so the second requirement is unmet.",
    difficulty: 3,
    reference: { label: "Authorize access to blobs with Microsoft Entra ID", url: `${docs}/azure/storage/blobs/authorize-access-azure-active-directory` },
  },

  // ---- repeated scenario: admin access to VMs ----------------------------
  {
    id: "az500-s4",
    domainId: "network",
    type: "meets-goal",
    scenario:
      "Contoso runs 40 virtual machines in a virtual network. Administrators must be able to open RDP sessions to the machines. No virtual machine may have a public IP address, and management ports must not be permanently open to any network.",
    prompt:
      "Solution: You deploy Azure Bastion into the virtual network and remove the public IP addresses from all virtual machines.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "Azure Bastion brokers RDP and SSH over TLS from the portal to virtual machines that hold only private IPs, so no VM needs a public address and the RDP port is never exposed to a network outside the virtual network.",
    difficulty: 2,
    reference: { label: "What is Azure Bastion?", url: `${docs}/azure/bastion/bastion-overview` },
  },
  {
    id: "az500-s5",
    domainId: "network",
    type: "meets-goal",
    scenario:
      "Contoso runs 40 virtual machines in a virtual network. Administrators must be able to open RDP sessions to the machines. No virtual machine may have a public IP address, and management ports must not be permanently open to any network.",
    prompt:
      "Solution: You enable just-in-time VM access in Microsoft Defender for Cloud for all 40 virtual machines and leave their public IP addresses in place.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Just-in-time access does close the management port when it is not in use, satisfying the second requirement, but keeping the public IP addresses directly violates the first. Both conditions must hold for the solution to meet the goal.",
    difficulty: 2,
    reference: { label: "Just-in-time VM access", url: `${docs}/azure/defender-for-cloud/just-in-time-access-overview` },
  },

  // ---- statement grids ---------------------------------------------------
  {
    id: "az500-s6",
    domainId: "identity",
    type: "statements",
    scenario:
      "A user is assigned the Reader role at the subscription scope and the Contributor role on a resource group inside that subscription. A deny assignment created by a managed application blocks Microsoft.Compute/virtualMachines/delete at the resource group scope.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The user can create a virtual machine in the resource group.", correct: true },
      { id: "b", text: "The user can delete a virtual machine in the resource group.", correct: false },
      { id: "c", text: "The user can read resources elsewhere in the subscription.", correct: true },
    ],
    correct: ["a", "c"],
    explanation:
      "Azure RBAC assignments are additive, so Contributor at the resource group lets the user create virtual machines there, and Reader at the subscription lets them read everything else. Deny assignments always override allow assignments, so the delete action is blocked despite Contributor granting it.",
    difficulty: 3,
    reference: { label: "Understand deny assignments", url: `${docs}/azure/role-based-access-control/deny-assignments` },
  },
  {
    id: "az500-s7",
    domainId: "network",
    type: "statements",
    scenario:
      "A network security group is applied to Subnet1 with these inbound rules:\n• Priority 100 — Deny TCP 3389 from the Internet service tag\n• Priority 200 — Allow TCP 3389 from 10.0.0.0/8\n• Priority 300 — Allow TCP 443 from the Internet service tag",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "An RDP connection from 10.4.1.9 is allowed.", correct: true },
      { id: "b", text: "An RDP connection from a public internet address is allowed.", correct: false },
      { id: "c", text: "An HTTPS connection from a public internet address is allowed.", correct: true },
      { id: "d", text: "An SSH connection from 10.4.1.9 is allowed.", correct: false },
    ],
    correct: ["a", "c"],
    explanation:
      "Rules are evaluated by priority but only when source, destination, port, and protocol all match. Rule 100 matches only the Internet tag, so private-address RDP falls through to rule 200 and is allowed, while internet RDP is denied. Rule 300 allows internet HTTPS. Nothing permits SSH, so the default DenyAllInbound rule blocks it.",
    difficulty: 3,
    reference: { label: "How network security groups filter traffic", url: `${docs}/azure/virtual-network/network-security-group-how-it-works` },
  },
  {
    id: "az500-s8",
    domainId: "defender",
    type: "statements",
    scenario:
      "A key vault named kv-prod has soft delete enabled with a 90-day retention period and purge protection enabled. The vault uses the Azure RBAC permission model.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "A user with the Key Vault Administrator role can permanently purge a deleted key before 90 days elapse.", correct: false },
      { id: "b", text: "A deleted secret can be recovered within the 90-day window.", correct: true },
      { id: "c", text: "Purge protection can be disabled later if requirements change.", correct: false },
    ],
    correct: ["b"],
    explanation:
      "Purge protection blocks early purge for everyone, including Key Vault Administrators, and once enabled it cannot be turned off for the life of the vault. Soft delete keeps deleted objects recoverable throughout the retention period, which is the point of the pairing.",
    difficulty: 3,
    reference: { label: "Key Vault soft-delete and purge protection", url: `${docs}/azure/key-vault/general/soft-delete-overview` },
  },

  // ---- ordering ----------------------------------------------------------
  {
    id: "az500-s9",
    domainId: "defender",
    type: "ordering",
    prompt:
      "You must use Azure Policy to install a required extension on virtual machines that already exist. Arrange the actions in the order you should perform them.",
    steps: [
      { id: "a", text: "Create a policy definition that uses the DeployIfNotExists effect" },
      { id: "b", text: "Assign the policy at the target scope and grant its managed identity the required role" },
      { id: "c", text: "Wait for the compliance evaluation to identify non-compliant resources" },
      { id: "d", text: "Create a remediation task to bring existing resources into compliance" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "DeployIfNotExists only fires on resource create or update, so existing machines need a remediation task. The assignment must carry a managed identity with rights to perform the deployment, and compliance evaluation has to run before there is anything for the remediation task to act on.",
    difficulty: 3,
    reference: { label: "Remediate non-compliant resources", url: `${docs}/azure/governance/policy/how-to/remediate-resources` },
  },
  {
    id: "az500-s10",
    domainId: "compute",
    type: "ordering",
    prompt:
      "You need to encrypt an Azure SQL Database with a customer-managed key held in Azure Key Vault. Arrange the configuration steps in order.",
    steps: [
      { id: "a", text: "Enable soft delete and purge protection on the key vault" },
      { id: "b", text: "Create or import the key in the key vault" },
      { id: "c", text: "Assign the logical server's managed identity permission to get, wrap, and unwrap the key" },
      { id: "d", text: "Set the key as the Transparent Data Encryption protector for the server" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Azure SQL requires the vault to have soft delete and purge protection before it will accept a customer-managed TDE protector, because losing the key would make the database permanently unreadable. The key must exist, the server identity must be able to wrap and unwrap it, and only then can it be set as the protector.",
    difficulty: 3,
    reference: { label: "TDE with customer-managed keys", url: `${docs}/azure/azure-sql/database/transparent-data-encryption-byok-overview` },
  },
  {
    id: "az500-s11",
    domainId: "identity",
    type: "ordering",
    prompt:
      "An application running on an Azure virtual machine must read a secret from Azure Key Vault without any stored credentials. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Enable a system-assigned managed identity on the virtual machine" },
      { id: "b", text: "Assign the Key Vault Secrets User role to that identity, scoped to the vault" },
      { id: "c", text: "Acquire a token from the instance metadata endpoint in application code" },
      { id: "d", text: "Call the Key Vault data plane with the acquired token" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The identity must exist before it can be granted a role, and the role must be in place before a token will be accepted by the vault. At runtime the application requests a token from the instance metadata service and presents it to the Key Vault data plane — no secret is ever stored.",
    difficulty: 2,
    reference: { label: "Use a managed identity to access Key Vault", url: `${docs}/azure/key-vault/general/authentication` },
  },
  {
    id: "az500-s12",
    domainId: "network",
    type: "ordering",
    prompt:
      "You must force all outbound internet traffic from a spoke virtual network through an Azure Firewall in a hub virtual network. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Deploy Azure Firewall into the AzureFirewallSubnet of the hub virtual network" },
      { id: "b", text: "Peer the spoke virtual network with the hub virtual network" },
      { id: "c", text: "Create a route table with a 0.0.0.0/0 route whose next hop is the firewall's private IP" },
      { id: "d", text: "Associate the route table with the spoke subnets" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The firewall must exist before you can reference its private IP as a next hop, and the networks must be peered for the traffic to reach it. The user-defined route then overrides the default system route to the internet, and it only takes effect once the route table is associated with the subnets.",
    difficulty: 2,
    reference: { label: "Azure Firewall in a hub network", url: `${docs}/azure/firewall/tutorial-hybrid-portal` },
  },
];
