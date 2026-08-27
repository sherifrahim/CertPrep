"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ASR_STATES,
  coverage,
  defaultRules,
  stateEffect,
  summarise,
  type AsrExclusion,
  type AsrRule,
  type AsrState,
} from "@/lab/asr";
import { LabNote } from "../azure/resource-shell";

type Tab = "monitoring" | "configuration" | "exclusions" | "coverage";

const TABS: { id: Tab; label: string; lab?: boolean }[] = [
  { id: "monitoring", label: "Monitoring" },
  { id: "configuration", label: "Configuration" },
  { id: "exclusions", label: "Exclusions" },
  { id: "coverage", label: "Against this tenant's intrusion", lab: true },
];

const stateTone: Record<AsrState, string> = {
  Block: "bg-ok-soft text-ok",
  Warn: "bg-accent-soft text-accent-text",
  Audit: "bg-warn-soft text-warn",
  Disabled: "bg-surface-2 text-muted",
  "Not configured": "bg-surface-2 text-muted",
};

const riskTone: Record<string, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-surface-2 text-muted",
};

export function AsrConsole() {
  const [tab, setTab] = useState<Tab>("monitoring");
  const [rules, setRules] = useState<AsrRule[]>(defaultRules());
  const [exclusions, setExclusions] = useState<AsrExclusion[]>([]);
  const [path, setPath] = useState("");
  const [scopeId, setScopeId] = useState("");

  const summary = useMemo(() => summarise(rules), [rules]);
  const stages = useMemo(() => coverage(rules), [rules]);
  const stopped = stages.filter((s) => s.prevented).length;
  const withRule = stages.filter((s) => s.rule !== null).length;

  function setRuleState(id: string, state: AsrState) {
    setRules((all) => all.map((r) => (r.id === id ? { ...r, state } : r)));
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
        {tab === "monitoring" && (
          <div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "In block mode", value: summary.blocking, tone: "text-ok" },
                { label: "In audit mode", value: summary.auditing, tone: "text-warn" },
                { label: "In warn mode", value: summary.warning, tone: "text-accent-text" },
                { label: "Off or unconfigured", value: summary.off, tone: "text-muted" },
                { label: "Devices reporting", value: summary.devices, tone: "" },
              ].map((t) => (
                <div key={t.label} className="rounded border border-line p-3">
                  <p className={`text-xl font-semibold ${t.tone}`}>{t.value}</p>
                  <p className="text-xs text-muted">{t.label}</p>
                </div>
              ))}
            </div>

            {summary.auditing > 0 && (
              <p className="mt-3 rounded border border-warn bg-warn-soft p-3 text-xs text-warn">
                {summary.auditing} rule{summary.auditing === 1 ? " is" : "s are"} in audit mode.
                Audit produces the same events as block and prevents nothing — a coverage report
                counting configured rules will show these as covered.
              </p>
            )}

            <LabNote>
              <p>
                Monitoring is where the audit-versus-block gap becomes visible: the detections here
                are the attacks that <em>were not stopped</em>. Every audit event is an event that
                would have been a block if the rule had been moved.
              </p>
            </LabNote>
          </div>
        )}

        {tab === "configuration" && (
          <div>
            <div className="overflow-x-auto rounded border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Rule</th>
                    <th className="px-3 py-2 font-medium">State</th>
                    <th className="px-3 py-2 font-medium">Effect</th>
                    <th className="px-3 py-2 font-medium">Breakage risk</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => {
                    const effect = stateEffect(r.state);
                    return (
                      <tr key={r.id} className="border-b border-line align-top last:border-0">
                        <td className="px-3 py-2">
                          <span className="block font-medium">{r.name}</span>
                          <span className="block font-mono text-[10px] text-muted">{r.id}</span>
                          <span className="block text-[11px] text-muted">{r.description}</span>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={r.state}
                            aria-label={`State for ${r.name}`}
                            onChange={(e) => setRuleState(r.id, e.target.value as AsrState)}
                            className={`field py-0.5 text-xs ${stateTone[r.state]}`}
                          >
                            {ASR_STATES.filter((s) => s !== "Warn" || r.supportsWarn).map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          {!r.supportsWarn && (
                            <span className="mt-1 block text-[10px] text-muted">
                              Warn not supported
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted">{effect.explanation}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded px-1.5 py-0.5 text-[11px] ${riskTone[r.breakageRisk]}`}>
                            {r.breakageRisk}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <LabNote>
              <p>
                The GUID is the rule&rsquo;s real identity — it is what you set in Intune, Group
                Policy and PowerShell, and what appears in the events. Several rules do not support{" "}
                <strong>Warn</strong> at all, which is why the option disappears on those rows
                rather than being offered and ignored.
              </p>
            </LabNote>
          </div>
        )}

        {tab === "exclusions" && (
          <div>
            <div className="mb-3 overflow-x-auto rounded border border-line">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Path</th>
                    <th className="px-3 py-2 font-medium">Applies to</th>
                    <th className="px-3 py-2 font-medium">Justification</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {exclusions.map((e, i) => (
                    <tr key={`${e.path}-${i}`} className="border-b border-line last:border-0">
                      <td className="px-3 py-2 font-mono">{e.path}</td>
                      <td className="px-3 py-2">
                        {e.ruleIds.length === 0 ? (
                          <span className="rounded bg-bad-soft px-1.5 py-0.5 text-[11px] text-bad">
                            All rules
                          </span>
                        ) : (
                          <span className="font-mono text-[10px]">{e.ruleIds.join(", ")}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted">{e.justification || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setExclusions((all) => all.filter((_, j) => j !== i))}
                          className="text-bad"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {exclusions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted">
                        No exclusions. Every rule applies everywhere.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded border border-line p-3">
              <p className="mb-2 text-xs font-semibold">Add an exclusion</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs">
                  <span className="mb-1 block font-medium">Path</span>
                  <input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="C:\Apps\legacy\*"
                    className="field py-1 font-mono text-xs"
                  />
                </label>
                <label className="text-xs">
                  <span className="mb-1 block font-medium">Scope to rule (blank = all rules)</span>
                  <select
                    value={scopeId}
                    onChange={(e) => setScopeId(e.target.value)}
                    className="field py-1 text-xs"
                  >
                    <option value="">All rules</option>
                    {rules.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!path.trim()) return;
                  setExclusions((all) => [
                    ...all,
                    {
                      path: path.trim(),
                      ruleIds: scopeId ? [scopeId] : [],
                      justification: "Added from the lab console.",
                    },
                  ]);
                  setPath("");
                }}
                className="btn-primary mt-3 py-1 text-xs"
              >
                Add
              </button>
            </div>

            <LabNote>
              <p>
                An exclusion with no rule scope switches off <strong>every</strong> rule for that
                path. Scoping it to the one rule that false-positives keeps the rest watching the
                same directory, and an attacker who learns the excluded path only gets past one
                control rather than all twelve.
              </p>
            </LabNote>
          </div>
        )}

        {tab === "coverage" && (
          <div>
            <p className="mb-3 text-xs text-muted">
              Not a portal view. This walks the intrusion that is actually in this tenant&rsquo;s
              telemetry and asks, stage by stage, whether the current configuration would have
              stopped it.
            </p>

            <p
              className={`mb-3 rounded p-3 text-sm ${
                stopped === 0 ? "bg-bad-soft text-bad" : stopped < withRule ? "bg-warn-soft text-warn" : "bg-ok-soft text-ok"
              }`}
            >
              <strong>
                {stopped} of {withRule}
              </strong>{" "}
              covered stages would have been stopped by the configuration as it stands.
            </p>

            <ol className="space-y-2">
              {stages.map((c) => (
                <li key={c.stage.stage} className="rounded border border-line p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] ${
                        c.prevented ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
                      }`}
                    >
                      {c.prevented ? "Stopped" : "Not stopped"}
                    </span>
                    <span className="text-xs font-medium">{c.stage.stage}</span>
                    <span className="font-mono text-[10px] text-muted">{c.stage.device}</span>
                  </div>
                  <p className="mt-1 text-xs">{c.stage.observed}</p>
                  <p className="mt-1 text-[11px] text-muted">{c.verdict}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {c.rule && !c.prevented && (
                      <button
                        type="button"
                        onClick={() => setRuleState(c.rule!.id, "Block")}
                        className="btn-secondary py-0.5 text-[11px]"
                      >
                        Set that rule to Block
                      </button>
                    )}
                    <Link
                      href={`/lab/hunting?q=${encodeURIComponent(c.stage.huntQuery)}`}
                      className="text-[11px] text-accent-text"
                    >
                      Show me the evidence →
                    </Link>
                  </div>
                </li>
              ))}
            </ol>

            <LabNote>
              <p>
                Every stage marked &ldquo;not stopped&rdquo; has telemetry proving it happened —
                follow the evidence link and the events are there. The rules that would have broken
                this attack were configured the whole time; they were just in audit.
              </p>
            </LabNote>
          </div>
        )}
      </div>
    </div>
  );
}
