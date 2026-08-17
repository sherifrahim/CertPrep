"use client";

import { useEffect, useMemo } from "react";
import type { QuestionOption, QuestionType } from "@/content/types";
import { YES_NO_OPTIONS } from "@/content/types";
import { seedFrom, shuffle } from "@/lib/quiz";

/** Statements as the browser sees them — the per-statement answer is never sent. */
export type DisplayStatement = { id: string; text: string };

export type DisplayQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  scenario?: string;
  options?: QuestionOption[];
  statements?: DisplayStatement[];
  steps?: QuestionOption[];
};

type Props = {
  question: DisplayQuestion;
  selected: string[];
  onChange: (next: string[]) => void;
  /** Once set, inputs lock and correct/incorrect styling is shown. */
  revealed?: { correct: string[] } | null;
};

function toneFor(state: "correct" | "wrong" | "chosen" | "idle") {
  if (state === "correct") return "border-ok bg-ok-soft";
  if (state === "wrong") return "border-bad bg-bad-soft";
  if (state === "chosen") return "border-accent bg-accent-soft";
  return "border-line bg-surface hover:bg-surface-2";
}

export function QuestionBody({ question, selected, onChange, revealed }: Props) {
  const locked = Boolean(revealed);

  // Steps arrive in a stable but non-answer order; keep the shuffle stable per question.
  const initialSteps = useMemo(
    () => shuffle(question.steps ?? [], seedFrom(question.id)).map((s) => s.id),
    [question.steps, question.id],
  );
  const order = selected.length ? selected : initialSteps;

  // Register the starting order so submitting without reordering still grades.
  useEffect(() => {
    if (question.type === "ordering" && selected.length === 0 && initialSteps.length > 0) {
      onChange(initialSteps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, question.type, initialSteps.length, selected.length]);

  function toggleChoice(id: string) {
    if (locked) return;
    if (question.type === "multi") {
      onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    } else {
      onChange([id]);
    }
  }

  function setStatement(id: string, yes: boolean) {
    if (locked) return;
    const next = new Set(selected);
    if (yes) next.add(id);
    else next.delete(id);
    onChange([...next]);
  }

  function move(index: number, delta: number) {
    if (locked) return;
    const next = [...order];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  const scenario = question.scenario && (
    <div className="mb-4 rounded-lg border border-line bg-surface-2 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Scenario</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{question.scenario}</p>
    </div>
  );

  // ---------------------------------------------------------------- ordering
  if (question.type === "ordering") {
    const stepById = new Map((question.steps ?? []).map((s) => [s.id, s]));
    return (
      <>
        {scenario}
        <h2 className="text-base font-medium leading-relaxed">{question.prompt}</h2>
        <p className="mt-2 text-sm text-muted">
          Put the steps in the correct order using the arrows.
        </p>
        <ol className="mt-4 space-y-2">
          {order.map((id, i) => {
            const correctHere = revealed ? revealed.correct[i] === id : undefined;
            const tone = revealed
              ? correctHere
                ? toneFor("correct")
                : toneFor("wrong")
              : toneFor("idle");
            return (
              <li
                key={id}
                className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${tone}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="flex-1">{stepById.get(id)?.text ?? id}</span>
                {!locked && (
                  <span className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move step ${i + 1} up`}
                      className="rounded border border-line px-2 py-1 text-xs disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === order.length - 1}
                      aria-label={`Move step ${i + 1} down`}
                      className="rounded border border-line px-2 py-1 text-xs disabled:opacity-40"
                    >
                      ↓
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        {revealed && (
          <div className="mt-4 rounded-lg border border-line bg-surface-2 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Correct order
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {revealed.correct.map((id) => (
                <li key={id}>{stepById.get(id)?.text ?? id}</li>
              ))}
            </ol>
          </div>
        )}
      </>
    );
  }

  // -------------------------------------------------------------- statements
  if (question.type === "statements") {
    return (
      <>
        {scenario}
        <h2 className="text-base font-medium leading-relaxed">{question.prompt}</h2>
        <p className="mt-2 text-sm text-muted">Select Yes or No for each statement.</p>
        <ul className="mt-4 space-y-2">
          {(question.statements ?? []).map((statement) => {
            const chosenYes = selected.includes(statement.id);
            const shouldBeYes = revealed?.correct.includes(statement.id);
            const right = revealed ? chosenYes === shouldBeYes : undefined;
            const tone = revealed
              ? right
                ? toneFor("correct")
                : toneFor("wrong")
              : toneFor("idle");
            return (
              <li
                key={statement.id}
                className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm ${tone}`}
              >
                <span className="min-w-0 flex-1">{statement.text}</span>
                <span className="flex shrink-0 gap-1">
                  {[true, false].map((yes) => (
                    <button
                      key={String(yes)}
                      type="button"
                      disabled={locked}
                      onClick={() => setStatement(statement.id, yes)}
                      aria-pressed={chosenYes === yes}
                      className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                        chosenYes === yes
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-surface hover:bg-surface-2"
                      } disabled:opacity-70`}
                    >
                      {yes ? "Yes" : "No"}
                    </button>
                  ))}
                </span>
                {revealed && (
                  <span className="w-full text-xs font-semibold">
                    Correct answer: {shouldBeYes ? "Yes" : "No"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  // ------------------------------------------- single / multi / meets-goal
  const choices = question.type === "meets-goal" ? YES_NO_OPTIONS : (question.options ?? []);

  return (
    <>
      {scenario}
      <h2 className="text-base font-medium leading-relaxed">{question.prompt}</h2>
      <ul className="mt-5 space-y-2">
        {choices.map((option) => {
          const isSelected = selected.includes(option.id);
          const isCorrectChoice = revealed?.correct.includes(option.id);
          const isWrongPick = Boolean(revealed) && isSelected && !isCorrectChoice;
          const tone = isCorrectChoice
            ? toneFor("correct")
            : isWrongPick
              ? toneFor("wrong")
              : isSelected
                ? toneFor("chosen")
                : toneFor("idle");

          return (
            <li key={option.id}>
              <label
                className={`flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${tone} ${
                  locked ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <input
                  type={question.type === "multi" ? "checkbox" : "radio"}
                  name={question.id}
                  value={option.id}
                  checked={isSelected}
                  disabled={locked}
                  onChange={() => toggleChoice(option.id)}
                  className="mt-0.5 accent-[var(--accent)]"
                />
                <span className="flex-1">{option.text}</span>
                {isCorrectChoice && (
                  <span className="text-xs font-semibold text-ok">Correct</span>
                )}
                {isWrongPick && <span className="text-xs font-semibold text-bad">Your answer</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}
