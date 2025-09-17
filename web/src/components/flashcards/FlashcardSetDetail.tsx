"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Flashcard = {
  id: string;
  front_arabic: string;
  back_english: string;
  example_sentence_ar: string | null;
  example_sentence_en: string | null;
  created_at: string;
};

type FlashcardSet = {
  id: string;
  title: string;
  description: string | null;
  cover_image?: string | null;
  created_at: string;
};

export default function FlashcardSetDetail() {
  const params = useParams<{ setId: string }>();
  const setId = Array.isArray(params?.setId) ? params.setId[0] : params?.setId;
  const router = useRouter();

  const [setInfo, setSetInfo] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [adding, setAdding] = useState(false);
  const [arabicInput, setArabicInput] = useState("");
  const [hintInput, setHintInput] = useState("");
  const [addStatus, setAddStatus] = useState<string>("");

  const [editingSet, setEditingSet] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [savingSet, setSavingSet] = useState(false);

  const activeCard = cards[activeIndex] || null;

  useEffect(() => {
    async function load() {
      if (!setId) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/flashcards/sets/${setId}?includeCards=true`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Failed to load set (${res.status})`);
        }
        setSetInfo(data?.set || null);
        setCards(Array.isArray(data?.cards) ? data.cards : []);
        setActiveIndex(0);
        setShowBack(false);
        if (data?.set) {
          setTitleDraft(data.set.title || "");
          setDescriptionDraft(data.set.description || "");
        }
      } catch (err) {
        setError((err as Error).message || "Failed to load set");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setId]);

  const cardCountText = useMemo(() => {
    const total = cards.length;
    if (!total) return "No cards yet";
    return `${activeIndex + 1} / ${total}`;
  }, [cards.length, activeIndex]);

  async function handleAddCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!setId) return;
    if (!arabicInput.trim()) {
      setAddStatus("Please enter Arabic text.");
      return;
    }
    setAdding(true);
    setAddStatus("");
    try {
      const res = await fetch(`/api/flashcards/sets/${setId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frontArabic: arabicInput.trim(), hint: hintInput.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to add card (${res.status})`);
      }
      if (data?.card) {
        setCards((prev) => [data.card, ...prev]);
        setActiveIndex(0);
        setShowBack(false);
      }
      setArabicInput("");
      setHintInput("");
      if (data?.meta?.usedLLM) {
        setAddStatus("Card created with generated translation.");
      } else if (data?.meta?.llmError) {
        setAddStatus("Saved without translation (LLM unavailable). Edit later.");
      } else {
        setAddStatus("Card added.");
      }
    } catch (err) {
      setAddStatus((err as Error).message || "Failed to add card");
    } finally {
      setAdding(false);
    }
  }

  async function handleRegenerate(card: Flashcard) {
    if (!setId) return;
    setError("");
    try {
      const res = await fetch(`/api/flashcards/sets/${setId}/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true, existingFrontArabic: card.front_arabic, existingEnglishMeaning: card.back_english }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to regenerate (${res.status})`);
      }
      if (data?.card) {
        setCards((prev) => prev.map((c) => (c.id === card.id ? data.card : c)));
      }
    } catch (err) {
      setError((err as Error).message || "Failed to regenerate");
    }
  }

  async function handleDelete(card: Flashcard) {
    if (!setId) return;
    setError("");
    try {
      const res = await fetch(`/api/flashcards/sets/${setId}/cards/${card.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to delete (${res.status})`);
      }
      setCards((prev) => {
        const next = prev.filter((c) => c.id !== card.id);
        setActiveIndex((current) => {
          if (next.length === 0) return 0;
          return Math.max(0, Math.min(current, next.length - 1));
        });
        return next;
      });
    } catch (err) {
      setError((err as Error).message || "Failed to delete card");
    }
  }

  async function handleSaveSet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!setId) return;
    setSavingSet(true);
    setError("");
    try {
      const res = await fetch(`/api/flashcards/sets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleDraft.trim(), description: descriptionDraft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to update set (${res.status})`);
      }
      if (data?.set) {
        setSetInfo(data.set);
        setEditingSet(false);
      }
    } catch (err) {
      setError((err as Error).message || "Failed to update set");
    } finally {
      setSavingSet(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        <button
          onClick={() => router.push("/flashcards")}
          className="text-sm text-[var(--text-secondary)] hover:text-white"
        >
          ? Back to sets
        </button>

        {loading ? (
          <div className="rounded-2xl border border-[var(--border-dark)] bg-[#102029] px-6 py-20 text-center text-[var(--text-secondary)]">
            Loading set...
          </div>
        ) : !setInfo ? (
          <div className="rounded-2xl border border-rose-500/60 bg-rose-500/10 px-6 py-20 text-center text-rose-200">
            {error || "Set not found."}
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[var(--border-dark)] bg-[#102029] p-6 shadow-sm">
              {editingSet ? (
                <form className="grid gap-4" onSubmit={handleSaveSet}>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Title</label>
                    <input
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      className="rounded-lg border border-[#1f3642] bg-[#0b1820] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[var(--text-secondary)]">Description</label>
                    <textarea
                      value={descriptionDraft}
                      onChange={(e) => setDescriptionDraft(e.target.value)}
                      className="min-h-[90px] rounded-lg border border-[#1f3642] bg-[#0b1820] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={savingSet}
                      className="rounded-md bg-[var(--accent-blue)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-blue-hover)] disabled:opacity-60"
                    >
                      {savingSet ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={() => setEditingSet(false)} className="text-sm text-[var(--text-secondary)] hover:text-white">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white">{setInfo.title}</h1>
                      <p className="text-[var(--text-secondary)]">{setInfo.description || "No description yet."}</p>
                    </div>
                    <button
                      onClick={() => setEditingSet(true)}
                      className="rounded-md border border-[var(--border-dark)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{cards.length} cards total</p>
                </div>
              )}
            </section>

            {error && (
              <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
            )}

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-2xl border border-[var(--border-dark)] bg-[#102029] p-6 shadow-sm">
                {cards.length === 0 ? (
                  <div className="flex h-full min-h-[240px] items-center justify-center text-[var(--text-secondary)]">
                    No cards yet. Add your first Arabic word on the right.
                  </div>
                ) : (
                  <div className="flex h-full flex-col gap-6">
                    <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                      <span>{cardCountText}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowBack((prev) => !prev)}
                          className="rounded-md border border-[var(--border-dark)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                        >
                          {showBack ? "Show front" : "Reveal back"}
                        </button>
                        <button
                          onClick={() => activeCard && handleRegenerate(activeCard)}
                          className="rounded-md border border-[var(--border-dark)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                        >
                          Regenerate
                        </button>
                        <button
                          onClick={() => activeCard && handleDelete(activeCard)}
                          className="rounded-md border border-rose-500/60 px-3 py-1 text-xs text-rose-200 hover:border-rose-400 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="relative flex min-h-[280px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-dark)] bg-[#0b1820] p-8 text-center">
                      {!showBack ? (
                        <p className="text-3xl leading-relaxed text-white" dir="rtl" lang="ar">
                          {activeCard?.front_arabic}
                        </p>
                      ) : (
                        <div className="space-y-4 text-left">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-secondary)]">Meaning</p>
                            <p className="text-xl text-white">{activeCard?.back_english}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-secondary)]">Example (Levantine)</p>
                            <p className="text-lg text-white" dir="rtl" lang="ar">{activeCard?.example_sentence_ar || "No example yet."}</p>
                            {activeCard?.example_sentence_en && (
                              <p className="text-sm text-[var(--text-secondary)]">{activeCard.example_sentence_en}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
                          setShowBack(false);
                        }}
                        className="rounded-md border border-[var(--border-dark)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => {
                          setActiveIndex((prev) => (prev + 1) % cards.length);
                          setShowBack(false);
                        }}
                        className="rounded-md border border-[var(--border-dark)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <aside className="flex flex-col gap-6">
                <div className="rounded-2xl border border-[var(--border-dark)] bg-[#102029] p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-white">Add new word</h2>
                  <form className="mt-4 space-y-4" onSubmit={handleAddCard}>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-[var(--text-secondary)]">Arabic text</label>
                      <textarea
                        value={arabicInput}
                        onChange={(e) => setArabicInput(e.target.value)}
                        required
                        dir="rtl"
                        lang="ar"
                        className="min-h-[100px] rounded-lg border border-[#1f3642] bg-[#0b1820] px-3 py-2 text-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                        placeholder="???? ??????? ???????"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-[var(--text-secondary)]">Hint (optional)</label>
                      <textarea
                        value={hintInput}
                        onChange={(e) => setHintInput(e.target.value)}
                        className="min-h-[60px] rounded-lg border border-[#1f3642] bg-[#0b1820] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                        placeholder="Add notes to guide the translation"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={adding}
                      className="w-full rounded-md bg-[var(--accent-blue)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-blue-hover)] disabled:opacity-60"
                    >
                      {adding ? "Adding..." : "Add to set"}
                    </button>
                    {addStatus && <p className="text-xs text-[var(--text-secondary)]">{addStatus}</p>}
                  </form>
                </div>

                <div className="rounded-2xl border border-[var(--border-dark)] bg-[#102029] p-5 shadow-sm">
                  <h2 className="text-lg font-semibold text-white">Cards in this set</h2>
                  <div className="mt-4 flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
                    {cards.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)]">Nothing here yet.</p>
                    ) : (
                      cards.map((card, index) => {
                        const isActive = index === activeIndex;
                        return (
                          <button
                            key={card.id}
                            onClick={() => {
                              setActiveIndex(index);
                              setShowBack(false);
                            }}
                            className={`flex flex-col rounded-lg border px-3 py-2 text-left transition ${
                              isActive
                                ? "border-[var(--accent-blue)] bg-[#0b1c25] text-white"
                                : "border-[#1f3642] bg-[#0b1820] text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                            }`}
                          >
                            <span className="text-base" dir="rtl" lang="ar">
                              {card.front_arabic}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">
                              {new Date(card.created_at).toLocaleDateString()}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
