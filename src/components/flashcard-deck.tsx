"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Flashcard } from "@/content/types";
import { recordCardReview } from "@/lib/actions/progress-actions";

type Props = {
  examId: string;
  cards: Flashcard[];
  domainNames: Record<string, string>;
  signedIn: boolean;
  restartHref: string;
  reviewMode?: boolean;
};

export function FlashcardDeck({
  examId,
  cards,
  domainNames,
  signedIn,
  restartHref,
  reviewMode = false,
}: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<string[]>([]);
  const [review, setReview] = useState<string[]>([]);

  // Reviews are written as you go so a card is never lost, but the deck does not
  // wait on each round trip. Outstanding writes are settled when the deck ends.
  const writes = useRef<Promise<unknown>[]>([]);
  const [saving, setSaving] = useState(false);

  const card = cards[index];
  const done = index >= cards.length;

  useEffect(() => {
    if (!done || writes.current.length === 0) return;
    setSaving(true);
    Promise.allSettled(writes.current).finally(() => setSaving(false));
  }, [done]);

  function mark(remembered: boolean) {
    if (signedIn) {
      writes.current.push(
        recordCardReview({ examId, cardId: card.id, remembered }).catch(() => undefined),
      );
    }
    if (remembered) setKnown((k) => [...k, card.id]);
    else setReview((r) => [...r, card.id]);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-xl font-semibold">
          {reviewMode ? "Review complete" : "Deck complete"}
        </h2>
        <p className="mt-2 text-muted">
          You knew {known.length} of {cards.length}.
          {review.length > 0 && ` ${review.length} will come back sooner.`}
        </p>
        {signedIn ? (
          <p className="mt-3 text-sm text-muted">
            Cards you knew moved up a box and are scheduled further out. Ones you missed reset to
            box 1 and return tomorrow.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            <Link href="/signin" className="text-accent-text underline">
              Sign in
            </Link>{" "}
            to have cards scheduled by how well you know them.
          </p>
        )}
        {saving && <p className="mt-3 text-xs text-muted">Saving your progress…</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href={restartHref} className="btn-primary">
            {reviewMode ? "Check for more due cards" : "Run the deck again"}
          </Link>
          <Link href={`/exams/${examId}`} className="btn-secondary">
            Back to exam
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <span>
          {known.length} known · {review.length} to review
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(index / cards.length) * 100}%`, background: "var(--accent)" }}
        />
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="card flex min-h-56 w-full flex-col items-center justify-center gap-3 p-8 text-center transition-colors hover:bg-surface-2"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <span className="chip">{domainNames[card.domainId] ?? card.domainId}</span>
        <p className={flipped ? "text-sm leading-relaxed text-muted" : "text-lg font-medium"}>
          {flipped ? card.back : card.front}
        </p>
        {!flipped && <span className="text-xs text-muted">Click to reveal</span>}
      </button>

      <div className="flex gap-2">
        {flipped ? (
          <>
            <button type="button" onClick={() => mark(false)} className="btn-secondary flex-1">
              Still learning
            </button>
            <button type="button" onClick={() => mark(true)} className="btn-primary flex-1">
              I knew it
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setFlipped(true)} className="btn-primary flex-1">
            Reveal answer
          </button>
        )}
      </div>
    </div>
  );
}
