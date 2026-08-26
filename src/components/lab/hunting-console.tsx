"use client";

import { useState, useTransition } from "react";
import { runLabQuery, type LabResult } from "@/lib/actions/lab-actions";
import { SAMPLE_QUERIES, QUERY_CATEGORIES } from "@/lab/queries";
import type { TableSchema } from "@/lab/schema";

const DEFAULT_QUERY = `DeviceProcessEvents
| where Timestamp > ago(7d)
| where FileName =~ "powershell.exe"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine
| take 20`;

type Props = {
  schema: TableSchema[];
  rowCounts: Record<string, number>;
  /** Prefilled from an incident investigation step. */
  initialQuery?: string;
};

export function HuntingConsole({ schema, rowCounts, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery || DEFAULT_QUERY);
  const [result, setResult] = useState<LabResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [openTable, setOpenTable] = useState<string | null>(null);
  const [tab, setTab] = useState<"schema" | "samples">("schema");

  function run(q: string = query) {
    startTransition(async () => setResult(await runLabQuery({ query: q })));
  }

  function applySample(q: string) {
    setQuery(q);
    run(q);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* left rail: schema and sample queries, as the portal does */}
      <aside className="card flex max-h-[70vh] flex-col overflow-hidden">
        <div className="flex border-b border-line text-sm">
          {(["schema", "samples"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-2 capitalize ${
                tab === t ? "border-b-2 border-accent font-medium text-ink" : "text-muted"
              }`}
            >
              {t === "schema" ? "Schema" : "Sample queries"}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {tab === "schema" ? (
            <ul className="space-y-1">
              {schema.map((table) => (
                <li key={table.name}>
                  <button
                    type="button"
                    onClick={() => setOpenTable(openTable === table.name ? null : table.name)}
                    className="flex w-full items-baseline gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                  >
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">{table.name}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {(rowCounts[table.name] ?? 0).toLocaleString()}
                    </span>
                  </button>
                  {openTable === table.name && (
                    <div className="mb-2 ml-2 border-l border-line pl-3">
                      <p className="py-1 text-xs text-muted">{table.description}</p>
                      <button
                        type="button"
                        onClick={() => applySample(`${table.name}\n| take 20`)}
                        className="mb-2 text-xs text-accent-text underline"
                      >
                        Query this table
                      </button>
                      <ul className="space-y-0.5">
                        {table.columns.map((c) => (
                          <li key={c.name} className="text-xs" title={c.description}>
                            <button
                              type="button"
                              onClick={() => setQuery((q) => `${q}\n| where ${c.name} == ""`)}
                              className="font-mono text-muted hover:text-ink"
                            >
                              {c.name}
                            </button>
                            <span className="ml-1 text-[10px] uppercase text-muted/70">{c.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3">
              {QUERY_CATEGORIES.map((cat) => {
                const items = SAMPLE_QUERIES.filter((s) => s.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      {cat}
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {items.map((s) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => applySample(s.query)}
                            className="w-full rounded px-2 py-1.5 text-left hover:bg-surface-2"
                          >
                            <span className="block text-sm">{s.title}</span>
                            <span className="block text-xs text-muted">{s.description}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* right: editor and results */}
      <div className="min-w-0 space-y-3">
        <div className="card overflow-hidden">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // Shift+Enter runs, matching the portal.
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                run();
              }
            }}
            spellCheck={false}
            rows={10}
            aria-label="KQL query"
            className="w-full resize-y bg-surface p-3 font-mono text-sm text-ink outline-none"
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-line p-2">
            <button type="button" onClick={() => run()} disabled={pending} className="btn-primary text-sm">
              {pending ? "Running…" : "Run query"}
            </button>
            <button
              type="button"
              onClick={() => { setQuery(""); setResult(null); }}
              className="btn-ghost text-sm"
            >
              Clear
            </button>
            <span className="ml-auto text-xs text-muted">Shift + Enter to run</span>
          </div>
        </div>

        {result && !result.ok && (
          <div className="card border-bad bg-bad-soft p-3 text-sm">
            <p className="font-medium text-bad">Query failed</p>
            <p className="mt-1 text-ink">{result.error}</p>
          </div>
        )}

        {result?.ok && (
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-line px-3 py-2 text-sm">
              <span>
                <strong>{result.totalRows.toLocaleString()}</strong> row
                {result.totalRows === 1 ? "" : "s"}
              </span>
              <span className="text-muted">{result.durationMs} ms</span>
              {result.truncated && (
                <span className="rounded bg-warn-soft px-2 py-0.5 text-xs text-warn">
                  showing the first {result.rows.length}
                </span>
              )}
            </div>
            {result.rows.length === 0 ? (
              <p className="p-4 text-sm text-muted">
                No results. Widen the time range, or check the filter values against the schema.
              </p>
            ) : (
              <div className="max-h-[52vh] overflow-auto">
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
                    {result.rows.map((row, i) => (
                      <tr key={i} className="border-t border-line align-top hover:bg-surface-2">
                        {row.map((cell, j) => (
                          <td key={j} className="max-w-[380px] px-3 py-1.5 font-mono">
                            <span className="block truncate" title={cell === null ? "" : String(cell)}>
                              {cell === null ? <span className="text-muted">—</span> : String(cell)}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
