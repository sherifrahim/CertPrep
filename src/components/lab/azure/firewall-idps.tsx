"use client";

import { useMemo, useState } from "react";
import {
  EMPTY_SIGNATURE_FILTERS,
  IDPS_MODES,
  SEVERITIES,
  SIGNATURES,
  SIGNATURE_GROUPS,
  effectiveMode,
  filterSignatures,
  type BypassRule,
  type IdpsConfig,
  type IdpsMode,
  type SignatureFilters,
} from "@/lab/idps";
import type { FirewallProtocol } from "@/lab/firewall";
import { BladeHeader, LabNote } from "./resource-shell";

/**
 * The IDPS blade, with the four tabs the portal actually presents:
 * Configuration, Signature rules, Bypass list, and Private IP ranges.
 */
type Tab = "configuration" | "signatures" | "bypass" | "ranges";

const TABS: { id: Tab; label: string }[] = [
  { id: "configuration", label: "Configuration" },
  { id: "signatures", label: "Signature rules" },
  { id: "bypass", label: "Bypass list" },
  { id: "ranges", label: "Private IP ranges" },
];

const severityTone: Record<string, string> = {
  High: "bg-bad-soft text-bad",
  Medium: "bg-warn-soft text-warn",
  Low: "bg-surface-2 text-muted",
};

const BLANK_BYPASS: BypassRule = {
  name: "",
  description: "",
  protocol: "TCP",
  sourceAddresses: "",
  destinationAddresses: "",
  destinationPorts: "",
};

