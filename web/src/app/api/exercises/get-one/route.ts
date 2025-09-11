import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function stubExercise(type: string) {
  if (type === "speaking") {
    return {
      id: "stub-speaking-1",
      arabic_text: "مرحبًا! كيف حالُك؟ قل الجملة نفسها بصوتٍ واضح.",
      audio_url:
        "https://cdn.pixabay.com/download/audio/2021/09/16/audio_49b1f3f06a.mp3?filename=simple-success-1-6297.mp3",
      exercise_type: "speaking" as const,
    };
  }
  return {
    id: "stub-listening-1",
    arabic_text: "السلامُ عليكم. اسمعْ جيدًا ثم اقرأ النص.",
    audio_url:
      "https://cdn.pixabay.com/download/audio/2021/09/16/audio_49b1f3f06a.mp3?filename=simple-success-1-6297.mp3",
    exercise_type: "listening" as const,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "listening").toLowerCase();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    return NextResponse.json({ exercise: stubExercise(type), source: "stub" });
  }

  const supabase = createClient(url, anon);
  // Try selecting with 'level'; if column doesn't exist, fallback gracefully.
  const res = await supabase
    .from("exercises")
    .select("id, arabic_text, audio_url, exercise_type, level")
    .eq("exercise_type", type)
    .order("created_at", { ascending: false })
    .limit(1);

  if (res.error && /column/i.test(res.error.message || "") && /level/i.test(res.error.message || "")) {
    const res2 = await supabase
      .from("exercises")
      .select("id, arabic_text, audio_url, exercise_type")
      .eq("exercise_type", type)
      .order("created_at", { ascending: false })
      .limit(1);
    if (res2.error || !res2.data || res2.data.length === 0) {
      return NextResponse.json({ exercise: stubExercise(type), source: "stub" });
    }
    return NextResponse.json({ exercise: res2.data[0], source: "db" });
  }

  if (res.error || !res.data || res.data.length === 0) {
    return NextResponse.json({ exercise: stubExercise(type), source: "stub" });
  }

  return NextResponse.json({ exercise: res.data[0], source: "db" });
}

