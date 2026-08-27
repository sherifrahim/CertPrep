"use client";

import Link from "next/link";
import { useState } from "react";
import {
  IDENTITY_ACTIONS,
  IDENTITY_RISK_TONE,
  alertsFor,
  assessContainment,
  devicesFor,
  signInsFor,
  type Identity,
  type IdentityActionId,
} from "@/lab/identity";
import { LabNote } from "../azure/resource-shell";
import { XdrEntityShell, type EntityAction } from "./entity-shell";

const GLYPHS: Record<IdentityActionId, string> = {
  "disable-user": "⛔",
  "revoke-sessions": "⟲",
  "require-password-reset": "⚿",
  "confirm-compromised": "⚠",
  "mark-safe": "✓",
};

const sevTone: Record<string, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-surface-2 text-muted",
  Informational: "bg-surface-2 text-muted",
};

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function IdentityPage({ identity }: { identity: Identity }) {
  const [tab, setTab] = useState("overview");
  const [openAction, setOpenAction] = useState<IdentityActionId | null>(null);
  const [taken, setTaken] = useState<IdentityActionId[]>([]);

  const signIns = signInsFor(identity);
  const devices = devicesFor(identity);
  const alerts = alertsFor(identity);
  const containment = assessContainment(taken);

  const actions: EntityAction[] = IDENTITY_ACTIONS.map((a) => ({
    id: a.id,
    label: a.label,
    glyph: GLYPHS[a.id],
    available: true,
    reason: a.effect,
  }));

  const selected = IDENTITY_ACTIONS.find((a) => a.id === openAction);

  return (
    <div className="space-y-4">
      <XdrEntityShell
        backHref="/lab/identities"
        backLabel="Identities"
        glyph="ID"
        name={identity.displayName}
        subtitle={identity.upn}
        chips={[
          { label: `Risk: ${identity.riskLevel}`, tone: IDENTITY_RISK_TONE[identity.riskLevel] },
          {
            label: `Investigation priority: ${identity.investigationPriority}`,
            tone:
              identity.investigationPriority > 100
                ? "bg-bad-soft text-bad"
                : identity.investigationPriority > 0
                  ? "bg-warn-soft text-warn"
                  : "bg-surface-2 text-muted",
          },
          {
            label: identity.accountEnabled ? "Enabled" : "Disabled",
            tone: identity.accountEnabled ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad",
          },
          {
            label: identity.mfaRegistered ? "MFA registered" : "No MFA",
            tone: identity.mfaRegistered ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad",
          },
        ]}
        tags={[
          ...(identity.privileged ? ["Privileged"] : []),
          ...(identity.isServiceAccount ? ["Service account"] : []),
        ]}
        actions={actions}
        onAction={(id) => setOpenAction(openAction === id ? null : (id as IdentityActionId))}
        activeAction={openAction}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "alerts", label: "Incidents and alerts", badge: alerts.length },
          { id: "observed", label: "Observed in organization", badge: devices.length },
          { id: "timeline", label: "Sign-in activity", badge: signIns.length },
        ]}
        activeTab={tab}
        onTab={setTab}
        details={[
          { label: "UPN", value: identity.upn },
          { label: "SAM account name", value: identity.samAccountName },
          { label: "Department", value: identity.department },
          { label: "Account enabled", value: identity.accountEnabled ? "Yes" : "No" },
          { label: "MFA registered", value: identity.mfaRegistered ? "Yes" : "No" },
          { label: "Privileged", value: identity.privileged ? "Yes" : "No" },
          { label: "Risk level", value: identity.riskLevel },
          { label: "Investigation priority", value: identity.investigationPriority },
          { label: "Groups", value: identity.groups.join(", ") },
          { label: "Created", value: when(identity.createdAt) },
          { label: "Last seen", value: when(identity.lastSeen) },
        ]}
      >
        {tab === "overview" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Alerts", value: alerts.length },
                { label: "Devices seen on", value: devices.length },
                { label: "Sign-ins", value: signIns.length },
                { label: "Groups", value: identity.groups.length },
              ].map((t) => (
                <div key={t.label} className="rounded border border-line p-3">
                  <p className="text-lg font-semibold">{t.value}</p>
                  <p className="text-xs text-muted">{t.label}</p>
                </div>
              ))}
            </div>
            <Link
              href={`/lab/hunting?q=${encodeURIComponent(
                `SigninLogs\n| where UserPrincipalName == "${identity.upn}"\n| project TimeGenerated, IPAddress, Location, RiskLevelDuringSignIn, AuthenticationRequirement, ConditionalAccessStatus\n| sort by TimeGenerated desc`,
              )}`}
              className="inline-block text-xs text-accent-text"
            >
              Go hunt: every sign-in for this account →
            </Link>
          </div>
        )}

        {tab === "alerts" && (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line uppercase tracking-wide text-muted">
              <tr>
                <th className="px-2 py-2 font-medium">Severity</th>
                <th className="px-2 py-2 font-medium">Alert</th>
                <th className="px-2 py-2 font-medium">Category</th>
                <th className="px-2 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.alertId} className="border-b border-line last:border-0">
                  <td className="px-2 py-2">
                    <span className={`rounded px-1.5 py-0.5 ${sevTone[a.severity]}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="px-2 py-2">{a.title}</td>
                  <td className="px-2 py-2 text-muted">{a.category}</td>
                  <td className="px-2 py-2 text-muted">{when(a.timestamp)}</td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-6 text-center text-muted">
                    No alerts for this account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {tab === "observed" && (
          <div>
            <p className="mb-2 text-xs font-semibold">Devices</p>
            <ul className="space-y-1">
              {devices.map((d) => (
                <li key={d} className="rounded border border-line px-3 py-1.5 font-mono text-xs">
                  {d}
                </li>
              ))}
              {devices.length === 0 && (
                <li className="text-xs text-muted">Not observed on any onboarded device.</li>
              )}
            </ul>
            <p className="mb-2 mt-3 text-xs font-semibold">Group memberships</p>
            <ul className="flex flex-wrap gap-1">
              {identity.groups.map((g) => (
                <li key={g} className="chip">
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "timeline" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-2 font-medium">Time</th>
                  <th className="px-2 py-2 font-medium">Application</th>
                  <th className="px-2 py-2 font-medium">IP</th>
                  <th className="px-2 py-2 font-medium">Location</th>
                  <th className="px-2 py-2 font-medium">Risk</th>
                  <th className="px-2 py-2 font-medium">Auth requirement</th>
                  <th className="px-2 py-2 font-medium">Conditional Access</th>
                </tr>
              </thead>
              <tbody>
                {signIns.map((s, i) => (
                  <tr key={`${s.timestamp}-${i}`} className="border-b border-line last:border-0">
                    <td className="px-2 py-2 whitespace-nowrap text-muted">{when(s.timestamp)}</td>
                    <td className="px-2 py-2">{s.app}</td>
                    <td className="px-2 py-2 font-mono text-[11px]">{s.ip}</td>
                    <td className="px-2 py-2">{s.location}</td>
                    <td className={`px-2 py-2 ${s.risk !== "none" ? "text-bad" : "text-muted"}`}>
                      {s.risk}
                    </td>
                    <td
                      className={`px-2 py-2 ${
                        s.mfa === "singleFactorAuthentication" ? "text-bad" : ""
                      }`}
                    >
                      {s.mfa}
                    </td>
                    <td className="px-2 py-2 text-muted">{s.conditionalAccess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </XdrEntityShell>

      {selected && (
        <section className="card p-4">
          <h3 className="text-sm font-semibold">{selected.label}</h3>
          <dl className="mt-2 space-y-2 text-xs">
            <div>
              <dt className="text-muted">What it does</dt>
              <dd>{selected.effect}</dd>
            </div>
            <div>
              <dt className="text-muted">What it does not do</dt>
              <dd>{selected.limitation}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() =>
              setTaken((t) =>
                t.includes(selected.id) ? t.filter((x) => x !== selected.id) : [...t, selected.id],
              )
            }
            className={taken.includes(selected.id) ? "btn-secondary mt-3 text-xs" : "btn-primary mt-3 text-xs"}
          >
            {taken.includes(selected.id) ? "Undo this action" : `Take action — ${selected.label}`}
          </button>
        </section>
      )}

      {taken.length > 0 && (
        <section
          className={`card p-4 ${containment.contained ? "border-ok bg-ok-soft" : "border-warn bg-warn-soft"}`}
        >
          <p className={`text-sm font-semibold ${containment.contained ? "text-ok" : "text-warn"}`}>
            {containment.contained ? "Account contained" : "Not yet contained"}
          </p>
          <p className="mt-1 text-xs">{containment.explanation}</p>
          <p className="mt-2 text-[11px] text-muted">
            Taken: {taken.map((id) => IDENTITY_ACTIONS.find((a) => a.id === id)!.label).join(", ")}
          </p>
        </section>
      )}

      <LabNote>
        <p>
          Disable and revoke are not alternatives. A disabled account keeps every refresh token it
          had until they expire, so an attacker holding one carries on working; revoking sessions
          without disabling or resetting lets them sign straight back in. Containment needs both
          halves, and picking one is the most common incomplete response there is.
        </p>
      </LabNote>
    </div>
  );
}
