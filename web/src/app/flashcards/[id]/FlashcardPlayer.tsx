"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Flashcard, FlashcardSet } from "@/data/flashcards";

type FlashcardPlayerProps = {
  set: FlashcardSet;
  cards: Flashcard[];
};

export function FlashcardPlayer({ set, cards }: FlashcardPlayerProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cardButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusFrameRef = useRef<number | null>(null);
  const ignoreClickRef = useRef(false);

  const totalCount = cards.length;
  const currentCard = cards[index];
  const progressLabel = totalCount ? `${index + 1}/${totalCount}` : "0/0";

  // Focus helper (next animation frame so it happens after re-render)
  const focusCardNextFrame = useCallback(() => {
    if (focusFrameRef.current != null) cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      cardButtonRef.current?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (focusFrameRef.current != null) cancelAnimationFrame(focusFrameRef.current);
    };
  }, []);

  // Lock page scroll while in a set + jump to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    focusCardNextFrame();
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [focusCardNextFrame]);

  // Wrap index if needed
  useEffect(() => {
    if (index >= totalCount && totalCount > 0) {
      setIndex(0);
      setIsFlipped(false);
    }
  }, [index, totalCount]);

  const handleFlip = useCallback(() => {
    if (!totalCount) return;
    setIsFlipped((prev) => !prev);
    focusCardNextFrame();
  }, [totalCount, focusCardNextFrame]);

  const goTo = useCallback(
    (direction: "next" | "prev") => {
      if (!totalCount) return;
      setIndex((prev) => (direction === "next" ? (prev + 1) % totalCount : (prev - 1 + totalCount) % totalCount));
      setIsFlipped(false);
      focusCardNextFrame();
    },
    [totalCount, focusCardNextFrame]
  );

  // Global keyboard shortcuts (capture so Space fires before focused buttons consume it)
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target && target.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const isSpace =
        event.code === "Space" || event.key === " " || event.key === "Spacebar";

      if (isSpace) {
        // Avoid the implicit "click" that browsers fire on keyup for focused buttons
        event.preventDefault();
        ignoreClickRef.current = true;
        handleFlip();
        return;
      }
      if (event.code === "ArrowRight") {
        event.preventDefault();
        goTo("next");
        return;
      }
      if (event.code === "ArrowLeft") {
        event.preventDefault();
        goTo("prev");
        return;
      }
    };

    document.addEventListener("keydown", handleKey, { capture: true });
    return () => document.removeEventListener("keydown", handleKey, { capture: true } as any);
  }, [handleFlip, goTo]);

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-8">
      <header className="flex w-full items-center justify-between text-sm text-[var(--text-secondary)]">
        <Link href="/flashcards" className="inline-flex items-center gap-2 text-[var(--accent-blue)] hover:underline">
          <span aria-hidden="true">&larr;</span>
          Exit
        </Link>
        <div className="text-base font-semibold text-[var(--text-primary)]">{set.title}</div>
        <div>{progressLabel}</div>
      </header>

      <div className="w-full max-w-2xl">
        <button
          ref={cardButtonRef}
          type="button"
          onClick={(e) => {
            // If Space triggered a synthetic click on keyup, swallow it
            if (ignoreClickRef.current) {
              ignoreClickRef.current = false;
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            handleFlip(); // real mouse/touch click
          }}
          className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[var(--border-dark)]
                     bg-[var(--surface-dark)] px-10 py-16 text-center transition hover:border-[var(--accent-blue)]
                     focus:outline-none focus-visible:outline-none"
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
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--accent-blue)] px-4 py-2 text-xs font-semibold
                               text-[var(--accent-blue)] transition hover:bg-[var(--accent-blue)]/10"
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
          onMouseDown={(e) => e.preventDefault()} // keep focus on card while clicking
          onClick={() => goTo("prev")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Previous card"
        >
          <span aria-hidden="true">&lt;</span>
        </button>

        <span>{progressLabel}</span>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // keep focus on card while clicking
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
