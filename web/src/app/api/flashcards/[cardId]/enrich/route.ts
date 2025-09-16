import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { isFlashcardsEnabled } from "@/lib/featureFlags";

export async function POST(
  _req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  if (!isFlashcardsEnabled()) {
    return NextResponse.json({ error: "Flashcards are disabled" }, { status: 404 });
  }

  const cardId = params?.cardId;
  if (!cardId) {
    return NextResponse.json({ error: "cardId is required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    data: card,
    error: cardError,
  } = await supabase
    .from("fc_cards")
    .select("id, user_id, deck_id, status, front_text, language, context_text")
    .eq("id", cardId)
    .eq("user_id", user.id)
    .single();

  if (cardError || !card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  await supabase
    .from("fc_cards")
    .update({ status: "pending_enrichment", error_reason: null, updated_at: now })
    .eq("id", cardId)
    .eq("user_id", user.id);

  const payload: Record<string, unknown> = {
    frontText: card.front_text,
    language: card.language,
  };
  if (card.context_text) payload.contextSnippet = card.context_text;

  const { error: jobError } = await supabase.from("fc_jobs").insert([
    {
      card_id: cardId,
      user_id: user.id,
      job_type: "enrich",
      status: "queued",
      payload,
      created_at: now,
      updated_at: now,
    },
  ]);

  if (jobError) {
    await supabase
      .from("fc_cards")
      .update({ status: "error_enrichment", error_reason: "failed_to_queue", updated_at: new Date().toISOString() })
      .eq("id", cardId)
      .eq("user_id", user.id);
    return NextResponse.json({ error: "Unable to queue enrichment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
