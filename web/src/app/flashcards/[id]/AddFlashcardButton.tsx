"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AddFlashcardButtonProps = {
  setId: string;
};

export default function AddFlashcardButton({ setId }: AddFlashcardButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || loading;

  const reset = () => {
    setTerm("");
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = term.trim();
    if (!value) {
      setError("Add a word to create a card.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch("/api/flashcards/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: value, setId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.message || "Could not generate the card. Try again.");
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
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-blue)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-blue-hover)] disabled:cursor-not-allowed disabled:bg-[var(--accent-blue)]/60"
      >
        + Add a new card
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl border border-[var(--border-dark)] bg-[var(--surface-dark)] p-8 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Add card</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Generate a flashcard</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Enter a word in Arabic or English. We will translate it, keep Arabic on the front, and craft two short sentences.
                </p>
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

            <div className="mt-6 text-left">
              <label className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Word</label>
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Type a word..."
                className="mt-2 w-full rounded-2xl border border-[var(--border-dark)] bg-[var(--background-dark)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none"
                maxLength={120}
                autoFocus
              />
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
                {busy ? "Generating..." : "Generate card"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
