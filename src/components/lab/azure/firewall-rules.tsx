"use client";

import { useState } from "react";
import type {
  ApplicationRule,
  DnatRule,
  FirewallAction,
  FirewallProtocol,
  NetworkRule,
  RuleCollection,
  RuleType,
} from "@/lab/firewall";
import { evaluationOrder } from "@/lab/firewall";
import { BladeHeader, LabNote } from "./resource-shell";

/**
 * Rule collections, and the three rule blades beneath them.
 *
 * Field names, the source/destination "type" dropdowns, and the priority range
 * follow the portal's Add a rule collection pane, because those are the details
 * an exam question hinges on — a destination type of Service Tag behaves
 * differently from FQDN, and application rules have no port field of their own.
 */

const GROUPS: Record<RuleType, { name: string; priority: number }> = {
  DNAT: { name: "DefaultDnatRuleCollectionGroup", priority: 100 },
  Network: { name: "DefaultNetworkRuleCollectionGroup", priority: 200 },
  Application: { name: "DefaultApplicationRuleCollectionGroup", priority: 300 },
};

const typeTone: Record<RuleType, string> = {
  DNAT: "bg-accent-soft text-accent-text",
  Network: "bg-warn-soft text-warn",
  Application: "bg-ok-soft text-ok",
};

type Props = {
  collections: RuleCollection[];
  onChange: (next: RuleCollection[]) => void;
  /** Which rule type this blade shows; undefined means the collections list. */
  ruleType?: RuleType;
};

