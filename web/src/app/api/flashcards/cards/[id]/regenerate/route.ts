import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import OpenAI from "openai";

const ARABIC_CHARS = /[\u0600-\u06FF]/;

type GeneratedCard = {
  front_ar: string;
  back_en: string;
  example_ar: string;
  example_en: string;
  detected_language: "arabic" | "english" | "unknown";
};

async function generateCard(term: string, detectedLanguage: GeneratedCard["detected_language"]): Promise<GeneratedCard> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const fallbackFront = detectedLanguage === "english" ? term : term || "";
    const fallbackBack = detectedLanguage === "arabic" ? "Translation" : term || "Word";
    return {
      front_ar: detectedLanguage === "arabic" ? term : fallbackFront,
      back_en: fallbackBack,
      example_ar: detectedLanguage === "arabic" ? `${term} هون بالبيت` : "استعمل الكلمة",
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
  return {
    front_ar: parsed.front_ar ?? term,
    back_en: parsed.back_en ?? term,
    example_ar:
      parsed.example_ar ?? (detectedLanguage === "arabic" ? `${term} هون بالبيت` : "استعمل الكلمة"),
    example_en: parsed.example_en ?? (detectedLanguage === "english" ? `${term} at home` : "Use the word"),
    detected_language: parsed.detected_language ?? detectedLanguage,
  };
}

type RouteContext = {
  params: { id: string };
};

export async function POST(_request: Request, { params }: RouteContext) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (!params.id) {
    return NextResponse.json({ error: "missing_card_id" }, { status: 422 });
  }

  const { data: cardRow, error: cardError } = await supabase
    .from("flashcards")
    .select("id,set_id,user_id,input_text,input_language")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (cardError) {
    return NextResponse.json({ error: "card_lookup_failed" }, { status: 500 });
  }

  if (!cardRow) {
    return NextResponse.json({ error: "card_not_found" }, { status: 404 });
  }

  const term = cardRow.input_text || "";
  const detected = cardRow.input_language && cardRow.input_language !== "unknown"
    ? (cardRow.input_language as GeneratedCard["detected_language"])
    : (ARABIC_CHARS.test(term) ? "arabic" : /[a-zA-Z]/.test(term) ? "english" : "unknown");

  try {
    const generated = await generateCard(term, detected);

    const { data, error } = await supabase
      .from("flashcards")
      .update({
        front_ar: generated.front_ar,
        back_en: generated.back_en,
        example_ar: generated.example_ar,
        example_en: generated.example_en,
        input_language: generated.detected_language,
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id, front_ar, back_en, example_ar, example_en, created_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to regenerate flashcard", error);
    return NextResponse.json({ error: "regenerate_failed" }, { status: 500 });
  }
}
