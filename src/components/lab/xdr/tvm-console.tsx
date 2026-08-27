"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  REMEDIATION_NOTE,
  createRemediation,
  deviceSecureScore,
  exposureScore,
  softwareInventory,
  topExposedDevices,
  weaknesses,
  type RemediationRequest,
} from "@/lab/tvm";
import { LabNote } from "../azure/resource-shell";

type Tab = "dashboard" | "weaknesses" | "inventory" | "remediation";

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "weaknesses", label: "Weaknesses" },
  { id: "inventory", label: "Software inventory" },
  { id: "remediation", label: "Remediation" },
];

const threatTone: Record<string, string> = {
  "Exploit verified in the wild": "bg-bad-soft text-bad",
  "Exploit available": "bg-warn-soft text-warn",
  "No known exploit": "bg-surface-2 text-muted",
};

const sevTone: Record<string, string> = {
  Critical: "bg-bad-soft text-bad",
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-surface-2 text-muted",
};

const CONTROLS = deviceSecureScore().controls.map((c) => c.name);

export function TvmConsole() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [remediated, setRemediated] = useState<ReadonlySet<string>>(new Set());
  const [enabled, setEnabled] = useState<ReadonlySet<string>>(
    new Set(["Antivirus enabled", "Firewall enabled"]),
  );
  const [requests, setRequests] = useState<RemediationRequest[]>([]);

  const exposure = useMemo(() => exposureScore(remediated), [remediated]);
  const secure = useMemo(() => deviceSecureScore(enabled), [enabled]);
  const rows = useMemo(() => weaknesses(), []);
  const software = useMemo(() => softwareInventory(), []);
  const devices = useMemo(() => topExposedDevices(), []);

  function toggleControl(name: string) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
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
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "dashboard" && (
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <section className="rounded border border-line p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Exposure score</p>
                <p className="mt-1 text-3xl font-semibold">{exposure.score}<span className="text-base font-normal text-muted">/100</span></p>
                <p className="text-xs text-muted">
                  How much vulnerability the estate is carrying. <strong>Lower is better.</strong>
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${exposure.score}%`,
                      background: exposure.score >= 60 ? "var(--bad)" : exposure.score >= 30 ? "var(--warn)" : "var(--ok)",
                    }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {exposure.level} exposure · {exposure.devicesByLevel.High} high,{" "}
                  {exposure.devicesByLevel.Medium} medium, {exposure.devicesByLevel.Low} low
                </p>
              </section>

              <section className="rounded border border-line p-4">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Microsoft Secure Score for Devices
                </p>
                <p className="mt-1 text-3xl font-semibold">{secure.score}<span className="text-base font-normal text-muted">%</span></p>
                <p className="text-xs text-muted">
                  How well devices are <em>configured</em>. <strong>Higher is better.</strong>
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${secure.score}%`, background: "var(--accent)" }}
                  />
                </div>
                <ul className="mt-2 space-y-1">
                  {CONTROLS.map((name) => (
                    <li key={name}>
                      <label className="flex items-center gap-2 text-[11px]">
                        <input
                          type="checkbox"
                          checked={enabled.has(name)}
                          onChange={() => toggleControl(name)}
                        />
                        {name}
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <LabNote>
              <p>
                Two scores, opposite directions, different inputs. Remediate a CVE on{" "}
                <strong>Weaknesses</strong> and only the exposure score moves; tick a control here
                and only the secure score moves. An estate can be fully patched and badly
                configured, or hardened and full of unpatched software — reporting one number as
                &ldquo;our security score&rdquo; hides whichever half is bad.
              </p>
            </LabNote>

            <section>
              <h3 className="mb-2 text-xs font-semibold">Most exposed devices</h3>
              <div className="overflow-x-auto rounded border border-line">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Device</th>
                      <th className="px-3 py-2 font-medium">Exposure</th>
                      <th className="px-3 py-2 font-medium">Vulnerabilities</th>
                      <th className="px-3 py-2 font-medium">With a known exploit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.slice(0, 6).map((d) => (
                      <tr key={d.name} className="border-b border-line last:border-0">
                        <td className="px-3 py-2 font-mono">{d.name}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 ${
                              d.exposureLevel === "High"
                                ? "bg-bad-soft text-bad"
                                : d.exposureLevel === "Medium"
                                  ? "bg-warn-soft text-warn"
                                  : "bg-surface-2 text-muted"
                            }`}
                          >
                            {d.exposureLevel}
                          </span>
                        </td>
                        <td className="px-3 py-2">{d.vulnerabilities}</td>
                        <td className={`px-3 py-2 ${d.weaponised > 0 ? "text-bad" : "text-muted"}`}>
                          {d.weaponised}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === "weaknesses" && (
          <div>
            <div className="overflow-x-auto rounded border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">CVE ID</th>
                    <th className="px-3 py-2 font-medium">Severity</th>
                    <th className="px-3 py-2 font-medium">CVSS</th>
                    <th className="px-3 py-2 font-medium">Threat</th>
                    <th className="px-3 py-2 font-medium">Software</th>
                    <th className="px-3 py-2 font-medium">Exposed devices</th>
                    <th className="px-3 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((w) => {
                    const done = remediated.has(w.cveId);
                    return (
                      <tr
                        key={w.cveId}
                        className={`border-b border-line last:border-0 ${done ? "opacity-50" : ""}`}
                      >
                        <td className="px-3 py-2 font-mono">{w.cveId}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded px-1.5 py-0.5 ${sevTone[w.severity]}`}>
                            {w.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2 tabular-nums">{w.cvss.toFixed(1)}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded px-1.5 py-0.5 ${threatTone[w.threat]}`}>
                            {w.threat}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-muted">{w.software}</td>
                        <td className="px-3 py-2">{w.exposedDevices.length}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setRemediated((prev) => {
                                const next = new Set(prev);
                                if (next.has(w.cveId)) next.delete(w.cveId);
                                else next.add(w.cveId);
                                return next;
                              })
                            }
                            className="btn-secondary py-0.5 text-[11px]"
                          >
                            {done ? "Undo" : "Mark patched"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <LabNote>
              <p>
                The table is ordered by <strong>Threat</strong>, then by how widely the CVE is
                exposed — not by CVSS. Sort by CVSS and you get a queue that starts with the
                highest number rather than the thing most likely to be used against you: a 6.5 with
                a verified exploit outranks a 9.8 nobody has weaponised.
              </p>
            </LabNote>
          </div>
        )}

        {tab === "inventory" && (
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Software</th>
                  <th className="px-3 py-2 font-medium">Vendor</th>
                  <th className="px-3 py-2 font-medium">Installed devices</th>
                  <th className="px-3 py-2 font-medium">Weaknesses</th>
                  <th className="px-3 py-2 font-medium">Support</th>
                </tr>
              </thead>
              <tbody>
                {software.map((s) => (
                  <tr key={s.name} className="border-b border-line last:border-0">
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2 text-muted">{s.vendor}</td>
                    <td className="px-3 py-2">{s.installedDevices.length}</td>
                    <td className="px-3 py-2">{s.weaknesses}</td>
                    <td className="px-3 py-2">
                      {s.endOfSupport ? (
                        <span className="rounded bg-bad-soft px-1.5 py-0.5 text-[11px] text-bad">
                          End of support
                        </span>
                      ) : (
                        <span className="text-muted">Supported</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "remediation" && (
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setRequests((r) => [
                    ...r,
                    createRemediation(
                      "Update Microsoft Windows",
                      rows.filter((w) => w.software.includes("Windows")).map((w) => w.cveId),
                      devices.filter((d) => d.exposureLevel !== "Low").length,
                    ),
                  ])
                }
                className="btn-secondary py-1 text-xs"
              >
                + Request remediation for Windows updates
              </button>
            </div>

            <div className="overflow-x-auto rounded border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Request</th>
                    <th className="px-3 py-2 font-medium">CVEs</th>
                    <th className="px-3 py-2 font-medium">Devices</th>
                    <th className="px-3 py-2 font-medium">Assigned to</th>
                    <th className="px-3 py-2 font-medium">Due</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr key={`${r.id}-${i}`} className="border-b border-line last:border-0">
                      <td className="px-3 py-2">{r.recommendation}</td>
                      <td className="px-3 py-2">{r.cveIds.length}</td>
                      <td className="px-3 py-2">{r.devices}</td>
                      <td className="px-3 py-2 text-muted">{r.assignedTo}</td>
                      <td className="px-3 py-2">{r.dueInDays} days</td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[11px] text-accent-text">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-muted">
                        No remediation requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <LabNote>
              <p>
                {REMEDIATION_NOTE} Create one and watch the exposure score above: it does not move.
                Only marking a CVE patched on <strong>Weaknesses</strong> changes it, because only
                that represents the update actually landing.
              </p>
              <p>
                <Link href="/lab/devices" className="text-accent-text">
                  The device pages
                </Link>{" "}
                show the same findings per machine, including which updates are missing.
              </p>
            </LabNote>
          </div>
        )}
      </div>
    </div>
  );
}
