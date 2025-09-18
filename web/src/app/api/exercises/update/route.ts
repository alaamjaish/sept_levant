import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Minimal update endpoint: teachers can update text/audio_url of an exercise
function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function PATCH(req: NextRequest) {
  const { id, arabic_text, audio_url, level, title, short_description } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!isUuid(id)) {
    return NextResponse.json(
      { error: "This looks like a demo exercise. Create or load a real exercise to save." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  type ExerciseUpdate = { arabic_text?: string; audio_url?: string; level?: string; title?: string | null; short_description?: string | null };
  const updates: ExerciseUpdate = {};
  if (typeof arabic_text === "string") updates.arabic_text = arabic_text;
  if (typeof audio_url === "string") updates.audio_url = audio_url;
  if (typeof level === "string") {
    const lv = level.toLowerCase();
    if (["beginner","intermediate","advanced"].includes(lv)) updates.level = lv;
  }
  if (typeof title === "string") updates.title = title.trim() ? title.trim().slice(0, 60) : null;
  if (typeof short_description === "string") updates.short_description = short_description.trim() ? short_description.trim().slice(0, 160) : null;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // Ensure the row exists and is readable under RLS
  const exists = await supabase
    .from("exercises")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if ((exists as any)?.error) {
    return NextResponse.json({ error: (exists as any).error.message }, { status: 400 });
  }
  if (!(exists as any)?.data) {
    return NextResponse.json({ error: "Exercise not found (or no read access)" }, { status: 404 });
  }

  let { data, error } = await supabase
    .from("exercises")
    .update(updates)
    .eq("id", id)
    .select("*");

  if (error && /column/i.test(error.message || "")) {
    // Retry progressively, stripping fields that may not exist yet
    let u: any = { ...updates };
    if ('title' in u) delete u.title;
    if ('short_description' in u) delete u.short_description;
    const retry1 = await supabase.from("exercises").update(u).eq("id", id).select("*");
    if (retry1.error && /column/i.test(retry1.error.message || "") && /level/i.test(retry1.error.message || "")) {
      const { level: _omit, ...noLevel } = u as any;
      const retry2 = await supabase.from("exercises").update(noLevel).eq("id", id).select("*");
      data = retry2.data as any; error = retry2.error as any;
    } else {
      data = retry1.data as any; error = retry1.error as any;
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return NextResponse.json({
      error: "No row updated (likely RLS blocked the update). Ensure update_exercises_teachers policy exists and your profile role is 'teacher'.",
    }, { status: 403 });
  }
  return NextResponse.json({ ok: true, exercise: row });
}
