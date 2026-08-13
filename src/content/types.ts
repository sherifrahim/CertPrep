export type ExamId = "az-500" | "sc-200" | "sc-401";

export type QuestionType = "single" | "multi";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  domainId: string;
  type: QuestionType;
  prompt: string;
  options: QuestionOption[];
  /** Option ids that make up a fully correct answer. */
  correct: string[];
  explanation: string;
  difficulty: 1 | 2 | 3;
  reference?: { label: string; url: string };
}

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
  mock: MockConfig;
  domains: Domain[];
  questions: Question[];
  flashcards: Flashcard[];
  resources: Resource[];
  studyPath: StudyModule[];
}
