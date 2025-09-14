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
  // Try selecting with 'level', 'title', and 'short_description'; if any column doesn't exist, fallback gracefully.
  async function fetchFull() {
    let q = supabase
      .from("exercises")
      .select("id, arabic_text, audio_url, exercise_type, created_at, level, title, short_description")
      .eq("exercise_type", type)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (level && ["beginner","intermediate","advanced"].includes(level)) {
      q = q.eq("level", level);
    }
    return q;
  }

  const res = await fetchFull();
  if (res.error && /column/i.test(res.error.message || "")) {
    // Fallback without potentially missing columns (level/title/short_description)
    const { data, error } = await supabase
      .from("exercises")
      .select("id, arabic_text, audio_url, exercise_type, created_at")
      .eq("exercise_type", type)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return NextResponse.json({ items: [], error: error.message }, { status: 200 });
    const items = (data || []).map((row: any) => ({
      ...row,
      // Provide title fallback on server
      title: deriveTitle(row.title, row.arabic_text),
      short_description: row.short_description ?? null,
    }));
    // Sort by level (default beginner) then newest first
    items.sort((a: any, b: any) => {
      const ra = levelRank(a.level);
      const rb = levelRank(b.level);
      if (ra !== rb) return ra - rb;
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return tb - ta;
    });
    return NextResponse.json({ items, source: "db" });
  }
  if (res.error) return NextResponse.json({ items: [], error: res.error.message }, { status: 200 });
  const items = (res.data || []).map((row: any) => ({
    ...row,
    title: deriveTitle(row.title, row.arabic_text),
    short_description: row.short_description ?? null,
  }));
  // Ensure deterministic order: Beginner -> Intermediate -> Advanced, then newest first
  items.sort((a: any, b: any) => {
    const ra = levelRank(a.level);
    const rb = levelRank(b.level);
    if (ra !== rb) return ra - rb;
    const ta = new Date(a.created_at || 0).getTime();
    const tb = new Date(b.created_at || 0).getTime();
    return tb - ta;
  });
  return NextResponse.json({ items, source: "db" });
}

function deriveTitle(title: any, arabic_text: any): string | null {
  const t = (typeof title === 'string' && title.trim() !== '') ? title.trim() : '';
  if (t) return t;
  const a = (typeof arabic_text === 'string') ? arabic_text.trim() : '';
  if (!a) return null;
  // Take first sentence or first 60 chars
  const firstSentenceMatch = a.split(/[\.\!\؟\!\?\n\r]/)[0]?.trim() || '';
  const base = firstSentenceMatch || a;
  return base.length > 60 ? base.slice(0, 60) : base;
}

function levelRank(level?: string) {
  switch ((level || "beginner").toLowerCase()) {
    case "beginner":
      return 0;
    case "intermediate":
      return 1;
    case "advanced":
      return 2;
    default:
      return 3;
  }
}