export function FirewallRules({ collections, onChange, ruleType }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<RuleType>(ruleType ?? "Network");
  const [priority, setPriority] = useState(1000);
  const [action, setAction] = useState<FirewallAction>("Allow");
  const [error, setError] = useState<string | null>(null);

  const effectiveType = ruleType ?? type;

  function addCollection() {
    const trimmed = name.trim();
    if (!trimmed) return setError("Enter a name for the rule collection.");
    if (collections.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      return setError("A rule collection with that name already exists.");
    }
    if (!Number.isInteger(priority) || priority < 100 || priority > 65000) {
      return setError("Priority must be a whole number between 100 and 65000.");
    }
    const sameGroup = collections.filter(
      (c) => c.type === effectiveType && c.priority === priority,
    );
    if (sameGroup.length > 0) {
      return setError(`Priority ${priority} is already used by another ${effectiveType} collection.`);
    }

    const group = GROUPS[effectiveType];
    const created: RuleCollection = {
      name: trimmed,
      type: effectiveType,
      action: effectiveType === "DNAT" ? "Allow" : action,
      priority,
      groupName: group.name,
      groupPriority: group.priority,
      ...(effectiveType === "DNAT" && { dnatRules: [] }),
      ...(effectiveType === "Network" && { networkRules: [] }),
      ...(effectiveType === "Application" && { applicationRules: [] }),
    };
    onChange([...collections, created]);
    setName("");
    setError(null);
    setAdding(false);
  }

  /* --------------------------------------------------- rule type blades */

  if (ruleType) {
    const relevant = evaluationOrder(collections).filter((c) => c.type === ruleType);
    return (
      <div>
        <BladeHeader
          title={`${ruleType} rules`}
          description={
            ruleType === "DNAT"
              ? "Destination network address translation. A DNAT match translates the destination and implicitly allows the traffic — no matching network rule is needed."
              : ruleType === "Network"
                ? "Layer 3 and 4 rules, matched on address and port. Network rules are terminating: a match ends evaluation and the application rules never run."
                : "Layer 7 rules, matched on hostname. Only reached when no network rule matched first."
          }
        />

        {relevant.length === 0 && (
          <p className="rounded border border-line p-4 text-xs text-muted">
            No {ruleType.toLowerCase()} rule collections yet.
          </p>
        )}

        {relevant.map((collection) => (
          <section key={collection.name} className="mb-4 rounded border border-line">
            <header className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2/40 px-3 py-2">
              <span className="font-mono text-xs font-medium">{collection.name}</span>
              <span className="text-[11px] text-muted">
                Priority {collection.priority} · {collection.groupName}
              </span>
              <span
                className={`ml-auto rounded px-1.5 py-0.5 text-[11px] ${
                  collection.action === "Deny" ? "bg-bad-soft text-bad" : "bg-ok-soft text-ok"
                }`}
              >
                {collection.type === "DNAT" ? "DNAT" : collection.action}
              </span>
            </header>

            <div className="overflow-x-auto">
              {collection.type === "DNAT" && (
                <DnatTable rules={collection.dnatRules ?? []} />
              )}
              {collection.type === "Network" && (
                <NetworkTable rules={collection.networkRules ?? []} />
              )}
              {collection.type === "Application" && (
                <ApplicationTable rules={collection.applicationRules ?? []} />
              )}
            </div>
          </section>
        ))}

        {ruleType === "Application" && (
          <LabNote>
            <p>
              Application rules carry their own protocol and port pair (
              <code className="font-mono">http:80</code>,{" "}
              <code className="font-mono">https:443</code>) rather than a separate ports column, and
              they match on <strong>hostname</strong>. Traffic with no hostname can never be allowed
              by one.
            </p>
          </LabNote>
        )}
      </div>
    );
  }

  /* ------------------------------------------------- collections listing */

  const ordered = evaluationOrder(collections);

  return (
    <div>
      <BladeHeader
        title="Rule collections"
        description="Listed in the order the firewall evaluates them, which is by rule type first — DNAT, then network, then application — and only then by priority."
        actions={
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="btn-secondary py-1 text-xs"
          >
            {adding ? "Cancel" : "+ Add a rule collection"}
          </button>
        }
      />

      {adding && (
        <div className="mb-4 rounded border border-line p-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <label className="text-xs">
              <span className="mb-1 block font-medium">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field py-1 text-xs"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-medium">Rule collection type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RuleType)}
                className="field py-1 text-xs"
              >
                <option>DNAT</option>
                <option>Network</option>
                <option>Application</option>
              </select>
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-medium">Priority</span>
              <input
                type="number"
                min={100}
                max={65000}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="field py-1 text-xs"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-medium">Rule collection action</span>
              <select
                value={type === "DNAT" ? "Allow" : action}
                disabled={type === "DNAT"}
                onChange={(e) => setAction(e.target.value as FirewallAction)}
                className="field py-1 text-xs disabled:opacity-50"
              >
                <option>Allow</option>
                <option>Deny</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Rule collection group: <span className="font-mono">{GROUPS[type].name}</span> (priority{" "}
            {GROUPS[type].priority}).
            {type === "DNAT" && " DNAT collections are always Allow."}
          </p>
          {error && <p className="mt-2 text-xs text-bad">{error}</p>}
          <button type="button" onClick={addCollection} className="btn-primary mt-3 py-1 text-xs">
            Add
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-line">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-surface-2/50 uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">Rules</th>
              <th className="px-3 py-2 font-medium">Rule collection group</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((c, i) => {
              const count =
                (c.dnatRules?.length ?? 0) +
                (c.networkRules?.length ?? 0) +
                (c.applicationRules?.length ?? 0);
              return (
                <tr key={c.name} className="border-b border-line last:border-0">
                  <td className="px-3 py-2">
                    <span className="mr-2 text-muted">{i + 1}</span>
                    <span className="font-mono font-medium">{c.name}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 ${typeTone[c.type]}`}>{c.type}</span>
                  </td>
                  <td className="px-3 py-2">{c.priority}</td>
                  <td className={`px-3 py-2 ${c.action === "Deny" ? "text-bad" : "text-ok"}`}>
                    {c.type === "DNAT" ? "DNAT" : c.action}
                  </td>
                  <td className="px-3 py-2">{count}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted">{c.groupName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <LabNote>
        <p>
          The numbers in the first column are <strong>evaluation order</strong>, not priority. Sort
          the table by priority and it tells you nothing useful, because an application collection
          at priority 100 is still evaluated after every network collection — even one at 65000.
        </p>
      </LabNote>
    </div>
  );
}

/* ------------------------------------------------------------ rule tables */

function DnatTable({ rules }: { rules: DnatRule[] }) {
  return (
    <table className="w-full text-left text-xs">
      <thead className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
        <tr>
          <th className="px-3 py-1.5 font-medium">Name</th>
          <th className="px-3 py-1.5 font-medium">Source</th>
          <th className="px-3 py-1.5 font-medium">Protocol</th>
          <th className="px-3 py-1.5 font-medium">Destination</th>
          <th className="px-3 py-1.5 font-medium">Destination ports</th>
          <th className="px-3 py-1.5 font-medium">Translated address</th>
          <th className="px-3 py-1.5 font-medium">Translated port</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((r) => (
          <tr key={r.name} className="border-b border-line last:border-0">
            <td className="px-3 py-1.5 font-mono">{r.name}</td>
            <td className="px-3 py-1.5 font-mono">{r.sourceAddresses}</td>
            <td className="px-3 py-1.5">{r.protocols.join(", ")}</td>
            <td className="px-3 py-1.5 font-mono">{r.destinationAddresses}</td>
            <td className="px-3 py-1.5 font-mono">{r.destinationPorts}</td>
            <td className="px-3 py-1.5 font-mono">{r.translatedAddress}</td>
            <td className="px-3 py-1.5 font-mono">{r.translatedPort}</td>
          </tr>
        ))}
        {rules.length === 0 && <EmptyRow cols={7} />}
      </tbody>
    </table>
  );
}

function NetworkTable({ rules }: { rules: NetworkRule[] }) {
  return (
    <table className="w-full text-left text-xs">
      <thead className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
        <tr>
          <th className="px-3 py-1.5 font-medium">Name</th>
          <th className="px-3 py-1.5 font-medium">Source</th>
          <th className="px-3 py-1.5 font-medium">Protocol</th>
          <th className="px-3 py-1.5 font-medium">Destination</th>
          <th className="px-3 py-1.5 font-medium">Destination ports</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((r) => (
          <tr key={r.name} className="border-b border-line last:border-0">
            <td className="px-3 py-1.5">
              <span className="font-mono">{r.name}</span>
              {r.description && <span className="block text-muted">{r.description}</span>}
            </td>
            <td className="px-3 py-1.5 font-mono">{r.sourceAddresses}</td>
            <td className="px-3 py-1.5">{r.protocols.join(", ")}</td>
            <td className="px-3 py-1.5 font-mono">{r.destinationAddresses}</td>
            <td className="px-3 py-1.5 font-mono">{r.destinationPorts}</td>
          </tr>
        ))}
        {rules.length === 0 && <EmptyRow cols={5} />}
      </tbody>
    </table>
  );
}

function ApplicationTable({ rules }: { rules: ApplicationRule[] }) {
  return (
    <table className="w-full text-left text-xs">
      <thead className="border-b border-line text-[11px] uppercase tracking-wide text-muted">
        <tr>
          <th className="px-3 py-1.5 font-medium">Name</th>
          <th className="px-3 py-1.5 font-medium">Source</th>
          <th className="px-3 py-1.5 font-medium">Protocol</th>
          <th className="px-3 py-1.5 font-medium">Destination type</th>
          <th className="px-3 py-1.5 font-medium">Destination</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((r) => (
          <tr key={r.name} className="border-b border-line last:border-0">
            <td className="px-3 py-1.5 font-mono">{r.name}</td>
            <td className="px-3 py-1.5 font-mono">{r.sourceAddresses}</td>
            <td className="px-3 py-1.5">
              {r.protocols.map((p) => `${p.type}:${p.port}`).join(", ")}
            </td>
            <td className="px-3 py-1.5 text-muted">FQDN</td>
            <td className="px-3 py-1.5 font-mono">{r.targetFqdns.join(", ")}</td>
          </tr>
        ))}
        {rules.length === 0 && <EmptyRow cols={5} />}
      </tbody>
    </table>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-3 py-3 text-center text-muted">
        No rules in this collection.
      </td>
    </tr>
  );
}

export type { FirewallProtocol };
