import Link from "next/link";
import { notFound } from "next/navigation";
import { exams, getExam } from "@/content";

export function generateStaticParams() {
  return exams.map((exam) => ({ examId: exam.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ examId: string }> }) {
  const exam = getExam((await params).examId);
  if (!exam) return {};
  const title = `${exam.code} — ${exam.title}`;
  return {
    title,
    description: exam.description,
    openGraph: { title, description: exam.description, type: "article" },
    twitter: { card: "summary_large_image", title, description: exam.description },
  };
}

export default async function ExamOverviewPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = getExam(examId);
  if (!exam) notFound();

  const retiresOn = exam.retiresOn ? new Date(exam.retiresOn) : null;
  const successor = exam.replacedBy ? getExam(exam.replacedBy) : undefined;
  const daysLeft = retiresOn
    ? Math.ceil((retiresOn.getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {retiresOn && daysLeft !== null && daysLeft > 0 && (
        <div className="mb-6 rounded-xl border border-line bg-warn-soft p-4">
          <p className="text-sm font-medium text-warn">
            This exam retires on{" "}
            {retiresOn.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            — {daysLeft} {daysLeft === 1 ? "day" : "days"} away.
          </p>
          <p className="mt-1 text-sm text-muted">
            {successor ? (
              <>
                {successor.code} ({successor.title}) supersedes it.{" "}
                <Link href={`/exams/${successor.id}`} className="underline">
                  Study {successor.code} instead
                </Link>
                , or check the{" "}
                <a href={exam.officialUrl} className="underline" target="_blank" rel="noreferrer">
                  official exam page
                </a>
                .
              </>
            ) : (
              <>
                Check the{" "}
                <a href={exam.officialUrl} className="underline" target="_blank" rel="noreferrer">
                  official exam page
                </a>{" "}
                for the replacement certification path before booking.
              </>
            )}
          </p>
        </div>
      )}

      <header>
        <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent-text">
          {exam.code}
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{exam.title}</h1>
        <p className="mt-3 max-w-3xl text-muted">{exam.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="chip">
            Skills measured as of{" "}
            {new Date(exam.skillsMeasuredAsOf).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="chip">
            Mock: {exam.mock.questionCount} questions · {exam.mock.durationMin} min ·{" "}
            {exam.mock.passPercent}% to pass
          </span>
          <a href={exam.studyGuideUrl} target="_blank" rel="noreferrer" className="chip hover:text-ink">
            Official study guide ↗
          </a>
        </div>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: `/exams/${exam.id}/practice`, title: "Practice quiz", body: `${exam.questions.length} questions with explanations` },
          { href: `/exams/${exam.id}/flashcards`, title: "Flashcards", body: `${exam.flashcards.length} cards, spaced repetition` },
          { href: `/exams/${exam.id}/case-studies`, title: "Case studies", body: `${exam.caseStudies.length} linked scenario${exam.caseStudies.length === 1 ? "" : "s"}` },
          { href: `/exams/${exam.id}/mock`, title: "Mock exam", body: `${exam.mock.durationMin}-minute timed paper` },
          { href: `/exams/${exam.id}/practice?mode=missed`, title: "Wrong-answer drill", body: "Re-attempt what you missed" },
          { href: `/exams/${exam.id}/resources`, title: "Resources", body: `${exam.resources.length} free links` },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card p-4 transition-shadow hover:shadow-md">
            <h2 className="font-medium">{item.title}</h2>
            <p className="mt-1 text-sm text-muted">{item.body}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Skills measured</h2>
        <p className="mt-1 text-sm text-muted">
          Weights come from the official Microsoft Learn study guide and drive the domain mix in mock
          exams.
        </p>

        <div className="mt-5 space-y-4">
          {exam.domains.map((domain) => (
            <article key={domain.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium">{domain.name}</h3>
                <span className="text-sm font-semibold text-accent-text">{domain.weight}</span>
              </div>
              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "var(--surface-2)" }}
                aria-hidden
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${domain.weightValue}%`, background: "var(--accent)" }}
                />
              </div>
              <p className="mt-3 text-sm text-muted">{domain.summary}</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-accent-text">
                  {domain.objectives.length} objectives
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                  {domain.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              </details>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/exams/${exam.id}/practice?domain=${domain.id}`}
                  className="btn-secondary text-xs"
                >
                  Practice this area
                </Link>
                <Link
                  href={`/exams/${exam.id}/flashcards?domain=${domain.id}`}
                  className="btn-ghost text-xs"
                >
                  Flashcards
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
