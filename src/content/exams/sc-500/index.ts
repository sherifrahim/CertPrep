import type { Exam } from "../../types";
import { sc500Questions } from "./questions";
import { sc500ScenarioQuestions } from "./questions-scenario";
import { sc500CaseStudies, sc500CaseStudyQuestions } from "./case-studies";
import { sc500Flashcards } from "./flashcards";

export const sc500: Exam = {
  id: "sc-500",
  code: "SC-500",
  title: "Implementing End-to-End Security Controls for Cloud and AI Workloads",
  tagline: "Secure identity, data, network, compute, and AI workloads as a cloud and AI security engineer.",
  description:
    "SC-500 leads to the Cloud and AI Security Engineer Associate certification and is the successor to AZ-500. It validates that you can implement comprehensive security controls across identity, network, application, data, and compute in Azure and hybrid environments — and that you can secure the platforms, data, identities, and infrastructure used by AI workloads.",
  accent: "azure",
  skillsMeasuredAsOf: "2026-04-26",
  officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-500",
  studyGuideUrl:
    "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-500",
  mock: { questionCount: 40, durationMin: 60, passPercent: 70 },

  domains: [
    {
      id: "identity",
      name: "Manage identity, access, and governance",
      weight: "20–25%",
      weightValue: 22.5,
      summary:
        "Entra ID access controls including PIM, Conditional Access, MFA and passwordless, app identity and consent, managed identities; Key Vault deployment and access; and governance through Azure Policy, RBAC, resource locks, backup protection, and infrastructure as code.",
      objectives: [
        "Implement and configure Privileged Identity Management (PIM)",
        "Implement conditional access policies",
        "Implement authentication methods, including MFA and passwordless",
        "Implement identity for applications, including enterprise applications and app registrations",
        "Manage OAuth permission grants and consent settings",
        "Implement and configure managed identities for Azure resources",
        "Deploy Key Vault and configure its settings, access, and firewall",
        "Manage keys, secrets, and certificates",
        "Scan for secrets by using Defender CSPM and implement Defender for Key Vault",
        "Implement security controls by using Azure Policy, including custom definitions",
        "Evaluate regulatory compliance by using Microsoft Defender for Cloud",
        "Implement resource locks and manage built-in and custom role assignments",
        "Evaluate and remediate overprivileged access assignments by using Azure RBAC",
        "Configure security controls for backup protection by using Azure Backup",
        "Implement security controls by using infrastructure as code",
      ],
    },
    {
      id: "data-network",
      name: "Secure storage, databases, and networking",
      weight: "25–30%",
      weightValue: 27.5,
      summary:
        "Storage account security and access policies, Defender for Storage; Azure SQL platform security, auditing, and Defender for Databases; and network security through NSGs and ASGs, Virtual Network Manager, Virtual WAN, VPN, Entra Private Access, private endpoints and Private Link, and Azure Firewall.",
      objectives: [
        "Implement and configure security for storage accounts",
        "Configure Azure Storage firewall rules and manage access policies",
        "Implement Defender for Storage threat protection configurations",
        "Implement platform-level security configurations in Azure SQL",
        "Configure database auditing for Azure SQL Database and SQL Managed Instance",
        "Configure Defender for Databases across Azure database services",
        "Implement and manage network security groups (NSGs) and application security groups (ASGs)",
        "Implement network access policies by using Azure Virtual Network Manager",
        "Configure security for an Azure Virtual WAN and for VPN connections",
        "Implement and configure Microsoft Entra Private Access",
        "Configure private endpoints and Private Link services",
        "Implement and configure Azure Firewall",
        "Evaluate effective security rules by using Network Watcher diagnostics",
      ],
    },
    {
      id: "compute",
      name: "Secure compute",
      weight: "20–25%",
      weightValue: 22.5,
      summary:
        "Security for AI — Copilot and agent risk, DSPM, Entra Agent ID, AI Gateway, Defender for AI Services — plus servers and VMs with disk encryption, Bastion, JIT, Arc, Defender for Servers and trusted launch, and application platform services including AKS, containers, Functions, Logic Apps, App Service, WAF, and API Management.",
      objectives: [
        "Identify overexposure of data in SharePoint",
        "Identify risks related to Microsoft Copilot and AI apps by using Microsoft Purview DSPM",
        "Enable real-time protection for Microsoft Copilot Studio agents",
        "Implement conditional access for Microsoft Entra Agent ID and manage agent access",
        "Analyze blast radius for Entra Agent ID risks by using Defender XDR",
        "Configure and deploy AI Gateway in Azure API Management for Microsoft Foundry",
        "Enable Defender for AI Service in Defender for Cloud workload protection",
        "Configure guardrails for agent security in Foundry",
        "Implement and configure disk encryption and plan Azure Bastion",
        "Enable and enforce just-in-time (JIT) VM access",
        "Extend security controls to hybrid and multicloud servers by using Azure Arc",
        "Onboard servers to Defender for Servers and configure vulnerability scanning and EDR",
        "Implement and manage agentless scanning for VMs",
        "Configure secure boot, vTPM, integrity monitoring, and security type on a VM",
        "Enforce configuration by using Azure Machine Configuration",
        "Detect container misconfigurations and runtime risks by using Defender for Containers",
        "Implement security controls for AKS, ACR, ACI, Container Apps, Functions, Logic Apps, and App Service",
        "Implement Azure Web Application Firewall and back-end API protection by using API Management",
      ],
    },
    {
      id: "posture",
      name: "Manage and monitor security posture",
      weight: "20–25%",
      weightValue: 22.5,
      summary:
        "Defender for Cloud posture management with Defender CSPM, compliance frameworks, workload protection plans, multicloud connectors, vulnerability management and EASM; Microsoft Sentinel workspace setup, roles, connectors, collection, automation and retention; and Microsoft Security Copilot.",
      objectives: [
        "Identify security risks by using Defender CSPM",
        "Evaluate compliance against security frameworks by using Defender for Cloud",
        "Enable and configure Defender for Cloud workload protection plans",
        "Connect hybrid cloud and multicloud environments, including AWS and GCP",
        "Configure Microsoft Defender Vulnerability Management settings for Azure VMs",
        "Discover unprotected assets and vulnerabilities by using Defender EASM",
        "Create and connect workspaces and assign roles in Microsoft Sentinel",
        "Implement and use content hub solutions",
        "Configure Microsoft data connectors for Azure resources",
        "Implement syslog and Common Event Format (CEF) event collections",
        "Implement collection of Windows Security events by using data collection rules, including WEF",
        "Create custom log tables in the workspace to store ingested data",
        "Implement automation rules and playbooks in Microsoft Sentinel",
        "Implement data retention in Microsoft Sentinel data stores",
        "Query Microsoft Purview Audit in Defender XDR",
        "Configure workspaces, permissions, roles, plugins, and agents in Microsoft Security Copilot",
      ],
    },
  ],

  questions: [...sc500Questions, ...sc500ScenarioQuestions, ...sc500CaseStudyQuestions],
  caseStudies: sc500CaseStudies,
  flashcards: sc500Flashcards,

  resources: [
    { id: "sc500-r1", title: "SC-500 official study guide", url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-500", kind: "official", provider: "Microsoft Learn", free: true, description: "Authoritative skills-measured list with weights — the source of truth for exam scope." },
    { id: "sc500-r2", title: "Cloud and AI Security Engineer Associate", url: "https://learn.microsoft.com/en-us/credentials/certifications/cloud-and-ai-security-engineer-associate", kind: "official", provider: "Microsoft Learn", free: true, description: "Certification page with training paths and the route from AZ-500." },
    { id: "sc500-r3", title: "Microsoft Defender for Cloud documentation", url: "https://learn.microsoft.com/en-us/azure/defender-for-cloud/", kind: "official", provider: "Microsoft Learn", free: true, description: "Defender CSPM, attack paths, workload protection plans, and multicloud connectors." },
    { id: "sc500-r4", title: "Microsoft Purview DSPM for AI", url: "https://learn.microsoft.com/en-us/purview/dspm-for-ai", kind: "official", provider: "Microsoft Learn", free: true, description: "Discovery, data risk assessments, and one-click policies for Copilot and other AI apps." },
    { id: "sc500-r5", title: "AI gateway capabilities in API Management", url: "https://learn.microsoft.com/en-us/azure/api-management/genai-gateway-capabilities", kind: "official", provider: "Microsoft Learn", free: true, description: "Token limits, semantic caching, and policy for model endpoint traffic." },
    { id: "sc500-r6", title: "Microsoft Sentinel documentation", url: "https://learn.microsoft.com/en-us/azure/sentinel/", kind: "official", provider: "Microsoft Learn", free: true, description: "Workspaces, connectors, data collection rules, automation, and the data lake tiers." },
    { id: "sc500-r7", title: "Microsoft Cloud Security Benchmark", url: "https://learn.microsoft.com/en-us/security/benchmark/azure/overview", kind: "pdf", provider: "Microsoft", free: true, description: "Baseline control framework behind many Defender for Cloud recommendations." },
    { id: "sc500-r8", title: "Azure free account", url: "https://azure.microsoft.com/en-us/free/", kind: "lab", provider: "Microsoft", free: true, description: "Hands-on environment for practising Key Vault, private endpoints, Defender, and Sentinel." },
  ],

  studyPath: [
    {
      id: "sc500-m1",
      title: "Identity, secrets, and governance",
      estimatedHours: 10,
      domainIds: ["identity"],
      summary:
        "Start with who can do what: PIM and Conditional Access, app identity and consent, managed identities and federation, then Key Vault and the governance controls that enforce the baseline.",
      outcomes: [
        "Remove standing access with PIM eligible assignments",
        "Choose between managed identity, federation, and app credentials",
        "Harden a key vault with RBAC, purge protection, and firewall settings",
        "Pick the correct Azure Policy effect for an enforcement requirement",
      ],
      resourceIds: ["sc500-r1", "sc500-r7"],
    },
    {
      id: "sc500-m2",
      title: "Data and network security",
      estimatedHours: 12,
      domainIds: ["data-network"],
      summary:
        "Lock down storage and databases, then work outward through NSGs and ASGs, Virtual Network Manager, private access patterns, and the firewall and WAF services protecting public workloads.",
      outcomes: [
        "Force Entra authentication on storage by disabling shared key access",
        "Choose between service endpoints, private endpoints, and Private Link",
        "Explain why a private endpoint needs a private DNS zone",
        "Design central egress inspection with a hub firewall and UDRs",
      ],
      resourceIds: ["sc500-r3", "sc500-r6"],
    },
    {
      id: "sc500-m3",
      title: "Compute and AI workload security",
      estimatedHours: 12,
      domainIds: ["compute"],
      summary:
        "The distinctive part of SC-500. Cover server and container hardening, then AI security: Copilot oversharing and DSPM, Entra Agent ID and Conditional Access for agents, AI Gateway, and Defender for AI Services.",
      outcomes: [
        "Extend Defender for Servers to AWS and on-premises using Azure Arc",
        "Give AKS pods least-privilege identities with Workload ID",
        "Measure and remediate Copilot oversharing before a rollout",
        "Centralise model endpoint traffic behind an AI gateway",
      ],
      resourceIds: ["sc500-r4", "sc500-r5"],
    },
    {
      id: "sc500-m4",
      title: "Posture, monitoring, and Security Copilot",
      estimatedHours: 10,
      domainIds: ["posture"],
      summary:
        "Bring it together: Defender CSPM and attack paths, compliance standards, multicloud connectors, then Sentinel ingestion, automation and retention, and Security Copilot setup.",
      outcomes: [
        "Query the security graph with cloud security explorer",
        "Choose the right ingestion path for Windows, syslog, CEF, and custom logs",
        "Split work correctly between automation rules and playbooks",
        "Balance retention cost across analytics and data lake tiers",
      ],
      resourceIds: ["sc500-r3", "sc500-r6"],
    },
  ],
};
