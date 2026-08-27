import { FirewallConsole } from "@/components/lab/firewall-console";

export const metadata = {
  title: "Azure Firewall",
  description:
    "Rule collections, DNAT and threat intelligence — send a packet through a firewall policy and see which rule decided it, and why type order beats priority.",
};

export default function FirewallPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Azure</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Azure Firewall</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Send a packet through the policy and watch every step of the decision. The rule worth
          finding here is that a broad network rule quietly disables the FQDN allow-list you thought
          you had, because network rules are processed — and terminate — before application rules
          whatever the priorities say.
        </p>
      </div>
      <FirewallConsole />
    </div>
  );
}
