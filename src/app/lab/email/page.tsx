import { EmailExplorer } from "@/components/lab/email-explorer";

export const metadata = {
  title: "Email Explorer",
  description:
    "Threat Explorer over the mail telemetry — views, the property filter bar, chart breakdowns, and the take-action wizard.",
};

export default function EmailPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR · Email &amp; collaboration
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Explorer</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Build a hunt the way the portal does: pick a view, add property filters, change the chart
          breakdown, then select messages and take action. The column worth understanding is{" "}
          <strong>latest delivery location</strong> — it is not the same as where the message was
          delivered, and confusing the two is how a remediation misses what is still reachable.
        </p>
      </div>
      <EmailExplorer />
    </div>
  );
}
