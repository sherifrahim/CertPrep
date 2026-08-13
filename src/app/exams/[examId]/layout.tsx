import { notFound } from "next/navigation";
import { getExam } from "@/content";
import { ExamNav } from "@/components/exam-nav";

export default async function ExamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = getExam(examId);
  if (!exam) notFound();

  return (
    <div data-accent={exam.accent}>
      <ExamNav examId={exam.id} code={exam.code} />
      {children}
    </div>
  );
}
