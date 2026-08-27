"use client";

import { useMemo, useState } from "react";
import {
  SAMPLE_PACKETS,
  STARTER_POLICY,
  evaluatePacket,
  type FirewallProtocol,
  type Packet,
  type RuleCollection,
  type ThreatIntelMode,
} from "@/lab/firewall";
import { DEFAULT_IDPS, inspect, type IdpsConfig } from "@/lab/idps";
import {
  AzureResourceShell,
  BladeHeader,
  LabNote,
  type NavGroup,
} from "./azure/resource-shell";
import { FirewallIdps } from "./azure/firewall-idps";
import { FirewallRules } from "./azure/firewall-rules";

/**
 * Azure Firewall Policy, laid out as the portal lays it out.
 *
 * The blade list, the Essentials panel and the settings surfaces follow the
 * real resource so navigating here is practice for navigating there. The one
 * addition is "Test a packet", which Azure has no equivalent of — it is marked
 * as a lab tool so it is never mistaken for a portal feature.
 */

const WEB_CATEGORIES = [
  { name: "Business", risk: "Low", allowed: true },
  { name: "Computers and technology", risk: "Low", allowed: true },
  { name: "Education", risk: "Low", allowed: true },
  { name: "Finance", risk: "Low", allowed: true },
  { name: "Government", risk: "Low", allowed: true },
  { name: "Health and medicine", risk: "Low", allowed: true },
  { name: "Search engines", risk: "Low", allowed: true },
  { name: "Social networking", risk: "Medium", allowed: false },
  { name: "Streaming media", risk: "Medium", allowed: false },
  { name: "Gambling", risk: "High", allowed: false },
  { name: "Hacking", risk: "High", allowed: false },
  { name: "Malicious", risk: "High", allowed: false },
  { name: "Peer-to-peer", risk: "High", allowed: false },
  { name: "Phishing", risk: "High", allowed: false },
];

