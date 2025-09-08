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
  const { data, error } = await supabase
    .from("exercises")
    .select("id, arabic_text, audio_url, exercise_type")
    .eq("exercise_type", type)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    // Fallback to demo stub to avoid blank screens in MVP
    return NextResponse.json({ exercise: stubExercise(type), source: "stub" });
  }

  return NextResponse.json({ exercise: data[0], source: "db" });
}

