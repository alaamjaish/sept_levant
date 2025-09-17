"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export default function NewFlashcardSetButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const busy = loading || isSubmitting;

  const reset = () => {
    setTitle("");
    setDescription("");
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/flashcards/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.message || "Could not create set. Try again.");
        return;
      }
      reset();
      setOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={busy}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--accent-blue)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-blue-hover)] disabled:cursor-not-allowed disabled:bg-[var(--accent-blue)]/60"
      >
        <span aria-hidden>+</span>
        <span>New Set</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl border border-[var(--border-dark)] bg-[var(--surface-dark)] p-8 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Create set</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">New flashcard set</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="rounded-full bg-white/5 p-2 text-[var(--text-secondary)] transition hover:bg-white/10"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="text-left">
                <label className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="My new deck"
                  maxLength={120}
                  className="mt-2 w-full rounded-2xl border border-[var(--border-dark)] bg-[var(--background-dark)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="text-left">
                <label className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional short summary"
                  maxLength={220}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-[var(--border-dark)] bg-[var(--background-dark)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="rounded-full px-5 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-blue)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-blue-hover)] disabled:cursor-not-allowed disabled:bg-[var(--accent-blue)]/60"
              >
                {busy ? "Creating..." : "Create set"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
