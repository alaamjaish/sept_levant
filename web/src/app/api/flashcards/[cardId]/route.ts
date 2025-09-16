import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { isFlashcardsEnabled } from "@/lib/featureFlags";

export async function GET(
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

  const { data: card, error } = await supabase
    .from("fc_cards")
    .select(
      "id, deck_id, front_text, back_meaning, example_text, transliteration, pos, tts_word_url, tts_example_url, status, error_reason, created_at, updated_at, language"
    )
    .eq("id", cardId)
    .eq("user_id", user.id)
    .single();

  if (error || !card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ card });
}
