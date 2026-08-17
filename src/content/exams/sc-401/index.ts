import type { Exam } from "../../types";
import { sc401Questions } from "./questions";
import { sc401ScenarioQuestions } from "./questions-scenario";
import { sc401ExtraQuestions } from "./questions-extra";
import { sc401Flashcards } from "./flashcards";
import { sc401ExtraFlashcards } from "./flashcards-extra";

export const sc401: Exam = {
  id: "sc-401",
  code: "SC-401",
  title: "Administering Information Security in Microsoft 365",
  tagline: "Protect sensitive data with Microsoft Purview classification, DLP, retention, and insider risk.",
  description:
    "SC-401 validates that you can plan and implement information security for sensitive data using Microsoft Purview — protecting data in Microsoft 365 collaboration environments and in AI services through information protection, data loss prevention, retention, insider risk management, and alert investigation.",
  accent: "violet",
  skillsMeasuredAsOf: "2026-07-28",
  officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-401",
  studyGuideUrl:
    "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-401",
  mock: { questionCount: 40, durationMin: 60, passPercent: 70 },

  domains: [
    {
      id: "protection",
      name: "Implement information protection",
      weight: "30–35%",
      weightValue: 32.5,
      summary:
        "Data classification with sensitive info types, EDM, and trainable classifiers; sensitivity labels for items and containers with protection, marking, publishing, and auto-labeling; plus the Purview Information Protection client, scanner, and message encryption.",
      objectives: [
        "Translate sensitive information requirements into built-in or custom sensitive info types",
        "Create and manage custom sensitive info types and implement document fingerprinting",
        "Create and manage exact data match (EDM) based sensitive information types",
        "Create and manage trainable classifiers",
        "Monitor classification and label usage with Data explorer and Content explorer",
        "Configure optical character recognition (OCR) support for sensitive info types",
        "Define and create sensitivity labels for items and containers",
        "Configure protection settings, content marking, publishing, and auto-labeling policies",
        "Apply sensitivity labels to Teams, Microsoft 365 Groups, Power BI, and SharePoint",
        "Plan and implement the Purview Information Protection client and scanner",
        "Design and implement Purview Message Encryption and Advanced Message Encryption",
      ],
    },
    {
      id: "dlp",
      name: "Implement data loss prevention and retention",
      weight: "30–35%",
      weightValue: 32.5,
      summary:
        "DLP policy design, roles, rule precedence, and Adaptive Protection; Endpoint DLP device requirements, advanced rules, and just-in-time protection; and retention labels, policies, adaptive scopes, and content recovery.",
      objectives: [
        "Design data loss prevention policies based on organizational requirements",
        "Implement roles and permissions for data loss prevention",
        "Create and manage data loss prevention policies",
        "Configure data loss prevention policies for Adaptive Protection",
        "Interpret policy and rule precedence in data loss prevention",
        "Create file policies in Microsoft Defender for Cloud Apps by using a DLP policy",
        "Specify device requirements for Endpoint DLP, including extensions",
        "Configure advanced DLP rules for devices and Endpoint DLP settings",
        "Configure just-in-time protection and monitor endpoint activities",
        "Plan retention and disposition by using retention labels and adaptive policy scopes",
        "Configure retention label policies to publish and auto-apply labels",
        "Interpret policy precedence results, including using Policy lookup",
        "Create and configure retention policies and recover retained content",
      ],
    },
    {
      id: "risk",
      name: "Manage risks, alerts, and activities",
      weight: "30–35%",
      weightValue: 32.5,
      summary:
        "Insider Risk Management roles, connectors, policies, indicators, forensic evidence, and case workflow; alert and activity investigation with Purview Audit, Activity explorer, and eDiscovery; and protecting data used by AI services with DSPM for AI.",
      objectives: [
        "Implement roles and permissions for Insider Risk Management",
        "Plan and implement Insider Risk Management connectors and Defender for Endpoint integration",
        "Configure Insider Risk Management settings and policy indicators",
        "Select an appropriate policy template and create Insider Risk Management policies",
        "Manage forensic evidence settings and insider risk levels for Adaptive Protection",
        "Manage insider risk alerts, cases, and workflow including notice templates",
        "Assign Purview Audit (Premium) licenses and configure audit retention policies",
        "Investigate activities by using Purview Audit and Activity explorer",
        "Respond to DLP alerts and Purview alerts in the Microsoft Defender portal",
        "Perform searches by using eDiscovery",
        "Implement controls and DSPM for AI policies to protect content used by AI services",
      ],
    },
  ],

  questions: [...sc401Questions, ...sc401ScenarioQuestions, ...sc401ExtraQuestions],
  flashcards: [...sc401Flashcards, ...sc401ExtraFlashcards],

  resources: [
    {
      id: "sc401-r1",
      title: "SC-401 official study guide",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-401",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Skills-measured list with weights and the change log — the source of truth for exam scope.",
    },
    {
      id: "sc401-r2",
      title: "Microsoft Purview documentation",
      url: "https://learn.microsoft.com/en-us/purview/",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Full reference for classification, labelling, DLP, retention, insider risk, and DSPM for AI.",
    },
    {
      id: "sc401-r3",
      title: "SC-401 learning path",
      url: "https://learn.microsoft.com/en-us/training/courses/sc-401t00",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Self-paced modules aligned to the SC-401 course outline.",
    },
    {
      id: "sc401-r4",
      title: "Sensitive information type entity definitions",
      url: "https://learn.microsoft.com/en-us/purview/sit-sensitive-information-type-entity-definitions",
      kind: "pdf",
      provider: "Microsoft Learn",
      free: true,
      description: "Reference of every built-in SIT with its pattern, confidence levels, and proximity rules.",
    },
    {
      id: "sc401-r5",
      title: "The principles of retention",
      url: "https://learn.microsoft.com/en-us/purview/retention",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "The precedence rules behind almost every retention scenario question on the exam.",
    },
    {
      id: "sc401-r6",
      title: "Data loss prevention policy reference",
      url: "https://learn.microsoft.com/en-us/purview/dlp-policy-reference",
      kind: "official",
      provider: "Microsoft Learn",
      free: true,
      description: "Locations, conditions, exceptions, and actions available in DLP rules, including Endpoint DLP.",
    },
    {
      id: "sc401-r7",
      title: "Microsoft 365 trial tenant",
      url: "https://www.microsoft.com/en-us/microsoft-365/enterprise/office365-e5",
      kind: "lab",
      provider: "Microsoft",
      free: true,
      description: "E5 trial gives hands-on access to Purview features that are otherwise hard to practise.",
    },
    {
      id: "sc401-r8",
      title: "Security, compliance, and identity community hub",
      url: "https://techcommunity.microsoft.com/t5/security-compliance-and-identity/ct-p/MicrosoftSecurityandCompliance",
      kind: "community",
      provider: "Microsoft Tech Community",
      free: true,
      description: "Product team announcements and practitioner threads on Purview rollouts and gotchas.",
    },
  ],

  studyPath: [
    {
      id: "sc401-m1",
      title: "Classification and sensitivity labels",
      estimatedHours: 12,
      domainIds: ["protection"],
      summary:
        "Start with how Purview identifies sensitive content, then how labels apply protection to items and containers, and finish with the client, scanner, and message encryption.",
      outcomes: [
        "Choose between custom SIT, EDM, trainable classifier, and fingerprinting",
        "Configure label protection settings, marking, and publishing policies",
        "Distinguish client-side and service-side auto-labeling",
        "Explain what a container label does and does not protect",
      ],
      resourceIds: ["sc401-r2", "sc401-r4"],
    },
    {
      id: "sc401-m2",
      title: "DLP and retention",
      estimatedHours: 12,
      domainIds: ["dlp"],
      summary:
        "Design DLP policies and reason about rule precedence, extend enforcement to endpoints, then master retention labels, policies, adaptive scopes, and the precedence principles.",
      outcomes: [
        "Predict the outcome when multiple DLP rules match the same content",
        "Configure Endpoint DLP for USB, print, and cloud upload restrictions",
        "Apply the four principles of retention to a conflict scenario",
        "Choose adaptive over static scopes and use Policy lookup",
      ],
      resourceIds: ["sc401-r6", "sc401-r5"],
    },
    {
      id: "sc401-m3",
      title: "Insider risk, investigation, and AI data security",
      estimatedHours: 10,
      domainIds: ["risk"],
      summary:
        "Configure Insider Risk Management end to end, learn which investigation tool answers which question, and cover the newer DSPM for AI objectives.",
      outcomes: [
        "Select the right insider risk policy template and connectors",
        "Run the alert-to-case workflow including notice templates",
        "Choose between Content explorer, Activity explorer, Audit, and eDiscovery",
        "Configure DSPM for AI prerequisites, roles, and policies",
      ],
      resourceIds: ["sc401-r2", "sc401-r8"],
    },
  ],
};
