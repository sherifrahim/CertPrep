import type { Flashcard } from "../../types";

export const sc401ExtraFlashcards: Flashcard[] = [
  // -------------------------------------------------------------- protection
  {
    id: "sc401-d1",
    domainId: "protection",
    front: "When is document fingerprinting the right tool?",
    back: "For standardised forms and templates — contracts, patent applications, HR forms. It converts the template into a pattern and detects derived documents, even when surrounding wording varies.",
  },
  {
    id: "sc401-d2",
    domainId: "protection",
    front: "Pre-trained vs custom trainable classifiers",
    back: "Pre-trained ship ready to use (resumes, source code, harassment, profanity). Custom ones you train with at least 50 positive samples and then test with a separate seed set before publishing.",
  },
  {
    id: "sc401-d3",
    domainId: "protection",
    front: "What does Do Not Forward actually grant?",
    back: "View, reply, and reply-all to the specific recipients — withholding forward, print, and extract. It is a predefined encryption template, not a visual marking.",
  },
  {
    id: "sc401-d4",
    domainId: "protection",
    front: "Message Encryption vs Advanced Message Encryption",
    back: "Both deliver encrypted mail to any recipient via a portal. Advanced adds revocation of already-sent messages, expiration policies, and multiple custom-branded portal templates.",
  },
  {
    id: "sc401-d5",
    domainId: "protection",
    front: "Content explorer vs Activity explorer — one line each",
    back: "Content explorer: what is labelled right now, and where it lives. Activity explorer: what happened to labels over time — applied, changed, downgraded, shared externally.",
  },
  {
    id: "sc401-d6",
    domainId: "protection",
    front: "What does the Information Protection scanner reach?",
    back: "On-premises Windows file shares and SharePoint Server. Run it in discovery mode first to report what it would do, then switch to enforcement to apply labels.",
  },
  {
    id: "sc401-d7",
    domainId: "protection",
    front: "Why simulate an auto-labeling policy first?",
    back: "Simulation shows exactly which items would be labelled without changing anything, so you can tune conditions. Mislabelling at scale is disruptive and slow to unwind.",
  },
  {
    id: "sc401-d8",
    domainId: "protection",
    front: "Label priority — which label wins?",
    back: "The label lowest in the list order is the highest priority. When multiple auto-labeling conditions match, the highest-priority (most restrictive by your ordering) label is applied.",
  },
  {
    id: "sc401-d9",
    domainId: "protection",
    front: "What does OCR add to classification?",
    back: "It extracts text from images (screenshots, scans, photos of documents) so sensitive info types can evaluate content that would otherwise be invisible to detection.",
  },
  {
    id: "sc401-d10",
    domainId: "protection",
    front: "Sensitive info type confidence and proximity",
    back: "Confidence level reflects how much corroborating evidence was found; proximity is how close supporting keywords must sit to the primary pattern. Raising both cuts false positives.",
  },

  // --------------------------------------------------------------------- dlp
  {
    id: "sc401-d11",
    domainId: "dlp",
    front: "Block vs Block with override",
    back: "Block stops the action outright. Block with override lets the user proceed after supplying a business justification, which is recorded — the usual choice where legitimate exceptions exist.",
  },
  {
    id: "sc401-d12",
    domainId: "dlp",
    front: "What's needed to control pasting into AI websites?",
    back: "Device onboarded to Purview, the Purview browser extension or a natively supported browser, the site listed as a sensitive service domain, and a DLP rule restricting the paste or upload activity.",
  },
  {
    id: "sc401-d13",
    domainId: "dlp",
    front: "How do you stop Copilot summarising labelled content?",
    back: "A DLP policy scoped to the Microsoft 365 Copilot location that restricts content carrying the selected sensitivity labels. It blocks processing rather than merely detecting it.",
  },
  {
    id: "sc401-d14",
    domainId: "dlp",
    front: "What does Policy lookup answer?",
    back: "Which retention policies and labels apply to a specific user, mailbox, or site — the fastest way to resolve precedence disputes about why content was or was not retained.",
  },
  {
    id: "sc401-d15",
    domainId: "dlp",
    front: "Regulatory record vs record vs standard label",
    back: "A regulatory record cannot be unlocked, relabelled, or deleted by anyone, including admins. A record can be unlocked by an authorised user. A standard retention label just governs lifecycle.",
  },
  {
    id: "sc401-d16",
    domainId: "dlp",
    front: "What is disposition review?",
    back: "At the end of a retention period, content is routed to named reviewers who must approve permanent deletion, extend retention, or relabel — producing a documented disposal trail.",
  },
  {
    id: "sc401-d17",
    domainId: "dlp",
    front: "Endpoint DLP: which activities can you restrict?",
    back: "Copy to USB, copy to network share, print, copy to clipboard, upload to unallowed cloud domains, access by unallowed or restricted apps, paste to browser, and remote desktop transfer.",
  },
  {
    id: "sc401-d18",
    domainId: "dlp",
    front: "What is just-in-time protection in Endpoint DLP?",
    back: "Egress on an unevaluated file is held until classification completes, so content is not leaked while waiting for a verdict — a fail-closed rather than fail-open default.",
  },
  {
    id: "sc401-d19",
    domainId: "dlp",
    front: "Why test a DLP policy before enforcing?",
    back: "Test mode with policy tips shows what would match and lets users see notices without blocking work, so you can measure business impact and fix false positives before enforcement.",
  },
  {
    id: "sc401-d20",
    domainId: "dlp",
    front: "Retention: policy vs label",
    back: "A policy applies broadly to a location and needs no user action. A label is applied to individual items (manually, by default, or auto-applied) and, being explicit, wins over a policy in precedence.",
  },

  // -------------------------------------------------------------------- risk
  {
    id: "sc401-d21",
    domainId: "risk",
    front: "What is forensic evidence in Insider Risk Management?",
    back: "Visual capture of risky activity on onboarded devices, gated by explicit opt-in, user scoping, and request approval so privacy controls remain intact.",
  },
  {
    id: "sc401-d22",
    domainId: "risk",
    front: "How does Insider Risk protect user privacy?",
    back: "Privacy settings pseudonymise usernames in alerts and cases so reviewers assess behaviour, not individuals. Identification is available to permissioned roles only when a case escalates.",
  },
  {
    id: "sc401-d23",
    domainId: "risk",
    front: "Insider Risk triggering event vs indicator",
    back: "The triggering event brings a user into policy scope (a resignation date from the HR connector, a DLP match). Indicators are the signals then scored for that user — downloads, USB copies, site visits.",
  },
  {
    id: "sc401-d24",
    domainId: "risk",
    front: "What is a notice template?",
    back: "A reusable email sent from a case to remind a user of policy — the lightest resolution, used where activity is risky but not malicious, and recorded against the case.",
  },
  {
    id: "sc401-d25",
    domainId: "risk",
    front: "eDiscovery (Premium) over Content search",
    back: "Adds case and custodian management, legal hold with notifications, review sets with near-duplicate and theme analysis, and defensible export with chain of custody.",
  },
  {
    id: "sc401-d26",
    domainId: "risk",
    front: "Audit Standard vs Audit Premium",
    back: "Premium adds high-value events such as MailItemsAccessed and Send, longer default retention, custom audit retention policies with priorities, and higher API bandwidth for export.",
  },
  {
    id: "sc401-d27",
    domainId: "risk",
    front: "Are audit records editable?",
    back: "No. They are immutable by design — an editable audit log would have no evidentiary value. You control retention duration, not content.",
  },
  {
    id: "sc401-d28",
    domainId: "risk",
    front: "DSPM for AI prerequisites",
    back: "Purview Audit enabled, devices onboarded to Purview, and the Purview browser extension installed — the last two being what makes third-party AI site activity visible at all.",
  },
  {
    id: "sc401-d29",
    domainId: "risk",
    front: "How does DSPM for AI categorise apps?",
    back: "Copilot experiences and agents (Microsoft 365 Copilot, Copilot Studio), Enterprise AI apps (for example ChatGPT Enterprise), and Other AI apps (supported third-party sites such as Gemini).",
  },
  {
    id: "sc401-d30",
    domainId: "risk",
    front: "Oversharing remediations from a data risk assessment",
    back: "Label unlabelled sensitive items, restrict access by label so Copilot cannot summarise them, use SharePoint Restricted Content Discovery to exempt a site, remove sharing links, and delete stale content via retention.",
  },
  {
    id: "sc401-d31",
    domainId: "risk",
    front: "What is the risky AI usage insider risk template?",
    back: "An Insider Risk Management policy template that scores risky prompts and responses in Copilot and other generative AI apps, feeding user risk levels that Adaptive Protection can act on.",
  },
];
