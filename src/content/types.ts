export type ExamId = "az-500" | "sc-200" | "sc-401" | "sc-500";

/**
 * Mirrors the item formats Microsoft actually uses:
 * - `single` / `multi`   — standard multiple choice
 * - `meets-goal`         — a repeated scenario with a proposed solution, answered Yes/No
 * - `statements`         — hot-area style, Yes/No judged per statement
 * - `ordering`           — drag-and-drop, arrange steps into the correct sequence
 */
export type QuestionType = "single" | "multi" | "meets-goal" | "statements" | "ordering";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionStatement {
  id: string;
  text: string;
  correct: boolean;
}

export interface CaseStudySection {
  heading: string;
  body: string;
}

/**
 * A long shared scenario with several linked questions, mirroring the case study
 * section of the real exam where the background stays available while you answer.
 */
export interface CaseStudy {
  id: string;
  title: string;
  summary: string;
  sections: CaseStudySection[];
}

export interface Question {
  id: string;
  domainId: string;
  type: QuestionType;
  /**
   * Set when the question belongs to a case study. Such questions are excluded
   * from practice and mock pools, since they make no sense without the scenario.
   */
  caseStudyId?: string;
  prompt: string;
  /**
   * Background shown above the prompt. Microsoft repeats an identical scenario
   * across several `meets-goal` items, each proposing a different solution.
   */
  scenario?: string;
  /** Choices for `single` and `multi`. Yes/No items supply their own. */
  options?: QuestionOption[];
  /** Statements for `statements` items, each judged Yes or No. */
  statements?: QuestionStatement[];
  /** Steps for `ordering` items, listed here in the correct sequence. */
  steps?: QuestionOption[];
  /**
   * A fully correct answer.
   * `single`/`multi` — option ids. `meets-goal` — ["yes"] or ["no"].
   * `statements` — ids of statements that are true.
   * `ordering` — step ids in the correct order (order is significant).
   */
  correct: string[];
  explanation: string;
  difficulty: 1 | 2 | 3;
  reference?: { label: string; url: string };
}

export const YES_NO_OPTIONS: QuestionOption[] = [
  { id: "yes", text: "Yes — the solution meets the goal" },
  { id: "no", text: "No — the solution does not meet the goal" },
];

export interface Flashcard {
  id: string;
  domainId: string;
  front: string;
  back: string;
}

export interface Domain {
  id: string;
  name: string;
  /** Official skills-measured weight, e.g. "30–35%". */
  weight: string;
  /** Midpoint of the official weight range, used to build mock exams. */
  weightValue: number;
  summary: string;
  objectives: string[];
}

export type ResourceKind =
  | "official"
  | "pdf"
  | "video"
  | "lab"
  | "practice"
  | "community"
  | "tool";

export interface Resource {
  id: string;
  title: string;
  url: string;
  kind: ResourceKind;
  provider: string;
  free: boolean;
  description: string;
}

export interface StudyModule {
  id: string;
  title: string;
  estimatedHours: number;
  domainIds: string[];
  summary: string;
  outcomes: string[];
  resourceIds: string[];
}

export interface MockConfig {
  questionCount: number;
  durationMin: number;
  passPercent: number;
}

export interface Exam {
  id: ExamId;
  code: string;
  title: string;
  tagline: string;
  description: string;
  /** Tailwind-safe accent token, see src/lib/theme.ts */
  accent: "azure" | "violet" | "teal";
  skillsMeasuredAsOf: string;
  officialUrl: string;
  studyGuideUrl: string;
  /** ISO date the exam retires, when Microsoft has announced one. */
  retiresOn?: string;
  /** Exam that supersedes this one, shown on the retirement banner. */
  replacedBy?: ExamId;
  mock: MockConfig;
  domains: Domain[];
  questions: Question[];
  caseStudies: CaseStudy[];
  flashcards: Flashcard[];
  resources: Resource[];
  studyPath: StudyModule[];
}
