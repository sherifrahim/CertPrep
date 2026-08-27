"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  coverageSummary,
  defaultConnectors,
  detectionImpact,
  tableCoverage,
  type DataConnector,
} from "@/lab/connectors";
import { LabNote } from "./azure/resource-shell";

type Tab = "connectors" | "tables" | "detections";

const TABS: { id: Tab; label: string; lab?: boolean }[] = [
  { id: "connectors", label: "Data connectors" },
  { id: "tables", label: "Table coverage", lab: true },
  { id: "detections", label: "What still detects", lab: true },
];

export function ConnectorsConsole() {
  const [tab, setTab] = useState<Tab>("connectors");
  const [connectors, setConnectors] = useState<DataConnector[]>(defaultConnectors());
  const [open, setOpen] = useState<string | null>(null);

  const summary = useMemo(() => coverageSummary(connectors), [connectors]);
  const coverage = useMemo(() => tableCoverage(connectors), [connectors]);
  const impact = useMemo(() => detectionImpact(connectors), [connectors]);

  function toggle(id: string) {
    setConnectors((all) =>
      all.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Connected" ? "Not connected" : "Connected" }
          : c,
      ),
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-1 border-b border-line px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs ${
              tab === t.id ? "border-b-2 border-accent font-medium text-ink" : "text-muted"
            }`}
          >
            {t.label}
            {t.lab && (
              <span className="ml-1.5 rounded bg-surface-2 px-1 text-[10px] uppercase text-muted">
                lab
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="mb-3 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Connectors on", value: `${summary.connectorsOn}/${summary.connectorsTotal}` },
            { label: "Tables receiving data", value: `${summary.tablesCovered}/${summary.tablesTotal}` },
            {
              label: "Analytics rules that can fire",
              value: `${summary.rulesWorking}/${summary.rulesTotal}`,
              bad: summary.rulesWorking < summary.rulesTotal,
            },
          ].map((t) => (
            <div key={t.label} className="rounded border border-line p-3">
              <p className={`text-xl font-semibold ${t.bad ? "text-bad" : ""}`}>{t.value}</p>
              <p className="text-xs text-muted">{t.label}</p>
            </div>
          ))}
        </div>

        {tab === "connectors" && (
          <div className="space-y-2">
            {connectors.map((c) => (
              <section key={c.id} className="rounded border border-line">
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => setOpen(open === c.id ? null : c.id)}
                    aria-expanded={open === c.id}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block text-xs font-medium">{c.name}</span>
                    <span className="block text-[11px] text-muted">
                      {c.provider} · {c.tables.length} table{c.tables.length === 1 ? "" : "s"}
                    </span>
                  </button>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] ${
                      c.status === "Connected" ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted"
                    }`}
                  >
                    {c.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(c.id)}
                    className="btn-secondary py-0.5 text-[11px]"
                  >
                    {c.status === "Connected" ? "Disconnect" : "Connect"}
                  </button>
                </div>

                {open === c.id && (
                  <div className="space-y-2 border-t border-line p-3 text-xs">
                    <p>{c.description}</p>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted">Data types</p>
                      <ul className="mt-0.5 flex flex-wrap gap-1">
                        {c.tables.map((t) => (
                          <li key={t} className="chip font-mono">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted">Prerequisites</p>
                      <ul className="mt-0.5 list-disc space-y-0.5 pl-5">
                        {c.prerequisites.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted">Ingestion</p>
                      <p>{c.ingestion}</p>
                    </div>
                  </div>
                )}
              </section>
            ))}

            <LabNote>
              <p>
                Disconnect <strong>Microsoft Entra ID</strong> and then look at the other two tabs.
                Nothing breaks, nothing errors — <code className="font-mono">SigninLogs</code> just
                stops receiving rows, and every rule and hunting query that reads it starts
                returning nothing. Detection coverage is a function of ingestion, and no other blade
                in the portal tells you that.
              </p>
            </LabNote>
          </div>
        )}

        {tab === "tables" && (
          <div>
            <div className="overflow-x-auto rounded border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Table</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Fed by</th>
                    <th className="px-3 py-2 font-medium">Receiving data</th>
                  </tr>
                </thead>
                <tbody>
                  {coverage.map((t) => (
                    <tr key={t.table} className="border-b border-line last:border-0">
                      <td className="px-3 py-2 font-mono">{t.table}</td>
                      <td className="px-3 py-2 text-muted">{t.source}</td>
                      <td className="px-3 py-2 text-muted">{t.connectors.join(", ") || "—"}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 ${
                            t.covered ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
                          }`}
                        >
                          {t.covered ? "Yes" : "Empty"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <LabNote>
              <p>
                An empty table is not an error. A query against it parses, runs, and returns zero
                rows — which reads exactly like &ldquo;nothing happened&rdquo;. Try one in{" "}
                <Link href="/lab/hunting" className="text-accent-text">
                  advanced hunting
                </Link>{" "}
                and see that it looks identical to a clean environment.
              </p>
            </LabNote>
          </div>
        )}

        {tab === "detections" && (
          <div>
            <ul className="space-y-2">
              {impact.map((r) => (
                <li key={r.ruleName} className="rounded border border-line p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] ${
                        r.working ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
                      }`}
                    >
                      {r.working ? "Can fire" : "Never fires"}
                    </span>
                    <span className="text-xs font-medium">{r.ruleName}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">
                    Reads {r.tables.map((t) => t).join(", ")}
                  </p>
                  <p className="mt-1 text-xs">{r.verdict}</p>
                </li>
              ))}
            </ul>
            <LabNote>
              <p>
                A rule with no data is still enabled, still shows as healthy, and still reports zero
                incidents — indistinguishable from a rule that is working and finding nothing. This
                is why connector coverage is reviewed alongside detection coverage rather than
                separately from it.
              </p>
            </LabNote>
          </div>
        )}
      </div>
    </div>
  );
}
