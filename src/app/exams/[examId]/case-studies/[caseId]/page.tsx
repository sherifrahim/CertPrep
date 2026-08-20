import { notFound } from "next/navigation";
import { getExam } from "@/content";
import { PracticeRunner } from "@/components/quiz/practice-runner";
import { randomiseAll, seedFrom } from "@/lib/quiz";

export const metadata = { title: "Case study" };

export default async function CaseStudyRunnerPage({
  params,
}: {
  params: Promise<{ examId: string; caseId: string }>;
}) {
  const { examId, caseId } = await params;
  const exam = getExam(examId);
  if (!exam) notFound();

  const caseStudy = exam.caseStudies.find((c) => c.id === caseId);
  if (!caseStudy) notFound();

  // Questions stay in authored order because they build on each other, but the
  // answer options within each are randomised.
  const questions = randomiseAll(
    exam.questions.filter((q) => q.caseStudyId === caseId),
    seedFrom(`${examId}-${caseId}-${Date.now()}`),
  );
  if (questions.length === 0) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PracticeRunner
        examId={exam.id}
        questions={questions}
        domainNames={Object.fromEntries(exam.domains.map((d) => [d.id, d.name]))}
        passPercent={exam.mock.passPercent}
        retryHref={`/exams/${exam.id}/case-studies/${caseId}`}
        caseStudy={caseStudy}
      />
    </div>
  );
}
