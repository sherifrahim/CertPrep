import Link from "next/link";
import { DEVICES, IOC, LAB_NOW, labTables } from "@/lab/data";
import type { Row } from "@/lab/kql/engine";

export const metadata = {
  title: "Device inventory",
  description: "Onboarded endpoints with risk, exposure and activity.",
};

/** Risk is derived from the alerts actually attached to each device. */
function deviceRisk(name: string, evidence: Row[], alerts: Row[]) {
  const alertIds = new Set(
    evidence.filter((e) => e.DeviceName === name).map((e) => String(e.AlertId)),
  );
  const attached = alerts.filter((a) => alertIds.has(String(a.AlertId)));
  const high = attached.filter((a) => a.Severity === "High").length;
  const medium = attached.filter((a) => a.Severity === "Medium").length;
  const level = high > 0 ? "High" : medium > 0 ? "Medium" : attached.length ? "Low" : "None";
  return { level, count: attached.length };
}

const riskTone: Record<string, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-accent-soft text-accent-text",
  None: "bg-surface-2 text-muted",
};

export default function DevicesPage() {
  const t = labTables();
  const evidence = t.AlertEvidence as Row[];
  const alerts = t.AlertInfo as Row[];
  const processes = t.DeviceProcessEvents as Row[];

  const rows = DEVICES.map((d) => {
    const risk = deviceRisk(d.name, evidence, alerts);
    const events = processes.filter((p) => p.DeviceName === d.name);
    const lastSeen = events[0]?.Timestamp as Date | undefined;
    return { ...d, risk, events: events.length, lastSeen };
  }).sort((a, b) => b.risk.count - a.risk.count);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR · Assets
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Device inventory</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {DEVICES.length} onboarded devices. Risk is derived from the alerts actually attached to
          each device, so it moves with the evidence rather than being decoration.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Device</th>
              <th className="px-3 py-2 font-medium">Risk</th>
              <th className="px-3 py-2 font-medium">Alerts</th>
              <th className="px-3 py-2 font-medium">Operating system</th>
              <th className="px-3 py-2 font-medium">Primary user</th>
              <th className="px-3 py-2 font-medium">Process events</th>
              <th className="px-3 py-2 font-medium">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                <td className="px-3 py-2">
                  <span className="font-mono text-xs">{d.name}</span>
                  {d.name === IOC.victimDevice && (
                    <span className="ml-2 rounded bg-bad-soft px-1.5 py-0.5 text-[10px] uppercase text-bad">
                      patient zero
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${riskTone[d.risk.level]}`}>
                    {d.risk.level}
                  </span>
                </td>
                <td className="px-3 py-2">{d.risk.count}</td>
                <td className="px-3 py-2 text-xs text-muted">{d.os}</td>
                <td className="px-3 py-2 text-xs">{d.user}</td>
                <td className="px-3 py-2 text-xs">{d.events.toLocaleString()}</td>
                <td className="px-3 py-2 text-xs text-muted">
                  {d.lastSeen
                    ? d.lastSeen.toLocaleString("en-GB", {
                        timeZone: "UTC",
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted">
        Lab clock is fixed at {LAB_NOW.toISOString().slice(0, 16).replace("T", " ")} UTC, so{" "}
        <code className="font-mono text-xs">ago()</code> lines up with this telemetry.{" "}
        <Link href="/lab/hunting" className="text-accent-text underline">
          Hunt across these devices
        </Link>
        .
      </p>
    </div>
  );
}
