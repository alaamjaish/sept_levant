"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";

// Define the color palette
const colorPalette = [
  { name: "Blue", value: "#0ea5e9" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

export default function NewFlashcardSetButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // State for selected color, defaulting to blue
  const [selectedColor, setSelectedColor] = useState(colorPalette[0].value);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const busy = loading || isSubmitting;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setError(null);
    // Reset color back to default blue
    setSelectedColor(colorPalette[0].value);
  };

  const closeModal = () => {
    setOpen(false);
    reset();
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
        // Add the selected color to the request body
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          coverSeed: selectedColor,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.message || "Could not create set. Try again.");
        return;
      }
      closeModal();
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

      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:px-4"
          onClick={closeModal}
        >
          <div
            className="flex h-full w-full items-center justify-center overflow-y-auto py-4 sm:py-8"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md rounded-3xl border border-[var(--border-dark)] bg-[var(--surface-dark)] p-6 shadow-xl sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Create set</p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)] sm:mt-2 sm:text-2xl">New flashcard set</h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full bg-white/5 p-2 text-[var(--text-secondary)] transition hover:bg-white/10"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <div className="mt-4 space-y-4 sm:mt-6">
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
                    rows={2}
                    className="mt-2 w-full resize-none rounded-2xl border border-[var(--border-dark)] bg-[var(--background-dark)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none"
                  />
                </div>
                {/* Color Picker */}
                <div className="text-left">
                  <label className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Color</label>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {colorPalette.map((color) => (
                      <button
                        type="button"
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        disabled={busy}
                        className={`h-9 w-9 rounded-full border-2 transition-all hover:scale-110 ${
                          selectedColor === color.value
                            ? "border-white scale-110 shadow-lg"
                            : "border-transparent"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <div className="mt-4 flex items-center justify-end gap-3 sm:mt-6">
                <button
                  type="button"
                  onClick={closeModal}
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
        </div>,
        document.body
      )}
    </>
  );
}