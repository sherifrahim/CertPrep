"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Incident, Severity } from "@/lab/incidents";
import { getAllTriage, resetTriage, type TriageState } from "@/lab/triage";

const sevTone: Record<Severity, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-accent-soft text-accent-text",
  Informational: "bg-surface-2 text-muted",
};

function when(iso: string): string {
  if (!iso) return "—";
  // An explicit timeZone keeps server render and client hydration identical;
  // without it the server's zone and the browser's disagree and React bails.
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function IncidentQueue({ incidents }: { incidents: Incident[] }) {
  const [triage, setTriageState] = useState<Record<string, TriageState>>({});
  const [severity, setSeverity] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");

  useEffect(() => setTriageState(getAllTriage()), []);

  const rows = useMemo(
    () =>
      incidents
        .map((i) => ({
          incident: i,
          status: triage[i.id]?.status ?? i.status,
          owner: triage[i.id]?.owner ?? "Unassigned",
          classification: triage[i.id]?.classification ?? i.classification,
        }))
        .filter((r) => (severity === "All" ? true : r.incident.severity === severity))
        .filter((r) => (status === "All" ? true : r.status === status)),
    [incidents, triage, severity, status],
  );

  const openCount = rows.filter((r) => r.status !== "Resolved").length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-muted">
          Severity
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="field ml-2 inline-block w-auto py-1 text-sm"
          >
            {["All", "High", "Medium", "Low"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-muted">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="field ml-2 inline-block w-auto py-1 text-sm"
          >
            {["All", "Active", "In progress", "Resolved"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span className="ml-auto text-sm text-muted">
          {rows.length} incident{rows.length === 1 ? "" : "s"} · {openCount} open
        </span>
        <button
          type="button"
          onClick={() => {
            resetTriage();
            setTriageState({});
          }}
          className="btn-ghost text-xs"
        >
          Reset my triage
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Severity</th>
              <th className="px-3 py-2 font-medium">Incident</th>
              <th className="px-3 py-2 font-medium">Alerts</th>
              <th className="px-3 py-2 font-medium">Impacted assets</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Owner</th>
              <th className="px-3 py-2 font-medium">Last activity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ incident, status: st, owner, classification }) => (
              <tr key={incident.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${sevTone[incident.severity]}`}>
                    {incident.severity}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Link href={`/lab/incidents/${incident.id}`} className="font-medium text-accent-text">
                    {incident.title}
                  </Link>
                  <div className="text-xs text-muted">
                    {incident.id}
                    {classification !== "Not set" && ` · ${classification}`}
                  </div>
                </td>
                <td className="px-3 py-2">{incident.alerts.length}</td>
                <td className="px-3 py-2 text-xs text-muted">
                  {incident.devices.length} device{incident.devices.length === 1 ? "" : "s"},{" "}
                  {incident.users.length} user{incident.users.length === 1 ? "" : "s"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      st === "Resolved" ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted"
                    }`}
                  >
                    {st}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs">{owner}</td>
                <td className="px-3 py-2 text-xs text-muted">{when(incident.lastActivity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="card p-4 text-sm text-muted">No incidents match those filters.</p>
      )}
    </div>
  );
}
