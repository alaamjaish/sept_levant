"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { FlashcardSet } from "@/data/flashcards";

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

function getColorFromSeed(seed: string | null | undefined) {
  if (seed && seed.startsWith("#")) {
    return seed;
  }
  return colorPalette[0].value;
}

function formatCardCount(count: number) {
  if (count === 1) return "1 Card";
  return `${count} Cards`;
}

type FlashcardSetCardProps = {
  set: FlashcardSet;
  index: number;
};

export default function FlashcardSetCard({ set, index }: FlashcardSetCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(getColorFromSeed(set.coverSeed));
  const [editTitle, setEditTitle] = useState(set.title);
  const [editDescription, setEditDescription] = useState(set.description || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Touch/swipe handling
  const startX = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;

    if (isRevealed) {
      // If already revealed, allow swiping right to hide (positive deltaX from revealed position)
      const newTranslateX = -120 + deltaX;
      const clampedDelta = Math.max(Math.min(newTranslateX, 0), -120);
      setTranslateX(clampedDelta);
    } else {
      // If not revealed, only allow left swipe (negative deltaX)
      if (deltaX < 0) {
        const clampedDelta = Math.max(deltaX, -120); // Max 120px swipe
        setTranslateX(clampedDelta);
      }
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;

    if (isRevealed) {
      // If revealed, check if swiping back to normal
      if (translateX > -60) {
        // Swipe back to normal if moved more than halfway back
        setIsRevealed(false);
        setTranslateX(0);
      } else {
        // Stay revealed
        setIsRevealed(true);
        setTranslateX(-120);
      }
    } else {
      // If not revealed, check if swiping to reveal
      if (translateX < -60) {
        // Reveal actions if swiped more than 60px
        setIsRevealed(true);
        setTranslateX(-120);
      } else {
        // Snap back if not swiped enough
        setIsRevealed(false);
        setTranslateX(0);
      }
    }
  };

  const resetSwipe = () => {
    setIsRevealed(false);
    setTranslateX(0);
  };

  const handleEdit = () => {
    resetSwipe();
    setIsEditing(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/flashcards/sets/${set.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete set:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/flashcards/sets/${set.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          coverSeed: selectedColor,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update set:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Edit Modal
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border-dark)] bg-[var(--surface-dark)] p-6 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Edit set</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">Update flashcard set</h2>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-full bg-white/5 p-2 text-[var(--text-secondary)] transition hover:bg-white/10"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div className="text-left">
              <label className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Title</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Set title"
                maxLength={120}
                className="mt-2 w-full rounded-2xl border border-[var(--border-dark)] bg-[var(--background-dark)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="text-left">
              <label className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Optional description"
                maxLength={220}
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-[var(--border-dark)] bg-[var(--background-dark)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-blue)] focus:outline-none"
              />
            </div>

            {/* Color Picker */}
            <div className="text-left">
              <label className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">Color</label>
              <div className="mt-2 grid grid-cols-4 gap-3">
                {colorPalette.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    disabled={isUpdating}
                    className={`w-12 h-12 rounded-xl border-2 transition-all hover:scale-110 ${
                      selectedColor === color.value
                        ? "border-white shadow-lg scale-110"
                        : "border-gray-500"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-full px-5 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating || !editTitle.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-blue)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-blue-hover)] disabled:cursor-not-allowed disabled:bg-[var(--accent-blue)]/60"
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Actions - Only show when revealed */}
      {isRevealed && (
        <div className="absolute inset-y-0 right-0 flex">
          <button
            onClick={handleEdit}
            className="flex w-16 items-center justify-center bg-blue-500 text-white transition-colors hover:bg-blue-600"
            aria-label="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex w-16 items-center justify-center bg-red-500 text-white transition-colors hover:bg-red-600 disabled:bg-red-400"
            aria-label="Delete"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Main Card */}
      <div
        className="relative bg-[var(--surface-dark)] border border-[var(--border-dark)] rounded-lg transition-transform"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={resetSwipe}
      >
        <Link
          href={`/flashcards/${set.id}`}
          className="block p-4 transition-all hover:bg-[var(--surface-dark)]/80"
        >
          {/* Accent bar */}
          <div
            className="absolute left-0 top-0 w-1 h-full rounded-l-lg"
            style={{ backgroundColor: selectedColor }}
          />

          {/* Content */}
          <div className="ml-3">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] line-clamp-2 leading-tight">
                {set.title}
              </h2>
              <span
                className="ml-2 shrink-0 rounded-md px-2 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: selectedColor }}
              >
                {formatCardCount(set.cardCount)}
              </span>
            </div>
            {set.description && (
              <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                {set.description}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">Recent</span>
              {isRevealed && (
                <span className="text-xs text-[var(--text-secondary)]">← Swipe for actions</span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}