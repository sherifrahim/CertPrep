"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_RULES,
  SAMPLE_FLOWS,
  STARTER_RULES,
  evaluateFlow,
  validateRule,
  type Direction,
  type Flow,
  type NsgRule,
} from "@/lab/nsg";

const BLANK: NsgRule = {
  name: "",
  priority: 400,
  direction: "Inbound",
  access: "Allow",
  protocol: "TCP",
  source: "*",
  sourcePort: "*",
  destination: "*",
  destinationPort: "",
};

export function NsgConsole() {
  const [rules, setRules] = useState<NsgRule[]>(STARTER_RULES);
  const [draft, setDraft] = useState<NsgRule>(BLANK);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<Flow>(SAMPLE_FLOWS[0].flow);
  const [note, setNote] = useState<string>(SAMPLE_FLOWS[0].teaches);

  const evaluation = useMemo(() => evaluateFlow(rules, flow), [rules, flow]);

  function addRule() {
    const candidate = { ...draft, name: draft.name.trim() };
    const problem = validateRule(candidate, rules);
    if (problem) {
      setError(problem);
      return;
    }
    setRules((r) => [...r, candidate].sort((a, b) => a.priority - b.priority));
    setDraft({ ...BLANK, priority: candidate.priority + 100 });
    setError(null);
  }

  const shown = [...rules, ...DEFAULT_RULES]
    .filter((r) => r.direction === flow.direction)
    .sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-4">
      {/* verdict */}
      <div
        className={`card p-4 ${
          evaluation.allowed ? "border-ok bg-ok-soft" : "border-bad bg-bad-soft"
        }`}
      >
        <div className="flex flex-wrap items-baseline gap-3">
          <span className={`text-lg font-semibold ${evaluation.allowed ? "text-ok" : "text-bad"}`}>
            {evaluation.allowed ? "Allowed" : "Denied"}
          </span>
          <span className="text-sm">
            by <strong>{evaluation.matchedRule.name}</strong> at priority{" "}
            {evaluation.matchedRule.priority}
            {evaluation.matchedRule.isDefault && " (default rule)"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {flow.protocol} {flow.sourceIp}:{flow.sourcePort} → {flow.destinationIp}:
          {flow.destinationPort} ({flow.direction.toLowerCase()})
        </p>
        {note && <p className="mt-2 text-sm">{note}</p>}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* flow tester */}
        <section className="card p-4">
          <h2 className="font-semibold">Test a flow</h2>
          <div className="mt-3 flex flex-wrap gap-1">
            {SAMPLE_FLOWS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setFlow(s.flow);
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
              <span className="mb-1 block font-medium">Direction</span>
              <select
                value={flow.direction}
                onChange={(e) => {
                  setFlow({ ...flow, direction: e.target.value as Direction });
                  setNote("");
                }}
                className="field py-1.5 text-sm"
              >
                <option>Inbound</option>
                <option>Outbound</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Protocol</span>
              <select
                value={flow.protocol}
                onChange={(e) => {
                  setFlow({ ...flow, protocol: e.target.value as Flow["protocol"] });
                  setNote("");
                }}
                className="field py-1.5 text-sm"
              >
                <option>TCP</option>
                <option>UDP</option>
                <option>ICMP</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Source address</span>
              <input
                value={flow.sourceIp}
                onChange={(e) => {
                  setFlow({ ...flow, sourceIp: e.target.value });
                  setNote("");
                }}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Source port</span>
              <input
                type="number"
                value={flow.sourcePort}
                onChange={(e) => setFlow({ ...flow, sourcePort: Number(e.target.value) })}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Destination address</span>
              <input
                value={flow.destinationIp}
                onChange={(e) => {
                  setFlow({ ...flow, destinationIp: e.target.value });
                  setNote("");
                }}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Destination port</span>
              <input
                type="number"
                value={flow.destinationPort}
                onChange={(e) => setFlow({ ...flow, destinationPort: Number(e.target.value) })}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
          </div>
        </section>

        {/* add rule */}
        <section className="card p-4">
          <h2 className="font-semibold">Add an inbound or outbound rule</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Allow-SSH-From-Bastion"
                className="field py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Priority</span>
              <input
                type="number"
                value={draft.priority}
                onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value) })}
                className="field py-1.5 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Direction</span>
              <select
                value={draft.direction}
                onChange={(e) => setDraft({ ...draft, direction: e.target.value as Direction })}
                className="field py-1.5 text-sm"
              >
                <option>Inbound</option>
                <option>Outbound</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Action</span>
              <select
                value={draft.access}
                onChange={(e) => setDraft({ ...draft, access: e.target.value as "Allow" | "Deny" })}
                className="field py-1.5 text-sm"
              >
                <option>Allow</option>
                <option>Deny</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Protocol</span>
              <select
                value={draft.protocol}
                onChange={(e) => setDraft({ ...draft, protocol: e.target.value as NsgRule["protocol"] })}
                className="field py-1.5 text-sm"
              >
                <option>Any</option>
                <option>TCP</option>
                <option>UDP</option>
                <option>ICMP</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Source</span>
              <input
                value={draft.source}
                onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                placeholder="Internet, VirtualNetwork, or 10.20.9.0/24"
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Destination</span>
              <input
                value={draft.destination}
                onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Destination port</span>
              <input
                value={draft.destinationPort}
                onChange={(e) => setDraft({ ...draft, destinationPort: e.target.value })}
                placeholder="22, 80,443 or 1000-2000"
                className="field py-1.5 font-mono text-sm"
              />
            </label>
          </div>
          {error && (
            <p className="mt-3 rounded-lg border border-line bg-bad-soft px-3 py-2 text-sm text-bad">
              {error}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={addRule} className="btn-primary text-sm">
              Add rule
            </button>
            <button
              type="button"
              onClick={() => {
                setRules(STARTER_RULES);
                setError(null);
              }}
              className="btn-ghost text-sm"
            >
              Reset rules
            </button>
          </div>
        </section>
      </div>

      {/* evaluation trace */}
      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-2">
          <h2 className="font-semibold">Evaluation order</h2>
          <p className="text-sm text-muted">
            Azure walks {flow.direction.toLowerCase()} rules by priority and stops at the first one
            that matches on every field.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Protocol</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Destination</th>
                <th className="px-3 py-2 font-medium">Port</th>
                <th className="px-3 py-2 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((rule) => {
                const step = evaluation.trace.find((t) => t.rule.name === rule.name);
                const decided = step?.matched;
                const notReached = !step;
                return (
                  <tr
                    key={`${rule.direction}-${rule.name}`}
                    className={`border-b border-line last:border-0 ${
                      decided ? (evaluation.allowed ? "bg-ok-soft" : "bg-bad-soft") : ""
                    } ${notReached ? "opacity-40" : ""}`}
                  >
                    <td className="px-3 py-2 font-mono text-xs">{rule.priority}</td>
                    <td className="px-3 py-2">
                      {rule.name}
                      {rule.isDefault && (
                        <span className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] uppercase text-muted">
                          default
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-medium ${
                          rule.access === "Allow" ? "text-ok" : "text-bad"
                        }`}
                      >
                        {rule.access}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{rule.protocol}</td>
                    <td className="px-3 py-2 font-mono text-xs">{rule.source}</td>
                    <td className="px-3 py-2 font-mono text-xs">{rule.destination}</td>
                    <td className="px-3 py-2 font-mono text-xs">{rule.destinationPort}</td>
                    <td className="px-3 py-2 text-xs">
                      {notReached ? (
                        <span className="text-muted">not reached</span>
                      ) : decided ? (
                        <strong>{evaluation.allowed ? "allowed here" : "denied here"}</strong>
                      ) : (
                        <span className="text-muted">skipped — {step?.reason}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
