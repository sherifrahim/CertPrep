"use client";

import Link from "next/link";
import { useState } from "react";
import {
  RESPONSE_ACTIONS,
  RISK_TONE,
  alertsFor,
  isActionAvailable,
  missingKbsFor,
  recommendationsFor,
  softwareFor,
  timelineFor,
  vulnerabilitiesFor,
  type DeviceDetails,
} from "@/lab/device";
import { LabNote } from "../azure/resource-shell";
import { XdrEntityShell, type EntityAction } from "./entity-shell";

const ACTION_GLYPHS: Record<string, string> = {
  "isolate-full": "⛔",
  "isolate-selective": "◐",
  "restrict-app-execution": "▤",
  "av-scan-quick": "⚡",
  "av-scan-full": "⌕",
  "collect-package": "⭳",
  "live-response": "⌨",
  "automated-investigation": "⟳",
};

const sevTone: Record<string, string> = {
  Critical: "bg-bad-soft text-bad",
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

export function DevicePage({ device }: { device: DeviceDetails }) {
  const [tab, setTab] = useState("overview");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [taken, setTaken] = useState<Record<string, boolean>>({});

  const alerts = alertsFor(device);
  const vulns = vulnerabilitiesFor(device);
  const software = softwareFor(device);
  const recs = recommendationsFor(device);
  const kbs = missingKbsFor(device);
  const timeline = timelineFor(device);

  const actions: EntityAction[] = RESPONSE_ACTIONS.map((a) => {
    const { available, reason } = isActionAvailable(a, device);
    return { id: a.id, label: a.label, glyph: ACTION_GLYPHS[a.id] ?? "•", available, reason };
  });

  const selected = RESPONSE_ACTIONS.find((a) => a.id === pendingAction);
  const selectedState = selected ? isActionAvailable(selected, device) : null;

  return (
    <div className="space-y-4">
      <XdrEntityShell
        backHref="/lab/devices"
        backLabel="Device inventory"
        glyph="PC"
        name={device.name}
        subtitle={`${device.os} · ${device.domain}`}
        chips={[
          { label: `Risk: ${device.riskLevel}`, tone: RISK_TONE[device.riskLevel] },
          {
            label: `Exposure: ${device.exposureLevel}`,
            tone:
              device.exposureLevel === "High"
                ? "bg-bad-soft text-bad"
                : device.exposureLevel === "Medium"
                  ? "bg-warn-soft text-warn"
                  : "bg-surface-2 text-muted",
          },
          {
            label: device.healthState,
            tone:
              device.healthState === "Active"
                ? "bg-ok-soft text-ok"
                : "bg-bad-soft text-bad",
          },
        ]}
        tags={device.tags}
        actions={actions}
        onAction={(id) => setPendingAction(pendingAction === id ? null : id)}
        activeAction={pendingAction}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "alerts", label: "Alerts", badge: alerts.length },
          { id: "timeline", label: "Timeline", badge: timeline.length },
          { id: "recommendations", label: "Security recommendations", badge: recs.length },
          { id: "software", label: "Software inventory", badge: software.length },
          { id: "vulnerabilities", label: "Discovered vulnerabilities", badge: vulns.length },
          { id: "kbs", label: "Missing KBs", badge: kbs.length },
        ]}
        activeTab={tab}
        onTab={setTab}
        details={[
          { label: "Domain", value: device.domain },
          { label: "OS", value: `${device.os} (${device.osBuild})` },
          { label: "Health state", value: device.healthState },
          { label: "Onboarding status", value: device.onboardingStatus },
          { label: "Managed by", value: device.managedBy },
          { label: "Antivirus status", value: device.antivirusStatus },
          { label: "Device group", value: device.deviceGroup },
          { label: "Primary user", value: device.primaryUser },
          { label: "IP address", value: device.ipAddress },
          { label: "First seen", value: when(device.firstSeen) },
          { label: "Last seen", value: when(device.lastSeen) },
        ]}
      >
        {tab === "overview" && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Active alerts", value: alerts.length },
                { label: "Discovered vulnerabilities", value: vulns.length },
                { label: "Security recommendations", value: recs.length },
                { label: "Missing updates", value: kbs.length },
              ].map((t) => (
                <div key={t.label} className="rounded border border-line p-3">
                  <p className="text-lg font-semibold">{t.value}</p>
                  <p className="text-xs text-muted">{t.label}</p>
                </div>
              ))}
            </div>
            <Link
              href={`/lab/hunting?q=${encodeURIComponent(
                `DeviceProcessEvents\n| where DeviceName == "${device.name}"\n| project Timestamp, FileName, InitiatingProcessFileName, ProcessCommandLine\n| sort by Timestamp desc`,
              )}`}
              className="inline-block text-xs text-accent-text"
            >
              Go hunt: everything that ran on this device →
            </Link>
          </div>
        )}

        {tab === "alerts" && (
          <Table
            head={["Severity", "Alert", "Category", "Detection source", "Time"]}
            rows={alerts.map((a) => [
              <span key="s" className={`rounded px-1.5 py-0.5 text-[11px] ${sevTone[a.severity]}`}>
                {a.severity}
              </span>,
              a.title,
              a.category,
              a.serviceSource,
              when(a.timestamp),
            ])}
            empty="No alerts on this device."
          />
        )}

        {tab === "timeline" && (
          <Table
            head={["Time", "Event type", "Detail"]}
            rows={timeline.map((r) => [when(r.timestamp), r.type, <code key="d" className="font-mono text-[11px]">{r.detail}</code>])}
            empty="No telemetry for this device."
          />
        )}

        {tab === "recommendations" && (
          <Table
            head={["Recommendation", "Weaknesses", "Remediation type", "Impact", "Status"]}
            rows={recs.map((r) => [
              r.title,
              r.weaknesses,
              r.remediationType,
              `+${r.impact.toFixed(1)}`,
              r.status,
            ])}
            empty="No recommendations."
          />
        )}

        {tab === "software" && (
          <Table
            head={["Software", "Vendor", "Version", "Weaknesses", "Support"]}
            rows={software.map((s) => [
              s.name,
              s.vendor,
              <code key="v" className="font-mono text-[11px]">{s.version}</code>,
              s.weaknesses,
              s.endOfSupport ? (
                <span key="e" className="rounded bg-bad-soft px-1.5 py-0.5 text-[11px] text-bad">
                  End of support
                </span>
              ) : (
                "Supported"
              ),
            ])}
            empty="No software inventory."
          />
        )}

        {tab === "vulnerabilities" && (
          <>
            <Table
              head={["CVE", "Severity", "CVSS", "Software", "Threat", "Published"]}
              rows={vulns.map((v) => [
                <code key="c" className="font-mono text-[11px]">{v.cveId}</code>,
                <span key="s" className={`rounded px-1.5 py-0.5 text-[11px] ${sevTone[v.severity]}`}>
                  {v.severity}
                </span>,
                v.cvss.toFixed(1),
                v.software,
                v.exploitInTheWild ? (
                  <span key="t" className="rounded bg-bad-soft px-1.5 py-0.5 text-[11px] text-bad">
                    Exploited in the wild
                  </span>
                ) : v.exploitAvailable ? (
                  <span key="t" className="rounded bg-warn-soft px-1.5 py-0.5 text-[11px] text-warn">
                    Exploit available
                  </span>
                ) : (
                  <span key="t" className="text-muted">
                    No known exploit
                  </span>
                ),
                v.published,
              ])}
              empty="No vulnerabilities discovered."
            />
            <LabNote>
              <p>
                Sort by CVSS and you get the wrong queue. The column that should drive the order is{" "}
                <strong>Threat</strong> — a 6.5 with a live exploit is more urgent than a 9.8 nobody
                has weaponised, which is the whole argument for threat-aware prioritisation over raw
                severity.
              </p>
            </LabNote>
          </>
        )}

        {tab === "kbs" && (
          <Table
            head={["Update", "Name", "OS build", "CVEs addressed"]}
            rows={kbs.map((k) => [
              <code key="i" className="font-mono text-[11px]">{k.id}</code>,
              k.name,
              k.osBuild,
              k.cvesAddressed.join(", "),
            ])}
            empty="No missing updates."
          />
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
              <dt className="text-muted">What the user loses</dt>
              <dd>{selected.userImpact}</dd>
            </div>
            <div>
              <dt className="text-muted">Requirements</dt>
              <dd>{selected.requires.join(" · ")}</dd>
            </div>
            <div>
              <dt className="text-muted">Reversible</dt>
              <dd>{selected.undoable ? selected.undoLabel : "No — this cannot be undone."}</dd>
            </div>
          </dl>

          {selectedState?.available ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTaken((t) => ({ ...t, [selected.id]: !t[selected.id] }))}
                className={taken[selected.id] ? "btn-secondary text-xs" : "btn-primary text-xs"}
              >
                {taken[selected.id]
                  ? (selected.undoLabel ?? "Already run")
                  : `Confirm — ${selected.label}`}
              </button>
              {taken[selected.id] && (
                <span className="text-xs text-ok">
                  Submitted. It appears in the Action center with its status.
                </span>
              )}
            </div>
          ) : (
            <p className="mt-3 rounded bg-warn-soft p-2 text-xs text-warn">
              {selectedState?.reason}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Table({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  return (
    <div className="overflow-x-auto rounded border border-line">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {cells.map((c, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={head.length} className="px-3 py-6 text-center text-muted">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
