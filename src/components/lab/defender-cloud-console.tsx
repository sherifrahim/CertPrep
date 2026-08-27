"use client";

import { Fragment, useMemo, useState } from "react";
import {
  COMPLIANCE_STANDARDS,
  DEFENDER_PLANS,
  RECOMMENDATIONS,
  RESOURCES,
  RESOURCE_BY_ID,
  SECURITY_ALERTS,
  applyExemptions,
  assessStandard,
  byPotentialGain,
  livePaths,
  secureScore,
  type DefenderPlan,
  type Exemption,
  type Severity,
} from "@/lab/defender-cloud";
import { AzureResourceShell, BladeHeader, LabNote, type NavGroup } from "./azure/resource-shell";

const sevTone: Record<string, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-surface-2 text-muted",
  Informational: "bg-surface-2 text-muted",
};

function points(n: number): string {
  return n.toFixed(n % 1 === 0 ? 0 : 2);
}

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DefenderCloudConsole() {
  const [blade, setBlade] = useState("overview");
  const [remediated, setRemediated] = useState<ReadonlySet<string>>(new Set());
  const [exemptions, setExemptions] = useState<Exemption[]>([]);
  const [plans, setPlans] = useState<DefenderPlan[]>(DEFENDER_PLANS);
  const [groupByControl, setGroupByControl] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [openRec, setOpenRec] = useState<string | null>(null);
  const [openAlert, setOpenAlert] = useState<string | null>(null);
  const [standardName, setStandardName] = useState(COMPLIANCE_STANDARDS[0].name);

  const effective = useMemo(
    () => applyExemptions(RECOMMENDATIONS, exemptions),
    [exemptions],
  );
  const score = useMemo(() => secureScore(effective, remediated), [effective, remediated]);
  const ranked = useMemo(() => byPotentialGain(effective, remediated), [effective, remediated]);
  const paths = useMemo(() => livePaths(remediated), [remediated]);

  const cspmOn = plans.find((p) => p.name === "Defender CSPM")?.state === "On";
  const activeAlerts = SECURITY_ALERTS.filter(
    (a) => a.status === "Active" || a.status === "In progress",
  );
  const standard = COMPLIANCE_STANDARDS.find((s) => s.name === standardName)!;
  const compliance = useMemo(
    () => assessStandard(standard, effective, remediated),
    [standard, effective, remediated],
  );

  function toggleRemediated(id: string) {
    setRemediated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exempt(recommendationId: string) {
    setExemptions((e) => [
      ...e,
      {
        recommendationId,
        resourceIds: [],
        category: "Waiver",
        justification: "Exempted from the lab console.",
      },
    ]);
  }

  const visibleRecs =
    severityFilter === "All"
      ? ranked
      : ranked.filter((r) => r.recommendation.severity === severityFilter);

  const nav: NavGroup[] = [
    {
      label: "General",
      items: [
        { id: "overview", label: "Overview" },
        { id: "recommendations", label: "Recommendations", badge: String(ranked.length) },
        { id: "alerts", label: "Security alerts", badge: String(activeAlerts.length) },
        { id: "inventory", label: "Inventory", badge: String(RESOURCES.length) },
        { id: "explorer", label: "Cloud security explorer", disabled: true },
        // No count while Defender CSPM is off — the blade has nothing to show,
        // and a badge here would contradict the upsell inside it.
        {
          id: "attack-paths",
          label: "Attack path analysis",
          badge: cspmOn ? String(paths.length) : undefined,
        },
        { id: "workbooks", label: "Workbooks", disabled: true },
        { id: "community", label: "Community", disabled: true },
      ],
    },
    {
      label: "Cloud Security",
      items: [
        { id: "posture", label: "Security posture" },
        { id: "compliance", label: "Regulatory compliance" },
        { id: "workloads", label: "Workload protections", disabled: true },
        { id: "data-security", label: "Data security", disabled: true },
        { id: "devops", label: "DevOps security", disabled: true },
      ],
    },
    {
      label: "Management",
      items: [
        { id: "environment", label: "Environment settings" },
        { id: "solutions", label: "Security solutions", disabled: true },
        { id: "automation", label: "Workflow automation", disabled: true },
        { id: "governance", label: "Governance rules", disabled: true },
      ],
    },
  ];

  return (
    <AzureResourceShell
      breadcrumb={["Home", "Microsoft Defender for Cloud"]}
      resourceName="Microsoft Defender for Cloud"
      resourceType="Cloud security posture and workload protection"
      glyph="MDC"
      commands={[
        { label: "Refresh", glyph: "⟳" },
        { label: "Download CSV report", glyph: "⭳", disabled: true },
        { label: "Guides & Feedback", glyph: "?", disabled: true },
      ]}
      essentials={[
        { label: "Subscription", value: "Contoso Production" },
        { label: "Assessed resources", value: RESOURCES.length },
        { label: "Secure score", value: `${score.percentage}%` },
        { label: "Active alerts", value: activeAlerts.length },
        { label: "Plans enabled", value: `${plans.filter((p) => p.state === "On").length}/${plans.length}` },
        { label: "Standards", value: COMPLIANCE_STANDARDS.filter((s) => s.enabled).length },
      ]}
      nav={nav}
      activeId={blade}
      onNavigate={setBlade}
    >
      {blade === "overview" && (
        <div>
          <BladeHeader title="Overview" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <button
              type="button"
              onClick={() => setBlade("posture")}
              className="rounded border border-line p-3 text-left hover:bg-surface-2"
            >
              <p className="text-2xl font-semibold">{score.percentage}%</p>
              <p className="text-xs text-muted">
                Secure score · {points(score.current)}/{points(score.max)} points
              </p>
            </button>
            <button
              type="button"
              onClick={() => setBlade("recommendations")}
              className="rounded border border-line p-3 text-left hover:bg-surface-2"
            >
              <p className="text-2xl font-semibold">{ranked.length}</p>
              <p className="text-xs text-muted">Active recommendations</p>
            </button>
            <button
              type="button"
              onClick={() => setBlade("alerts")}
              className="rounded border border-line p-3 text-left hover:bg-surface-2"
            >
              <p className="text-2xl font-semibold">{activeAlerts.length}</p>
              <p className="text-xs text-muted">Security alerts</p>
            </button>
            <button
              type="button"
              onClick={() => setBlade("attack-paths")}
              className="rounded border border-line p-3 text-left hover:bg-surface-2"
            >
              <p className="text-2xl font-semibold">{cspmOn ? paths.length : "—"}</p>
              <p className="text-xs text-muted">Attack paths</p>
            </button>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${score.percentage}%`, background: "var(--accent)" }}
            />
          </div>

          <LabNote>
            <p>
              Start on <strong>Recommendations</strong> and watch what each fix is worth, then check{" "}
              <strong>Regulatory compliance</strong> — the score gives partial credit and compliance
              does not, so the two move at completely different rates.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "recommendations" && (
        <div>
          <BladeHeader
            title="Recommendations"
            description="Ordered by the points remediation would actually add, which is not the same as severity order."
            actions={
              <>
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={groupByControl}
                    onChange={(e) => setGroupByControl(e.target.checked)}
                  />
                  Group by controls
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as Severity | "All")}
                  aria-label="Filter by severity"
                  className="field py-0.5 text-xs"
                >
                  <option>All</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </>
            }
          />

          {groupByControl ? (
            <div className="space-y-2">
              {score.controls
                .filter((c) => c.failing.length > 0)
                .map((c) => (
                  <section key={c.control.id} className="rounded border border-line">
                    <header className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2/40 px-3 py-2">
                      <span className="min-w-0 flex-1 text-xs font-medium">{c.control.title}</span>
                      <span className="text-[11px] text-muted">
                        {c.healthyResources}/{c.totalResources} resources healthy
                      </span>
                      <span className="text-[11px] font-semibold">
                        {points(c.current)}/{c.max} points
                      </span>
                    </header>
                    <ul>
                      {c.failing
                        .filter((r) => severityFilter === "All" || r.severity === severityFilter)
                        .map((rec) => {
                          const gain =
                            ranked.find((x) => x.recommendation.id === rec.id)?.gain ?? 0;
                          return (
                            <li key={rec.id}>
                            <RecommendationRow
                              title={rec.title}
                              severity={rec.severity}
                              unhealthy={rec.unhealthy}
                              gain={gain}
                              open={openRec === rec.id}
                              description={rec.description}
                              remediation={rec.remediation}
                              onToggleOpen={() => setOpenRec(openRec === rec.id ? null : rec.id)}
                              onRemediate={() => toggleRemediated(rec.id)}
                              onExempt={() => exempt(rec.id)}
                            />
                            </li>
                          );
                        })}
                    </ul>
                  </section>
                ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {visibleRecs.map(({ recommendation: rec, gain }) => (
                <li key={rec.id} className="rounded border border-line">
                  <RecommendationRow
                    title={rec.title}
                    severity={rec.severity}
                    unhealthy={rec.unhealthy}
                    gain={gain}
                    open={openRec === rec.id}
                    description={rec.description}
                    remediation={rec.remediation}
                    onToggleOpen={() => setOpenRec(openRec === rec.id ? null : rec.id)}
                    onRemediate={() => toggleRemediated(rec.id)}
                    onExempt={() => exempt(rec.id)}
                  />
                </li>
              ))}
              {visibleRecs.length === 0 && (
                <li className="rounded border border-line p-6 text-center text-xs text-muted">
                  Nothing matches that filter.
                </li>
              )}
            </ul>
          )}

          {(remediated.size > 0 || exemptions.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-ok">
                {remediated.size} remediated, {exemptions.length} exempted · score now{" "}
                {score.percentage}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setRemediated(new Set());
                  setExemptions([]);
                }}
                className="text-accent-text"
              >
                Reset
              </button>
            </div>
          )}

          <LabNote>
            <p>
              <strong>Exempt</strong> and <strong>Remediate</strong> both raise the score, and only
              one of them fixes anything. Exempting removes the resource from the denominator rather
              than counting it healthy, so a blanket exemption reaches 100% with the estate
              unchanged. That is the mechanism behind a score that looks good and an environment
              that is not.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "alerts" && (
        <div>
          <BladeHeader
            title="Security alerts"
            description="Detections from the enabled Defender plans. Turning a plan off in Environment settings stops its alerts entirely."
          />
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Severity</th>
                  <th className="px-3 py-2 font-medium">Alert title</th>
                  <th className="px-3 py-2 font-medium">Affected resource</th>
                  <th className="px-3 py-2 font-medium">Activity start</th>
                  <th className="px-3 py-2 font-medium">MITRE tactic</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {SECURITY_ALERTS.map((a) => (
                  <Fragment key={a.id}>
                    <tr
                      onClick={() => setOpenAlert(openAlert === a.id ? null : a.id)}
                      className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-2"
                    >
                      <td className="px-3 py-2">
                        <span className={`rounded px-1.5 py-0.5 ${sevTone[a.severity]}`}>
                          {a.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{a.title}</td>
                      <td className="px-3 py-2 font-mono text-[11px]">{a.affectedResource}</td>
                      <td className="px-3 py-2 text-muted">{when(a.startTime)}</td>
                      <td className="px-3 py-2 text-muted">{a.tactic}</td>
                      <td className="px-3 py-2">{a.status}</td>
                    </tr>
                    {openAlert === a.id && (
                      <tr className="border-b border-line">
                        <td colSpan={6} className="bg-surface-2/30 px-3 py-3">
                          <p className="text-xs">{a.description}</p>
                          <p className="mt-2 text-[11px] uppercase tracking-wide text-muted">
                            Detected by
                          </p>
                          <p className="text-xs">{a.detectedBy}</p>
                          <p className="mt-2 text-[11px] uppercase tracking-wide text-muted">
                            Take action
                          </p>
                          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-xs">
                            {a.remediationSteps.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {blade === "inventory" && (
        <div>
          <BladeHeader
            title="Inventory"
            description="Every assessed resource, with how many recommendations it currently fails."
          />
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Resource type</th>
                  <th className="px-3 py-2 font-medium">Resource group</th>
                  <th className="px-3 py-2 font-medium">Unhealthy findings</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((r) => {
                  const failing = effective.filter(
                    (rec) => !remediated.has(rec.id) && rec.unhealthy.includes(r.id),
                  ).length;
                  return (
                    <tr key={r.id} className="border-b border-line last:border-0">
                      <td className="px-3 py-2 font-mono">{r.name}</td>
                      <td className="px-3 py-2 text-muted">{r.type}</td>
                      <td className="px-3 py-2 text-muted">{r.resourceGroup}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 ${
                            failing === 0 ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
                          }`}
                        >
                          {failing}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-muted">
                        {r.internetExposed && "Internet-exposed. "}
                        {r.sensitiveData}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {blade === "attack-paths" && (
        <div>
          <BladeHeader
            title="Attack path analysis"
            description="Chains of findings that are unremarkable alone. Remediating any one link breaks the whole path."
          />

          {!cspmOn ? (
            <div className="rounded border border-warn bg-warn-soft p-4 text-xs text-warn">
              <p className="font-semibold">Defender CSPM is not enabled on this subscription.</p>
              <p className="mt-1">
                Attack path analysis and the cloud security explorer come with the Defender CSPM
                plan, not the free foundational tier. Enable it in{" "}
                <button
                  type="button"
                  onClick={() => setBlade("environment")}
                  className="underline"
                >
                  Environment settings
                </button>{" "}
                to see the paths.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paths.map((path) => (
                <article key={path.id} className="rounded border border-line p-3">
                  <div className="flex flex-wrap items-start gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] ${sevTone[path.risk === "Critical" ? "High" : path.risk]}`}>
                      {path.risk}
                    </span>
                    <h4 className="min-w-0 flex-1 text-xs font-medium">{path.title}</h4>
                  </div>
                  <ol className="mt-2 space-y-1">
                    {path.nodes.map((node, i) => {
                      const r = RESOURCE_BY_ID.get(node.resourceId)!;
                      return (
                        <li key={`${path.id}-${i}`} className="flex gap-2 text-xs">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[10px]">
                            {i + 1}
                          </span>
                          <span>
                            <span className="font-mono text-[11px] font-medium">{r.name}</span>
                            <span className="block text-[11px] text-muted">{node.role}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="mt-2 text-xs">{path.narrative}</p>
                  <div className="mt-2 flex flex-wrap gap-1 border-t border-line pt-2">
                    {path.breaksIfRemediated.map((id) => {
                      const rec = RECOMMENDATIONS.find((r) => r.id === id)!;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleRemediated(id)}
                          className="chip hover:text-ink"
                        >
                          {rec.title}
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
              {paths.length === 0 && (
                <p className="rounded border border-ok bg-ok-soft p-4 text-center text-xs text-ok">
                  Every attack path is broken. Note how few remediations that took compared with
                  clearing the recommendation list.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {blade === "posture" && (
        <div>
          <BladeHeader
            title="Security posture"
            description="The secure score is earned points over possible points across all controls — not an average of the control percentages."
          />
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Security control</th>
                  <th className="px-3 py-2 font-medium">Healthy resources</th>
                  <th className="px-3 py-2 font-medium">Potential score increase</th>
                  <th className="px-3 py-2 font-medium">Current score</th>
                </tr>
              </thead>
              <tbody>
                {score.controls.map((c) => (
                  <tr key={c.control.id} className="border-b border-line align-top last:border-0">
                    <td className="px-3 py-2">
                      <span className="block font-medium">{c.control.title}</span>
                      <span className="block text-[11px] text-muted">{c.control.description}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {c.healthyResources} / {c.totalResources}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted">
                      +{points(c.max - c.current)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={c.current === c.max ? "text-ok" : ""}>
                        {points(c.current)} / {c.max}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-2/40 font-semibold">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2">
                    {points(score.current)} / {points(score.max)} ({score.percentage}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {blade === "compliance" && (
        <div>
          <BladeHeader
            title="Regulatory compliance"
            description="Controls map to the same recommendations the score uses, but a control passes only when every recommendation behind it passes."
            actions={
              <select
                value={standardName}
                onChange={(e) => setStandardName(e.target.value)}
                aria-label="Compliance standard"
                className="field py-0.5 text-xs"
              >
                {COMPLIANCE_STANDARDS.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </select>
            }
          />
          <p className="mb-2 text-xs">
            <span className="font-semibold">
              {compliance.passed} of {compliance.total}
            </span>{" "}
            controls passed
            {!standard.enabled && (
              <span className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">
                Standard not enabled on this subscription
              </span>
            )}
          </p>
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Control</th>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Passed</th>
                  <th className="px-3 py-2 font-medium">Failed</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {compliance.controls.map((c) => (
                  <tr key={c.control.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2 font-mono">{c.control.id}</td>
                    <td className="px-3 py-2">{c.control.title}</td>
                    <td className="px-3 py-2 text-ok">{c.passed}</td>
                    <td className="px-3 py-2 text-bad">{c.failed}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 ${
                          c.compliant ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
                        }`}
                      >
                        {c.compliant ? "Passed" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <LabNote>
            <p>
              Compliance is all-or-nothing per control, while the secure score gives partial credit
              per resource. That is why a subscription can sit at a respectable score and still fail
              most controls — fixing one of the two recommendations behind a control moves the score
              and does nothing at all here.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "environment" && (
        <div>
          <BladeHeader
            title="Environment settings"
            description="Defender plans for the Contoso Production subscription. A plan that is off produces no recommendations and no alerts for its resource type."
          />
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Plan</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Pricing</th>
                  <th className="px-3 py-2 font-medium">What it provides</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.name} className="border-b border-line align-top last:border-0">
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2">
                      <select
                        value={p.state}
                        aria-label={`${p.name} status`}
                        onChange={(e) =>
                          setPlans((all) =>
                            all.map((x) =>
                              x.name === p.name
                                ? { ...x, state: e.target.value as DefenderPlan["state"] }
                                : x,
                            ),
                          )
                        }
                        className={`field py-0.5 text-xs ${
                          p.state === "On" ? "text-ok" : "text-muted"
                        }`}
                      >
                        <option>On</option>
                        <option>Off</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-muted">{p.pricing}</td>
                    <td className="px-3 py-2">{p.provides}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <LabNote>
            <p>
              Turn <strong>Defender CSPM</strong> on and off, then open{" "}
              <strong>Attack path analysis</strong>. The paths are a paid-plan feature — an empty
              blade usually means the plan is off, not that the environment is clean.
            </p>
          </LabNote>
        </div>
      )}
    </AzureResourceShell>
  );
}

/* ------------------------------------------------------------- row */

function RecommendationRow({
  title,
  severity,
  unhealthy,
  gain,
  open,
  description,
  remediation,
  onToggleOpen,
  onRemediate,
  onExempt,
}: {
  title: string;
  severity: Severity;
  unhealthy: string[];
  gain: number;
  open: boolean;
  description: string;
  remediation: string;
  onToggleOpen: () => void;
  onRemediate: () => void;
  onExempt: () => void;
}) {
  // Returns a plain container, not an <li>: the grouped and ungrouped views
  // each own their own list item, and nesting one inside the other is invalid.
  return (
    <div className="border-b border-line last:border-0">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] ${sevTone[severity]}`}>{severity}</span>
        <button type="button" onClick={onToggleOpen} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <span className="block text-xs font-medium">{title}</span>
          <span className="block text-[11px] text-muted">
            {unhealthy.length} unhealthy resource{unhealthy.length === 1 ? "" : "s"}
          </span>
        </button>
        <span className="text-[11px] font-semibold">+{points(gain)}</span>
        <button type="button" onClick={onRemediate} className="btn-secondary py-0.5 text-[11px]">
          Remediate
        </button>
        <button type="button" onClick={onExempt} className="btn-secondary py-0.5 text-[11px]">
          Exempt
        </button>
      </div>
      {open && (
        <div className="border-t border-line bg-surface-2/30 px-3 py-2 text-xs">
          <p>{description}</p>
          <p className="mt-2 text-[11px] uppercase tracking-wide text-muted">Remediation steps</p>
          <p>{remediation}</p>
          <p className="mt-2 text-[11px] uppercase tracking-wide text-muted">Unhealthy resources</p>
          <ul className="mt-0.5 space-y-0.5">
            {unhealthy.map((rid) => {
              const r = RESOURCE_BY_ID.get(rid)!;
              return (
                <li key={rid} className="font-mono text-[11px]">
                  {r.name}
                  <span className="ml-2 font-sans text-muted">
                    {r.type}
                    {r.internetExposed && " · internet-exposed"}
                  </span>
                </li>
              );
            })}
          </ul>
          {gain === 0 && (
            <p className="mt-2 rounded bg-warn-soft p-2 text-warn">
              Fixing this alone earns nothing. Another recommendation in the same control still
              fails the same resource, and a resource counts as healthy only once it passes every
              recommendation in its control.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
