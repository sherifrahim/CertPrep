"use client";

import { useMemo, useState } from "react";
import {
  EMPTY_FILTERS,
  describeRemediation,
  filterMail,
  summarise,
  type MailFilters,
  type MailRow,
  type RemediationAction,
} from "@/lab/email";

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTIONS: { value: RemediationAction; label: string }[] = [
  { value: "SoftDelete", label: "Soft delete" },
  { value: "HardDelete", label: "Hard delete" },
  { value: "MoveToJunk", label: "Move to junk" },
  { value: "MoveToInbox", label: "Move to inbox" },
];

export function EmailExplorer({ mail }: { mail: MailRow[] }) {
  const [filters, setFilters] = useState<MailFilters>({ ...EMPTY_FILTERS, threatOnly: true });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<string | null>(null);

  const rows = useMemo(() => filterMail(mail, filters), [mail, filters]);
  const stats = useMemo(() => summarise(rows), [rows]);
  const chosen = rows.filter((r) => selected.has(r.networkMessageId));

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDone(null);
  }

  function apply(action: RemediationAction) {
    const r = describeRemediation(action, chosen);
    setDone(
      `${ACTIONS.find((a) => a.value === action)!.label} applied to ${r.affected} message${
        r.affected === 1 ? "" : "s"
      } across ${r.mailboxes.length} mailbox${r.mailboxes.length === 1 ? "" : "es"}. ${r.explanation}`,
    );
  }

  const set = (p: Partial<MailFilters>) => {
    setFilters((f) => ({ ...f, ...p }));
    setSelected(new Set());
    setDone(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Messages", value: stats.total },
          { label: "Threats", value: stats.threats },
          { label: "Delivered", value: stats.delivered },
          { label: "Clicked", value: stats.clicked },
          { label: "Senders", value: stats.distinctSenders },
          { label: "Recipients", value: stats.distinctRecipients },
        ].map((s) => (
          <div key={s.label} className="card p-3">
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Sender</span>
            <input
              value={filters.sender}
              onChange={(e) => set({ sender: e.target.value })}
              placeholder="contoso-benefits.com"
              className="field py-1.5 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Recipient</span>
            <input
              value={filters.recipient}
              onChange={(e) => set({ recipient: e.target.value })}
              className="field py-1.5 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Subject</span>
            <input
              value={filters.subject}
              onChange={(e) => set({ subject: e.target.value })}
              className="field py-1.5 text-sm"
            />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.threatOnly}
              onChange={(e) => set({ threatOnly: e.target.checked })}
              className="accent-[var(--accent)]"
            />
            Threats only
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.clickedOnly}
              onChange={(e) => set({ clickedOnly: e.target.checked })}
              className="accent-[var(--accent)]"
            />
            Clicked only
          </label>
          <button
            type="button"
            onClick={() => set(EMPTY_FILTERS)}
            className="ml-auto text-sm text-accent-text underline"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* remediation bar */}
      <div className="card flex flex-wrap items-center gap-2 p-3">
        <span className="text-sm">
          <strong>{chosen.length}</strong> selected
        </span>
        {ACTIONS.map((a) => (
          <button
            key={a.value}
            type="button"
            disabled={chosen.length === 0}
            onClick={() => apply(a.value)}
            className={`${a.value === "HardDelete" ? "btn-secondary" : "btn-secondary"} text-xs`}
          >
            {a.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelected(new Set(rows.map((r) => r.networkMessageId)))}
          className="btn-ghost ml-auto text-xs"
        >
          Select all shown
        </button>
      </div>

      {done && <p className="card border-ok bg-ok-soft p-3 text-sm">{done}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="w-8 px-3 py-2" />
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2 font-medium">Sender</th>
              <th className="px-3 py-2 font-medium">Recipient</th>
              <th className="px-3 py-2 font-medium">Subject</th>
              <th className="px-3 py-2 font-medium">Verdict</th>
              <th className="px-3 py-2 font-medium">Delivered to</th>
              <th className="px-3 py-2 font-medium">Clicked</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map((m) => (
              <tr
                key={m.networkMessageId}
                className={`border-b border-line last:border-0 hover:bg-surface-2 ${
                  m.clicked ? "bg-bad-soft" : ""
                }`}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(m.networkMessageId)}
                    onChange={() => toggle(m.networkMessageId)}
                    aria-label={`Select message to ${m.recipient}`}
                    className="accent-[var(--accent)]"
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-muted">{when(m.timestamp)}</td>
                <td className="px-3 py-2 text-xs">
                  <span className="font-mono">{m.sender}</span>
                  {m.authentication.includes("SPF: fail") && (
                    <span className="ml-2 rounded bg-warn-soft px-1.5 py-0.5 text-[10px] uppercase text-warn">
                      auth fail
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{m.recipient}</td>
                <td className="max-w-[280px] px-3 py-2">
                  <span className="block truncate" title={m.subject}>
                    {m.subject}
                  </span>
                  {m.urls.length > 0 && (
                    <span className="block truncate font-mono text-[11px] text-muted" title={m.urls.join(", ")}>
                      {m.urls[0]}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {m.threatTypes ? (
                    <span className="rounded bg-bad-soft px-2 py-0.5 text-xs text-bad">
                      {m.threatTypes}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs">{m.deliveryLocation}</td>
                <td className="px-3 py-2 text-xs">
                  {m.clicked ? (
                    <span className="font-medium text-bad">{m.clickAction}</span>
                  ) : (
                    <span className="text-muted">no</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 200 && (
        <p className="text-xs text-muted">Showing the first 200 of {rows.length} messages.</p>
      )}
      {rows.length === 0 && <p className="card p-4 text-sm text-muted">No messages match.</p>}
    </div>
  );
}
