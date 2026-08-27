import { IOC, LAB_NOW } from "./data";

/**
 * Defender for Office 365 quarantine.
 *
 * Quarantine is a store in its own right, not a folder in a mailbox, which is
 * why it is modelled separately from the mail telemetry rather than as a view
 * over EmailEvents.
 *
 * The rule worth internalising is that what a *recipient* may do with a
 * quarantined message is decided by the quarantine policy attached to the
 * verdict, and the defaults are not uniform: malware and high-confidence
 * phishing are admin-only, everything else lets the user act for themselves.
 * People reliably answer "the user can release it" for all of them.
 */

export type QuarantineReason =
  | "Malware"
  | "High confidence phish"
  | "Phish"
  | "High confidence spam"
  | "Spam"
  | "Bulk"
  | "Mail flow rule";

export type PolicyName =
  | "AdminOnlyAccessPolicy"
  | "DefaultFullAccessPolicy"
  | "DefaultFullAccessWithNotificationPolicy";

export type Role = "End user" | "Security admin";

export type QuarantinedMessage = {
  id: string;
  receivedAt: string;
  sender: string;
  senderIp: string;
  recipients: string[];
  subject: string;
  reason: QuarantineReason;
  /** The policy that decides recipient permissions — set by the verdict, not by the admin. */
  policy: PolicyName;
  /** Anti-spam policies allow 1–30 days; 30 is the default and the maximum. */
  retentionDays: number;
  size: string;
  /** Why the filter reached this verdict, so the queue explains itself. */
  verdictDetail: string;
  releasedToMicrosoft: boolean;
};

/**
 * The verdict decides the default quarantine policy.
 *
 * Malware and high-confidence phishing get admin-only access: the recipient
 * never sees the message in their quarantine and cannot request it. The rest
 * get full access, so the user can release it themselves.
 */
export function defaultPolicyFor(reason: QuarantineReason): PolicyName {
  switch (reason) {
    case "Malware":
    case "High confidence phish":
      return "AdminOnlyAccessPolicy";
    case "Phish":
    case "High confidence spam":
    case "Spam":
    case "Bulk":
      return "DefaultFullAccessWithNotificationPolicy";
    case "Mail flow rule":
      return "DefaultFullAccessPolicy";
  }
}

export type Permissions = {
  /** Release it outright, with no admin involved. */
  release: boolean;
  /** Ask an admin to release it. Not the same as releasing it. */
  requestRelease: boolean;
  preview: boolean;
  delete: boolean;
  blockSender: boolean;
  /** Whether the recipient is told the message exists at all. */
  notified: boolean;
};

const ADMIN_PERMISSIONS: Permissions = {
  release: true,
  requestRelease: false,
  preview: true,
  delete: true,
  blockSender: true,
  notified: true,
};

/**
 * What the given role may do with a message.
 *
 * Admins can always act — that is the point of admin-only access. For end users
 * the answer follows the policy the verdict assigned.
 */
export function permissionsFor(reason: QuarantineReason, role: Role): Permissions {
  if (role === "Security admin") return { ...ADMIN_PERMISSIONS };

  const policy = defaultPolicyFor(reason);
  switch (policy) {
    case "AdminOnlyAccessPolicy":
      // The message is invisible to the recipient. Nothing is available.
      return {
        release: false,
        requestRelease: false,
        preview: false,
        delete: false,
        blockSender: false,
        notified: false,
      };
    case "DefaultFullAccessWithNotificationPolicy":
      return {
        release: true,
        requestRelease: false,
        preview: true,
        delete: true,
        blockSender: true,
        notified: true,
      };
    case "DefaultFullAccessPolicy":
      // Same permissions, but no notification is sent — the user has to go looking.
      return {
        release: true,
        requestRelease: false,
        preview: true,
        delete: true,
        blockSender: true,
        notified: false,
      };
  }
}

/** Phrases the permission outcome the way the portal would justify it. */
export function explainPermissions(reason: QuarantineReason, role: Role): string {
  if (role === "Security admin") {
    return "Security admins can act on anything in quarantine, including admin-only verdicts.";
  }
  const policy = defaultPolicyFor(reason);
  if (policy === "AdminOnlyAccessPolicy") {
    return `${reason} is quarantined with ${policy}. The recipient is not notified, cannot see the message, and cannot request its release — only an admin can act.`;
  }
  if (policy === "DefaultFullAccessPolicy") {
    return `${reason} uses ${policy}. The recipient can release it themselves, but receives no quarantine notification, so they have to visit the quarantine portal to find it.`;
  }
  return `${reason} uses ${policy}. The recipient is notified and can release the message without an admin.`;
}

/* ------------------------------------------------------------- retention */

const DAY = 86_400_000;

/**
 * Days left before the message is deleted permanently.
 *
 * Quarantine retention is not a grace period you can extend after the fact —
 * once it lapses the message is gone, which is why an unattended queue loses
 * evidence.
 */
