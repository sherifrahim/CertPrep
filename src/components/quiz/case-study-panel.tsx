"use client";

import { useState } from "react";
import type { CaseStudy } from "@/content/types";

/**
 * The case study background, kept available while answering — on the real exam
 * you can re-read it at any point. Sections collapse so the questions stay
 * reachable on a small screen.
 */
export function CaseStudyPanel({ caseStudy }: { caseStudy: CaseStudy }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="card mb-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-2"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted">
            Case study
          </span>
          <span className="mt-0.5 block font-medium">{caseStudy.title}</span>
        </span>
        <span className="shrink-0 text-sm text-accent-text">
          {open ? "Hide" : "Show background"}
        </span>
      </button>

      {open && (
        <div className="border-t border-line">
          {caseStudy.sections.map((section) => (
            <details key={section.heading} open className="border-b border-line last:border-0">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium hover:bg-surface-2">
                {section.heading}
              </summary>
              <p className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed text-muted">
                {section.body}
              </p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
