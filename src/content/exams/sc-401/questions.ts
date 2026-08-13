import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc401Questions: Question[] = [
  // -------------------------------------------------------------- protection
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
    reference: { label: "Exact data match based SITs", url: `${docs}/purview/sit-learn-about-exact-data-match-based-sits` },
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
    reference: { label: "Apply a sensitivity label automatically", url: `${docs}/purview/apply-sensitivity-label-automatically` },
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
    reference: { label: "Sensitivity labels for containers", url: `${docs}/purview/sensitivity-labels-teams-groups-sites` },
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
    reference: { label: "Optical character recognition", url: `${docs}/purview/ocr-learn-about` },
  },
  {
    id: "sc401-q13",
    domainId: "protection",
    type: "single",
    prompt:
      "Your legal team uses a standard non-disclosure agreement template. You must detect any document derived from that specific template, regardless of the party names filled in. What should you create?",
    options: [
      { id: "a", text: "A document fingerprint, used as a sensitive information type" },
      { id: "b", text: "A trainable classifier trained on 500 sample contracts" },
      { id: "c", text: "An EDM schema containing party names" },
      { id: "d", text: "A regular-expression custom SIT matching the word 'confidential'" },
    ],
    correct: ["a"],
    explanation:
      "Document fingerprinting converts a blank form into a pattern that matches documents built from that template, even when variable fields differ. Trainable classifiers recognise broad categories rather than one specific form, and EDM matches exact known values.",
    difficulty: 2,
    reference: { label: "Document fingerprinting", url: `${docs}/purview/document-fingerprinting` },
  },
  {
    id: "sc401-q14",
    domainId: "protection",
    type: "single",
    prompt:
      "You must identify documents that are 'source code' across the tenant. There is no reliable keyword or pattern, but you can supply many examples. What should you use?",
    options: [
      { id: "a", text: "A trainable classifier, either the built-in Source Code classifier or a custom one trained on samples" },
      { id: "b", text: "An exact data match SIT" },
      { id: "c", text: "A document fingerprint" },
      { id: "d", text: "A keyword dictionary of programming terms" },
    ],
    correct: ["a"],
    explanation:
      "Trainable classifiers learn a category of content from positive and negative examples, which suits fuzzy classes such as source code, resumes, or harassment. Microsoft ships several pre-trained classifiers including Source Code. EDM and fingerprinting both require exact known data or templates.",
    difficulty: 2,
    reference: { label: "Trainable classifiers", url: `${docs}/purview/trainable-classifiers-learn-about` },
  },
  {
    id: "sc401-q15",
    domainId: "protection",
    type: "single",
    prompt:
      "Which Microsoft Purview tool shows a current inventory of where labelled and sensitive items live across your tenant?",
    options: [
      { id: "a", text: "Content explorer" },
      { id: "b", text: "Activity explorer" },
      { id: "c", text: "Policy lookup" },
      { id: "d", text: "Records management disposition review" },
    ],
    correct: ["a"],
    explanation:
      "Content explorer is the inventory view: which items carry which sensitivity labels, retention labels, or sensitive info types, and in which workloads. Activity explorer shows label-related activity over time rather than current state.",
    difficulty: 1,
    reference: { label: "Get started with content explorer", url: `${docs}/purview/data-classification-content-explorer` },
  },
  {
    id: "sc401-q16",
    domainId: "protection",
    type: "single",
    prompt:
      "A sensitivity label must let members of the Finance group edit a document while external recipients can only view it, with those rights travelling with the file wherever it goes. What must the label configure?",
    options: [
      { id: "a", text: "Encryption with assigned permissions for specific users and groups" },
      { id: "b", text: "Content marking with a watermark only" },
      { id: "c", text: "A container label on the Finance team" },
      { id: "d", text: "An auto-labeling policy for Exchange" },
    ],
    correct: ["a"],
    explanation:
      "Encryption settings on a sensitivity label embed usage rights in the file itself, so Co-Author or Viewer rights are enforced wherever the file travels, including outside the tenant. Content marking is only visual and does not restrict anything.",
    difficulty: 2,
    reference: { label: "Restrict access with encryption", url: `${docs}/purview/encryption-sensitivity-labels` },
  },
  {
    id: "sc401-q17",
    domainId: "protection",
    type: "single",
    prompt:
      "Two sensitivity labels are published to a user. Which label ordering principle applies when the service must resolve which one is more restrictive?",
    options: [
      { id: "a", text: "The label positioned lower in the label list order is treated as higher sensitivity" },
      { id: "b", text: "The label created most recently always wins" },
      { id: "c", text: "The label with the shortest name wins" },
      { id: "d", text: "Sublabels always override their parent regardless of order" },
    ],
    correct: ["a"],
    explanation:
      "Sensitivity labels are ordered in the admin list from least to most sensitive, so a label further down the list represents higher sensitivity. That ordering drives automatic labelling decisions and the warnings shown when a user lowers a label.",
    difficulty: 3,
    reference: { label: "Sensitivity label priority", url: `${docs}/purview/sensitivity-labels` },
  },
  {
    id: "sc401-q18",
    domainId: "protection",
    type: "single",
    prompt:
      "You must classify and label files sitting on on-premises Windows file shares using your existing sensitivity labels. What should you deploy?",
    options: [
      { id: "a", text: "The Microsoft Purview Information Protection scanner" },
      { id: "b", text: "The Purview browser extension" },
      { id: "c", text: "Endpoint DLP on the file server" },
      { id: "d", text: "An auto-labeling policy for SharePoint" },
    ],
    correct: ["a"],
    explanation:
      "The Information Protection scanner runs on-premises, crawls file shares and SharePoint Server repositories, and can run in discovery-only mode or enforce your labelling policies. Auto-labeling policies only cover cloud workloads.",
    difficulty: 2,
    reference: { label: "Information Protection scanner", url: `${docs}/purview/deploy-scanner` },
  },
  {
    id: "sc401-q19",
    domainId: "protection",
    type: "single",
    prompt:
      "Which capability lets you revoke an encrypted email after it has been sent and set an expiration date on the recipient's access?",
    options: [
      { id: "a", text: "Microsoft Purview Advanced Message Encryption" },
      { id: "b", text: "Microsoft Purview Message Encryption (standard)" },
      { id: "c", text: "Transport rules with TLS enforcement" },
      { id: "d", text: "S/MIME signing" },
    ],
    correct: ["a"],
    explanation:
      "Advanced Message Encryption adds revocation and expiration policies for mail delivered through the branded encryption portal, on top of the protection standard Message Encryption provides. TLS protects the transport hop only.",
    difficulty: 2,
    reference: { label: "Advanced Message Encryption", url: `${docs}/purview/ome-advanced-message-encryption` },
  },
  {
    id: "sc401-q20",
    domainId: "protection",
    type: "single",
    prompt:
      "A sensitivity label with encryption must be applied to a Power BI semantic model and follow the data when it is exported to Excel. What must be true?",
    options: [
      { id: "a", text: "The label is published to the user and Power BI information protection is enabled, so exported files inherit the label and its encryption" },
      { id: "b", text: "Only container labels can apply to Power BI" },
      { id: "c", text: "Power BI ignores sensitivity labels entirely" },
      { id: "d", text: "The file must be manually labelled after each export" },
    ],
    correct: ["a"],
    explanation:
      "With information protection enabled in Power BI, labels applied to items persist to exported Excel, PDF, and PowerPoint files along with their encryption, so protection is not lost at the export boundary.",
    difficulty: 3,
    reference: { label: "Sensitivity labels in Power BI", url: `${docs}/fabric/governance/service-security-sensitivity-label-overview` },
  },
  {
    id: "sc401-q21",
    domainId: "protection",
    type: "multi",
    prompt:
      "Which two conditions must be met before a sensitivity label can be applied to a Microsoft 365 Group, Team, or SharePoint site? (Choose two.)",
    options: [
      { id: "a", text: "Support for container labels must be enabled in the tenant" },
      { id: "b", text: "The label's scope must include Groups & sites" },
      { id: "c", text: "The label must have encryption configured" },
      { id: "d", text: "All items in the site must already be labelled" },
    ],
    correct: ["a", "b"],
    explanation:
      "Container labelling must be enabled for the tenant, and each label's scope must include Groups & sites for it to appear as a container option. Encryption is an item-level setting and is not required, and existing item labels are irrelevant.",
    difficulty: 2,
    reference: { label: "Enable sensitivity labels for containers", url: `${docs}/purview/sensitivity-labels-teams-groups-sites` },
  },

  // --------------------------------------------------------------------- dlp
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
    reference: { label: "DLP policy reference", url: `${docs}/purview/dlp-policy-reference` },
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
    reference: { label: "Endpoint data loss prevention", url: `${docs}/purview/endpoint-dlp-learn-about` },
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
    reference: { label: "The principles of retention", url: `${docs}/purview/retention` },
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
    reference: { label: "Adaptive vs static policy scopes", url: `${docs}/purview/purview-adaptive-scopes` },
  },
  {
    id: "sc401-q22",
    domainId: "dlp",
    type: "single",
    prompt:
      "A DLP policy must warn users when they share sensitive data externally but let them proceed with a documented business justification. Which configuration achieves this?",
    options: [
      { id: "a", text: "Block with override, requiring a business justification" },
      { id: "b", text: "Block without override" },
      { id: "c", text: "Audit only, with no notification" },
      { id: "d", text: "Simulation mode left running permanently" },
    ],
    correct: ["a"],
    explanation:
      "Block with override shows a policy tip, blocks by default, and lets the user proceed after supplying a justification that is recorded for review — the balance between enforcement and productivity described. Audit-only produces no user-facing control.",
    difficulty: 2,
    reference: { label: "DLP policy tips and overrides", url: `${docs}/purview/dlp-policy-tips-reference` },
  },
  {
    id: "sc401-q23",
    domainId: "dlp",
    type: "single",
    prompt:
      "Before enforcing a new DLP policy across the tenant, you want to see exactly what it would have matched without affecting users. What should you use?",
    options: [
      { id: "a", text: "Simulation mode, optionally with policy tips shown" },
      { id: "b", text: "A lower rule priority" },
      { id: "c", text: "An adaptive policy scope" },
      { id: "d", text: "Test mode in Content explorer" },
    ],
    correct: ["a"],
    explanation:
      "Simulation mode runs the policy and reports matches without enforcing actions, so you can tune conditions and estimate impact. You can optionally enable policy tips during simulation to prepare users before enforcement.",
    difficulty: 1,
    reference: { label: "Create and deploy a DLP policy", url: `${docs}/purview/dlp-create-deploy-policy` },
  },
  {
    id: "sc401-q24",
    domainId: "dlp",
    type: "single",
    prompt:
      "Endpoint DLP must monitor a Windows device. What is the prerequisite?",
    options: [
      { id: "a", text: "The device must be onboarded to Microsoft Purview (device onboarding) and running a supported Windows version" },
      { id: "b", text: "The device must have a public IP address" },
      { id: "c", text: "The device must be in the same Active Directory forest as Exchange" },
      { id: "d", text: "The user must have an eDiscovery role assigned" },
    ],
    correct: ["a"],
    explanation:
      "Endpoint DLP requires devices to be onboarded into Purview device management, which shares onboarding with Defender for Endpoint, plus a supported OS build. Networking and directory topology are not prerequisites.",
    difficulty: 2,
    reference: { label: "Get started with Endpoint DLP", url: `${docs}/purview/endpoint-dlp-getting-started` },
  },
  {
    id: "sc401-q25",
    domainId: "dlp",
    type: "single",
    prompt:
      "Which Endpoint DLP setting lets you allow a browser you trust while blocking sensitive uploads from all other browsers?",
    options: [
      { id: "a", text: "Unallowed browsers, combined with the service domain allow/block list" },
      { id: "b", text: "File path exclusions" },
      { id: "c", text: "Printer groups" },
      { id: "d", text: "Removable storage device groups" },
    ],
    correct: ["a"],
    explanation:
      "Listing browsers as unallowed forces users into a supported browser where the Purview extension can enforce service-domain rules on uploads. Printer and removable storage groups govern different egress channels.",
    difficulty: 3,
    reference: { label: "Endpoint DLP settings", url: `${docs}/purview/dlp-configure-endpoint-settings` },
  },
  {
    id: "sc401-q26",
    domainId: "dlp",
    type: "single",
    prompt:
      "What does just-in-time protection in Endpoint DLP do?",
    options: [
      { id: "a", text: "Blocks egress activity on a file until classification has been evaluated, preventing leakage of not-yet-scanned content" },
      { id: "b", text: "Grants temporary administrative rights to the user" },
      { id: "c", text: "Opens a firewall port for a limited time" },
      { id: "d", text: "Applies a retention label at the moment of deletion" },
    ],
    correct: ["a"],
    explanation:
      "Just-in-time protection holds egress actions on a file until Purview has classified it, closing the window where brand-new or freshly modified content could leave before scanning completed.",
    difficulty: 3,
    reference: { label: "Just-in-time protection", url: `${docs}/purview/endpoint-dlp-just-in-time-protection` },
  },
  {
    id: "sc401-q27",
    domainId: "dlp",
    type: "single",
    prompt:
      "You must apply stricter DLP enforcement automatically to users whose behaviour indicates elevated risk, and relax it when their risk subsides. What should you configure?",
    options: [
      { id: "a", text: "Adaptive Protection, which maps Insider Risk Management risk levels to DLP policy actions" },
      { id: "b", text: "A static DLP policy scoped to a security group updated manually" },
      { id: "c", text: "Conditional Access with sign-in risk" },
      { id: "d", text: "A retention policy with an adaptive scope" },
    ],
    correct: ["a"],
    explanation:
      "Adaptive Protection consumes insider risk levels (minor, moderate, elevated) and dynamically selects which DLP policy actions apply, tightening controls for higher-risk users and easing them as risk drops. It requires Insider Risk Management to be configured.",
    difficulty: 2,
    reference: { label: "Adaptive Protection", url: `${docs}/purview/insider-risk-management-adaptive-protection` },
  },
  {
    id: "sc401-q28",
    domainId: "dlp",
    type: "single",
    prompt:
      "Which Purview feature tells you exactly which retention policies and labels apply to a specific mailbox or site, and why?",
    options: [
      { id: "a", text: "Policy lookup" },
      { id: "b", text: "Content explorer" },
      { id: "c", text: "Activity explorer" },
      { id: "d", text: "Compliance Manager" },
    ],
    correct: ["a"],
    explanation:
      "Policy lookup resolves the retention settings in force for a given location, which is the fastest way to debug unexpected precedence outcomes. Content and Activity explorer report on classification inventory and activity instead.",
    difficulty: 2,
    reference: { label: "Policy lookup for retention", url: `${docs}/purview/retention` },
  },
  {
    id: "sc401-q29",
    domainId: "dlp",
    type: "single",
    prompt:
      "A record must be reviewed by a custodian before it is permanently deleted at the end of its retention period. What should you configure on the retention label?",
    options: [
      { id: "a", text: "Disposition review, with reviewers assigned to the stage" },
      { id: "b", text: "Auto-apply based on a sensitive info type" },
      { id: "c", text: "A preservation lock on the policy" },
      { id: "d", text: "An adaptive scope" },
    ],
    correct: ["a"],
    explanation:
      "Disposition review routes items to named reviewers at the end of the retention period so they can approve deletion, extend retention, or relabel. Preservation lock prevents the policy itself from being weakened, which is a different control.",
    difficulty: 2,
    reference: { label: "Disposition of content", url: `${docs}/purview/disposition` },
  },
  {
    id: "sc401-q30",
    domainId: "dlp",
    type: "single",
    prompt:
      "Regulators require that a retention policy cannot be disabled, deleted, or made less restrictive by any administrator once applied. What should you apply?",
    options: [
      { id: "a", text: "Preservation lock on the retention policy" },
      { id: "b", text: "A resource lock in the Azure portal" },
      { id: "c", text: "An eDiscovery hold" },
      { id: "d", text: "Purge protection" },
    ],
    correct: ["a"],
    explanation:
      "Preservation lock makes a retention policy immutable: it can be extended or broadened but never weakened or removed, which satisfies regulations such as SEC 17a-4. Azure resource locks and Key Vault purge protection are unrelated Azure controls.",
    difficulty: 3,
    reference: { label: "Use preservation lock", url: `${docs}/purview/retention-preservation-lock` },
  },
  {
    id: "sc401-q31",
    domainId: "dlp",
    type: "multi",
    prompt:
      "Which two statements about retention labels versus retention policies are correct? (Choose two.)",
    options: [
      { id: "a", text: "A retention label is applied to individual items and travels with the item" },
      { id: "b", text: "A retention policy applies at the container level, such as an entire mailbox or site" },
      { id: "c", text: "Retention policies can trigger disposition review" },
      { id: "d", text: "Retention labels cannot be applied automatically" },
    ],
    correct: ["a", "b"],
    explanation:
      "Labels are item-level and follow the item as it moves, and they alone support disposition review, records declaration, and event-based retention. Policies operate at the location level. Labels can absolutely be auto-applied by policy.",
    difficulty: 2,
    reference: { label: "Retention labels and policies", url: `${docs}/purview/retention` },
  },

  // -------------------------------------------------------------------- risk
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
    reference: { label: "Import HR data", url: `${docs}/purview/import-hr-data` },
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
    reference: { label: "Get started with Activity explorer", url: `${docs}/purview/data-classification-activity-explorer` },
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
    reference: { label: "DSPM for AI", url: `${docs}/purview/dspm-for-ai` },
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
    reference: { label: "Adaptive Protection", url: `${docs}/purview/insider-risk-management-adaptive-protection` },
  },
  {
    id: "sc401-q32",
    domainId: "risk",
    type: "single",
    prompt:
      "Which Insider Risk Management policy template should you choose to detect a user exfiltrating data after their departure has been recorded?",
    options: [
      { id: "a", text: "Data theft by departing users" },
      { id: "b", text: "General data leaks" },
      { id: "c", text: "Security policy violations" },
      { id: "d", text: "Risky browser usage" },
    ],
    correct: ["a"],
    explanation:
      "The departing-user template pairs the HR resignation or termination trigger with exfiltration indicators such as downloading to USB, copying to cloud storage, or emailing to personal accounts. General data leaks has no departure trigger.",
    difficulty: 1,
    reference: { label: "Insider risk policy templates", url: `${docs}/purview/insider-risk-management-policy-templates` },
  },
  {
    id: "sc401-q33",
    domainId: "risk",
    type: "single",
    prompt:
      "By default, how does Insider Risk Management protect the privacy of users under investigation?",
    options: [
      { id: "a", text: "Usernames are pseudonymized in alerts and reports until an investigator with the right role reveals them" },
      { id: "b", text: "All alerts are anonymous and identities can never be revealed" },
      { id: "c", text: "Alerts are visible only to the affected user" },
      { id: "d", text: "User identity is stored only in Microsoft Entra audit logs" },
    ],
    correct: ["a"],
    explanation:
      "Anonymization (pseudonymization) is on by default so triage can occur without exposing identities, and the identity can be revealed by users holding the appropriate Insider Risk Management role when the case warrants it.",
    difficulty: 2,
    reference: { label: "Insider risk management settings", url: `${docs}/purview/insider-risk-management-settings` },
  },
  {
    id: "sc401-q34",
    domainId: "risk",
    type: "single",
    prompt:
      "An insider risk case requires visual evidence of what a user did on their device at the moment of a policy match. Which feature provides this, subject to explicit configuration and approval?",
    options: [
      { id: "a", text: "Forensic evidence capture" },
      { id: "b", text: "Live response in Defender for Endpoint" },
      { id: "c", text: "Content search in eDiscovery" },
      { id: "d", text: "Activity explorer export" },
    ],
    correct: ["a"],
    explanation:
      "Forensic evidence captures device screen recordings around risky activity, gated by opt-in device onboarding, explicit policy configuration, and a request-and-approval workflow because of its privacy impact.",
    difficulty: 2,
    reference: { label: "Forensic evidence", url: `${docs}/purview/insider-risk-management-forensic-evidence` },
  },
  {
    id: "sc401-q35",
    domainId: "risk",
    type: "single",
    prompt:
      "What is the correct order of the Insider Risk Management workflow?",
    options: [
      { id: "a", text: "Policy → alert → triage → investigate (case) → action, such as a notice, escalation to eDiscovery, or resolution" },
      { id: "b", text: "Case → policy → alert → triage" },
      { id: "c", text: "Alert → policy → case → indicator" },
      { id: "d", text: "Indicator → notice template → policy → alert" },
    ],
    correct: ["a"],
    explanation:
      "A policy generates alerts when triggering events and indicators coincide. Analysts triage alerts, promote significant ones into cases for investigation, then act — sending a notice from a template, escalating for investigation, or resolving the case.",
    difficulty: 2,
    reference: { label: "Insider risk management workflow", url: `${docs}/purview/insider-risk-management-solution-overview` },
  },
  {
    id: "sc401-q36",
    domainId: "risk",
    type: "single",
    prompt:
      "Which prerequisite must be satisfied before Insider Risk Management or DSPM for AI can report on user activity at all?",
    options: [
      { id: "a", text: "Microsoft Purview Audit must be turned on so activity is being recorded" },
      { id: "b", text: "Information barriers must be configured" },
      { id: "c", text: "Customer Key must be deployed" },
      { id: "d", text: "All users must have sensitivity labels applied" },
    ],
    correct: ["a"],
    explanation:
      "Both solutions consume the unified audit log, so auditing must be enabled — it is on by default for new tenants. Without audit events there is no activity signal to evaluate.",
    difficulty: 2,
    reference: { label: "Turn auditing on or off", url: `${docs}/purview/audit-log-enable-disable` },
  },
  {
    id: "sc401-q37",
    domainId: "risk",
    type: "single",
    prompt:
      "In DSPM for AI, which category would ChatGPT Enterprise fall under?",
    options: [
      { id: "a", text: "Enterprise AI apps" },
      { id: "b", text: "Copilot experiences and agents" },
      { id: "c", text: "Other AI apps" },
      { id: "d", text: "Managed devices" },
    ],
    correct: ["a"],
    explanation:
      "DSPM for AI groups activity into Copilot experiences and agents (Microsoft 365 Copilot, Copilot Studio), Enterprise AI apps (such as registered ChatGPT Enterprise workspaces and Entra-registered AI apps), and Other AI apps (consumer third-party sites such as Gemini).",
    difficulty: 2,
    reference: { label: "DSPM for AI", url: `${docs}/purview/dspm-for-ai` },
  },
  {
    id: "sc401-q38",
    domainId: "risk",
    type: "multi",
    prompt:
      "Which two prerequisites are required before DSPM for AI can report on sensitive information shared with third-party AI websites? (Choose two.)",
    options: [
      { id: "a", text: "Install the Microsoft Purview browser extension" },
      { id: "b", text: "Onboard devices to Microsoft Purview" },
      { id: "c", text: "Deploy the Information Protection scanner" },
      { id: "d", text: "Enable preservation lock on retention policies" },
    ],
    correct: ["a", "b"],
    explanation:
      "Visibility into third-party AI sites depends on endpoint signal: devices must be onboarded to Purview and the browser extension installed so prompts and uploads in the browser can be evaluated. The scanner covers on-premises files, and preservation lock is a retention control.",
    difficulty: 2,
    reference: { label: "DSPM for AI considerations", url: `${docs}/purview/dspm-for-ai-considerations` },
  },
  {
    id: "sc401-q39",
    domainId: "risk",
    type: "single",
    prompt:
      "Before a Microsoft 365 Copilot rollout, leadership wants to know which SharePoint sites contain sensitive, over-permissioned content that Copilot could surface. Which DSPM for AI feature answers this?",
    options: [
      { id: "a", text: "Data risk assessments, which run weekly by default across the top SharePoint sites by usage" },
      { id: "b", text: "Communication compliance policies" },
      { id: "c", text: "Retention label auto-apply policies" },
      { id: "d", text: "Information barrier segments" },
    ],
    correct: ["a"],
    explanation:
      "Data risk assessments identify oversharing — items with broad sharing links, unlabelled sensitive content, and stale data — and offer remediation such as restricting access by label, auto-labelling, or applying retention. A default assessment runs weekly over the busiest sites.",
    difficulty: 2,
    reference: { label: "DSPM for AI data risk assessments", url: `${docs}/purview/dspm-for-ai` },
  },
  {
    id: "sc401-q40",
    domainId: "risk",
    type: "single",
    prompt:
      "You must stop Microsoft 365 Copilot from summarising documents that carry a specific sensitivity label. What should you configure?",
    options: [
      { id: "a", text: "A DLP policy for the Microsoft 365 Copilot location that restricts processing of items with that label" },
      { id: "b", text: "A retention policy with a 1-day deletion period" },
      { id: "c", text: "An information barrier between the users and the site" },
      { id: "d", text: "A trainable classifier applied to the documents" },
    ],
    correct: ["a"],
    explanation:
      "The Microsoft 365 Copilot DLP location lets you exclude labelled content from Copilot processing and summarisation, which is the supported way to keep highly sensitive material out of AI responses.",
    difficulty: 2,
    reference: { label: "DLP for Microsoft 365 Copilot", url: `${docs}/purview/dlp-microsoft365-copilot-location-learn-about` },
  },
  {
    id: "sc401-q41",
    domainId: "risk",
    type: "single",
    prompt:
      "Which Insider Risk Management policy template detects users submitting risky prompts or receiving risky responses in Copilot and other generative AI apps?",
    options: [
      { id: "a", text: "Risky AI usage" },
      { id: "b", text: "Data theft by departing users" },
      { id: "c", text: "Patient data misuse" },
      { id: "d", text: "Security policy violations" },
    ],
    correct: ["a"],
    explanation:
      "The Risky AI usage template scores users based on risky interactions with AI apps, feeding the same alert, triage, and case workflow as other insider risk policies and contributing to Adaptive Protection risk levels.",
    difficulty: 2,
    reference: { label: "Insider risk policy templates", url: `${docs}/purview/insider-risk-management-policy-templates` },
  },
  {
    id: "sc401-q42",
    domainId: "risk",
    type: "single",
    prompt:
      "Legal has asked you to preserve and export all mailbox and SharePoint content relating to a departing executive for outside counsel. Which solution should you use?",
    options: [
      { id: "a", text: "Microsoft Purview eDiscovery, creating a case with holds, searches, and export" },
      { id: "b", text: "Content explorer export" },
      { id: "c", text: "An Insider Risk Management notice template" },
      { id: "d", text: "A retention policy with an adaptive scope" },
    ],
    correct: ["a"],
    explanation:
      "eDiscovery provides the case structure, legal hold, search, review, and export workflow required for litigation. Retention policies preserve content but do not provide search, review, or defensible export.",
    difficulty: 1,
    reference: { label: "Microsoft Purview eDiscovery", url: `${docs}/purview/edisc` },
  },
  {
    id: "sc401-q43",
    domainId: "risk",
    type: "single",
    prompt:
      "Which role should you assign to an analyst who must triage DLP alerts and investigate insider risk cases, but must not be able to change policy configuration?",
    options: [
      { id: "a", text: "Insider Risk Management Analysts, together with a DLP investigation role, following least privilege" },
      { id: "b", text: "Global Administrator" },
      { id: "c", text: "Compliance Data Administrator" },
      { id: "d", text: "Organization Management" },
    ],
    correct: ["a"],
    explanation:
      "Purview separates analyst duties (triage and investigate) from administrator duties (create and edit policies) through dedicated role groups. Global Administrator and Organization Management grant far more than the task requires.",
    difficulty: 2,
    reference: { label: "Insider risk roles and permissions", url: `${docs}/purview/insider-risk-management-configure` },
  },
  {
    id: "sc401-q44",
    domainId: "risk",
    type: "single",
    prompt:
      "Where do you respond to and manage DLP alerts raised across Exchange, SharePoint, Teams, and endpoints?",
    options: [
      { id: "a", text: "The Data loss prevention alerts dashboard in the Microsoft Purview portal, with alerts also surfacing in Microsoft Defender XDR" },
      { id: "b", text: "The Microsoft Entra admin center" },
      { id: "c", text: "The Exchange admin center transport rules page" },
      { id: "d", text: "Azure Monitor alerts" },
    ],
    correct: ["a"],
    explanation:
      "The DLP alerts dashboard in Purview is the primary console for triaging policy matches with full event detail, and those alerts also flow into Defender XDR so they can be correlated with other security signals.",
    difficulty: 1,
    reference: { label: "Learn about DLP alerts", url: `${docs}/purview/dlp-alerts-dashboard-learn` },
  },
  {
    id: "sc401-q45",
    domainId: "risk",
    type: "single",
    prompt:
      "How long does Microsoft Purview Audit (Standard) retain audit records for most events by default, and what extends that retention?",
    options: [
      { id: "a", text: "180 days by default, extended by Audit (Premium) licensing and audit retention policies to one year or more" },
      { id: "b", text: "24 hours, extended by enabling mailbox auditing" },
      { id: "c", text: "10 years for all tenants at no extra cost" },
      { id: "d", text: "Retention is unlimited and cannot be configured" },
    ],
    correct: ["a"],
    explanation:
      "Audit (Standard) retains most records for 180 days. Audit (Premium) raises default retention to one year, supports audit log retention policies for specific workloads or activities, and offers a ten-year add-on.",
    difficulty: 3,
    reference: { label: "Manage audit log retention policies", url: `${docs}/purview/audit-log-retention-policies` },
  },
  {
    id: "sc401-q46",
    domainId: "risk",
    type: "multi",
    prompt:
      "Which two actions can you take from a DSPM for AI data risk assessment to reduce oversharing before deploying Copilot? (Choose two.)",
    options: [
      { id: "a", text: "Create an auto-labeling policy for unlabelled sensitive files" },
      { id: "b", text: "Restrict access by label so Copilot cannot summarise the labelled items" },
      { id: "c", text: "Delete all external users from the tenant" },
      { id: "d", text: "Disable the unified audit log to reduce noise" },
    ],
    correct: ["a", "b"],
    explanation:
      "Assessments offer targeted remediation: auto-labelling unlabelled sensitive content and restricting Copilot processing of labelled items, alongside SharePoint Restricted Content Discovery and retention cleanup. Mass-deleting guests is disproportionate, and disabling audit would remove the signal the solution depends on.",
    difficulty: 2,
    reference: { label: "DSPM for AI", url: `${docs}/purview/dspm-for-ai` },
  },

  // ------------------------------------------------- protection (additional)
  {
    id: "sc401-q47",
    domainId: "protection",
    type: "single",
    prompt:
      "A custom sensitive information type is producing too many false positives on nine-digit numbers. Which SIT design element should you adjust to require corroborating evidence nearby?",
    options: [
      { id: "a", text: "Supporting elements within a proximity window, raising the confidence level" },
      { id: "b", text: "The label's encryption settings" },
      { id: "c", text: "The retention period of the policy" },
      { id: "d", text: "The adaptive scope of the DLP policy" },
    ],
    correct: ["a"],
    explanation:
      "A SIT combines a primary pattern with supporting elements — keywords, dictionaries, or checksums — found within a proximity window, and confidence levels reflect how much corroboration was present. Tightening these is the standard false-positive fix.",
    difficulty: 3,
    reference: { label: "Sensitive information type definitions", url: `${docs}/purview/sit-sensitive-information-type-entity-definitions` },
  },
  {
    id: "sc401-q48",
    domainId: "protection",
    type: "single",
    prompt:
      "What is the difference between publishing a sensitivity label and auto-applying it?",
    options: [
      { id: "a", text: "Publishing makes the label available for users to select; auto-applying assigns it based on content conditions without user action" },
      { id: "b", text: "Publishing encrypts the content; auto-applying only marks it" },
      { id: "c", text: "Publishing applies to email only; auto-applying applies to files only" },
      { id: "d", text: "They are two names for the same operation" },
    ],
    correct: ["a"],
    explanation:
      "A label policy publishes labels to selected users and groups so they appear in the client. An auto-labeling policy evaluates conditions such as sensitive info types and applies the label itself, either client-side in Office apps or service-side at rest.",
    difficulty: 1,
    reference: { label: "Create and publish sensitivity labels", url: `${docs}/purview/create-sensitivity-labels` },
  },
  {
    id: "sc401-q49",
    domainId: "protection",
    type: "single",
    prompt:
      "Which sensitivity label setting requires users to supply a reason before replacing a higher-sensitivity label with a lower one?",
    options: [
      { id: "a", text: "Require justification for changing a label, configured in the label policy settings" },
      { id: "b", text: "Mandatory labeling" },
      { id: "c", text: "Default label for documents" },
      { id: "d", text: "Content marking" },
    ],
    correct: ["a"],
    explanation:
      "Label policy settings include requiring justification for label downgrade or removal, and the justification is recorded in audit and Activity explorer. Mandatory labeling forces a label to be chosen but says nothing about downgrades.",
    difficulty: 2,
    reference: { label: "Label policy settings", url: `${docs}/purview/create-sensitivity-labels` },
  },
  {
    id: "sc401-q50",
    domainId: "protection",
    type: "single",
    prompt:
      "Which role is required to manage the creation and publishing of sensitivity labels while following least privilege?",
    options: [
      { id: "a", text: "Information Protection Admin" },
      { id: "b", text: "Global Administrator" },
      { id: "c", text: "eDiscovery Manager" },
      { id: "d", text: "Insider Risk Management Analyst" },
    ],
    correct: ["a"],
    explanation:
      "Purview provides scoped role groups such as Information Protection Admin (and narrower Analyst and Reader variants) for label administration, avoiding the over-provisioning of Global Administrator.",
    difficulty: 2,
    reference: { label: "Permissions in the Purview portal", url: `${docs}/purview/purview-permissions` },
  },
  {
    id: "sc401-q51",
    domainId: "protection",
    type: "single",
    prompt:
      "You want newly created documents in a specific department to receive a baseline label automatically, while still letting users raise the sensitivity. What should you configure?",
    options: [
      { id: "a", text: "A default label for documents in the label policy scoped to that department" },
      { id: "b", text: "A service-side auto-labeling policy with a Deny action" },
      { id: "c", text: "Mandatory labeling with no published labels" },
      { id: "d", text: "A retention label auto-apply policy" },
    ],
    correct: ["a"],
    explanation:
      "A default label pre-selects a starting classification on new content for the users the policy targets, and users can still choose a higher label. Retention labels manage lifecycle rather than sensitivity.",
    difficulty: 2,
    reference: { label: "Label policy settings", url: `${docs}/purview/create-sensitivity-labels` },
  },
  {
    id: "sc401-q52",
    domainId: "protection",
    type: "single",
    prompt:
      "Which statement about EDM is correct?",
    options: [
      { id: "a", text: "The sensitive data is hashed and salted before upload, so plaintext values never leave your environment" },
      { id: "b", text: "The full plaintext database is uploaded to Microsoft for matching" },
      { id: "c", text: "EDM can only match a single column of data" },
      { id: "d", text: "EDM requires the Information Protection scanner" },
    ],
    correct: ["a"],
    explanation:
      "EDM hashes and salts the sensitive table locally, uploading only the hashed index, and matching happens against those hashes. It supports multi-column schemas with primary and supporting fields.",
    difficulty: 2,
    reference: { label: "Exact data match based SITs", url: `${docs}/purview/sit-learn-about-exact-data-match-based-sits` },
  },
  {
    id: "sc401-q53",
    domainId: "protection",
    type: "single",
    prompt:
      "Which capability applies sensitivity labels to files already stored in a connected third-party cloud app such as Box or Google Drive?",
    options: [
      { id: "a", text: "Microsoft Defender for Cloud Apps file policies that apply a sensitivity label" },
      { id: "b", text: "Endpoint DLP" },
      { id: "c", text: "The Information Protection scanner" },
      { id: "d", text: "Retention label auto-apply" },
    ],
    correct: ["a"],
    explanation:
      "Defender for Cloud Apps connects to third-party SaaS via API connectors, scans content at rest, and its file policies can apply Purview sensitivity labels. The scanner handles on-premises repositories only.",
    difficulty: 2,
    reference: { label: "Apply labels with Defender for Cloud Apps", url: `${docs}/defender-cloud-apps/data-protection-policies` },
  },

  // -------------------------------------------------------- dlp (additional)
  {
    id: "sc401-q54",
    domainId: "dlp",
    type: "single",
    prompt:
      "Which DLP condition would you use to catch sensitive content leaving the organization, while ignoring the same content shared internally?",
    options: [
      { id: "a", text: "Content is shared from Microsoft 365 with people outside my organization" },
      { id: "b", text: "Content contains a sensitive info type, with no recipient condition" },
      { id: "c", text: "Document property is set to Confidential" },
      { id: "d", text: "File extension is .docx" },
    ],
    correct: ["a"],
    explanation:
      "The sharing condition distinguishes internal from external recipients, so the rule matches only outbound exposure. Without it, the rule would fire on all internal collaboration as well.",
    difficulty: 1,
    reference: { label: "DLP policy reference", url: `${docs}/purview/dlp-policy-reference` },
  },
  {
    id: "sc401-q55",
    domainId: "dlp",
    type: "single",
    prompt:
      "A DLP rule should trigger only when a document contains at least ten credit card numbers, not one. Which setting controls this?",
    options: [
      { id: "a", text: "The instance count (minimum and maximum) on the sensitive info type condition" },
      { id: "b", text: "The rule priority" },
      { id: "c", text: "The confidence level only" },
      { id: "d", text: "The policy's adaptive scope" },
    ],
    correct: ["a"],
    explanation:
      "Instance count sets how many matches of the sensitive info type are required for the rule to fire, which is how bulk-data rules are separated from single-instance rules. Confidence level governs match quality rather than volume.",
    difficulty: 2,
    reference: { label: "DLP policy reference", url: `${docs}/purview/dlp-policy-reference` },
  },
  {
    id: "sc401-q56",
    domainId: "dlp",
    type: "single",
    prompt:
      "Which DLP location must be selected to prevent sensitive content being pasted into a chat message in Microsoft Teams?",
    options: [
      { id: "a", text: "Teams chat and channel messages" },
      { id: "b", text: "Exchange email" },
      { id: "c", text: "Devices" },
      { id: "d", text: "On-premises repositories" },
    ],
    correct: ["a"],
    explanation:
      "The Teams chat and channel messages location applies DLP evaluation to messages themselves, blocking or warning in-line. The Devices location covers endpoint egress activities rather than Teams message content.",
    difficulty: 1,
    reference: { label: "DLP for Microsoft Teams", url: `${docs}/purview/dlp-microsoft-teams` },
  },
  {
    id: "sc401-q57",
    domainId: "dlp",
    type: "single",
    prompt:
      "Which retention setting starts the retention period only when a defined business event occurs, such as an employee leaving or a contract ending?",
    options: [
      { id: "a", text: "Event-based retention, using an event type on the retention label" },
      { id: "b", text: "Adaptive policy scope" },
      { id: "c", text: "Preservation lock" },
      { id: "d", text: "Disposition review" },
    ],
    correct: ["a"],
    explanation:
      "Event-based retention ties the start of the retention period to an event you record, rather than to item creation or last modification, which is how contract and employee-record schedules are usually expressed.",
    difficulty: 3,
    reference: { label: "Event-based retention", url: `${docs}/purview/event-driven-retention` },
  },
  {
    id: "sc401-q58",
    domainId: "dlp",
    type: "single",
    prompt:
      "A user deleted an email that is subject to a retention policy. Where does the item go so that retention is still honoured?",
    options: [
      { id: "a", text: "The hidden Recoverable Items folder in the mailbox, where it is retained until the period expires" },
      { id: "b", text: "It is permanently deleted immediately" },
      { id: "c", text: "It moves to the user's Archive mailbox root" },
      { id: "d", text: "It is copied to the compliance administrator's mailbox" },
    ],
    correct: ["a"],
    explanation:
      "Retention in Exchange works through the Recoverable Items folder: deleted items are preserved there invisibly to the user until the retention period lapses, so retention cannot be defeated by deleting mail.",
    difficulty: 2,
    reference: { label: "How retention works", url: `${docs}/purview/retention-policies-exchange` },
  },
  {
    id: "sc401-q59",
    domainId: "dlp",
    type: "single",
    prompt:
      "Which statement about DLP policy scoping is correct when a policy targets both Exchange and Devices?",
    options: [
      { id: "a", text: "Conditions and actions available differ per location, so some actions apply only to the endpoint location" },
      { id: "b", text: "All actions apply identically to every location" },
      { id: "c", text: "A policy can only ever target one location" },
      { id: "d", text: "Endpoint actions automatically apply to Exchange as well" },
    ],
    correct: ["a"],
    explanation:
      "The DLP condition and action surface is location-specific: activities such as copy to USB or print exist only for Devices, while actions such as blocking external recipients belong to Exchange. Policies spanning locations therefore behave differently in each.",
    difficulty: 2,
    reference: { label: "DLP policy reference", url: `${docs}/purview/dlp-policy-reference` },
  },

  // ------------------------------------------------------- risk (additional)
  {
    id: "sc401-q60",
    domainId: "risk",
    type: "single",
    prompt:
      "Which Insider Risk Management concept determines what must happen before a user is brought into scope for scoring at all?",
    options: [
      { id: "a", text: "The triggering event, such as an HR resignation record or a DLP policy match" },
      { id: "b", text: "The notice template" },
      { id: "c", text: "The case disposition" },
      { id: "d", text: "The anonymization setting" },
    ],
    correct: ["a"],
    explanation:
      "Policies score a user only after a triggering event places them in scope; indicators observed afterwards then generate risk. Without a triggering event no alerts are produced, which is why HR connectors and DLP integration matter so much.",
    difficulty: 3,
    reference: { label: "Insider risk management policies", url: `${docs}/purview/insider-risk-management-policies` },
  },
];
