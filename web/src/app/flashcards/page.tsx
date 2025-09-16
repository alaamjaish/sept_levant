"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { featureFlags } from "@/lib/featureFlags";

type DeckSummary = {
  id: string;
  name: string;
  updated_at?: string | null;
  created_at?: string | null;
  fc_cards?: { count: number | null }[] | { count: number | null } | null;
};

type Message = { text: string; tone: "info" | "error" | "success" } | null;

export default function FlashcardsHomePage() {
  const flashcardsEnabled = featureFlags.flashcards.enabled;
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    if (!flashcardsEnabled) return;
    refreshDecks();
  }, [flashcardsEnabled]);

  async function refreshDecks() {
    setLoading(true);
    try {
      const res = await fetch("/api/decks?limit=50");
      if (!res.ok) throw new Error("Unable to load decks");
      const data = (await res.json()) as { decks?: DeckSummary[] };
      setDecks(data.decks || []);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Unable to load decks", tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDeck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newDeckName.trim()) {
      setMessage({ text: "Enter a deck name first.", tone: "error" });
      return;
    }
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeckName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to create deck");
      }
      setNewDeckName("");
      setMessage({ text: "Deck created.", tone: "success" });
      await refreshDecks();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Unable to create deck", tone: "error" });
    } finally {
      setCreating(false);
    }
  }

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
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">My Flashcard Decks</h1>
          <p className="text-slate-300">Collect new words as you study. Details and audio fill in a few seconds after saving.</p>
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
          onSubmit={handleCreateDeck}
          className="flex flex-col gap-3 rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 text-slate-100 shadow-inner md:flex-row md:items-center"
        >
          <label className="flex-1 text-sm">
            <span className="mb-1 block text-slate-300">New deck name</span>
            <input
              value={newDeckName}
              onChange={(event) => setNewDeckName(event.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="e.g. Travel phrases"
            />
          </label>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create deck"}
          </button>
        </form>

        <section className="flex-1 rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 shadow-inner">
          {loading ? (
            <p className="text-sm text-slate-300">Loading decks…</p>
          ) : decks.length === 0 ? (
            <p className="text-sm text-slate-300">No decks yet. Add words from a lesson to start your first deck.</p>
          ) : (
            <ul className="space-y-3">
              {decks.map((deck) => {
                const relation = deck.fc_cards;
                const cardCount = Array.isArray(relation)
                  ? relation[0]?.count ?? null
                  : relation && typeof relation.count === "number"
                  ? relation.count
                  : null;
                return (
                  <li key={deck.id}>
                    <Link
                      href={`/flashcards/${deck.id}`}
                      className="flex flex-col gap-1 rounded-lg border border-slate-700/60 bg-slate-800/60 px-4 py-3 transition hover:border-emerald-400/60 hover:bg-slate-800"
                    >
                      <span className="text-lg font-semibold text-slate-100">{deck.name}</span>
                      <span className="text-sm text-slate-400">
                        {cardCount === null ? "Cards loading" : cardCount === 1 ? "1 card" : `${cardCount ?? 0} cards`}
                      </span>
                      {deck.updated_at && (
                        <span className="text-xs text-slate-500">Updated {new Date(deck.updated_at).toLocaleString()}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
