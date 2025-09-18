import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (!resolvedParams.id) {
    return NextResponse.json({ error: "missing_set_id" }, { status: 422 });
  }

  let payload: { title?: string; description?: string | null; coverSeed?: string };
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
    // Only update cover_seed with title if no specific coverSeed is provided
    if (!payload.coverSeed) {
      updates.cover_seed = trimmed;
    }
  }
  if (typeof payload.description === "string") {
    updates.description = payload.description.trim() || null;
  } else if (payload.description === null) {
    updates.description = null;
  }
  if (typeof payload.coverSeed === "string") {
    updates.cover_seed = payload.coverSeed;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  }

  const { data: exists, error: readError } = await supabase
    .from("flashcard_sets")
    .select("id")
    .eq("id", resolvedParams.id)
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
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .select("id,title,description,cover_seed,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (!resolvedParams.id) {
    return NextResponse.json({ error: "missing_set_id" }, { status: 422 });
  }

  // Check if set exists and belongs to user
  const { data: exists, error: readError } = await supabase
    .from("flashcard_sets")
    .select("id")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "set_lookup_failed" }, { status: 500 });
  }

  if (!exists) {
    return NextResponse.json({ error: "set_not_found" }, { status: 404 });
  }

  // Delete the set (cascade will delete associated flashcards)
  const { error } = await supabase
    .from("flashcard_sets")
    .delete()
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
