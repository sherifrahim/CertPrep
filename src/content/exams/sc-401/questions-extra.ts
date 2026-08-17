import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc401ExtraQuestions: Question[] = [
  // -------------------------------------------------------------- protection
  {
    id: "sc401-x1",
    domainId: "protection",
    type: "single",
    prompt:
      "Your organisation uses a standard contract template. You must detect documents derived from that template, even when the wording around the form fields changes slightly. What should you create?",
    options: [
      { id: "a", text: "A document fingerprint from the template file" },
      { id: "b", text: "An exact data match sensitive information type" },
      { id: "c", text: "A trainable classifier with 50 sample documents" },
      { id: "d", text: "A keyword dictionary of contract terms" },
    ],
    correct: ["a"],
    explanation:
      "Document fingerprinting converts a form or template into a pattern and detects content based on that structure, which is precisely the case for standardised documents. EDM matches specific data values, and trainable classifiers recognise broad categories rather than one template.",
    difficulty: 2,
    reference: { label: "Document fingerprinting", url: `${docs}/purview/document-fingerprinting` },
  },
  {
    id: "sc401-x2",
    domainId: "protection",
    type: "single",
    prompt:
      "You need to detect a broad category of content such as customer complaints, where no fixed pattern or keyword list works reliably. What should you use?",
    options: [
      { id: "a", text: "A trainable classifier trained on positive and negative samples" },
      { id: "b", text: "A regular-expression based custom sensitive information type" },
      { id: "c", text: "An exact data match sensitive information type" },
      { id: "d", text: "Optical character recognition" },
    ],
    correct: ["a"],
    explanation:
      "Trainable classifiers learn from example documents, which is the right tool for conceptual categories that resist pattern matching. Microsoft also ships pre-trained classifiers for common categories such as resumes and source code.",
    difficulty: 2,
    reference: { label: "Learn about trainable classifiers", url: `${docs}/purview/trainable-classifiers-learn-about` },
  },
  {
    id: "sc401-x3",
    domainId: "protection",
    type: "single",
    prompt:
      "A sensitivity label must let recipients read and reply to an email but prevent them forwarding it or copying its contents. Which label configuration achieves this?",
    options: [
      { id: "a", text: "Encryption with the Do Not Forward option, which assigns view, reply, and reply-all without extract or forward rights" },
      { id: "b", text: "Content marking with a confidential footer" },
      { id: "c", text: "A container label applied to the mailbox" },
      { id: "d", text: "A retention label with a 1-year retain action" },
    ],
    correct: ["a"],
    explanation:
      "Do Not Forward is a predefined encryption template granting recipients view, reply, and reply-all while withholding forward, print, and extract rights. Content marking is only a visual cue and retention governs lifecycle.",
    difficulty: 2,
    reference: { label: "Restrict access with encryption", url: `${docs}/purview/encryption-sensitivity-labels` },
  },
  {
    id: "sc401-x4",
    domainId: "protection",
    type: "single",
    prompt:
      "External partners without Microsoft accounts must be able to read encrypted email your organisation sends, and you must be able to revoke access after sending. What should you implement?",
    options: [
      { id: "a", text: "Microsoft Purview Advanced Message Encryption with a custom branded portal" },
      { id: "b", text: "A sensitivity label restricted to internal users only" },
      { id: "c", text: "Transport Layer Security enforcement on the connector" },
      { id: "d", text: "S/MIME signing for all outbound mail" },
    ],
    correct: ["a"],
    explanation:
      "Advanced Message Encryption delivers encrypted mail to any recipient through a branded web portal and uniquely adds revocation and expiration for messages already sent. Baseline Message Encryption lacks revocation, and TLS only protects mail in transit between servers.",
    difficulty: 2,
    reference: { label: "Advanced Message Encryption", url: `${docs}/purview/ome-advanced-message-encryption` },
  },
  {
    id: "sc401-x5",
    domainId: "protection",
    type: "single",
    prompt:
      "Which Microsoft Purview tool tells you how many items currently carry a given sensitivity label and where those items are stored?",
    options: [
      { id: "a", text: "Content explorer" },
      { id: "b", text: "Activity explorer" },
      { id: "c", text: "Policy lookup" },
      { id: "d", text: "Records management disposition review" },
    ],
    correct: ["a"],
    explanation:
      "Content explorer is the current inventory of labelled and sensitive content with drill-down to locations. Activity explorer instead shows the time series of label-related activity such as applications, changes, and downgrades.",
    difficulty: 1,
    reference: { label: "Get started with content explorer", url: `${docs}/purview/data-classification-content-explorer` },
  },
  {
    id: "sc401-x6",
    domainId: "protection",
    type: "single",
    prompt:
      "You must scan and label existing files on a Windows file server that will not be migrated to SharePoint. What should you deploy?",
    options: [
      { id: "a", text: "The Microsoft Purview Information Protection scanner, in discovery mode first and then enforcement" },
      { id: "b", text: "A service-side auto-labeling policy for SharePoint" },
      { id: "c", text: "Endpoint DLP with a Devices location policy" },
      { id: "d", text: "The Purview browser extension" },
    ],
    correct: ["a"],
    explanation:
      "The information protection scanner is the component that reaches on-premises file shares and SharePoint Server, discovering and optionally labelling content using your existing label policies. Service-side auto-labeling only covers Microsoft 365 locations.",
    difficulty: 2,
    reference: { label: "Information Protection scanner", url: `${docs}/purview/deploy-scanner` },
  },
  {
    id: "sc401-x7",
    domainId: "protection",
    type: "ordering",
    prompt:
      "You are configuring service-side auto-labeling for SharePoint and OneDrive. Arrange the steps in the recommended order.",
    steps: [
      { id: "a", text: "Create the auto-labeling policy specifying locations and the sensitive info type conditions" },
      { id: "b", text: "Run the policy in simulation mode and review the matches" },
      { id: "c", text: "Refine the conditions to remove false positives" },
      { id: "d", text: "Turn the policy on so labels are applied to matching content" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Auto-labeling policies support simulation precisely so you can see what would be labelled before anything changes. Reviewing and tuning before enabling avoids mislabelling content at scale, which is disruptive to undo.",
    difficulty: 2,
    reference: { label: "Configure auto-labeling policies", url: `${docs}/purview/apply-sensitivity-label-automatically` },
  },

  // --------------------------------------------------------------------- dlp
  {
    id: "sc401-x8",
    domainId: "dlp",
    type: "single",
    prompt:
      "A DLP policy must warn users when they share sensitive content externally but still allow them to proceed with a business justification. Which action should the rule use?",
    options: [
      { id: "a", text: "Block with override, combined with a policy tip and a user justification prompt" },
      { id: "b", text: "Block without exceptions" },
      { id: "c", text: "Audit only, with no notification" },
      { id: "d", text: "Restrict access to the site collection" },
    ],
    correct: ["a"],
    explanation:
      "Block with override enforces the control while permitting an explicit, recorded justification, which balances protection with business continuity. Plain block gives no path forward, and audit-only neither warns nor restricts.",
    difficulty: 2,
    reference: { label: "DLP policy reference", url: `${docs}/purview/dlp-policy-reference` },
  },
  {
    id: "sc401-x9",
    domainId: "dlp",
    type: "single",
    prompt:
      "You must prevent users pasting sensitive data into a generative AI website in the browser on managed devices. Which combination is required?",
    options: [
      { id: "a", text: "Onboarded devices, the Purview browser extension or a supported browser, and an Endpoint DLP rule restricting the sensitive service domain" },
      { id: "b", text: "A sensitivity label with encryption only" },
      { id: "c", text: "A retention policy for Teams chats" },
      { id: "d", text: "A container label on the SharePoint site" },
    ],
    correct: ["a"],
    explanation:
      "Browser-based egress control needs the device onboarded to Purview, browser support through the extension or a natively supported browser, and a DLP rule that names the service domain and restricts the paste or upload activity.",
    difficulty: 3,
    reference: { label: "Endpoint DLP browser and domain restrictions", url: `${docs}/purview/dlp-configure-endpoint-settings` },
  },
  {
    id: "sc401-x10",
    domainId: "dlp",
    type: "single",
    prompt:
      "Which Microsoft Purview capability prevents Microsoft 365 Copilot from summarising or referencing documents that carry particular sensitivity labels?",
    options: [
      { id: "a", text: "A DLP policy for the Microsoft 365 Copilot location that restricts content with the selected labels" },
      { id: "b", text: "A retention label with a disposition review" },
      { id: "c", text: "An insider risk policy for risky AI usage" },
      { id: "d", text: "A communication compliance policy" },
    ],
    correct: ["a"],
    explanation:
      "A DLP policy scoped to the Copilot location stops labelled content being processed by Copilot and its agents. Insider risk policies for risky AI usage detect and score behaviour rather than blocking the processing itself.",
    difficulty: 3,
    reference: { label: "DLP for Microsoft 365 Copilot", url: `${docs}/purview/dlp-microsoft365-copilot-location-learn-about` },
  },
  {
    id: "sc401-x11",
    domainId: "dlp",
    type: "single",
    prompt:
      "A compliance officer must determine which retention policies and labels apply to a specific mailbox and why. Which tool gives that answer directly?",
    options: [
      { id: "a", text: "Policy lookup in data lifecycle management" },
      { id: "b", text: "Content explorer" },
      { id: "c", text: "Activity explorer" },
      { id: "d", text: "The DLP alerts dashboard" },
    ],
    correct: ["a"],
    explanation:
      "Policy lookup reports every retention policy and label applying to a given user, site, or mailbox, which is what resolves precedence questions. Content and Activity explorer describe classification inventory and activity instead.",
    difficulty: 2,
    reference: { label: "Retention policy lookup", url: `${docs}/purview/retention` },
  },
  {
    id: "sc401-x12",
    domainId: "dlp",
    type: "single",
    prompt:
      "Records that must not be edited or deleted once declared, with any disposal requiring documented approval, are best implemented using which capability?",
    options: [
      { id: "a", text: "Retention labels that mark content as a regulatory record, with disposition review enabled" },
      { id: "b", text: "A retention policy that deletes content after 7 years" },
      { id: "c", text: "A sensitivity label with encryption" },
      { id: "d", text: "An eDiscovery hold" },
    ],
    correct: ["a"],
    explanation:
      "Marking content as a regulatory record locks it against edit and deletion, and disposition review requires a reviewer to approve disposal at the end of the retention period, producing the documented trail described.",
    difficulty: 3,
    reference: { label: "Records management", url: `${docs}/purview/records-management` },
  },
  {
    id: "sc401-x13",
    domainId: "dlp",
    type: "statements",
    scenario:
      "An Endpoint DLP policy is scoped to the Devices location with the activity 'Copy to removable USB device' set to Block with override, and a policy tip enabled.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The device must be onboarded to Microsoft Purview for the rule to apply.", correct: true },
      { id: "b", text: "A user can complete the copy by supplying a business justification.", correct: true },
      { id: "c", text: "The rule also blocks uploads to cloud storage websites.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "Endpoint DLP only governs onboarded devices, and Block with override is defined by allowing the user to proceed with a recorded justification. Cloud upload is a separate activity — restricting it requires its own rule condition and service domain configuration.",
    difficulty: 2,
    reference: { label: "Learn about Endpoint DLP", url: `${docs}/purview/endpoint-dlp-learn-about` },
  },
  {
    id: "sc401-x14",
    domainId: "dlp",
    type: "meets-goal",
    scenario:
      "Contoso must keep all Microsoft Teams chat messages for exactly three years, then delete them automatically, and the policy must continue to apply to employees who join the Legal department after it is created.",
    prompt:
      "Solution: You create a retention policy for the Teams chats location with a three-year retain-then-delete setting, scoped with an adaptive policy scope querying the Department attribute.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "A retain-then-delete retention policy handles the three-year lifecycle, and an adaptive scope built on the Department attribute re-evaluates membership automatically so new joiners are covered without manual updates.",
    difficulty: 2,
    reference: { label: "Adaptive policy scopes", url: `${docs}/purview/retention` },
  },
  {
    id: "sc401-x15",
    domainId: "dlp",
    type: "meets-goal",
    scenario:
      "Contoso must keep all Microsoft Teams chat messages for exactly three years, then delete them automatically, and the policy must continue to apply to employees who join the Legal department after it is created.",
    prompt:
      "Solution: You create a retention label with a three-year retain-then-delete setting and publish it to a static distribution list containing current Legal staff.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "A static scope does not update as staff join, so new employees fall outside the policy. Publishing a label also relies on users applying it, whereas the requirement is automatic retention of all chat messages.",
    difficulty: 2,
    reference: { label: "Adaptive or static policy scopes", url: `${docs}/purview/retention` },
  },

  // -------------------------------------------------------------------- risk
  {
    id: "sc401-x16",
    domainId: "risk",
    type: "single",
    prompt:
      "Which Insider Risk Management setting lets investigators see a visual capture of the activity that generated an alert, subject to configured privacy controls?",
    options: [
      { id: "a", text: "Forensic evidence" },
      { id: "b", text: "Policy indicators" },
      { id: "c", text: "Intelligent detections" },
      { id: "d", text: "Notice templates" },
    ],
    correct: ["a"],
    explanation:
      "Forensic evidence captures visual context for risky activity on onboarded devices, gated by explicit opt-in, user scoping, and approval controls to protect privacy. Indicators define what is detected rather than what is recorded.",
    difficulty: 2,
    reference: { label: "Insider risk forensic evidence", url: `${docs}/purview/insider-risk-management-forensic-evidence` },
  },
  {
    id: "sc401-x17",
    domainId: "risk",
    type: "single",
    prompt:
      "Insider Risk Management shows usernames as anonymised aliases for some reviewers. Which setting controls this?",
    options: [
      { id: "a", text: "Privacy settings, which anonymise user details for investigators until an escalation requires identification" },
      { id: "b", text: "Adaptive Protection risk levels" },
      { id: "c", text: "Policy timeframes" },
      { id: "d", text: "The intelligent detections threshold" },
    ],
    correct: ["a"],
    explanation:
      "Insider risk privacy settings pseudonymise user names in alerts and cases so analysts assess behaviour rather than individuals, with identification available to appropriately permissioned roles when a case escalates.",
    difficulty: 2,
    reference: { label: "Insider risk management settings", url: `${docs}/purview/insider-risk-management-settings` },
  },
  {
    id: "sc401-x18",
    domainId: "risk",
    type: "single",
    prompt:
      "Which eDiscovery capability lets you preserve, collect, review, and export content for a legal matter, including placing holds on custodians?",
    options: [
      { id: "a", text: "eDiscovery (Premium), with custodian management and review sets" },
      { id: "b", text: "Content search alone" },
      { id: "c", text: "Activity explorer" },
      { id: "d", text: "A retention policy" },
    ],
    correct: ["a"],
    explanation:
      "The premium eDiscovery experience adds case and custodian management, legal hold, review sets with analytics, and defensible export. Content search finds and exports content but has no custodian or hold workflow.",
    difficulty: 2,
    reference: { label: "eDiscovery overview", url: `${docs}/purview/ediscovery` },
  },
  {
    id: "sc401-x19",
    domainId: "risk",
    type: "single",
    prompt:
      "Before DSPM for AI can report on sensitive data users send to third-party AI websites, which prerequisites must be in place?",
    options: [
      { id: "a", text: "Microsoft Purview Audit enabled, devices onboarded to Purview, and the Purview browser extension installed" },
      { id: "b", text: "A retention policy for Copilot interactions only" },
      { id: "c", text: "An eDiscovery case for each AI site" },
      { id: "d", text: "Customer Lockbox enabled" },
    ],
    correct: ["a"],
    explanation:
      "Third-party AI site visibility depends on endpoint signals, so devices must be onboarded and the browser extension present, with Audit enabled to record the activity. Those are the prerequisites DSPM for AI surfaces in its get-started checklist.",
    difficulty: 3,
    reference: { label: "DSPM for AI considerations", url: `${docs}/purview/dspm-for-ai-considerations` },
  },
  {
    id: "sc401-x20",
    domainId: "risk",
    type: "single",
    prompt:
      "A DSPM for AI data risk assessment reports that a SharePoint site contains sensitive files shared with 'anyone with the link'. Which remediation directly reduces Copilot oversharing risk for that site?",
    options: [
      { id: "a", text: "Apply sensitivity labels to the unlabelled sensitive items and use SharePoint Restricted Content Discovery to exclude the site from Copilot" },
      { id: "b", text: "Delete the site" },
      { id: "c", text: "Disable Purview Audit for the site" },
      { id: "d", text: "Publish a retention label to the site" },
    ],
    correct: ["a"],
    explanation:
      "The assessment's Protect actions target exactly this: labelling unlabelled sensitive content, restricting access by label so Copilot cannot summarise it, and using Restricted Content Discovery to exempt a site from Copilot entirely.",
    difficulty: 3,
    reference: { label: "DSPM for AI", url: `${docs}/purview/dspm-for-ai` },
  },
  {
    id: "sc401-x21",
    domainId: "risk",
    type: "statements",
    scenario:
      "Microsoft Purview Audit (Premium) is licensed for a group of investigators, and a custom audit retention policy keeps Exchange mailbox events for one year.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "MailItemsAccessed events are available for those users.", correct: true },
      { id: "b", text: "The audit retention policy can prioritise which records are kept longest.", correct: true },
      { id: "c", text: "Audit records can be edited to correct errors.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "Audit (Premium) unlocks high-value events such as MailItemsAccessed, and audit retention policies support a priority so competing policies resolve predictably. Audit records are immutable by design — an editable audit log would be worthless as evidence.",
    difficulty: 2,
    reference: { label: "Manage audit log retention policies", url: `${docs}/purview/audit-log-retention-policies` },
  },
  {
    id: "sc401-x22",
    domainId: "risk",
    type: "ordering",
    prompt:
      "You are enabling Adaptive Protection so DLP controls tighten for high-risk users. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Configure Insider Risk Management, including connectors and at least one policy" },
      { id: "b", text: "Enable Adaptive Protection and define the insider risk levels" },
      { id: "c", text: "Create or update a DLP policy with conditions for the insider risk levels" },
      { id: "d", text: "Monitor which users are assigned each risk level and tune the thresholds" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Adaptive Protection consumes insider risk signals, so Insider Risk Management must be functioning first. Risk levels are then defined, DLP policies reference those levels as conditions, and thresholds are tuned once real assignments are observable.",
    difficulty: 3,
    reference: { label: "Adaptive Protection", url: `${docs}/purview/insider-risk-management-adaptive-protection` },
  },
];
