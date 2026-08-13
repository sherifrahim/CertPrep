"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { getExam } from "@/content";
import type { Question } from "@/content/types";
import { isCorrect, scoreOf } from "@/lib/quiz";
import { prisma } from "@/lib/prisma";

const submissionSchema = z.object({
  examId: z.string(),
  mode: z.enum(["PRACTICE", "MOCK"]),
  durationSec: z.number().int().min(0).max(60 * 60 * 12),
  responses: z
    .array(
      z.object({
        questionId: z.string(),
        selected: z.array(z.string()).max(10),
      }),
    )
    .min(1)
    .max(300),
});

export type GradedAnswer = {
  questionId: string;
  domainId: string;
  selected: string[];
  correct: string[];
  wasCorrect: boolean;
};

export type GradedResult = {
  attemptId: string | null;
  examId: string;
  mode: "PRACTICE" | "MOCK";
  totalCount: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
  durationSec: number;
  answers: GradedAnswer[];
  /** Full content for the attempted questions, returned only after grading. */
  questions: Question[];
  saved: boolean;
};

/**
 * Grades a submission on the server against the content files. The client only
 * ever sends which options were selected, so answer keys never reach the browser
 * before a question has been submitted.
 */
export async function submitAttempt(input: unknown): Promise<GradedResult> {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid submission");
  }

  const { examId, mode, durationSec, responses } = parsed.data;
  const exam = getExam(examId);
  if (!exam) throw new Error("Unknown exam");

  const answers: GradedAnswer[] = [];
  const attemptedQuestions: Question[] = [];
  for (const response of responses) {
    const question = exam.questions.find((q) => q.id === response.questionId);
    if (!question) continue;
    attemptedQuestions.push(question);
    answers.push({
      questionId: question.id,
      domainId: question.domainId,
      selected: response.selected,
      correct: question.correct,
      wasCorrect: isCorrect(question, response.selected),
    });
  }

  const totalCount = answers.length;
  const correctCount = answers.filter((a) => a.wasCorrect).length;
  const scorePercent = scoreOf(correctCount, totalCount);
  const passed = scorePercent >= exam.mock.passPercent;

  const session = await auth();
  const userId = session?.user?.id;

  let attemptId: string | null = null;
  if (userId) {
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        examId,
        mode,
        domainIds: [...new Set(answers.map((a) => a.domainId))],
        totalCount,
        correctCount,
        scorePercent,
        passed,
        durationSec,
        answers,
      },
      select: { id: true },
    });
    attemptId = attempt.id;
    revalidatePath("/dashboard");
  }

  return {
    attemptId,
    examId,
    mode,
    totalCount,
    correctCount,
    scorePercent,
    passed,
    durationSec,
    answers,
    questions: attemptedQuestions,
    saved: Boolean(userId),
  };
}

const cardReviewSchema = z.object({
  examId: z.string(),
  cardId: z.string(),
  remembered: z.boolean(),
});

const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35];

export async function recordCardReview(input: unknown): Promise<{ saved: boolean }> {
  const parsed = cardReviewSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid review");

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { saved: false };

  const { examId, cardId, remembered } = parsed.data;
  const existing = await prisma.cardProgress.findUnique({
    where: { userId_cardId: { userId, cardId } },
  });

  const currentBox = existing?.box ?? 1;
  const nextBox = remembered ? Math.min(currentBox + 1, 5) : 1;
  const dueAt = new Date(Date.now() + BOX_INTERVAL_DAYS[nextBox] * 86_400_000);

  await prisma.cardProgress.upsert({
    where: { userId_cardId: { userId, cardId } },
    create: {
      userId,
      examId,
      cardId,
      box: nextBox,
      timesSeen: 1,
      timesCorrect: remembered ? 1 : 0,
      dueAt,
    },
    update: {
      box: nextBox,
      timesSeen: { increment: 1 },
      timesCorrect: remembered ? { increment: 1 } : undefined,
      dueAt,
    },
  });

  return { saved: true };
}
