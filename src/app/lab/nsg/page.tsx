import { NsgConsole } from "@/components/lab/nsg-console";

export const metadata = {
  title: "Network security groups",
  description: "Build NSG rules and test a flow against them to see which rule decides.",
};

export default function NsgPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Azure · Networking</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Network security groups</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Rules are evaluated in priority order, but only rules that match on direction, protocol,
          source, destination and port are considered at all. Change a flow and watch which rule
          actually decides it — that gap between &quot;lowest priority&quot; and &quot;lowest
          matching priority&quot; is what most people get wrong.
        </p>
      </div>
      <NsgConsole />
    </div>
  );
}
