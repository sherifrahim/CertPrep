import { auth } from "@/auth";
import { exams, getExam } from "@/content";
import type { Flashcard } from "@/content/types";
import { prisma } from "@/lib/prisma";

/** Days a card waits before its next review, indexed by Leitner box (1–5). */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35];

export type ReviewQueue = {
  /** Reviewed before and now due. */
  due: Flashcard[];
  /** Never reviewed, so always available to study. */
  fresh: Flashcard[];
  /** Reviewed and not yet due. */
  scheduledCount: number;
  /** When the earliest not-yet-due card becomes available. */
  nextDueAt: Date | null;
  /** Cards sitting in box 5 — known well. */
  masteredCount: number;
  signedIn: boolean;
};

/**
 * Splits an exam's deck into what should be studied now versus later.
 * Signed-out visitors get every card as `fresh` because there is nothing to
 * schedule against.
 */
export async function getReviewQueue(examId: string): Promise<ReviewQueue> {
  const cards = getExam(examId)?.flashcards ?? [];
  const userId = (await auth())?.user?.id;

  if (!userId) {
    return {
      due: [],
      fresh: cards,
      scheduledCount: 0,
      nextDueAt: null,
      masteredCount: 0,
      signedIn: false,
    };
  }

  const progress = await prisma.cardProgress.findMany({
    where: { userId, examId },
    select: { cardId: true, dueAt: true, box: true },
  });

  const byCardId = new Map(progress.map((p) => [p.cardId, p]));
  const now = new Date();

  const due: Flashcard[] = [];
  const fresh: Flashcard[] = [];
  let scheduledCount = 0;
  let masteredCount = 0;
  let nextDueAt: Date | null = null;

  for (const card of cards) {
    const seen = byCardId.get(card.id);
    if (!seen) {
      fresh.push(card);
      continue;
    }
    if (seen.box >= 5) masteredCount++;
    if (seen.dueAt <= now) {
      due.push(card);
    } else {
      scheduledCount++;
      if (!nextDueAt || seen.dueAt < nextDueAt) nextDueAt = seen.dueAt;
    }
  }

  return { due, fresh, scheduledCount, nextDueAt, masteredCount, signedIn: true };
}

export type ExamDueSummary = {
  examId: string;
  code: string;
  due: number;
  fresh: number;
  scheduled: number;
  mastered: number;
  total: number;
};

/** Per-exam review counts for the dashboard. Returns [] when signed out. */
export async function getDueSummary(): Promise<ExamDueSummary[]> {
  const userId = (await auth())?.user?.id;
  if (!userId) return [];

  const progress = await prisma.cardProgress.findMany({
    where: { userId },
    select: { examId: true, cardId: true, dueAt: true, box: true },
  });

  const now = new Date();

  return exams.map((exam) => {
    const rows = progress.filter((p) => p.examId === exam.id);
    const seen = new Set(rows.map((r) => r.cardId));
    return {
      examId: exam.id,
      code: exam.code,
      due: rows.filter((r) => r.dueAt <= now).length,
      fresh: exam.flashcards.filter((c) => !seen.has(c.id)).length,
      scheduled: rows.filter((r) => r.dueAt > now).length,
      mastered: rows.filter((r) => r.box >= 5).length,
      total: exam.flashcards.length,
    };
  });
}

/** "in 3 days", "tomorrow", "in 4 hours" — for telling users when to come back. */
export function formatWhen(date: Date): string {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return "now";
  const hours = Math.round(ms / 3_600_000);
  if (hours < 1) return "in under an hour";
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}
