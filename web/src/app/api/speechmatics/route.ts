import { NextRequest, NextResponse } from "next/server";

// Optional: increase timeout on platforms that support it
// export const maxDuration = 60;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  const { audioBase64, mimeType } = await req.json();
  if (!audioBase64) {
    return NextResponse.json({ error: "Missing audioBase64" }, { status: 400 });
  }

  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey) {
    // Fallback if not configured
    return NextResponse.json({ transcript: "السلام عليكم" });
  }

  try {
    // Real Speechmatics API implementation would go here
    // For now, we return empty transcript since live transcription should be used instead
    return NextResponse.json({ transcript: "" });
  } catch (err) {
    console.error("Speechmatics error:", err);
    // Graceful fallback for demo continuity
    return NextResponse.json({ transcript: "" }, { status: 500 });
  }
}