export function FirewallIdps({
  config,
  onChange,
}: {
  config: IdpsConfig;
  onChange: (next: IdpsConfig) => void;
}) {
  const [tab, setTab] = useState<Tab>("configuration");
  const [filters, setFilters] = useState<SignatureFilters>(EMPTY_SIGNATURE_FILTERS);
  const [draft, setDraft] = useState<BypassRule>(BLANK_BYPASS);
  const [bypassError, setBypassError] = useState<string | null>(null);
  const [rangeDraft, setRangeDraft] = useState("");

  const visible = useMemo(
    () => filterSignatures(SIGNATURES, filters, config),
    [filters, config],
  );

  const overrideCount = config.overrides.length;

  function setSignatureMode(signatureId: number, mode: IdpsMode | "Inherit") {
    const rest = config.overrides.filter((o) => o.signatureId !== signatureId);
    onChange({
      ...config,
      overrides: mode === "Inherit" ? rest : [...rest, { signatureId, mode }],
    });
  }

  function addBypass() {
    const name = draft.name.trim();
    if (!name) return setBypassError("Enter a name for the bypass rule.");
    if (config.bypass.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
      return setBypassError("A bypass rule with that name already exists.");
    }
    if (!draft.sourceAddresses.trim() || !draft.destinationAddresses.trim()) {
      return setBypassError("Source and destination addresses are both required.");
    }
    onChange({ ...config, bypass: [...config.bypass, { ...draft, name }] });
    setDraft(BLANK_BYPASS);
    setBypassError(null);
  }

  return (
    <div>
      <BladeHeader
        title="IDPS"
        description="Intrusion detection and prevention. Available on the Premium tier, and applied to traffic the rules have already allowed."
      />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
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
            {t.id === "signatures" && overrideCount > 0 && (
              <span className="ml-1.5 rounded bg-accent-soft px-1 text-[10px] text-accent-text">
                {overrideCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "configuration" && (
        <div className="max-w-2xl">
          <fieldset>
            <legend className="text-xs font-semibold">Mode</legend>
            <div className="mt-2 space-y-2">
              {IDPS_MODES.map((m) => (
                <label key={m} className="flex items-start gap-2 text-xs">
                  <input
                    type="radio"
                    name="idps-mode"
                    checked={config.mode === m}
                    onChange={() => onChange({ ...config, mode: m })}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">{m}</span>
                    <span className="block text-muted">
                      {m === "Off" && "No traffic is inspected and no signature can fire."}
                      {m === "Alert" &&
                        "Matching traffic is logged and still delivered. This is detection, not prevention."}
                      {m === "Alert and deny" &&
                        "Matching traffic is logged and blocked. Signatures set to Alert by an override still only alert."}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <LabNote>
            <p>
              Mode is the <strong>default for every signature</strong>, not a global switch. A
              signature override beats it, and the bypass list beats both — bypassed traffic never
              reaches a signature at all, so a bypass entry silently defeats every override you set.
            </p>
            <p>
              IDPS only sees traffic the rule collections already allowed. A packet a network rule
              denied is never inspected, so an IDPS signature is not a substitute for a deny rule.
            </p>
          </LabNote>
        </div>
      )}

      {tab === "signatures" && (
        <div>
          <div className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <label className="text-xs">
              <span className="mb-1 block font-medium">Search</span>
              <input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Signature ID or text"
                className="field py-1 text-xs"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-medium">Group</span>
              <select
                value={filters.group}
                onChange={(e) =>
                  setFilters({ ...filters, group: e.target.value as SignatureFilters["group"] })
                }
                className="field py-1 text-xs"
              >
                <option>All</option>
                {SIGNATURE_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-medium">Severity</span>
              <select
                value={filters.severity}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    severity: e.target.value as SignatureFilters["severity"],
                  })
                }
                className="field py-1 text-xs"
              >
                <option>All</option>
                {SEVERITIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-medium">Direction</span>
              <select
                value={filters.direction}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    direction: e.target.value as SignatureFilters["direction"],
                  })
                }
                className="field py-1 text-xs"
              >
                <option>All</option>
                <option>Inbound</option>
                <option>Outbound</option>
                <option>Bidirectional</option>
                <option>Internal</option>
              </select>
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-medium">Mode</span>
              <select
                value={filters.mode}
                onChange={(e) =>
                  setFilters({ ...filters, mode: e.target.value as SignatureFilters["mode"] })
                }
                className="field py-1 text-xs"
              >
                <option>All</option>
                {IDPS_MODES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pb-2 text-xs text-muted">
            <span>
              Showing {visible.length} of {SIGNATURES.length} signatures
            </span>
            {overrideCount > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...config, overrides: [] })}
                className="text-accent-text"
              >
                Reset {overrideCount} override{overrideCount === 1 ? "" : "s"}
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Signature ID</th>
                  <th className="px-3 py-2 font-medium">Mode</th>
                  <th className="px-3 py-2 font-medium">Severity</th>
                  <th className="px-3 py-2 font-medium">Direction</th>
                  <th className="px-3 py-2 font-medium">Group</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => {
                  const { mode, overridden } = effectiveMode(s, config);
                  return (
                    <tr key={s.id} className="border-b border-line last:border-0">
                      <td className="px-3 py-2 font-mono">{s.id}</td>
                      <td className="px-3 py-2">
                        <select
                          value={overridden ? mode : "Inherit"}
                          onChange={(e) =>
                            setSignatureMode(s.id, e.target.value as IdpsMode | "Inherit")
                          }
                          aria-label={`Mode for signature ${s.id}`}
                          className={`field py-0.5 text-xs ${
                            overridden ? "border-accent text-accent-text" : ""
                          }`}
                        >
                          <option value="Inherit">Inherit ({config.mode})</option>
                          {IDPS_MODES.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-1.5 py-0.5 ${severityTone[s.severity]}`}>
                          {s.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted">{s.direction}</td>
                      <td className="px-3 py-2 text-muted">{s.group}</td>
                      <td className="px-3 py-2">{s.description}</td>
                    </tr>
                  );
                })}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted">
                      No signatures match those filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <LabNote>
            <p>
              Setting one signature to <strong>Alert and deny</strong> while the policy sits on
              Alert is how a real deployment starts: detect broadly, block only what you have
              confirmed. Setting one to <strong>Off</strong> is how you silence a noisy rule without
              weakening everything else.
            </p>
          </LabNote>
        </div>
      )}

      {tab === "bypass" && (
        <div>
          <BladeHeader
            title="Bypass list"
            description="Traffic matching any entry skips IDPS inspection entirely."
          />

          <div className="mb-4 overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Protocol</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Destination</th>
                  <th className="px-3 py-2 font-medium">Ports</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {config.bypass.map((b) => (
                  <tr key={b.name} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">
                      <span className="font-medium">{b.name}</span>
                      {b.description && <span className="block text-muted">{b.description}</span>}
                    </td>
                    <td className="px-3 py-2">{b.protocol}</td>
                    <td className="px-3 py-2 font-mono">{b.sourceAddresses}</td>
                    <td className="px-3 py-2 font-mono">{b.destinationAddresses}</td>
                    <td className="px-3 py-2 font-mono">{b.destinationPorts}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...config,
                            bypass: config.bypass.filter((x) => x.name !== b.name),
                          })
                        }
                        className="text-bad"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {config.bypass.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-muted">
                      No bypass rules. Every allowed packet is inspected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded border border-line p-3">
            <p className="mb-2 text-xs font-semibold">Add a bypass rule</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <label className="text-xs">
                <span className="mb-1 block font-medium">Name</span>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="field py-1 text-xs"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Protocol</span>
                <select
                  value={draft.protocol}
                  onChange={(e) =>
                    setDraft({ ...draft, protocol: e.target.value as FirewallProtocol })
                  }
                  className="field py-1 text-xs"
                >
                  <option>Any</option>
                  <option>TCP</option>
                  <option>UDP</option>
                  <option>ICMP</option>
                </select>
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Destination ports</span>
                <input
                  value={draft.destinationPorts}
                  onChange={(e) => setDraft({ ...draft, destinationPorts: e.target.value })}
                  placeholder="443 or 80,443 or *"
                  className="field py-1 font-mono text-xs"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Source addresses</span>
                <input
                  value={draft.sourceAddresses}
                  onChange={(e) => setDraft({ ...draft, sourceAddresses: e.target.value })}
                  placeholder="10.20.0.0/16"
                  className="field py-1 font-mono text-xs"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Destination addresses</span>
                <input
                  value={draft.destinationAddresses}
                  onChange={(e) => setDraft({ ...draft, destinationAddresses: e.target.value })}
                  placeholder="10.40.0.0/16"
                  className="field py-1 font-mono text-xs"
                />
              </label>
              <label className="text-xs">
                <span className="mb-1 block font-medium">Description</span>
                <input
                  value={draft.description ?? ""}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="field py-1 text-xs"
                />
              </label>
            </div>
            {bypassError && <p className="mt-2 text-xs text-bad">{bypassError}</p>}
            <button type="button" onClick={addBypass} className="btn-primary mt-3 py-1 text-xs">
              Add
            </button>
          </div>

          <LabNote>
            <p>
              The bypass list is checked <strong>before</strong> any signature. An entry that is
              broader than intended — a wide CIDR, or <code className="font-mono">*</code> for ports
              — turns IDPS off for that traffic while the blade still reports the policy as
              &ldquo;Alert and deny&rdquo;. Add a bypass covering the C2 address, then run the test
              packet, and watch the block disappear.
            </p>
          </LabNote>
        </div>
      )}

      {tab === "ranges" && (
        <div className="max-w-2xl">
          <BladeHeader
            title="Private IP ranges"
            description="Which addresses count as internal. This decides whether a signature's direction is treated as inbound, outbound or internal."
          />
          <ul className="mb-3 space-y-1">
            {config.privateRanges.map((r) => (
              <li
                key={r}
                className="flex items-center justify-between rounded border border-line px-3 py-1.5 text-xs"
              >
                <span className="font-mono">{r}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...config,
                      privateRanges: config.privateRanges.filter((x) => x !== r),
                    })
                  }
                  className="text-bad"
                >
                  Remove
                </button>
              </li>
            ))}
            {config.privateRanges.length === 0 && (
              <li className="rounded border border-line px-3 py-2 text-xs text-muted">
                None. Every endpoint is treated as external.
              </li>
            )}
          </ul>
          <div className="flex gap-2">
            <input
              value={rangeDraft}
              onChange={(e) => setRangeDraft(e.target.value)}
              placeholder="10.0.0.0/8"
              className="field py-1 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => {
                const v = rangeDraft.trim();
                if (!v || config.privateRanges.includes(v)) return;
                onChange({ ...config, privateRanges: [...config.privateRanges, v] });
                setRangeDraft("");
              }}
              className="btn-secondary shrink-0 py-1 text-xs"
            >
              Add range
            </button>
          </div>
          <LabNote>
            <p>
              Azure defaults these to the IANA private ranges. Widen or narrow them and traffic
              changes category — an address you remove from here starts being treated as internet,
              which changes which signatures apply to it.
            </p>
          </LabNote>
        </div>
      )}
    </div>
  );
}
