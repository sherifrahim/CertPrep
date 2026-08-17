import type { CaseStudy, Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc200CaseStudies: CaseStudy[] = [
  {
    id: "fabrikam-soc",
    title: "Fabrikam Inc — building out the security operations centre",
    summary:
      "A retailer must ingest the right telemetry, engineer detections, and respond to an active intrusion across identity, endpoint, and email.",
    sections: [
      {
        heading: "Overview",
        body: "Fabrikam Inc is a retailer with 4,000 employees and 180 stores. A new security operations centre has been formed and must reach an initial operating capability within one quarter.\n\nFabrikam uses Microsoft 365 E5 and has Microsoft Defender XDR and Microsoft Sentinel licensed but only partially configured.",
      },
      {
        heading: "Existing environment",
        body: "Identity and endpoints:\n• A single Microsoft Entra tenant, synchronised from on-premises Active Directory. Two domain controllers run in a datacentre.\n• 4,200 Windows devices are onboarded to Microsoft Defender for Endpoint. 60 Linux servers are not onboarded.\n• A dedicated server named SCAN01 performs authenticated vulnerability scans every night.\n\nData sources:\n• Microsoft Sentinel is enabled on a workspace named law-soc. Only the Microsoft Entra ID connector is configured.\n• Perimeter firewalls emit Common Event Format messages and currently send them nowhere.\n• Firewall logs must be retained for seven years for PCI purposes, but analysts only query the last 60 days.\n\nCurrent incidents:\n• Analysts report that SCAN01 generates around 40 alerts titled 'Suspicious network scanning activity' every night.\n• A finance user, Ana, received a phishing email that reached 220 mailboxes. Several recipients clicked the link.\n• Microsoft Defender for Identity has raised a 'Suspected Golden Ticket usage' alert referencing the corporate domain.",
      },
      {
        heading: "Requirements",
        body: "Ingestion:\n• Windows security events from the domain controllers must be collected, filtered to specific event IDs to control cost.\n• Firewall CEF logs must be ingested and retained for seven years at the lowest possible cost, while remaining queryable by analytics rules for the last 60 days.\n\nDetections:\n• Nightly SCAN01 alerts must stop reaching the queue, without losing SCAN01 telemetry for hunting and without weakening detection on other devices.\n• A new detection must run with the lowest possible latency and must not require a schedule to be defined.\n• The SOC must be able to demonstrate which MITRE ATT&CK techniques are covered by current detections.\n\nResponse:\n• The phishing message must be removed from all mailboxes that received it, and the SOC must identify which recipients clicked the link.\n• The Golden Ticket alert must be contained.\n• Analysts must be able to run forensic commands on a compromised endpoint while preventing it reaching other systems, without losing volatile evidence.",
      },
    ],
  },
];

export const sc200CaseStudyQuestions: Question[] = [
  {
    id: "sc200-cs1-q1",
    domainId: "operations",
    caseStudyId: "fabrikam-soc",
    type: "single",
    prompt:
      "You need to collect Windows security events from the domain controllers, filtered to specific event IDs. What should you configure?",
    options: [
      { id: "a", text: "The Windows Security Events via AMA connector with a data collection rule using an XPath filter" },
      { id: "b", text: "The Syslog via AMA connector with a facility filter" },
      { id: "c", text: "A custom table populated by the Logs Ingestion API" },
      { id: "d", text: "Diagnostic settings on the domain controller resources" },
    ],
    correct: ["a"],
    explanation:
      "The Windows Security Events via AMA connector collects Windows event logs, and its data collection rule accepts an XPath filter to restrict collection to chosen event IDs. Syslog covers Linux, and diagnostic settings apply to Azure resources rather than in-guest Windows logs.",
    difficulty: 2,
    reference: { label: "Windows Security Events via AMA", url: `${docs}/azure/sentinel/data-connectors/windows-security-events-via-ama` },
  },
  {
    id: "sc200-cs1-q2",
    domainId: "operations",
    caseStudyId: "fabrikam-soc",
    type: "single",
    prompt:
      "You need to meet the firewall log retention requirement. What should you implement?",
    options: [
      { id: "a", text: "Ingest the CEF logs into the Microsoft Sentinel data lake tier and use a KQL job to promote the last 60 days into the analytics tier" },
      { id: "b", text: "Ingest all CEF logs into the analytics tier and set workspace retention to seven years" },
      { id: "c", text: "Export the firewall logs to a storage account and query them with externaldata only" },
      { id: "d", text: "Enable a summary rule and discard the raw firewall logs" },
    ],
    correct: ["a"],
    explanation:
      "The data lake tier gives cost-effective retention up to 12 years, covering the PCI obligation, and a KQL job promotes the recent window into the analytics tier where analytics rules can reach it. Seven years in the analytics tier is exactly the cost the requirement rules out.",
    difficulty: 3,
    reference: { label: "Sentinel data lake overview", url: `${docs}/azure/sentinel/datalake/sentinel-lake-overview` },
  },
  {
    id: "sc200-cs1-q3",
    domainId: "operations",
    caseStudyId: "fabrikam-soc",
    type: "single",
    prompt:
      "You need to stop the nightly SCAN01 alerts while meeting the stated constraints. What should you do?",
    options: [
      { id: "a", text: "Create an alert tuning rule that suppresses alerts with that title when the device is SCAN01" },
      { id: "b", text: "Offboard SCAN01 from Microsoft Defender for Endpoint" },
      { id: "c", text: "Set the automation level for SCAN01's device group to no automated response" },
      { id: "d", text: "Add SCAN01 to the exclusion list for all attack surface reduction rules" },
    ],
    correct: ["a"],
    explanation:
      "Alert tuning suppresses only alerts matching the device and title, so other devices keep full detection and SCAN01's telemetry stays available for hunting. Offboarding loses the telemetry, and automation level governs remediation rather than alert generation.",
    difficulty: 2,
    reference: { label: "Alert tuning", url: `${docs}/defender-xdr/investigate-alerts` },
  },
  {
    id: "sc200-cs1-q4",
    domainId: "operations",
    caseStudyId: "fabrikam-soc",
    type: "single",
    prompt:
      "Which analytics rule type meets the requirement for lowest latency with no schedule to define?",
    options: [
      { id: "a", text: "A near-real-time (NRT) rule" },
      { id: "b", text: "A scheduled query rule with a five-minute frequency" },
      { id: "c", text: "A Fusion rule" },
      { id: "d", text: "A Microsoft security rule" },
    ],
    correct: ["a"],
    explanation:
      "NRT rules run once per minute on a fixed cadence you do not configure, which is precisely 'lowest latency, no schedule required'. Scheduled rules require you to define frequency, and Fusion and Microsoft security rules serve different purposes.",
    difficulty: 2,
    reference: { label: "Near-real-time detection rules", url: `${docs}/azure/sentinel/near-real-time-rules` },
  },
  {
    id: "sc200-cs1-q5",
    domainId: "hunting",
    caseStudyId: "fabrikam-soc",
    type: "statements",
    prompt:
      "You must report on detection coverage and investigate the phishing campaign. For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Sentinel's MITRE ATT&CK page shows which techniques your active analytics rules cover.", correct: true },
      { id: "b", text: "EmailUrlInfo joined to EmailEvents identifies every recipient who received the malicious link.", correct: true },
      { id: "c", text: "UrlClickEvents identifies which recipients actually clicked the link.", correct: true },
      { id: "d", text: "DeviceLogonEvents is the correct table for finding who received the email.", correct: false },
    ],
    correct: ["a", "b", "c"],
    explanation:
      "The MITRE page maps active rules and hunting queries onto the matrix. EmailUrlInfo lists URLs in messages and joins to EmailEvents on NetworkMessageId for recipients, while UrlClickEvents records the subset who clicked through Safe Links. DeviceLogonEvents covers sign-ins and is unrelated to mail delivery.",
    difficulty: 2,
    reference: { label: "Advanced hunting schema", url: `${docs}/defender-xdr/advanced-hunting-schema-tables` },
  },
  {
    id: "sc200-cs1-q6",
    domainId: "response",
    caseStudyId: "fabrikam-soc",
    type: "single",
    prompt:
      "You need to remove the phishing message from all 220 mailboxes. What should you use?",
    options: [
      { id: "a", text: "Threat Explorer, selecting the messages and taking a soft delete or purge action" },
      { id: "b", text: "A mail flow rule blocking the sender" },
      { id: "c", text: "An eDiscovery content search with export" },
      { id: "d", text: "A Safe Links policy update" },
    ],
    correct: ["a"],
    explanation:
      "Threat Explorer can act on already-delivered mail across every affected mailbox. Mail flow rules and Safe Links policies only influence future messages, and eDiscovery locates content for legal purposes rather than remediating delivery.",
    difficulty: 2,
    reference: { label: "Threat Explorer", url: `${docs}/defender-office-365/threat-explorer-threat-hunting` },
  },
  {
    id: "sc200-cs1-q7",
    domainId: "response",
    caseStudyId: "fabrikam-soc",
    type: "ordering",
    prompt:
      "You need to contain the Golden Ticket alert. Arrange the actions in the correct order.",
    steps: [
      { id: "a", text: "Confirm the alert and identify the affected domain" },
      { id: "b", text: "Reset the krbtgt account password once" },
      { id: "c", text: "Allow Active Directory replication to complete" },
      { id: "d", text: "Reset the krbtgt account password a second time" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Kerberos retains the current and previous krbtgt key, so one reset leaves forged tickets valid. Two resets are required, with replication completing between them — otherwise domain controllers that have not received the first change cannot validate legitimate tickets.",
    difficulty: 3,
    reference: { label: "Defender for Identity alerts", url: `${docs}/defender-for-identity/persistence-privilege-escalation-alerts` },
  },
  {
    id: "sc200-cs1-q8",
    domainId: "response",
    caseStudyId: "fabrikam-soc",
    type: "meets-goal",
    scenario:
      "An endpoint used by Ana shows signs of active credential theft. Analysts must run forensic commands on it, prevent it reaching other systems, and preserve volatile evidence.",
    prompt:
      "Solution: You isolate the device using the standard isolation action and then open a live response session.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "Standard isolation blocks general network traffic while preserving the Defender service channel, so lateral movement stops but live response continues to work and the machine stays powered on, keeping volatile evidence intact.",
    difficulty: 2,
    reference: { label: "Response actions on a device", url: `${docs}/defender-endpoint/respond-machine-alerts` },
  },
];
