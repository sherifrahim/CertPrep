import type { MockQuestion } from "@/components/quiz/mock-runner";

/**
 * An in-progress mock exam, kept in localStorage so closing the tab or losing
 * the browser does not destroy a 40-question paper.
 *
 * The stored paper is the same answer-key-free payload the server sent, so
 * nothing sensitive is written to disk. The countdown is stored as remaining
 * seconds rather than a start timestamp, which means the clock pauses while the
 * exam is not open — deliberate, so an interruption does not cost the attempt.
 */
export type MockSession = {
  version: 1;
  examId: string;
  savedAt: number;
  remainingSec: number;
  questions: MockQuestion[];
  selections: Record<string, string[]>;
  flagged: Record<string, boolean>;
};

const KEY_PREFIX = "certprep.mock.";
/** Sessions older than this are treated as abandoned. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function key(examId: string) {
  return `${KEY_PREFIX}${examId}`;
}

export function saveMockSession(session: Omit<MockSession, "version" | "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: MockSession = { ...session, version: 1, savedAt: Date.now() };
    window.localStorage.setItem(key(session.examId), JSON.stringify(payload));
  } catch {
    // Storage can be full or blocked (private mode). Losing resume is acceptable.
  }
}

export function loadMockSession(examId: string): MockSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(examId));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as MockSession;
    const valid =
      parsed?.version === 1 &&
      parsed.examId === examId &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length > 0 &&
      typeof parsed.remainingSec === "number" &&
      parsed.remainingSec > 0 &&
      Date.now() - parsed.savedAt < MAX_AGE_MS;

    if (!valid) {
      clearMockSession(examId);
      return null;
    }
    return parsed;
  } catch {
    clearMockSession(examId);
    return null;
  }
}

export function clearMockSession(examId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(examId));
  } catch {
    // ignore
  }
}

export function describeSession(session: MockSession): string {
  const answered = Object.values(session.selections).filter((s) => s.length > 0).length;
  const mins = Math.floor(session.remainingSec / 60);
  const secs = session.remainingSec % 60;
  return `${answered} of ${session.questions.length} answered, ${mins}m ${String(secs).padStart(2, "0")}s left`;
}
