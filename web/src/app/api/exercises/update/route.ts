import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// Minimal update endpoint: teachers can update text/audio_url of an exercise
export async function PATCH(req: NextRequest) {
  const { id, arabic_text, audio_url } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  type ExerciseUpdate = { arabic_text?: string; audio_url?: string };
  const updates: ExerciseUpdate = {};
  if (typeof arabic_text === "string") updates.arabic_text = arabic_text;
  if (typeof audio_url === "string") updates.audio_url = audio_url;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("exercises")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, exercise: data });
}
