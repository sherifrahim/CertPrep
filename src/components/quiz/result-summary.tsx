"use client";

import Link from "next/link";
import { YES_NO_OPTIONS, type Question } from "@/content/types";
import type { GradedResult } from "@/lib/actions/progress-actions";

/** Renders a set of answer ids as readable text for any question format. */
function describeAnswer(question: Question, ids: string[]): string {
  if (ids.length === 0) return "no answer";

  switch (question.type) {
    case "meets-goal":
      return YES_NO_OPTIONS.find((o) => o.id === ids[0])?.text ?? ids[0];
    case "ordering": {
      const byId = new Map((question.steps ?? []).map((s) => [s.id, s.text]));
      return ids.map((id, i) => `${i + 1}. ${byId.get(id) ?? id}`).join("  ");
    }
    case "statements": {
      const chosen = new Set(ids);
      return (question.statements ?? [])
        .map((s) => `${s.text} — ${chosen.has(s.id) ? "Yes" : "No"}`)
        .join("; ");
    }
    default:
      return ids
        .map((id) => (question.options ?? []).find((o) => o.id === id)?.text ?? id)
        .join("; ");
  }
}

type Props = {
  result: GradedResult;
  domainNames: Record<string, string>;
  passPercent: number;
  retryHref: string;
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export function ResultSummary({ result, domainNames, passPercent, retryHref }: Props) {
  const questions = result.questions;
  const byDomain = new Map<string, { total: number; correct: number }>();
  for (const answer of result.answers) {
    const entry = byDomain.get(answer.domainId) ?? { total: 0, correct: 0 };
    entry.total += 1;
    if (answer.wasCorrect) entry.correct += 1;
    byDomain.set(answer.domainId, entry);
  }

  const missed = result.answers.filter((a) => !a.wasCorrect);
  const isMock = result.mode === "MOCK";

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              {isMock ? "Mock exam result" : "Practice session result"}
            </p>
            <p className="mt-1 text-4xl font-semibold">{result.scorePercent}%</p>
            <p className="mt-1 text-sm text-muted">
              {result.correctCount} of {result.totalCount} correct ·{" "}
              {formatDuration(result.durationSec)}
              {isMock && ` · ${passPercent}% needed to pass`}
            </p>
          </div>
          {isMock && (
            <span
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                result.passed ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
              }`}
            >
              {result.passed ? "Pass" : "Below pass mark"}
            </span>
          )}
        </div>

        {!result.saved && (
          <p className="mt-4 rounded-lg border border-line bg-surface-2 p-3 text-sm text-muted">
            This result was not saved.{" "}
            <Link href="/signin" className="text-accent-text underline">
              Sign in
            </Link>{" "}
            to keep your score history and track weak areas over time.
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={retryHref} className="btn-primary">
            Try another set
          </Link>
          <Link href={`/exams/${result.examId}`} className="btn-secondary">
            Back to exam
          </Link>
          {result.saved && (
            <Link href="/dashboard" className="btn-ghost">
              View dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Accuracy by skill area</h2>
        <ul className="mt-4 space-y-3">
          {[...byDomain.entries()].map(([domainId, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100);
            return (
              <li key={domainId}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{domainNames[domainId] ?? domainId}</span>
                  <span className="shrink-0 text-muted">
                    {stats.correct}/{stats.total} · {pct}%
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: pct >= passPercent ? "var(--ok)" : "var(--bad)",
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {missed.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold">Review the {missed.length} you missed</h2>
          <ol className="mt-4 space-y-5">
            {missed.map((answer) => {
              const question = questions.find((q) => q.id === answer.questionId);
              if (!question) return null;
              return (
                <li key={answer.questionId} className="border-t border-line pt-4 first:border-0 first:pt-0">
                  {question.scenario && (
                    <p className="mb-2 whitespace-pre-line text-sm text-muted">
                      {question.scenario}
                    </p>
                  )}
                  <p className="text-sm font-medium">{question.prompt}</p>
                  <p className="mt-2 text-sm text-bad">
                    You answered: {describeAnswer(question, answer.selected)}
                  </p>
                  <p className="mt-1 text-sm text-ok">
                    Correct: {describeAnswer(question, answer.correct)}
                  </p>
                  <p className="mt-2 text-sm text-muted">{question.explanation}</p>
                  {question.reference && (
                    <a
                      href={question.reference.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-accent-text underline"
                    >
                      {question.reference.label} ↗
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
