"use client";

import { useMemo, useState } from "react";
import {
  NETWORKS,
  SAMPLE_DESTINATIONS,
  canReach,
  effectiveRoutes,
  prefixLength,
  resolveRoute,
} from "@/lab/vnet";

const hopTone: Record<string, string> = {
  VirtualNetwork: "bg-accent-soft text-accent-text",
  VnetPeering: "bg-accent-soft text-accent-text",
  Internet: "bg-surface-2 text-muted",
  VirtualNetworkGateway: "bg-warn-soft text-warn",
  VirtualAppliance: "bg-warn-soft text-warn",
  InterfaceEndpoint: "bg-ok-soft text-ok",
  None: "bg-bad-soft text-bad",
};

export function VnetConsole() {
  const [vnetName, setVnetName] = useState(SAMPLE_DESTINATIONS[0].vnet);
  const [subnetName, setSubnetName] = useState(SAMPLE_DESTINATIONS[0].subnet);
  const [destination, setDestination] = useState(SAMPLE_DESTINATIONS[0].destination);
  const [note, setNote] = useState(SAMPLE_DESTINATIONS[0].teaches);
  const [reachFrom, setReachFrom] = useState("vnet-spoke-app");
  const [reachTo, setReachTo] = useState("vnet-spoke-data");

  const vnet = NETWORKS.find((v) => v.name === vnetName)!;
  const subnet = vnet.subnets.find((s) => s.name === subnetName) ?? vnet.subnets[0];

  const routes = useMemo(() => effectiveRoutes(vnet, subnet), [vnet, subnet]);
  const resolution = useMemo(() => resolveRoute(routes, destination), [routes, destination]);
  const reach = useMemo(() => canReach(NETWORKS, reachFrom, reachTo), [reachFrom, reachTo]);

  const selectedName = resolution.selected?.name;

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <span
            className={`rounded px-2 py-1 text-sm font-medium ${
              hopTone[resolution.selected?.nextHopType ?? "None"] ?? "bg-surface-2"
            }`}
          >
            {resolution.selected?.nextHopType ?? "No route"}
          </span>
          <span className="text-sm">
            {resolution.selected ? (
              <>
                via <strong>{resolution.selected.name}</strong> (
                {resolution.selected.addressPrefix}, {resolution.selected.source.toLowerCase()})
              </>
            ) : (
              "nothing carries this destination"
            )}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">{resolution.outcome}</p>
        {note && <p className="mt-2 text-sm">{note}</p>}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card p-4">
          <h2 className="font-semibold">Trace a destination</h2>
          <div className="mt-3 flex flex-wrap gap-1">
            {SAMPLE_DESTINATIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setVnetName(s.vnet);
                  setSubnetName(s.subnet);
                  setDestination(s.destination);
                  setNote(s.teaches);
                }}
                className="chip hover:text-ink"
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Virtual network</span>
              <select
                value={vnetName}
                onChange={(e) => {
                  const next = NETWORKS.find((v) => v.name === e.target.value)!;
                  setVnetName(next.name);
                  setSubnetName(next.subnets[0].name);
                  setNote("");
                }}
                className="field py-1.5 text-sm"
              >
                {NETWORKS.map((v) => (
                  <option key={v.name}>{v.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Subnet</span>
              <select
                value={subnet.name}
                onChange={(e) => {
                  setSubnetName(e.target.value);
                  setNote("");
                }}
                className="field py-1.5 text-sm"
              >
                {vnet.subnets.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Destination</span>
              <input
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setNote("");
                }}
                className="field py-1.5 font-mono text-sm"
              />
            </label>
          </div>

          <p className="mt-3 text-sm text-muted">
            {subnet.addressPrefix}
            {subnet.privateEndpoints.length > 0 &&
              ` · ${subnet.privateEndpoints.length} private endpoint${
                subnet.privateEndpoints.length === 1 ? "" : "s"
              }`}
            {subnet.routeTable.length > 0 && ` · ${subnet.routeTable.length} user-defined routes`}
          </p>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold">Can these networks talk?</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["From", reachFrom, setReachFrom],
                ["To", reachTo, setReachTo],
              ] as const
            ).map(([label, value, setter]) => (
              <label key={label} className="text-sm">
                <span className="mb-1 block font-medium">{label}</span>
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="field py-1.5 text-sm"
                >
                  {NETWORKS.map((v) => (
                    <option key={v.name}>{v.name}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p
            className={`mt-3 rounded p-3 text-sm ${
              reach.reachable ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"
            }`}
          >
            {reach.explanation}
          </p>
          <p className="mt-2 text-xs text-muted">
            Peering is never transitive. Two spokes on a shared hub do not get a path to each other
            from the peerings alone, however the peerings are configured.
          </p>
        </section>
      </div>

      <section className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="px-4 pt-4 text-left text-sm text-muted">
            Effective routes for {subnet.name}. Longest prefix wins; a tie is broken by source, with
            user-defined above BGP above system.
          </caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Prefix</th>
              <th className="px-4 py-2 font-medium">Next hop</th>
              <th className="px-4 py-2 font-medium">Source</th>
              <th className="px-4 py-2 font-medium">Name</th>
            </tr>
          </thead>
          <tbody>
            {[...routes]
              .sort((a, b) => prefixLength(b.addressPrefix) - prefixLength(a.addressPrefix))
              .map((r, i) => {
                const winner = r.name === selectedName;
                return (
                  <tr
                    key={`${r.name}-${r.addressPrefix}-${i}`}
                    className={`border-b border-line align-top last:border-0 ${
                      winner ? "bg-surface-2" : ""
                    }`}
                  >
                    <td className="px-4 py-2 font-mono text-xs">
                      {r.addressPrefix}
                      {winner && <span className="ml-2 font-sans text-ink">← selected</span>}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] ${hopTone[r.nextHopType] ?? ""}`}
                      >
                        {r.nextHopType}
                      </span>
                      {r.nextHopIp && (
                        <span className="ml-2 font-mono text-xs text-muted">{r.nextHopIp}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted">{r.source}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="font-mono">{r.name}</span>
                      {r.description && (
                        <span className="mt-0.5 block text-muted">{r.description}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>

      {resolution.candidates.length > 0 && (
        <section className="card p-4">
          <h2 className="font-semibold">Why that route won</h2>
          <ol className="mt-2 space-y-2">
            {resolution.candidates.map((c, i) => (
              <li key={`${c.route.name}-${i}`} className="text-sm">
                <span className="font-mono text-xs">{c.route.addressPrefix}</span>{" "}
                <span className="text-muted">({c.route.name})</span>
                <p className="text-xs text-muted">{c.reason}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
