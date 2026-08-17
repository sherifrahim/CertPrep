import type { CaseStudy, Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const az500CaseStudies: CaseStudy[] = [
  {
    id: "contoso-hybrid",
    title: "Contoso Ltd — hybrid Azure landing zone",
    summary:
      "A manufacturing company migrating to Azure must secure identity, network segmentation, storage, and monitoring while satisfying an external audit.",
    sections: [
      {
        heading: "Overview",
        body: "Contoso Ltd is a manufacturing company with head offices in Manchester and plants in three countries. Contoso is migrating line-of-business applications to Azure and must pass an external security audit in 90 days.\n\nContoso has a single Microsoft Entra tenant synchronised from on-premises Active Directory using Microsoft Entra Connect with password hash synchronisation.",
      },
      {
        heading: "Existing environment",
        body: "Azure subscriptions:\n• Sub-Prod — production workloads\n• Sub-Dev — development workloads\n\nNetworking:\n• A hub virtual network, vnet-hub, contains a VPN gateway terminating a site-to-site tunnel to Manchester.\n• Two spoke virtual networks, vnet-app and vnet-data, are peered to vnet-hub. Spoke-to-spoke traffic is currently permitted.\n• All virtual machines currently have public IP addresses so that administrators can connect over RDP.\n\nWorkloads:\n• App1 runs on five virtual machines in vnet-app.\n• SQL1 is an Azure SQL Database used by App1.\n• stgreports is a storage account holding generated PDF reports.\n\nOperations:\n• A Log Analytics workspace named law-central exists but no Microsoft Sentinel workspace is enabled.\n• Twelve users hold the Owner role permanently on Sub-Prod.",
      },
      {
        heading: "Requirements",
        body: "Identity:\n• No user may hold permanent administrative access to Sub-Prod.\n• Administrative access must require multifactor authentication and an approval step.\n\nNetwork:\n• Virtual machines must not have public IP addresses.\n• All outbound internet traffic from the spokes must be inspected centrally.\n• vnet-app must not be able to initiate connections directly to vnet-data.\n\nData:\n• SQL1 must reject any connection that does not originate from vnet-app.\n• Report PDFs in stgreports must be retained unaltered for five years, and nobody, including subscription owners, may delete them within that period.\n\nMonitoring:\n• Security alerts must be correlated in a SIEM, and high-severity alerts must automatically notify the security team's Microsoft Teams channel.\n• The audit requires evidence that governance controls block non-compliant deployments rather than merely reporting them.",
      },
    ],
  },
];

export const az500CaseStudyQuestions: Question[] = [
  {
    id: "az500-cs1-q1",
    domainId: "identity",
    caseStudyId: "contoso-hybrid",
    type: "single",
    prompt:
      "You need to satisfy the identity requirements for Sub-Prod. What should you implement?",
    options: [
      { id: "a", text: "Convert the twelve Owner assignments to eligible assignments in Microsoft Entra Privileged Identity Management, requiring MFA and approval on activation" },
      { id: "b", text: "Replace the Owner role with Contributor for all twelve users" },
      { id: "c", text: "Create a Conditional Access policy requiring MFA for the Microsoft Azure Management app" },
      { id: "d", text: "Move Sub-Prod into a new management group and assign Owner at that scope" },
    ],
    correct: ["a"],
    explanation:
      "Only eligible PIM assignments remove permanent administrative access, and PIM role settings supply both the MFA and approval requirements. Downgrading to Contributor still leaves standing access, and a Conditional Access policy adds MFA but does not remove the permanent assignment.",
    difficulty: 2,
    reference: { label: "PIM for Azure resources", url: `${docs}/entra/id-governance/privileged-identity-management/pim-resource-roles-assign-roles` },
  },
  {
    id: "az500-cs1-q2",
    domainId: "network",
    caseStudyId: "contoso-hybrid",
    type: "multi",
    prompt:
      "You need to meet the network requirements for administrative access and outbound inspection. Which two actions should you perform? (Choose two.)",
    options: [
      { id: "a", text: "Deploy Azure Bastion into vnet-hub and remove the public IP addresses from the virtual machines" },
      { id: "b", text: "Deploy Azure Firewall into vnet-hub and add a user-defined route for 0.0.0.0/0 on the spoke subnets pointing to the firewall" },
      { id: "c", text: "Enable just-in-time VM access and keep the public IP addresses" },
      { id: "d", text: "Create a network security group rule denying all outbound internet traffic from the spokes" },
    ],
    correct: ["a", "b"],
    explanation:
      "Bastion provides RDP without public IPs, satisfying the first requirement. Central outbound inspection needs Azure Firewall in the hub plus a UDR overriding the default internet route on the spokes. JIT retains the public IPs the requirements forbid, and an NSG can block traffic but cannot redirect it for inspection.",
    difficulty: 3,
    reference: { label: "Azure Firewall in a hub network", url: `${docs}/azure/firewall/tutorial-hybrid-portal` },
  },
  {
    id: "az500-cs1-q3",
    domainId: "network",
    caseStudyId: "contoso-hybrid",
    type: "single",
    prompt:
      "You need to prevent vnet-app initiating connections directly to vnet-data while keeping both peered to vnet-hub. What should you do?",
    options: [
      { id: "a", text: "Confirm no direct peering exists between the spokes and apply NSG rules denying vnet-data address ranges as a destination from vnet-app subnets" },
      { id: "b", text: "Remove the peering between vnet-hub and vnet-data" },
      { id: "c", text: "Enable Allow gateway transit on both spoke peerings" },
      { id: "d", text: "Move vnet-data into a different subscription" },
    ],
    correct: ["a"],
    explanation:
      "Azure does not route between spokes unless a direct peering or hub routing permits it, so the fix is confirming no spoke-to-spoke peering and enforcing the boundary with NSG rules. Removing the hub peering for vnet-data would break its legitimate connectivity, and subscription boundaries do not affect network routing.",
    difficulty: 3,
    reference: { label: "Virtual network peering", url: `${docs}/azure/virtual-network/virtual-network-peering-overview` },
  },
  {
    id: "az500-cs1-q4",
    domainId: "compute",
    caseStudyId: "contoso-hybrid",
    type: "single",
    prompt:
      "You need to meet the data requirement for the report PDFs in stgreports. What should you configure?",
    options: [
      { id: "a", text: "A locked time-based immutability policy with a five-year retention interval on the container" },
      { id: "b", text: "Blob soft delete with a retention period of 1825 days" },
      { id: "c", text: "A read-only resource lock on the storage account" },
      { id: "d", text: "Blob versioning combined with customer-managed keys" },
    ],
    correct: ["a"],
    explanation:
      "Only a locked time-based retention policy enforces WORM semantics that a subscription owner cannot shorten or bypass. Soft delete and versioning are recoverable but reconfigurable by an owner, and resource locks can be removed by owners.",
    difficulty: 2,
    reference: { label: "Immutable storage for Blob Storage", url: `${docs}/azure/storage/blobs/immutable-storage-overview` },
  },
  {
    id: "az500-cs1-q5",
    domainId: "compute",
    caseStudyId: "contoso-hybrid",
    type: "single",
    prompt:
      "You need to ensure SQL1 rejects connections that do not originate from vnet-app. What should you do?",
    options: [
      { id: "a", text: "Create a private endpoint for the logical server in vnet-app and set Public network access to Disabled" },
      { id: "b", text: "Add a virtual network rule for vnet-app and leave public network access enabled" },
      { id: "c", text: "Enable a service endpoint for Microsoft.Sql on the vnet-data subnet" },
      { id: "d", text: "Configure Transparent Data Encryption with a customer-managed key" },
    ],
    correct: ["a"],
    explanation:
      "A private endpoint in vnet-app plus disabling public network access means the only path to SQL1 is from that virtual network. A virtual network rule alone leaves the public endpoint listening, and encryption settings do not restrict network origin.",
    difficulty: 2,
    reference: { label: "Azure SQL private link", url: `${docs}/azure/azure-sql/database/private-endpoint-overview` },
  },
  {
    id: "az500-cs1-q6",
    domainId: "defender",
    caseStudyId: "contoso-hybrid",
    type: "ordering",
    prompt:
      "You need to meet the monitoring requirement for correlating alerts and notifying Teams. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Enable Microsoft Sentinel on the law-central workspace" },
      { id: "b", text: "Connect the Microsoft Defender for Cloud and Microsoft Entra ID data connectors" },
      { id: "c", text: "Create a playbook that posts to the security team's Teams channel" },
      { id: "d", text: "Create an automation rule that runs the playbook for high-severity incidents" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Sentinel must be enabled on the workspace before connectors or content exist. Connectors supply the alerts to correlate, the playbook provides the Teams action, and the automation rule is what invokes it — automation rules cannot reach Teams themselves.",
    difficulty: 2,
    reference: { label: "Automate incident handling", url: `${docs}/azure/sentinel/automate-incident-handling-with-automation-rules` },
  },
  {
    id: "az500-cs1-q7",
    domainId: "defender",
    caseStudyId: "contoso-hybrid",
    type: "single",
    prompt:
      "The audit requires evidence that governance controls block non-compliant deployments. Which Azure Policy effect should the relevant assignments use?",
    options: [
      { id: "a", text: "Deny" },
      { id: "b", text: "Audit" },
      { id: "c", text: "AuditIfNotExists" },
      { id: "d", text: "DeployIfNotExists" },
    ],
    correct: ["a"],
    explanation:
      "Deny is the only effect that prevents a non-compliant resource being created, which is what 'block rather than merely report' requires. Audit effects record compliance without stopping deployment, and DeployIfNotExists remediates after the fact.",
    difficulty: 1,
    reference: { label: "Azure Policy effects", url: `${docs}/azure/governance/policy/concepts/effect-basics` },
  },
];