export function daysRemaining(message: QuarantinedMessage, now: Date = LAB_NOW): number {
  const elapsed = (now.getTime() - new Date(message.receivedAt).getTime()) / DAY;
  return Math.max(0, Math.ceil(message.retentionDays - elapsed));
}

export function isExpired(message: QuarantinedMessage, now: Date = LAB_NOW): boolean {
  return daysRemaining(message, now) === 0;
}

/* --------------------------------------------------------------- actions */

export type QuarantineAction =
  | "Release"
  | "Release and report as false positive"
  | "Request release"
  | "Preview"
  | "Delete"
  | "Block sender"
  | "Submit to Microsoft";

export type ActionOffer = {
  action: QuarantineAction;
  available: boolean;
  reason: string;
};

/**
 * The action menu for a message, with each entry justified.
 *
 * Submitting to Microsoft is always available — reporting a verdict as wrong
 * does not require permission to release the message.
 */
export function availableActions(message: QuarantinedMessage, role: Role): ActionOffer[] {
  const p = permissionsFor(message.reason, role);
  const expired = isExpired(message);

  const gate = (allowed: boolean, yes: string, no: string): ActionOffer["reason"] =>
    allowed ? yes : no;

  const offers: ActionOffer[] = [
    {
      action: "Release",
      available: p.release && !expired,
      reason: expired
        ? "Retention has lapsed and the message has been purged."
        : gate(
            p.release,
            "Delivers the message to the original recipients.",
            `${message.reason} is admin-only, so the recipient cannot release it.`,
          ),
    },
    {
      action: "Release and report as false positive",
      available: p.release && !expired,
      reason: gate(
        p.release && !expired,
        "Releases the message and submits it to Microsoft so the filter learns.",
        "Requires release permission.",
      ),
    },
    {
      action: "Request release",
      available: p.requestRelease && !expired,
      reason: p.requestRelease
        ? "Sends an approval request to an administrator."
        : role === "Security admin"
          ? "Admins release directly — there is nobody to ask."
          : `${defaultPolicyFor(message.reason)} does not offer a release request for this verdict.`,
    },
    {
      action: "Preview",
      available: p.preview && !expired,
      reason: gate(
        p.preview,
        "Shows the message headers and body without delivering it.",
        "The message is not visible to the recipient at all.",
      ),
    },
    {
      action: "Delete",
      available: p.delete && !expired,
      reason: gate(p.delete, "Removes the message from quarantine permanently.", "Not permitted."),
    },
    {
      action: "Block sender",
      available: p.blockSender && !expired,
      reason: gate(
        p.blockSender,
        "Adds the sender to the blocked senders list for that mailbox.",
        "Not permitted.",
      ),
    },
    {
      action: "Submit to Microsoft",
      available: role === "Security admin",
      reason:
        role === "Security admin"
          ? "Reports the verdict for analysis without changing the message."
          : "Users report through the built-in report button in Outlook instead.",
    },
  ];

  return offers;
}

export type ReleaseScope = "All recipients" | "Selected recipients";

export type ReleaseOutcome = {
  delivered: string[];
  reportedToMicrosoft: boolean;
  /** Released mail lands in the inbox, not back through the filters. */
  note: string;
};

export function describeRelease(
  message: QuarantinedMessage,
  scope: ReleaseScope,
  selected: string[],
  reportFalsePositive: boolean,
): ReleaseOutcome {
  const delivered = scope === "All recipients" ? message.recipients : selected;
  return {
    delivered,
    reportedToMicrosoft: reportFalsePositive,
    note: reportFalsePositive
      ? `Delivered to ${delivered.length} of ${message.recipients.length} recipients and submitted to Microsoft as a false positive. A release cannot be undone — the message is in the mailbox once it goes.`
      : `Delivered to ${delivered.length} of ${message.recipients.length} recipients. The message bypasses filtering on the way in, and a release cannot be undone.`,
  };
}

/* ----------------------------------------------------------- the queue */

const at = (msAgo: number) => new Date(LAB_NOW.getTime() - msAgo).toISOString();

/**
 * The quarantine queue. The high-confidence phishing entry is the second wave
 * of the campaign that is already in the telemetry — the first wave reached
 * inboxes, this one did not, which is what a tuned filter looks like.
 */
