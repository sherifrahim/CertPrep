"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ANALYSTS,
  CLASSIFICATIONS,
  STATUSES,
  type Classification,
  type Incident,
  type IncidentStatus,
} from "@/lab/incidents";
import { getTriage, setTriage, type TriageState } from "@/lab/triage";

function when(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const sevTone: Record<string, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-accent-soft text-accent-text",
};

export function IncidentDetail({ incident }: { incident: Incident }) {
  const [triage, setLocal] = useState<TriageState>({});
  const [tab, setTab] = useState<"story" | "alerts" | "assets" | "investigate">("story");
  const [saved, setSaved] = useState(false);

  useEffect(() => setLocal(getTriage(incident.id)), [incident.id]);

  function update(patch: TriageState) {
    setLocal(setTriage(incident.id, patch));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  const status = triage.status ?? incident.status;
  const classification = triage.classification ?? incident.classification;
  const owner = triage.owner ?? "Unassigned";

  return (
    <div className="space-y-4">
      <div>
        <Link href="/lab/incidents" className="text-sm text-accent-text">
          ← Incidents
        </Link>
        <div className="mt-2 flex flex-wrap items-start gap-3">
          <span className={`rounded px-2 py-1 text-xs font-medium ${sevTone[incident.severity] ?? ""}`}>
            {incident.severity}
          </span>
          <h1 className="min-w-0 flex-1 text-xl font-semibold tracking-tight">{incident.title}</h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          {incident.id} · {incident.alerts.length} alerts · first seen {when(incident.firstActivity)}
        </p>
      </div>

      {/* triage bar, mirroring the manage-incident pane */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Status</span>
            <select
              value={status}
              onChange={(e) => update({ status: e.target.value as IncidentStatus })}
              className="field py-1.5 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Classification</span>
            <select
              value={classification}
              onChange={(e) => update({ classification: e.target.value as Classification })}
              className="field py-1.5 text-sm"
            >
              {CLASSIFICATIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Assigned to</span>
            <select
              value={owner}
              onChange={(e) => update({ owner: e.target.value })}
              className="field py-1.5 text-sm"
            >
              {ANALYSTS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-medium">Investigation notes</span>
          <textarea
            value={triage.notes ?? ""}
            onChange={(e) => setLocal({ ...triage, notes: e.target.value })}
            onBlur={(e) => update({ notes: e.target.value })}
            rows={2}
            placeholder="What did you find, and what did you do about it?"
            className="field text-sm"
          />
        </label>
        <p className="mt-2 text-xs text-muted">
          {saved ? "Saved." : "Triage is saved in this browser so you can pick the case back up."}
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-line text-sm">
        {(
          [
            ["story", "Attack story"],
            ["alerts", `Alerts (${incident.alerts.length})`],
            ["assets", "Assets"],
            ["investigate", "Investigate"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`border-b-2 px-3 py-2 ${
              tab === key ? "border-accent font-medium text-ink" : "border-transparent text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "story" && (
        <div className="space-y-3">
          <p className="card p-4 text-sm">{incident.summary}</p>
          <div className="card p-4">
            <h2 className="text-sm font-semibold">Attack stages observed</h2>
            <ol className="mt-3 space-y-3">
              {incident.categories.map((cat, i) => {
                const inStage = incident.alerts.filter((a) => a.category === cat);
                return (
                  <li key={cat} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{cat}</p>
                      <ul className="mt-1 space-y-0.5">
                        {inStage.map((a) => (
                          <li key={a.alertId} className="text-xs text-muted">
                            {when(a.timestamp)} — {a.title}{" "}
                            <span className="font-mono">[{a.techniques}]</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      {tab === "alerts" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Alert</th>
                <th className="px-3 py-2 font-medium">Severity</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Technique</th>
              </tr>
            </thead>
            <tbody>
              {incident.alerts.map((a) => (
                <tr key={a.alertId} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted">{when(a.timestamp)}</td>
                  <td className="px-3 py-2">{a.title}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${sevTone[a.severity] ?? ""}`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{a.category}</td>
                  <td className="px-3 py-2 text-xs text-muted">{a.serviceSource}</td>
                  <td className="px-3 py-2 font-mono text-xs">{a.techniques}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "assets" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card p-4">
            <h2 className="text-sm font-semibold">Devices ({incident.devices.length})</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {incident.devices.length ? (
                incident.devices.map((d) => (
                  <li key={d} className="font-mono text-xs">
                    {d}
                  </li>
                ))
              ) : (
                <li className="text-muted">No devices attached.</li>
              )}
            </ul>
          </div>
          <div className="card p-4">
            <h2 className="text-sm font-semibold">Users ({incident.users.length})</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {incident.users.length ? (
                incident.users.map((u) => (
                  <li key={u} className="font-mono text-xs">
                    {u}
                  </li>
                ))
              ) : (
                <li className="text-muted">No users attached.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {tab === "investigate" && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Work the case the way you would in the portal. Each question opens in advanced hunting
            with the query prefilled — read it before you run it.
          </p>
          {incident.investigation.map((step, i) => (
            <div key={i} className="card p-4">
              <p className="text-sm font-medium">{step.question}</p>
              <pre className="mt-2 overflow-x-auto rounded bg-surface-2 p-3 font-mono text-xs">
                {step.query}
              </pre>
              <Link
                href={`/lab/hunting?q=${encodeURIComponent(step.query)}`}
                className="btn-secondary mt-3 text-xs"
              >
                Open in advanced hunting
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
