import type { Question } from "./types";

/**
 * Guards against the "longest option wins" giveaway. Learners pick up quickly that the key
 * is usually the most detailed choice, so distractors need comparable length and detail.
 * Shared by validate-content.ts and the content tests so both enforce the same rule.
 */

/** A single-answer key may not exceed the longest distractor by more than this factor. */
export const MAX_LENGTH_RATIO = 1.3;
/** ...and only counts when it is also this many characters longer, so one-word options aren't flagged. */
export const MIN_LENGTH_GAP = 12;
/** Across an exam, the key should be the longest option no more often than this... */
export const MAX_LONGEST_SHARE = 0.4;
/** ...and no less often than this: a key that is never the longest is just as much of a tell. */
export const MIN_LONGEST_SHARE = 0.15;
/** Across an exam, the mean key length over the mean distractor length may not exceed this. */
export const MAX_MEAN_RATIO = 1.15;

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export interface LengthProblem {
  id: string;
  ratio: number;
}

export interface LengthReport {
  /** Single-answer questions where the key is far longer than every distractor. */
  outliers: LengthProblem[];
  /** Share of single-answer questions where the key is strictly the longest option. */
  longestShare: number;
  /** Mean of (key length / mean distractor length) across single- and multi-answer questions. */
  meanRatio: number;
  single: number;
}

export function analyseAnswerLength(questions: Question[]): LengthReport {
  const outliers: LengthProblem[] = [];
  const ratios: number[] = [];
  let single = 0;
  let longest = 0;

  for (const q of questions) {
    if ((q.type !== "single" && q.type !== "multi") || !q.options) continue;
    const keys = q.options.filter((o) => q.correct.includes(o.id)).map((o) => o.text.length);
    const others = q.options.filter((o) => !q.correct.includes(o.id)).map((o) => o.text.length);
    if (keys.length === 0 || others.length === 0) continue;

    ratios.push(mean(keys) / mean(others));

    if (q.type === "single") {
      single++;
      const maxOther = Math.max(...others);
      if (keys[0] > maxOther) longest++;
      if (keys[0] > maxOther * MAX_LENGTH_RATIO && keys[0] - maxOther >= MIN_LENGTH_GAP) {
        outliers.push({ id: q.id, ratio: keys[0] / maxOther });
      }
    }
  }

  return {
    outliers,
    longestShare: single === 0 ? 0 : longest / single,
    meanRatio: ratios.length === 0 ? 1 : mean(ratios),
    single,
  };
}
