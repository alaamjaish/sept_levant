"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type EditFlashcardSetButtonProps = {
  setId: string;
  title: string;
  description: string | null;
};

export default function EditFlashcardSetButton({ setId, title, description }: EditFlashcardSetButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formTitle, setFormTitle] = useState(title);
  const [formDescription, setFormDescription] = useState(description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  const busy = isSaving || isRefreshing;

  useEffect(() => {
    setFormTitle(title);
    setFormDescription(description ?? "");
  }, [title, description]);

  const reset = () => {
    setFormTitle(title);
    setFormDescription(description ?? "");
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formTitle.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch(`/api/flashcards/sets/${setId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim() || null,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(payload?.message || "Could not save changes.");
        return;
      }
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-full p-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
        title="Edit set details"
        aria-label="Edit set details"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
          <path d="M14.06 6.19l3.75 3.75 1.44-1.44a1.5 1.5 0 0 0 0-2.12l-1.63-1.63a1.5 1.5 0 0 0-2.12 0l-1.44 1.44z" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl border border-[var(--border-dark)] bg-[var(--surface-dark)] p-8 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Edit set</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Update details</h2>
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
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder="Update title"
                  maxLength={120}
                  className="mt-2 w-full rounded-2xl border border-[var(--border-dark)] bg-[var(--background-dark)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="text-left">
                <label className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
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
                {busy ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
