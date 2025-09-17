import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ sets: [] }, { status: 200 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number.parseInt(searchParams.get("limit") || "100", 10) || 100, 200);

  const { data, error } = await supabase
    .from("flashcard_sets")
    .select("id, title, description, cover_image, created_at, flashcards(count)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ sets: [], error: error.message }, { status: 400 });
  }

  const sets = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    cover_image: row.cover_image,
    created_at: row.created_at,
    cards_count: Array.isArray(row.flashcards) && row.flashcards.length > 0 ? row.flashcards[0]?.count || 0 : row.flashcards?.count || 0,
  }));

  return NextResponse.json({ sets });
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const description = typeof body?.description === "string" ? body.description.trim() : null;
  const coverImage = typeof body?.coverImage === "string" ? body.coverImage.trim() : null;

  const { data, error } = await supabase
    .from("flashcard_sets")
    .insert([
      {
        owner_id: user.id,
        title,
        description,
        cover_image: coverImage,
      },
    ])
    .select("id, title, description, cover_image, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ set: { ...data, cards_count: 0 } });
}
