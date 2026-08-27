import { WafConsole } from "@/components/lab/waf-console";

export const metadata = {
  title: "Web Application Firewall",
  description:
    "A WAF policy on Application Gateway — policy settings, managed rules with anomaly scoring, custom rules and exclusions.",
};

export default function WafPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Azure</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Web Application Firewall</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          A WAF policy attached to Application Gateway — a different resource from Azure Firewall,
          working at layer 7 on inbound traffic. Two things to find here: the policy ships in
          Detection mode and blocks nothing, and managed rules score rather than block, so one match
          is often not enough.
        </p>
      </div>
      <WafConsole />
    </div>
  );
}
