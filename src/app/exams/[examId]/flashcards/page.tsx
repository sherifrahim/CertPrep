import Link from "next/link";
import { notFound } from "next/navigation";
import { getExam } from "@/content";
import type { Flashcard } from "@/content/types";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { seedFrom, shuffle } from "@/lib/quiz";
import { formatWhen, getReviewQueue } from "@/lib/review";

export const metadata = { title: "Flashcards" };

export default async function FlashcardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { examId } = await params;
  const query = await searchParams;
  const exam = getExam(examId);
  if (!exam) notFound();

  const domainFilter = typeof query.domain === "string" ? query.domain : undefined;
  const reviewMode = query.mode === "due";
  const queue = await getReviewQueue(examId);
  const domainNames = Object.fromEntries(exam.domains.map((d) => [d.id, d.name]));

  // Review mode studies what is due plus anything never seen; otherwise the whole deck.
  let pool: Flashcard[] = reviewMode
    ? [...queue.due, ...queue.fresh]
    : exam.flashcards;
  if (domainFilter) pool = pool.filter((c) => c.domainId === domainFilter);

  const cards = shuffle(pool, seedFrom(`${examId}-cards-${Date.now()}`));

  const base = `/exams/${examId}/flashcards`;
  const restartHref = `${base}?${new URLSearchParams({
    ...(domainFilter ? { domain: domainFilter } : {}),
    ...(reviewMode ? { mode: "due" } : {}),
    r: String(Date.now()),
  })}`;

  const readyCount = queue.due.length + queue.fresh.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Flashcards</h1>
          <p className="mt-1 text-sm text-muted">
            {domainFilter ? domainNames[domainFilter] : "All skill areas"} ·{" "}
            {reviewMode ? "review queue" : "full deck"} · {cards.length} cards
          </p>
        </div>
        {domainFilter && (
          <Link href={reviewMode ? `${base}?mode=due` : base} className="btn-ghost text-sm">
            All areas
          </Link>
        )}
      </div>

      {queue.signedIn ? (
        <div className="card mb-6 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span>
              <strong className="text-lg">{queue.due.length}</strong>{" "}
              <span className="text-muted">due</span>
            </span>
            <span>
              <strong className="text-lg">{queue.fresh.length}</strong>{" "}
              <span className="text-muted">new</span>
            </span>
            <span>
              <strong className="text-lg">{queue.scheduledCount}</strong>{" "}
              <span className="text-muted">scheduled</span>
            </span>
            <span>
              <strong className="text-lg">{queue.masteredCount}</strong>{" "}
              <span className="text-muted">mastered</span>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!reviewMode ? (
              <Link
                href={`${base}?mode=due${domainFilter ? `&domain=${domainFilter}` : ""}`}
                className="btn-primary text-sm"
                aria-disabled={readyCount === 0}
              >
                {readyCount > 0 ? `Review ${readyCount} card${readyCount === 1 ? "" : "s"}` : "Nothing due"}
              </Link>
            ) : (
              <Link
                href={`${base}${domainFilter ? `?domain=${domainFilter}` : ""}`}
                className="btn-secondary text-sm"
              >
                Study the full deck instead
              </Link>
            )}
            {queue.nextDueAt && queue.due.length === 0 && queue.fresh.length === 0 && (
              <span className="text-sm text-muted">
                Next cards due {formatWhen(queue.nextDueAt)}.
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="card mb-6 p-4 text-sm text-muted">
          <Link href="/signin" className="text-accent-text underline">
            Sign in
          </Link>{" "}
          to have cards scheduled by how well you know them — ones you miss come back sooner.
        </p>
      )}

      {cards.length === 0 ? (
        <div className="card p-6 text-sm text-muted">
          {reviewMode ? (
            <>
              <p className="font-medium text-ink">Nothing to review right now.</p>
              <p className="mt-2">
                {queue.nextDueAt
                  ? `Your next cards are due ${formatWhen(queue.nextDueAt)}.`
                  : "Study the full deck to start scheduling cards."}
              </p>
              <Link
                href={`${base}${domainFilter ? `?domain=${domainFilter}` : ""}`}
                className="btn-primary mt-4 text-sm"
              >
                Study the full deck
              </Link>
            </>
          ) : (
            "No cards for that skill area yet."
          )}
        </div>
      ) : (
        <FlashcardDeck
          examId={exam.id}
          cards={cards}
          domainNames={domainNames}
          signedIn={queue.signedIn}
          restartHref={restartHref}
          reviewMode={reviewMode}
        />
      )}
    </div>
  );
}
