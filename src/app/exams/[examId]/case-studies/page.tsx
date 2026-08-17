import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/content";

export const metadata = { title: "Case studies" };

export default async function CaseStudiesPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = getExam(examId);
  if (!exam) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Case studies</h1>
      <p className="mt-2 max-w-2xl text-muted">
        A long scenario with several linked questions, the way the real exam presents them. The
        background stays on screen while you answer, and these questions are kept out of practice and
        mock papers because they make no sense without it.
      </p>

      {exam.caseStudies.length === 0 ? (
        <p className="card mt-6 p-6 text-sm text-muted">No case studies for this exam yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {exam.caseStudies.map((study) => {
            const count = exam.questions.filter((q) => q.caseStudyId === study.id).length;
            return (
              <li key={study.id} className="card p-6">
                <h2 className="font-semibold">{study.title}</h2>
                <p className="mt-2 text-sm text-muted">{study.summary}</p>
                <p className="mt-3 text-xs text-muted">
                  {count} question{count === 1 ? "" : "s"} · {study.sections.length} background
                  sections
                </p>
                <Link
                  href={`/exams/${exam.id}/case-studies/${study.id}`}
                  className="btn-primary mt-4"
                >
                  Start case study
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
