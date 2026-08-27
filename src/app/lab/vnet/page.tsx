import { VnetConsole } from "@/components/lab/vnet-console";
import { NETWORKS } from "@/lab/vnet";

export const metadata = {
  title: "Virtual networks",
  description:
    "Subnets, peering, private endpoints and effective routes — trace a destination and see which route carries it, and why.",
};

export default function VnetPage() {
  const subnets = NETWORKS.reduce((n, v) => n + v.subnets.length, 0);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Azure</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Virtual networks</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          A hub and two spokes, {subnets} subnets. Trace a destination to see which of the effective
          routes carries it — longest prefix first, and only then the route&rsquo;s source. The two
          spokes cannot reach each other, and finding out why is the exercise.
        </p>
      </div>
      <VnetConsole />
    </div>
  );
}
