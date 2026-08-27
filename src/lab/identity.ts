import { IOC, LAB_NOW, USERS, labTables } from "./data";
import type { Row } from "./kql/engine";

/**
 * The Defender XDR identity inventory and identity entity page.
 *
 * The response actions are where this earns its place. "Disable user" and
 * "Require sign-in again" sound like the same containment and are not: a
 * disabled account still has valid refresh tokens until they expire, so an
 * attacker holding one keeps working. Revoking sessions is the action that
 * actually cuts them off, and doing only one of the two is the most common
 * incomplete response there is.
 */

export type IdentityRiskLevel = "None" | "Low" | "Medium" | "High";

export type Identity = {
  upn: string;
  displayName: string;
  samAccountName: string;
  department: string;
  /** Entra ID Protection risk. */
  riskLevel: IdentityRiskLevel;
  /**
   * Investigation priority score, which is not risk — it is accumulated
   * unusual-activity weight from Defender for Identity.
   */
  investigationPriority: number;
  accountEnabled: boolean;
  mfaRegistered: boolean;
  /** Held by a role that makes the account worth stealing. */
  privileged: boolean;
  /** Service accounts behave differently and are usually over-permissioned. */
  isServiceAccount: boolean;
  createdAt: string;
  lastSeen: string;
  groups: string[];
};

const DAY = 86_400_000;
const at = (msAgo: number) => new Date(LAB_NOW.getTime() - msAgo).toISOString();

const OVERRIDES: Record<string, Partial<Identity>> = {
  [IOC.victimUpn]: {
    riskLevel: "High",
    investigationPriority: 142,
    mfaRegistered: false,
    groups: ["Finance", "All Employees"],
  },
  "svc_backup@contoso.com": {
    riskLevel: "High",
    investigationPriority: 118,
    mfaRegistered: false,
    privileged: true,
    isServiceAccount: true,
    groups: ["Backup Operators", "Domain Admins"],
  },
  "david.okafor@contoso.com": {
    riskLevel: "Low",
    investigationPriority: 24,
    privileged: true,
    groups: ["IT Admins", "All Employees"],
  },
  "farid.hassan@contoso.com": {
    privileged: true,
    groups: ["IT Admins", "All Employees"],
  },
};

export function buildIdentities(): Identity[] {
  const t = labTables();
  const signins = t.SigninLogs as Row[];

  return USERS.map((u, i) => {
    const theirs = signins.filter((s) => s.UserPrincipalName === u.upn);
    const last = theirs[0]?.TimeGenerated as Date | undefined;

    const base: Identity = {
      upn: u.upn,
      displayName: u.display,
      samAccountName: u.name,
      department: u.dept,
      riskLevel: "None",
      investigationPriority: 0,
      accountEnabled: true,
      mfaRegistered: true,
      privileged: false,
      isServiceAccount: u.name.startsWith("svc_"),
      createdAt: at((400 + i * 30) * DAY),
      lastSeen: last ? last.toISOString() : at(DAY),
      groups: ["All Employees"],
    };
    return { ...base, ...OVERRIDES[u.upn] };
  });
}

export function getIdentity(upn: string): Identity | undefined {
  return buildIdentities().find((i) => i.upn === upn || i.samAccountName === upn);
}

/* ------------------------------------------------------- response actions */

export type IdentityActionId =
  | "disable-user"
  | "revoke-sessions"
  | "confirm-compromised"
  | "mark-safe"
  | "require-password-reset";

export type IdentityAction = {
  id: IdentityActionId;
  label: string;
  effect: string;
  /** What the action does not do, which is the part that gets missed. */
  limitation: string;
  undoable: boolean;
};

