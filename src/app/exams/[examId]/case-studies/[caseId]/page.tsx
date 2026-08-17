import { notFound } from "next/navigation";
import { getExam } from "@/content";
import { PracticeRunner } from "@/components/quiz/practice-runner";

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

  // Case study questions are answered in their authored order, not shuffled —
  // they build on each other the way the real exam presents them.
  const questions = exam.questions.filter((q) => q.caseStudyId === caseId);
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
