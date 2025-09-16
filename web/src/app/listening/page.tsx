"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FlashcardAddSheet } from "@/components/FlashcardAddSheet";
import { featureFlags } from "@/lib/featureFlags";

type Exercise = {
  id: string;
  arabic_text: string;
  audio_url: string;
  exercise_type: "listening" | "speaking";
};

type SelectionRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

const FLASHCARD_SUCCESS_COPY = "Saved. We'll fill the meaning & audio in the background.";
const SELECTION_RADIUS = 90;

function buildContextSnippet(fullText: string, selection: string) {
  if (!fullText || !selection) return null;
  const index = fullText.indexOf(selection);
  if (index === -1) {
    return fullText.slice(0, Math.min(fullText.length, selection.length + 2 * SELECTION_RADIUS)).trim() || null;
  }
  const start = Math.max(0, index - SELECTION_RADIUS);
  const end = Math.min(fullText.length, index + selection.length + SELECTION_RADIUS);
  return fullText.slice(start, end).trim() || null;
}

export default function ListeningPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetAnchor, setSheetAnchor] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [contextSnippet, setContextSnippet] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashcardsEnabled = featureFlags.flashcards.enabled;

  const clearToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string) => {
      clearToast();
      setToastMessage(message);
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
        toastTimerRef.current = null;
      }, 4000);
    },
    [clearToast]
  );

  useEffect(() => {
    return () => clearToast();
  }, [clearToast]);

  async function fetchExercise() {
    setLoading(true);
    try {
      const res = await fetch("/api/exercises/get-one?type=listening");
      const data = await res.json();
      setExercise(data.exercise ?? null);
      // reset flashcard UI whenever a new exercise loads
      setToolbarPosition(null);
      setSelectionRect(null);
      setSelectedText("");
      setContextSnippet(null);
      setSheetOpen(false);
      setSheetAnchor(null);
      if (typeof window !== "undefined") {
        const selection = window.getSelection();
        selection?.removeAllRanges();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchExercise();
  }, []);

  const handleSelectionUpdate = useCallback(() => {
    if (!flashcardsEnabled || sheetOpen) return;
    if (typeof window === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setToolbarPosition(null);
      return;
    }
    const text = selection.toString().trim();
    if (!text) {
      setToolbarPosition(null);
      return;
    }
    const range = selection.getRangeAt(0);
    const container = textContainerRef.current;
    if (!container) return;
    const node =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as Element)
        : (range.commonAncestorContainer.parentElement as Element | null);
    if (!node || !container.contains(node)) {
      setToolbarPosition(null);
      return;
    }
    const rectSource = range.getClientRects();
    const rect = rectSource.length > 0 ? rectSource[0] : range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      setToolbarPosition(null);
      return;
    }
    const viewportWidth = window.innerWidth;
    const safeLeft = Math.min(viewportWidth - 60, Math.max(60, rect.left + rect.width / 2));
    setToolbarPosition({ top: Math.max(24, rect.top), left: safeLeft });
    setSelectionRect({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
    setSelectedText(text);
    setContextSnippet(buildContextSnippet(exercise?.arabic_text ?? "", text));
  }, [exercise?.arabic_text, flashcardsEnabled, sheetOpen]);

  const scheduleSelectionUpdate = useCallback(() => {
    if (!flashcardsEnabled) return;
    if (typeof window === "undefined") {
      handleSelectionUpdate();
      return;
    }
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => handleSelectionUpdate());
    } else {
      setTimeout(() => handleSelectionUpdate(), 0);
    }
  }, [flashcardsEnabled, handleSelectionUpdate]);

  useEffect(() => {
    if (!flashcardsEnabled) return;
    const handler = () => scheduleSelectionUpdate();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, [flashcardsEnabled, scheduleSelectionUpdate]);

  useEffect(() => {
    if (!flashcardsEnabled) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!textContainerRef.current) return;
      if (textContainerRef.current.contains(event.target as Node)) return;
      setToolbarPosition(null);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [flashcardsEnabled]);

  const openSheet = useCallback(() => {
    if (!flashcardsEnabled) return;
    if (!selectedText) {
      showToast("Select text to add to flashcards first.");
      return;
    }
    const rect = selectionRect;
    if (typeof window === "undefined") return;
    const anchor = rect
      ? {
          top: Math.min(window.innerHeight - 120, rect.bottom + 16),
          left: Math.min(window.innerWidth - 24, Math.max(24, rect.left + rect.width / 2)),
        }
      : {
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        };
    setSheetAnchor(anchor);
    setSheetOpen(true);
    setToolbarPosition(null);
  }, [flashcardsEnabled, selectedText, selectionRect, showToast]);

  const handleSheetCancel = useCallback(() => {
    setSheetOpen(false);
    setSheetAnchor(null);
  }, []);

  const handleSheetAdded = useCallback(() => {
    setSheetOpen(false);
    setSheetAnchor(null);
    setToolbarPosition(null);
    setSelectionRect(null);
    setContextSnippet(null);
    setSelectedText("");
    if (typeof window !== "undefined") {
      const selection = window.getSelection();
      selection?.removeAllRanges();
    }
    showToast(FLASHCARD_SUCCESS_COPY);
  }, [showToast]);

  const handleDotMenu = useCallback(() => {
    if (!flashcardsEnabled) return;
    if (!selectedText) {
      showToast("Select text to add, then choose Add to flashcard.");
      return;
    }
    openSheet();
  }, [flashcardsEnabled, openSheet, selectedText, showToast]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Listening Practice</h1>
        {exercise && (
          <div className="relative rounded-xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-900/10">
            {flashcardsEnabled && (
              <button
                type="button"
                onClick={handleDotMenu}
                className="absolute right-4 top-4 rounded-full border border-transparent px-2 py-1 text-lg text-slate-400 hover:border-slate-200 hover:text-slate-600"
                aria-label="Flashcard options"
              >
                ⋯
              </button>
            )}
            <div
              ref={textContainerRef}
              onMouseUp={scheduleSelectionUpdate}
              onKeyUp={scheduleSelectionUpdate}
              onDoubleClick={scheduleSelectionUpdate}
              onTouchEnd={() => setTimeout(scheduleSelectionUpdate, 0)}
              tabIndex={flashcardsEnabled ? 0 : -1}
              className="mb-4 text-3xl text-slate-800 focus:outline-none"
            >
              {exercise.arabic_text}
            </div>
            <audio controls className="w-full">
              <source src={exercise.audio_url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        <button
          onClick={fetchExercise}
          disabled={loading}
          className="self-start rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-white shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Next Exercise"}
        </button>
      </div>

      {flashcardsEnabled && toolbarPosition && (
        <div
          className="fixed z-[90] flex items-center gap-3 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm text-slate-700 shadow-lg"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: "translate(-50%, -120%)",
          }}
        >
          <button
            type="button"
            onClick={openSheet}
            className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <span aria-hidden>☆</span>
            Add
          </button>
          <button
            type="button"
            onClick={() => setToolbarPosition(null)}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {flashcardsEnabled && (
        <FlashcardAddSheet
          open={sheetOpen}
          anchor={sheetAnchor}
          selectedText={selectedText}
          contextSnippet={contextSnippet}
          onCancel={handleSheetCancel}
          onAdded={handleSheetAdded}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-slate-900/90 px-5 py-2 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
