import type { Flashcard } from "../../types";

export const sc200ExtraFlashcards: Flashcard[] = [
  // -------------------------------------------------------------- operations
  {
    id: "sc200-d1",
    domainId: "operations",
    front: "Analytics vs Basic/Auxiliary vs data lake tier",
    back: "Analytics: full query, alerting, hunting. Basic/Auxiliary: cheap ingestion for verbose low-value logs, restricted queries, no scheduled alerts. Data lake: long-term (up to 12 years) Parquet storage for KQL exploration and notebooks.",
  },
  {
    id: "sc200-d2",
    domainId: "operations",
    front: "What is the Sentinel Content hub?",
    back: "The in-product marketplace for solutions — packaged data connectors, analytics rules, workbooks, hunting queries, and playbooks for a specific product or scenario, installed as a unit.",
  },
  {
    id: "sc200-d3",
    domainId: "operations",
    front: "What are Sentinel Repositories for?",
    back: "Connecting a GitHub or Azure DevOps repo so workspace content deploys from source control — giving review, versioning, and promotion between dev and production workspaces (detection-as-code).",
  },
  {
    id: "sc200-d4",
    domainId: "operations",
    front: "Alert grouping vs event grouping",
    back: "Event grouping decides whether a rule run raises one alert for all results or one per row. Alert grouping consolidates multiple alerts sharing chosen entities into a single incident over a time window.",
  },
  {
    id: "sc200-d5",
    domainId: "operations",
    front: "Defender XDR connector incident sync",
    back: "Bi-directional: status, owner, and closing classification changes propagate both ways between Defender XDR and Sentinel, so analysts can work in either portal without divergence.",
  },
  {
    id: "sc200-d6",
    domainId: "operations",
    front: "What does a CEF forwarder need?",
    back: "A Linux machine (Arc-enabled if on-premises) running the Azure Monitor Agent with CEF collection configured. Appliances send syslog/CEF to it, and records land in CommonSecurityLog.",
  },
  {
    id: "sc200-d7",
    domainId: "operations",
    front: "Sentinel workspace daily cap — what's the risk?",
    back: "Once the cap is hit, ingestion stops for the rest of the day across the workspace, creating a blind spot. Prefer table plans and filtering at the DCR to control cost rather than a blunt cap.",
  },
  {
    id: "sc200-d8",
    domainId: "operations",
    front: "Where do you filter data to reduce cost?",
    back: "As early as possible: XPath filters and transformations in the data collection rule, so unwanted records are never ingested. Filtering at query time saves nothing.",
  },

  // ---------------------------------------------------------------- response
  {
    id: "sc200-d9",
    domainId: "response",
    front: "Safe Attachments vs Safe Links",
    back: "Safe Attachments detonates files in a sandbox before delivery. Safe Links rewrites URLs and re-checks them at click time, so a link weaponised after delivery is still caught.",
  },
  {
    id: "sc200-d10",
    domainId: "response",
    front: "Correct handling of a false-positive quarantine",
    back: "Release the message, then submit it to Microsoft via admin submissions so the filters learn. Avoid blanket domain allow-listing, which attackers abuse via spoofing.",
  },
  {
    id: "sc200-d11",
    domainId: "response",
    front: "Why is a password reset alone insufficient?",
    back: "Access tokens stay valid until expiry. You must revoke refresh tokens (revoke sessions) to invalidate existing sessions and force reauthentication.",
  },
  {
    id: "sc200-d12",
    domainId: "response",
    front: "BEC persistence to hunt for",
    back: "Malicious inbox rules and forwarding, newly consented OAuth apps, added MFA methods or authenticator registrations, and delegate/mailbox permissions. Resetting the password does not remove any of these.",
  },
  {
    id: "sc200-d13",
    domainId: "response",
    front: "Restrict app execution vs isolation",
    back: "Restrict app execution applies a code integrity policy allowing only Microsoft-signed binaries, so the device keeps working while attacker tooling is blocked. Isolation cuts networking entirely.",
  },
  {
    id: "sc200-d14",
    domainId: "response",
    front: "Why not shut down a compromised device?",
    back: "It destroys volatile evidence (running processes, memory, network state) and ends live response access. Isolate instead — lateral movement stops but the investigation continues.",
  },
  {
    id: "sc200-d15",
    domainId: "response",
    front: "Is impossible travel automatically malicious?",
    back: "No — VPNs, roaming, and cloud egress commonly trigger it. Corroborate with sign-in logs: IP reputation, device compliance, whether MFA was satisfied, and what the session then did.",
  },
  {
    id: "sc200-d16",
    domainId: "response",
    front: "Where do DLP alerts reach the SOC?",
    back: "The DLP alerts experience in the Microsoft Purview portal, and mirrored into Microsoft Defender XDR so analysts triage them beside other incidents.",
  },
  {
    id: "sc200-d17",
    domainId: "response",
    front: "Defender for Cloud Apps: what can a file policy do?",
    back: "Act on content at rest — apply a sensitivity label, quarantine the file, remove external sharing links, or notify the owner. Session policies, by contrast, control activity live in the browser.",
  },

  // ----------------------------------------------------------------- hunting
  {
    id: "sc200-d18",
    domainId: "hunting",
    front: "KQL join kinds you should know",
    back: "inner keeps only matches. leftouter keeps all left rows and enriches where matched — the standard enrichment pattern. leftanti keeps left rows with no match, which is ideal for 'first time seen' hunts.",
  },
  {
    id: "sc200-d19",
    domainId: "hunting",
    front: "How do you find per-entity anomalies in KQL?",
    back: "Build a baseline: aggregate per entity per time bucket, then either apply series_decompose_anomalies to the series or compare the current value against the window's avg and stdev.",
  },
  {
    id: "sc200-d20",
    domainId: "hunting",
    front: "EmailUrlInfo vs UrlClickEvents",
    back: "EmailUrlInfo lists URLs present in messages, so you can find everyone who received a malicious link. UrlClickEvents records only users who actually clicked one through Safe Links.",
  },
  {
    id: "sc200-d21",
    domainId: "hunting",
    front: "What is 'Go hunt'?",
    back: "A pivot from an entity in an incident straight into a curated set of queries scoped to it, collapsing several manual KQL steps during triage. Investigative, not enforcement.",
  },
  {
    id: "sc200-d22",
    domainId: "hunting",
    front: "leftanti join — what's it for?",
    back: "Finding absence: rows in the left table with no counterpart on the right. Classic use is 'processes seen today that were never seen in the previous 30 days'.",
  },
  {
    id: "sc200-d23",
    domainId: "hunting",
    front: "Is data lake activity audited?",
    back: "Yes, by default. KQL queries against the lake, notebook runs, and job create/edit/run/delete events are all captured in the data lake audit log.",
  },
  {
    id: "sc200-d24",
    domainId: "hunting",
    front: "AlertInfo vs AlertEvidence",
    back: "AlertInfo holds one row per alert with title, severity, category, and MITRE tactics. AlertEvidence holds the entities attached to each alert — files, devices, accounts, IPs — so you join them to pivot from alert to asset.",
  },
];
