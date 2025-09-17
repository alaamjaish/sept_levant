import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!isUuid(id)) {
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

  const { searchParams } = new URL(req.url);
  const includeCards = searchParams.get("includeCards") !== "false";

  const { data: set, error } = await supabase
    .from("flashcard_sets")
    .select("id, title, description, cover_image, created_at")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!set) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let cards: any[] | undefined;
  if (includeCards) {
    const { data: rows, error: cardsErr } = await supabase
      .from("flashcards")
      .select("id, front_arabic, back_english, example_sentence_ar, example_sentence_en, created_at")
      .eq("set_id", id)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (cardsErr) {
      return NextResponse.json({ error: cardsErr.message }, { status: 400 });
    }
    cards = rows || [];
  }

  return NextResponse.json({ set, cards: cards ?? undefined });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!isUuid(id)) {
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
  if (typeof body?.title === "string" && body.title.trim()) {
    updates.title = body.title.trim();
  }
  if (typeof body?.description === "string") {
    updates.description = body.description.trim() || null;
  }
  if (typeof body?.coverImage === "string") {
    const trimmed = body.coverImage.trim();
    updates.cover_image = trimmed || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("flashcard_sets")
    .update(updates)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, title, description, cover_image, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ set: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!isUuid(id)) {
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
    .from("flashcard_sets")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
