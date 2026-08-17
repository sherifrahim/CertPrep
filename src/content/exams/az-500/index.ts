import type { Exam } from "../../types";
import { az500Questions } from "./questions";
import { az500ScenarioQuestions } from "./questions-scenario";
import { az500Flashcards } from "./flashcards";

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

  questions: [...az500Questions, ...az500ScenarioQuestions],
  flashcards: az500Flashcards,

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
