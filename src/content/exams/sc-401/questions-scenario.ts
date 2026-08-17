import type { Question } from "../../types";

const docs = "https://learn.microsoft.com/en-us";

export const sc401ScenarioQuestions: Question[] = [
  // ---- repeated scenario: protecting customer records --------------------
  {
    id: "sc401-s1",
    domainId: "protection",
    type: "meets-goal",
    scenario:
      "Contoso holds a database of 80,000 customer records containing full name, account number, and date of birth. Documents that contain these specific customer values must be detected with a low false-positive rate, labelled automatically wherever they already sit in SharePoint Online, and blocked from being copied to USB drives on managed Windows devices.",
    prompt:
      "Solution: You create an exact data match (EDM) sensitive information type from the customer database, configure a service-side auto-labeling policy for SharePoint, and create an Endpoint DLP rule restricting 'Copy to removable USB device'.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "EDM matches the organisation's real values rather than a pattern, which is what keeps false positives low at this scale. Service-side auto-labeling scans content at rest in SharePoint without user involvement, and Endpoint DLP is the control that restricts copying to removable media on onboarded devices.",
    difficulty: 3,
    reference: { label: "Learn about EDM based SITs", url: `${docs}/purview/sit-learn-about-exact-data-match-based-sits` },
  },
  {
    id: "sc401-s2",
    domainId: "protection",
    type: "meets-goal",
    scenario:
      "Contoso holds a database of 80,000 customer records containing full name, account number, and date of birth. Documents that contain these specific customer values must be detected with a low false-positive rate, labelled automatically wherever they already sit in SharePoint Online, and blocked from being copied to USB drives on managed Windows devices.",
    prompt:
      "Solution: You create a custom sensitive information type using a regular expression for the account number format, enable client-side auto-labeling in the label settings, and apply a sensitivity label that encrypts the files.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "A regex matches anything shaped like an account number, so false positives stay high — the opposite of the requirement. Client-side auto-labeling only fires when a user opens the document in an Office app, so existing SharePoint content is not labelled, and label encryption restricts what a recipient can do rather than blocking the USB copy operation itself.",
    difficulty: 3,
    reference: { label: "Apply a sensitivity label automatically", url: `${docs}/purview/apply-sensitivity-label-automatically` },
  },
  {
    id: "sc401-s3",
    domainId: "protection",
    type: "meets-goal",
    scenario:
      "Contoso holds a database of 80,000 customer records containing full name, account number, and date of birth. Documents that contain these specific customer values must be detected with a low false-positive rate, labelled automatically wherever they already sit in SharePoint Online, and blocked from being copied to USB drives on managed Windows devices.",
    prompt:
      "Solution: You create an exact data match sensitive information type, configure a service-side auto-labeling policy for SharePoint, and apply a container label to the SharePoint sites that blocks access from unmanaged devices.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "Classification and auto-labeling are correct, but a container label governs the site's own settings — privacy, guest access, and unmanaged device access — and does nothing to the files inside it. Blocking a copy to removable media on a managed device requires Endpoint DLP.",
    difficulty: 3,
    reference: { label: "Sensitivity labels for containers", url: `${docs}/purview/sensitivity-labels-teams-groups-sites` },
  },

  // ---- repeated scenario: departing employee -----------------------------
  {
    id: "sc401-s4",
    domainId: "risk",
    type: "meets-goal",
    scenario:
      "Fabrikam must detect employees who download unusual volumes of company data in the weeks around their resignation, and must be able to review the browsing and file activity that led to an alert before deciding whether to escalate.",
    prompt:
      "Solution: You configure the Microsoft 365 HR connector to import resignation dates, create an Insider Risk Management policy from the 'Data theft by departing users' template, and enable forensic evidence capture.\n\nDoes this solution meet the goal?",
    correct: ["yes"],
    explanation:
      "The HR connector supplies the resignation signal that the departing-user template uses as its triggering event, and forensic evidence capture gives reviewers visual context on the activity behind an alert, which is exactly what the escalation decision requires.",
    difficulty: 2,
    reference: { label: "Import HR data", url: `${docs}/purview/import-hr-data` },
  },
  {
    id: "sc401-s5",
    domainId: "risk",
    type: "meets-goal",
    scenario:
      "Fabrikam must detect employees who download unusual volumes of company data in the weeks around their resignation, and must be able to review the browsing and file activity that led to an alert before deciding whether to escalate.",
    prompt:
      "Solution: You create a data loss prevention policy that blocks downloads over 100 MB and review DLP alerts in the Microsoft Purview portal.\n\nDoes this solution meet the goal?",
    correct: ["no"],
    explanation:
      "A blanket size threshold has no awareness of who is leaving, so it cannot correlate activity with resignation dates, and it will disrupt legitimate work. DLP alerts also provide no forensic replay of the user's activity, which the review requirement calls for.",
    difficulty: 2,
    reference: { label: "Insider risk policy templates", url: `${docs}/purview/insider-risk-management-policy-templates` },
  },

  // ---- statement grids ---------------------------------------------------
  {
    id: "sc401-s6",
    domainId: "dlp",
    type: "statements",
    scenario:
      "A document in SharePoint is covered by a retention label that retains content for seven years and then deletes it, and separately by a retention policy that deletes content after three years.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "The document is deleted after three years.", correct: false },
      { id: "b", text: "The document is retained for seven years.", correct: true },
      { id: "c", text: "The explicit retention label takes precedence over the policy.", correct: true },
    ],
    correct: ["b", "c"],
    explanation:
      "The principles of retention resolve this: retention always wins over deletion, and the longest retention period wins, so the content survives seven years. An explicitly applied label also outranks an implicitly applied policy. The shortest-deletion rule only applies among deletion settings once retention no longer blocks removal.",
    difficulty: 3,
    reference: { label: "The principles of retention", url: `${docs}/purview/retention` },
  },
  {
    id: "sc401-s7",
    domainId: "protection",
    type: "statements",
    scenario:
      "A sensitivity label named Confidential is published to all users. It applies encryption, adds a watermark, and is configured as the default label for documents in Word, Excel, and PowerPoint.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Existing unlabelled documents in SharePoint are labelled automatically.", correct: false },
      { id: "b", text: "New documents created in Word receive the label without user action.", correct: true },
      { id: "c", text: "A user can change the label to a lower classification, possibly with a justification prompt.", correct: true },
    ],
    correct: ["b", "c"],
    explanation:
      "A default label applies only to newly created content; labelling content already at rest requires a service-side auto-labeling policy. Users can downgrade a label when permitted by policy, and label settings can require justification for that downgrade, which is recorded for auditing.",
    difficulty: 2,
    reference: { label: "Sensitivity label policy settings", url: `${docs}/purview/sensitivity-labels` },
  },
  {
    id: "sc401-s8",
    domainId: "risk",
    type: "statements",
    scenario:
      "Adaptive Protection is enabled in Microsoft Purview and linked to a data loss prevention policy that applies stricter controls to users at elevated insider risk.",
    prompt: "For each statement, select Yes if it is true. Otherwise select No.",
    statements: [
      { id: "a", text: "Insider Risk Management must be configured for Adaptive Protection to work.", correct: true },
      { id: "b", text: "Controls relax again if a user's risk level falls.", correct: true },
      { id: "c", text: "A user who triggers one alert is blocked permanently.", correct: false },
    ],
    correct: ["a", "b"],
    explanation:
      "Adaptive Protection consumes insider risk levels, so Insider Risk Management is a prerequisite. Its whole purpose is to be dynamic: enforcement tightens as risk rises and relaxes as it falls, rather than applying a permanent block from a single alert.",
    difficulty: 2,
    reference: { label: "Adaptive Protection", url: `${docs}/purview/insider-risk-management-adaptive-protection` },
  },

  // ---- ordering ----------------------------------------------------------
  {
    id: "sc401-s9",
    domainId: "protection",
    type: "ordering",
    prompt:
      "You need to deploy a new sensitivity label that encrypts documents for the Finance department. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Create the sensitivity label and configure its encryption and content marking settings" },
      { id: "b", text: "Publish the label with a label policy scoped to the Finance group" },
      { id: "c", text: "Users apply the label in Office apps, or an auto-labeling policy applies it" },
      { id: "d", text: "Monitor adoption using Content explorer and Activity explorer" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "A label must exist and be configured before it can be published, and it is invisible to users until a label policy publishes it to them. Only once it is being applied is there anything for Content explorer and Activity explorer to report on.",
    difficulty: 1,
    reference: { label: "Get started with sensitivity labels", url: `${docs}/purview/get-started-with-sensitivity-labels` },
  },
  {
    id: "sc401-s10",
    domainId: "protection",
    type: "ordering",
    prompt:
      "You must create an exact data match (EDM) sensitive information type. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Define the schema describing the sensitive data table and its columns" },
      { id: "b", text: "Create the EDM sensitive information type and map its patterns to the schema" },
      { id: "c", text: "Hash and upload the sensitive data table using the EDM upload agent" },
      { id: "d", text: "Use the EDM sensitive information type in a DLP or auto-labeling policy" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The schema defines the shape of the data before anything can reference it, then the sensitive information type maps detection patterns onto those columns. Only hashed values are uploaded — the plaintext never leaves your environment — and the type becomes useful once a policy consumes it.",
    difficulty: 3,
    reference: { label: "Get started with EDM", url: `${docs}/purview/sit-get-started-exact-data-match-based-sits-overview` },
  },
  {
    id: "sc401-s11",
    domainId: "dlp",
    type: "ordering",
    prompt:
      "You are deploying Microsoft Purview Endpoint DLP to Windows devices. Arrange the steps in order.",
    steps: [
      { id: "a", text: "Onboard the Windows devices to Microsoft Purview" },
      { id: "b", text: "Configure Endpoint DLP settings such as unallowed apps and browser restrictions" },
      { id: "c", text: "Create a DLP policy that includes the Devices location" },
      { id: "d", text: "Run the policy in test mode with policy tips before enforcing" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "Devices must be onboarded before endpoint activity can be seen at all. Global Endpoint DLP settings establish the environment the rules operate in, the policy then targets the Devices location, and running in test mode first surfaces the business impact before anything is blocked.",
    difficulty: 2,
    reference: { label: "Get started with Endpoint DLP", url: `${docs}/purview/endpoint-dlp-getting-started` },
  },
  {
    id: "sc401-s12",
    domainId: "risk",
    type: "ordering",
    prompt:
      "An Insider Risk Management alert requires investigation. Arrange the workflow stages in order.",
    steps: [
      { id: "a", text: "Triage the alert and confirm it needs investigation" },
      { id: "b", text: "Create a case from the alert" },
      { id: "c", text: "Review user activity, forensic evidence, and contributing indicators" },
      { id: "d", text: "Resolve the case, escalating for investigation or sending a notice template" },
    ],
    correct: ["a", "b", "c", "d"],
    explanation:
      "The Insider Risk Management workflow runs alert → triage → investigate → action. Alerts are triaged first to filter noise, confirmed alerts become cases, evidence is reviewed within the case, and the case is then resolved — dismissed, escalated for legal investigation, or closed after issuing a reminder notice.",
    difficulty: 2,
    reference: { label: "Insider risk management activities", url: `${docs}/purview/insider-risk-management-activities` },
  },
];