export function FirewallConsole() {
  const [blade, setBlade] = useState("overview");
  const [collections, setCollections] = useState<RuleCollection[]>(STARTER_POLICY);
  const [idps, setIdps] = useState<IdpsConfig>(DEFAULT_IDPS);
  const [threatIntel, setThreatIntel] = useState<ThreatIntelMode>("Alert and deny");
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [allowDraft, setAllowDraft] = useState("");
  const [dnsProxy, setDnsProxy] = useState(false);
  const [dnsServers, setDnsServers] = useState("168.63.129.16");
  const [tlsEnabled, setTlsEnabled] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const [packet, setPacket] = useState<Packet>(SAMPLE_PACKETS[0].packet);
  const [note, setNote] = useState(SAMPLE_PACKETS[0].teaches);

  const firewall = useMemo(
    () => evaluatePacket(collections, packet, threatIntel),
    [collections, packet, threatIntel],
  );
  // IDPS only inspects what the rules allowed — that ordering is the lesson.
  const idpsVerdict = useMemo(
    () => (firewall.action === "Allow" ? inspect(idps, packet) : null),
    [firewall.action, idps, packet],
  );

  const finalAction =
    firewall.action === "Allow" && idpsVerdict?.denied ? "Deny" : firewall.action;

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
        { id: "rule-collections", label: "Rule collections", badge: String(collections.length) },
        { id: "dnat", label: "DNAT rules" },
        { id: "network", label: "Network rules" },
        { id: "application", label: "Application rules" },
        { id: "threat-intel", label: "Threat intelligence" },
        {
          id: "idps",
          label: "IDPS",
          badge: idps.overrides.length > 0 ? String(idps.overrides.length) : undefined,
        },
        { id: "tls", label: "TLS inspection" },
        { id: "dns", label: "DNS" },
        { id: "web-categories", label: "Web categories" },
        { id: "explicit-proxy", label: "Explicit proxy", disabled: true },
      ],
    },
    {
      label: "Monitoring",
      items: [
        { id: "metrics", label: "Metrics", disabled: true },
        { id: "logs", label: "Logs", disabled: true },
      ],
    },
    { label: "Lab tools", items: [{ id: "test", label: "Test a packet" }] },
  ];

  return (
    <AzureResourceShell
      breadcrumb={["Home", "Firewall Policies", "afwp-contoso-hub"]}
      resourceName="afwp-contoso-hub"
      resourceType="Firewall Policy"
      glyph="FP"
      commands={[
        { label: "Refresh", glyph: "⟳" },
        { label: "Delete", glyph: "🗑", destructive: true, disabled: true },
      ]}
      essentials={[
        { label: "Resource group", value: "rg-hub-network" },
        { label: "Location", value: "UAE North" },
        { label: "Subscription", value: "Contoso Production" },
        { label: "Tier", value: "Premium" },
        { label: "Provisioning state", value: <span className="text-ok">Succeeded</span> },
        { label: "Parent policy", value: "None" },
        { label: "Firewalls", value: "afw-contoso-hub" },
        { label: "Threat intelligence", value: threatIntel },
        { label: "IDPS mode", value: idps.mode },
      ]}
      nav={nav}
      activeId={blade}
      onNavigate={setBlade}
    >
      {blade === "overview" && (
        <div>
          <BladeHeader
            title="Overview"
            description="A Premium policy attached to one firewall in the hub virtual network."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Rule collections", value: collections.length, id: "rule-collections" },
              {
                label: "Rules",
                value: collections.reduce(
                  (n, c) =>
                    n +
                    (c.dnatRules?.length ?? 0) +
                    (c.networkRules?.length ?? 0) +
                    (c.applicationRules?.length ?? 0),
                  0,
                ),
                id: "rule-collections",
              },
              { label: "IDPS mode", value: idps.mode, id: "idps" },
              { label: "Signature overrides", value: idps.overrides.length, id: "idps" },
            ].map((tile) => (
              <button
                key={tile.label}
                type="button"
                onClick={() => setBlade(tile.id)}
                className="rounded border border-line p-3 text-left hover:bg-surface-2"
              >
                <p className="text-lg font-semibold">{tile.value}</p>
                <p className="text-xs text-muted">{tile.label}</p>
              </button>
            ))}
          </div>
          <LabNote>
            <p>
              Work through the blades in the menu the way you would in the portal. The order that
              matters is on <strong>Rule collections</strong>; the setting that most changes
              behaviour is on <strong>IDPS</strong>; and <strong>Test a packet</strong> shows the
              two interacting.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "rule-collections" && (
        <FirewallRules collections={collections} onChange={setCollections} />
      )}
      {blade === "dnat" && (
        <FirewallRules collections={collections} onChange={setCollections} ruleType="DNAT" />
      )}
      {blade === "network" && (
        <FirewallRules collections={collections} onChange={setCollections} ruleType="Network" />
      )}
      {blade === "application" && (
        <FirewallRules collections={collections} onChange={setCollections} ruleType="Application" />
      )}

      {blade === "idps" && <FirewallIdps config={idps} onChange={setIdps} />}

      {blade === "threat-intel" && (
        <div className="max-w-2xl">
          <BladeHeader
            title="Threat intelligence"
            description="Microsoft's feed of known-malicious addresses and domains, applied before any rule collection."
          />
          <fieldset>
            <legend className="text-xs font-semibold">Threat intelligence mode</legend>
            <div className="mt-2 space-y-2">
              {(["Off", "Alert only", "Alert and deny"] as ThreatIntelMode[]).map((m) => (
                <label key={m} className="flex items-start gap-2 text-xs">
                  <input
                    type="radio"
                    name="ti-mode"
                    checked={threatIntel === m}
                    onChange={() => setThreatIntel(m)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium">{m}</span>
                    <span className="block text-muted">
                      {m === "Off" && "The feed is not consulted."}
                      {m === "Alert only" &&
                        "Matches are logged, then evaluation continues into your rules."}
                      {m === "Alert and deny" &&
                        "Matches are refused before any rule collection is read. This is the default."}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-4">
            <p className="text-xs font-semibold">Allowlist</p>
            <p className="mb-2 text-[11px] text-muted">
              Addresses and FQDNs the feed should ignore for this policy.
            </p>
            <ul className="mb-2 space-y-1">
              {allowlist.map((a) => (
                <li
                  key={a}
                  className="flex items-center justify-between rounded border border-line px-3 py-1 text-xs"
                >
                  <span className="font-mono">{a}</span>
                  <button
                    type="button"
                    onClick={() => setAllowlist((l) => l.filter((x) => x !== a))}
                    className="text-bad"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {allowlist.length === 0 && (
                <li className="rounded border border-line px-3 py-2 text-xs text-muted">
                  Empty. Nothing is exempt from the feed.
                </li>
              )}
            </ul>
            <div className="flex gap-2">
              <input
                value={allowDraft}
                onChange={(e) => setAllowDraft(e.target.value)}
                placeholder="203.0.113.0/24 or contoso.com"
                className="field py-1 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  const v = allowDraft.trim();
                  if (!v || allowlist.includes(v)) return;
                  setAllowlist((l) => [...l, v]);
                  setAllowDraft("");
                }}
                className="btn-secondary shrink-0 py-1 text-xs"
              >
                Add
              </button>
            </div>
          </div>

          <LabNote>
            <p>
              Threat intelligence runs <strong>before</strong> your rules, so it can deny traffic an
              allow rule would have permitted. Switch it to Alert only and run the
              command-and-control test packet: the same traffic is then stopped one step later, by
              your own deny rule, and the trace shows the difference.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "tls" && (
        <div className="max-w-2xl">
          <BladeHeader
            title="TLS inspection"
            description="Decrypts outbound TLS so application rules and IDPS can see more than the hostname."
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={tlsEnabled}
              onChange={(e) => setTlsEnabled(e.target.checked)}
            />
            Enable TLS inspection
          </label>
          <div className={`mt-3 space-y-2 ${tlsEnabled ? "" : "pointer-events-none opacity-40"}`}>
            <label className="block text-xs">
              <span className="mb-1 block font-medium">Managed identity</span>
              <select className="field py-1 text-xs">
                <option>id-afw-tls-inspection</option>
              </select>
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-medium">Key vault</span>
              <select className="field py-1 text-xs">
                <option>kv-contoso-prod</option>
              </select>
            </label>
            <label className="block text-xs">
              <span className="mb-1 block font-medium">Certificate</span>
              <select className="field py-1 text-xs">
                <option>contoso-intermediate-ca</option>
              </select>
            </label>
          </div>
          <LabNote>
            <p>
              Without inspection, IDPS sees only the SNI hostname and connection metadata on an
              HTTPS flow — so a signature matching on payload cannot fire. It needs an intermediate
              CA certificate in Key Vault, reached through a managed identity, and the CA has to be
              trusted by every client or TLS breaks everywhere at once.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "dns" && (
        <div className="max-w-2xl">
          <BladeHeader title="DNS" description="DNS servers and proxy behaviour for the policy." />
          <label className="block text-xs">
            <span className="mb-1 block font-medium">DNS servers</span>
            <input
              value={dnsServers}
              onChange={(e) => setDnsServers(e.target.value)}
              className="field py-1 font-mono text-xs"
            />
            <span className="mt-1 block text-[11px] text-muted">
              Comma separated. 168.63.129.16 is Azure-provided DNS.
            </span>
          </label>
          <label className="mt-3 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={dnsProxy}
              onChange={(e) => setDnsProxy(e.target.checked)}
            />
            Enable DNS proxy
          </label>
          <LabNote>
            <p>
              DNS proxy matters more than it looks. Network rules that use an FQDN destination
              resolve names through the firewall, so without the proxy the firewall and the client
              can resolve the same name to different addresses and the rule silently stops
              matching.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "web-categories" && (
        <div>
          <BladeHeader
            title="Web categories"
            description="Premium-tier categorisation, used as a destination type in application rules."
          />
          <input
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Search categories"
            className="field mb-3 max-w-xs py-1 text-xs"
          />
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Risk</th>
                  <th className="px-3 py-2 font-medium">Current policy</th>
                </tr>
              </thead>
              <tbody>
                {WEB_CATEGORIES.filter((c) =>
                  c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()),
                ).map((c) => (
                  <tr key={c.name} className="border-b border-line last:border-0">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 ${
                          c.risk === "High"
                            ? "bg-bad-soft text-bad"
                            : c.risk === "Medium"
                              ? "bg-warn-soft text-warn"
                              : "bg-surface-2 text-muted"
                        }`}
                      >
                        {c.risk}
                      </span>
                    </td>
                    <td className={`px-3 py-2 ${c.allowed ? "text-ok" : "text-bad"}`}>
                      {c.allowed ? "Allowed" : "Denied"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <LabNote>
            <p>
              Web categories are a <strong>destination type on an application rule</strong>, not a
              standalone blocklist. Nothing here takes effect until a rule references the category,
              which is why a policy can show Gambling as &ldquo;Denied&rdquo; while the traffic
              still flows through a broad network rule.
            </p>
          </LabNote>
        </div>
      )}

      {blade === "test" && (
        <div>
          <BladeHeader
            title="Test a packet"
            description="A lab tool, not a portal feature. Sends one packet through the policy and shows every decision point in order."
          />

          <div
            className={`mb-3 rounded border p-3 ${
              finalAction === "Allow" ? "border-ok bg-ok-soft" : "border-bad bg-bad-soft"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                finalAction === "Allow" ? "text-ok" : "text-bad"
              }`}
            >
              {finalAction === "Allow" ? "Allowed" : "Denied"}
              <span className="ml-2 font-normal text-ink">
                {idpsVerdict?.denied ? "by IDPS" : `by ${firewall.decidedBy}`}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted">
              {packet.protocol} {packet.sourceIp} → {packet.destinationIp}:{packet.destinationPort}
              {packet.fqdn && ` (${packet.fqdn})`}
              {firewall.translatedTo && ` · translated to ${firewall.translatedTo}`}
            </p>
            {note && <p className="mt-2 text-xs">{note}</p>}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section>
              <div className="mb-2 flex flex-wrap gap-1">
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
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["Source address", "sourceIp"],
                    ["Destination address", "destinationIp"],
                  ] as const
                ).map(([label, key]) => (
                  <label key={key} className="text-xs">
                    <span className="mb-1 block font-medium">{label}</span>
                    <input
                      value={packet[key]}
                      onChange={(e) => {
                        setPacket({ ...packet, [key]: e.target.value });
                        setNote("");
                      }}
                      className="field py-1 font-mono text-xs"
                    />
                  </label>
                ))}
                <label className="text-xs">
                  <span className="mb-1 block font-medium">Destination port</span>
                  <input
                    type="number"
                    value={packet.destinationPort}
                    onChange={(e) => {
                      setPacket({ ...packet, destinationPort: Number(e.target.value) });
                      setNote("");
                    }}
                    className="field py-1 font-mono text-xs"
                  />
                </label>
                <label className="text-xs">
                  <span className="mb-1 block font-medium">Protocol</span>
                  <select
                    value={packet.protocol}
                    onChange={(e) => {
                      setPacket({ ...packet, protocol: e.target.value as FirewallProtocol });
                      setNote("");
                    }}
                    className="field py-1 text-xs"
                  >
                    <option>TCP</option>
                    <option>UDP</option>
                    <option>ICMP</option>
                  </select>
                </label>
                <label className="text-xs sm:col-span-2">
                  <span className="mb-1 block font-medium">Hostname</span>
                  <input
                    value={packet.fqdn ?? ""}
                    placeholder="empty for non-web traffic"
                    onChange={(e) => {
                      setPacket({ ...packet, fqdn: e.target.value.trim() || undefined });
                      setNote("");
                    }}
                    className="field py-1 font-mono text-xs"
                  />
                </label>
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold">Decision trace</p>
              <ol className="space-y-1">
                {firewall.trace.map((step, i) => (
                  <li
                    key={`${step.stage}-${i}`}
                    className={`rounded border p-2 text-xs ${
                      step.matched ? "border-line bg-surface-2" : "border-transparent"
                    }`}
                  >
                    <span className="font-medium">{step.stage}</span>
                    {step.rule && (
                      <span className="ml-1 font-mono text-[11px] text-muted">
                        {step.collection} / {step.rule}
                      </span>
                    )}
                    <p className="text-[11px] text-muted">{step.reason}</p>
                  </li>
                ))}
                {idpsVerdict && (
                  <li
                    className={`rounded border p-2 text-xs ${
                      idpsVerdict.denied || idpsVerdict.alerts.length > 0
                        ? "border-line bg-surface-2"
                        : "border-transparent"
                    }`}
                  >
                    <span className="font-medium">IDPS</span>
                    <p className="text-[11px] text-muted">{idpsVerdict.summary}</p>
                    {idpsVerdict.hits.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {idpsVerdict.hits.map((h) => (
                          <li key={h.signature.id} className="font-mono text-[11px]">
                            {h.signature.id} · {h.mode}
                            {h.overridden && " (override)"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}
              </ol>
            </section>
          </div>

          <LabNote>
            <p>
              Notice the ordering: threat intelligence, then DNAT, then network rules, then
              application rules, and only then IDPS. IDPS never sees a packet the rules denied, so
              turning IDPS to <strong>Alert and deny</strong> cannot compensate for a missing deny
              rule — and a bypass entry removes inspection without changing anything the IDPS blade
              displays.
            </p>
          </LabNote>
        </div>
      )}
    </AzureResourceShell>
  );
}
