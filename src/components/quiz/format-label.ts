import type { QuestionType } from "@/content/types";

/** Short badge text describing how an item must be answered. */
export function formatLabel(type: QuestionType): string {
  switch (type) {
    case "multi":
      return "Choose all that apply";
    case "meets-goal":
      return "Does the solution meet the goal?";
    case "statements":
      return "Yes / No per statement";
    case "ordering":
      return "Arrange in order";
    default:
      return "Single answer";
  }
}

/** Whether the learner has supplied enough of an answer to submit. */
export function hasAnswer(type: QuestionType, selected: string[]): boolean {
  // Every statement defaults to "No", so an untouched set is still a valid answer.
  if (type === "statements" || type === "ordering") return true;
  return selected.length > 0;
}
