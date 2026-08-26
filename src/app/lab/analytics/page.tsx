import { AnalyticsConsole } from "@/components/lab/analytics-console";

export const metadata = {
  title: "Analytics rules",
  description: "Author Sentinel scheduled rules and see what they would have caught.",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Sentinel · Configuration
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Analytics rules</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Write the query, set the schedule, map the entities — then see what the rule would
          actually have caught in this environment. The warnings are the mistakes that quietly ruin
          a rule in production: a lookback shorter than the run interval loses events, an unmapped
          entity leaves alerts with nothing to pivot from, and one alert per row buries the queue.
        </p>
      </div>
      <AnalyticsConsole />
    </div>
  );
}
