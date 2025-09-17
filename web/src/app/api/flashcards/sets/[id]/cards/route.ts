import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { clampSentence, generateCardContent } from "@/app/api/flashcards/_lib";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const setId = params.id;
  if (!isUuid(setId)) {
    return NextResponse.json({ error: "Invalid set id" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ cards: [] }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("flashcards")
    .select("id, front_arabic, back_english, example_sentence_ar, example_sentence_en, created_at")
    .eq("set_id", setId)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ cards: [], error: error.message }, { status: 400 });
  }

  return NextResponse.json({ cards: data || [] });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const setId = params.id;
  if (!isUuid(setId)) {
    return NextResponse.json({ error: "Invalid set id" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const frontArabic = typeof body?.frontArabic === "string" ? body.frontArabic.trim() : "";
  if (!frontArabic) {
    return NextResponse.json({ error: "Arabic text is required" }, { status: 400 });
  }
  const manualMeaning = typeof body?.englishMeaning === "string" ? body.englishMeaning.trim() : "";
  const hint = typeof body?.hint === "string" ? body.hint.trim() : "";

  const generated = await generateCardContent(frontArabic, hint || manualMeaning);
  const englishMeaning = manualMeaning || generated.englishMeaning || "Translation pending";
  const clamp = clampSentence(generated.sentenceAr);
  const exampleAr = clamp.text;
  const exampleEn = generated.sentenceEn;

  const { data, error } = await supabase
    .from("flashcards")
    .insert([
      {
        owner_id: user.id,
        set_id: setId,
        front_arabic: frontArabic,
        back_english: englishMeaning,
        example_sentence_ar: exampleAr,
        example_sentence_en: exampleEn,
      },
    ])
    .select("id, front_arabic, back_english, example_sentence_ar, example_sentence_en, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    card: data,
    meta: {
      usedLLM: generated.usedLLM,
      truncated: clamp.truncated || generated.truncated,
      llmError: generated.error || null,
    },
  });
}
