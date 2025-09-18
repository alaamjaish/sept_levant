import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import OpenAI from "openai";
import { normalizeDetectedLanguage, type DetectedLanguage } from "../../../utils";

const ARABIC_CHARS = /[\u0600-\u06FF]/;

type GeneratedCard = {
  front_ar: string;
  back_en: string;
  example_ar: string;
  example_en: string;
  detected_language: DetectedLanguage;
};

async function generateCard(term: string, detectedLanguage: DetectedLanguage): Promise<GeneratedCard> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const fallbackFront = detectedLanguage === "english" ? term : term || "";
    const fallbackBack = detectedLanguage === "arabic" ? "Translation" : term || "Word";
    return {
      front_ar: detectedLanguage === "arabic" ? term : fallbackFront,
      back_en: fallbackBack,
      example_ar:
        detectedLanguage === "arabic"
          ? `${term} U�U^U+ O"OU,O"USO�`
          : "OO3O�O1U.U, OU,U�U,U.Oc",
      example_en: detectedLanguage === "english" ? `${term} at home` : "Use the word",
      detected_language: detectedLanguage,
    };
  }

  const openai = new OpenAI({ apiKey });
  const payload = {
    term,
    input_language: detectedLanguage,
    dialect: "levantine",
    rules: {
      arabic_on_front: true,
      english_on_back: true,
      max_sentence_words: 4,
    },
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You generate ultra-short bilingual flashcards for Levantine Arabic learners. Respond with JSON containing front_ar, back_en, example_ar, example_en, detected_language. front_ar must be Levantine Arabic script. back_en is the natural English meaning. example_ar must be Levantine (Shami) dialect, 3-5 words max, matching the term. example_en is the English meaning of that exact phrase, also 3-5 words.",
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(raw) as Partial<GeneratedCard>;
  const normalizedDetected = normalizeDetectedLanguage(parsed.detected_language ?? detectedLanguage);

  return {
    front_ar: parsed.front_ar ?? term,
    back_en: parsed.back_en ?? term,
    example_ar:
      parsed.example_ar ??
      (normalizedDetected === "arabic" ? `${term} U�U^U+ O"OU,O"USO�` : "OO3O�O1U.U, OU,U�U,U.Oc"),
    example_en: parsed.example_en ?? (normalizedDetected === "english" ? `${term} at home` : "Use the word"),
    detected_language: normalizedDetected,
  };
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (!resolvedParams.id) {
    return NextResponse.json({ error: "missing_card_id" }, { status: 422 });
  }

  const { data: cardRow, error: cardError } = await supabase
    .from("flashcards")
    .select("id,set_id,user_id,input_text,input_language")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (cardError) {
    console.error("Failed to lookup flashcard", cardError);
    return NextResponse.json({ error: "card_lookup_failed" }, { status: 500 });
  }

  if (!cardRow) {
    return NextResponse.json({ error: "card_not_found" }, { status: 404 });
  }

  const term = cardRow.input_text || "";
  const storedLanguage = normalizeDetectedLanguage(cardRow.input_language);
  const fallbackLanguage: DetectedLanguage = ARABIC_CHARS.test(term)
    ? "arabic"
    : /[a-zA-Z]/.test(term)
    ? "english"
    : "unknown";
  const detected = storedLanguage !== "unknown" ? storedLanguage : fallbackLanguage;

  try {
    const generated = await generateCard(term, detected);
    const normalizedLanguage = normalizeDetectedLanguage(generated.detected_language);

    const { data, error } = await supabase
      .from("flashcards")
      .update({
        front_ar: generated.front_ar,
        back_en: generated.back_en,
        example_ar: generated.example_ar,
        example_en: generated.example_en,
        input_language: normalizedLanguage,
      })
      .eq("id", resolvedParams.id)
      .eq("user_id", user.id)
      .select("id, front_ar, back_en, example_ar, example_en, created_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Failed to regenerate flashcard", message, error);
    return NextResponse.json({ error: "regenerate_failed" }, { status: 500 });
  }
}
