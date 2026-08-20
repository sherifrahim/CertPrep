import Link from "next/link";
import { exams } from "@/content";

const features = [
  {
    title: "Practice quizzes",
    body: "Filter by skill area, answer at your own pace, and get the explanation and a documentation link the moment you submit.",
  },
  {
    title: "Timed mock exams",
    body: "Full-length papers weighted to match the official skills-measured percentages, with a countdown and a question-by-question review.",
  },
  {
    title: "Flashcards",
    body: "Leitner-box scheduling moves cards you know to longer intervals and brings back the ones you miss.",
  },
  {
    title: "Study paths",
    body: "Each exam is broken into modules with concrete outcomes and estimated hours, so you always know what to do next.",
  },
  {
    title: "Curated resources",
    body: "Hand-picked free documentation, cheat sheets, labs, and practice assessments — linked, never re-hosted.",
  },
  {
    title: "Progress tracking",
    body: "Sign in and every attempt is saved: score history, per-domain accuracy, and where your weak areas are.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-16 sm:py-24">
        <p className="chip">Microsoft security certifications</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything you need to pass Microsoft's security certifications.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Practice questions with real explanations, flashcards that schedule themselves, timed mock
          exams weighted to the official objectives, and a curated set of free study material —
          for SC-500, SC-401, and SC-200.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/exams/sc-500" className="btn-primary">
            Start with SC-500
          </Link>
          <Link href="/signup" className="btn-secondary">
            Create a free account
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => {
          const retiresOn = exam.retiresOn ? new Date(exam.retiresOn) : null;
          const retiring = retiresOn && retiresOn > new Date();
          const retired = retiresOn && retiresOn <= new Date();
          return (
            <Link
              key={exam.id}
              href={`/exams/${exam.id}`}
              data-accent={exam.accent}
              className="card group flex flex-col p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent-text">
                  {exam.code}
                </span>
                {retiring && (
                  <span className="rounded-md bg-warn-soft px-2 py-1 text-xs font-medium text-warn">
                    Retires {retiresOn!.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
                {retired && (
                  <span className="rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-muted">
                    Retired
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-semibold group-hover:text-accent-text">{exam.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">{exam.tagline}</p>
              <dl className="mt-4 flex gap-4 border-t border-line pt-3 text-xs text-muted">
                <div>
                  <dt className="sr-only">Questions</dt>
                  <dd>
                    <span className="font-semibold text-ink">{exam.questions.length}</span> questions
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Flashcards</dt>
                  <dd>
                    <span className="font-semibold text-ink">{exam.flashcards.length}</span> cards
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Skill areas</dt>
                  <dd>
                    <span className="font-semibold text-ink">{exam.domains.length}</span> skill areas
                  </dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </section>

      <section className="py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card p-5">
              <h3 className="font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
