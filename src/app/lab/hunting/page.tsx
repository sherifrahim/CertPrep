import { HuntingConsole } from "@/components/lab/hunting-console";
import { tableRowCounts } from "@/lab/data";
import { TABLES } from "@/lab/schema";

export const metadata = {
  title: "Advanced hunting",
  description: "Run real KQL against a simulated Defender XDR and Sentinel environment.",
};

export default async function HuntingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { q } = await searchParams;
  const initialQuery = typeof q === "string" ? q : undefined;
  const counts = tableRowCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Practice lab</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Advanced hunting</h1>
          <p className="mt-1 text-sm text-muted">
            {TABLES.length} tables, {total.toLocaleString()} records. The queries you write here use
            the same KQL and the same table names as the real portal.
          </p>
        </div>
      </div>

      <HuntingConsole schema={TABLES} rowCounts={counts} initialQuery={initialQuery} />
    </div>
  );
}
