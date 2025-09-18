import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Notes:
 * - Uses a VALID default model. Override with env: LLM_MODEL
 * - Forces JSON output from the LLM (response_format)
 * - Never reads req.json() twice
 * - Deterministic scoring is ALWAYS computed; LLM only crafts wording.
 * - If LLM fails, you still get a sensible score + clear fallback flag.
 * - All user-visible text is in ENGLISH.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.LLM_MODEL || "gpt-4.1-nano";

function normalizeArabic(input: string) {
  return (input || "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0671]/g, "") // remove diacritics/harakat
    .replace(/[\u0610-\u061A\u06D6-\u06ED]/g, "") // more marks
    .replace(/[\p{P}\p{S}]/gu, " ") // punctuation/symbols
    .replace(/\s+/g, " ")
    .trim();
}

function splitWords(s: string): string[] {
  if (!s) return [];
  // Arabic + basic Latin word chunks
  return s
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

/**
 * Longest Common Subsequence length for order/sequence similarity
 */
function lcsLen(a: string[], b: string[]): number {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[n][m];
}

/**
 * Quick gibberish detector proxy:
 * ratio of Arabic-script chars in spoken text.
 */
function arabicCharRatio(s: string): number {
  if (!s) return 0;
  const total = s.length;
  let ar = 0;
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    // Arabic blocks ranges (basic, supplement, presentation forms)
    if (
      (code >= 0x0600 && code <= 0x06FF) ||
      (code >= 0x0750 && code <= 0x077F) ||
      (code >= 0x08A0 && code <= 0x08FF) ||
      (code >= 0xFB50 && code <= 0xFDFF) ||
      (code >= 0xFE70 && code <= 0xFEFF)
    ) {
      ar++;
    }
  }
  return total ? ar / total : 0;
}

/**
 * Deterministic scoring that mirrors your rubric.
 * Returns { score, breakdown, matchedWords }
 */
function computeScoreDeterministic(originalRaw: string, spokenRaw: string) {
  const original = normalizeArabic(originalRaw);
  const spoken = normalizeArabic(spokenRaw);

  const oWords = splitWords(original);
  const sWords = splitWords(spoken);

  const totalWords = oWords.length;
  const spokenCount = sWords.length;

  if (totalWords === 0) {
    return {
      score: 0,
      breakdown: { coverage: 0, accuracy: 0, order: 0, pronunciation: 0 },
      matchedWords: 0,
      extraCapsApplied: [],
      totalWords,
      spokenCount,
    };
  }

  // Exact per-word match count (strict)
  // We mark matches greedily in order to avoid double-counting
  const matched: boolean[] = new Array(spokenCount).fill(false);
  let matchedWords = 0;
  for (let i = 0, k = 0; i < totalWords && k < spokenCount; i++) {
    for (let j = k; j < spokenCount; j++) {
      if (!matched[j] && oWords[i] === sWords[j]) {
        matched[j] = true;
        matchedWords++;
        k = j + 1;
        break;
      }
    }
  }

  // Coverage (40%)
  const coverage = matchedWords / totalWords; // portion of original words present

  // Accuracy (30%): correct / spoken
  const accuracy = spokenCount > 0 ? matchedWords / spokenCount : 0;

  // Order & Meaning (20%): use LCS proportion over matches (if no matches, 0)
  const lcs = lcsLen(oWords, sWords);
  const order = matchedWords > 0 ? Math.min(1, lcs / matchedWords) : 0;

  // Pronunciation proxy (10%): based on Arabic char ratio in transcript
  const arRatio = arabicCharRatio(spokenRaw);
  // If transcript has mostly Arabic, score higher; if mostly non-Arabic, lower.
  // Map ratio 0..1 to 0.2..1 (don’t zero-out when partial Arabic appears)
  const pronunciation = spokenCount === 0 ? 0 : Math.max(0, Math.min(1, 0.2 + 0.8 * arRatio));

  // Base score by weights
  let rawScore =
    0.4 * coverage * 100 +
    0.3 * accuracy * 100 +
    0.2 * order * 100 +
    0.1 * pronunciation * 100;

  const caps: string[] = [];

  // Hard rubric caps
  if (coverage < 0.2) {
    rawScore = Math.min(rawScore, Math.round(coverage * 100));
    caps.push("coverage_cap");
  }
  if (order < 0.5 && matchedWords > 0) {
    rawScore = Math.min(rawScore, 50);
    caps.push("order_cap_50");
  }
  if (arRatio < 0.25 && matchedWords < totalWords * 0.3) {
    rawScore = Math.min(rawScore, 15);
    caps.push("gibberish_cap_15");
  }

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score,
    breakdown: {
      coverage: Math.round(coverage * 100),
      accuracy: Math.round(accuracy * 100),
      order: Math.round(order * 100),
      pronunciation: Math.round(pronunciation * 100),
    },
    matchedWords,
    totalWords,
    spokenCount,
    extraCapsApplied: caps,
  };
}

