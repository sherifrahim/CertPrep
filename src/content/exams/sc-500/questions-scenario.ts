import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc500ScenarioQuestions: Question[] = [
  {
    id: "sc500-s1",
    domainId: "compute",
    type: "meets-goal",
    scenario:
      "Contoso is deploying Microsoft 365 Copilot. Security requires that Copilot cannot summarise documents labelled Highly Confidential, that sensitive SharePoint content currently unlabelled gets labelled automatically, and that oversharing is measured before rollout.",
    prompt:
      "Solution: You run a Purview DSPM for AI data risk assessment, create a service-side auto-labeling policy for SharePoint, and create a DLP policy for the Microsoft 365 Copilot location restricting content with the Highly Confidential label.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "All three requirements are addressed. The data risk assessment measures oversharing, service-side auto-labeling applies labels to content already at rest with no user action, and a DLP policy scoped to the Copilot location prevents labelled content being processed by Copilot and its agents.",
    difficulty: 3,
    reference: { label: "DLP for Microsoft 365 Copilot", url: `${docs}/purview/dlp-microsoft365-copilot-location-learn-about` },
  },
  {
    id: "sc500-s2",
    domainId: "compute",
    type: "meets-goal",
    scenario:
      "Contoso is deploying Microsoft 365 Copilot. Security requires that Copilot cannot summarise documents labelled Highly Confidential, that sensitive SharePoint content currently unlabelled gets labelled automatically, and that oversharing is measured before rollout.",
    prompt:
      "Solution: You enable client-side auto-labeling in the label settings and rely on users to apply labels as they open documents.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Client-side labeling only fires when a user opens a document in an Office app, so existing SharePoint content stays unlabelled indefinitely. It also does nothing to measure oversharing or to stop Copilot processing labelled content.",
    difficulty: 2,
    reference: { label: "Apply a sensitivity label automatically", url: `${docs}/purview/apply-sensitivity-label-automatically` },
  },
  {
    id: "sc500-s3",
    domainId: "identity",
    type: "statements",
    scenario:
      "A user is assigned Reader at the subscription scope and Contributor on a resource group inside it. A deny assignment created by a managed application blocks Microsoft.Compute/virtualMachines/delete at that resource group.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The user can create a virtual machine in the resource group.", correct: true },
      { id: "b", text: "The user can delete a virtual machine in the resource group.", correct: false },
      { id: "c", text: "The user can read resources elsewhere in the subscription.", correct: true },
    ],
    correct: ["a", "c"],
    explanation:
      "Azure RBAC assignments are additive, so Contributor at the resource group permits creation and Reader at the subscription permits reading elsewhere. Deny assignments always override allow assignments, so the delete action is blocked despite Contributor granting it.",
    difficulty: 3,
    reference: { label: "Understand deny assignments", url: `${docs}/azure/role-based-access-control/deny-assignments` },
  },
  {
    id: "sc500-s4",
    domainId: "data-network",
    type: "statements",
    scenario:
      "A storage account has public network access disabled, a private endpoint in vnet-app, shared key authorization disabled, and blob soft delete enabled for 14 days.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "A caller holding the account key can still read blobs.", correct: false },
      { id: "b", text: "A deleted blob can be restored within 14 days.", correct: true },
      { id: "c", text: "A virtual machine in a peered network can reach the account privately if DNS resolves to the endpoint.", correct: true },
    ],
    correct: ["b", "c"],
    explanation:
      "Disabling shared key authorization rejects any request signed with the account keys, so holding a key is useless. Soft delete makes deletions recoverable for the retention period, and a private endpoint is reachable from peered networks provided the privatelink DNS zone resolves for them.",
    difficulty: 3,
    reference: { label: "Prevent shared key authorization", url: `${docs}/azure/storage/common/shared-key-authorization-prevent` },
  },
  {
    id: "sc500-s5",
    domainId: "posture",
    type: "ordering",
    prompt:
      "You must ingest Windows security events from on-premises servers into Microsoft Sentinel, filtered to specific event IDs. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Connect the servers to Azure Arc so they become manageable Azure resources" },
      { id: "b", text: "Deploy the Azure Monitor Agent to the servers" },
      { id: "c", text: "Create a data collection rule with an XPath filter for the required event IDs" },
      { id: "d", text: "Associate the data collection rule with the servers and verify data arrives" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Non-Azure machines must be projected into Azure through Arc before the agent extension can be deployed. The data collection rule then defines what is gathered, and it only takes effect on machines it is associated with.",
    difficulty: 2,
    reference: { label: "Windows Security Events via AMA", url: `${docs}/azure/sentinel/data-connectors/windows-security-events-via-ama` },
  },
  {
    id: "sc500-s6",
    domainId: "identity",
    type: "ordering",
    prompt:
      "An application on an Azure virtual machine must read a secret from Key Vault with no stored credential. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Enable a managed identity on the virtual machine" },
      { id: "b", text: "Assign the Key Vault Secrets User role to that identity, scoped to the vault" },
      { id: "c", text: "Acquire a token from the instance metadata endpoint in application code" },
      { id: "d", text: "Call the Key Vault data plane with the token" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The identity must exist before it can hold a role, and the role must be in place before the vault will accept its token. At runtime the application requests a token from the instance metadata service and presents it — no secret is ever stored.",
    difficulty: 2,
    reference: { label: "Key Vault authentication", url: `${docs}/azure/key-vault/general/authentication` },
  },
  {
    id: "sc500-s7",
    domainId: "compute",
    type: "ordering",
    prompt:
      "You must protect internal applications calling Microsoft Foundry model endpoints. Arrange the steps in a sensible order.",
    steps: [
      { id: "a", text: "Place Azure API Management in front of the model endpoints as an AI gateway" },
      { id: "b", text: "Require managed identity authentication from applications to the gateway" },
      { id: "c", text: "Apply token-based rate limiting and logging policies at the gateway" },
      { id: "d", text: "Enable Defender for AI Services to detect threats against the workload" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The gateway must exist before authentication and policy can be enforced at it, and rate limiting is configured on that same chokepoint. Threat detection is then layered over the running workload rather than replacing the access controls.",
    difficulty: 3,
    reference: { label: "AI gateway capabilities in API Management", url: `${docs}/azure/api-management/genai-gateway-capabilities` },
  },
  {
    id: "sc500-s8",
    domainId: "data-network",
    type: "meets-goal",
    scenario:
      "An Azure SQL Database must reject any connection that does not originate from vnet-app, and administrators must authenticate with Microsoft Entra accounts rather than SQL logins.",
    prompt:
      "Solution: You create a private endpoint for the logical server in vnet-app, set Public network access to Disabled, and configure a Microsoft Entra admin for the server.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "Disabling public network access forces all traffic through the private endpoint in vnet-app, and assigning a Microsoft Entra admin enables directory-based authentication. Both requirements are satisfied.",
    difficulty: 2,
    reference: { label: "Azure SQL private link", url: `${docs}/azure/azure-sql/database/private-endpoint-overview` },
  },
];
