import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { clampSentence, generateCardContent } from "@/app/api/flashcards/_lib";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; cardId: string } }) {
  const { id: setId, cardId } = params;
  if (!isUuid(setId) || !isUuid(cardId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
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
  const updates: Record<string, any> = {};
  let regenerate = false;
  let regenerateHint = "";

  if (typeof body?.frontArabic === "string" && body.frontArabic.trim()) {
    updates.front_arabic = body.frontArabic.trim();
  }
  if (typeof body?.englishMeaning === "string") {
    updates.back_english = body.englishMeaning.trim() || "Translation pending";
  }
  if (typeof body?.sentenceAr === "string") {
    const clamp = clampSentence(body.sentenceAr);
    updates.example_sentence_ar = clamp.text;
  }
  if (typeof body?.sentenceEn === "string") {
    updates.example_sentence_en = body.sentenceEn.trim() || null;
  }
  if (typeof body?.regenerate === "boolean") {
    regenerate = body.regenerate;
  }
  if (typeof body?.hint === "string") {
    regenerateHint = body.hint.trim();
  }

  if (regenerate) {
    const baseFront = updates.front_arabic || body?.existingFrontArabic;
    const baseMeaning = updates.back_english || body?.existingEnglishMeaning;
    if (typeof baseFront === "string" && baseFront) {
      const generated = await generateCardContent(baseFront, regenerateHint || baseMeaning);
      const clamp = clampSentence(generated.sentenceAr);
      updates.back_english = generated.englishMeaning || baseMeaning || "Translation pending";
      updates.example_sentence_ar = clamp.text;
      updates.example_sentence_en = generated.sentenceEn;
      updates._meta = {
        usedLLM: generated.usedLLM,
        truncated: clamp.truncated || generated.truncated,
        llmError: generated.error || null,
      };
    }
  }

  const meta = updates._meta;
  delete updates._meta;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("flashcards")
    .update(updates)
    .eq("id", cardId)
    .eq("set_id", setId)
    .eq("owner_id", user.id)
    .select("id, front_arabic, back_english, example_sentence_ar, example_sentence_en, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ card: data, meta: meta ?? undefined });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; cardId: string } }) {
  const { id: setId, cardId } = params;
  if (!isUuid(setId) || !isUuid(cardId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", cardId)
    .eq("set_id", setId)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
