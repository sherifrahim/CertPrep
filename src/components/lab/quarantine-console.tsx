"use client";

import { useMemo, useState } from "react";
import {
  EMPTY_QUARANTINE_FILTERS,
  QUARANTINE_REASONS,
  availableActions,
  daysRemaining,
  describeRelease,
  explainPermissions,
  filterQuarantine,
  permissionsFor,
  type QuarantineFilters,
  type QuarantineReason,
  type QuarantinedMessage,
  type ReleaseOutcome,
  type ReleaseScope,
  type Role,
} from "@/lab/quarantine";

const ROLES: Role[] = ["Security admin", "End user"];

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const reasonTone: Record<QuarantineReason, string> = {
  Malware: "bg-bad-soft text-bad",
  "High confidence phish": "bg-bad-soft text-bad",
  Phish: "bg-warn-soft text-warn",
  "High confidence spam": "bg-warn-soft text-warn",
  Spam: "bg-surface-2 text-muted",
  Bulk: "bg-surface-2 text-muted",
  "Mail flow rule": "bg-accent-soft text-accent-text",
};

export function QuarantineConsole({ messages }: { messages: QuarantinedMessage[] }) {
  const [role, setRole] = useState<Role>("Security admin");
  const [filters, setFilters] = useState<QuarantineFilters>(EMPTY_QUARANTINE_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [scope, setScope] = useState<ReleaseScope>("All recipients");
  const [chosen, setChosen] = useState<string[]>([]);
  const [reportFp, setReportFp] = useState(false);
  const [outcome, setOutcome] = useState<ReleaseOutcome | null>(null);

  const rows = useMemo(() => filterQuarantine(messages, filters), [messages, filters]);
  const selected = rows.find((m) => m.id === selectedId) ?? rows[0] ?? null;

  // How much of the queue this role can even see. The gap between the two roles
  // is the lesson, so it is stated as a number rather than left to be noticed.
  const visible = rows.filter((m) => permissionsFor(m.reason, role).preview || role === "Security admin");
  const hidden = rows.length - visible.length;

  function select(m: QuarantinedMessage) {
    setSelectedId(m.id);
    setOutcome(null);
    setChosen([]);
    setScope("All recipients");
    setReportFp(false);
  }

  return (
    <div className="space-y-4">
      <section className="card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="mb-1 text-sm font-medium">Viewing as</p>
            <div className="flex gap-1">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setOutcome(null);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    role === r
                      ? "border-accent bg-accent-soft font-medium text-accent-text"
                      : "border-line text-muted hover:bg-surface-2"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {hidden > 0 && (
            <p className="rounded bg-warn-soft p-2 text-sm text-warn">
              {hidden} of {rows.length} messages are invisible to this role.
            </p>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">
          What a recipient may do is set by the quarantine policy attached to the{" "}
          <strong>verdict</strong>, not by the admin and not by severity. Malware and
          high-confidence phishing are admin-only; a normal-confidence phish the user can release
          themselves.
        </p>
      </section>

      <section className="card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Reason</span>
            <select
              value={filters.reason}
              onChange={(e) =>
                setFilters({ ...filters, reason: e.target.value as QuarantineFilters["reason"] })
              }
              className="field py-1.5 text-sm"
            >
              <option value="All">All</option>
              {QUARANTINE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Sender</span>
            <input
              value={filters.sender}
              onChange={(e) => setFilters({ ...filters, sender: e.target.value })}
              placeholder="contains…"
              className="field py-1.5 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Recipient</span>
            <input
              value={filters.recipient}
              onChange={(e) => setFilters({ ...filters, recipient: e.target.value })}
              placeholder="contains…"
              className="field py-1.5 text-sm"
            />
          </label>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Subject</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const p = permissionsFor(m.reason, role);
                const invisible = role === "End user" && !p.preview;
                const left = daysRemaining(m);
                return (
                  <tr
                    key={m.id}
                    onClick={() => select(m)}
                    className={`cursor-pointer border-b border-line last:border-0 hover:bg-surface-2 ${
                      selected?.id === m.id ? "bg-surface-2" : ""
                    } ${invisible ? "opacity-40" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <span className="block font-medium">{m.subject}</span>
                      <span className="block truncate font-mono text-xs text-muted">
                        {m.sender} → {m.recipients.length} recipient
                        {m.recipients.length === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-2 py-1 text-xs ${reasonTone[m.reason]}`}>
                        {m.reason}
                      </span>
                      {invisible && (
                        <span className="mt-1 block text-[11px] text-muted">not visible</span>
                      )}
                    </td>
                    <td className={`px-3 py-2 text-xs ${left <= 2 ? "text-bad" : "text-muted"}`}>
                      {left} day{left === 1 ? "" : "s"}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-sm text-muted">
                    Nothing matches those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {selected && (
          <section className="card space-y-4 p-4">
            <div>
              <h2 className="font-semibold">{selected.subject}</h2>
              <p className="mt-1 font-mono text-xs text-muted">
                {selected.sender} · {selected.senderIp} · {when(selected.receivedAt)} ·{" "}
                {selected.size}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Why it was quarantined</p>
              <p className="mt-1 text-sm">{selected.verdictDetail}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Recipients</p>
              <ul className="mt-1 space-y-1 text-sm">
                {selected.recipients.map((r) => (
                  <li key={r} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={chosen.includes(r)}
                      onChange={(e) =>
                        setChosen((c) => (e.target.checked ? [...c, r] : c.filter((x) => x !== r)))
                      }
                      disabled={scope === "All recipients"}
                    />
                    <span className="font-mono text-xs">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="rounded bg-surface-2 p-3 text-sm text-muted">
              {explainPermissions(selected.reason, role)}
            </p>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Available actions</p>
              <ul className="mt-2 space-y-2">
                {availableActions(selected, role).map((offer) => (
                  <li key={offer.action} className="text-sm">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] ${
                          offer.available ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted"
                        }`}
                      >
                        {offer.available ? "available" : "blocked"}
                      </span>
                      <span className="font-medium">{offer.action}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{offer.reason}</p>
                  </li>
                ))}
              </ul>
            </div>

            {permissionsFor(selected.reason, role).release && (
              <div className="space-y-2 border-t border-line pt-3">
                <label className="text-sm">
                  <span className="mb-1 block font-medium">Release to</span>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as ReleaseScope)}
                    className="field py-1.5 text-sm"
                  >
                    <option>All recipients</option>
                    <option>Selected recipients</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={reportFp}
                    onChange={(e) => setReportFp(e.target.checked)}
                  />
                  Report to Microsoft as a false positive
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setOutcome(describeRelease(selected, scope, chosen, reportFp))
                  }
                  disabled={scope === "Selected recipients" && chosen.length === 0}
                  className="btn-primary text-sm"
                >
                  Release message
                </button>
              </div>
            )}

            {outcome && (
              <p className="rounded bg-ok-soft p-3 text-sm text-ok">{outcome.note}</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
