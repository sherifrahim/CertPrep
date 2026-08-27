import { IOC } from "./data";
import { allMail, type MailRow } from "./email";

/**
 * Threat Explorer, as Defender for Office 365 presents it.
 *
 * The parts that matter and are usually skipped:
 *
 *  - **Original and latest delivery location are different columns.** A message
 *    delivered to the inbox and later pulled by zero-hour auto purge reads
 *    Inbox for one and Quarantine for the other. Filtering on the wrong one is
 *    how a hunt misses the messages that were already cleaned up.
 *  - **Delivery action is not delivery location.** Action is the verdict the
 *    filter reached; location is where the message physically ended up.
 *  - **Directionality** separates inbound from intra-organisation mail, which
 *    is what distinguishes a phish from a compromised internal account.
 */

export type ExplorerView = "All email" | "Malware" | "Phish" | "Campaigns" | "URL clicks";

export const EXPLORER_VIEWS: ExplorerView[] = [
  "All email",
  "Malware",
  "Phish",
  "Campaigns",
  "URL clicks",
];

export type Directionality = "Inbound" | "Outbound" | "Intra-org";

export type DetectionTechnology =
  | "Advanced filter"
  | "URL detonation"
  | "File detonation"
  | "Anti-malware engine"
  | "Campaign"
  | "Spoof DMARC"
  | "Mixed analysis detection"
  | "None";

export type ClickVerdict = "Allowed" | "Blocked" | "Blocked overridden" | "Pending" | "None";

/** A row as the Explorer grid shows it. */
export type ExplorerRow = MailRow & {
  detectionTechnology: DetectionTechnology;
  directionality: Directionality;
  /** Where it landed at delivery time. */
  originalDeliveryLocation: string;
  /** Where it is now — different when ZAP or an admin moved it. */
  latestDeliveryLocation: string;
  clickVerdict: ClickVerdict;
  senderDomain: string;
  urlDomain: string | null;
  campaignId: string | null;
};

/**
 * Enriches the mail telemetry with the columns Explorer shows but the raw
 * table does not carry.
 */
export function explorerRows(): ExplorerRow[] {
  return allMail().map((m) => {
    const senderDomain = m.sender.includes("@") ? m.sender.split("@")[1] : m.sender;
    const isPhish = m.threatTypes === "Phish";
    const urlDomain = m.urls.length > 0 ? new URL(m.urls[0]).hostname : null;

    // The phishing wave was delivered, then pulled by zero-hour auto purge —
    // except the one the victim had already clicked.
    const zapped = isPhish && !m.clicked;

    return {
      ...m,
      senderDomain,
      urlDomain,
      campaignId: isPhish ? "camp-4417" : null,
      detectionTechnology: isPhish
        ? m.clicked
          ? "URL detonation"
          : "Advanced filter"
        : "None",
      directionality: senderDomain.endsWith("contoso.com") ? "Intra-org" : "Inbound",
      originalDeliveryLocation: m.deliveryLocation,
      latestDeliveryLocation: zapped ? "Quarantine" : m.deliveryLocation,
      clickVerdict: m.clicked ? (m.clickAction === "ClickAllowed" ? "Allowed" : "Blocked") : "None",
    };
  });
}

/* ------------------------------------------------------------- filtering */

export type FilterProperty =
  | "Sender address"
  | "Sender domain"
  | "Sender IP"
  | "Recipient"
  | "Subject"
  | "Detection technology"
  | "Delivery action"
  | "Original delivery location"
  | "Latest delivery location"
  | "Directionality"
  | "URL domain"
  | "Click verdict";

export const FILTER_PROPERTIES: FilterProperty[] = [
  "Sender address",
  "Sender domain",
  "Sender IP",
  "Recipient",
  "Subject",
  "Detection technology",
  "Delivery action",
  "Original delivery location",
  "Latest delivery location",
  "Directionality",
  "URL domain",
  "Click verdict",
];

export type FilterOperator = "Equal any of" | "Equal none of" | "Contains";

export const FILTER_OPERATORS: FilterOperator[] = ["Equal any of", "Equal none of", "Contains"];

export type ExplorerFilter = {
  property: FilterProperty;
  operator: FilterOperator;
  /** Comma-separated in the portal; a list here. */
  values: string[];
};

export function readProperty(row: ExplorerRow, property: FilterProperty): string {
  switch (property) {
    case "Sender address":
      return row.sender;
    case "Sender domain":
      return row.senderDomain;
    case "Sender IP":
      return row.senderIp;
    case "Recipient":
      return row.recipient;
    case "Subject":
      return row.subject;
    case "Detection technology":
      return row.detectionTechnology;
    case "Delivery action":
      return row.deliveryAction;
    case "Original delivery location":
      return row.originalDeliveryLocation;
    case "Latest delivery location":
      return row.latestDeliveryLocation;
    case "Directionality":
      return row.directionality;
    case "URL domain":
      return row.urlDomain ?? "";
    case "Click verdict":
      return row.clickVerdict;
  }
}

export function matchesFilter(row: ExplorerRow, filter: ExplorerFilter): boolean {
  const value = readProperty(row, filter.property).toLowerCase();
  const wanted = filter.values.map((v) => v.trim().toLowerCase()).filter(Boolean);
  if (wanted.length === 0) return true;

  switch (filter.operator) {
    case "Equal any of":
      return wanted.includes(value);
    case "Equal none of":
      return !wanted.includes(value);
    case "Contains":
      return wanted.some((w) => value.includes(w));
  }
}

/** Filters are ANDed, as the portal's filter bar does. */
export function applyFilters(rows: ExplorerRow[], filters: ExplorerFilter[]): ExplorerRow[] {
  return rows.filter((r) => filters.every((f) => matchesFilter(r, f)));
}