export async function POST(req: NextRequest) {
  let body: { originalText?: string; spokenText?: string } | null = null;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        score: 0,
        feedbackMessage: "Couldn't read the request.",
        feedbackDetail: "There was a problem with the submitted data format.",
        debugInfo: { fallback: true, reason: "bad_request_body" },
      },
      { status: 400 }
    );
  }

  const originalText = body?.originalText ?? "";
  const spokenText = body?.spokenText ?? "";

  // Deterministic baseline (always)
  const det = computeScoreDeterministic(originalText, spokenText);

  // If there’s nothing spoken, return immediately without LLM
  if (!spokenText?.trim()) {
    return NextResponse.json({
      score: 0,
      feedbackMessage: "We didn’t receive any spoken text to evaluate.",
      feedbackDetail: "Try recording again and say the full sentence clearly from start to finish.",
      debugInfo: {
        fallback: true,
        reason: "empty_spoken_text",
        ...det,
      },
    });
  }

  // LLM step (for feedback wording). We still provide det.score as the single source of truth.
  try {
    const prompt = `
You are an Arabic speaking coach, but your audience is English-speaking learners.
Use the provided, already-calculated numbers as the FINAL score.
Do NOT change the score. Only craft messages.

Return strict JSON with keys:
- score (0-100, integer): use the provided "finalScore".
- feedbackMessage (1 sentence, honest but encouraging, in ENGLISH only).
- feedbackDetail (2–4 short sentences, concrete next steps, in ENGLISH only).
- debugInfo: include totalWords, wordsSpoken, wordCoverage, orderCorrect (boolean), usedDeterministic=true.

Context:
ORIGINAL TEXT:
${originalText}

TRANSCRIBED (student said):
${spokenText}

Precomputed stats (source of truth):
- totalWords: ${det.totalWords}
- wordsSpoken: ${det.spokenCount}
- matchedWords: ${det.matchedWords}
- wordCoverage%: ${det.breakdown.coverage}
- wordAccuracy%: ${det.breakdown.accuracy}
- wordOrder%: ${det.breakdown.order}
- pronunciationProxy%: ${det.breakdown.pronunciation}
- finalScore: ${det.score}
- caps: ${det.extraCapsApplied.join(", ") || "none"}

Rules to reflect in feedback tone (but DO NOT change the score):
- If coverage < 20% → tell them to include more of the sentence's words.
- If order < 50% → remind them to keep the original word order; suggest repeating the first 3–4 words in sequence.
- If pronunciationProxy < 40% → mention clarity of Arabic sounds (e.g., longer vowels, clearer consonants).
- Keep it concise, friendly, and speaking out loud–friendly.
`;

    const completion = await openai.chat.completions.create({
      model: MODEL, // e.g., "gpt-4.1-mini"
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 450,
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("empty_llm_content");

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("llm_invalid_json");
    }

    // Validate & lock score to deterministic
    const finalScore = Number.isFinite(parsed?.score) ? Math.round(parsed.score) : det.score;

    const safe = {
      score: Math.max(0, Math.min(100, det.score)), // force deterministic score
      feedbackMessage:
        typeof parsed?.feedbackMessage === "string" && parsed.feedbackMessage.trim()
          ? parsed.feedbackMessage.trim()
          : det.score >= 80
          ? "Excellent work!"
          : det.score >= 60
          ? "Good attempt — keep refining."
          : "Solid start — let’s build it up.",
      feedbackDetail:
        typeof parsed?.feedbackDetail === "string" && parsed.feedbackDetail.trim()
          ? parsed.feedbackDetail.trim()
          : buildFallbackDetail(det),
      debugInfo: {
        usedDeterministic: true,
        fromLLM: true,
        finalScoreFromLLM: finalScore,
        totalWords: det.totalWords,
        wordsSpoken: det.spokenCount,
        wordCoverage: det.breakdown.coverage,
        orderCorrect: det.breakdown.order >= 80, // simple boolean proxy
        extraCapsApplied: det.extraCapsApplied,
      },
    };

    return NextResponse.json(safe);
  } catch (err: any) {
    // Robust fallback with the deterministic numbers + clear flag
    return NextResponse.json(
      {
        score: det.score,
        feedbackMessage:
          det.score >= 80
            ? "Excellent work!"
            : det.score >= 60
            ? "Good attempt — keep refining."
            : "Solid start — let’s build it up.",
        feedbackDetail: buildFallbackDetail(det),
        debugInfo: {
          fallback: true,
          reason: err?.message || "llm_error",
          usedDeterministic: true,
          totalWords: det.totalWords,
          wordsSpoken: det.spokenCount,
          wordCoverage: det.breakdown.coverage,
          orderCorrect: det.breakdown.order >= 80,
          extraCapsApplied: det.extraCapsApplied,
        },
      },
      { status: 200 }
    );
  }
}

function buildFallbackDetail(det: ReturnType<typeof computeScoreDeterministic>) {
  const tips: string[] = [];
  if (det.breakdown.coverage < 60) {
    tips.push("Aim to say all key words from the sentence — don’t skip important ones.");
  }
  if (det.breakdown.order < 60) {
    tips.push("Keep the original word order: slowly repeat the first 3–4 words in the same sequence.");
  }
  if (det.breakdown.pronunciation < 50) {
    tips.push("Improve clarity: hold the vowels a bit longer and make consonants crisp.");
  }
  if (tips.length === 0) {
    tips.push("Try a slightly slower pace, then increase speed while keeping accuracy.");
  }
  return tips.join(" ");
}
