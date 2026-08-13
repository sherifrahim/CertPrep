import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getExam } from "@/content";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { seedFrom, shuffle } from "@/lib/quiz";

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
  const cards = shuffle(
    domainFilter ? exam.flashcards.filter((c) => c.domainId === domainFilter) : exam.flashcards,
    seedFrom(`${examId}-cards-${Date.now()}`),
  );
  const domainNames = Object.fromEntries(exam.domains.map((d) => [d.id, d.name]));
  const session = await auth();

  const restartHref = domainFilter
    ? `/exams/${examId}/flashcards?domain=${domainFilter}&r=${Date.now()}`
    : `/exams/${examId}/flashcards?r=${Date.now()}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Flashcards</h1>
          <p className="mt-1 text-sm text-muted">
            {domainFilter ? domainNames[domainFilter] : "All skill areas"} · {cards.length} cards
          </p>
        </div>
        {domainFilter && (
          <Link href={`/exams/${examId}/flashcards`} className="btn-ghost text-sm">
            All areas
          </Link>
        )}
      </div>

      {cards.length === 0 ? (
        <p className="card p-6 text-sm text-muted">No cards for that skill area yet.</p>
      ) : (
        <FlashcardDeck
          examId={exam.id}
          cards={cards}
          domainNames={domainNames}
          signedIn={Boolean(session?.user)}
          restartHref={restartHref}
        />
      )}
    </div>
  );
}
