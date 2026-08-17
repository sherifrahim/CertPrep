"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { Question } from "@/content/types";
import { submitAttempt, type GradedResult } from "@/lib/actions/progress-actions";
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
};

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function MockRunner({
  examId,
  questions,
  domainNames,
  durationMin,
  passPercent,
  retryHref,
}: Props) {
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [remaining, setRemaining] = useState(durationMin * 60);
  const [result, setResult] = useState<GradedResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const startedAt = useRef(Date.now());
  const submittedRef = useRef(false);

  const question = questions[index];
  const answeredCount = Object.values(selections).filter((s) => s.length > 0).length;

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    startTransition(async () => {
      const graded = await submitAttempt({
        examId,
        mode: "MOCK",
        durationSec: Math.round((Date.now() - startedAt.current) / 1000),
        responses: questions.map((q) => ({
          questionId: q.id,
          selected: selections[q.id] ?? [],
        })),
      });
      setResult(graded);
    });
  }, [examId, questions, selections]);

  useEffect(() => {
    if (result) return;
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
  }, [finish, result]);

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
