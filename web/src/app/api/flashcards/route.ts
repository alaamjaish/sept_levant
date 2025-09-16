import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

import { isFlashcardsEnabled } from "@/lib/featureFlags";

type CreateCardRequest = {
  text?: string;
  deckId?: string | null;
  newDeckName?: string | null;
  language?: string | null;
  contextSnippet?: string | null;
};

const DEFAULT_DECK_NAME = "My Cards";
const MAX_CARD_TEXT_LENGTH = 240;
const MAX_CONTEXT_LENGTH = 480;
const MAX_DECK_NAME_LENGTH = 80;

function sanitizeText(input?: string | null, fallback = "") {
  if (!input) return fallback;
  const trimmed = input.trim();
  if (!trimmed) return fallback;
  return trimmed.normalize("NFC");
}

function sanitizeDeckName(input?: string | null) {
  const value = sanitizeText(input);
  if (!value) return null;
  return value.slice(0, MAX_DECK_NAME_LENGTH);
}

function toIsoNow() {
  return new Date().toISOString();
}

export async function POST(req: NextRequest) {
  if (!isFlashcardsEnabled()) {
    return NextResponse.json({ error: "Flashcards are disabled" }, { status: 404 });
  }

  let body: CreateCardRequest | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = sanitizeText(body?.text);
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const language = sanitizeText(body?.language, "ar").slice(0, 8);
  const contextText = sanitizeText(body?.contextSnippet)?.slice(0, MAX_CONTEXT_LENGTH) || null;
  const normalizedText = text.slice(0, MAX_CARD_TEXT_LENGTH);

  const deckId = await ensureDeck({
    supabase,
    userId: user.id,
    deckId: body?.deckId,
    newDeckName: body?.newDeckName,
  });

  if (!deckId) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const now = toIsoNow();
  const { data: card, error: insertError } = await supabase
    .from("fc_cards")
    .insert([
      {
        user_id: user.id,
        deck_id: deckId,
        front_text: normalizedText,
        language,
        context_text: contextText,
        status: "pending_enrichment",
        created_at: now,
        updated_at: now,
        error_reason: null,
      },
    ])
    .select(
      "id, deck_id, status, created_at, updated_at"
    )
    .single();

  if (insertError || !card) {
    return NextResponse.json({ error: insertError?.message || "Failed to create card" }, { status: 400 });
  }

  // bump deck updated_at to keep "recent decks" accurate
  await supabase
    .from("fc_decks")
    .update({ updated_at: now })
    .eq("id", deckId)
    .eq("user_id", user.id);

  const payload = contextText
    ? { contextSnippet: contextText, language, frontText: normalizedText }
    : { language, frontText: normalizedText };

  const { error: jobError } = await supabase.from("fc_jobs").insert([
    {
      card_id: card.id,
      user_id: user.id,
      job_type: "enrich",
      status: "queued",
      payload,
      created_at: now,
      updated_at: now,
    },
  ]);

  let status = card.status;
  if (jobError) {
    status = "error_enrichment";
    await supabase
      .from("fc_cards")
      .update({ status, error_reason: "failed_to_queue", updated_at: toIsoNow() })
      .eq("id", card.id)
      .eq("user_id", user.id);
  }

  return NextResponse.json({
    card: {
      id: card.id,
      deckId,
      status,
    },
    queued: !jobError,
  });
}

export async function GET(req: NextRequest) {
  if (!isFlashcardsEnabled()) {
    return NextResponse.json({ error: "Flashcards are disabled" }, { status: 404 });
  }

  const deckId = req.nextUrl.searchParams.get("deckId");
  if (!deckId) {
    return NextResponse.json({ error: "deckId is required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: deck, error: deckError } = await supabase
    .from("fc_decks")
    .select("id, name, created_at, updated_at")
    .eq("id", deckId)
    .eq("user_id", user.id)
    .single();

  if (deckError || !deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const { data: cards, error: cardsError } = await supabase
    .from("fc_cards")
    .select(
      "id, deck_id, front_text, back_meaning, example_text, transliteration, pos, tts_word_url, tts_example_url, status, error_reason, created_at, updated_at, language"
    )
    .eq("deck_id", deckId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (cardsError) {
    return NextResponse.json({ error: cardsError.message }, { status: 400 });
  }

  return NextResponse.json({ deck, cards: cards || [] });
}

type EnsureDeckArgs = {
  supabase: SupabaseClient<any, "public", any>;
  userId: string;
  deckId?: string | null;
  newDeckName?: string | null;
};

async function ensureDeck({ supabase, userId, deckId, newDeckName }: EnsureDeckArgs) {
  if (deckId) {
    const { data } = await supabase
      .from("fc_decks")
      .select("id")
      .eq("id", deckId)
      .eq("user_id", userId)
      .single();
    if (data?.id) return data.id as string;
  }

  const sanitizedNewDeck = sanitizeDeckName(newDeckName);
  if (sanitizedNewDeck) {
    const now = toIsoNow();
    const { data, error } = await supabase
      .from("fc_decks")
      .insert([
        {
          user_id: userId,
          name: sanitizedNewDeck,
          created_at: now,
          updated_at: now,
        },
      ])
      .select("id")
      .single();
    if (!error && data?.id) {
      return data.id as string;
    }
  }

  const { data: existing } = await supabase
    .from("fc_decks")
    .select("id")
    .eq("user_id", userId)
    .eq("name", DEFAULT_DECK_NAME)
    .maybeSingle();

  if (existing?.id) {
    return existing.id as string;
  }

  const now = toIsoNow();
  const { data: created } = await supabase
    .from("fc_decks")
    .insert([
      {
        user_id: userId,
        name: DEFAULT_DECK_NAME,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("id")
    .single();

  return created?.id ?? null;
}
