import type { Exam } from "../types";

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

  questions: [
    {
      id: "sc401-q1",
      domainId: "protection",
      type: "single",
      prompt:
        "Your organization stores a database of 50,000 customer records containing name, account number, and date of birth. You must detect documents that contain these exact customer values, not merely values that look like account numbers. What should you create?",
      options: [
        { id: "a", text: "A custom sensitive information type with a regular expression" },
        { id: "b", text: "An exact data match (EDM) based sensitive information type" },
        { id: "c", text: "A trainable classifier" },
        { id: "d", text: "A document fingerprint" },
      ],
      correct: ["b"],
      explanation:
        "EDM hashes and uploads a schema of your actual data values so detection matches real records rather than patterns, which dramatically reduces false positives at this scale. A regex-based custom SIT matches any value fitting the pattern. Trainable classifiers recognize categories of content by example, and document fingerprinting matches a specific form template.",
      difficulty: 2,
      reference: {
        label: "Learn about exact data match based SITs",
        url: "https://learn.microsoft.com/en-us/purview/sit-learn-about-exact-data-match-based-sits",
      },
    },
    {
      id: "sc401-q2",
      domainId: "protection",
      type: "single",
      prompt:
        "A sensitivity label must apply automatically to documents in SharePoint that contain credit card numbers, without any user action and without the file needing to be opened. What should you configure?",
      options: [
        { id: "a", text: "An auto-labeling policy for SharePoint sites" },
        { id: "b", text: "A label policy with a default label for the document library" },
        { id: "c", text: "Auto-labeling in the label settings for Office apps (client-side)" },
        { id: "d", text: "A retention label policy with auto-apply" },
      ],
      correct: ["a"],
      explanation:
        "Service-side auto-labeling policies scan content at rest in SharePoint, OneDrive, and Exchange and apply the label without requiring a user to open the file. Client-side auto-labeling only applies when a user works with the document in an Office app. A default label applies to new content only, and retention labels govern lifecycle, not protection.",
      difficulty: 2,
      reference: {
        label: "Apply a sensitivity label automatically",
        url: "https://learn.microsoft.com/en-us/purview/apply-sensitivity-label-automatically",
      },
    },
    {
      id: "sc401-q3",
      domainId: "protection",
      type: "single",
      prompt:
        "Which statement correctly describes what a container label applied to a Microsoft 365 Group or Teams team does?",
      options: [
        { id: "a", text: "It encrypts every file stored in the team's SharePoint site" },
        { id: "b", text: "It controls privacy, external user access, and unmanaged device access for the container, but does not protect the files inside it" },
        { id: "c", text: "It applies watermarks and headers to all documents in the site" },
        { id: "d", text: "It automatically applies the same label to all existing files in the site" },
      ],
      correct: ["b"],
      explanation:
        "Container labels govern the container's settings — privacy, guest access, and access from unmanaged devices — and do not encrypt, mark, or label the items stored inside. Protecting the files themselves requires item-level labels, applied manually or by auto-labeling.",
      difficulty: 2,
      reference: {
        label: "Use sensitivity labels with Teams, Groups, and SharePoint sites",
        url: "https://learn.microsoft.com/en-us/purview/sensitivity-labels-teams-groups-sites",
      },
    },
    {
      id: "sc401-q4",
      domainId: "protection",
      type: "single",
      prompt:
        "Users must be able to classify scanned image files (JPEG and PNG) that contain passport numbers. What must you enable so sensitive info types can detect content inside those images?",
      options: [
        { id: "a", text: "Optical character recognition (OCR) support" },
        { id: "b", text: "Document fingerprinting" },
        { id: "c", text: "The Purview Information Protection scanner" },
        { id: "d", text: "Advanced Message Encryption" },
      ],
      correct: ["a"],
      explanation:
        "OCR extracts text from images so sensitive info types can evaluate it. Document fingerprinting matches structured form templates, the scanner discovers and labels on-premises file shares (and itself relies on OCR for images), and Advanced Message Encryption is an email protection feature.",
      difficulty: 1,
      reference: {
        label: "Optical character recognition in Microsoft Purview",
        url: "https://learn.microsoft.com/en-us/purview/ocr-learn-about",
      },
    },
    {
      id: "sc401-q5",
      domainId: "dlp",
      type: "single",
      prompt:
        "Two DLP policies apply to the same SharePoint content. Policy A has a rule at priority 0 that blocks access, and Policy B has a rule at priority 1 that only sends a notification. Both rules match. What is the resulting action?",
      options: [
        { id: "a", text: "Only the notification is sent, because the lower-priority rule runs last and wins" },
        { id: "b", text: "The most restrictive block action is enforced, and the notification from the lower-priority rule can still apply" },
        { id: "c", text: "Both policies are skipped because of the conflict" },
        { id: "d", text: "The user is prompted to choose which policy applies" },
      ],
      correct: ["b"],
      explanation:
        "Rules are evaluated in priority order (0 is highest), and for restrictive actions the most restrictive outcome across matching rules is enforced — so the block applies. Other non-conflicting actions, such as notifications, can still take effect. DLP never silently skips matched policies or asks the user to arbitrate.",
      difficulty: 3,
      reference: {
        label: "Data loss prevention policy reference",
        url: "https://learn.microsoft.com/en-us/purview/dlp-policy-reference",
      },
    },
    {
      id: "sc401-q6",
      domainId: "dlp",
      type: "single",
      prompt:
        "You must prevent users from copying files containing sensitive data to USB drives on managed Windows devices. Which capability should you configure?",
      options: [
        { id: "a", text: "Endpoint DLP with a rule restricting the 'Copy to removable USB device' activity" },
        { id: "b", text: "A sensitivity label with encryption and the Extract permission removed" },
        { id: "c", text: "An attack surface reduction rule" },
        { id: "d", text: "A Defender for Cloud Apps session policy" },
      ],
      correct: ["a"],
      explanation:
        "Endpoint DLP monitors and restricts egress activities on onboarded devices, including copying to removable USB media, network shares, and unallowed apps. Sensitivity label encryption restricts what a recipient can do with the content but does not block the copy operation itself. ASR rules target exploit behaviour, and Defender for Cloud Apps session policies control browser sessions to cloud apps.",
      difficulty: 2,
      reference: {
        label: "Learn about Endpoint data loss prevention",
        url: "https://learn.microsoft.com/en-us/purview/endpoint-dlp-learn-about",
      },
    },
    {
      id: "sc401-q7",
      domainId: "dlp",
      type: "single",
      prompt:
        "A retention label with a 7-year retain-then-delete action and a retention policy with a 3-year delete-only action both apply to the same document. What happens to the document?",
      options: [
        { id: "a", text: "It is deleted after 3 years, because the shortest period wins" },
        { id: "b", text: "It is retained for 7 years and then deleted, because retention wins over deletion and the longest retention wins" },
        { id: "c", text: "It is retained indefinitely because the settings conflict" },
        { id: "d", text: "The retention policy is ignored entirely because labels always override policies" },
      ],
      correct: ["b"],
      explanation:
        "The principles of retention are, in order: retention wins over deletion, the longest retention period wins, explicit labels win over implicit policies, and the shortest deletion period wins only among deletion settings. Here retention for 7 years is preserved before any deletion can occur.",
      difficulty: 3,
      reference: {
        label: "The principles of retention",
        url: "https://learn.microsoft.com/en-us/purview/retention#the-principles-of-retention-or-what-takes-precedence",
      },
    },
    {
      id: "sc401-q8",
      domainId: "dlp",
      type: "single",
      prompt:
        "You need a retention policy whose scope automatically includes all users in the Legal department, updating as staff join and leave. What should you use?",
      options: [
        { id: "a", text: "An adaptive policy scope based on a user attribute query" },
        { id: "b", text: "A static policy scope with a distribution group" },
        { id: "c", text: "A retention label published to a security group" },
        { id: "d", text: "An eDiscovery hold on the Legal department mailboxes" },
      ],
      correct: ["a"],
      explanation:
        "Adaptive scopes query Entra ID attributes (such as Department) and re-evaluate membership automatically, so the policy follows organizational changes. Static scopes require manual maintenance even when pointed at a group. Publishing a label makes it available to users, and eDiscovery holds are for legal preservation rather than lifecycle policy.",
      difficulty: 2,
      reference: {
        label: "Adaptive or static policy scopes for retention",
        url: "https://learn.microsoft.com/en-us/purview/retention#adaptive-or-static-policy-scopes-for-retention",
      },
    },
    {
      id: "sc401-q9",
      domainId: "risk",
      type: "single",
      prompt:
        "You must detect employees who download large volumes of files shortly after their resignation date is recorded in HR. Which Insider Risk Management component provides the resignation signal?",
      options: [
        { id: "a", text: "An HR connector importing leaver data" },
        { id: "b", text: "A Defender for Endpoint integration" },
        { id: "c", text: "A physical badging connector" },
        { id: "d", text: "A DLP policy configured for Adaptive Protection" },
      ],
      correct: ["a"],
      explanation:
        "The Microsoft 365 HR connector imports events such as resignation and termination dates from your HR system, which is what triggers departing-employee policy templates. Defender for Endpoint supplies device signals, badging connectors supply physical access events, and Adaptive Protection consumes insider risk levels rather than producing HR signals.",
      difficulty: 2,
      reference: {
        label: "Import HR data for Insider Risk Management",
        url: "https://learn.microsoft.com/en-us/purview/import-hr-data",
      },
    },
    {
      id: "sc401-q10",
      domainId: "risk",
      type: "single",
      prompt:
        "An analyst must review which labelled documents were shared externally over the past 30 days, broken down by label and activity type. Which Purview tool should they use?",
      options: [
        { id: "a", text: "Activity explorer" },
        { id: "b", text: "Content explorer" },
        { id: "c", text: "Policy lookup" },
        { id: "d", text: "Records management disposition review" },
      ],
      correct: ["a"],
      explanation:
        "Activity explorer shows label-related activities over time — label applied, changed, downgraded, files shared externally — filterable by label and activity type. Content explorer shows the current inventory of labelled and sensitive content rather than activity history. Policy lookup explains which retention policies apply, and disposition review handles end-of-lifecycle approval.",
      difficulty: 2,
      reference: {
        label: "Get started with Activity explorer",
        url: "https://learn.microsoft.com/en-us/purview/data-classification-activity-explorer",
      },
    },
    {
      id: "sc401-q11",
      domainId: "risk",
      type: "single",
      prompt:
        "Your organization is rolling out Microsoft 365 Copilot. Leadership wants visibility into what sensitive data users are submitting to AI apps and whether oversharing risk exists. Which Purview capability addresses this?",
      options: [
        { id: "a", text: "Data Security Posture Management (DSPM) for AI" },
        { id: "b", text: "Communication compliance" },
        { id: "c", text: "Information barriers" },
        { id: "d", text: "Customer Lockbox" },
      ],
      correct: ["a"],
      explanation:
        "DSPM for AI provides discovery, reporting, and policies covering how sensitive data is used by AI applications, including Copilot and third-party AI apps, along with oversharing assessments. Communication compliance reviews messages for policy violations, information barriers restrict communication between groups, and Customer Lockbox governs Microsoft engineer access.",
      difficulty: 1,
      reference: {
        label: "Learn about Microsoft Purview DSPM for AI",
        url: "https://learn.microsoft.com/en-us/purview/dspm-for-ai",
      },
    },
    {
      id: "sc401-q12",
      domainId: "risk",
      type: "multi",
      prompt:
        "Which two statements about Adaptive Protection in Microsoft Purview are correct? (Choose two.)",
      options: [
        { id: "a", text: "It uses insider risk levels to dynamically apply stricter DLP policy actions to higher-risk users" },
        { id: "b", text: "It requires Insider Risk Management to be configured" },
        { id: "c", text: "It permanently blocks all sharing for any user who triggers one alert" },
        { id: "d", text: "It replaces the need for sensitivity labels" },
      ],
      correct: ["a", "b"],
      explanation:
        "Adaptive Protection links Insider Risk Management risk levels to DLP enforcement, so controls tighten for elevated-risk users and relax as risk subsides — which necessarily requires Insider Risk Management to be in place. It is dynamic rather than a permanent block, and it complements rather than replaces sensitivity labelling.",
      difficulty: 2,
      reference: {
        label: "Adaptive Protection in Microsoft Purview",
        url: "https://learn.microsoft.com/en-us/purview/insider-risk-management-adaptive-protection",
      },
    },
  ],

  flashcards: [
    {
      id: "sc401-c1",
      domainId: "protection",
      front: "Custom SIT vs EDM vs trainable classifier vs fingerprint",
      back: "Custom SIT matches patterns (regex, keywords, checksum). EDM matches your actual data values from an uploaded hashed schema. Trainable classifier recognizes a category of content from examples. Document fingerprinting matches a specific form template.",
    },
    {
      id: "sc401-c2",
      domainId: "protection",
      front: "Client-side vs service-side auto-labeling",
      back: "Client-side runs in Office apps as the user works and can recommend or apply a label. Service-side (auto-labeling policies) scans content at rest in SharePoint, OneDrive, and Exchange with no user involvement.",
    },
    {
      id: "sc401-c3",
      domainId: "protection",
      front: "Item label vs container label",
      back: "Item labels protect the file or email itself — encryption, content marking, access rights. Container labels govern the Team, Group, or site: privacy, guest access, unmanaged device access. Container labels do not protect the items inside.",
    },
    {
      id: "sc401-c4",
      domainId: "protection",
      front: "Purview Information Protection scanner",
      back: "An on-premises service that discovers, classifies, and labels files on Windows file shares and SharePoint Server, running in discovery-only or enforcement mode against your existing label policies.",
    },
    {
      id: "sc401-c5",
      domainId: "protection",
      front: "Message Encryption vs Advanced Message Encryption",
      back: "Purview Message Encryption protects mail to any recipient including external. Advanced adds revocation of sent mail and expiration policies for the branded OME portal experience.",
    },
    {
      id: "sc401-c6",
      domainId: "dlp",
      front: "DLP rule precedence",
      back: "Rules evaluate in priority order starting at 0. Across matching rules, the most restrictive action wins; non-conflicting actions such as notifications can still apply. Rule priority is set within a policy.",
    },
    {
      id: "sc401-c7",
      domainId: "dlp",
      front: "Endpoint DLP restricted activities",
      back: "Copy to removable USB, copy to network share, print, copy to clipboard, upload to unallowed cloud service domains, access by unallowed apps, and remote desktop transfer — each set to Audit, Block, or Block with override.",
    },
    {
      id: "sc401-c8",
      domainId: "dlp",
      front: "The principles of retention",
      back: "1) Retention wins over deletion. 2) The longest retention period wins. 3) Explicit (label) wins over implicit (policy). 4) Among deletion settings only, the shortest period wins.",
    },
    {
      id: "sc401-c9",
      domainId: "dlp",
      front: "Adaptive vs static policy scope",
      back: "Adaptive scopes query Entra ID attributes (department, country, custom attributes) and refresh membership automatically. Static scopes name specific locations or groups and need manual updates.",
    },
    {
      id: "sc401-c10",
      domainId: "risk",
      front: "Insider Risk Management policy templates",
      back: "Data theft by departing users, data leaks (general, priority users, disgruntled users), security policy violations, patient data misuse, risky browser usage, and forensic evidence templates — each pairs triggering events with indicators.",
    },
    {
      id: "sc401-c11",
      domainId: "risk",
      front: "Content explorer vs Activity explorer",
      back: "Content explorer is a current inventory: which items carry which labels or sensitive info types, and where they live. Activity explorer is a time series of label and DLP activities: applied, changed, downgraded, shared externally.",
    },
    {
      id: "sc401-c12",
      domainId: "risk",
      front: "What does DSPM for AI provide?",
      back: "Discovery and reporting of sensitive data flowing into AI apps (Copilot and third-party), oversharing assessments, and one-click policies that apply DLP, labelling, and insider risk controls to AI interactions.",
    },
  ],

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
