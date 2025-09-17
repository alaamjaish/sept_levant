"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type FlashcardSet = {
  id: string;
  title: string;
  description: string | null;
  cover_image?: string | null;
  created_at: string;
  cards_count?: number;
};

type Flashcard = {
  id: string;
  front_arabic: string;
  back_english: string;
  example_sentence_ar: string | null;
  example_sentence_en: string | null;
  created_at: string;
};

type FetchState = "idle" | "loading" | "error";
type CreateState = "idle" | "submitting" | "error";

const CARD_CONTAINER_STYLE = {
  fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
};

export default function FlashcardsScreen() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createState, setCreateState] = useState<CreateState>("idle");
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [cardsMap, setCardsMap] = useState<Record<string, Flashcard[]>>({});
  const [cardsStatus, setCardsStatus] = useState<Record<string, FetchState>>({});
  const [cardsError, setCardsError] = useState("");
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [editingSet, setEditingSet] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [savingSet, setSavingSet] = useState(false);
  const [arabicInput, setArabicInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addStatus, setAddStatus] = useState("");
  const [focusAdd, setFocusAdd] = useState(false);
  const addSectionRef = useRef<HTMLDivElement | null>(null);
  const activeSet = activeSetId ? sets.find((set) => set.id === activeSetId) ?? null : null;
  const activeCards = activeSetId && activeSetId in cardsMap ? cardsMap[activeSetId] : [];
  const activeCard = activeCards[activeCardIndex] ?? null;
  const cardsLoading = activeSetId ? cardsStatus[activeSetId] === "loading" : false;
  const hasSets = sets.length > 0;
  const searchParams = useSearchParams();
  const preferredSetId = searchParams.get("set");
  const loadSets = useCallback(async () => {
    setFetchState("loading");
    setError("");
    try {
      const res = await fetch("/api/flashcards/sets", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to load (${res.status})`);
      }
      setSets(Array.isArray(data?.sets) ? data.sets : []);
      setFetchState("idle");
    } catch (err) {
      setError((err as Error).message || "Failed to load sets");
      setFetchState("error");
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  useEffect(() => {
    if (focusAdd && addSectionRef.current) {
      addSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setFocusAdd(false);
    }
  }, [focusAdd, activeSetId, activeCards.length]);

  useEffect(() => {
    if (!activeSetId) {
      setTitleDraft("");
      setDescriptionDraft("");
      setEditingSet(false);
      return;
    }
    const next = sets.find((set) => set.id === activeSetId);
    setTitleDraft(next?.title ?? "");
    setDescriptionDraft(next?.description ?? "");
    setEditingSet(false);
  }, [activeSetId, sets]);

  const ensureSetCards = useCallback(
    async (setId: string) => {
      if (setId in cardsMap) return;
      setCardsStatus((prev) => ({ ...prev, [setId]: "loading" }));
      setCardsError("");
      try {
        const res = await fetch(`/api/flashcards/sets/${setId}?includeCards=true`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Failed to load cards (${res.status})`);
        }
        const incomingCards = Array.isArray(data?.cards) ? data.cards : [];
        setCardsMap((prev) => ({ ...prev, [setId]: incomingCards }));
        setSets((prev) =>
          prev.map((set) => {
            if (set.id !== setId) return set;
            const merged = data?.set ?? set;
            return {
              ...set,
              title: merged.title,
              description: merged.description,
              cards_count: incomingCards.length,
            };
          }),
        );
        setCardsStatus((prev) => ({ ...prev, [setId]: "idle" }));
      } catch (err) {
        const message = (err as Error).message || "Failed to load cards";
        setCardsError(message);
        setCardsStatus((prev) => ({ ...prev, [setId]: "error" }));
      }
    },
    [cardsMap],
  );

  const openSet = useCallback(
    async (setId: string, options: { focusAdd?: boolean; skipHistory?: boolean } = {}) => {
      setActiveSetId(setId);
      setActiveCardIndex(0);
      setShowBack(false);
      setCardsError("");
      if (options.focusAdd) {
        setFocusAdd(true);
      }
      if (typeof window !== "undefined" && !options.skipHistory) {
        const url = new URL(window.location.href);
        url.searchParams.set("set", setId);
        window.history.replaceState(null, "", url.toString());
      }
      if (!(setId in cardsMap)) {
        await ensureSetCards(setId);
      }
    },
    [cardsMap, ensureSetCards],
  );

  useEffect(() => {
    if (!preferredSetId || !sets.length) return;
    if (activeSetId === preferredSetId) return;
    if (!sets.some((set) => set.id === preferredSetId)) return;
    void openSet(preferredSetId, { skipHistory: true });
  }, [preferredSetId, sets, activeSetId, openSet]);
  useEffect(() => {
    if (!activeSetId || activeCards.length === 0) return;
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea" || target.getAttribute("contenteditable") === "true") {
          return;
        }
      }
      if (event.code === "Space") {
        event.preventDefault();
        setShowBack((prev) => !prev);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveCardIndex((prev) => {
          if (activeCards.length === 0) return 0;
          return (prev + 1) % activeCards.length;
        });
        setShowBack(false);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveCardIndex((prev) => {
          if (activeCards.length === 0) return 0;
          return (prev - 1 + activeCards.length) % activeCards.length;
        });
        setShowBack(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeSetId, activeCards.length]);

  async function handleCreateSet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!createTitle.trim()) {
      setError("Please enter a title for the set.");
      return;
    }
    setCreateState("submitting");
    setError("");
    try {
      const res = await fetch("/api/flashcards/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: createTitle.trim(), description: createDescription.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to create (${res.status})`);
      }
      const created: FlashcardSet | null = data?.set ?? null;
      setCreateTitle("");
      setCreateDescription("");
      setShowCreate(false);
      await loadSets();
      if (created?.id) {
        setCardsMap((prev) => ({ ...prev, [created.id]: [] }));
        await openSet(created.id, { focusAdd: true });
      }
    } catch (err) {
      setError((err as Error).message || "Failed to create set");
      setCreateState("error");
    } finally {
      setCreateState("idle");
    }
  }

  async function handleSaveSet(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeSetId) return;
    setSavingSet(true);
    setCardsError("");
    try {
      const res = await fetch(`/api/flashcards/sets/${activeSetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleDraft.trim(), description: descriptionDraft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to update set (${res.status})`);
      }
      if (data?.set) {
        setSets((prev) => prev.map((set) => (set.id === activeSetId ? { ...set, ...data.set } : set)));
        setEditingSet(false);
      }
    } catch (err) {
      setCardsError((err as Error).message || "Failed to update set");
    } finally {
      setSavingSet(false);
    }
  }

  async function handleAddCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeSetId) return;
    if (!arabicInput.trim()) {
      setAddStatus("Please enter Arabic text.");
      return;
    }
    setAdding(true);
    setAddStatus("");
    try {
      const res = await fetch(`/api/flashcards/sets/${activeSetId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frontArabic: arabicInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to add card (${res.status})`);
      }
      if (data?.card) {
        setCardsMap((prev) => {
          const current = prev[activeSetId] ?? [];
          return { ...prev, [activeSetId]: [data.card, ...current] };
        });
        setSets((prev) =>
          prev.map((set) =>
            set.id === activeSetId ? { ...set, cards_count: (set.cards_count || 0) + 1 } : set,
          ),
        );
        setActiveCardIndex(0);
        setShowBack(false);
      }
      setArabicInput("");
      if (data?.meta?.usedLLM) {
        setAddStatus("Card created with generated translation.");
      } else if (data?.meta?.llmError) {
        setAddStatus("Saved without translation (LLM unavailable). Edit later.");
      } else {
        setAddStatus("Card added to your set.");
      }
    } catch (err) {
      setAddStatus((err as Error).message || "Failed to add card");
    } finally {
      setAdding(false);
    }
  }

  async function handleRegenerate() {
    if (!activeSetId || !activeCard) return;
    setCardsError("");
    try {
      const res = await fetch(`/api/flashcards/sets/${activeSetId}/cards/${activeCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regenerate: true,
          existingFrontArabic: activeCard.front_arabic,
          existingEnglishMeaning: activeCard.back_english,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to regenerate (${res.status})`);
      }
      if (data?.card) {
        setCardsMap((prev) => {
          const current = prev[activeSetId] ?? [];
          return {
            ...prev,
            [activeSetId]: current.map((card) => (card.id === activeCard.id ? data.card : card)),
          };
        });
      }
    } catch (err) {
      setCardsError((err as Error).message || "Failed to regenerate card");
    }
  }

  async function handleDelete() {
    if (!activeSetId || !activeCard) return;
    setCardsError("");
    try {
      const res = await fetch(`/api/flashcards/sets/${activeSetId}/cards/${activeCard.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Failed to delete (${res.status})`);
      }
      setCardsMap((prev) => {
        const current = prev[activeSetId] ?? [];
        const next = current.filter((card) => card.id !== activeCard.id);
        return { ...prev, [activeSetId]: next };
      });
      setSets((prev) =>
        prev.map((set) =>
          set.id === activeSetId ? { ...set, cards_count: Math.max(0, (set.cards_count || 0) - 1) } : set,
        ),
      );
      setActiveCardIndex((current) => {
        if (activeCards.length <= 1) return 0;
        return Math.min(current, activeCards.length - 2);
      });
      setShowBack(false);
    } catch (err) {
      setCardsError((err as Error).message || "Failed to delete card");
    }
  }
  const cardCountText = useMemo(() => {
    const total = activeCards.length;
    if (!total) return "No cards yet";
    return `Card ${activeCardIndex + 1} of ${total}`;
  }, [activeCards.length, activeCardIndex]);

  const emptyMessage = useMemo(() => {
    if (fetchState === "loading") return "Loading your sets...";
    if (fetchState === "error") return "Could not load sets.";
    return "No sets yet. Create your first one!";
  }, [fetchState]);

  return (
    <div className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)]" style={CARD_CONTAINER_STYLE}>
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Flashcards</h1>
            <p className="text-[var(--text-secondary)]">
              Curate your Levantine vocabulary and study it without leaving this page.
            </p>
          </div>
          <button
            onClick={() => setShowCreate((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent-blue)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-blue-hover)]"
          >
            <span className="text-lg">+</span>
            <span>Create New Set</span>
          </button>
        </header>

        {showCreate && (
          <section className="rounded-2xl border border-[var(--border-dark)] bg-[#0f1f2a] p-6 shadow-lg">
            <form className="space-y-4" onSubmit={handleCreateSet}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Set title</label>
                <input
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="rounded-lg border border-[#1f3642] bg-[#0b1820] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                  placeholder="e.g. Levant kitchen verbs"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[var(--text-secondary)]">Description (optional)</label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="min-h-[90px] rounded-lg border border-[#1f3642] bg-[#0b1820] px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                  placeholder="Describe what you want to master in this set."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={createState === "submitting"}
                  className="inline-flex items-center justify-center rounded-md bg-[var(--accent-blue)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-blue-hover)] disabled:opacity-60"
                >
                  {createState === "submitting" ? "Creating..." : "Create Set"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-sm text-[var(--text-secondary)] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {error && (
          <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        )}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
          <section className="space-y-5">
            <h2 className="text-lg font-semibold text-white">Your sets</h2>
            {!hasSets ? (
              <div className="rounded-2xl border border-dashed border-[#2b4554] bg-[#102029] px-6 py-20 text-center text-[var(--text-secondary)]">
                {emptyMessage}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sets.map((set) => {
                  const isActive = set.id === activeSetId;
                  return (
                    <article
                      key={set.id}
                      className={`group relative overflow-hidden rounded-2xl border bg-[#102029] p-5 transition ${
                        isActive
                          ? "border-[var(--accent-blue)] shadow-[0_0_0_1px_var(--accent-blue)]"
                          : "border-[var(--border-dark)] hover:border-[var(--accent-blue)]"
                      }`}
                      tabIndex={0}
                      onFocus={() => openSet(set.id)}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                          <span>{new Date(set.created_at).toLocaleDateString()}</span>
                          <span>{set.cards_count ?? 0} cards</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white line-clamp-2">{set.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-3">
                          {set.description || "No description yet."}
                        </p>
                      </div>
                      <div className="mt-6 flex flex-col gap-3 sm:hidden">
                        <button
                          onClick={() => openSet(set.id)}
                          className="w-full rounded-md bg-[#0b1c25] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-blue)]"
                        >
                          View cards
                        </button>
                        <button
                          onClick={() => openSet(set.id, { focusAdd: true })}
                          className="w-full rounded-md border border-[var(--border-dark)] px-4 py-2 text-sm font-semibold text-white hover:border-[var(--accent-blue)]"
                        >
                          Add word
                        </button>
                      </div>
                      <div className="absolute inset-0 hidden flex-col items-stretch gap-3 bg-[#0b1f2a]/90 px-5 py-6 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 sm:flex">
                        <button
                          onClick={() => openSet(set.id)}
                          className="w-full rounded-md bg-[var(--accent-blue)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-blue-hover)]"
                        >
                          View cards
                        </button>
                        <button
                          onClick={() => openSet(set.id, { focusAdd: true })}
                          className="w-full rounded-md border border-[var(--accent-blue)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-blue-hover)]"
                        >
                          Add word
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-6">
            {!activeSet ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#2b4554] bg-[#0f1f2a] px-6 text-center text-[var(--text-secondary)]">
                <p>Select a set to start practicing. Hover over a tile to add a word or begin a session.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-3xl border border-[var(--border-dark)] bg-[#0f1f2a] p-6 shadow-sm">
                  {editingSet ? (
                    <form className="space-y-4" onSubmit={handleSaveSet}>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[var(--text-secondary)]">Set title</label>
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
                        <button
                          type="button"
                          onClick={() => setEditingSet(false)}
                          className="text-sm text-[var(--text-secondary)] hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{activeSet.title}</h2>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {activeSet.description || "No description yet."}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text-secondary)]">
                          {activeSet.cards_count ?? activeCards.length} cards
                        </span>
                        <button
                          onClick={() => setEditingSet(true)}
                          className="rounded-md border border-[var(--border-dark)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                        >
                          Edit set
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {cardsError && (
                  <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    <span>{cardsError}</span>
                    {activeSetId && cardsStatus[activeSetId] === "error" && (
                      <button
                        onClick={() => ensureSetCards(activeSetId)}
                        className="ml-3 inline-flex items-center text-xs font-semibold text-white underline-offset-2 hover:underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative rounded-3xl border border-[var(--border-dark)] bg-[#08131a] p-6">
                    {cardsLoading && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-[#08131a]/80 text-sm text-[var(--text-secondary)]">
                        Loading cards...
                      </div>
                    )}
                    {activeCards.length === 0 ? (
                      <div className="flex min-h-[240px] items-center justify-center text-center text-[var(--text-secondary)]">
                        No cards yet. Add your first Arabic word below.
                      </div>
                    ) : (
                      <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-6">
                        <button
                          type="button"
                          className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-[var(--border-dark)] bg-[#0b1c25] px-3 py-5 text-3xl text-white hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] sm:block"
                          onClick={() => {
                            setActiveCardIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
                            setShowBack(false);
                          }}
                          aria-label="Previous card"
                        >
                          <span aria-hidden="true" className="text-3xl font-semibold leading-none">&lt;</span>
                        </button>

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowBack((prev) => !prev)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setShowBack((prev) => !prev);
                            }
                          }}
                          className={`relative flex w-full max-w-4xl flex-col items-center justify-center gap-4 rounded-3xl border border-[var(--border-dark)] bg-gradient-to-br from-[#102838] to-[#081820] px-8 py-10 text-center shadow-lg transition ${
                            showBack ? "" : "hover:border-[var(--accent-blue)]"
                          }`}
                        >
                          {!showBack ? (
                            <p className="text-5xl font-semibold leading-[1.3] text-white" dir="rtl" lang="ar">
                              {activeCard?.front_arabic}
                            </p>
                          ) : (
                            <div className="space-y-5 text-left">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                  Meaning
                                </p>
                                <p className="text-2xl font-semibold text-white">{activeCard?.back_english}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                                  Example
                                </p>
                                <p className="text-lg text-white" dir="rtl" lang="ar">
                                  {activeCard?.example_sentence_ar || "No example yet."}
                                </p>
                                {activeCard?.example_sentence_en && (
                                  <p className="text-sm text-[var(--text-secondary)]">{activeCard.example_sentence_en}</p>
                                )}
                              </div>
                            </div>
                          )}
                          <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                            Click or press spacebar to flip
                          </span>
                        </div>
                        <button
                          type="button"
                          className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-[var(--border-dark)] bg-[#0b1c25] px-3 py-5 text-3xl text-white hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] sm:block"
                          onClick={() => {
                            setActiveCardIndex((prev) => (prev + 1) % activeCards.length);
                            setShowBack(false);
                          }}
                          aria-label="Next card"
                        >
                          <span aria-hidden="true" className="text-3xl font-semibold leading-none">&gt;</span>
                        </button>
                        <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
                          <div className="text-sm text-[var(--text-secondary)]">{cardCountText}</div>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => {
                                setActiveCardIndex((prev) => (prev - 1 + activeCards.length) % activeCards.length);
                                setShowBack(false);
                              }}
                              className="rounded-md border border-[var(--border-dark)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => {
                                setActiveCardIndex((prev) => (prev + 1) % activeCards.length);
                                setShowBack(false);
                              }}
                              className="rounded-md border border-[var(--border-dark)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                            >
                              Next
                            </button>
                            <button
                              onClick={handleRegenerate}
                              className="rounded-md border border-[var(--border-dark)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-blue)] hover:text-white"
                            >
                              Regenerate
                            </button>
                            <button
                              onClick={handleDelete}
                              className="rounded-md border border-rose-500/60 px-4 py-2 text-sm text-rose-200 hover:border-rose-400 hover:text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div ref={addSectionRef} className="rounded-3xl border border-[var(--border-dark)] bg-[#102029] p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-white">Add new word</h3>
                  <form className="mt-4 space-y-4" onSubmit={handleAddCard}>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-[var(--text-secondary)]">Arabic text</label>
                      <textarea
                        value={arabicInput}
                        onChange={(e) => setArabicInput(e.target.value)}
                        required
                        dir="rtl"
                        lang="ar"
                        className="min-h-[120px] rounded-lg border border-[#1f3642] bg-[#0b1820] px-3 py-3 text-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]"
                        placeholder="اكتب الكلمة أو العبارة هنا"
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
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
