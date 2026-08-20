import { az500 } from "./exams/az-500/index";
import { sc200 } from "./exams/sc-200/index";
import { sc401 } from "./exams/sc-401/index";
import { sc500 } from "./exams/sc-500/index";
import type { Exam, ExamId, Flashcard, Question } from "./types";

// SC-500 leads: it is the successor to AZ-500, which retires 2026-08-31.
export const exams: Exam[] = [sc500, sc401, sc200, az500];

const byId = new Map<string, Exam>(exams.map((exam) => [exam.id, exam]));

export function getExam(id: string): Exam | undefined {
  return byId.get(id);
}

export function isExamId(id: string): id is ExamId {
  return byId.has(id);
}

export function getQuestion(examId: string, questionId: string): Question | undefined {
  return getExam(examId)?.questions.find((q) => q.id === questionId);
}

export function getFlashcards(examId: string, domainId?: string): Flashcard[] {
  const cards = getExam(examId)?.flashcards ?? [];
  return domainId ? cards.filter((c) => c.domainId === domainId) : cards;
}

export function domainName(examId: string, domainId: string): string {
  return getExam(examId)?.domains.find((d) => d.id === domainId)?.name ?? domainId;
}

export type { Exam, ExamId, Question, Flashcard };
export type { Domain, Resource, StudyModule } from "./types";
