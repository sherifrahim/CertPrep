"use client";

import { useMemo, useState } from "react";
import {
  SAMPLE_PACKETS,
  STARTER_POLICY,
  evaluatePacket,
  evaluationOrder,
  type FirewallProtocol,
  type Packet,
  type ThreatIntelMode,
} from "@/lab/firewall";

const THREAT_MODES: ThreatIntelMode[] = ["Alert and deny", "Alert only", "Off"];

const stageTone: Record<string, string> = {
  "Threat intelligence": "bg-bad-soft text-bad",
  DNAT: "bg-accent-soft text-accent-text",
  Network: "bg-warn-soft text-warn",
  Application: "bg-ok-soft text-ok",
  Default: "bg-surface-2 text-muted",
};

export function FirewallConsole() {
  const [packet, setPacket] = useState<Packet>(SAMPLE_PACKETS[0].packet);
  const [note, setNote] = useState(SAMPLE_PACKETS[0].teaches);
  const [threatIntel, setThreatIntel] = useState<ThreatIntelMode>("Alert and deny");

  const verdict = useMemo(
    () => evaluatePacket(STARTER_POLICY, packet, threatIntel),
    [packet, threatIntel],
  );
  const ordered = useMemo(() => evaluationOrder(STARTER_POLICY), []);

  const set = (patch: Partial<Packet>) => {
    setPacket((p) => ({ ...p, ...patch }));
    setNote("");
  };

  return (
    <div className="space-y-4">
      <div
        className={`card p-4 ${
          verdict.action === "Allow" ? "border-ok bg-ok-soft" : "border-bad bg-bad-soft"
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-3">
          <span
            className={`text-lg font-semibold ${
              verdict.action === "Allow" ? "text-ok" : "text-bad"
            }`}
          >
            {verdict.action === "Allow" ? "Allowed" : "Denied"}
          </span>
          <span className="text-sm">
            by <strong>{verdict.decidedBy}</strong>
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {packet.protocol} {packet.sourceIp} → {packet.destinationIp}:{packet.destinationPort}
          {packet.fqdn && ` (${packet.fqdn})`}
          {verdict.translatedTo && ` · translated to ${verdict.translatedTo}`}
        </p>
        {note && <p className="mt-2 text-sm">{note}</p>}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card p-4">
          <h2 className="font-semibold">Send a packet</h2>
          <div className="mt-3 flex flex-wrap gap-1">
            {SAMPLE_PACKETS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setPacket(s.packet);
                  setNote(s.teaches);
                }}
                className="chip hover:text-ink"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Source address</span>
              <input
                value={packet.sourceIp}
                onChange={(e) => set({ sourceIp: e.target.value })}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Destination address</span>
              <input
                value={packet.destinationIp}
                onChange={(e) => set({ destinationIp: e.target.value })}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Destination port</span>
              <input
                type="number"
                value={packet.destinationPort}
                onChange={(e) => set({ destinationPort: Number(e.target.value) })}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Protocol</span>
              <select
                value={packet.protocol}
                onChange={(e) => set({ protocol: e.target.value as FirewallProtocol })}
                className="field py-1.5 text-sm"
              >
                <option>TCP</option>
                <option>UDP</option>
                <option>ICMP</option>
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">
                Hostname <span className="font-normal text-muted">(application rules need one)</span>
              </span>
              <input
                value={packet.fqdn ?? ""}
                placeholder="leave empty for non-web traffic"
                onChange={(e) => set({ fqdn: e.target.value.trim() || undefined })}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Threat intelligence mode</span>
              <select
                value={threatIntel}
                onChange={(e) => {
                  setThreatIntel(e.target.value as ThreatIntelMode);
                  setNote("");
                }}
                className="field py-1.5 text-sm"
              >
                {THREAT_MODES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold">How it was decided</h2>
          <p className="mt-1 text-sm text-muted">
            Every step, in the order the firewall took them. Rule <em>types</em> are processed DNAT,
            then network, then application — and that order beats any priority number you set.
          </p>
          <ol className="mt-3 space-y-2">
            {verdict.trace.map((step, i) => (
              <li
                key={`${step.stage}-${step.rule ?? "none"}-${i}`}
                className={`rounded border p-2 text-sm ${
                  step.matched ? "border-line bg-surface-2" : "border-transparent"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] ${
                      stageTone[step.stage] ?? "bg-surface-2 text-muted"
                    }`}
                  >
                    {step.stage}
                  </span>
                  {step.rule && (
                    <span className="font-mono text-xs">
                      {step.collection} / {step.rule}
                    </span>
                  )}
                  {step.matched && (
                    <span className="text-xs font-medium text-ink">← decided here</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted">{step.reason}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="px-4 pt-4 text-left text-sm text-muted">
            The policy in evaluation order, not the order it was written.
          </caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Collection</th>
              <th className="px-4 py-2 font-medium">Action</th>
              <th className="px-4 py-2 font-medium">Group / priority</th>
              <th className="px-4 py-2 font-medium">Rules</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((c) => (
              <tr key={c.name} className="border-b border-line align-top last:border-0">
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] ${stageTone[c.type] ?? ""}`}
                  >
                    {c.type}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs">{c.name}</td>
                <td className={`px-4 py-2 ${c.action === "Deny" ? "text-bad" : "text-ok"}`}>
                  {c.action}
                </td>
                <td className="px-4 py-2 text-xs text-muted">
                  {c.groupPriority} / {c.priority}
                </td>
                <td className="px-4 py-2 text-xs text-muted">
                  {[
                    ...(c.dnatRules ?? []).map((r) => r.name),
                    ...(c.networkRules ?? []).map((r) => r.name),
                    ...(c.applicationRules ?? []).map((r) => r.name),
                  ].join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
