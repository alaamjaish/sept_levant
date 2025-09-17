"use client";

import { MouseEvent, useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Flashcard, FlashcardSet } from "@/data/flashcards";
import AddFlashcardButton from "./AddFlashcardButton";
import EditFlashcardSetButton from "./EditFlashcardSetButton";

type FlashcardPlayerProps = {
  set: FlashcardSet;
  cards: Flashcard[];
};

type ListenerOptions = AddEventListenerOptions;

type ApiCardPayload = {
  id: string;
  front_ar: string;
  back_en: string;
  example_ar: string;
  example_en: string;
  created_at: string;
};

export function FlashcardPlayer({ set, cards }: FlashcardPlayerProps) {
  const router = useRouter();
  const [cardsState, setCardsState] = useState(cards);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const cardRef = useRef<HTMLDivElement | null>(null);
  const focusFrameRef = useRef<number | null>(null);
  const ignoreClickRef = useRef(false);

  useEffect(() => {
    setCardsState(cards);
    setIndex((prev) => {
      if (cards.length === 0) return 0;
      return Math.min(prev, cards.length - 1);
    });
    if (cards.length === 0) setIsFlipped(false);
  }, [cards]);

  const totalCount = cardsState.length;
  const currentCard = cardsState[index] ?? null;
  const progressLabel = totalCount ? `${index + 1}/${totalCount}` : "0/0";

  const focusCardNextFrame = useCallback(() => {
    if (focusFrameRef.current != null) cancelAnimationFrame(focusFrameRef.current);
    focusFrameRef.current = requestAnimationFrame(() => {
      cardRef.current?.focus({ preventScroll: true });
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

  // Clamp index if list changes
  useEffect(() => {
    if (index >= cardsState.length && cardsState.length > 0) {
      setIndex(cardsState.length - 1);
      setIsFlipped(false);
    }
  }, [index, cardsState.length]);

  const handleFlip = useCallback(() => {
    if (!cardsState.length) return;
    setIsFlipped((prev) => !prev);
    focusCardNextFrame();
  }, [cardsState.length, focusCardNextFrame]);

  const goTo = useCallback(
    (direction: "next" | "prev") => {
      if (!cardsState.length) return;
      setIndex((prev) => (direction === "next" ? (prev + 1) % cardsState.length : (prev - 1 + cardsState.length) % cardsState.length));
      setIsFlipped(false);
      focusCardNextFrame();
    },
    [cardsState.length, focusCardNextFrame]
  );

  // Global keyboard shortcuts — capture first; also clear Space "ignore" on keyup
  useEffect(() => {
    const isTypingField = (t: HTMLElement | null) =>
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      t instanceof HTMLSelectElement ||
      (!!t && t.getAttribute("contenteditable") === "true");

    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (isTypingField(target)) return;

      const isSpace = event.code === "Space" || event.key === " " || event.key === "Spacebar";

      if (isSpace) {
        event.preventDefault();          // stops synthetic click from buttons
        ignoreClickRef.current = true;   // but we'll clear it on keyup below
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

    const keyup = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === " " || event.key === "Spacebar") {
        // important: if Space didn't generate a click (DIV role=button), don't swallow the next real click
        ignoreClickRef.current = false;
      }
    };

    const listenerOptions: ListenerOptions = { capture: true };
    document.addEventListener("keydown", keydown, listenerOptions);
    document.addEventListener("keyup", keyup, listenerOptions);
    return () => {
      document.removeEventListener("keydown", keydown, listenerOptions);
      document.removeEventListener("keyup", keyup, listenerOptions);
    };
  }, [handleFlip, goTo]);

  useEffect(() => {
    setActionError(null);
  }, [index, cardsState.length]);

  const triggerRefresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!currentCard || isDeleting) return;
    setActionError(null);
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/flashcards/cards/${currentCard.id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Could not delete card.");
      }
      setCardsState((prev) => {
        const next = prev.filter((item) => item.id !== currentCard.id);
        if (next.length === 0) {
          setIndex(0);
          setIsFlipped(false);
        } else {
          setIndex((prevIndex) => Math.min(prevIndex, next.length - 1));
        }
        return next;
      });
      triggerRefresh();
    } catch (error) {
      console.error(error);
      setActionError("Failed to delete the card. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [currentCard, isDeleting, triggerRefresh]);

  const handleRegenerate = useCallback(async () => {
    if (!currentCard || isRegenerating) return;
    setActionError(null);
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/flashcards/cards/${currentCard.id}/regenerate`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.message || "Could not regenerate card.");
      const data = payload?.data as ApiCardPayload | undefined;
      if (!data) throw new Error("Invalid response payload.");

      setCardsState((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                front: data.front_ar,
                meaning: data.back_en,
                exampleAr: data.example_ar,
                exampleEn: data.example_en,
              }
            : item
        )
      );
      setIsFlipped(true);
      triggerRefresh();
    } catch (error) {
      console.error(error);
      setActionError("Failed to regenerate. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  }, [currentCard, isRegenerating, triggerRefresh]);

  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-card-control="true"]')) return;

      // If last Space set ignore flag but (since DIV) no synthetic click fired,
      // clear the flag here so this real click flips immediately.
      if (ignoreClickRef.current) {
        ignoreClickRef.current = false;
        // do NOT return; we want this click to flip now
      }
      handleFlip();
    },
    [handleFlip]
  );

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-8">
      <header className="flex w-full items-center justify-between text-sm text-[var(--text-secondary)]">
        <Link href="/flashcards" className="inline-flex items-center gap-2 text-[var(--accent-blue)] hover:underline">
          <span aria-hidden="true">&larr;</span>
          Exit
        </Link>
        <div className="flex items-center gap-2">
          {/* TITLE SIZE: Change text-base to text-lg for bigger, text-xl for even bigger */}
          <div className="text-lg font-semibold text-[var(--text-primary)]">{set.title}</div>
          <EditFlashcardSetButton setId={set.id} title={set.title} description={set.description ?? null} />
        </div>
        <div>{progressLabel}</div>
      </header>

      <div className="relative w-full max-w-2xl group">
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          onClick={handleCardClick}
          // IMPORTANT: no onKeyDown here — Space is handled globally to avoid double-flip
          className="relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-[var(--border-dark)] bg-[var(--surface-dark)] px-10 py-16 text-center transition hover:border-[var(--accent-blue)] focus:outline-none focus-visible:outline-none"
          // CARD HEIGHT: This min-height keeps the card size stable. Adjust the number (400) to make taller or shorter
          style={{ minHeight: '400px' }}
        >
          {currentCard ? (
            <div className="w-full">
              {!isFlipped ? (
                <div className="flex h-full flex-col items-center justify-center gap-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Front</p>
                  {/* FRONT TEXT SIZE: Change text-4xl to text-5xl for bigger, text-6xl for even bigger */}
                  <p className="text-5xl font-semibold leading-tight">{currentCard.front}</p>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Meaning</p>
                  {/* MEANING TEXT SIZE: Change text-3xl to text-4xl for bigger, text-5xl for even bigger */}
                  <p className="text-4xl font-semibold text-[var(--accent-blue)]">{currentCard.meaning}</p>
                  {/* EXAMPLE TEXT SIZE: Change text-base to text-lg for bigger, text-xl for even bigger */}
                  <div className="space-y-2 text-lg text-[var(--text-secondary)]">
                    <p>{currentCard.exampleAr}</p>
                    <p className="text-[var(--text-primary)]/85">{currentCard.exampleEn}</p>
                  </div>
                  <button
                    type="button"
                    data-card-control="true"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRegenerate();
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    disabled={isRegenerating}
                    className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--accent-blue)] px-4 py-2 text-xs font-semibold text-[var(--accent-blue)] transition hover:bg-[var(--accent-blue)]/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isRegenerating ? "Regenerating..." : "Regenerate sentence"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-sm text-[var(--text-secondary)]">
              Add cards to start studying
            </div>
          )}
        </div>

        {currentCard && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleDelete();
            }}
            onMouseDown={(event) => event.stopPropagation()}
            disabled={isDeleting}
            className="absolute right-4 top-4 inline-flex items-center rounded-full bg-black/40 p-2 text-[var(--text-secondary)] opacity-0 transition hover:bg-black/60 hover:text-red-300 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Delete card"
            title="Delete card"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // keep focus on card while clicking
          onClick={(e) => {
            if (ignoreClickRef.current) {
              ignoreClickRef.current = false;
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            goTo("prev");
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Previous card"
          disabled={totalCount === 0}
        >
          <span aria-hidden="true">&lt;</span>
        </button>

        <span>{progressLabel}</span>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()} // keep focus on card while clicking
          onClick={(e) => {
            if (ignoreClickRef.current) {
              ignoreClickRef.current = false;
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            goTo("next");
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Next card"
          disabled={totalCount === 0}
        >
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>

      {actionError && <p className="text-sm text-red-400">{actionError}</p>}

      <AddFlashcardButton setId={set.id} />
    </div>
  );
}