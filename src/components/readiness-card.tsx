import Link from "next/link";
import type { Readiness } from "@/lib/readiness";

const tone: Record<Readiness["verdict"], { bar: string; text: string; chip: string }> = {
  ready: { bar: "var(--ok)", text: "text-ok", chip: "bg-ok-soft text-ok" },
  borderline: { bar: "var(--warn)", text: "text-warn", chip: "bg-warn-soft text-warn" },
  "not-ready": { bar: "var(--bad)", text: "text-bad", chip: "bg-bad-soft text-bad" },
  "no-data": { bar: "var(--muted)", text: "text-muted", chip: "bg-surface-2 text-muted" },
};

export function ReadinessCard({
  examId,
  code,
  readiness,
  passPercent,
}: {
  examId: string;
  code: string;
  readiness: Readiness;
  passPercent: number;
}) {
  const t = tone[readiness.verdict];

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">
          {code}{" "}
          <span className={`ml-1 rounded-md px-2 py-0.5 text-xs font-medium ${t.chip}`}>
            {readiness.headline}
          </span>
        </h3>
        <p className="text-sm text-muted">{readiness.answered} questions answered</p>
      </div>

      {readiness.score !== null ? (
        <>
          <p className={`mt-3 text-4xl font-semibold ${t.text}`}>{readiness.score}%</p>
          <div
            className="relative mt-2 h-2 overflow-hidden rounded-full"
            style={{ background: "var(--surface-2)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${readiness.score}%`, background: t.bar }}
            />
            {/* Pass mark, so the number has a reference point. */}
            <span
              className="absolute top-0 h-full w-px bg-ink/50"
              style={{ left: `${passPercent}%` }}
              aria-hidden
            />
          </div>
          <p className="mt-1 text-xs text-muted">Pass mark {passPercent}%</p>
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">{readiness.detail}</p>
      )}

      {readiness.score !== null && <p className="mt-3 text-sm text-muted">{readiness.detail}</p>}

      {readiness.domains.some((d) => d.accuracy !== null) && (
        <ul className="mt-4 space-y-2">
          {readiness.domains.map((d) => (
            <li key={d.domainId}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate" title={d.name}>
                  {d.name}
                </span>
                <span className="shrink-0 text-muted">
                  {d.accuracy === null ? (
                    "no data"
                  ) : (
                    <>
                      {d.accuracy}%{!d.confident && <span title="Thin evidence"> ·&nbsp;thin</span>}
                    </>
                  )}
                </span>
              </div>
              <div
                className="mt-1 h-1 overflow-hidden rounded-full"
                style={{ background: "var(--surface-2)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${d.accuracy ?? 0}%`,
                    background:
                      d.accuracy === null
                        ? "var(--surface-2)"
                        : d.accuracy >= passPercent
                          ? "var(--ok)"
                          : "var(--bad)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {readiness.weakest && (
          <Link
            href={`/exams/${examId}/practice?domain=${readiness.weakest.domainId}&count=10&start=1`}
            className="btn-primary text-xs"
          >
            Drill weakest area
          </Link>
        )}
        {readiness.unevidenced.length > 0 && (
          <Link
            href={`/exams/${examId}/practice?domain=${readiness.unevidenced[0].domainId}&count=10&start=1`}
            className="btn-secondary text-xs"
          >
            Cover the gap
          </Link>
        )}
        <Link href={`/exams/${examId}/mock`} className="btn-ghost text-xs">
          Take a mock
        </Link>
      </div>
    </article>
  );
}
