"use client";

import { useState, useTransition } from "react";
import type { CaseStudy, Question } from "@/content/types";
import { CaseStudyPanel } from "./case-study-panel";
import { isCorrect } from "@/lib/quiz";
import { submitAttempt, type GradedResult } from "@/lib/actions/progress-actions";
import { QuestionBody } from "./question-body";
import { ResultSummary } from "./result-summary";
import { formatLabel, hasAnswer } from "./format-label";

type Props = {
  examId: string;
  questions: Question[];
  domainNames: Record<string, string>;
  passPercent: number;
  retryHref: string;
  /** Shown above every question when running a case study. */
  caseStudy?: CaseStudy;
};

export function PracticeRunner({
  examId,
  questions,
  domainNames,
  passPercent,
  retryHref,
  caseStudy,
}: Props) {
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [startedAt] = useState(() => Date.now());
  const [result, setResult] = useState<GradedResult | null>(null);
  const [pending, startTransition] = useTransition();

  const question = questions[index];
  const selected = selections[question?.id] ?? [];
  const isChecked = Boolean(checked[question?.id]);
  const answeredCount = Object.keys(checked).length;
  const isLast = index === questions.length - 1;

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

  function finish() {
    startTransition(async () => {
      const graded = await submitAttempt({
        examId,
        mode: "PRACTICE",
        durationSec: Math.round((Date.now() - startedAt) / 1000),
        responses: questions
          .filter((q) => checked[q.id])
          .map((q) => ({ questionId: q.id, selected: selections[q.id] ?? [] })),
      });
      setResult(graded);
    });
  }

  return (
    <div className="space-y-4">
      {caseStudy && <CaseStudyPanel caseStudy={caseStudy} />}
      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>{answeredCount} answered</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${((index + 1) / questions.length) * 100}%`,
            background: "var(--accent)",
          }}
        />
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="chip">{domainNames[question.domainId] ?? question.domainId}</span>
          <span className="chip">{formatLabel(question.type)}</span>
          <span className="chip">
            {["Foundational", "Intermediate", "Advanced"][question.difficulty - 1]}
          </span>
        </div>

        <div className="mt-4">
          <QuestionBody
            question={question}
            selected={selected}
            onChange={(next) => setSelections((s) => ({ ...s, [question.id]: next }))}
            revealed={isChecked ? { correct: question.correct } : null}
          />
        </div>

        {isChecked && (
          <div
            className={`mt-5 rounded-lg border p-4 ${
              isCorrect(question, selected)
                ? "border-ok bg-ok-soft"
                : "border-bad bg-bad-soft"
            }`}
          >
            <p className="text-sm font-semibold">
              {isCorrect(question, selected) ? "Correct" : "Not quite"}
            </p>
            <p className="mt-2 text-sm">{question.explanation}</p>
            {question.reference && (
              <a
                href={question.reference.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm underline"
              >
                {question.reference.label} ↗
              </a>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {!isChecked ? (
            <button
              type="button"
              disabled={!hasAnswer(question.type, selected)}
              onClick={() => setChecked((c) => ({ ...c, [question.id]: true }))}
              className="btn-primary"
            >
              Check answer
            </button>
          ) : isLast ? (
            <button type="button" onClick={finish} disabled={pending} className="btn-primary">
              {pending ? "Scoring…" : "Finish and see results"}
            </button>
          ) : (
            <button type="button" onClick={() => setIndex((i) => i + 1)} className="btn-primary">
              Next question
            </button>
          )}

          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex((i) => i - 1)}
              className="btn-secondary"
            >
              Previous
            </button>
          )}

          {answeredCount > 0 && !isLast && (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              className="btn-ghost ml-auto"
            >
              End session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
