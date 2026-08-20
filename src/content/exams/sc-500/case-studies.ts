import type { CaseStudy, Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc500CaseStudies: CaseStudy[] = [
  {
    id: "northwind-ai",
    title: "Northwind Traders — securing a cloud and AI platform",
    summary:
      "A logistics company must secure identity, data, network and compute across Azure and AWS while safely launching an internal AI assistant.",
    sections: [
      {
        heading: "Overview",
        body: "Northwind Traders is a logistics company with 9,000 employees. It runs workloads in Azure and AWS and is launching an internal AI assistant built on Microsoft Foundry, alongside a Microsoft 365 Copilot pilot.\n\nA security review must be passed before the AI assistant reaches production.",
      },
      {
        heading: "Existing environment",
        body: "Identity and governance:\n• A single Microsoft Entra tenant. Fourteen engineers hold permanent Owner on the production subscription.\n• Application secrets are stored in Key Vault, but the vault uses access policies rather than Azure RBAC.\n\nData and network:\n• A storage account, stgship, holds shipping manifests. Shared key authorization is enabled.\n• An Azure SQL Database, sqlship, is reachable over its public endpoint with firewall rules.\n• Spoke virtual networks route to the internet directly.\n\nCompute and AI:\n• 300 virtual machines in Azure and 120 EC2 instances in AWS, none onboarded to Defender for Servers.\n• The AI assistant calls Foundry model endpoints directly from three applications, each holding its own key.\n• A Copilot pilot is planned. A weekly report shows many SharePoint sites sharing content with 'anyone with the link'.\n\nOperations:\n• A Log Analytics workspace exists. Microsoft Sentinel is not enabled.\n• Perimeter firewalls emit CEF and currently send it nowhere.",
      },
      {
        heading: "Requirements",
        body: "Identity and governance:\n• No permanent administrative access to production, with approval and MFA on elevation.\n• Key Vault access must be governed by the same role assignments and reviews as other Azure resources.\n\nData and network:\n• stgship must reject any request authorised with account keys.\n• sqlship must reject connections that do not originate from the application virtual network.\n• Outbound internet traffic from the spokes must be inspected centrally.\n\nCompute and AI:\n• Server protections must extend to the AWS instances without migrating them.\n• Applications must stop holding model endpoint keys, and model traffic must be centrally authenticated, rate limited and logged.\n• Copilot must not summarise content labelled Highly Confidential, and oversharing must be measured before the pilot.\n\nOperations:\n• Firewall CEF logs must reach Sentinel.\n• High-severity incidents must automatically notify the security team.",
      },
    ],
  },
];

export const sc500CaseStudyQuestions: Question[] = [
  {
    id: "sc500-cs1-q1",
    domainId: "identity",
    caseStudyId: "northwind-ai",
    type: "multi",
    prompt:
      "You need to meet the identity and governance requirements. Which two actions should you perform? (Choose two.)",
    options: [
      { id: "a", text: "Convert the fourteen Owner assignments to eligible PIM assignments requiring approval and MFA on activation" },
      { id: "b", text: "Switch the key vault to the Azure RBAC permission model" },
      { id: "c", text: "Replace Owner with Contributor for the fourteen engineers" },
      { id: "d", text: "Add a resource lock to the production subscription" },
    ],
    correct: ["a", "b"],
    explanation:
      "Eligible PIM assignments remove standing access and supply the approval and MFA controls. Moving the vault to Azure RBAC brings its data plane under the same role assignments, PIM, and access reviews as other resources. Contributor is still permanent access, and locks prevent changes rather than governing who holds rights.",
    difficulty: 2,
    reference: { label: "Key Vault RBAC guide", url: `${docs}/azure/key-vault/general/rbac-guide` },
  },
  {
    id: "sc500-cs1-q2",
    domainId: "data-network",
    caseStudyId: "northwind-ai",
    type: "single",
    prompt:
      "You need stgship to reject requests authorised with account keys. What should you do?",
    options: [
      { id: "a", text: "Set allowSharedKeyAccess to false on the storage account" },
      { id: "b", text: "Rotate both account keys and store them in Key Vault" },
      { id: "c", text: "Enable the storage firewall for the application subnet" },
      { id: "d", text: "Issue user delegation SAS tokens to all callers" },
    ],
    correct: ["a"],
    explanation:
      "Only disabling shared key authorization makes the account reject key-signed requests, forcing Entra authentication and Azure RBAC. Rotation and vault storage still leave the keys usable, and the firewall governs origin rather than authentication method.",
    difficulty: 2,
    reference: { label: "Prevent shared key authorization", url: `${docs}/azure/storage/common/shared-key-authorization-prevent` },
  },
  {
    id: "sc500-cs1-q3",
    domainId: "data-network",
    caseStudyId: "northwind-ai",
    type: "multi",
    prompt:
      "You need to meet the sqlship and outbound inspection requirements. Which two should you implement? (Choose two.)",
    options: [
      { id: "a", text: "A private endpoint for sqlship with public network access disabled" },
      { id: "b", text: "Azure Firewall in the hub, with a 0.0.0.0/0 user-defined route on the spoke subnets" },
      { id: "c", text: "Additional SQL firewall rules listing the application subnet" },
      { id: "d", text: "NSG rules denying all outbound internet traffic from the spokes" },
    ],
    correct: ["a", "b"],
    explanation:
      "A private endpoint with public access disabled is what actually removes the public path to sqlship. Central egress inspection requires a firewall plus a route override, since NSGs can block traffic but cannot redirect it, and firewall rules alone leave the public endpoint listening.",
    difficulty: 3,
    reference: { label: "Azure SQL private link", url: `${docs}/azure/azure-sql/database/private-endpoint-overview` },
  },
  {
    id: "sc500-cs1-q4",
    domainId: "compute",
    caseStudyId: "northwind-ai",
    type: "single",
    prompt:
      "You need to extend Defender for Servers protections to the 120 EC2 instances without migrating them. What should you do first?",
    options: [
      { id: "a", text: "Connect the AWS account to Defender for Cloud and onboard the instances through Azure Arc" },
      { id: "b", text: "Rebuild the instances as Azure virtual machines" },
      { id: "c", text: "Create a site-to-site VPN to the AWS VPC" },
      { id: "d", text: "Install the Log Analytics agent and take no further action" },
    ],
    correct: ["a"],
    explanation:
      "The AWS connector brings the account's configuration into Defender for Cloud, and Azure Arc projects the individual instances as Azure resources so server-level plans and extensions apply to them. Networking alone does not make them manageable.",
    difficulty: 2,
    reference: { label: "Connect your AWS account", url: `${docs}/azure/defender-for-cloud/quickstart-onboard-aws` },
  },
  {
    id: "sc500-cs1-q5",
    domainId: "compute",
    caseStudyId: "northwind-ai",
    type: "single",
    prompt:
      "You need to stop the three applications holding model endpoint keys while centralising authentication, rate limiting and logging for model traffic. What should you implement?",
    options: [
      { id: "a", text: "Azure API Management as an AI gateway in front of the model endpoints, with applications authenticating by managed identity" },
      { id: "b", text: "A shared key stored in Key Vault and read by each application" },
      { id: "c", text: "Azure Front Door with response caching" },
      { id: "d", text: "A network security group restricting the model endpoint subnet" },
    ],
    correct: ["a"],
    explanation:
      "An API Management gateway gives one chokepoint for authentication, token-based rate limiting, and logging, and lets applications present managed identities instead of holding keys. Moving a shared key into Key Vault still leaves every application holding a credential.",
    difficulty: 3,
    reference: { label: "AI gateway capabilities in API Management", url: `${docs}/azure/api-management/genai-gateway-capabilities` },
  },
  {
    id: "sc500-cs1-q6",
    domainId: "compute",
    caseStudyId: "northwind-ai",
    type: "single",
    prompt:
      "You need to meet the Copilot requirements before the pilot. What should you do?",
    options: [
      { id: "a", text: "Run a Purview DSPM for AI data risk assessment, auto-label sensitive SharePoint content, and create a DLP policy for the Copilot location restricting the Highly Confidential label" },
      { id: "b", text: "Delete SharePoint sites that share content with anyone" },
      { id: "c", text: "Disable Purview Audit for the pilot users" },
      { id: "d", text: "Publish a retention label to all users" },
    ],
    correct: ["a"],
    explanation:
      "The assessment measures oversharing, auto-labeling classifies content already at rest so policy can act on it, and a DLP policy scoped to the Copilot location prevents labelled content being summarised. Deleting sites is disproportionate and disabling audit removes the visibility the review depends on.",
    difficulty: 3,
    reference: { label: "Microsoft Purview DSPM for AI", url: `${docs}/purview/dspm-for-ai` },
  },
  {
    id: "sc500-cs1-q7",
    domainId: "posture",
    caseStudyId: "northwind-ai",
    type: "ordering",
    prompt:
      "You need to meet the operations requirements. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Enable Microsoft Sentinel on the existing Log Analytics workspace" },
      { id: "b", text: "Deploy a Linux forwarder running the Azure Monitor Agent and point the firewalls at it" },
      { id: "c", text: "Create a playbook that notifies the security team" },
      { id: "d", text: "Create an automation rule that runs the playbook for high-severity incidents" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Sentinel must be enabled before connectors or content exist. CEF collection needs the forwarder in place before the appliances send to it, and the playbook must exist before an automation rule can invoke it — automation rules cannot reach external services themselves.",
    difficulty: 2,
    reference: { label: "Ingest CEF logs via AMA", url: `${docs}/azure/sentinel/connect-cef-syslog-ama` },
  },
];
