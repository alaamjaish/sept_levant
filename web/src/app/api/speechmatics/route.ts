import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

// Optional: increase timeout on platforms that support it
// export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { audioBase64, mimeType } = await req.json();
  if (!audioBase64) {
    return NextResponse.json({ error: "Missing audioBase64" }, { status: 400 });
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    // No key configured: return empty so caller can degrade gracefully
    return NextResponse.json({ transcript: "" });
  }

  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const bytes = Buffer.from(audioBase64, "base64");
    const ext = extFromMime(mimeType) || "webm";
    const file = await toFile(bytes, `audio.${ext}`);
    const model = process.env.TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe"; // or 'whisper-1'

    const result = await openai.audio.transcriptions.create({
      file,
      model,
      language: "ar",
    } as any);

    const text = (result as any)?.text || (result as any)?.transcript || "";
    return NextResponse.json({ transcript: (text || "").trim() });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json({ transcript: "" }, { status: 200 });
  }
}

function extFromMime(m?: string | null) {
  if (!m) return null;
  const map: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/ogg": "ogg",
    "audio/3gpp": "3gp",
  };
  return map[m] || null;
}

