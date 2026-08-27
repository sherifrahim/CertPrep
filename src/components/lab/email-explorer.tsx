"use client";

import { useMemo, useState } from "react";
import {
  CHART_BREAKDOWNS,
  EXPLORER_ACTIONS,
  EXPLORER_HINTS,
  EXPLORER_VIEWS,
  FILTER_OPERATORS,
  FILTER_PROPERTIES,
  applyFilters,
  applyView,
  chartData,
  describeAction,
  distinctValues,
  explorerRows,
  type ChartBreakdown,
  type ExplorerAction,
  type ExplorerFilter,
  type ExplorerRow,
  type ExplorerView,
  type FilterOperator,
  type FilterProperty,
} from "@/lab/explorer";
import { LabNote } from "./azure/resource-shell";

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EmailExplorer() {
  const all = useMemo(() => explorerRows(), []);
  const [view, setView] = useState<ExplorerView>("All email");
  const [filters, setFilters] = useState<ExplorerFilter[]>([]);
  const [breakdown, setBreakdown] = useState<ChartBreakdown>("Delivery action");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<ExplorerRow | null>(null);
  const [action, setAction] = useState<ExplorerAction>("Soft delete");
  const [note, setNote] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  // Draft filter row
  const [property, setProperty] = useState<FilterProperty>("Sender address");
  const [operator, setOperator] = useState<FilterOperator>("Equal any of");
  const [value, setValue] = useState("");

  const inView = useMemo(() => applyView(all, view), [all, view]);
  const rows = useMemo(() => applyFilters(inView, filters), [inView, filters]);
  const chart = useMemo(() => chartData(rows, breakdown), [rows, breakdown]);
  const max = chart.length > 0 ? chart[0].count : 0;

  const selectedRows = rows.filter((r) => selected.has(r.networkMessageId));
  const outcome = selectedRows.length > 0 ? describeAction(action, selectedRows) : null;

  function addFilter() {
    const values = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length === 0) return;
    setFilters((f) => [...f, { property, operator, values }]);
    setValue("");
    setNote(null);
  }

  function applyHint(hint: (typeof EXPLORER_HINTS)[number]) {
    if (hint.view) setView(hint.view);
    setFilters(hint.filters);
    setNote(hint.teaches);
    setSelected(new Set());
    setConfirmed(null);
  }

  return (
    <div className="space-y-4">
      {/* view tabs */}
      <div className="flex flex-wrap gap-1 border-b border-line">
        {EXPLORER_VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setView(v);
              setSelected(new Set());
              setNote(null);
            }}
            className={`px-3 py-2 text-sm ${
              view === v ? "border-b-2 border-accent font-medium text-ink" : "text-muted"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {EXPLORER_HINTS.map((h) => (
          <button key={h.label} type="button" onClick={() => applyHint(h)} className="chip hover:text-ink">
            {h.label}
          </button>
        ))}
      </div>

      {note && <p className="rounded border border-line bg-surface-2 p-3 text-sm">{note}</p>}

      {/* filter bar */}
      <section className="card p-3">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto]">
          <label className="text-xs">
            <span className="mb-1 block font-medium">Property</span>
            <select
              value={property}
              onChange={(e) => setProperty(e.target.value as FilterProperty)}
              className="field py-1 text-xs"
            >
              {FILTER_PROPERTIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <span className="mb-1 block font-medium">Operator</span>
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value as FilterOperator)}
              className="field py-1 text-xs"
            >
              {FILTER_OPERATORS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <span className="mb-1 block font-medium">Value</span>
            <input
              list="explorer-values"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFilter()}
              placeholder="comma separated"
              className="field py-1 font-mono text-xs"
            />
            <datalist id="explorer-values">
              {distinctValues(inView, property).map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </label>
          <div className="flex items-end">
            <button type="button" onClick={addFilter} className="btn-secondary py-1 text-xs">
              Add filter
            </button>
          </div>
        </div>

        {filters.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {filters.map((f, i) => (
              <span
                key={`${f.property}-${i}`}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-[11px]"
              >
                {f.property} {f.operator.toLowerCase()} {f.values.join(", ")}
                <button
                  type="button"
                  onClick={() => setFilters((all) => all.filter((_, j) => j !== i))}
                  aria-label={`Remove ${f.property} filter`}
                  className="text-muted hover:text-bad"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setFilters([])}
              className="ml-1 text-[11px] text-accent-text"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* chart — one measure across a few categories, so a single hue and
          direct labels; colour would be encoding nothing here. */}
      <section className="card p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">
            {rows.length} message{rows.length === 1 ? "" : "s"}
          </h2>
          <label className="text-xs">
            <span className="mr-1 text-muted">Chart breakdown</span>
            <select
              value={breakdown}
              onChange={(e) => setBreakdown(e.target.value as ChartBreakdown)}
              className="field inline-block w-auto py-0.5 text-xs"
            >
              {CHART_BREAKDOWNS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
        </div>

        <ul className="space-y-1.5">
          {chart.map((slice) => (
            <li key={slice.label} className="flex items-center gap-2 text-xs">
              <span className="w-40 shrink-0 truncate text-muted" title={slice.label}>
                {slice.label || "(none)"}
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  className="h-3 rounded-sm"
                  style={{
                    width: `${max === 0 ? 0 : Math.max((slice.count / max) * 100, 1)}%`,
                    background: "var(--accent)",
                  }}
                  title={`${slice.label}: ${slice.count}`}
                />
                <span className="shrink-0 tabular-nums">{slice.count}</span>
              </span>
            </li>
          ))}
          {chart.length === 0 && <li className="text-xs text-muted">Nothing matches.</li>}
        </ul>
      </section>

      {/* take action */}
      {selectedRows.length > 0 && (
        <section className="card p-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="mb-1 block font-medium">
                Take action on {selectedRows.length} message
                {selectedRows.length === 1 ? "" : "s"}
              </span>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as ExplorerAction)}
                className="field py-1 text-xs"
              >
                {EXPLORER_ACTIONS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setConfirmed(action)}
              className="btn-primary py-1 text-xs"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => {
                setSelected(new Set());
                setConfirmed(null);
              }}
              className="btn-secondary py-1 text-xs"
            >
              Clear selection
            </button>
          </div>

          {outcome && (
            <div className="mt-2 rounded border border-line bg-surface-2 p-3 text-xs">
              <p>{outcome.explanation}</p>
              <p className="mt-1 text-muted">
                {outcome.affected} message{outcome.affected === 1 ? "" : "s"} across{" "}
                {outcome.mailboxes.length} mailbox{outcome.mailboxes.length === 1 ? "" : "es"} ·{" "}
                {outcome.reversible ? "Reversible" : "Not reversible"} ·{" "}
                {outcome.requiresApproval
                  ? "Goes to the Action center for approval"
                  : "Runs without approval"}
              </p>
              {confirmed === action && (
                <p className="mt-2 rounded bg-ok-soft p-2 text-ok">
                  Submitted.{" "}
                  {outcome.requiresApproval
                    ? "It is now pending in the Action center — the mail has not moved yet."
                    : "No approval was needed."}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* results grid */}
      <section className="card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
            <tr>
              <th className="px-2 py-2">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? new Set(rows.map((r) => r.networkMessageId)) : new Set(),
                    )
                  }
                />
              </th>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Subject</th>
              <th className="px-3 py-2 font-medium">Recipient</th>
              <th className="px-3 py-2 font-medium">Sender</th>
              <th className="px-3 py-2 font-medium">Delivery action</th>
              <th className="px-3 py-2 font-medium">Original location</th>
              <th className="px-3 py-2 font-medium">Latest location</th>
              <th className="px-3 py-2 font-medium">Detection tech</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 80).map((r) => {
              const moved = r.originalDeliveryLocation !== r.latestDeliveryLocation;
              return (
                <tr
                  key={r.networkMessageId}
                  className="border-b border-line last:border-0 hover:bg-surface-2"
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.subject}`}
                      checked={selected.has(r.networkMessageId)}
                      onChange={(e) =>
                        setSelected((s) => {
                          const next = new Set(s);
                          if (e.target.checked) next.add(r.networkMessageId);
                          else next.delete(r.networkMessageId);
                          return next;
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted">{when(r.timestamp)}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setDetail(r)}
                      className="text-left text-accent-text"
                    >
                      {r.subject}
                    </button>
                    {r.threatTypes && (
                      <span className="ml-2 rounded bg-bad-soft px-1.5 py-0.5 text-[10px] text-bad">
                        {r.threatTypes}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px]">{r.recipient}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">{r.sender}</td>
                  <td className="px-3 py-2">{r.deliveryAction}</td>
                  <td className="px-3 py-2 text-muted">{r.originalDeliveryLocation}</td>
                  <td className={`px-3 py-2 ${moved ? "font-medium text-warn" : ""}`}>
                    {r.latestDeliveryLocation}
                    {moved && <span className="ml-1 text-[10px]">(moved)</span>}
                  </td>
                  <td className="px-3 py-2 text-muted">{r.detectionTechnology}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-muted">
                  No messages match this view and filter set.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {rows.length > 80 && (
          <p className="border-t border-line px-3 py-2 text-[11px] text-muted">
            Showing the first 80 of {rows.length}.
          </p>
        )}
      </section>

      {detail && (
        <section className="card p-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold">{detail.subject}</h2>
            <button type="button" onClick={() => setDetail(null)} className="text-xs text-muted">
              Close
            </button>
          </div>
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
            {[
              ["Network message ID", detail.networkMessageId],
              ["Sender", detail.sender],
              ["Sender IP", detail.senderIp],
              ["Sender domain", detail.senderDomain],
              ["Recipient", detail.recipient],
              ["Directionality", detail.directionality],
              ["Delivery action", detail.deliveryAction],
              ["Original delivery location", detail.originalDeliveryLocation],
              ["Latest delivery location", detail.latestDeliveryLocation],
              ["Detection technology", detail.detectionTechnology],
              ["Authentication", detail.authentication],
              ["Click verdict", detail.clickVerdict],
              ["Campaign", detail.campaignId ?? "—"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex gap-2">
                <dt className="shrink-0 text-muted">{k}</dt>
                <dd className="min-w-0 break-words font-mono text-[11px]">{v}</dd>
              </div>
            ))}
          </dl>
          {detail.urls.length > 0 && (
            <div className="mt-2">
              <p className="text-[11px] uppercase tracking-wide text-muted">URLs</p>
              <ul className="mt-0.5 space-y-0.5">
                {detail.urls.map((u) => (
                  <li key={u} className="break-all font-mono text-[11px]">
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <LabNote>
        <p>
          <strong>Original</strong> and <strong>Latest delivery location</strong> are separate
          columns for a reason. The phishing wave was delivered to six inboxes and then pulled to
          quarantine by zero-hour auto purge — except the one the recipient had already clicked.
          Filter on the original location and you get the whole campaign; filter on the latest and
          you get what is still sitting where a user can reach it. Hunting the wrong column is how
          a remediation misses the only message that mattered.
        </p>
      </LabNote>
    </div>
  );
}
