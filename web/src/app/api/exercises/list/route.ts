import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "speaking").toLowerCase();
  const level = (searchParams.get("level") || "").toLowerCase();
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 100);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({
      items: [
        {
          id: "stub-1",
          arabic_text: "السلام عليكم ورحمة الله",
          audio_url:
            "https://cdn.pixabay.com/download/audio/2021/09/16/audio_49b1f3f06a.mp3?filename=simple-success-1-6297.mp3",
          exercise_type: type as "speaking" | "listening",
        },
      ],
      source: "stub",
    });
  }

  const supabase = createClient(url, anon);
  // Try selecting with 'level'; if column doesn't exist, fallback gracefully.
  async function fetchWithLevel() {
    let q = supabase
      .from("exercises")
      .select("id, arabic_text, audio_url, exercise_type, created_at, level")
      .eq("exercise_type", type)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (level && ["beginner","intermediate","advanced"].includes(level)) {
      q = q.eq("level", level);
    }
    return q;
  }

  const res = await fetchWithLevel();
  if (res.error && /column/i.test(res.error.message || "") && /level/i.test(res.error.message || "")) {
    // Fallback without level
    const { data, error } = await supabase
      .from("exercises")
      .select("id, arabic_text, audio_url, exercise_type, created_at")
      .eq("exercise_type", type)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return NextResponse.json({ items: [], error: error.message }, { status: 200 });
    return NextResponse.json({ items: data || [], source: "db" });
  }
  if (res.error) return NextResponse.json({ items: [], error: res.error.message }, { status: 200 });
  return NextResponse.json({ items: res.data || [], source: "db" });
}

