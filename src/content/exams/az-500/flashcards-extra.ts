import type { Flashcard } from "../../types";

export const az500ExtraFlashcards: Flashcard[] = [
  // ---------------------------------------------------------------- identity
  {
    id: "az500-d1",
    domainId: "identity",
    front: "What is a federated identity credential?",
    back: "Trust between an app registration and an external OIDC issuer (GitHub Actions, Kubernetes, another cloud), scoped to a subject such as repo and branch. The external token is exchanged for an Entra token — no client secret exists.",
  },
  {
    id: "az500-d2",
    domainId: "identity",
    front: "How do you allow user consent for safe permissions only?",
    back: "Classify permissions as low impact, then apply an app consent policy that permits user consent only for that classification. Everything higher requires admin consent.",
  },
  {
    id: "az500-d3",
    domainId: "identity",
    front: "Conditional Access: grant controls vs session controls",
    back: "Grant controls decide whether sign-in succeeds (require MFA, compliant device, terms of use). Session controls shape what happens inside the session (app-enforced restrictions, Conditional Access App Control, sign-in frequency, persistent browser).",
  },
  {
    id: "az500-d4",
    domainId: "identity",
    front: "What is PIM for Groups?",
    back: "Makes membership of a group itself eligible and time-bound, so every role and app assignment granted through that group inherits just-in-time activation — useful where a role cannot be PIM-managed directly.",
  },
  {
    id: "az500-d5",
    domainId: "identity",
    front: "Which Entra roles can read Azure resources by default?",
    back: "None. Azure RBAC and Entra roles are separate. A Global Administrator must explicitly elevate access to gain User Access Administrator at the root scope, and that action is logged.",
  },
  {
    id: "az500-d6",
    domainId: "identity",
    front: "Continuous access evaluation (CAE)",
    back: "Lets resource providers reject an access token mid-lifetime when a critical event occurs — account disabled, password reset, or a Conditional Access policy change — instead of waiting for the token to expire.",
  },

  // ----------------------------------------------------------------- network
  {
    id: "az500-d7",
    domainId: "network",
    front: "Why does a private endpoint need a private DNS zone?",
    back: "The endpoint creates a NIC with a private IP, but the service hostname still resolves publicly. A privatelink.* zone linked to the VNet holds the A record so existing connection strings resolve privately without change.",
  },
  {
    id: "az500-d8",
    domainId: "network",
    front: "ExpressRoute encryption options",
    back: "MACsec encrypts at layer 2 on ExpressRoute Direct ports between your routers and Microsoft's. An IPsec VPN tunnel over private peering encrypts at layer 3 end to end.",
  },
  {
    id: "az500-d9",
    domainId: "network",
    front: "When do you need a NAT gateway?",
    back: "For scalable outbound-only internet access from a subnet with predictable source IPs and a large SNAT port pool — without giving any VM a public IP or inbound reachability.",
  },
  {
    id: "az500-d10",
    domainId: "network",
    front: "NSG flow logs vs traffic analytics",
    back: "Flow logs are the raw allowed/denied flow records written to storage. Traffic analytics processes them into a workspace and adds topology, top talkers, geography, and malicious-flow detection.",
  },
  {
    id: "az500-d11",
    domainId: "network",
    front: "WAF Detection vs Prevention mode",
    back: "Detection logs matches without blocking — use it to tune rules and find false positives. Prevention actively blocks. Standard practice is to run in Detection first, then switch once the log is clean.",
  },
  {
    id: "az500-d12",
    domainId: "network",
    front: "Azure Bastion SKU differences",
    back: "Basic gives portal RDP/SSH. Standard adds host scaling, native client support, and IP-based connection. Premium adds session recording and private-only Bastion deployments. Developer SKU is a free, low-scale option.",
  },

  // ----------------------------------------------------------------- compute
  {
    id: "az500-d13",
    domainId: "compute",
    front: "What does trusted launch provide?",
    back: "Secure boot blocks unsigned boot components, a vTPM measures the boot chain and stores secrets, and boot integrity monitoring lets Defender for Cloud alert on rootkit-style tampering.",
  },
  {
    id: "az500-d14",
    domainId: "compute",
    front: "AKS: Workload ID vs kubelet identity",
    back: "Workload ID federates each Kubernetes service account with Entra so individual pods get least-privilege identities. The kubelet identity is shared by everything on the node, so anything scheduled there inherits its rights.",
  },
  {
    id: "az500-d15",
    domainId: "compute",
    front: "ACR quarantine mode",
    back: "A pushed image stays unavailable to normal pulls until a scanning process marks it passed, so vulnerable images cannot be deployed. Pair it with continuous scanning in Defender for Containers.",
  },
  {
    id: "az500-d16",
    domainId: "compute",
    front: "Can a locked immutability policy be changed?",
    back: "It can be extended but never shortened or removed, by anyone including the subscription owner, until the retention interval elapses. That irreversibility is what makes it acceptable for WORM compliance.",
  },
  {
    id: "az500-d17",
    domainId: "compute",
    front: "How do you make Azure SQL reachable only from a VNet?",
    back: "Create a private endpoint for the logical server and set Public network access to Disabled. Firewall rules alone leave the public endpoint listening.",
  },
  {
    id: "az500-d18",
    domainId: "compute",
    front: "Confidential VMs vs trusted launch",
    back: "Trusted launch protects the boot chain on standard VMs. Confidential VMs additionally encrypt memory in hardware so the host and hypervisor cannot read guest state, with attestation and optional confidential disk encryption.",
  },

  // ---------------------------------------------------------------- defender
  {
    id: "az500-d19",
    domainId: "defender",
    front: "What is the cloud security explorer?",
    back: "A query interface over Defender for Cloud's security graph, letting you combine exposure, vulnerability, identity, and data-sensitivity conditions in one search — for example internet-facing VMs with a managed identity that can write to storage.",
  },
  {
    id: "az500-d20",
    domainId: "defender",
    front: "Why is attack path analysis useful?",
    back: "It chains individually moderate weaknesses into an exploitable route to a sensitive asset, so you can fix the one step that breaks the chain instead of triaging an unranked recommendation list.",
  },
  {
    id: "az500-d21",
    domainId: "defender",
    front: "What do Defender for Cloud governance rules do?",
    back: "Assign an owner and remediation timeframe to recommendations, producing accountability and overdue tracking in the governance report — turning findings into assigned work rather than a backlog.",
  },
  {
    id: "az500-d22",
    domainId: "defender",
    front: "What is Sentinel UEBA?",
    back: "Entity behaviour analytics baselines users and hosts over time, then enriches events with deviations and peer comparisons (first time seen, unusual geography), surfaced on entity pages and queryable via BehaviorAnalytics.",
  },
  {
    id: "az500-d23",
    domainId: "defender",
    front: "Defender for Key Vault — what does it actually do?",
    back: "It is a detection plan. It watches data-plane access and alerts on anomalies: unfamiliar identities, TOR exit nodes, bulk secret enumeration. It does not encrypt or rotate anything.",
  },
  {
    id: "az500-d24",
    domainId: "defender",
    front: "Azure Update Manager vs Defender Vulnerability Management",
    back: "MDVM finds and prioritises missing patches and misconfigurations as findings. Update Manager actually deploys OS updates on schedules with maintenance windows and reports compliance.",
  },
  {
    id: "az500-d25",
    domainId: "defender",
    front: "Defender for Cloud plan names worth knowing",
    back: "Servers, Storage, SQL, Containers, App Service, Key Vault, Resource Manager, APIs, and Defender CSPM. CSPM supplies attack paths, security explorer, and agentless scanning; the workload plans supply runtime threat detection.",
  },
  {
    id: "az500-d26",
    domainId: "defender",
    front: "How do you keep an immutable audit trail of Log Analytics data?",
    back: "Export the tables to a storage account protected by a locked immutability policy. Workspace tables are append-only in normal use, but export plus WORM storage is what satisfies a tamper-proof requirement.",
  },
];
