import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: NextRequest) {
  const { arabic_text, audio_url, exercise_type, level } = await req.json();
  if (!arabic_text || !audio_url || !exercise_type) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // RLS will allow only teachers to insert
  const allowedLevels = ["beginner","intermediate","advanced"] as const;
  const levelValue = allowedLevels.includes((level || "").toLowerCase()) ? (level as typeof allowedLevels[number]) : undefined;

  let { data, error } = await supabase
    .from("exercises")
    .insert([{ arabic_text, audio_url, exercise_type, level: levelValue }])
    .select("*")
    .single();
  if (error && /column/i.test(error.message || "") && /level/i.test(error.message || "")) {
    // Column doesn't exist yet; try again without level
    const retry = await supabase
      .from("exercises")
      .insert([{ arabic_text, audio_url, exercise_type }])
      .select("*")
      .single();
    data = retry.data as any;
    error = retry.error as any;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, exercise: data });
}
