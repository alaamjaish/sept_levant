const rawFlashcards =
  process.env.NEXT_PUBLIC_FLASHCARDS_ENABLED ?? process.env.FLASHCARDS_ENABLED;

const normalizeBoolean = (value: string | undefined | null, fallback = true) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (["0", "false", "off", "no"].includes(normalized)) return false;
  if (["1", "true", "on", "yes"].includes(normalized)) return true;
  return fallback;
};

export const featureFlags = {
  flashcards: {
    enabled: normalizeBoolean(rawFlashcards, true),
  },
} as const;

export function isFlashcardsEnabled() {
  return featureFlags.flashcards.enabled;
}
