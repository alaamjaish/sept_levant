import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

import { isFlashcardsEnabled } from "@/lib/featureFlags";

const MAX_DECK_NAME_LENGTH = 80;

function sanitizeDeckName(name?: string | null) {
  if (!name) return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.normalize("NFC").slice(0, MAX_DECK_NAME_LENGTH);
}

export async function GET(req: NextRequest) {
  if (!isFlashcardsEnabled()) {
    return NextResponse.json({ error: "Flashcards are disabled" }, { status: 404 });
  }

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = Math.max(1, Math.min(Number(limitParam) || 10, 50));

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("fc_decks")
    .select("id, name, created_at, updated_at, fc_cards(count)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ decks: data || [] });
}

export async function POST(req: NextRequest) {
  if (!isFlashcardsEnabled()) {
    return NextResponse.json({ error: "Flashcards are disabled" }, { status: 404 });
  }

  let body: { name?: string | null } | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = sanitizeDeckName(body?.name);
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("fc_decks")
    .insert([
      {
        user_id: user.id,
        name,
        created_at: now,
        updated_at: now,
      },
    ])
    .select("id, name, created_at, updated_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Unable to create deck" }, { status: 400 });
  }

  return NextResponse.json({ deck: data }, { status: 201 });
}
