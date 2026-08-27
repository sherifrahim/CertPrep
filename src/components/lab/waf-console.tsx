"use client";

import { useMemo, useState } from "react";
import {
  RULE_SETS,
  SAMPLE_REQUESTS,
  SEVERITY_SCORE,
  defaultPolicy,
  evaluateRequest,
  type CustomRule,
  type Exclusion,
  type RuleSetName,
  type WafMode,
  type WafPolicy,
  type WafRequest,
} from "@/lab/waf";
import { AzureResourceShell, BladeHeader, LabNote, type NavGroup } from "./azure/resource-shell";

/**
 * A WAF policy as attached to an Application Gateway.
 *
 * Deliberately its own resource rather than a tab inside the firewall blade,
 * because that is where it lives in Azure — putting it under Azure Firewall
 * would teach a mental model that does not survive contact with the portal.
 */

const severityTone: Record<string, string> = {
  Critical: "bg-bad-soft text-bad",
  Error: "bg-bad-soft text-bad",
  Warning: "bg-warn-soft text-warn",
  Notice: "bg-surface-2 text-muted",
};

export function WafConsole() {
  const [blade, setBlade] = useState("overview");
  const [policy, setPolicy] = useState<WafPolicy>(defaultPolicy());
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [request, setRequest] = useState<WafRequest>(SAMPLE_REQUESTS[0].request);
  const [note, setNote] = useState(SAMPLE_REQUESTS[0].teaches);
  const [exclusionDraft, setExclusionDraft] = useState<Exclusion>({
    variable: "RequestHeaderNames",
    operator: "Equals",
    selector: "",
    ruleIds: [],
  });

  const verdict = useMemo(() => evaluateRequest(policy, request), [policy, request]);

  const totalRules = policy.ruleGroups.reduce((n, g) => n + g.rules.length, 0);
  const enabledRules = policy.ruleGroups.reduce(
    (n, g) => n + g.rules.filter((r) => r.enabled).length,
    0,
  );

  function setRule(ruleId: string, enabled: boolean) {
    setPolicy((p) => ({
      ...p,
      ruleGroups: p.ruleGroups.map((g) => ({
        ...g,
        rules: g.rules.map((r) => (r.ruleId === ruleId ? { ...r, enabled } : r)),
      })),
    }));
  }

  function setGroup(name: string, enabled: boolean) {
    setPolicy((p) => ({
      ...p,
      ruleGroups: p.ruleGroups.map((g) =>
        g.name === name ? { ...g, rules: g.rules.map((r) => ({ ...r, enabled })) } : g,
      ),
    }));
  }

  function setCustomRule(name: string, patch: Partial<CustomRule>) {
    setPolicy((p) => ({
      ...p,
      customRules: p.customRules.map((r) => (r.name === name ? { ...r, ...patch } : r)),
    }));
  }

  const nav: NavGroup[] = [
    {
      items: [
        { id: "overview", label: "Overview" },
        { id: "activity", label: "Activity log", disabled: true },
        { id: "iam", label: "Access control (IAM)", disabled: true },
        { id: "tags", label: "Tags", disabled: true },
      ],
    },
    {
      label: "Settings",
      items: [
        { id: "policy-settings", label: "Policy settings" },
        { id: "managed-rules", label: "Managed rules", badge: `${enabledRules}/${totalRules}` },
        { id: "custom-rules", label: "Custom rules", badge: String(policy.customRules.length) },
        {
          id: "exclusions",
          label: "Exclusions",
          badge: policy.exclusions.length > 0 ? String(policy.exclusions.length) : undefined,
        },
        { id: "associated", label: "Associated application gateways" },
      ],
    },
    { label: "Lab tools", items: [{ id: "test", label: "Test a request" }] },
  ];

  return (
    <AzureResourceShell
      breadcrumb={["Home", "WAF policies", policy.name]}
      resourceName={policy.name}
      resourceType="Web Application Firewall policy"
      glyph="WAF"
      commands={[
        { label: "Refresh", glyph: "⟳" },
        { label: "Delete", glyph: "🗑", destructive: true, disabled: true },
      ]}
      essentials={[
        { label: "Resource group", value: "rg-frontend" },
        { label: "Location", value: "UAE North" },
        { label: "Policy mode", value: policy.mode },
        {
          label: "Policy state",
          value: (
            <span className={policy.state === "Enabled" ? "text-ok" : "text-bad"}>
              {policy.state}
            </span>
          ),
        },
        { label: "Rule set", value: policy.ruleSet },
        { label: "Applied to", value: "agw-contoso-portal" },
      ]}
      nav={nav}
      activeId={blade}
      onNavigate={setBlade}
    >
      {blade === "overview" && (
        <div>
          <BladeHeader
            title="Overview"
            description="Protects the customer portal behind Application Gateway agw-contoso-portal."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Mode", value: policy.mode, id: "policy-settings" },
              { label: "Managed rules enabled", value: `${enabledRules}/${totalRules}`, id: "managed-rules" },
              { label: "Custom rules", value: policy.customRules.length, id: "custom-rules" },
              { label: "Anomaly threshold", value: policy.anomalyThreshold, id: "policy-settings" },
            ].map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setBlade(t.id)}
                className="rounded border border-line p-3 text-left hover:bg-surface-2"
              >
                <p className="text-lg font-semibold">{t.value}</p>
                <p className="text-xs text-muted">{t.label}</p>
              </button>
            ))}
          </div>
          {policy.mode === "Detection" && (
            <p className="mt-3 rounded border border-warn bg-warn-soft p-3 text-xs text-warn">
              This policy is in <strong>Detection</strong> mode. Nothing is blocked — every match is
              logged and the request is delivered. A new policy defaults to Detection, which is why
              so many are left this way.
            </p>
          )}
          <LabNote>
            <p>
              WAF policies attach to <strong>Application Gateway</strong> or{" "}
              <strong>Front Door</strong>, not to Azure Firewall. They inspect HTTP at layer 7;
              Azure Firewall works at layers 3, 4 and 7 for outbound traffic. Different resource,
              different direction, different blade.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "policy-settings" && (
        <div className="max-w-2xl">
          <BladeHeader title="Policy settings" />
          <div className="space-y-4">
            <fieldset>
              <legend className="text-xs font-semibold">Policy state</legend>
              <div className="mt-1 flex gap-4">
                {(["Enabled", "Disabled"] as const).map((s) => (
                  <label key={s} className="flex items-center gap-1.5 text-xs">
                    <input
                      type="radio"
                      name="waf-state"
                      checked={policy.state === s}
                      onChange={() => setPolicy({ ...policy, state: s })}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold">Policy mode</legend>
              <div className="mt-1 space-y-2">
                {(["Detection", "Prevention"] as WafMode[]).map((m) => (
                  <label key={m} className="flex items-start gap-2 text-xs">
                    <input
                      type="radio"
                      name="waf-mode"
                      checked={policy.mode === m}
                      onChange={() => setPolicy({ ...policy, mode: m })}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium">{m}</span>
                      <span className="block text-muted">
                        {m === "Detection"
                          ? "Monitors and logs. Requests are never blocked, whatever the rules say."
                          : "Blocks requests that match, and logs them."}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-xs">
              <span className="mb-1 block font-medium">Rule set</span>
              <select
                value={policy.ruleSet}
                onChange={(e) => setPolicy({ ...policy, ruleSet: e.target.value as RuleSetName })}
                className="field py-1 text-xs"
              >
                {RULE_SETS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={policy.requestBodyInspection}
                onChange={(e) =>
                  setPolicy({ ...policy, requestBodyInspection: e.target.checked })
                }
              />
              Inspect request body
            </label>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-xs">
                <span className="mb-1 block font-medium">Max request body size (KB)</span>
                <input
                  type="number"
                  min={8}
                  max={128}
                  value={policy.maxRequestBodySizeKb}
                  onChange={(e) =>
                    setPolicy({ ...policy, maxRequestBodySizeKb: Number(e.target.value) })
                  }
                  className="field py-1 text-xs"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">File upload limit (MB)</span>
                <input
                  type="number"
                  min={1}
                  max={750}
                  value={policy.fileUploadLimitMb}
                  onChange={(e) =>
                    setPolicy({ ...policy, fileUploadLimitMb: Number(e.target.value) })
                  }
                  className="field py-1 text-xs"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Anomaly score threshold</span>
                <input
                  type="number"
                  min={1}
                  value={policy.anomalyThreshold}
                  onChange={(e) =>
                    setPolicy({ ...policy, anomalyThreshold: Number(e.target.value) })
                  }
                  className="field py-1 text-xs"
                />
              </label>
            </div>
          </div>

          <LabNote>
            <p>
              Mode is applied <strong>after</strong> every rule has been evaluated, so Detection
              produces exactly the same matches and the same score as Prevention — and then delivers
              the request anyway. Reading the logs of a Detection policy tells you what Prevention
              would have blocked, which is how you tune before you enforce.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "managed-rules" && (
        <div>
          <BladeHeader
            title="Managed rules"
            description={`${policy.ruleSet}. Rules contribute to an anomaly score rather than blocking individually.`}
          />
          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>
              {enabledRules} of {totalRules} rules enabled
            </span>
            <span>
              Severity scores — Critical {SEVERITY_SCORE.Critical}, Error {SEVERITY_SCORE.Error},
              Warning {SEVERITY_SCORE.Warning}, Notice {SEVERITY_SCORE.Notice}. Threshold{" "}
              {policy.anomalyThreshold}.
            </span>
          </div>

          <div className="space-y-2">
            {policy.ruleGroups.map((group) => {
              const open = openGroups[group.name] ?? false;
              const on = group.rules.filter((r) => r.enabled).length;
              return (
                <section key={group.name} className="rounded border border-line">
                  <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setOpenGroups((o) => ({ ...o, [group.name]: !open }))}
                      aria-expanded={open}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span aria-hidden className="text-[10px]">
                        {open ? "▾" : "▸"}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-xs font-medium">{group.name}</span>
                        <span className="block text-[11px] text-muted">{group.description}</span>
                      </span>
                    </button>
                    <span className="text-[11px] text-muted">
                      {on}/{group.rules.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGroup(group.name, on !== group.rules.length)}
                      className="btn-secondary py-0.5 text-[11px]"
                    >
                      {on === group.rules.length ? "Disable all" : "Enable all"}
                    </button>
                  </div>

                  {open && (
                    <div className="overflow-x-auto border-t border-line">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
                          <tr>
                            <th className="px-3 py-1.5 font-medium">Enabled</th>
                            <th className="px-3 py-1.5 font-medium">Rule ID</th>
                            <th className="px-3 py-1.5 font-medium">Severity</th>
                            <th className="px-3 py-1.5 font-medium">Applies to</th>
                            <th className="px-3 py-1.5 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rules.map((rule) => (
                            <tr key={rule.ruleId} className="border-b border-line last:border-0">
                              <td className="px-3 py-1.5">
                                <input
                                  type="checkbox"
                                  checked={rule.enabled}
                                  aria-label={`Enable rule ${rule.ruleId}`}
                                  onChange={(e) => setRule(rule.ruleId, e.target.checked)}
                                />
                              </td>
                              <td className="px-3 py-1.5 font-mono">{rule.ruleId}</td>
                              <td className="px-3 py-1.5">
                                <span
                                  className={`rounded px-1.5 py-0.5 ${severityTone[rule.severity]}`}
                                >
                                  {rule.severity} +{SEVERITY_SCORE[rule.severity]}
                                </span>
                              </td>
                              <td className="px-3 py-1.5 text-muted">{rule.variable}</td>
                              <td className="px-3 py-1.5">{rule.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <LabNote>
            <p>
              A Critical rule scores {SEVERITY_SCORE.Critical} and reaches the default threshold on
              its own. A Warning scores {SEVERITY_SCORE.Warning} and does not — two of them do. This
              is why disabling one noisy Warning rule often changes nothing, and why disabling a
              Critical one opens a hole immediately.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "custom-rules" && (
        <div>
          <BladeHeader
            title="Custom rules"
            description="Evaluated before the managed rule set, in priority order. The first match wins and stops evaluation."
          />
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Enabled</th>
                  <th className="px-3 py-2 font-medium">Priority</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Rule type</th>
                  <th className="px-3 py-2 font-medium">Conditions</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...policy.customRules]
                  .sort((a, b) => a.priority - b.priority)
                  .map((rule) => (
                    <tr key={rule.name} className="border-b border-line align-top last:border-0">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          aria-label={`Enable ${rule.name}`}
                          onChange={(e) => setCustomRule(rule.name, { enabled: e.target.checked })}
                        />
                      </td>
                      <td className="px-3 py-2">{rule.priority}</td>
                      <td className="px-3 py-2 font-mono">{rule.name}</td>
                      <td className="px-3 py-2 text-muted">
                        {rule.ruleType === "RateLimitRule"
                          ? `Rate limit · ${rule.rateLimitThreshold}/${rule.rateLimitDurationMinutes}m`
                          : "Match"}
                      </td>
                      <td className="px-3 py-2">
                        {rule.conditions.map((c, i) => (
                          <span key={i} className="block font-mono text-[11px]">
                            {c.variable} {c.negate ? "NOT " : ""}
                            {c.operator} {c.values.join(", ")}
                            {c.transforms.length > 0 && (
                              <span className="text-muted"> [{c.transforms.join(", ")}]</span>
                            )}
                          </span>
                        ))}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={rule.action}
                          aria-label={`Action for ${rule.name}`}
                          onChange={(e) =>
                            setCustomRule(rule.name, {
                              action: e.target.value as CustomRule["action"],
                            })
                          }
                          className="field py-0.5 text-xs"
                        >
                          <option>Allow</option>
                          <option>Block</option>
                          <option>Log</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <LabNote>
            <p>
              <code className="font-mono">allow-partner-integration</code> at priority 20 matches on
              a header anyone can send. Because a custom Allow is terminating, any request carrying
              that header skips the whole managed rule set — try the partner XSS sample on{" "}
              <strong>Test a request</strong>. Custom rules cut both ways, and priority decides
              which one gets there first.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "exclusions" && (
        <div>
          <BladeHeader
            title="Exclusions"
            description="Removes named request attributes from managed rule evaluation, without disabling the rule for everything else."
          />
          <div className="mb-3 overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Match variable</th>
                  <th className="px-3 py-2 font-medium">Operator</th>
                  <th className="px-3 py-2 font-medium">Selector</th>
                  <th className="px-3 py-2 font-medium">Applies to</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {policy.exclusions.map((e, i) => (
                  <tr key={`${e.selector}-${i}`} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">{e.variable}</td>
                    <td className="px-3 py-2">{e.operator}</td>
                    <td className="px-3 py-2 font-mono">{e.selector}</td>
                    <td className="px-3 py-2 text-muted">
                      {e.ruleIds.length === 0 ? "All managed rules" : e.ruleIds.join(", ")}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setPolicy({
                            ...policy,
                            exclusions: policy.exclusions.filter((_, j) => j !== i),
                          })
                        }
                        className="text-bad"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {policy.exclusions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted">
                      No exclusions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded border border-line p-3">
            <p className="mb-2 text-xs font-semibold">Add an exclusion</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs">
                <span className="mb-1 block font-medium">Match variable</span>
                <select
                  value={exclusionDraft.variable}
                  onChange={(e) =>
                    setExclusionDraft({
                      ...exclusionDraft,
                      variable: e.target.value as Exclusion["variable"],
                    })
                  }
                  className="field py-1 text-xs"
                >
                  <option>RequestHeaderNames</option>
                  <option>RequestCookieNames</option>
                  <option>RequestArgNames</option>
                  <option>RequestArgValues</option>
                </select>
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Operator</span>
                <select
                  value={exclusionDraft.operator}
                  onChange={(e) =>
                    setExclusionDraft({
                      ...exclusionDraft,
                      operator: e.target.value as Exclusion["operator"],
                    })
                  }
                  className="field py-1 text-xs"
                >
                  <option>Equals</option>
                  <option>StartsWith</option>
                  <option>EndsWith</option>
                  <option>Contains</option>
                </select>
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Selector</span>
                <input
                  value={exclusionDraft.selector}
                  onChange={(e) =>
                    setExclusionDraft({ ...exclusionDraft, selector: e.target.value })
                  }
                  placeholder="x-debug-token"
                  className="field py-1 font-mono text-xs"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Rule IDs (blank = all)</span>
                <input
                  value={exclusionDraft.ruleIds.join(",")}
                  onChange={(e) =>
                    setExclusionDraft({
                      ...exclusionDraft,
                      ruleIds: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="913100"
                  className="field py-1 font-mono text-xs"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!exclusionDraft.selector.trim()) return;
                setPolicy({ ...policy, exclusions: [...policy.exclusions, exclusionDraft] });
                setExclusionDraft({ ...exclusionDraft, selector: "", ruleIds: [] });
              }}
              className="btn-primary mt-3 py-1 text-xs"
            >
              Add
            </button>
          </div>

          <LabNote>
            <p>
              An exclusion with no rule IDs applies to <strong>every</strong> managed rule, which is
              far broader than people intend. Scoping it to the one rule that false-positives keeps
              the rest of the rule set watching that same header.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "associated" && (
        <div>
          <BladeHeader
            title="Associated application gateways"
            description="A policy takes effect only where it is associated. Association can be at gateway, listener, or path-rule scope."
          />
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Scope</th>
                  <th className="px-3 py-2 font-medium">Resource group</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line last:border-0">
                  <td className="px-3 py-2 font-mono">agw-contoso-portal</td>
                  <td className="px-3 py-2 text-muted">Application Gateway v2</td>
                  <td className="px-3 py-2">Gateway</td>
                  <td className="px-3 py-2 text-muted">rg-frontend</td>
                </tr>
              </tbody>
            </table>
          </div>
          <LabNote>
            <p>
              A more specific association wins: a policy on a path rule overrides one on its
              listener, which overrides one on the gateway. A gateway-level policy that looks
              correct can be doing nothing because a listener has its own.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "test" && (
        <div>
          <BladeHeader
            title="Test a request"
            description="A lab tool, not a portal feature. Sends one HTTP request through the policy and shows the score build up."
          />

          <div
            className={`mb-3 rounded border p-3 ${
              verdict.action === "Blocked"
                ? "border-bad bg-bad-soft"
                : verdict.wouldBlock
                  ? "border-warn bg-warn-soft"
                  : "border-ok bg-ok-soft"
            }`}
          >
            <p className="text-sm font-semibold">
              <span
                className={
                  verdict.action === "Blocked"
                    ? "text-bad"
                    : verdict.wouldBlock
                      ? "text-warn"
                      : "text-ok"
                }
              >
                {verdict.action}
              </span>
              <span className="ml-2 font-normal text-ink">{verdict.decidedBy}</span>
            </p>
            {verdict.wouldBlock && verdict.action === "Allowed" && (
              <p className="mt-1 text-xs font-medium text-warn">
                Prevention mode would have blocked this. Detection delivered it.
              </p>
            )}
            <p className="mt-1 font-mono text-[11px] text-muted">
              {request.method} {request.uri} · from {request.remoteAddr} ({request.country}) ·
              anomaly score {verdict.totalScore}/{policy.anomalyThreshold}
            </p>
            {note && <p className="mt-2 text-xs">{note}</p>}
          </div>

          <div className="mb-3 flex flex-wrap gap-1">
            {SAMPLE_REQUESTS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setRequest(s.request);
                  setNote(s.teaches);
                }}
                className="chip hover:text-ink"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs">
                  <span className="mb-1 block font-medium">Method</span>
                  <select
                    value={request.method}
                    onChange={(e) => {
                      setRequest({ ...request, method: e.target.value });
                      setNote("");
                    }}
                    className="field py-1 text-xs"
                  >
                    {["GET", "POST", "PUT", "DELETE", "TRACE"].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs">
                  <span className="mb-1 block font-medium">Source address</span>
                  <input
                    value={request.remoteAddr}
                    onChange={(e) => {
                      setRequest({ ...request, remoteAddr: e.target.value });
                      setNote("");
                    }}
                    className="field py-1 font-mono text-xs"
                  />
                </label>
              </div>
              <label className="block text-xs">
                <span className="mb-1 block font-medium">Request URI</span>
                <input
                  value={request.uri}
                  onChange={(e) => {
                    const uri = e.target.value;
                    const qs = uri.includes("?") ? uri.slice(uri.indexOf("?") + 1) : "";
                    setRequest({ ...request, uri, queryString: qs });
                    setNote("");
                  }}
                  className="field py-1 font-mono text-xs"
                />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block font-medium">Request body</span>
                <textarea
                  value={request.body}
                  rows={3}
                  onChange={(e) => {
                    setRequest({ ...request, body: e.target.value });
                    setNote("");
                  }}
                  className="field py-1 font-mono text-xs"
                />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block font-medium">Headers</span>
                <textarea
                  value={Object.entries(request.headers)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join("\n")}
                  rows={4}
                  onChange={(e) => {
                    const headers: Record<string, string> = {};
                    for (const line of e.target.value.split("\n")) {
                      const idx = line.indexOf(":");
                      if (idx > 0) headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
                    }
                    setRequest({ ...request, headers });
                    setNote("");
                  }}
                  className="field py-1 font-mono text-xs"
                />
              </label>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold">Evaluation</p>
              <ol className="space-y-1">
                {verdict.trace.map((step, i) => (
                  <li
                    key={`${step.stage}-${i}`}
                    className={`rounded border p-2 text-xs ${
                      step.matched ? "border-line bg-surface-2" : "border-transparent"
                    }`}
                  >
                    <span className="font-medium">{step.stage}</span>
                    <p className="text-[11px] text-muted">{step.detail}</p>
                  </li>
                ))}
              </ol>

              {verdict.managedHits.length > 0 && (
                <div className="mt-3 rounded border border-line p-2">
                  <p className="mb-1 text-xs font-semibold">Anomaly score</p>
                  <ul className="space-y-0.5 text-[11px]">
                    {verdict.managedHits.map((h) => (
                      <li key={h.rule.ruleId} className="flex justify-between font-mono">
                        <span>
                          {h.rule.ruleId} ({h.rule.severity})
                        </span>
                        <span>+{h.score}</span>
                      </li>
                    ))}
                    <li className="flex justify-between border-t border-line pt-0.5 font-mono font-semibold">
                      <span>Total</span>
                      <span>
                        {verdict.totalScore} / {policy.anomalyThreshold}
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </AzureResourceShell>
  );
}
