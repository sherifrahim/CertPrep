import type { Flashcard } from "../../types";

export const sc401Flashcards: Flashcard[] = [
  // -------------------------------------------------------------- protection
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
    back: "Purview Message Encryption protects mail to any recipient including external. Advanced adds revocation of sent mail and expiration policies for the branded encryption portal experience.",
  },
  {
    id: "sc401-c13",
    domainId: "protection",
    front: "How does EDM protect your source data?",
    back: "The sensitive table is hashed and salted locally; only the hashed index is uploaded. Plaintext never leaves your environment, and matching happens against hashes. Supports multi-column schemas with primary and supporting fields.",
  },
  {
    id: "sc401-c14",
    domainId: "protection",
    front: "How do you reduce SIT false positives?",
    back: "Tune supporting elements (keywords, dictionaries, checksums) and the proximity window, raise the required confidence level, and increase the instance count so bulk data is required rather than a single match.",
  },
  {
    id: "sc401-c15",
    domainId: "protection",
    front: "Sensitivity label order",
    back: "Labels are ordered least to most sensitive; a label lower in the list is higher sensitivity. That order drives auto-labelling decisions and the downgrade-justification warnings.",
  },
  {
    id: "sc401-c16",
    domainId: "protection",
    front: "Publishing vs auto-applying a label",
    back: "A label policy publishes labels so users can select them (and sets defaults, mandatory labelling, and justification requirements). An auto-labeling policy applies labels itself based on content conditions.",
  },
  {
    id: "sc401-c17",
    domainId: "protection",
    front: "Content explorer vs Activity explorer",
    back: "Content explorer = current inventory: which items carry which labels or sensitive info types, and where. Activity explorer = time series of activity: label applied, changed, downgraded, shared externally.",
  },
  {
    id: "sc401-c18",
    domainId: "protection",
    front: "What does label encryption actually enforce?",
    back: "Usage rights embedded in the file — Co-Author, Reviewer, Viewer, and granular rights like Extract or Print — assigned to specific users or groups. They travel with the file, including outside the tenant.",
  },
  {
    id: "sc401-c19",
    domainId: "protection",
    front: "Why enable OCR?",
    back: "So sensitive info types can evaluate text inside images (scans, screenshots, photos of documents). Without OCR, image-borne sensitive data is invisible to classification, DLP, and auto-labelling.",
  },

  // --------------------------------------------------------------------- dlp
  {
    id: "sc401-c6",
    domainId: "dlp",
    front: "DLP rule precedence",
    back: "Rules evaluate in priority order starting at 0. Across matching rules, the most restrictive action wins; non-conflicting actions such as notifications can still apply.",
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
    id: "sc401-c20",
    domainId: "dlp",
    front: "Why run a DLP policy in simulation mode?",
    back: "It reports what the policy would have matched without enforcing actions, so you can tune conditions and size the impact. Policy tips can optionally be shown during simulation to prepare users.",
  },
  {
    id: "sc401-c21",
    domainId: "dlp",
    front: "Block vs block with override",
    back: "Block stops the action outright. Block with override shows a policy tip and lets the user proceed after giving a business justification, which is recorded for later review — the usual balance of control and productivity.",
  },
  {
    id: "sc401-c22",
    domainId: "dlp",
    front: "Endpoint DLP prerequisite",
    back: "Devices must be onboarded to Microsoft Purview (shared onboarding with Defender for Endpoint) and running a supported OS build. The Purview browser extension is additionally needed for non-Edge browsers.",
  },
  {
    id: "sc401-c23",
    domainId: "dlp",
    front: "What is just-in-time protection?",
    back: "Endpoint DLP holds egress actions on a file until classification has been evaluated, closing the gap where brand-new or freshly edited content could leave before it was ever scanned.",
  },
  {
    id: "sc401-c24",
    domainId: "dlp",
    front: "Retention label vs retention policy",
    back: "Labels are item-level, travel with the item, and alone support disposition review, records declaration, and event-based retention. Policies apply at the container level (whole mailbox, site, or Teams location).",
  },
  {
    id: "sc401-c25",
    domainId: "dlp",
    front: "What is preservation lock?",
    back: "It makes a retention policy immutable — it can be broadened or extended but never weakened, disabled, or deleted, by anyone. Required for regulations such as SEC 17a-4.",
  },
  {
    id: "sc401-c26",
    domainId: "dlp",
    front: "What is event-based retention?",
    back: "Retention whose clock starts at a recorded business event (employee departure, contract end, product discontinuation) rather than at item creation or last modification.",
  },
  {
    id: "sc401-c27",
    domainId: "dlp",
    front: "What is disposition review?",
    back: "At the end of a retention period, items are routed to named reviewers who approve permanent deletion, extend retention, or apply a different label — creating an auditable disposal record.",
  },
  {
    id: "sc401-c28",
    domainId: "dlp",
    front: "Where do deleted-but-retained emails live?",
    back: "The hidden Recoverable Items folder in the mailbox. Users cannot see or purge them, so retention survives user deletion attempts.",
  },
  {
    id: "sc401-c29",
    domainId: "dlp",
    front: "What does instance count do in a DLP rule?",
    back: "Sets how many matches of a sensitive info type are needed to trigger — the way you separate 'one credit card' from 'a bulk export of card data' into different severity rules.",
  },

  // -------------------------------------------------------------------- risk
  {
    id: "sc401-c10",
    domainId: "risk",
    front: "Insider Risk Management policy templates",
    back: "Data theft by departing users, data leaks (general, priority users, disgruntled users), security policy violations, patient data misuse, risky browser usage, risky AI usage, and forensic evidence templates.",
  },
  {
    id: "sc401-c11",
    domainId: "risk",
    front: "Content explorer vs Activity explorer (risk view)",
    back: "Content explorer is a current inventory of labelled and sensitive items. Activity explorer is the time series of label and DLP activities — applied, changed, downgraded, shared externally.",
  },
  {
    id: "sc401-c12",
    domainId: "risk",
    front: "What does DSPM for AI provide?",
    back: "Discovery and reporting of sensitive data flowing into AI apps (Copilot and third-party), oversharing data risk assessments, and one-click policies applying DLP, labelling, and insider risk controls to AI interactions.",
  },
  {
    id: "sc401-c30",
    domainId: "risk",
    front: "Insider risk workflow",
    back: "Policy → alert (triggering event + indicators) → triage → case → action (notice from a template, escalate to eDiscovery, or resolve). Users are only scored after a triggering event puts them in scope.",
  },
  {
    id: "sc401-c31",
    domainId: "risk",
    front: "What is a triggering event?",
    back: "The prerequisite that brings a user into scope for insider risk scoring — an HR connector resignation record, a DLP policy match, or a defined security event. No triggering event means no alerts.",
  },
  {
    id: "sc401-c32",
    domainId: "risk",
    front: "How does insider risk protect user privacy?",
    back: "Usernames are pseudonymized by default in alerts and reports; only investigators with the appropriate role can reveal identities. Forensic evidence additionally requires opt-in and an approval workflow.",
  },
  {
    id: "sc401-c33",
    domainId: "risk",
    front: "What is Adaptive Protection?",
    back: "It maps Insider Risk Management risk levels (minor, moderate, elevated) onto DLP policy actions, so enforcement tightens automatically for risky users and relaxes as risk subsides. Requires IRM configured.",
  },
  {
    id: "sc401-c34",
    domainId: "risk",
    front: "DSPM for AI app categories",
    back: "Copilot experiences and agents (M365 Copilot, Copilot Studio), Enterprise AI apps (ChatGPT Enterprise, Entra-registered AI apps), and Other AI apps (consumer third-party sites such as Gemini).",
  },
  {
    id: "sc401-c35",
    domainId: "risk",
    front: "DSPM for AI prerequisites for third-party AI sites",
    back: "Purview Audit turned on, devices onboarded to Purview, and the Microsoft Purview browser extension installed — without endpoint signal, browser-based AI usage is invisible.",
  },
  {
    id: "sc401-c36",
    domainId: "risk",
    front: "What do data risk assessments find?",
    back: "Oversharing before an AI rollout: items with broad or anonymous sharing links, unlabelled sensitive content, and stale data. A default assessment runs weekly across the top SharePoint sites by usage.",
  },
  {
    id: "sc401-c37",
    domainId: "risk",
    front: "How do you stop Copilot summarising labelled content?",
    back: "A DLP policy for the Microsoft 365 Copilot location that restricts processing of items carrying the chosen sensitivity labels. SharePoint Restricted Content Discovery excludes whole sites.",
  },
  {
    id: "sc401-c38",
    domainId: "risk",
    front: "Purview Audit retention",
    back: "Audit (Standard) keeps most records 180 days. Audit (Premium) raises the default to one year, supports audit log retention policies per workload or activity, and offers a ten-year add-on.",
  },
  {
    id: "sc401-c39",
    domainId: "risk",
    front: "Which events prove mailbox access?",
    back: "MailItemsAccessed — an Audit (Premium) event recording which mailbox items were read. Essential for scoping a business email compromise, since sign-in logs only prove authentication.",
  },
  {
    id: "sc401-c40",
    domainId: "risk",
    front: "When do you reach for eDiscovery?",
    back: "Litigation or investigation requiring defensible preservation, search, review, and export — a case with legal holds. Retention policies preserve content but provide no review or export workflow.",
  },
];