export const IDENTITY_ACTIONS: IdentityAction[] = [
  {
    id: "disable-user",
    label: "Disable user in Microsoft Entra ID",
    effect: "Blocks the account from signing in from this point on.",
    limitation:
      "Existing refresh and access tokens stay valid until they expire, so a session the attacker already holds keeps working. Disabling alone does not evict them.",
    undoable: true,
  },
  {
    id: "revoke-sessions",
    label: "Require sign-in again (revoke sessions)",
    effect:
      "Invalidates every refresh token, so every existing session has to reauthenticate. This is what actually cuts a stolen token off.",
    limitation:
      "The account can sign back in immediately if the attacker still has valid credentials — pair it with a password reset or a disable.",
    undoable: false,
  },
  {
    id: "require-password-reset",
    label: "Require password change",
    effect: "Forces a new password at the next sign-in.",
    limitation:
      "Does nothing to a session that is already established until the token expires, so it is not containment on its own either.",
    undoable: false,
  },
  {
    id: "confirm-compromised",
    label: "Confirm user compromised",
    effect:
      "Raises the account's Entra ID Protection risk to High, which makes risk-based Conditional Access policies apply immediately and feeds the risk model.",
    limitation:
      "It is a signal, not a block. Nothing happens unless a risk-based Conditional Access policy exists to act on it.",
    undoable: true,
  },
  {
    id: "mark-safe",
    label: "Mark user as safe",
    effect: "Dismisses the account's risk and tells the model this behaviour was legitimate.",
    limitation:
      "Dismissing risk on an account that really was compromised trains the model against you.",
    undoable: true,
  },
];

export type ContainmentAssessment = {
  contained: boolean;
  explanation: string;
};

/**
 * Whether the chosen combination of actions actually contains a compromised
 * account with a stolen token.
 *
 * Disabling without revoking leaves the existing session alive; revoking
 * without disabling or resetting lets the attacker sign straight back in.
 * Containment needs both halves.
 */
export function assessContainment(taken: IdentityActionId[]): ContainmentAssessment {
  const has = (id: IdentityActionId) => taken.includes(id);
  const blocksNewSignIn = has("disable-user") || has("require-password-reset");
  const killsExistingSession = has("revoke-sessions");

  if (blocksNewSignIn && killsExistingSession) {
    return {
      contained: true,
      explanation:
        "Both halves are covered: the existing session is revoked and the attacker cannot start a new one.",
    };
  }
  if (killsExistingSession) {
    return {
      contained: false,
      explanation:
        "The stolen session is gone, but nothing stops the attacker signing in again with the credentials they already have. Add a disable or a password reset.",
    };
  }
  if (blocksNewSignIn) {
    return {
      contained: false,
      explanation:
        "New sign-ins are blocked, but the token the attacker already holds stays valid until it expires. Revoke sessions as well.",
    };
  }
  return {
    contained: false,
    explanation:
      "Nothing here contains the account. Confirming compromise and marking safe change the risk signal; they do not end a session.",
  };
}

/* --------------------------------------------------------- observed data */

/** Sign-ins for the identity entity page's timeline. */
export function signInsFor(identity: Identity, limit = 25) {
  const t = labTables();
  return (t.SigninLogs as Row[])
    .filter((s) => s.UserPrincipalName === identity.upn)
    .map((s) => ({
      timestamp: (s.TimeGenerated as Date).toISOString(),
      app: String(s.AppDisplayName),
      ip: String(s.IPAddress),
      location: String(s.Location),
      result: String(s.ResultDescription),
      risk: String(s.RiskLevelDuringSignIn),
      mfa: String(s.AuthenticationRequirement),
      conditionalAccess: String(s.ConditionalAccessStatus),
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

/** Devices the account has been seen signing in to. */
export function devicesFor(identity: Identity): string[] {
  const t = labTables();
  const logons = t.DeviceLogonEvents as Row[];
  return [
    ...new Set(
      logons
        .filter((l) => String(l.AccountName) === identity.samAccountName)
        .map((l) => String(l.DeviceName)),
    ),
  ];
}

/** Alerts naming this account, for the entity page. */
export function alertsFor(identity: Identity) {
  const t = labTables();
  const evidence = t.AlertEvidence as Row[];
  const alerts = t.AlertInfo as Row[];
  const ids = new Set(
    evidence.filter((e) => e.AccountUpn === identity.upn).map((e) => String(e.AlertId)),
  );
  return alerts
    .filter((a) => ids.has(String(a.AlertId)))
    .map((a) => ({
      alertId: String(a.AlertId),
      title: String(a.Title),
      severity: String(a.Severity),
      category: String(a.Category),
      timestamp: (a.Timestamp as Date).toISOString(),
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export const IDENTITY_RISK_TONE: Record<IdentityRiskLevel, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-accent-soft text-accent-text",
  None: "bg-surface-2 text-muted",
};
