import { IncidentQueue } from "@/components/lab/incident-queue";
import { buildIncidents } from "@/lab/incidents";

export const metadata = {
  title: "Incidents & alerts",
  description: "Triage a simulated Defender XDR incident queue.",
};

export default function IncidentsPage() {
  const incidents = buildIncidents();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Defender XDR
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Incidents &amp; alerts</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Alerts correlated into cases by shared entities, as XDR does. Open the multi-stage
          incident and work it end to end — the evidence to prove or disprove it is all in the
          telemetry.
        </p>
      </div>
      <IncidentQueue incidents={incidents} />
    </div>
  );
}
