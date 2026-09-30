import type { CaseStudy, Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us/";

export const sc200HardCaseStudies: CaseStudy[] = [
  {
    id: "northwind-soc",
    title: "Northwind Traders — consolidating detection and response",
    summary:
      "A distribution company with branch offices, an existing Windows Event Forwarding estate and a threat intelligence platform is moving its detections onto Microsoft Sentinel and Defender XDR.",
    sections: [
      {
        heading: "Overview",
        body: "Northwind Traders distributes industrial equipment through a head office and 30 regional branches. The company has a Microsoft 365 E5 subscription, Microsoft Sentinel onboarded to the Microsoft Defender portal, Defender for Endpoint on all Windows devices, and Defender for Identity on the domain controllers.\n\nThe security team is small. It wants built-in content to keep working, wants to minimise administrative effort, and follows least privilege.",
      },
      {
        heading: "Existing environment",
        body: "Log collection:\n• Each branch has a Windows Event Collector server that receives events by Windows Event Forwarding from about 20 branch servers. The Azure Monitor Agent is installed on each collector.\n• The Windows Forwarded Events connector is enabled in Microsoft Sentinel.\n\nThreat intelligence:\n• A commercial threat intelligence platform (TIP) publishes indicators through a REST API. The team has no spare capacity to deploy or maintain extra connectors.\n\nData:\n• Historical firewall logs are held in the Microsoft Sentinel data lake tier. Analysts must occasionally run analytics-tier queries over the last 90 days of that data.",
      },
      {
        heading: "Requirements",
        body: "Detection:\n• The built-in Windows Security Events analytics rules must detect suspicious activity on the branch servers.\n\nThreat intelligence:\n• Indicators from the TIP must appear in Microsoft Sentinel without deploying a data connector.\n\nResponse:\n• Automatic attack disruption must not contain the two domain controllers, even in a high-confidence incident.\n\nInvestigation:\n• The SOC must be able to investigate suspicious API calls made to Microsoft Graph. The account that configures the logging must have the least privileged Microsoft Entra role possible.",
      },
    ],
  },
];

export const sc200HardCaseStudyQuestions: Question[] = [
  {
    id: "sc200-cs2-q1",
    domainId: "operations",
    caseStudyId: "northwind-soc",
    type: "single",
    prompt:
      "You need to meet the detection requirement. After enabling the built-in Windows Security Events rules, they do not match the branch servers' events. What is the most likely reason?",
    options: [
      { id: "a", text: "The events forwarded by WEF are written to WindowsEvent, but the rules query SecurityEvent" },
      { id: "b", text: "The Azure Monitor Agent cannot be installed on a Windows Event Collector server at all" },
      { id: "c", text: "Forwarded events are written to Syslog, so the rules must be rewritten for that table" },
      { id: "d", text: "Windows Event Forwarding drops security events unless the Common set has been selected" },
    ],
    correct: ["a"],
    explanation:
      "The Windows Forwarded Events connector writes events collected through Windows Event Forwarding to the WindowsEvent table, not SecurityEvent. Many built-in Windows Security Events rules query SecurityEvent, so they must be adapted, for example by using ASIM parsers.",
    difficulty: 3,
    reference: { label: "Windows Forwarded Events connector", url: `${docs}azure/sentinel/data-connectors/windows-forwarded-events` },
  },
  {
    id: "sc200-cs2-q2",
    domainId: "operations",
    caseStudyId: "northwind-soc",
    type: "single",
    prompt:
      "You need to meet the threat intelligence requirement. What should you use to bring the TIP's indicators into Microsoft Sentinel?",
    options: [
      { id: "a", text: "The Threat Intelligence upload API, which doesn't need a data connector" },
      { id: "b", text: "The Threat Intelligence - TAXII data connector, pointed at the platform" },
      { id: "c", text: "The Microsoft Defender Threat Intelligence data connector, in its premium version" },
      { id: "d", text: "A watchlist that an analyst re-imports from the platform's export each day" },
    ],
    correct: ["a"],
    explanation:
      "The upload API connects TI platforms or custom applications through REST and doesn't require a data connector, which matches the requirement. The TAXII and Defender Threat Intelligence options are data connectors, and a watchlist holds reference data rather than indicators.",
    difficulty: 2,
    reference: { label: "Understand threat intelligence in Microsoft Sentinel", url: `${docs}azure/sentinel/understand-threat-intelligence` },
  },
  {
    id: "sc200-cs2-q3",
    domainId: "hunting",
    caseStudyId: "northwind-soc",
    type: "single",
    prompt:
      "Analysts want to run analytics-tier queries over the last 90 days of the historical firewall logs, and you create a KQL job that promotes them into a new table. What will the new table be called?",
    options: [
      { id: "a", text: "The name you choose, followed by the suffix _KQL_CL" },
      { id: "b", text: "The source table's name, followed by the suffix _SRCH" },
      { id: "c", text: "The name you choose, followed by the suffix _RST" },
      { id: "d", text: "The source table's name, with the suffix _CL added" },
    ],
    correct: ["a"],
    explanation:
      "A KQL job promotes data from the data lake tier to the analytics tier, and when it creates a new table the name is suffixed with _KQL_CL to show that a KQL job created it. Search job and restore tables use different suffixes.",
    difficulty: 3,
    reference: { label: "Create jobs in the Microsoft Sentinel data lake", url: `${docs}azure/sentinel/datalake/kql-jobs` },
  },
  {
    id: "sc200-cs2-q4",
    domainId: "operations",
    caseStudyId: "northwind-soc",
    type: "single",
    prompt:
      "You need to meet the response requirement for the two domain controllers. What should you configure?",
    options: [
      { id: "a", text: "Exclusions for the domain controllers in the automated response settings" },
      { id: "b", text: "A device group for the domain controllers set to the Full automation level" },
      { id: "c", text: "An alert suppression rule scoped to the domain controllers' device names" },
      { id: "d", text: "An allow indicator for the domain controllers' IP addresses in Defender for Endpoint" },
    ],
    correct: ["a"],
    explanation:
      "Exclusions for supported users, devices and IP addresses stop automatic attack disruption from containing critical assets. Device group automation levels govern remediation of investigated threats, and suppression rules or indicators don't affect containment.",
    difficulty: 3,
    reference: { label: "Automatic attack disruption in Microsoft Defender XDR", url: `${docs}defender-xdr/automatic-attack-disruption` },
  },
  {
    id: "sc200-cs2-q5",
    domainId: "response",
    caseStudyId: "northwind-soc",
    type: "single",
    prompt:
      "You need to meet the investigation requirement. Which Microsoft Entra role is the least privileged one that can set up Microsoft Graph activity logs to a Log Analytics workspace, and which table will hold the data?",
    options: [
      { id: "a", text: "Global Reader, with the exported data landing in the AuditLogs table of the workspace" },
      { id: "b", text: "Security Administrator, with the data landing in the MicrosoftGraphActivityLogs table" },
      { id: "c", text: "Global Administrator, with the exported data landing in the SigninLogs table of the workspace" },
      { id: "d", text: "Reports Reader, with the exported data landing in the OfficeActivity table of the workspace" },
    ],
    correct: ["b"],
    explanation:
      "Security Administrator is the only least privileged admin role supported for configuring the diagnostic setting for Graph activity logs, and the data is stored in the MicrosoftGraphActivityLogs table. Reader roles can't configure it, and Global Administrator is more than required.",
    difficulty: 3,
    reference: { label: "Microsoft Graph activity logs", url: `${docs}graph/microsoft-graph-activity-logs-overview` },
  },
];