/** The view is a filter in its own right, applied before the filter bar. */
export function applyView(rows: ExplorerRow[], view: ExplorerView): ExplorerRow[] {
  switch (view) {
    case "All email":
      return rows;
    case "Malware":
      return rows.filter((r) => r.threatTypes === "Malware");
    case "Phish":
      return rows.filter((r) => r.threatTypes === "Phish");
    case "Campaigns":
      return rows.filter((r) => r.campaignId !== null);
    case "URL clicks":
      return rows.filter((r) => r.clicked);
  }
}

/* ---------------------------------------------------------------- chart */

export type ChartBreakdown =
  | "Delivery action"
  | "Detection technology"
  | "Sender domain"
  | "Latest delivery location";

export const CHART_BREAKDOWNS: ChartBreakdown[] = [
  "Delivery action",
  "Detection technology",
  "Sender domain",
  "Latest delivery location",
];

export function chartData(
  rows: ExplorerRow[],
  breakdown: ChartBreakdown,
): { label: string; count: number }[] {
  const key = (r: ExplorerRow) =>
    breakdown === "Delivery action"
      ? r.deliveryAction
      : breakdown === "Detection technology"
        ? r.detectionTechnology
        : breakdown === "Sender domain"
          ? r.senderDomain
          : r.latestDeliveryLocation;

  const counts = new Map<string, number>();
  for (const r of rows) counts.set(key(r), (counts.get(key(r)) ?? 0) + 1);

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/* ---------------------------------------------------------- take action */

export type ExplorerAction =
  | "Move to junk folder"
  | "Move to deleted items"
  | "Soft delete"
  | "Hard delete"
  | "Move to inbox"
  | "Submit to Microsoft for analysis"
  | "Initiate automated investigation";

export const EXPLORER_ACTIONS: ExplorerAction[] = [
  "Move to junk folder",
  "Move to deleted items",
  "Soft delete",
  "Hard delete",
  "Move to inbox",
  "Submit to Microsoft for analysis",
  "Initiate automated investigation",
];

export type ActionOutcome = {
  action: ExplorerAction;
  affected: number;
  mailboxes: string[];
  reversible: boolean;
  /** Whether it needs approval before it runs. */
  requiresApproval: boolean;
  explanation: string;
};

/**
 * Describes what an Explorer action does to the selected messages.
 *
 * Remediation from Explorer creates an action that goes through the Action
 * center, so a tenant with approval required does not have the mail removed the
 * moment the wizard closes — a difference people only notice under pressure.
 */
export function describeAction(
  action: ExplorerAction,
  selected: ExplorerRow[],
): ActionOutcome {
  const mailboxes = [...new Set(selected.map((r) => r.recipient))];
  const base = { action, affected: selected.length, mailboxes };

  switch (action) {
    case "Move to junk folder":
      return {
        ...base,
        reversible: true,
        requiresApproval: true,
        explanation:
          "Moves the message to the Junk Email folder. The user can still reach it, which suits a suspected but unconfirmed verdict.",
      };
    case "Move to deleted items":
      return {
        ...base,
        reversible: true,
        requiresApproval: true,
        explanation: "Moves the message to Deleted Items, where the user can restore it.",
      };
    case "Soft delete":
      return {
        ...base,
        reversible: true,
        requiresApproval: true,
        explanation:
          "Removes the message from the visible folder but leaves it in Recoverable Items, so it can still be restored and is still discoverable.",
      };
    case "Hard delete":
      return {
        ...base,
        reversible: false,
        requiresApproval: true,
        explanation:
          "Purges the message so the user cannot recover it. Use it only on a confirmed malicious message — there is no undo.",
      };
    case "Move to inbox":
      return {
        ...base,
        reversible: true,
        requiresApproval: true,
        explanation:
          "Returns the message to the inbox after confirming a false positive. Submit it to Microsoft as well, or the filter will keep making the same mistake.",
      };
    case "Submit to Microsoft for analysis":
      return {
        ...base,
        reversible: true,
        requiresApproval: false,
        explanation:
          "Reports the verdict without changing where the message sits. Nothing moves, so nothing needs approving.",
      };
    case "Initiate automated investigation":
      return {
        ...base,
        reversible: false,
        requiresApproval: false,
        explanation:
          "Starts an investigation over the message, its sender and its recipients. What it then does depends on the tenant's automation level.",
      };
  }
}

/** Distinct values for a property, to populate the filter value picker. */
export function distinctValues(rows: ExplorerRow[], property: FilterProperty): string[] {
  return [...new Set(rows.map((r) => readProperty(r, property)).filter(Boolean))].sort();
}

export const EXPLORER_HINTS = [
  {
    label: "The phishing campaign",
    filters: [
      {
        property: "Sender address" as FilterProperty,
        operator: "Equal any of" as FilterOperator,
        values: [IOC.phishSender],
      },
    ],
    teaches:
      "Six recipients. Compare Original delivery location with Latest delivery location — five were pulled to quarantine by zero-hour auto purge, and the one that was already clicked was not.",
  },
  {
    label: "Who actually clicked",
    view: "URL clicks" as ExplorerView,
    filters: [],
    teaches:
      "Receiving a phish is not the same as falling for one. This view is the difference between a mail hygiene problem and an incident.",
  },
  {
    label: "Still sitting in an inbox",
    filters: [
      {
        property: "Latest delivery location" as FilterProperty,
        operator: "Equal any of" as FilterOperator,
        values: ["Inbox"],
      },
    ],
    teaches:
      "Filtering on the latest location shows what is still reachable by a user right now, which is the set you actually need to remediate.",
  },
];
