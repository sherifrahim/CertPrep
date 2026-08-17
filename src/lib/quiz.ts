import { YES_NO_OPTIONS, type Exam, type Question } from "@/content/types";

/** Fisher-Yates using a seeded PRNG so a given attempt id always rebuilds the same paper. */
export function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let state = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function seedFrom(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function isCorrect(question: Question, selected: string[]): boolean {
  // Sequence questions are only right when every step is in the right place.
  if (question.type === "ordering") {
    return (
      selected.length === question.correct.length &&
      question.correct.every((id, i) => selected[i] === id)
    );
  }
  if (selected.length !== question.correct.length) return false;
  const chosen = new Set(selected);
  return question.correct.every((id) => chosen.has(id));
}

/** The choices a learner picks between, whatever the underlying format. */
export function optionsFor(question: Question): { id: string; text: string }[] {
  if (question.type === "meets-goal") return YES_NO_OPTIONS;
  return question.options ?? [];
}

export function scoreOf(correctCount: number, total: number): number {
  return total === 0 ? 0 : Math.round((correctCount / total) * 100);
}

/**
 * Questions usable outside a case study. Case study items depend on a scenario
 * that only the case study runner shows, so they never enter these pools.
 */
export function standaloneQuestions(exam: Exam): Question[] {
  return exam.questions.filter((q) => !q.caseStudyId);
}

export function pickPracticeQuestions(
  exam: Exam,
  domainIds: string[],
  count: number,
  seed: number,
): Question[] {
  const available = standaloneQuestions(exam);
  const pool = domainIds.length
    ? available.filter((q) => domainIds.includes(q.domainId))
    : available;
  return shuffle(pool, seed).slice(0, count);
}

/**
 * Builds a mock paper whose domain mix mirrors the official skills-measured
 * weights, falling back to whatever questions exist when a domain is short.
 */
export function buildMockPaper(exam: Exam, seed: number): Question[] {
  const target = exam.mock.questionCount;
  const totalWeight = exam.domains.reduce((sum, d) => sum + d.weightValue, 0);
  const available = standaloneQuestions(exam);
  const picked: Question[] = [];
  const used = new Set<string>();

  for (const domain of exam.domains) {
    const quota = Math.round((domain.weightValue / totalWeight) * target);
    const pool = shuffle(
      available.filter((q) => q.domainId === domain.id),
      seed + seedFrom(domain.id),
    );
    for (const question of pool.slice(0, quota)) {
      picked.push(question);
      used.add(question.id);
    }
  }

  const filler = shuffle(
    available.filter((q) => !used.has(q.id)),
    seed,
  );
  for (const question of filler) {
    if (picked.length >= target) break;
    picked.push(question);
  }

  return shuffle(picked, seed).slice(0, target);
}
