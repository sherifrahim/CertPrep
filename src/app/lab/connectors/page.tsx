import { ConnectorsConsole } from "@/components/lab/connectors-console";

export const metadata = {
  title: "Data connectors",
  description:
    "Connect sources, see which tables they populate, and watch which analytics rules stop being able to fire.",
};

export default function ConnectorsPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Microsoft Sentinel · Configuration
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Data connectors</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          A connector is what puts rows in a table. Turn one off and nothing errors — the table just
          goes empty, and every hunting query and analytics rule reading it returns nothing while
          still reporting itself healthy. Detection coverage is a function of ingestion, and this is
          the blade that shows it.
        </p>
      </div>
      <ConnectorsConsole />
    </div>
  );
}
