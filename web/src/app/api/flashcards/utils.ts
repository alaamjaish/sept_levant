const SUPPORTED_DETECTED_LANGUAGES = ["arabic", "english", "unknown"] as const;

export type DetectedLanguage = (typeof SUPPORTED_DETECTED_LANGUAGES)[number];

export function normalizeDetectedLanguage(value: unknown): DetectedLanguage {
  if (typeof value !== "string") {
    return "unknown";
  }

  const normalized = value.trim().toLowerCase();
  return (SUPPORTED_DETECTED_LANGUAGES as readonly string[]).includes(normalized)
    ? (normalized as DetectedLanguage)
    : "unknown";
}