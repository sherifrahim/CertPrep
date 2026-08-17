"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Question } from "@/content/types";
import { submitAttempt, type GradedResult } from "@/lib/actions/progress-actions";
import { clearMockSession, loadMockSession, saveMockSession } from "@/lib/mock-session";
import { QuestionBody } from "./question-body";
import { ResultSummary } from "./result-summary";
import { formatLabel } from "./format-label";

/**
 * The mock paper is sent without answer keys; grading happens server-side.
 * `statements` drops each statement's `correct` flag, and `steps` are shuffled
 * upstream so their array order does not give the sequence away.
 */
export type MockQuestion = Omit<
  Question,
  "correct" | "explanation" | "reference" | "statements"
> & {
  statements?: { id: string; text: string }[];
};

type Props = {
  examId: string;
  questions: MockQuestion[];
  domainNames: Record<string, string>;
  durationMin: number;
  passPercent: number;
  retryHref: string;
  /** Restore the saved paper and answers instead of starting the supplied one. */
  resume?: boolean;
};

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function MockRunner({
  examId,
  questions: freshQuestions,
  domainNames,
  durationMin,
  passPercent,
  retryHref,
  resume = false,
}: Props) {
  // A resumed attempt has to wait for localStorage, which is unavailable during
  // server rendering, so hydration happens in an effect.
  const [hydrated, setHydrated] = useState(!resume);
  const [questions, setQuestions] = useState<MockQuestion[]>(freshQuestions);
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [remaining, setRemaining] = useState(durationMin * 60);
  const [result, setResult] = useState<GradedResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [pending, startTransition] = useTransition();
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!resume) {
      // Starting fresh replaces any half-finished paper for this exam.
      clearMockSession(examId);
      return;
    }
    const saved = loadMockSession(examId);
    if (saved) {
      setQuestions(saved.questions);
      setSelections(saved.selections);
      setFlagged(saved.flagged);
      setRemaining(saved.remainingSec);
      setResumed(true);
    }
    setHydrated(true);
  }, [resume, examId]);

  const question = questions[index];
  const answeredCount = Object.values(selections).filter((s) => s.length > 0).length;

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearMockSession(examId);
    startTransition(async () => {
      const graded = await submitAttempt({
        examId,
        mode: "MOCK",
        // Time actually spent working, so a paused resume is not counted.
        durationSec: Math.max(0, durationMin * 60 - remaining),
        responses: questions.map((q) => ({
          questionId: q.id,
          selected: selections[q.id] ?? [],
        })),
      });
      setResult(graded);
    });
  }, [examId, questions, selections, durationMin, remaining]);

  useEffect(() => {
    if (result || !hydrated) return;
    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(timer);
          finish();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finish, result, hydrated]);

  // Persist after every change so an abrupt close loses at most a second.
  useEffect(() => {
    if (!hydrated || result || submittedRef.current || remaining <= 0) return;
    saveMockSession({ examId, remainingSec: remaining, questions, selections, flagged });
  }, [hydrated, result, examId, remaining, questions, selections, flagged]);

  if (!hydrated) {
    return <p className="card p-6 text-sm text-muted">Restoring your exam…</p>;
  }

  // Reached by opening a resume link on a device or browser with nothing saved.
  if (questions.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="font-semibold">No saved exam found</h2>
        <p className="mt-2 text-sm text-muted">
          An in-progress exam is stored in the browser you took it in, so it is not available on
          another device or after clearing site data.
        </p>
        <a href={`/exams/${examId}/mock`} className="btn-primary mt-4">
          Back to mock exam
        </a>
      </div>
    );
  }

  if (result) {
    return (
      <ResultSummary
        result={result}
        domainNames={domainNames}
        passPercent={passPercent}
        retryHref={retryHref}
      />
    );
  }

  const lowTime = remaining <= 300;

  return (
    <div className="space-y-4">
      {resumed && (
        <p className="card border-accent bg-accent-soft p-3 text-sm">
          Resumed your in-progress exam. The countdown was paused while you were away.
        </p>
      )}
      <div className="card sticky top-14 z-10 flex flex-wrap items-center gap-3 p-3">
        <span
          className={`rounded-lg px-3 py-1.5 font-mono text-lg font-semibold tabular-nums ${
            lowTime ? "bg-bad-soft text-bad" : "bg-surface-2"
          }`}
          aria-live="polite"
        >
          {formatClock(remaining)}
        </span>
        <span className="text-sm text-muted">
          {answeredCount} of {questions.length} answered
        </span>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={pending}
          className="btn-primary ml-auto"
        >
          {pending ? "Scoring…" : "Submit exam"}
        </button>
      </div>

      {confirming && (
        <div className="card border-warn bg-warn-soft p-4">
          <p className="text-sm font-medium">
            Submit with {questions.length - answeredCount} question
            {questions.length - answeredCount === 1 ? "" : "s"} unanswered?
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={finish} disabled={pending} className="btn-primary">
              Yes, submit
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="btn-secondary">
              Keep working
            </button>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="chip">
            Question {index + 1} of {questions.length}
          </span>
          <span className="chip">{domainNames[question.domainId] ?? question.domainId}</span>
          <span className="chip">{formatLabel(question.type)}</span>
          <button
            type="button"
            onClick={() => setFlagged((f) => ({ ...f, [question.id]: !f[question.id] }))}
            className={`chip ml-auto hover:text-ink ${
              flagged[question.id] ? "border-warn text-warn" : ""
            }`}
          >
            {flagged[question.id] ? "Flagged for review" : "Flag for review"}
          </button>
        </div>

        <div className="mt-4">
          <QuestionBody
            question={question}
            selected={selections[question.id] ?? []}
            onChange={(next) => setSelections((s) => ({ ...s, [question.id]: next }))}
          />
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="btn-secondary"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={index === questions.length - 1}
            className="btn-primary"
          >
            Next
          </button>
        </div>
      </div>

      <nav className="card p-4" aria-label="Question navigator">
        <h3 className="text-sm font-medium">Navigator</h3>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const answered = (selections[q.id] ?? []).length > 0;
            const isFlagged = flagged[q.id];
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? "true" : undefined}
                  className={`h-8 w-8 rounded-md border text-xs font-medium transition-colors ${
                    i === index
                      ? "border-accent bg-accent text-white"
                      : isFlagged
                        ? "border-warn bg-warn-soft text-warn"
                        : answered
                          ? "border-line bg-accent-soft text-accent-text"
                          : "border-line bg-surface text-muted hover:bg-surface-2"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
