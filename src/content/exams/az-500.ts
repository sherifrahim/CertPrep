import type { Exam } from "../types";

export const az500: Exam = {
  id: "az-500",
  code: "AZ-500",
  title: "Microsoft Azure Security Technologies",
  tagline: "Secure Azure identity, network, compute, and data as an Azure security engineer.",
  description:
    "AZ-500 validates that you can implement, manage, and monitor security across Azure, multi-cloud, and hybrid environments — managing security posture, implementing threat protection, and remediating vulnerabilities with Microsoft Defender for Cloud and Microsoft Sentinel.",
  accent: "azure",
  skillsMeasuredAsOf: "2026-01-22",
  officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/exams/az-500",
  studyGuideUrl:
    "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-500",
  retiresOn: "2026-08-31",
  mock: { questionCount: 40, durationMin: 60, passPercent: 70 },

  domains: [
    {
      id: "identity",
      name: "Secure identity and access",
      weight: "15–20%",
      weightValue: 17.5,
      summary:
        "Azure RBAC, custom roles, Privileged Identity Management, MFA and Conditional Access, plus app registrations, service principals, and managed identities.",
      objectives: [
        "Manage Azure built-in role assignments",
        "Manage custom roles, including Azure roles and Microsoft Entra roles",
        "Plan and manage Azure resources in Microsoft Entra Privileged Identity Management",
        "Implement multi-factor authentication for access to Azure resources",
        "Implement Conditional Access policies for cloud resources in Azure",
        "Manage access to enterprise applications, including OAuth permission grants",
        "Manage Microsoft Entra app registrations and permission scopes",
        "Manage and use service principals and managed identities",
      ],
    },
    {
      id: "network",
      name: "Secure networking",
      weight: "20–25%",
      weightValue: 22.5,
      summary:
        "NSGs and ASGs, Virtual Network Manager, UDRs, peering and VPN, private access via Service Endpoints and Private Link, and public edge protection with Azure Firewall, Application Gateway, Front Door, and WAF.",
      objectives: [
        "Plan and implement Network Security Groups (NSGs) and Application Security Groups (ASGs)",
        "Manage virtual networks by using Azure Virtual Network Manager",
        "Plan and implement user-defined routes (UDRs)",
        "Plan and implement Virtual Network peering or VPN gateway",
        "Plan and implement Virtual WAN, including secured virtual hub",
        "Plan and implement Service Endpoints, Private Endpoints, and Private Link services",
        "Plan, implement, and manage an Azure Firewall, including firewall policies",
        "Plan and implement Application Gateway, Front Door, and Web Application Firewall",
        "Recommend when to use Azure DDoS Protection Standard",
        "Monitor network security by using Network Watcher",
      ],
    },
    {
      id: "compute",
      name: "Secure compute, storage, and databases",
      weight: "20–25%",
      weightValue: 22.5,
      summary:
        "Bastion and JIT VM access, AKS and container security, disk encryption, storage account access control and data protection, and Azure SQL authentication, auditing, masking, and encryption.",
      objectives: [
        "Plan and implement remote access to virtual machines, including Azure Bastion and JIT VM access",
        "Configure network isolation, authentication, and monitoring for Azure Kubernetes Service (AKS)",
        "Configure security monitoring for Azure Container Instances and Container Apps",
        "Manage access to Azure Container Registry (ACR)",
        "Configure disk encryption, including ADE, encryption at host, and confidential disk encryption",
        "Configure access control for storage accounts and manage access keys",
        "Select and configure access methods for Azure Files and Azure Blob Storage",
        "Protect against data security threats with soft delete, backups, versioning, and immutable storage",
        "Enable Microsoft Entra database authentication and database auditing",
        "Plan and implement dynamic data masking and Transparent Data Encryption (TDE)",
      ],
    },
    {
      id: "defender",
      name: "Secure Azure using Microsoft Defender for Cloud and Microsoft Sentinel",
      weight: "30–35%",
      weightValue: 32.5,
      summary:
        "Azure Policy governance, Key Vault protection, Defender for Cloud secure score, compliance standards, workload protection plans, and Sentinel data connectors, analytics rules, and automation.",
      objectives: [
        "Create, assign, and interpret policies and initiatives in Azure Policy",
        "Configure Key Vault network settings, access, and key rotation",
        "Manage and back up certificates, secrets, and keys",
        "Implement security controls to protect backups and for asset management",
        "Identify and remediate risks by using Defender for Cloud Secure Score and Inventory",
        "Manage and add compliance standards in Microsoft Defender for Cloud",
        "Connect AWS and GCP environments to Microsoft Defender for Cloud",
        "Enable cloud workload protection plans, including Servers, Databases, and Storage",
        "Implement agentless scanning and Defender Vulnerability Management for Azure VMs",
        "Configure data connectors, analytics rules, and automation in Microsoft Sentinel",
      ],
    },
  ],

  questions: [
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
      reference: {
        label: "Azure custom roles",
        url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles",
      },
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
      reference: {
        label: "Managed identities overview",
        url: "https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview",
      },
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
      reference: {
        label: "PIM for Azure resources",
        url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-resource-roles-assign-roles",
      },
    },
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
      reference: {
        label: "Private Endpoint vs Service Endpoint",
        url: "https://learn.microsoft.com/en-us/azure/private-link/private-endpoint-overview",
      },
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
      reference: {
        label: "How network security groups filter traffic",
        url: "https://learn.microsoft.com/en-us/azure/virtual-network/network-security-group-how-it-works",
      },
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
      reference: {
        label: "Azure Web Application Firewall",
        url: "https://learn.microsoft.com/en-us/azure/web-application-firewall/overview",
      },
    },
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
      reference: {
        label: "What is Azure Bastion?",
        url: "https://learn.microsoft.com/en-us/azure/bastion/bastion-overview",
      },
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
      reference: {
        label: "Immutable storage for Blob Storage",
        url: "https://learn.microsoft.com/en-us/azure/storage/blobs/immutable-storage-overview",
      },
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
      reference: {
        label: "Dynamic data masking",
        url: "https://learn.microsoft.com/en-us/azure/azure-sql/database/dynamic-data-masking-overview",
      },
    },
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
      reference: {
        label: "Azure Policy effects",
        url: "https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effect-basics",
      },
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
      reference: {
        label: "Key Vault soft-delete and purge protection",
        url: "https://learn.microsoft.com/en-us/azure/key-vault/general/soft-delete-overview",
      },
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
      reference: {
        label: "Automate incident handling in Microsoft Sentinel",
        url: "https://learn.microsoft.com/en-us/azure/sentinel/automate-incident-handling-with-automation-rules",
      },
    },
  ],

  flashcards: [
    {
      id: "az500-c1",
      domainId: "identity",
      front: "When do you need a custom Azure role instead of a built-in role?",
      back: "When no built-in role matches the required permissions closely enough to satisfy least privilege. Custom roles define Actions, NotActions, DataActions, and AssignableScopes, and are stored in Microsoft Entra ID.",
    },
    {
      id: "az500-c2",
      domainId: "identity",
      front: "System-assigned vs user-assigned managed identity",
      back: "System-assigned is tied to one resource's lifecycle and is deleted with it. User-assigned is a standalone resource that can be attached to many resources and survives independently.",
    },
    {
      id: "az500-c3",
      domainId: "identity",
      front: "What does PIM 'eligible' mean?",
      back: "The user holds no permissions until they activate the role, optionally requiring MFA, justification, or approval, for a limited time window. This removes standing access.",
    },
    {
      id: "az500-c4",
      domainId: "network",
      front: "Service endpoint vs private endpoint",
      back: "Service endpoint keeps traffic on the Microsoft backbone but the PaaS service keeps its public IP and it cannot be used from on-premises. Private endpoint gives the service a private IP inside your VNet, reachable from on-premises over VPN or ExpressRoute.",
    },
    {
      id: "az500-c5",
      domainId: "network",
      front: "NSG rule evaluation order",
      back: "Rules are evaluated by priority (100–4096, lowest number first), but only rules matching source, destination, port, and protocol count. The first match wins and evaluation stops. Default rules allow VNet-to-VNet and deny all other inbound.",
    },
    {
      id: "az500-c6",
      domainId: "network",
      front: "Azure Firewall vs Application Gateway WAF vs Front Door WAF",
      back: "Azure Firewall is a regional L3–L7 network firewall for outbound and east-west filtering. Application Gateway WAF is a regional L7 reverse proxy. Front Door WAF is a global edge L7 service with CDN and global load balancing.",
    },
    {
      id: "az500-c7",
      domainId: "compute",
      front: "Azure Bastion vs just-in-time VM access",
      back: "Bastion provides RDP/SSH over TLS from the portal to VMs with no public IP. JIT leaves the public endpoint in place but opens the NSG port only on approved request for a limited time. They are often used together.",
    },
    {
      id: "az500-c8",
      domainId: "compute",
      front: "Azure Disk Encryption vs encryption at host",
      back: "ADE uses BitLocker or dm-crypt inside the guest OS and requires a key vault. Encryption at host encrypts on the Azure host before data reaches storage, covers temp disks and caches, and needs no in-guest agent.",
    },
    {
      id: "az500-c9",
      domainId: "compute",
      front: "Which storage protections defend against accidental or malicious deletion?",
      back: "Soft delete (recoverable window), versioning (previous versions retained), point-in-time restore, and immutability policies (locked WORM retention or legal hold) which even owners cannot bypass.",
    },
    {
      id: "az500-c10",
      domainId: "defender",
      front: "Azure Policy effects, from least to most restrictive",
      back: "Audit and AuditIfNotExists report only. Modify and DeployIfNotExists remediate. Deny blocks non-compliant deployments outright. Disabled turns the assignment off.",
    },
    {
      id: "az500-c11",
      domainId: "defender",
      front: "What is Defender for Cloud secure score?",
      back: "A weighted percentage of completed security controls across your assessed resources. Each control groups related recommendations and only awards points when every recommendation in it is satisfied for a resource.",
    },
    {
      id: "az500-c12",
      domainId: "defender",
      front: "Sentinel analytics rule types",
      back: "Scheduled (KQL on a recurring interval), Near-real-time/NRT (runs each minute), Microsoft security (creates incidents from other Microsoft alerts), Fusion (ML multi-stage attack detection), Threat intelligence, and Anomaly rules.",
    },
  ],

  resources: [
    {
      id: "az500-r1",
      title: "AZ-500 official study guide",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-500",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Authoritative skills-measured list with weights and the change log for every exam update.",
    },
    {
      id: "az500-r2",
      title: "AZ-500 free practice assessment",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/practice/assessment?assessment-type=practice&assessmentId=57",
      kind: "practice",
      provider: "Microsoft Learn",
      free: true,
      description: "Microsoft's own practice questions, styled like the real exam and mapped to skill areas.",
    },
    {
      id: "az500-r3",
      title: "Microsoft Azure Security Technologies learning path",
      url: "https://learn.microsoft.com/en-us/training/courses/az-500t00",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "The full self-paced module set that maps to the AZ-500 course outline.",
    },
    {
      id: "az500-r4",
      title: "Microsoft Cloud Security Benchmark (downloadable)",
      url: "https://learn.microsoft.com/en-us/security/benchmark/azure/overview",
      kind: "pdf",
      provider: "Microsoft",
      free: true,
      description: "Baseline control framework referenced throughout Defender for Cloud, available as a spreadsheet download.",
    },
    {
      id: "az500-r5",
      title: "Azure Well-Architected Framework — Security pillar",
      url: "https://learn.microsoft.com/en-us/azure/well-architected/security/",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Design principles behind many scenario questions on identity, segmentation, and data protection.",
    },
    {
      id: "az500-r6",
      title: "Exam Readiness Zone: AZ-500",
      url: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/?terms=AZ-500",
      kind: "video",
      provider: "Microsoft Learn",
      free: true,
      description: "Short video series walking through each skill area with exam-taking guidance.",
    },
    {
      id: "az500-r7",
      title: "Microsoft Learn sandbox and Azure free account",
      url: "https://azure.microsoft.com/en-us/free/",
      kind: "lab",
      provider: "Microsoft",
      free: true,
      description: "Hands-on environment for practising NSGs, Key Vault, Defender for Cloud, and Sentinel configuration.",
    },
    {
      id: "az500-r8",
      title: "KQL quick reference",
      url: "https://learn.microsoft.com/en-us/azure/data-explorer/kql-quick-reference",
      kind: "tool",
      provider: "Microsoft Learn",
      free: true,
      description: "Operator cheat sheet for the Sentinel analytics and hunting questions.",
    },
  ],

  studyPath: [
    {
      id: "az500-m1",
      title: "Identity and access foundations",
      estimatedHours: 8,
      domainIds: ["identity"],
      summary:
        "Get precise about who can do what in Azure: RBAC scope inheritance, custom role JSON, PIM activation, and the difference between app registrations, service principals, and managed identities.",
      outcomes: [
        "Explain how RBAC scope inheritance resolves conflicting assignments",
        "Write a custom role definition with correct Actions and AssignableScopes",
        "Configure PIM eligible assignments with approval and MFA on activation",
        "Choose between system-assigned and user-assigned managed identities",
      ],
      resourceIds: ["az500-r3", "az500-r5"],
    },
    {
      id: "az500-m2",
      title: "Network security and private access",
      estimatedHours: 12,
      domainIds: ["network"],
      summary:
        "Work outward from the subnet: NSG and ASG rule evaluation, routing with UDRs, then private access patterns and the edge services that protect public workloads.",
      outcomes: [
        "Predict the outcome of a given NSG rule set for a specific flow",
        "Choose between service endpoints, private endpoints, and Private Link services",
        "Place Azure Firewall, Application Gateway, and Front Door correctly in a topology",
        "Decide when DDoS Protection Standard is warranted",
      ],
      resourceIds: ["az500-r3", "az500-r7"],
    },
    {
      id: "az500-m3",
      title: "Protecting compute, storage, and data",
      estimatedHours: 10,
      domainIds: ["compute"],
      summary:
        "Secure administrative access to VMs, lock down AKS and container registries, and apply the right encryption and data-protection control for each storage and database scenario.",
      outcomes: [
        "Compare Bastion and JIT VM access and know when to use each",
        "Select the right disk encryption option for a stated requirement",
        "Map storage threats to soft delete, versioning, and immutability",
        "Distinguish TDE, Always Encrypted, and dynamic data masking",
      ],
      resourceIds: ["az500-r3", "az500-r7"],
    },
    {
      id: "az500-m4",
      title: "Governance, Defender for Cloud, and Sentinel",
      estimatedHours: 14,
      domainIds: ["defender"],
      summary:
        "The heaviest skill area. Cover Azure Policy effects and initiatives, Key Vault protection, secure score and compliance standards, workload protection plans, and Sentinel ingestion, detection, and automation.",
      outcomes: [
        "Choose the correct Azure Policy effect for an enforcement requirement",
        "Harden a key vault with soft delete, purge protection, and RBAC",
        "Interpret secure score and drive remediation from Inventory",
        "Build a Sentinel pipeline from data connector to analytics rule to automation rule",
      ],
      resourceIds: ["az500-r3", "az500-r4", "az500-r8"],
    },
  ],
};
