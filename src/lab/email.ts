import { LAB_NOW, labTables } from "./data";
import type { Row } from "./kql/engine";

/**
 * Threat Explorer style view over the mail tables.
 *
 * Joins EmailEvents to EmailUrlInfo and UrlClickEvents so the difference
 * between "received" and "actually clicked" is visible, which is the
 * distinction remediation decisions hang on.
 */
export type MailRow = {
  networkMessageId: string;
  timestamp: string;
  sender: string;
  senderDisplay: string;
  senderIp: string;
  recipient: string;
  subject: string;
  deliveryAction: string;
  deliveryLocation: string;
  threatTypes: string;
  authentication: string;
  urls: string[];
  clicked: boolean;
  clickAction: string | null;
};

export type MailFilters = {
  threatOnly: boolean;
  clickedOnly: boolean;
  sender: string;
  recipient: string;
  subject: string;
};

export const EMPTY_FILTERS: MailFilters = {
  threatOnly: false,
  clickedOnly: false,
  sender: "",
  recipient: "",
  subject: "",
};

function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v ?? "");
}

export function allMail(): MailRow[] {
  const t = labTables();
  const events = t.EmailEvents as Row[];
  const urls = t.EmailUrlInfo as Row[];
  const clicks = t.UrlClickEvents as Row[];

  const urlsByMessage = new Map<string, string[]>();
  for (const u of urls) {
    const id = String(u.NetworkMessageId);
    urlsByMessage.set(id, [...(urlsByMessage.get(id) ?? []), String(u.Url)]);
  }
  const clickByMessage = new Map<string, Row>();
  for (const c of clicks) clickByMessage.set(String(c.NetworkMessageId), c);

  return events
    .map((e) => {
      const id = String(e.NetworkMessageId);
      const click = clickByMessage.get(id);
      return {
        networkMessageId: id,
        timestamp: iso(e.Timestamp),
        sender: String(e.SenderFromAddress),
        senderDisplay: String(e.SenderDisplayName),
        senderIp: String(e.SenderIPv4),
        recipient: String(e.RecipientEmailAddress),
        subject: String(e.Subject),
        deliveryAction: String(e.DeliveryAction),
        deliveryLocation: String(e.DeliveryLocation),
        threatTypes: String(e.ThreatTypes),
        authentication: String(e.AuthenticationDetails),
        urls: urlsByMessage.get(id) ?? [],
        clicked: Boolean(click),
        clickAction: click ? String(click.ActionType) : null,
      };
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function filterMail(rows: MailRow[], f: MailFilters): MailRow[] {
  const like = (haystack: string, needle: string) =>
    !needle.trim() || haystack.toLowerCase().includes(needle.trim().toLowerCase());

  return rows.filter(
    (r) =>
      (!f.threatOnly || r.threatTypes !== "") &&
      (!f.clickedOnly || r.clicked) &&
      like(r.sender, f.sender) &&
      like(r.recipient, f.recipient) &&
      like(r.subject, f.subject),
  );
}

export type MailSummary = {
  total: number;
  threats: number;
  delivered: number;
  clicked: number;
  distinctSenders: number;
  distinctRecipients: number;
};

export function summarise(rows: MailRow[]): MailSummary {
  return {
    total: rows.length,
    threats: rows.filter((r) => r.threatTypes !== "").length,
    delivered: rows.filter((r) => r.deliveryAction === "Delivered").length,
    clicked: rows.filter((r) => r.clicked).length,
    distinctSenders: new Set(rows.map((r) => r.sender)).size,
    distinctRecipients: new Set(rows.map((r) => r.recipient)).size,
  };
}

/** Remediation actions Threat Explorer offers on selected mail. */
export type RemediationAction = "SoftDelete" | "HardDelete" | "MoveToJunk" | "MoveToInbox";

export type RemediationResult = {
  action: RemediationAction;
  affected: number;
  mailboxes: string[];
  /** What actually happens, since the difference matters and is examinable. */
  explanation: string;
  reversible: boolean;
};

export function describeRemediation(
  action: RemediationAction,
  selected: MailRow[],
): RemediationResult {
  const mailboxes = [...new Set(selected.map((r) => r.recipient))];
  const shared = { action, affected: selected.length, mailboxes };

  switch (action) {
    case "SoftDelete":
      return {
        ...shared,
        explanation:
          "Moves the message to Deleted Items in each mailbox. Users can still recover it, and it remains in the Recoverable Items folder.",
        reversible: true,
      };
    case "HardDelete":
      return {
        ...shared,
        explanation:
          "Purges the message so it cannot be recovered by the user. Use it when the message is confirmed malicious.",
        reversible: false,
      };
    case "MoveToJunk":
      return {
        ...shared,
        explanation:
          "Moves the message to the Junk Email folder. It stays reachable, which suits suspected but unconfirmed spam.",
        reversible: true,
      };
    case "MoveToInbox":
      return {
        ...shared,
        explanation:
          "Returns the message to the inbox. Use it after confirming a false positive, and submit the message to Microsoft so filtering improves.",
        reversible: true,
      };
  }
}

export const LAB_CLOCK = LAB_NOW;
