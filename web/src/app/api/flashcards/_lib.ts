import OpenAI from "openai";

const openaiClient = process.env.FLASHCARDS_ENABLE_LLM === "false" || !process.env.OPENAI_API_KEY
  ? null
  : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = process.env.FLASHCARDS_LLM_MODEL || "gpt-4.1-mini";
const MAX_WORDS = Math.max(
  1,
  Math.min(5, Number.parseInt(process.env.FLASHCARDS_SENTENCE_MAX_WORDS || "5", 10) || 5)
);

export type GeneratedContent = {
  englishMeaning: string | null;
  sentenceAr: string | null;
  sentenceEn: string | null;
  usedLLM: boolean;
  truncated: boolean;
  error?: string;
};

function clampWords(input: string, maxWords: number): { text: string; truncated: boolean } {
  const cleaned = (input || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return { text: "", truncated: false };
  const words = cleaned.split(" ");
  if (words.length <= maxWords) return { text: cleaned, truncated: false };
  return { text: words.slice(0, maxWords).join(" "), truncated: true };
}

export async function generateCardContent(
  arabic: string,
  hint?: string
): Promise<GeneratedContent> {
  if (!openaiClient) {
    return {
      englishMeaning: null,
      sentenceAr: null,
      sentenceEn: null,
      usedLLM: false,
      truncated: false,
      error: "llm_disabled",
    };
  }
  try {
    const prompt = `You are helping an English-speaking learner build Levantine Arabic flashcards.
Return strict JSON with keys: english_meaning, sentence_ar, sentence_en.
Constraints:
- english_meaning: concise translation in English (max 6 words).
- sentence_ar: Levantine dialect, natural tone, exactly 4 or 5 words, must include the term.
- sentence_en: English translation of the Arabic sentence.
Avoid additional fields or explanations.

Term: ${arabic}
${hint ? `Context/hint: ${hint}` : ""}`;

    const completion = await openaiClient.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 220,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("empty_response");
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      throw new Error(`invalid_json: ${(err as Error).message}`);
    }
    const rawMeaning = typeof parsed?.english_meaning === "string" ? parsed.english_meaning.trim() : "";
    const rawSentenceAr = typeof parsed?.sentence_ar === "string" ? parsed.sentence_ar : "";
    const rawSentenceEn = typeof parsed?.sentence_en === "string" ? parsed.sentence_en.trim() : "";
    const { text: sentenceAr, truncated } = clampWords(rawSentenceAr, MAX_WORDS);

    return {
      englishMeaning: rawMeaning || null,
      sentenceAr: sentenceAr || null,
      sentenceEn: rawSentenceEn || null,
      usedLLM: true,
      truncated,
    };
  } catch (error: any) {
    return {
      englishMeaning: null,
      sentenceAr: null,
      sentenceEn: null,
      usedLLM: false,
      truncated: false,
      error: error?.message || "llm_error",
    };
  }
}

export function clampSentence(arabic: string | null): { text: string | null; truncated: boolean } {
  if (!arabic) return { text: null, truncated: false };
  const { text, truncated } = clampWords(arabic, MAX_WORDS);
  return { text: text || null, truncated };
}
