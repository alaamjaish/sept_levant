"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { featureFlags } from "@/lib/featureFlags";

type Deck = {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type Flashcard = {
  id: string;
  deck_id: string;
  front_text: string;
  back_meaning?: string | null;
  example_text?: string | null;
  transliteration?: string | null;
  pos?: string | null;
  tts_word_url?: string | null;
  tts_example_url?: string | null;
  status: "pending_enrichment" | "ready" | "error_enrichment";
  error_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  language?: string | null;
};

type Message = { text: string; tone: "info" | "error" | "success" } | null;

type DeckResponse = {
  deck: Deck;
  cards: Flashcard[];
};

const STATUS_COPY: Record<Flashcard["status"], string> = {
  pending_enrichment: "Filling details…",
  ready: "Ready",
  error_enrichment: "Needs attention",
};

function playAudio(url?: string | null) {
  if (!url) return;
  if (typeof window === "undefined") return;
  const audio = new Audio(url);
  void audio.play().catch(() => {
    // Swallow audio errors (user gesture requirements, etc.)
  });
}

export default function FlashcardDeckPage({ params }: { params: { deckId: string } }) {
  const flashcardsEnabled = featureFlags.flashcards.enabled;
  const { deckId } = params;
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message>(null);
  const [flipState, setFlipState] = useState<Record<string, boolean>>({});
  const [manualFrontText, setManualFrontText] = useState("");
  const [manualContext, setManualContext] = useState("");
  const [addingCard, setAddingCard] = useState(false);

  const pendingCardIds = useMemo(
    () => cards.filter((card) => card.status === "pending_enrichment").map((card) => card.id),
    [cards]
  );

  const fetchDeck = useCallback(async () => {
    if (!flashcardsEnabled) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcards?deckId=${deckId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to load deck");
      }
      const data = (await res.json()) as DeckResponse;
      setDeck(data.deck);
      setCards(data.cards || []);
      setMessage(null);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Unable to load deck", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [deckId, flashcardsEnabled]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  const handleManualAdd = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!flashcardsEnabled) return;
      const trimmedFront = manualFrontText.trim();
      const trimmedContext = manualContext.trim();
      if (!trimmedFront) {
        setMessage({ text: "Enter the Arabic word or phrase first.", tone: "error" });
        return;
      }
      setAddingCard(true);
      setMessage(null);
      try {
        const payload: Record<string, unknown> = { text: trimmedFront, deckId };
        if (trimmedContext) {
          payload.contextSnippet = trimmedContext;
        }
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Unable to add card");
        }
        setManualFrontText("");
        setManualContext("");
        await fetchDeck();
        setMessage({ text: "Card saved. Details will fill in shortly.", tone: "success" });
      } catch (err) {
        setMessage({ text: err instanceof Error ? err.message : "Unable to add card", tone: "error" });
      } finally {
        setAddingCard(false);
      }
    },
    [deckId, fetchDeck, flashcardsEnabled, manualContext, manualFrontText]
  );

  useEffect(() => {
    if (!flashcardsEnabled) return;
    if (pendingCardIds.length === 0) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const updates = await Promise.all(
          pendingCardIds.map(async (id) => {
            const res = await fetch(`/api/flashcards/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.card as Flashcard;
          })
        );
        setCards((prev) => {
          const next = [...prev];
          let changed = false;
          updates.forEach((card) => {
            if (!card) return;
            const idx = next.findIndex((c) => c.id === card.id);
            if (idx !== -1) {
              const previous = next[idx];
              if (
                previous.status !== card.status ||
                (card.updated_at && previous.updated_at !== card.updated_at)
              ) {
                next[idx] = { ...previous, ...card };
                changed = true;
              }
            }
          });
          return changed ? next : prev;
        });
      } catch {
        // ignore polling errors
      }
      if (attempts >= 8) {
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [flashcardsEnabled, pendingCardIds]);

  const toggleCard = useCallback((cardId: string) => {
    setFlipState((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }, []);

  const retryCard = useCallback(
    async (cardId: string) => {
      try {
        const res = await fetch(`/api/flashcards/${cardId}/enrich`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Unable to queue enrichment");
        }
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardId
              ? { ...card, status: "pending_enrichment", error_reason: null }
              : card
          )
        );
        setMessage({ text: "Enrichment restarted.", tone: "success" });
      } catch (err) {
        setMessage({ text: err instanceof Error ? err.message : "Unable to restart enrichment", tone: "error" });
      }
    },
    []
  );

  if (!flashcardsEnabled) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-3xl font-semibold">Flashcards are currently disabled.</h1>
          <p className="text-slate-300">Check back soon or contact your administrator if you believe this is a mistake.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <Link
            href="/flashcards"
            className="w-fit text-sm text-emerald-200 hover:text-emerald-100"
          >
            ← Back to decks
          </Link>
          <h1 className="text-3xl font-bold">{deck?.name || "Deck"}</h1>
          <p className="text-slate-300">Flip the card to see meaning and examples. Audio arrives when enrichment is ready.</p>
        </div>

        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.tone === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                : message.tone === "success"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                : "border-slate-500/40 bg-slate-700/40 text-slate-100"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleManualAdd}
          className="flex flex-col gap-3 rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 text-slate-100 shadow-inner"
        >
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-slate-300">Arabic word or phrase</span>
            <input
              value={manualFrontText}
              onChange={(event) => setManualFrontText(event.target.value)}
              placeholder="e.g. سيارة"
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              disabled={addingCard}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-slate-300">Context sentence (optional)</span>
            <textarea
              value={manualContext}
              onChange={(event) => setManualContext(event.target.value)}
              placeholder="Add a short sentence to help enrichment (optional)"
              className="min-h-[68px] rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              disabled={addingCard}
            />
          </label>
          <div className="flex flex-col gap-2 text-xs text-slate-400">
            <button
              type="submit"
              disabled={addingCard}
              className="self-end rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addingCard ? "Saving…" : "Add card"}
            </button>
            <span>Cards save instantly. Meanings, examples, and audio appear after the background helper finishes.</span>
          </div>
        </form>

        {loading ? (
          <p className="text-sm text-slate-300">Loading cards…</p>
        ) : cards.length === 0 ? (
          <p className="text-sm text-slate-300">No cards in this deck yet. Add vocabulary from a lesson to populate it.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => {
              const flipped = !!flipState[card.id];
              const statusCopy = STATUS_COPY[card.status];
              return (
                <div
                  key={card.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 shadow-inner"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h2 className="text-2xl font-semibold text-slate-100">{card.front_text}</h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          card.status === "ready"
                            ? "bg-emerald-500/20 text-emerald-200"
                            : card.status === "error_enrichment"
                            ? "bg-rose-500/20 text-rose-200"
                            : "bg-slate-700/60 text-slate-200"
                        }`}
                      >
                        {statusCopy}
                      </span>
                    </div>
                    {!flipped ? (
                      <div className="mt-6 space-y-4">
                        <p className="text-4xl font-bold text-slate-50">{card.front_text}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-200">
                          {card.tts_word_url && (
                            <button
                              type="button"
                              onClick={() => playAudio(card.tts_word_url)}
                              className="rounded-full border border-emerald-400/40 px-3 py-1 text-emerald-100 transition hover:border-emerald-300/80 hover:text-emerald-50"
                            >
                              🔊 Play word
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3 text-slate-100">
                        <p className="text-lg font-semibold text-slate-50">
                          {card.back_meaning || "Meaning coming soon"}
                        </p>
                        {card.example_text && (
                          <div className="space-y-1 text-sm text-slate-200">
                            <p className="font-medium">Example</p>
                            <p>{card.example_text}</p>
                            {card.tts_example_url && (
                              <button
                                type="button"
                                onClick={() => playAudio(card.tts_example_url)}
                                className="rounded-full border border-emerald-400/40 px-3 py-1 text-emerald-100 transition hover:border-emerald-300/80 hover:text-emerald-50"
                              >
                                🔊 Play example
                              </button>
                            )}
                          </div>
                        )}
                        {card.transliteration && (
                          <p className="text-sm text-slate-300">
                            <span className="font-medium text-slate-200">Transliteration:</span> {card.transliteration}
                          </p>
                        )}
                        {card.pos && (
                          <p className="text-sm text-slate-300">
                            <span className="font-medium text-slate-200">Part of speech:</span> {card.pos}
                          </p>
                        )}
                        {card.error_reason && card.status === "error_enrichment" && (
                          <p className="text-xs text-rose-300">Last attempt failed: {card.error_reason}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => toggleCard(card.id)}
                      className="rounded-lg border border-emerald-400/60 px-3 py-1 font-semibold text-emerald-200 transition hover:border-emerald-300/80 hover:text-emerald-100"
                    >
                      {flipped ? "Show front" : "Show back"}
                    </button>
                    {card.status === "error_enrichment" && (
                      <button
                        type="button"
                        onClick={() => retryCard(card.id)}
                        className="rounded-lg border border-rose-400/60 px-3 py-1 font-semibold text-rose-200 transition hover:border-rose-300/80 hover:text-rose-100"
                      >
                        Retry details
                      </button>
                    )}
                    {card.status === "pending_enrichment" && (
                      <span className="text-xs text-slate-400">Enrichment running…</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
