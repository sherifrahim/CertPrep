import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/content";
import { PracticeRunner } from "@/components/quiz/practice-runner";
import { pickPracticeQuestions, seedFrom, shuffle, standaloneQuestions } from "@/lib/quiz";
import { getDrillSet } from "@/lib/drill";

export const metadata = { title: "Practice quiz" };

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { examId } = await params;
  const query = await searchParams;
  const exam = getExam(examId);
  if (!exam) notFound();

  const validDomainIds = new Set(exam.domains.map((d) => d.id));
  const selectedDomains = toArray(query.domain).filter((id) => validDomainIds.has(id));
  const requestedCount = Number(query.count);
  const domainNames = Object.fromEntries(exam.domains.map((d) => [d.id, d.name]));

  // Drill mode re-asks only the questions you last got wrong.
  if (query.mode === "missed") {
    const drill = await getDrillSet(examId);
    const questions = shuffle(drill.questions, seedFrom(`${examId}-drill-${Date.now()}`));

    if (!drill.signedIn) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="card p-6 text-sm text-muted">
            <p className="font-medium text-ink">Sign in to drill your mistakes</p>
            <p className="mt-2">
              The drill is built from questions you previously answered incorrectly, so it needs your
              attempt history.
            </p>
            <Link href="/signin" className="btn-primary mt-4">
              Sign in
            </Link>
          </div>
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="card p-6 text-sm text-muted">
            <p className="font-medium text-ink">Nothing to drill</p>
            <p className="mt-2">
              You have no outstanding wrong answers for {exam.code}. Questions appear here when your
              most recent answer was incorrect, and leave once you get them right.
            </p>
            <Link href={`/exams/${examId}/practice`} className="btn-primary mt-4">
              Practice instead
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">Wrong-answer drill</h1>
          <p className="mt-1 text-sm text-muted">
            {questions.length} question{questions.length === 1 ? "" : "s"} you last answered
            incorrectly. Getting one right removes it from the drill.
          </p>
        </div>
        <PracticeRunner
          examId={exam.id}
          questions={questions}
          domainNames={domainNames}
          passPercent={exam.mock.passPercent}
          retryHref={`/exams/${exam.id}/practice?mode=missed&r=${Date.now()}`}
        />
      </div>
    );
  }

  if (query.start === "1") {
    const count = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 10;
    const questions = pickPracticeQuestions(
      exam,
      selectedDomains,
      count,
      seedFrom(`${examId}-${Date.now()}`),
    );

    if (questions.length === 0) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="card p-6 text-sm text-muted">
            No questions match that selection yet.{" "}
            <Link href={`/exams/${examId}/practice`} className="text-accent-text underline">
              Change the filters
            </Link>
            .
          </p>
        </div>
      );
    }

    const retryParams = new URLSearchParams();
    selectedDomains.forEach((d) => retryParams.append("domain", d));
    retryParams.set("count", String(count));
    retryParams.set("start", "1");

    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PracticeRunner
          examId={exam.id}
          questions={questions}
          domainNames={domainNames}
          passPercent={exam.mock.passPercent}
          retryHref={`/exams/${exam.id}/practice?${retryParams.toString()}`}
        />
      </div>
    );
  }

  // Counts reflect the pool practice actually draws from, which excludes case studies.
  const pool = standaloneQuestions(exam);
  const availableCounts = [5, 10, 20, 40, pool.length].filter(
    (n, i, arr) => n <= pool.length && arr.indexOf(n) === i,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Practice quiz</h1>
      <p className="mt-2 text-muted">
        Answer at your own pace. Each question shows the explanation and a documentation link as soon
        as you check it.
      </p>

      <form method="get" className="card mt-6 p-6">
        <input type="hidden" name="start" value="1" />

        <fieldset>
          <legend className="text-sm font-medium">Skill areas</legend>
          <p className="mt-1 text-sm text-muted">Leave all unchecked to draw from every area.</p>
          <div className="mt-3 space-y-2">
            {exam.domains.map((domain) => {
              const count = pool.filter((q) => q.domainId === domain.id).length;
              return (
                <label
                  key={domain.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-line p-3 text-sm hover:bg-surface-2"
                >
                  <input
                    type="checkbox"
                    name="domain"
                    value={domain.id}
                    defaultChecked={selectedDomains.includes(domain.id)}
                    className="accent-[var(--accent)]"
                  />
                  <span className="flex-1">{domain.name}</span>
                  <span className="text-xs text-muted">{count} questions</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor="count" className="text-sm font-medium">
            Number of questions
          </label>
          <select id="count" name="count" defaultValue={10} className="field mt-2">
            {availableCounts.map((n) => (
              <option key={n} value={n}>
                {n} questions
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary mt-6">
          Start practice
        </button>
      </form>
    </div>
  );
}
