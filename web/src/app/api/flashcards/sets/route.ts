import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
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

  let payload: { title?: string; description?: string };
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const title = (payload.title ?? "").trim();
  const descriptionValue = payload.description ? String(payload.description).trim() : null;
  const description = descriptionValue ? descriptionValue : null;

  if (!title) {
    return NextResponse.json({ error: "missing_title", message: "Title is required." }, { status: 422 });
  }

  try {
    const { data, error } = await supabase
      .from("flashcard_sets")
      .insert({
        user_id: user.id,
        title,
        description,
        cover_seed: title,
      })
      .select("id, title, description, cover_seed, created_at")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to create flashcard set", error);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
