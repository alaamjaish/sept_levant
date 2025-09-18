import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const { arabic_text, audio_url, exercise_type, level, title, short_description } = await req.json();
  if (!arabic_text || !audio_url || !exercise_type) {
    return NextResponse.json(
      { error: "Missing fields" },
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

  // RLS will allow only teachers to insert
  const allowedLevels = ["beginner","intermediate","advanced"] as const;
  const levelValue = allowedLevels.includes((level || "").toLowerCase()) ? (level as typeof allowedLevels[number]) : undefined;

  // Trim inputs to keep UI tidy
  const titleTrimmed = typeof title === 'string' && title.trim() ? title.trim().slice(0, 60) : null;
  const descTrimmed = typeof short_description === 'string' && short_description.trim() ? short_description.trim().slice(0, 160) : null;

  let { data, error } = await supabase
    .from("exercises")
    .insert([{ arabic_text, audio_url, exercise_type, level: levelValue, title: titleTrimmed, short_description: descTrimmed }])
    .select("*")
    .single();
  if (error && /column/i.test(error.message || "")) {
    // Column doesn't exist yet; try progressively simpler payloads
    let payload: any = { arabic_text, audio_url, exercise_type, level: levelValue };
    const retry1 = await supabase.from("exercises").insert([payload]).select("*").single();
    if (retry1.error && /column/i.test(retry1.error.message || "") && /level/i.test(retry1.error.message || "")) {
      payload = { arabic_text, audio_url, exercise_type };
      const retry2 = await supabase.from("exercises").insert([payload]).select("*").single();
      data = retry2.data as any; error = retry2.error as any;
    } else {
      data = retry1.data as any; error = retry1.error as any;
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, exercise: data });
}
