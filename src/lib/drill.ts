import { auth } from "@/auth";
import { exams, getExam } from "@/content";
import type { Question } from "@/content/types";
import type { GradedAnswer } from "@/lib/actions/progress-actions";
import { prisma } from "@/lib/prisma";
import { pickLatestWrong } from "@/lib/scheduling";

async function latestWrongIds(userId: string, examId?: string): Promise<Set<string>> {
  const attempts = await prisma.attempt.findMany({
    where: { userId, ...(examId ? { examId } : {}) },
    orderBy: { createdAt: "desc" },
    select: { answers: true },
    take: 200,
  });

  return pickLatestWrong(
    attempts.map((a) => ({ answers: a.answers as unknown as GradedAnswer[] })),
  );
}

export type DrillSet = {
  questions: Question[];
  signedIn: boolean;
};

/** Questions to re-attempt for one exam, newest mistakes included. */
export async function getDrillSet(examId: string): Promise<DrillSet> {
  const userId = (await auth())?.user?.id;
  if (!userId) return { questions: [], signedIn: false };

  const wrong = await latestWrongIds(userId, examId);
  const exam = getExam(examId);
  // Case study items are excluded — they need their scenario to be answerable.
  const questions = (exam?.questions ?? []).filter(
    (q) => wrong.has(q.id) && !q.caseStudyId,
  );

  return { questions, signedIn: true };
}

export type DrillSummary = { examId: string; code: string; count: number };

/** Per-exam drill counts for the dashboard. Returns [] when signed out. */
export async function getDrillSummary(): Promise<DrillSummary[]> {
  const userId = (await auth())?.user?.id;
  if (!userId) return [];

  const wrong = await latestWrongIds(userId);

  return exams.map((exam) => ({
    examId: exam.id,
    code: exam.code,
    count: exam.questions.filter((q) => wrong.has(q.id) && !q.caseStudyId).length,
  }));
}
