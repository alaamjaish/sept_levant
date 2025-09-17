"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Flashcard, FlashcardSet } from "@/data/flashcards";

type FlashcardPlayerProps = {
  set: FlashcardSet;
  cards: Flashcard[];
};

export function FlashcardPlayer({ set, cards }: FlashcardPlayerProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardButtonId = "flashcard-button";

  const currentCard = cards[index];
  const totalCount = cards.length;
  const progressLabel = totalCount ? `${index + 1}/${totalCount}` : "0/0";

  const focusCard = useCallback(() => {
    const button = document.getElementById(cardButtonId) as HTMLButtonElement | null;
    button?.focus();
  }, []);

  useEffect(() => {
    focusCard();
  }, [focusCard]);

  useEffect(() => {
    focusCard();
  }, [index, focusCard]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleFlip = useCallback(() => {
    if (!currentCard) return;
    setIsFlipped((prev) => !prev);
  }, [currentCard]);

  const goTo = useCallback(
    (direction: "next" | "prev") => {
      if (!cards.length) return;
      setIndex((prev) => {
        if (direction === "next") {
          return (prev + 1) % cards.length;
        }
        return (prev - 1 + cards.length) % cards.length;
      });
      setIsFlipped(false);
    },
    [cards.length]
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        handleFlip();
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        goTo("next");
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        goTo("prev");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleFlip, goTo]);

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-8">
      <header className="flex w-full items-center justify-between text-sm text-[var(--text-secondary)]">
        <Link href="/flashcards" className="inline-flex items-center gap-2 text-[var(--accent-blue)] hover:underline">
          <span aria-hidden>←</span>
          Exit
        </Link>
        <div className="text-base font-semibold text-[var(--text-primary)]">{set.title}</div>
        <div>{progressLabel}</div>
      </header>

      <div className="w-full max-w-2xl">
        <button
          id={cardButtonId}
          type="button"
          onClick={handleFlip}
          onKeyDown={(event) => {
            if (event.code === "Space") {
              event.preventDefault();
              handleFlip();
            }
          }}
          className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[var(--border-dark)] bg-[var(--surface-dark)] px-10 py-16 text-center transition hover:border-[var(--accent-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-blue)]"
          aria-pressed={isFlipped}
        >
          {currentCard ? (
            <div className="w-full">
              {!isFlipped ? (
                <div className="flex h-full flex-col items-center justify-center gap-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Front</p>
                  <p className="text-4xl font-semibold leading-tight">{currentCard.front}</p>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Meaning</p>
                  <p className="text-3xl font-semibold text-[var(--accent-blue)]">{currentCard.meaning}</p>
                  <div className="space-y-2 text-base text-[var(--text-secondary)]">
                    <p>{currentCard.exampleAr}</p>
                    <p className="text-[var(--text-primary)]/85">{currentCard.exampleEn}</p>
                  </div>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--accent-blue)] px-4 py-2 text-xs font-semibold text-[var(--accent-blue)] transition hover:bg-[var(--accent-blue)]/10"
                  >
                    Regenerate sentence
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-sm text-[var(--text-secondary)]">
              Add cards to start studying
            </div>
          )}
        </button>
        <p className="mt-3 text-center text-xs text-[var(--text-secondary)]">Click card or press spacebar to flip</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
        <button
          type="button"
          onClick={() => goTo("prev")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Previous card"
        >
          <span aria-hidden="true">&lt;</span>
        </button>
        <span>{progressLabel}</span>
        <button
          type="button"
          onClick={() => goTo("next")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Next card"
        >
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>

      <button className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-blue)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-blue-hover)]">
        + Add a new card
      </button>
    </div>
  );
}
