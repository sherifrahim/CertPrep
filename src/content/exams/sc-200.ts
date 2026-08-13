import type { Exam } from "../types";

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

  questions: [
    {
      id: "sc200-q1",
      domainId: "operations",
      type: "single",
      prompt:
        "You need a Microsoft Sentinel detection that runs every minute against incoming data with the lowest possible latency, without you defining a query schedule. Which analytics rule type should you create?",
      options: [
        { id: "a", text: "Scheduled query rule" },
        { id: "b", text: "Near-real-time (NRT) rule" },
        { id: "c", text: "Fusion rule" },
        { id: "d", text: "Microsoft security rule" },
      ],
      correct: ["b"],
      explanation:
        "NRT rules run once per minute on a fixed cadence you do not configure, giving the lowest detection latency. Scheduled rules require you to define frequency and lookback. Fusion uses machine learning to correlate multi-stage attacks, and Microsoft security rules simply create Sentinel incidents from alerts raised by other Microsoft products.",
      difficulty: 2,
      reference: {
        label: "Near-real-time detection rules",
        url: "https://learn.microsoft.com/en-us/azure/sentinel/near-real-time-rules",
      },
    },
    {
      id: "sc200-q2",
      domainId: "operations",
      type: "single",
      prompt:
        "Security events from on-premises Windows domain controllers must be ingested into Microsoft Sentinel, and you need to control exactly which event IDs are collected. What should you configure?",
      options: [
        { id: "a", text: "The Windows Security Events via AMA connector with a data collection rule" },
        { id: "b", text: "The Syslog via AMA connector" },
        { id: "c", text: "The Common Event Format (CEF) via AMA connector" },
        { id: "d", text: "A custom log table populated by the Logs Ingestion API" },
      ],
      correct: ["a"],
      explanation:
        "The Windows Security Events via AMA connector uses the Azure Monitor Agent, and its data collection rule lets you pick a preset tier or supply an XPath filter for specific event IDs. Syslog and CEF connectors handle Linux and network appliance formats, not Windows event logs. A custom log table would require you to build the collection pipeline yourself.",
      difficulty: 2,
      reference: {
        label: "Windows Security Events via AMA connector",
        url: "https://learn.microsoft.com/en-us/azure/sentinel/data-connectors/windows-security-events-via-ama",
      },
    },
    {
      id: "sc200-q3",
      domainId: "operations",
      type: "single",
      prompt:
        "In Microsoft Defender for Endpoint, you want a specific group of high-value servers to have alerts investigated automatically but never remediated without an analyst approving the action. What should you configure?",
      options: [
        { id: "a", text: "Set the device group's automation level to Full — remediate threats automatically" },
        { id: "b", text: "Set the device group's automation level to Semi — require approval for all remediation" },
        { id: "c", text: "Disable automated investigation for the device group" },
        { id: "d", text: "Add the servers to the exclusion list for attack surface reduction rules" },
      ],
      correct: ["b"],
      explanation:
        "Semi-automation levels run the automated investigation to completion but hold remediation actions in the Action center pending analyst approval. Full automation remediates without approval, disabling investigation removes the analysis entirely, and ASR exclusions are unrelated to investigation behaviour.",
      difficulty: 2,
      reference: {
        label: "Automation levels in automated investigation",
        url: "https://learn.microsoft.com/en-us/defender-endpoint/automation-levels",
      },
    },
    {
      id: "sc200-q4",
      domainId: "operations",
      type: "multi",
      prompt:
        "Which two actions can a Microsoft Sentinel automation rule perform directly, without invoking a playbook? (Choose two.)",
      options: [
        { id: "a", text: "Change the severity of an incident" },
        { id: "b", text: "Assign an owner to an incident" },
        { id: "c", text: "Post an adaptive card to a Microsoft Teams channel" },
        { id: "d", text: "Isolate a device in Microsoft Defender for Endpoint" },
      ],
      correct: ["a", "b"],
      explanation:
        "Automation rules natively change incident properties such as severity, status, owner, and tags, and can suppress incidents. Actions that reach into other services — posting to Teams or isolating a device — require a playbook (Logic App), which an automation rule can call.",
      difficulty: 2,
      reference: {
        label: "Automation rules in Microsoft Sentinel",
        url: "https://learn.microsoft.com/en-us/azure/sentinel/automate-incident-handling-with-automation-rules",
      },
    },
    {
      id: "sc200-q5",
      domainId: "response",
      type: "single",
      prompt:
        "A phishing email bypassed filtering and was delivered to 200 mailboxes. You must remove the message from all of those mailboxes. Which Microsoft Defender for Office 365 capability should you use?",
      options: [
        { id: "a", text: "Threat Explorer with a soft delete purge action" },
        { id: "b", text: "A mail flow rule that blocks the sender" },
        { id: "c", text: "Safe Links policy update" },
        { id: "d", text: "Content search in eDiscovery" },
      ],
      correct: ["a"],
      explanation:
        "Threat Explorer (or Advanced Hunting) lets you select the delivered messages and take action to soft delete or purge them from every mailbox, which is exactly the remediation required. Mail flow rules and Safe Links only affect future messages, and eDiscovery Content search locates content for investigation but is not the remediation path for mail removal.",
      difficulty: 2,
      reference: {
        label: "Threat hunting in Threat Explorer",
        url: "https://learn.microsoft.com/en-us/defender-office-365/threat-explorer-threat-hunting",
      },
    },
    {
      id: "sc200-q6",
      domainId: "response",
      type: "single",
      prompt:
        "During an investigation you must collect forensic artifacts from a compromised Windows endpoint and run commands on it interactively from the Microsoft Defender portal. Which capability should you use?",
      options: [
        { id: "a", text: "Live response" },
        { id: "b", text: "Device isolation" },
        { id: "c", text: "Automated investigation and response" },
        { id: "d", text: "Advanced hunting" },
      ],
      correct: ["a"],
      explanation:
        "Live response gives an analyst a remote shell on the device to run commands, collect files, and execute scripts from the library. Isolation cuts network connectivity but gives no interactive access. AIR runs predefined playbooks automatically, and advanced hunting queries telemetry rather than touching the device.",
      difficulty: 1,
      reference: {
        label: "Investigate entities with live response",
        url: "https://learn.microsoft.com/en-us/defender-endpoint/live-response",
      },
    },
    {
      id: "sc200-q7",
      domainId: "response",
      type: "single",
      prompt:
        "Microsoft Defender for Identity raises an alert indicating a Golden Ticket attack. Which action is the most appropriate immediate containment step?",
      options: [
        { id: "a", text: "Reset the krbtgt account password twice" },
        { id: "b", text: "Disable the affected user account only" },
        { id: "c", text: "Force a password reset for all domain administrators" },
        { id: "d", text: "Rebuild the domain controller from backup" },
      ],
      correct: ["a"],
      explanation:
        "A Golden Ticket is forged using the krbtgt account's hash, so any existing forged ticket remains valid until that key changes. Resetting krbtgt twice (allowing replication between resets) invalidates the forged tickets. Disabling a single user or resetting admin passwords does not revoke tickets already signed with the stolen key.",
      difficulty: 3,
      reference: {
        label: "Defender for Identity security alerts",
        url: "https://learn.microsoft.com/en-us/defender-for-identity/persistence-privilege-escalation-alerts",
      },
    },
    {
      id: "sc200-q8",
      domainId: "response",
      type: "single",
      prompt:
        "You need to determine who accessed and downloaded a specific SharePoint file over the past 90 days, including the client IP addresses. Which tool should you use?",
      options: [
        { id: "a", text: "Microsoft Purview Audit search" },
        { id: "b", text: "Activity explorer" },
        { id: "c", text: "Microsoft Defender for Cloud Apps file policy" },
        { id: "d", text: "Microsoft Sentinel workbook" },
      ],
      correct: ["a"],
      explanation:
        "Purview Audit records tenant-wide user and admin activity, including FileAccessed and FileDownloaded events with the acting user, timestamp, and client IP, and supports searching historical records. Activity explorer focuses on labelled-content activity, Defender for Cloud Apps file policies govern rather than retrospectively audit, and a Sentinel workbook only visualizes data already ingested.",
      difficulty: 2,
      reference: {
        label: "Search the audit log",
        url: "https://learn.microsoft.com/en-us/purview/audit-search",
      },
    },
    {
      id: "sc200-q9",
      domainId: "hunting",
      type: "single",
      prompt:
        "In Microsoft Defender XDR advanced hunting, which table should you query to find process creation events on onboarded endpoints?",
      options: [
        { id: "a", text: "DeviceProcessEvents" },
        { id: "b", text: "DeviceEvents" },
        { id: "c", text: "DeviceNetworkEvents" },
        { id: "d", text: "DeviceLogonEvents" },
      ],
      correct: ["a"],
      explanation:
        "DeviceProcessEvents contains process creation telemetry, including FileName, ProcessCommandLine, and InitiatingProcessFileName. DeviceEvents is a catch-all for miscellaneous event types, DeviceNetworkEvents covers connections, and DeviceLogonEvents covers sign-in activity.",
      difficulty: 1,
      reference: {
        label: "Advanced hunting schema reference",
        url: "https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-schema-tables",
      },
    },
    {
      id: "sc200-q10",
      domainId: "hunting",
      type: "single",
      prompt:
        "Which KQL operator should you use to return only the first row for each distinct DeviceId, ordered by the most recent Timestamp?",
      options: [
        { id: "a", text: "summarize arg_max(Timestamp, *) by DeviceId" },
        { id: "b", text: "distinct DeviceId, Timestamp" },
        { id: "c", text: "top 1 by Timestamp desc" },
        { id: "d", text: "project DeviceId, Timestamp | take 1" },
      ],
      correct: ["a"],
      explanation:
        "arg_max(Timestamp, *) inside summarize returns the full row holding the maximum Timestamp for each grouping key, which is exactly one latest row per DeviceId. distinct returns unique combinations rather than latest rows, and both top and take limit the whole result set to a single row overall.",
      difficulty: 3,
      reference: {
        label: "KQL quick reference",
        url: "https://learn.microsoft.com/en-us/azure/data-explorer/kql-quick-reference",
      },
    },
    {
      id: "sc200-q11",
      domainId: "hunting",
      type: "single",
      prompt:
        "You want to measure how well your current Sentinel analytics rules cover adversary techniques and identify gaps. Which Sentinel feature should you use?",
      options: [
        { id: "a", text: "The MITRE ATT&CK page" },
        { id: "b", text: "The Threat intelligence page" },
        { id: "c", text: "The Entity behavior page" },
        { id: "d", text: "The Watchlist page" },
      ],
      correct: ["a"],
      explanation:
        "Sentinel's MITRE ATT&CK page maps your active analytics rules and hunting queries onto the ATT&CK matrix so you can see which tactics and techniques have detection coverage and which do not. Threat intelligence manages indicators, entity behavior surfaces UEBA insights, and watchlists store reference data.",
      difficulty: 2,
      reference: {
        label: "Understand security coverage by the MITRE ATT&CK framework",
        url: "https://learn.microsoft.com/en-us/azure/sentinel/mitre-coverage",
      },
    },
    {
      id: "sc200-q12",
      domainId: "hunting",
      type: "multi",
      prompt:
        "Which two statements about custom detection rules in Microsoft Defender XDR are correct? (Choose two.)",
      options: [
        { id: "a", text: "They are created from an advanced hunting query that returns specific required columns" },
        { id: "b", text: "They can trigger response actions such as isolating a device or quarantining a file" },
        { id: "c", text: "They run only against data in Microsoft Sentinel workspaces" },
        { id: "d", text: "They can run at most once per day" },
      ],
      correct: ["a", "b"],
      explanation:
        "A custom detection rule is built from an advanced hunting query that must return Timestamp, ReportId, and an entity identifier column so alerts can be attributed. Such rules can also take automated response actions on affected devices, files, and users. They operate on Defender XDR data and support frequencies far more often than daily.",
      difficulty: 2,
      reference: {
        label: "Create custom detection rules",
        url: "https://learn.microsoft.com/en-us/defender-xdr/custom-detection-rules",
      },
    },
  ],

  flashcards: [
    {
      id: "sc200-c1",
      domainId: "operations",
      front: "Sentinel analytics rule types",
      back: "Scheduled (your KQL on your cadence), NRT (fixed one-minute runs), Microsoft security (promote other Microsoft alerts to incidents), Fusion (ML multi-stage attacks), Threat intelligence (match indicators), and Anomaly rules.",
    },
    {
      id: "sc200-c2",
      domainId: "operations",
      front: "Automation rule vs playbook",
      back: "Automation rules run natively in Sentinel on incident create/update and set properties (owner, severity, status, tags) or suppress incidents. Playbooks are Logic Apps that reach external services. Automation rules commonly call playbooks.",
    },
    {
      id: "sc200-c3",
      domainId: "operations",
      front: "Defender for Endpoint automation levels",
      back: "Full — remediate automatically. Semi — investigation runs, remediation waits for approval (variants scope approval to core folders or all folders). No automated response — investigation only.",
    },
    {
      id: "sc200-c4",
      domainId: "operations",
      front: "Which connector for which source?",
      back: "Windows Security Events via AMA for Windows event logs with DCR/XPath filtering. Syslog via AMA for Linux. CEF via AMA for network appliances. Logs Ingestion API plus a custom table for anything bespoke.",
    },
    {
      id: "sc200-c5",
      domainId: "operations",
      front: "What is attack surface reduction (ASR)?",
      back: "Defender for Endpoint rules that block common attack behaviours (e.g. Office child processes, credential theft from LSASS, obfuscated scripts). Each rule can be set to Audit, Block, or Warn, with per-file or per-folder exclusions.",
    },
    {
      id: "sc200-c6",
      domainId: "response",
      front: "Golden Ticket containment",
      back: "Reset the krbtgt password twice, allowing replication between resets. Forged tickets are signed with the krbtgt key, so nothing short of rotating that key invalidates them.",
    },
    {
      id: "sc200-c7",
      domainId: "response",
      front: "Live response vs isolation vs investigation package",
      back: "Live response gives an interactive remote shell. Isolation cuts network access while keeping Defender connectivity. The investigation package is a downloadable forensic bundle (processes, network, autoruns, event logs).",
    },
    {
      id: "sc200-c8",
      domainId: "response",
      front: "Where do you find historical M365 user activity?",
      back: "Microsoft Purview Audit — records sign-ins, file access, admin changes with user, timestamp, and IP. Audit (Premium) adds longer retention and higher-value events such as MailItemsAccessed.",
    },
    {
      id: "sc200-c9",
      domainId: "response",
      front: "What is automatic attack disruption?",
      back: "Defender XDR uses high-confidence signals to contain an in-progress attack automatically — disabling a compromised account or isolating a device — before an analyst responds, then surfaces the actions for review.",
    },
    {
      id: "sc200-c10",
      domainId: "hunting",
      front: "Core advanced hunting device tables",
      back: "DeviceProcessEvents (process creation), DeviceNetworkEvents (connections), DeviceLogonEvents (sign-ins), DeviceFileEvents (file activity), DeviceRegistryEvents (registry), DeviceEvents (miscellaneous), DeviceImageLoadEvents (module loads).",
    },
    {
      id: "sc200-c11",
      domainId: "hunting",
      front: "KQL: summarize vs distinct vs top",
      back: "summarize aggregates by grouping keys — use arg_max(Timestamp, *) for the latest full row per key. distinct returns unique column combinations. top N by Col returns N rows overall, not per group.",
    },
    {
      id: "sc200-c12",
      domainId: "hunting",
      front: "Required columns for a custom detection rule",
      back: "The advanced hunting query must return Timestamp, ReportId, and at least one entity column (DeviceId, DeviceName, AccountObjectId, SHA1, etc.) so the alert can be tied to an impacted asset.",
    },
  ],

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
