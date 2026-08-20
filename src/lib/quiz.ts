import { YES_NO_OPTIONS, type Exam, type Question } from "@/content/types";

/**
 * Seeded PRNG (mulberry32).
 *
 * The previous implementation was a linear congruential generator read as
 * `state % (i + 1)`. An LCG with a power-of-two modulus has extremely short
 * periods in its low bits — `state % 4` cycles 0,3,2,1 forever — so the
 * "shuffle" was close to deterministic. mulberry32 avalanches the bits before
 * they are used, so every position is equally likely.
 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates using a seeded PRNG so a given attempt id always rebuilds the same paper. */
export function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  const next = rng(seed || 1);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
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

/**
 * Randomises answer positions so the key is never predictable.
 *
 * Content was authored with the correct answer overwhelmingly first, which let
 * a learner score well by always picking the first option. Grading compares
 * option *ids*, never positions, so reordering here is safe and needs no
 * change to `correct`.
 *
 * Yes/No items keep their fixed order — "Yes" before "No" is part of the
 * question, not a choice to scramble.
 */
export function randomiseQuestion(question: Question, seed: number): Question {
  const next: Question = { ...question };

  if (
    (question.type === "single" || question.type === "multi") &&
    question.options &&
    question.options.length > 1
  ) {
    next.options = shuffle(question.options, seed + seedFrom(question.id));
  }

  if (question.type === "statements" && question.statements) {
    next.statements = shuffle(question.statements, seed + seedFrom(question.id + "s"));
  }

  if (question.type === "ordering" && question.steps && question.steps.length > 1) {
    // Steps are stored in the correct sequence, so they must never be shown that
    // way. A shuffle can legitimately land back on it, so reshuffle until it does
    // not — bounded, since any swap breaks the match.
    let steps = shuffle(question.steps, seed + seedFrom(question.id + "o"));
    for (let attempt = 1; attempt < 8; attempt++) {
      if (steps.map((s) => s.id).join() !== question.correct.join()) break;
      steps = shuffle(question.steps, seed + seedFrom(question.id + "o" + attempt));
    }
    next.steps = steps;
  }

  return next;
}

/** Applies `randomiseQuestion` across a set, keeping one seed per session. */
export function randomiseAll(questions: Question[], seed: number): Question[] {
  return questions.map((q) => randomiseQuestion(q, seed));
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
