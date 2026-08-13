"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { slug: "", label: "Overview" },
  { slug: "study", label: "Study path" },
  { slug: "practice", label: "Practice" },
  { slug: "flashcards", label: "Flashcards" },
  { slug: "mock", label: "Mock exam" },
  { slug: "resources", label: "Resources" },
];

export function ExamNav({ examId, code }: { examId: string; code: string }) {
  const pathname = usePathname();
  const base = `/exams/${examId}`;

  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4">
        <span className="mr-2 shrink-0 text-sm font-semibold text-accent-text">{code}</span>
        {sections.map((section) => {
          const href = section.slug ? `${base}/${section.slug}` : base;
          const active = section.slug
            ? pathname.startsWith(href)
            : pathname === base;
          return (
            <Link
              key={section.label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 border-b-2 px-3 py-3 text-sm transition-colors ${
                active
                  ? "border-accent font-medium text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {section.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
