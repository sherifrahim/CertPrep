"use client";

import { useMemo, useState } from "react";
import {
  ATTACK_PATHS,
  RECOMMENDATIONS,
  RESOURCE_BY_ID,
  byPotentialGain,
  livePaths,
  secureScore,
  type Severity,
} from "@/lab/defender-cloud";

const sevTone: Record<Severity, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-surface-2 text-muted",
};

const riskTone: Record<string, string> = {
  Critical: "bg-bad-soft text-bad",
  High: "bg-warn-soft text-warn",
  Medium: "bg-surface-2 text-muted",
};

function points(n: number): string {
  return n.toFixed(n % 1 === 0 ? 0 : 2);
}

export function DefenderCloudConsole() {
  const [remediated, setRemediated] = useState<ReadonlySet<string>>(new Set());
  const [tab, setTab] = useState<"recommendations" | "controls" | "paths">("recommendations");
  const [open, setOpen] = useState<string | null>(null);

  const score = useMemo(() => secureScore(RECOMMENDATIONS, remediated), [remediated]);
  const ranked = useMemo(() => byPotentialGain(RECOMMENDATIONS, remediated), [remediated]);
  const paths = useMemo(() => livePaths(remediated), [remediated]);

  const baseline = useMemo(() => secureScore(), []);
  const moved = score.current - baseline.current;

  function toggle(id: string) {
    setRemediated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* The score, and what the session has moved it by. */}
      <section className="card p-5">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Secure score</p>
            <p className="mt-1 text-4xl font-semibold">{score.percentage}%</p>
            <p className="text-sm text-muted">
              {points(score.current)} of {points(score.max)} points
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-surface-2"
              role="img"
              aria-label={`Secure score ${score.percentage} percent`}
            >
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${score.percentage}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
            {remediated.size > 0 && (
              <p className="mt-2 text-sm text-ok">
                +{points(moved)} points from {remediated.size} remediation
                {remediated.size === 1 ? "" : "s"} · {paths.length} of {ATTACK_PATHS.length} attack
                paths still live
              </p>
            )}
          </div>
          {remediated.size > 0 && (
            <button
              type="button"
              onClick={() => setRemediated(new Set())}
              className="btn-secondary text-sm"
            >
              Reset
            </button>
          )}
        </div>
        <p className="mt-4 text-sm text-muted">
          The score is earned points over possible points across all controls — not an average of
          the controls, which would let the one-point logging control weigh as much as the ten-point
          MFA one. Mark recommendations as remediated and watch what each is actually worth.
        </p>
      </section>

      <div className="flex gap-1 border-b border-line">
        {(
          [
            ["recommendations", `Recommendations (${ranked.length})`],
            ["controls", "Security controls"],
            ["paths", `Attack paths (${paths.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-2 text-sm ${
              tab === id ? "border-b-2 border-accent font-medium text-ink" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "recommendations" && (
        <div className="space-y-2">
          <p className="text-sm text-muted">
            Ordered by what fixing them is actually worth. Notice that the order is not the severity
            order — a High finding whose control still fails on another recommendation is worth
            nothing until that one is fixed too.
          </p>
          <ul className="space-y-2">
            {ranked.map(({ recommendation: rec, gain }) => (
              <li key={rec.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${sevTone[rec.severity]}`}>
                    {rec.severity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(open === rec.id ? null : rec.id)}
                    aria-expanded={open === rec.id}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block font-medium">{rec.title}</span>
                    <span className="block text-xs text-muted">
                      {rec.unhealthy.length} unhealthy ·{" "}
                      {RESOURCE_BY_ID.get(rec.unhealthy[0] ?? "")?.name ?? "—"}
                      {rec.unhealthy.length > 1 && ` +${rec.unhealthy.length - 1} more`}
                    </span>
                  </button>
                  <span className="text-right text-sm">
                    <span className="block font-semibold">+{points(gain)}</span>
                    <span className="block text-xs text-muted">points</span>
                  </span>
                  <button type="button" onClick={() => toggle(rec.id)} className="btn-secondary text-sm">
                    Remediate
                  </button>
                </div>

                {open === rec.id && (
                  <div className="space-y-3 border-t border-line p-4 text-sm">
                    <p>{rec.description}</p>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">Remediation</p>
                      <p className="mt-1">{rec.remediation}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">
                        Unhealthy resources
                      </p>
                      <ul className="mt-1 space-y-1">
                        {rec.unhealthy.map((id) => {
                          const r = RESOURCE_BY_ID.get(id)!;
                          return (
                            <li key={id} className="font-mono text-xs">
                              {r.name}
                              <span className="ml-2 font-sans text-muted">
                                {r.type}
                                {r.internetExposed && " · internet-exposed"}
                                {r.sensitiveData && ` · ${r.sensitiveData}`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    {gain === 0 && (
                      <p className="rounded bg-warn-soft p-3 text-warn">
                        Fixing this alone earns nothing. Another recommendation in the same control
                        still fails the same resource, and a resource only counts as healthy once it
                        passes every recommendation in its control.
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
            {ranked.length === 0 && (
              <li className="card p-6 text-center text-sm text-muted">
                Everything is remediated. The score is at its maximum and no attack paths remain.
              </li>
            )}
          </ul>
        </div>
      )}

      {tab === "controls" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Control</th>
                <th className="px-4 py-2 font-medium">Healthy resources</th>
                <th className="px-4 py-2 font-medium">Score</th>
                <th className="px-4 py-2 font-medium">Failing</th>
              </tr>
            </thead>
            <tbody>
              {score.controls.map((c) => (
                <tr key={c.control.id} className="border-b border-line align-top last:border-0">
                  <td className="px-4 py-3">
                    <span className="block font-medium">{c.control.title}</span>
                    <span className="block text-xs text-muted">{c.control.description}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.healthyResources} / {c.totalResources}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={c.current === c.max ? "text-ok" : ""}>
                      {points(c.current)} / {c.max}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {c.failing.length === 0 ? "—" : c.failing.map((f) => f.title).join("; ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "paths" && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            An attack path is a chain of findings that are unremarkable alone. Remediating any one
            link breaks the whole chain — which is why the path view beats working down a list by
            severity.
          </p>
          {paths.map((path) => (
            <article key={path.id} className="card p-4">
              <div className="flex flex-wrap items-start gap-3">
                <span className={`rounded px-2 py-1 text-xs font-medium ${riskTone[path.risk]}`}>
                  {path.risk}
                </span>
                <h3 className="min-w-0 flex-1 font-medium">{path.title}</h3>
              </div>

              <ol className="mt-3 space-y-2">
                {path.nodes.map((node, i) => {
                  const r = RESOURCE_BY_ID.get(node.resourceId)!;
                  return (
                    <li key={`${path.id}-${i}`} className="flex gap-3 text-sm">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs">
                        {i + 1}
                      </span>
                      <span>
                        <span className="font-mono text-xs font-medium">{r.name}</span>
                        <span className="ml-2 text-xs text-muted">{r.type}</span>
                        <span className="block text-muted">{node.role}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>

              <p className="mt-3 text-sm">{path.narrative}</p>

              <div className="mt-3 border-t border-line pt-3">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Break the chain by fixing any one of these
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {path.breaksIfRemediated.map((id) => {
                    const rec = RECOMMENDATIONS.find((r) => r.id === id)!;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggle(id)}
                        className="chip hover:text-ink"
                      >
                        {rec.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
          {paths.length === 0 && (
            <p className="card p-6 text-center text-sm text-ok">
              Every attack path is broken. Note how few remediations that took compared with
              clearing the recommendation list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
