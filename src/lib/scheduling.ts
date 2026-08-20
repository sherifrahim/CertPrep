/**
 * Pure scheduling and drill-selection logic.
 *
 * Deliberately free of database and auth imports so it can be unit tested
 * directly; `review.ts` and `drill.ts` wrap these with persistence.
 */

/** Days a card waits before its next review, indexed by Leitner box (1–5). */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35];

/**
 * Leitner step. A remembered card moves up a box (capped at 5) and waits
 * longer; a missed card drops straight back to box 1 and returns tomorrow.
 */
export function nextSchedule(
  currentBox: number | undefined,
  remembered: boolean,
  now: number = Date.now(),
): { box: number; dueAt: Date } {
  const box = remembered ? Math.min((currentBox ?? 1) + 1, 5) : 1;
  return { box, dueAt: new Date(now + BOX_INTERVAL_DAYS[box] * 86_400_000) };
}

type OutcomeRow = { questionId: string; wasCorrect: boolean };

/**
 * Walks attempts newest-first and keeps only the most recent outcome per
 * question, so an item leaves the drill as soon as it is answered correctly
 * and returns if it is later missed again.
 *
 * @param attempts ordered newest first
 */
export function pickLatestWrong(attempts: { answers: OutcomeRow[] }[]): Set<string> {
  const decided = new Set<string>();
  const wrong = new Set<string>();

  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      if (decided.has(answer.questionId)) continue; // a newer attempt already decided
      decided.add(answer.questionId);
      if (!answer.wasCorrect) wrong.add(answer.questionId);
    }
  }

  return wrong;
}

/** "in 3 days", "tomorrow", "in 4 hours" — for telling users when to come back. */
export function formatWhen(date: Date, now: number = Date.now()): string {
  const ms = date.getTime() - now;
  if (ms <= 0) return "now";

  // Round only after the sub-hour check: rounding first turned 30 minutes into
  // "in 1 hour" and made "in under an hour" unreachable.
  const exactHours = ms / 3_600_000;
  if (exactHours < 1) return "in under an hour";

  const hours = Math.round(exactHours);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}
