import type { CaseStudy, Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc500HardCaseStudies: CaseStudy[] = [
  {
    id: "woodgrove-containers",
    title: "Woodgrove Bank — a private container platform",
    summary:
      "A bank is moving its payment services onto a private AKS platform and must lock down the registry, cluster access, workload identity, backups and storage.",
    sections: [
      {
        heading: "Overview",
        body: "Woodgrove Bank is replacing its virtual machine estate with containers. The platform runs in a hub-and-spoke network. Security wants no public exposure of the platform's control planes, no stored credentials, and protection against a compromised backup administrator.",
      },
      {
        heading: "Existing environment",
        body: "Platform:\n• An Azure Kubernetes Service (AKS) cluster is planned for each of two environments. Administrators will manage the clusters from a jump host in the hub network.\n• Container images are stored in an Azure Container Registry that currently uses the Standard tier and public access. Builds run on Microsoft-hosted Azure DevOps agents.\n• The hub network uses a custom DNS server.\n\nIdentity:\n• Forty-five Kubernetes service accounts across the clusters need to read secrets from Azure Key Vault.\n\nData protection:\n• Virtual machines that remain are protected by a Recovery Services vault. The backup administrators also hold the Contributor role on the subscription that contains the vault.\n• Several existing storage accounts have public network access enabled.",
      },
      {
        heading: "Requirements",
        body: "Networking:\n• The registry must be reachable only through private endpoints.\n• The AKS API servers must not be reachable from the public internet, and administrators must reach them from the hub.\n\nIdentity:\n• Pods must authenticate to Key Vault without stored secrets, and administration effort must be minimal.\n\nData protection:\n• A compromised backup administrator must not be able to disable backup protections on their own.\n• New and existing storage accounts must not allow public network access.",
      },
    ],
  },
];

export const sc500HardCaseStudyQuestions: Question[] = [
  {
    id: "sc500-cs2-q1",
    domainId: "compute",
    caseStudyId: "woodgrove-containers",
    type: "single",
    prompt:
      "You need to meet the registry requirement. Which change should you make, and what will you need to adapt in the build process?",
    options: [
      { id: "a", text: "Upgrade to Premium and add private endpoints, then move builds to self-hosted agents that can reach them" },
      { id: "b", text: "Add private endpoints to the Standard tier, and keep the Microsoft-hosted agents as they are today" },
      { id: "c", text: "Keep public access and add a service endpoint for Microsoft.ContainerRegistry to each spoke subnet" },
      { id: "d", text: "Upgrade to Premium and add private endpoints, since Microsoft-hosted agents can reach them privately over Azure's backbone" },
    ],
    correct: ["a"],
    explanation:
      "Private Link for Azure Container Registry is available in the Premium tier. Private endpoints aren't supported with Azure DevOps Microsoft-hosted agents, so builds need a self-hosted agent with network line of sight to the private endpoint. The Standard tier can't have private endpoints.",
    difficulty: 3,
    reference: { label: "Connect privately to an Azure container registry", url: `${docs}/azure/container-registry/container-registry-private-link` },
  },
  {
    id: "sc500-cs2-q2",
    domainId: "compute",
    caseStudyId: "woodgrove-containers",
    type: "single",
    prompt:
      "You create the AKS clusters as private clusters. The jump host uses the hub's custom DNS server and cannot resolve the API server name. What should you configure?",
    options: [
      { id: "a", text: "A conditional forwarder on the custom DNS server for the cluster's private DNS zone, sending to 168.63.129.16" },
      { id: "b", text: "A public DNS record for the API server, pointing at its private IP address" },
      { id: "c", text: "A host file entry on every administrator's machine that maps the name to the API server" },
      { id: "d", text: "A second private endpoint for the API server placed in the hub network subnet" },
    ],
    correct: ["a"],
    explanation:
      "A private cluster's API server has a private endpoint and a private DNS zone. A custom DNS server must be able to resolve that zone, which is done with a conditional forwarder to the Azure DNS virtual server at 168.63.129.16, or through Azure DNS Private Resolver in a network linked to the zone.",
    difficulty: 3,
    reference: { label: "Create a private Azure Kubernetes Service cluster", url: `${docs}/azure/aks/private-clusters` },
  },
  {
    id: "sc500-cs2-q3",
    domainId: "identity",
    caseStudyId: "woodgrove-containers",
    type: "single",
    prompt:
      "You need pods to authenticate to Key Vault with minimal administration. Forty-five service accounts need access. Which approach works?",
    options: [
      { id: "a", text: "Use Microsoft Entra Workload ID on each cluster, and spread federated credentials across several managed identities" },
      { id: "b", text: "Create one managed identity with 45 federated credentials, one for each Kubernetes service account" },
      { id: "c", text: "Give the node pool's kubelet identity access to the vault so that every pod inherits it" },
      { id: "d", text: "Store a service principal secret in a Kubernetes secret that each pod mounts" },
    ],
    correct: ["a"],
    explanation:
      "Workload ID federates a Kubernetes service account token with Microsoft Entra ID, so pods need no stored secret, and it requires the OIDC issuer and workload identity to be enabled on the cluster. A managed identity can have a maximum of 20 federated identity credentials, so 45 service accounts require more than one identity. The kubelet identity would give every workload on the node pool the same access.",
    difficulty: 3,
    reference: { label: "Use Microsoft Entra Workload ID with AKS", url: `${docs}/azure/aks/workload-identity-overview` },
  },
  {
    id: "sc500-cs2-q4",
    domainId: "data-network",
    caseStudyId: "woodgrove-containers",
    type: "single",
    prompt:
      "You need to meet the requirement about a compromised backup administrator. Which configuration should you implement?",
    options: [
      { id: "a", text: "Multi-user authorization with a Resource Guard, where the backup administrators hold no Contributor role on it" },
      { id: "b", text: "A read-only lock on the Recovery Services vault, applied by the backup administrators themselves" },
      { id: "c", text: "Soft delete alone, which keeps deleted backup data for 14 more days after it is deleted" },
      { id: "d", text: "Multi-user authorization with the Resource Guard in the same subscription, owned by the backup team" },
    ],
    correct: ["a"],
    explanation:
      "Multi-user authorization uses a Resource Guard to require a second party's approval for protected operations such as disabling security features. The backup administrator must not have Contributor, Backup MUA Admin or Backup MUA Operator permissions on the Resource Guard, and it is best placed in another subscription or tenant. A lock the same administrators control, or a guard the same team owns, doesn't separate duties.",
    difficulty: 3,
    reference: { label: "Configure multi-user authorization using Resource Guard", url: `${docs}/azure/backup/multi-user-authorization` },
  },
  {
    id: "sc500-cs2-q5",
    domainId: "posture",
    caseStudyId: "woodgrove-containers",
    type: "single",
    prompt:
      "You need to ensure that new and existing storage accounts do not allow public network access. Which policy approach meets the requirement?",
    options: [
      { id: "a", text: "A Deny policy for new and updated accounts, plus a Modify policy with remediation tasks for existing accounts" },
      { id: "b", text: "A Deny policy only, which changes the existing accounts the next time the compliance scan runs" },
      { id: "c", text: "An Audit policy only, so that account owners are told which accounts to fix by themselves" },
      { id: "d", text: "A resource lock on every storage account, which prevents anyone changing network settings" },
    ],
    correct: ["a"],
    explanation:
      "Deny blocks non-compliant resources when they are created or updated, so it protects new accounts. Existing non-compliant resources are brought into compliance by remediation tasks for policies with a modify or deployIfNotExists effect. Deny alone doesn't change existing accounts, and Audit only reports.",
    difficulty: 3,
    reference: { label: "Remediate non-compliant resources with Azure Policy", url: `${docs}/azure/governance/policy/how-to/remediate-resources` },
  },
];