export function buildQuarantine(): QuarantinedMessage[] {
  return [
    {
      id: "q-8801",
      receivedAt: at(1.5 * DAY),
      sender: IOC.phishSender,
      senderIp: IOC.c2Ip,
      recipients: [
        "alice.chen@contoso.com",
        "bruno.ricci@contoso.com",
        "chloe.dubois@contoso.com",
        "david.okafor@contoso.com",
      ],
      subject: "Final reminder: benefits enrolment expires in 2 hours",
      reason: "High confidence phish",
      policy: "AdminOnlyAccessPolicy",
      retentionDays: 30,
      size: "34 KB",
      verdictDetail:
        "Second wave from the same sender as the delivered campaign. SPF fail, DMARC fail, and the URL matches an indicator already blocked.",
      releasedToMicrosoft: false,
    },
    {
      id: "q-8802",
      receivedAt: at(2.2 * DAY),
      sender: "accounts@invoice-yeardend.net",
      senderIp: "91.203.5.18",
      recipients: ["bruno.ricci@contoso.com"],
      subject: "Year-end invoice 88214 (attached)",
      reason: "Malware",
      policy: "AdminOnlyAccessPolicy",
      retentionDays: 30,
      size: "412 KB",
      verdictDetail: "Attachment detonated in Safe Attachments and executed a downloader.",
      releasedToMicrosoft: false,
    },
    {
      id: "q-8803",
      receivedAt: at(3 * DAY),
      sender: "newsletter@marketing-blast.io",
      senderIp: "198.51.100.77",
      recipients: ["grace.lin@contoso.com", "elena.petrova@contoso.com"],
      subject: "You are subscribed to 47 offers this week",
      reason: "Bulk",
      policy: "DefaultFullAccessWithNotificationPolicy",
      retentionDays: 30,
      size: "88 KB",
      verdictDetail: "Bulk complaint level above the policy threshold. Sender is a known mailer.",
      releasedToMicrosoft: false,
    },
    {
      id: "q-8804",
      receivedAt: at(4 * DAY),
      sender: "recruiting@talent-partners.co",
      senderIp: "203.0.113.55",
      recipients: ["david.okafor@contoso.com"],
      subject: "Senior role — are you open to a conversation?",
      reason: "Spam",
      policy: "DefaultFullAccessWithNotificationPolicy",
      retentionDays: 30,
      size: "22 KB",
      verdictDetail:
        "Spam confidence level 6. A plausible false positive — the sort of message users chase you about.",
      releasedToMicrosoft: false,
    },
    {
      id: "q-8805",
      receivedAt: at(5 * DAY),
      sender: "payroll@contoso-hr-portal.com",
      senderIp: "185.220.101.90",
      recipients: ["elena.petrova@contoso.com", "alice.chen@contoso.com"],
      subject: "Your March payslip is ready to view",
      reason: "Phish",
      policy: "DefaultFullAccessWithNotificationPolicy",
      retentionDays: 30,
      size: "41 KB",
      verdictDetail:
        "Lookalike domain impersonating Contoso HR. Caught at normal confidence, so the recipient can release it themselves — which is worth thinking about.",
      releasedToMicrosoft: false,
    },
    {
      id: "q-8806",
      receivedAt: at(6 * DAY),
      sender: "external.counsel@lawfirm.example",
      senderIp: "192.0.2.31",
      recipients: ["chloe.dubois@contoso.com"],
      subject: "Re: Contract review — confidential",
      reason: "Mail flow rule",
      policy: "DefaultFullAccessPolicy",
      retentionDays: 30,
      size: "1.2 MB",
      verdictDetail:
        "Matched a transport rule that quarantines external mail carrying the word confidential. No threat verdict — the rule did this, not the filter.",
      releasedToMicrosoft: false,
    },
    {
      id: "q-8807",
      receivedAt: at(29.5 * DAY),
      sender: "offers@deal-alerts.biz",
      senderIp: "198.51.100.9",
      recipients: ["grace.lin@contoso.com"],
      subject: "Last chance on your renewal",
      reason: "High confidence spam",
      policy: "DefaultFullAccessWithNotificationPolicy",
      retentionDays: 30,
      size: "17 KB",
      verdictDetail:
        "Nearly out of retention. When the clock runs out the message is deleted, evidence included.",
      releasedToMicrosoft: false,
    },
  ];
}

export const QUARANTINE_REASONS: QuarantineReason[] = [
  "Malware",
  "High confidence phish",
  "Phish",
  "High confidence spam",
  "Spam",
  "Bulk",
  "Mail flow rule",
];

export type QuarantineFilters = {
  reason: QuarantineReason | "All";
  recipient: string;
  sender: string;
};

export const EMPTY_QUARANTINE_FILTERS: QuarantineFilters = {
  reason: "All",
  recipient: "",
  sender: "",
};

export function filterQuarantine(
  messages: QuarantinedMessage[],
  f: QuarantineFilters,
): QuarantinedMessage[] {
  const like = (haystack: string, needle: string) =>
    !needle.trim() || haystack.toLowerCase().includes(needle.trim().toLowerCase());

  return messages.filter(
    (m) =>
      (f.reason === "All" || m.reason === f.reason) &&
      like(m.sender, f.sender) &&
      (!f.recipient.trim() || m.recipients.some((r) => like(r, f.recipient))),
  );
}
