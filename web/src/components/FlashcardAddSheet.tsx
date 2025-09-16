"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type DeckSummary = {
  id: string;
  name: string;
  updated_at?: string | null;
  created_at?: string | null;
  fc_cards?: { count: number | null }[] | { count: number | null } | null;
};

type FlashcardAddSheetProps = {
  open: boolean;
  anchor?: { top: number; left: number } | null;
  selectedText: string;
  contextSnippet?: string | null;
  onCancel: () => void;
  onAdded?: (payload: { cardId: string; status: string; deckId: string }) => void;
};

type DeckOption = {
  id: string;
  name: string;
  count?: number;
};

const MICROCOPY = "Saved. We'll fill the meaning & audio in the background.";

export function FlashcardAddSheet({
  open,
  anchor,
  selectedText,
  contextSnippet,
  onCancel,
  onAdded,
}: FlashcardAddSheetProps) {
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [decks, setDecks] = useState<DeckOption[]>([]);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [newDeckName, setNewDeckName] = useState("My Cards");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [microcopyVisible, setMicrocopyVisible] = useState(false);
  const [textValue, setTextValue] = useState("");

  const displayText = useMemo(() => selectedText.trim(), [selectedText]);

  useEffect(() => {
    if (!open) {
      setDecks([]);
      setMode("existing");
      setSelectedDeckId("");
      setNewDeckName("My Cards");
      setSaving(false);
      setError(null);
      setMicrocopyVisible(false);
      setTextValue("");
      return;
    }

    setTextValue(displayText);

    let active = true;
    async function loadDecks() {
      setLoadingDecks(true);
      try {
        const res = await fetch(`/api/decks?limit=10`);
        if (!res.ok) throw new Error("Unable to load decks");
        const data = (await res.json()) as { decks?: DeckSummary[] };
        if (!active) return;
        const options: DeckOption[] = (data.decks || []).map((deck) => {
          const relation = deck.fc_cards;
          const countValue = Array.isArray(relation)
            ? relation[0]?.count ?? null
            : relation && typeof relation.count === "number"
            ? relation.count
            : null;
          return {
            id: deck.id,
            name: deck.name,
            count: typeof countValue === "number" ? countValue : undefined,
          };
        });
        setDecks(options);
        if (options.length > 0) {
          setSelectedDeckId(options[0].id);
          setMode("existing");
        } else {
          setMode("new");
          setSelectedDeckId("");
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setDecks([]);
          setMode("new");
        }
      } finally {
        if (active) setLoadingDecks(false);
      }
    }

    loadDecks();

    return () => {
      active = false;
    };
  }, [displayText, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const style: CSSProperties = anchor
    ? {
        position: "fixed",
        top: `${anchor.top}px`,
        left: `${anchor.left}px`,
        transform: "translate(-50%, 8px)",
      }
    : {
        position: "fixed",
        left: "50%",
        bottom: "15vh",
        transform: "translateX(-50%)",
      };

  const disableAdd = saving || !textValue.trim();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (disableAdd) return;
    setSaving(true);
    setError(null);
    setMicrocopyVisible(false);
    try {
      const trimmed = textValue.trim();
      if (!trimmed) {
        setError("Enter a word or phrase first.");
        setSaving(false);
        return;
      }

      const payload: Record<string, unknown> = {
        text: trimmed,
      };
      if (contextSnippet) payload.contextSnippet = contextSnippet;
      if (mode === "existing" && selectedDeckId) {
        payload.deckId = selectedDeckId;
      }
      if (mode === "new") {
        payload.newDeckName = newDeckName.trim() || "My Cards";
      }
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save flashcard");
      }
      const data = (await res.json()) as {
        card: { id: string; status: string; deckId: string };
      };
      setMicrocopyVisible(true);
      onAdded?.(data.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flashcard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="z-[100]"
      style={style}
    >
      <form
        onSubmit={handleSubmit}
        className="w-[min(320px,90vw)] rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add to flashcard</h2>
            <p className="mt-1 text-2xl font-bold text-slate-800">{textValue || displayText || "(Enter text)"}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Word or phrase
          <textarea
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-base text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            rows={2}
            placeholder="Type or edit the word you're saving"
            autoFocus
          />
        </label>

        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-slate-700">Deck</p>
          {loadingDecks && <p className="text-sm text-slate-500">Loading decks…</p>}
          {decks.map((deck) => (
            <label
              key={deck.id}
              className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-sm hover:border-slate-200 hover:bg-slate-50"
            >
              <input
                type="radio"
                name="deck"
                value={deck.id}
                checked={mode === "existing" && selectedDeckId === deck.id}
                onChange={() => {
                  setMode("existing");
                  setSelectedDeckId(deck.id);
                }}
              />
              <span className="flex-1 text-slate-700">
                {deck.name}
                {typeof deck.count === "number" ? (
                  <span className="ml-2 text-xs text-slate-400">{deck.count} cards</span>
                ) : null}
              </span>
            </label>
          ))}

          <label className="flex items-start gap-2 rounded-lg border border-transparent px-2 py-1 text-sm hover:border-slate-200 hover:bg-slate-50">
            <input
              type="radio"
              name="deck"
              value="__new__"
              checked={mode === "new"}
              onChange={() => {
                setMode("new");
                setSelectedDeckId("");
              }}
            />
            <span className="flex-1">
              <span className="text-slate-700">New deck…</span>
              <input
                type="text"
                value={newDeckName}
                onChange={(event) => setNewDeckName(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Deck name"
              />
            </span>
          </label>
        </div>

        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        {microcopyVisible ? (
          <p className="mt-2 text-sm text-emerald-600">{MICROCOPY}</p>
        ) : null}

        <button
          type="submit"
          disabled={disableAdd}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add"}
        </button>
      </form>
    </div>
  );
}
