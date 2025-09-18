import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import OpenAI from "openai";
import { normalizeDetectedLanguage, type DetectedLanguage } from "../utils";

const ARABIC_CHARS = /[\u0600-\u06FF]/;

type GeneratedCard = {
  front_ar: string;
  back_en: string;
  example_ar: string;
  example_en: string;
  detected_language: DetectedLanguage;
};

async function generateCard(term: string): Promise<GeneratedCard> {
  const detectedLanguage: DetectedLanguage = ARABIC_CHARS.test(term)
    ? "arabic"
    : /[a-zA-Z]/.test(term)
    ? "english"
    : "unknown";

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
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You generate ultra-short bilingual flashcards for Levantine Arabic learners. Respond with JSON containing front_ar, back_en, example_ar, example_en, detected_language. front_ar must be Levantine Arabic script. back_en is the natural English meaning. example_ar must be Levantine (Shami) dialect, 3-4 words max, matching the term. example_en is the English meaning of that exact phrase, also 3-4 words.",
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

export async function POST(request: Request) {
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

  let payload: { setId?: string; term?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const term = (payload.term ?? "").trim();
  const setId = payload.setId?.trim();

  if (!setId) {
    return NextResponse.json({ error: "missing_set", message: "Flashcard set id is required." }, { status: 422 });
  }

  if (!term) {
    return NextResponse.json({ error: "missing_term", message: "Please provide a word to add." }, { status: 422 });
  }

  const { data: setRow, error: setError } = await supabase
    .from("flashcard_sets")
    .select("id")
    .eq("id", setId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (setError) {
    console.error("Failed to lookup flashcard set", setError);
    return NextResponse.json({ error: "set_lookup_failed" }, { status: 500 });
  }

  if (!setRow) {
    return NextResponse.json({ error: "set_not_found" }, { status: 404 });
  }

  try {
    const generated = await generateCard(term);
    const normalizedLanguage = normalizeDetectedLanguage(generated.detected_language);

    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        set_id: setId,
        user_id: user.id,
        front_ar: generated.front_ar,
        back_en: generated.back_en,
        example_ar: generated.example_ar,
        example_en: generated.example_en,
        input_text: term,
        input_language: normalizedLanguage,
      })
      .select("id, front_ar, back_en, example_ar, example_en, created_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Failed to create flashcard", message, error);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
