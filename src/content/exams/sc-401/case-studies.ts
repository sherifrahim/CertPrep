import type { CaseStudy, Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc401CaseStudies: CaseStudy[] = [
  {
    id: "litware-purview",
    title: "Litware Inc — protecting sensitive data before a Copilot rollout",
    summary:
      "A financial services firm must classify customer data, control egress, satisfy records obligations, and manage insider risk ahead of deploying Microsoft 365 Copilot.",
    sections: [
      {
        heading: "Overview",
        body: "Litware Inc is a financial services firm with 6,000 employees. Litware plans to deploy Microsoft 365 Copilot across the organisation in two months and must demonstrate that sensitive data is protected before doing so.\n\nLitware uses Microsoft 365 E5 with Microsoft Purview available but only lightly configured.",
      },
      {
        heading: "Existing environment",
        body: "Data:\n• A customer master database holds 120,000 records containing full name, account number, and national insurance number.\n• Approximately 40,000 documents sit in SharePoint Online, largely unlabelled. A weekly assessment reports that many are shared using 'anyone with the link'.\n• A standard loan agreement template is used across the business.\n• An on-premises Windows file server named FS01 holds legacy contracts and will not be migrated.\n\nDevices and identity:\n• 5,800 Windows devices are managed and can be onboarded to Microsoft Purview.\n• An HR system of record holds employee joiner and leaver dates.\n\nCurrent state:\n• No sensitivity labels are published.\n• No DLP policies exist.\n• Insider Risk Management is not configured.\n• Purview Audit is enabled.",
      },
      {
        heading: "Requirements",
        body: "Classification:\n• Documents containing actual customer records must be detected with minimal false positives.\n• Documents derived from the loan agreement template must be identified even when surrounding wording changes.\n• Legacy contracts on FS01 must be discovered and labelled without migrating them.\n\nProtection:\n• Sensitive documents already at rest in SharePoint must be labelled without any user action.\n• Users must be prevented from copying documents containing customer records to USB drives on managed devices, but may proceed with a recorded business justification where genuinely required.\n• Microsoft 365 Copilot must not summarise or reference documents labelled Highly Confidential.\n\nRetention:\n• Loan agreements must be retained for ten years and must not be editable or deletable once declared, with disposal requiring documented approval.\n• A retention policy for the Legal department must automatically cover employees who join that department later.\n\nInsider risk:\n• Employees who download unusual volumes of data around their leaving date must be detected, and reviewers must be able to see the activity behind an alert while user identities remain pseudonymised until escalation.",
      },
    ],
  },
];

export const sc401CaseStudyQuestions: Question[] = [
  {
    id: "sc401-cs1-q1",
    domainId: "protection",
    caseStudyId: "litware-purview",
    type: "single",
    prompt:
      "You need to detect documents containing actual customer records with minimal false positives. What should you create?",
    options: [
      { id: "a", text: "An exact data match (EDM) based sensitive information type built from the customer master database" },
      { id: "b", text: "A custom sensitive information type using a regular expression for the account number format" },
      { id: "c", text: "A trainable classifier trained on 50 sample documents" },
      { id: "d", text: "A keyword dictionary containing customer surnames" },
    ],
    correct: ["a"],
    explanation:
      "EDM matches the organisation's real values from a hashed upload rather than anything shaped like an account number, which is what keeps false positives low across 120,000 records. Regex and keyword approaches match patterns, and trainable classifiers recognise categories rather than specific values.",
    difficulty: 2,
    reference: { label: "Learn about EDM based SITs", url: `${docs}/purview/sit-learn-about-exact-data-match-based-sits` },
  },
  {
    id: "sc401-cs1-q2",
    domainId: "protection",
    caseStudyId: "litware-purview",
    type: "single",
    prompt:
      "You need to identify documents derived from the loan agreement template. What should you create?",
    options: [
      { id: "a", text: "A document fingerprint from the template" },
      { id: "b", text: "An exact data match sensitive information type" },
      { id: "c", text: "A retention label published to all users" },
      { id: "d", text: "A container label applied to the SharePoint site" },
    ],
    correct: ["a"],
    explanation:
      "Document fingerprinting converts a form or template into a pattern and detects derived documents even when surrounding wording differs. EDM targets specific data values, and labels govern protection or lifecycle rather than detection.",
    difficulty: 2,
    reference: { label: "Document fingerprinting", url: `${docs}/purview/document-fingerprinting` },
  },
  {
    id: "sc401-cs1-q3",
    domainId: "protection",
    caseStudyId: "litware-purview",
    type: "multi",
    prompt:
      "You need to label the existing SharePoint documents and the legacy contracts on FS01. Which two should you implement? (Choose two.)",
    options: [
      { id: "a", text: "A service-side auto-labeling policy scoped to SharePoint Online" },
      { id: "b", text: "The Microsoft Purview Information Protection scanner targeting FS01" },
      { id: "c", text: "Client-side auto-labeling in the sensitivity label settings" },
      { id: "d", text: "A default label configured in the label policy" },
    ],
    correct: ["a", "b"],
    explanation:
      "Service-side auto-labeling scans content already at rest in SharePoint with no user involvement, and the information protection scanner is the only component that reaches an on-premises file server. Client-side labeling requires a user to open each document, and a default label only affects newly created content.",
    difficulty: 3,
    reference: { label: "Apply a sensitivity label automatically", url: `${docs}/purview/apply-sensitivity-label-automatically` },
  },
  {
    id: "sc401-cs1-q4",
    domainId: "dlp",
    caseStudyId: "litware-purview",
    type: "single",
    prompt:
      "You need to meet the USB copy requirement. What should you configure?",
    options: [
      { id: "a", text: "An Endpoint DLP rule for the 'Copy to removable USB device' activity set to Block with override, with a policy tip requiring justification" },
      { id: "b", text: "An Endpoint DLP rule set to Block with no exceptions" },
      { id: "c", text: "A sensitivity label that applies encryption and removes the Extract permission" },
      { id: "d", text: "An attack surface reduction rule blocking untrusted USB processes" },
    ],
    correct: ["a"],
    explanation:
      "Block with override enforces the control while permitting a recorded business justification, which is exactly what the requirement describes. Plain block leaves no legitimate path, label encryption governs recipient rights rather than the copy operation, and ASR rules target exploit behaviour.",
    difficulty: 2,
    reference: { label: "Learn about Endpoint DLP", url: `${docs}/purview/endpoint-dlp-learn-about` },
  },
  {
    id: "sc401-cs1-q5",
    domainId: "dlp",
    caseStudyId: "litware-purview",
    type: "single",
    prompt:
      "You need to prevent Microsoft 365 Copilot summarising documents labelled Highly Confidential. What should you configure?",
    options: [
      { id: "a", text: "A DLP policy for the Microsoft 365 Copilot location restricting content with the Highly Confidential label" },
      { id: "b", text: "An insider risk policy using the risky AI usage template" },
      { id: "c", text: "A retention label applied to all Highly Confidential documents" },
      { id: "d", text: "A communication compliance policy scoped to Copilot" },
    ],
    correct: ["a"],
    explanation:
      "A DLP policy scoped to the Copilot location blocks labelled content from being processed by Copilot and its agents. Insider risk policies score behaviour rather than preventing processing, and retention governs lifecycle only.",
    difficulty: 3,
    reference: { label: "DLP for Microsoft 365 Copilot", url: `${docs}/purview/dlp-microsoft365-copilot-location-learn-about` },
  },
  {
    id: "sc401-cs1-q6",
    domainId: "dlp",
    caseStudyId: "litware-purview",
    type: "statements",
    prompt:
      "You are designing the retention approach. For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Marking loan agreements as a regulatory record prevents anyone, including administrators, editing or deleting them.", correct: true },
      { id: "b", text: "Disposition review can require a reviewer to approve deletion at the end of the ten years.", correct: true },
      { id: "c", text: "A static policy scope will automatically cover employees who join Legal later.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "A regulatory record is locked against edit and deletion with no admin override, and disposition review routes end-of-life content to named reviewers, producing the documented approval trail. Only an adaptive scope re-evaluates membership as staff join, so a static scope fails the Legal requirement.",
    difficulty: 3,
    reference: { label: "Records management", url: `${docs}/purview/records-management` },
  },
  {
    id: "sc401-cs1-q7",
    domainId: "risk",
    caseStudyId: "litware-purview",
    type: "multi",
    prompt:
      "You need to meet the insider risk requirements. Which two should you configure? (Choose two.)",
    options: [
      { id: "a", text: "The Microsoft 365 HR connector to import leaver dates, with a policy from the data theft by departing users template" },
      { id: "b", text: "Forensic evidence capture, together with privacy settings that pseudonymise user names" },
      { id: "c", text: "A DLP policy blocking all downloads larger than 100 MB" },
      { id: "d", text: "A retention policy for the departing employee's mailbox" },
    ],
    correct: ["a", "b"],
    explanation:
      "The HR connector supplies the leaving-date triggering event the departing-user template relies on, and forensic evidence with pseudonymisation gives reviewers activity context while keeping identities masked until escalation. A blanket size threshold ignores who is leaving and disrupts legitimate work.",
    difficulty: 3,
    reference: { label: "Import HR data", url: `${docs}/purview/import-hr-data` },
  },
  {
    id: "sc401-cs1-q8",
    domainId: "risk",
    caseStudyId: "litware-purview",
    type: "single",
    prompt:
      "The weekly assessment reports many SharePoint documents shared with 'anyone with the link'. Which remediation most directly reduces Copilot oversharing risk before the rollout?",
    options: [
      { id: "a", text: "Auto-label the unlabelled sensitive items and use SharePoint Restricted Content Discovery to exclude the worst sites from Copilot" },
      { id: "b", text: "Disable Purview Audit for those sites" },
      { id: "c", text: "Delete every document older than three years" },
      { id: "d", text: "Publish a retention label to all users" },
    ],
    correct: ["a"],
    explanation:
      "These are the Protect actions a DSPM for AI data risk assessment recommends: label unlabelled sensitive content so DLP can act on it, and use Restricted Content Discovery to exempt high-risk sites from Copilot entirely. Disabling audit removes visibility, and mass deletion is disproportionate.",
    difficulty: 3,
    reference: { label: "DSPM for AI", url: `${docs}/purview/dspm-for-ai` },
  },
];
