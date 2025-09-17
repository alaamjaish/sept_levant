import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

type RouteContext = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (!params.id) {
    return NextResponse.json({ error: "missing_set_id" }, { status: 422 });
  }

  let payload: { title?: string; description?: string | null };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if (typeof payload.title === "string") {
    const trimmed = payload.title.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "empty_title", message: "Title cannot be empty." }, { status: 422 });
    }
    updates.title = trimmed;
    updates.cover_seed = trimmed;
  }
  if (typeof payload.description === "string") {
    updates.description = payload.description.trim() || null;
  } else if (payload.description === null) {
    updates.description = null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  const { data: exists, error: readError } = await supabase
    .from("flashcard_sets")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "set_lookup_failed" }, { status: 500 });
  }

  if (!exists) {
    return NextResponse.json({ error: "set_not_found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("flashcard_sets")
    .update(updates)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id,title,description,cover_seed,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
