import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/content";
import { MockRunner, type MockQuestion } from "@/components/quiz/mock-runner";
import { MockResumeBanner } from "@/components/quiz/mock-resume-banner";
import { buildMockPaper, randomiseAll, seedFrom } from "@/lib/quiz";

export const metadata = { title: "Mock exam" };

export default async function MockPage({
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

  const domainNames = Object.fromEntries(exam.domains.map((d) => [d.id, d.name]));

  // Resuming reuses the paper saved in the browser, so the server does not
  // build a new one — the runner swaps in the stored questions on hydration.
  if (query.resume === "1") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <MockRunner
          examId={exam.id}
          questions={[]}
          domainNames={domainNames}
          durationMin={exam.mock.durationMin}
          passPercent={exam.mock.passPercent}
          retryHref={`/exams/${exam.id}/mock?start=1`}
          resume
        />
      </div>
    );
  }

  if (query.start === "1") {
    const seed = seedFrom(`${examId}-mock-${Date.now()}`);
    const paper = randomiseAll(buildMockPaper(exam, seed), seed);
    // Strip every trace of the answer key: no `correct`, no per-statement flags,
    // and steps reordered so their array position is not the sequence.
    const stripped: MockQuestion[] = paper.map((q) => ({
      id: q.id,
      domainId: q.domainId,
      type: q.type,
      prompt: q.prompt,
      difficulty: q.difficulty,
      ...(q.scenario ? { scenario: q.scenario } : {}),
      ...(q.options ? { options: q.options } : {}),
      ...(q.statements
        ? { statements: q.statements.map(({ id, text }) => ({ id, text })) }
        : {}),
      ...(q.steps ? { steps: q.steps } : {}),
    }));

    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <MockRunner
          examId={exam.id}
          questions={stripped}
          domainNames={domainNames}
          durationMin={exam.mock.durationMin}
          passPercent={exam.mock.passPercent}
          retryHref={`/exams/${exam.id}/mock?start=1`}
        />
      </div>
    );
  }

  const totalWeight = exam.domains.reduce((sum, d) => sum + d.weightValue, 0);
  const paperSize = Math.min(exam.mock.questionCount, exam.questions.length);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <MockResumeBanner examId={exam.id} />
      <h1 className="text-2xl font-semibold tracking-tight">Mock exam</h1>
      <p className="mt-2 text-muted">
        A timed paper that mirrors the real exam: no feedback until you submit, a countdown you
        cannot pause, and a domain mix weighted to the official objectives.
      </p>

      <div className="card mt-6 p-6">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">Questions</dt>
            <dd className="mt-1 text-2xl font-semibold">{paperSize}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Time limit</dt>
            <dd className="mt-1 text-2xl font-semibold">{exam.mock.durationMin} min</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Pass mark</dt>
            <dd className="mt-1 text-2xl font-semibold">{exam.mock.passPercent}%</dd>
          </div>
        </dl>

        <h2 className="mt-8 text-sm font-medium">Domain mix</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {exam.domains.map((domain) => (
            <li key={domain.id} className="flex items-baseline justify-between gap-3">
              <span className="text-muted">{domain.name}</span>
              <span className="shrink-0 font-medium">
                ~{Math.round((domain.weightValue / totalWeight) * paperSize)} questions
              </span>
            </li>
          ))}
        </ul>

        {exam.questions.length < exam.mock.questionCount && (
          <p className="mt-6 rounded-lg border border-line bg-warn-soft p-3 text-sm text-warn">
            The question bank currently holds {exam.questions.length} questions, so this paper will
            be {paperSize} questions rather than the full {exam.mock.questionCount}.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={`/exams/${exam.id}/mock?start=1`} className="btn-primary">
            Start timed exam
          </Link>
          <Link href={`/exams/${exam.id}/practice`} className="btn-secondary">
            Practice instead
          </Link>
        </div>
      </div>
    </div>
  );
}
