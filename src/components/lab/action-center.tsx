"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AUTOMATION_LEVELS,
  applyAutomationLevel,
  decide,
  historyActions,
  pendingActions,
  type AutomationLevel,
  type Decision,
  type RemediationAction,
} from "@/lab/actions";

function when(iso: string): string {
  // UTC explicitly, so the server render and the client hydration agree.
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const entityTone: Record<string, string> = {
  Device: "bg-accent-soft text-accent-text",
  File: "bg-warn-soft text-warn",
  Process: "bg-warn-soft text-warn",
  User: "bg-bad-soft text-bad",
  Email: "bg-accent-soft text-accent-text",
  Url: "bg-surface-2 text-muted",
  Persistence: "bg-warn-soft text-warn",
};

export function ActionCenter({ actions }: { actions: RemediationAction[] }) {
  const [level, setLevel] = useState<AutomationLevel>(
    "Semi - require approval for core folders remediation",
  );
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [open, setOpen] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const gated = useMemo(() => applyAutomationLevel(actions, level), [actions, level]);
  const dispositionFor = useMemo(
    () => new Map(gated.map((g) => [g.action.id, g.disposition])),
    [gated],
  );

  const pending = pendingActions(actions);
  const history = historyActions(actions);

  // What this level would have taken off the analyst's hands, out of the queue
  // that is actually waiting. This is the number the level is chosen for.
  const wouldAutomate = pending.filter((a) => dispositionFor.get(a.id)?.automatic).length;
  const decided = Object.keys(decisions).length;

  function record(action: RemediationAction, approved: boolean) {
    setDecisions((d) => ({ ...d, [action.id]: decide(action, approved) }));
  }

  const rows = tab === "pending" ? pending : history;

  return (
    <div className="space-y-4">
      {/* The automation level is the lesson, so it sits above the queue. */}
      <section className="card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="min-w-0 flex-1 text-sm">
            <span className="mb-1 block font-medium">Device group automation level</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as AutomationLevel)}
              className="field w-full py-1.5 text-sm"
            >
              {AUTOMATION_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm">
            <p className="text-2xl font-semibold">
              {wouldAutomate}
              <span className="text-base font-normal text-muted"> / {pending.length}</span>
            </p>
            <p className="text-muted">handled without you</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          The level is set on the <strong>device group</strong>, not on the alert. It decides which
          remediations an automated investigation carries out on its own — severity does not enter
          into it. Manual and custom-detection actions are never held back, because a human already
          chose them.
        </p>
      </section>

      <div className="flex gap-1 border-b border-line">
        {(["pending", "history"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm capitalize ${
              tab === t ? "border-b-2 border-accent font-medium text-ink" : "text-muted"
            }`}
          >
            {t} ({t === "pending" ? pending.length : history.length})
          </button>
        ))}
        {decided > 0 && (
          <span className="ml-auto self-center text-xs text-muted">
            {decided} decision{decided === 1 ? "" : "s"} made this session
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {rows.map((action) => {
          const d = dispositionFor.get(action.id);
          const decision = decisions[action.id];
          const isOpen = open === action.id;

          return (
            <li key={action.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : action.id)}
                aria-expanded={isOpen}
                className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-surface-2"
              >
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    entityTone[action.entityType] ?? "bg-surface-2 text-muted"
                  }`}
                >
                  {action.entityType}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{action.type}</span>
                  <span className="block truncate font-mono text-xs text-muted">
                    {action.entity}
                  </span>
                </span>

                {tab === "pending" && d && (
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      d.automatic ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"
                    }`}
                  >
                    {d.automatic ? "Auto-remediated" : "Needs approval"}
                  </span>
                )}
                {decision && (
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      decision.approved ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
                    }`}
                  >
                    {decision.status}
                  </span>
                )}
                {tab === "history" && (
                  <span className="rounded bg-surface-2 px-2 py-1 text-xs text-muted">
                    {action.status}
                  </span>
                )}
                <span className="text-xs text-muted">{when(action.createdAt)}</span>
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-line p-4 text-sm">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Source</dt>
                      <dd>
                        {action.source}
                        {action.investigationId && ` · ${action.investigationId}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-muted">Incident</dt>
                      <dd>
                        <Link
                          href={`/lab/incidents/${action.incidentId}`}
                          className="text-accent-text"
                        >
                          {action.incidentId}
                        </Link>
                        {action.device && ` · ${action.device}`}
                      </dd>
                    </div>
                    {action.folderPath && (
                      <div className="sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wide text-muted">Location</dt>
                        <dd className="font-mono text-xs">{action.folderPath}</dd>
                      </div>
                    )}
                  </dl>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">What it does</p>
                    <p className="mt-1">{action.effect}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">
                      What it costs if you are wrong
                    </p>
                    <p className="mt-1">{action.blastRadius}</p>
                  </div>

                  {tab === "pending" && d && (
                    <p
                      className={`rounded p-3 ${
                        d.automatic ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"
                      }`}
                    >
                      {d.reason}
                    </p>
                  )}

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">
                      Verify before you decide
                    </p>
                    <pre className="mt-1 overflow-x-auto rounded bg-surface-2 p-3 font-mono text-xs">
                      {action.verifyQuery}
                    </pre>
                    <Link
                      href={`/lab/hunting?q=${encodeURIComponent(action.verifyQuery)}`}
                      className="mt-2 inline-block text-sm text-accent-text"
                    >
                      Run this in advanced hunting →
                    </Link>
                  </div>

                  {tab === "pending" && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                      <button
                        type="button"
                        onClick={() => record(action, true)}
                        className="btn-primary text-sm"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => record(action, false)}
                        className="btn-secondary text-sm"
                      >
                        Reject
                      </button>
                      <span className="text-xs text-muted">
                        {action.undoable
                          ? `Reversible — ${action.undoLabel}`
                          : "No undo once this runs"}
                      </span>
                    </div>
                  )}

                  {decision && (
                    <p
                      className={`rounded p-3 ${
                        decision.approved ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted"
                      }`}
                    >
                      {decision.consequence}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
