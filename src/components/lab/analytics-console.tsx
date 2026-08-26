"use client";

import { useMemo, useState } from "react";
import {
  ENTITY_TYPES,
  PREBUILT_RULES,
  TACTICS,
  blankRule,
  runsPerDay,
  simulateRule,
  type AnalyticsRule,
  type EntityMapping,
  type Severity,
} from "@/lab/analytics";

const sevTone: Record<Severity, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-accent-soft text-accent-text",
  Informational: "bg-surface-2 text-muted",
};

export function AnalyticsConsole() {
  const [rules, setRules] = useState<AnalyticsRule[]>(PREBUILT_RULES);
  const [editing, setEditing] = useState<AnalyticsRule>(PREBUILT_RULES[0]);
  const [dirty, setDirty] = useState(false);

  const result = useMemo(() => simulateRule(editing), [editing]);

  function patch(p: Partial<AnalyticsRule>) {
    setEditing((r) => ({ ...r, ...p }));
    setDirty(true);
  }

  function save() {
    setRules((rs) => {
      const exists = rs.some((r) => r.id === editing.id);
      if (exists) return rs.map((r) => (r.id === editing.id ? editing : r));
      return [...rs, { ...editing, id: `ar-${Date.now()}` }];
    });
    setDirty(false);
  }

  function addMapping() {
    patch({
      entityMappings: [...editing.entityMappings, { entityType: "Host", column: "" }],
    });
  }

  function updateMapping(i: number, m: Partial<EntityMapping>) {
    const next = editing.entityMappings.map((x, idx) => (idx === i ? { ...x, ...m } : x));
    patch({ entityMappings: next });
  }

  const errors = result.warnings.filter((w) => w.level === "error");
  const warns = result.warnings.filter((w) => w.level === "warning");

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="card max-h-[75vh] overflow-y-auto p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Rules</p>
          <button
            type="button"
            onClick={() => {
              setEditing(blankRule());
              setDirty(true);
            }}
            className="text-xs text-accent-text underline"
          >
            + Create
          </button>
        </div>
        <ul className="space-y-1">
          {rules.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  setEditing(r);
                  setDirty(false);
                }}
                className={`w-full rounded px-2 py-2 text-left text-sm ${
                  editing.id === r.id ? "bg-accent-soft" : "hover:bg-surface-2"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${sevTone[r.severity]}`}>
                    {r.severity}
                  </span>
                  {!r.enabled && (
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] uppercase text-muted">
                      disabled
                    </span>
                  )}
                </span>
                <span className="mt-1 block font-medium">{r.name}</span>
                <span className="block text-xs text-muted">
                  every {r.frequencyMin}m · look back {r.lookbackMin}m
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 space-y-4">
        {/* what it would catch */}
        <div
          className={`card p-4 ${
            result.error || errors.length ? "border-bad bg-bad-soft" : "border-ok bg-ok-soft"
          }`}
        >
          {result.error ? (
            <>
              <p className="font-semibold text-bad">Query failed</p>
              <p className="mt-1 text-sm">{result.error}</p>
            </>
          ) : (
            <>
              <p className="font-semibold">
                {result.rowCount.toLocaleString()} matching row
                {result.rowCount === 1 ? "" : "s"} · would raise{" "}
                {result.alertCount.toLocaleString()} alert
                {result.alertCount === 1 ? "" : "s"} per run
              </p>
              <p className="mt-1 text-sm text-muted">
                Running every {editing.frequencyMin} minutes is {runsPerDay(editing.frequencyMin)}{" "}
                runs a day. Evaluated across the lab&apos;s seven-day window.
              </p>
            </>
          )}
        </div>

        {(errors.length > 0 || warns.length > 0) && (
          <ul className="space-y-2">
            {[...errors, ...warns].map((w, i) => (
              <li
                key={i}
                className={`card p-3 text-sm ${
                  w.level === "error" ? "border-bad" : "border-warn"
                }`}
              >
                <span
                  className={`mr-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    w.level === "error" ? "bg-bad-soft text-bad" : "bg-warn-soft text-warn"
                  }`}
                >
                  {w.level}
                </span>
                {w.message}
              </li>
            ))}
          </ul>
        )}

        {/* rule editor */}
        <div className="card p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Rule name</span>
              <input
                value={editing.name}
                onChange={(e) => patch({ name: e.target.value })}
                className="field py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Severity</span>
              <select
                value={editing.severity}
                onChange={(e) => patch({ severity: e.target.value as Severity })}
                className="field py-1.5 text-sm"
              >
                {(["High", "Medium", "Low", "Informational"] as Severity[]).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Run every (minutes)</span>
              <input
                type="number"
                value={editing.frequencyMin}
                onChange={(e) => patch({ frequencyMin: Number(e.target.value) })}
                className="field py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Look back (minutes)</span>
              <input
                type="number"
                value={editing.lookbackMin}
                onChange={(e) => patch({ lookbackMin: Number(e.target.value) })}
                className="field py-1.5 text-sm"
              />
            </label>
          </div>

          <label className="mt-3 block text-sm">
            <span className="mb-1 block font-medium">Rule query</span>
            <textarea
              value={editing.query}
              onChange={(e) => patch({ query: e.target.value })}
              spellCheck={false}
              rows={8}
              className="field font-mono text-sm"
            />
          </label>

          <div className="mt-3">
            <p className="text-sm font-medium">Event grouping</p>
            <div className="mt-1 flex flex-wrap gap-3 text-sm">
              {(
                [
                  ["SingleAlert", "Group all events into a single alert"],
                  ["AlertPerRow", "Trigger an alert for each event"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="grouping"
                    checked={editing.eventGrouping === value}
                    onChange={() => patch({ eventGrouping: value })}
                    className="accent-[var(--accent)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Entity mapping</p>
              <button type="button" onClick={addMapping} className="text-xs text-accent-text underline">
                + Add entity
              </button>
            </div>
            {editing.entityMappings.length === 0 ? (
              <p className="mt-1 text-xs text-muted">
                Nothing mapped. Alerts will have no entities to pivot from.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {editing.entityMappings.map((m, i) => {
                  const found = result.entities[i];
                  return (
                    <li key={i} className="flex flex-wrap items-center gap-2">
                      <select
                        value={m.entityType}
                        onChange={(e) =>
                          updateMapping(i, { entityType: e.target.value as EntityMapping["entityType"] })
                        }
                        className="field w-auto py-1 text-sm"
                      >
                        {ENTITY_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <span className="text-sm text-muted">from column</span>
                      <input
                        value={m.column}
                        onChange={(e) => updateMapping(i, { column: e.target.value })}
                        placeholder="DeviceName"
                        className="field w-auto py-1 font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          patch({ entityMappings: editing.entityMappings.filter((_, x) => x !== i) })
                        }
                        className="text-xs text-muted underline"
                      >
                        remove
                      </button>
                      {found && !found.missing && found.values.length > 0 && (
                        <span className="w-full text-xs text-muted">
                          resolves to: {found.values.slice(0, 3).join(", ")}
                          {found.values.length > 3 && ` and ${found.values.length - 3} more`}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium">MITRE ATT&amp;CK tactics</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {TACTICS.map((t) => {
                const on = editing.tactics.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      patch({
                        tactics: on
                          ? editing.tactics.filter((x) => x !== t)
                          : [...editing.tactics, t],
                      })
                    }
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      on ? "border-accent bg-accent-soft text-accent-text" : "border-line text-muted"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} disabled={!dirty} className="btn-primary text-sm">
              {rules.some((r) => r.id === editing.id) ? "Save rule" : "Create rule"}
            </button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.enabled}
                onChange={(e) => patch({ enabled: e.target.checked })}
                className="accent-[var(--accent)]"
              />
              Enabled
            </label>
            {dirty && <span className="text-xs text-muted">unsaved changes</span>}
          </div>
        </div>

        {/* results preview */}
        {!result.error && result.sample.length > 0 && (
          <div className="card overflow-hidden">
            <p className="border-b border-line px-3 py-2 text-sm font-medium">
              Results preview (first {result.sample.length})
            </p>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-surface-2">
                  <tr>
                    {result.columns.map((c) => (
                      <th key={c} className="whitespace-nowrap px-3 py-2 font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.sample.map((row, i) => (
                    <tr key={i} className="border-t border-line">
                      {result.columns.map((c) => {
                        const v = row[c];
                        const text =
                          v === null || v === undefined
                            ? "—"
                            : v instanceof Date
                              ? v.toISOString()
                              : String(v);
                        return (
                          <td key={c} className="max-w-[320px] px-3 py-1.5 font-mono">
                            <span className="block truncate" title={text}>
                              {text}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
