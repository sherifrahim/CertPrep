import type { Exam } from "../../types";
import { sc200Questions } from "./questions";
import { sc200ScenarioQuestions } from "./questions-scenario";
import { sc200Flashcards } from "./flashcards";

export const sc200: Exam = {
  id: "sc-200",
  code: "SC-200",
  title: "Microsoft Security Operations Analyst",
  tagline: "Triage, investigate, hunt, and automate across Defender XDR and Microsoft Sentinel.",
  description:
    "SC-200 validates that you can reduce organizational risk by performing triage, responding to incidents, hunting for threats, and engineering detections using Microsoft Defender XDR, Microsoft Sentinel, Microsoft Entra ID, Microsoft Purview, and Defender for Cloud workload protections — including hunting with KQL.",
  accent: "teal",
  skillsMeasuredAsOf: "2026-07-28",
  officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-200",
  studyGuideUrl:
    "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200",
  mock: { questionCount: 40, durationMin: 60, passPercent: 70 },

  domains: [
    {
      id: "operations",
      name: "Manage a security operations environment",
      weight: "40–45%",
      weightValue: 42.5,
      summary:
        "Automation in Defender XDR and Sentinel, Sentinel platform configuration and data retention, data connectors and ingestion, and detection engineering with analytics and custom detection rules.",
      objectives: [
        "Configure email and alert notifications in Microsoft Defender XDR",
        "Configure Defender for Endpoint advanced features, rules, and custom data collection",
        "Configure security policies for Defender for Endpoint, including attack surface reduction rules",
        "Manage automated investigation and response and automatic attack disruption",
        "Configure device groups, permissions, and automation levels in Defender for Endpoint",
        "Create and configure automation rules and playbooks in Microsoft Sentinel",
        "Specify Microsoft Sentinel roles and manage data retention across Analytics, Data lake, and XDR tiers",
        "Create workbooks and apply SOC optimization recommendations",
        "Select and configure data connectors, including Windows Security Events via AMA, Syslog, and CEF",
        "Configure analytics rules, including scheduled, NRT, threat intelligence, and machine learning",
        "Analyze attack vector coverage by using the MITRE ATT&CK matrix",
      ],
    },
    {
      id: "response",
      name: "Respond to security incidents",
      weight: "35–40%",
      weightValue: 37.5,
      summary:
        "Investigating and remediating incidents across Defender for Office 365, Purview, Defender for Cloud, Defender for Cloud Apps, Entra ID, Defender for Identity, and Sentinel — plus device-level response and Microsoft 365 activity investigation.",
      objectives: [
        "Investigate and remediate threats by using Microsoft Defender for Office 365",
        "Investigate and remediate threats or compromised entities identified by Microsoft Purview",
        "Investigate and remediate alerts from Defender for Cloud workload protections",
        "Investigate and remediate risks identified by Microsoft Defender for Cloud Apps",
        "Investigate and remediate compromised identities from Microsoft Entra ID and Defender for Identity",
        "Investigate incidents by using agentic AI, including embedded Microsoft Security Copilot",
        "Investigate complex multi-stage, multi-domain, and lateral movement attacks",
        "Manage security incidents by using case management",
        "Investigate device timelines and perform live response and investigation package collection",
        "Investigate threats by using Purview Audit, eDiscovery Content search, and Microsoft Graph activity logs",
      ],
    },
    {
      id: "hunting",
      name: "Perform threat hunting",
      weight: "20–25%",
      weightValue: 22.5,
      summary:
        "Proactive hunting with KQL across Defender XDR advanced hunting tables and the Sentinel platform, including hunting graphs, Sentinel Graph, Data lake KQL jobs, summary rules, and notebooks.",
      objectives: [
        "Identify the appropriate table to use in a KQL query",
        "Identify threats by using Kusto Query Language (KQL)",
        "Create Advanced Hunting queries",
        "Interpret threat analytics in Microsoft Defender XDR",
        "Create hunting graphs, including blast radius",
        "Analyze relationships between entities by using Sentinel Graph",
        "Create and monitor hunting queries",
        "Create and manage KQL jobs in Data lake and summary rule tables",
        "Hunt for threats by using Notebooks, including connection to the Sentinel MCP Server",
      ],
    },
  ],

  questions: [...sc200Questions, ...sc200ScenarioQuestions],
  flashcards: sc200Flashcards,

  resources: [
    {
      id: "sc200-r1",
      title: "SC-200 official study guide",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Skills-measured list with weights, audience profile, and the change log for each exam refresh.",
    },
    {
      id: "sc200-r2",
      title: "SC-200 free practice assessment",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-200/practice/assessment?assessment-type=practice&assessmentId=59",
      kind: "practice",
      provider: "Microsoft Learn",
      free: true,
      description: "Microsoft's official practice questions with explanations, mapped to skill areas.",
    },
    {
      id: "sc200-r3",
      title: "Microsoft Sentinel documentation",
      url: "https://learn.microsoft.com/en-us/azure/sentinel/",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Reference for connectors, analytics rules, automation, workbooks, and the data lake tiers.",
    },
    {
      id: "sc200-r4",
      title: "Advanced hunting schema reference",
      url: "https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-schema-tables",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Every advanced hunting table and column — the single most exam-relevant page for the hunting domain.",
    },
    {
      id: "sc200-r5",
      title: "KQL quick reference",
      url: "https://learn.microsoft.com/en-us/azure/data-explorer/kql-quick-reference",
      kind: "pdf",
      provider: "Microsoft Learn",
      free: true,
      description: "Downloadable operator cheat sheet covering the KQL you need for hunting questions.",
    },
    {
      id: "sc200-r6",
      title: "Microsoft Sentinel Training Lab",
      url: "https://github.com/Azure/Azure-Sentinel/tree/master/Workbooks",
      kind: "lab",
      provider: "Microsoft (GitHub)",
      free: true,
      description: "Community and Microsoft-maintained Sentinel content: workbooks, hunting queries, and playbook templates.",
    },
    {
      id: "sc200-r7",
      title: "MITRE ATT&CK matrix for enterprise",
      url: "https://attack.mitre.org/matrices/enterprise/",
      kind: "community",
      provider: "MITRE",
      free: true,
      description: "The tactic and technique taxonomy Sentinel maps detections against.",
    },
    {
      id: "sc200-r8",
      title: "Exam Readiness Zone",
      url: "https://learn.microsoft.com/en-us/shows/exam-readiness-zone/",
      kind: "video",
      provider: "Microsoft Learn",
      free: true,
      description: "Skill-area video walkthroughs with exam strategy from Microsoft trainers.",
    },
  ],

  studyPath: [
    {
      id: "sc200-m1",
      title: "Build the SOC platform",
      estimatedHours: 14,
      domainIds: ["operations"],
      summary:
        "The largest skill area. Configure Defender for Endpoint policies and automation levels, set up Sentinel roles and retention, wire up data connectors, and write analytics and custom detection rules.",
      outcomes: [
        "Choose the right data connector for a given log source",
        "Filter Windows event collection precisely with data collection rules",
        "Pick the correct analytics rule type for a latency requirement",
        "Split work correctly between automation rules and playbooks",
        "Read MITRE ATT&CK coverage to find detection gaps",
      ],
      resourceIds: ["sc200-r3", "sc200-r7"],
    },
    {
      id: "sc200-m2",
      title: "Incident response across the Microsoft stack",
      estimatedHours: 12,
      domainIds: ["response"],
      summary:
        "Learn which portal and which action resolves each class of incident — mail threats, identity compromise, cloud app risk, workload alerts — and how to run device-level response and M365 activity investigations.",
      outcomes: [
        "Remediate a delivered phishing campaign across all mailboxes",
        "Contain identity attacks including Golden Ticket and token theft",
        "Use live response and investigation packages appropriately",
        "Investigate historical activity with Purview Audit and Graph activity logs",
      ],
      resourceIds: ["sc200-r3", "sc200-r8"],
    },
    {
      id: "sc200-m3",
      title: "Threat hunting with KQL",
      estimatedHours: 10,
      domainIds: ["hunting"],
      summary:
        "Get fluent in the advanced hunting schema and the KQL operators that come up repeatedly, then extend into hunting graphs, Sentinel Graph, data lake KQL jobs, and notebooks.",
      outcomes: [
        "Select the correct table for a described hunting goal",
        "Write queries using summarize, arg_max, join, and time windows",
        "Convert a hunting query into a custom detection rule with required columns",
        "Interpret threat analytics reports and blast radius graphs",
      ],
      resourceIds: ["sc200-r4", "sc200-r5"],
    },
  ],
};
