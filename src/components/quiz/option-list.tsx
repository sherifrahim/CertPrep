"use client";

import type { QuestionOption, QuestionType } from "@/content/types";

type Props = {
  options: QuestionOption[];
  type: QuestionType;
  selected: string[];
  onChange: (next: string[]) => void;
  /** Once set, choices lock and correct/incorrect styling is shown. */
  revealed?: { correct: string[] } | null;
  name: string;
};

export function OptionList({ options, type, selected, onChange, revealed, name }: Props) {
  const locked = Boolean(revealed);

  function toggle(id: string) {
    if (locked) return;
    if (type === "single") {
      onChange([id]);
      return;
    }
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <ul className="space-y-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const isCorrect = revealed?.correct.includes(option.id);
        const isWrongPick = Boolean(revealed) && isSelected && !isCorrect;

        let tone = "border-line bg-surface hover:bg-surface-2";
        if (isCorrect) tone = "border-ok bg-ok-soft";
        else if (isWrongPick) tone = "border-bad bg-bad-soft";
        else if (isSelected) tone = "border-accent bg-accent-soft";

        return (
          <li key={option.id}>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ${tone} ${
                locked ? "cursor-default" : ""
              }`}
            >
              <input
                type={type === "single" ? "radio" : "checkbox"}
                name={name}
                value={option.id}
                checked={isSelected}
                disabled={locked}
                onChange={() => toggle(option.id)}
                className="mt-0.5 accent-[var(--accent)]"
              />
              <span className="flex-1">{option.text}</span>
              {isCorrect && <span className="text-xs font-semibold text-ok">Correct</span>}
              {isWrongPick && <span className="text-xs font-semibold text-bad">Your answer</span>}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
