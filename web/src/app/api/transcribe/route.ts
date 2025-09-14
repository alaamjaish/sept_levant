import { NextRequest, NextResponse } from "next/server";

// Soniox (primary) + Speechmatics (fallback) batch transcription aggregator.
// Never expose keys to the client; this route runs server-side only.

// Optional: increase timeout on platforms that support it
// export const maxDuration = 60;

type TranscribeBody = {
  audioBase64?: string;
  mimeType?: string | null;
  language?: string | null; // e.g., "ar"
};

const SONIOX_BASE = "https://api.soniox.com";
const SPEECHMATICS_BASE = "https://asr.api.speechmatics.com"; // public cloud v2

export async function POST(req: NextRequest) {
  let body: TranscribeBody | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON body" }, { status: 400 });
  }

  const { audioBase64, mimeType } = body || {};
  const language = (body?.language || "ar").toString();
  if (!audioBase64) {
    return NextResponse.json({ error: "Missing audioBase64" }, { status: 400 });
  }

  const bytes = Buffer.from(audioBase64, "base64");
  if (!bytes?.length) {
    return NextResponse.json({ error: "Invalid audio data" }, { status: 400 });
  }

  // Simple silence/size guard: if payload extremely small, bail fast
  if (bytes.length < 2000) {
    return NextResponse.json({ transcript: "", engine: "none", reason: "audio_too_small" });
  }

  const ext = extFromMime(mimeType) || "bin";

  // Try Soniox first
  try {
    const res = await sonioxTranscribe(bytes, ext, language, 25000);
    if (res?.transcript) {
      return NextResponse.json({ transcript: res.transcript.trim(), engine: "soniox", durationMs: res.durationMs });
    }
  } catch (e) {
    // Fallthrough to fallback
    console.error("Soniox transcription error:", scrubError(e));
  }

  // Fallback: Speechmatics
  try {
    const res = await speechmaticsTranscribe(bytes, ext, language, 30000);
    if (res?.transcript) {
      return NextResponse.json({ transcript: res.transcript.trim(), engine: "speechmatics", durationMs: res.durationMs });
    }
  } catch (e) {
    console.error("Speechmatics transcription error:", scrubError(e));
  }

  // If both fail, degrade gracefully
  return NextResponse.json({ transcript: "", engine: "none" }, { status: 200 });
}

function extFromMime(m?: string | null) {
  if (!m) return null;
  const map: Record<string, string> = {
    "audio/webm": "webm",
    "audio/webm;codecs=opus": "webm",
    "audio/ogg": "ogg",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/mp4": "mp4",
    "audio/m4a": "m4a",
    "audio/aac": "aac",
    "audio/3gpp": "3gp",
    "audio/3gp": "3gp",
  };
  const key = m.toLowerCase();
  return map[key] || null;
}

function scrubError(e: unknown) {
  const err = e as any;
  return {
    name: err?.name,
    message: err?.message,
    status: err?.status,
  };
}

async function sonioxTranscribe(bytes: Buffer, ext: string, language: string, timeoutMs: number) {
  const apiKey = process.env.SONIOX_API_KEY;
  if (!apiKey) throw Object.assign(new Error("Missing SONIOX_API_KEY"), { status: 500 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    // 1) Upload file -> get file id
    const fd = new FormData();
    fd.append("file", new Blob([bytes]), `audio.${ext}`);
    const fileUpload = await fetch(`${SONIOX_BASE}/v1/files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fd,
      signal: controller.signal,
    });
    if (!fileUpload.ok) throw Object.assign(new Error(`Soniox file upload failed ${fileUpload.status}`), { status: fileUpload.status });
    const fileJson: any = await fileUpload.json();
    const fileId = fileJson?.id;
    if (!fileId) throw new Error("Soniox missing file id");

    // 2) Create transcription
    const config = {
      model: process.env.SONIOX_ASYNC_MODEL || "stt-async-preview",
      // Strong hint for Arabic; you can allow auto too
      language_hints: [language],
      // Attach uploaded file id
      audio_url: null,
      file_id: fileId,
    } as any;

    const create = await fetch(`${SONIOX_BASE}/v1/transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
      signal: controller.signal,
    });
    if (!create.ok) throw Object.assign(new Error(`Soniox create failed ${create.status}`), { status: create.status });
    const createJson: any = await create.json();
    const trId = createJson?.id;
    if (!trId) throw new Error("Soniox missing transcription id");

    // 3) Poll status until completed or error
    let status: string | null = null;
    let attempt = 0;
    while (true) {
      if (Date.now() - started > timeoutMs - 1000) throw Object.assign(new Error("Soniox timeout"), { status: 504 });
      const g = await fetch(`${SONIOX_BASE}/v1/transcriptions/${trId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      if (!g.ok) throw Object.assign(new Error(`Soniox status failed ${g.status}`), { status: g.status });
      const st: any = await g.json();
      status = st?.status;
      if (status === "completed") break;
      if (status === "error") throw Object.assign(new Error(st?.error_message || "Soniox error"), { status: 500 });
      await sleep(600 + Math.min(1400, attempt * 200));
      attempt++;
    }

    // 4) Fetch transcript tokens
    const t = await fetch(`${SONIOX_BASE}/v1/transcriptions/${trId}/transcript`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    if (!t.ok) throw Object.assign(new Error(`Soniox transcript failed ${t.status}`), { status: t.status });
    const result: any = await t.json();
    const tokens: any[] = Array.isArray(result?.tokens) ? result.tokens : [];
    const text = tokens.map((tk) => (tk?.text || "")).join("");

    const durationMs = Date.now() - started;
    return { transcript: (text || "").trim(), durationMs };
  } finally {
    clearTimeout(timeout);
  }
}

async function speechmaticsTranscribe(bytes: Buffer, ext: string, language: string, timeoutMs: number) {
  const apiKey = process.env.SPEECHMATICS_API_KEY;
  if (!apiKey) throw Object.assign(new Error("Missing SPEECHMATICS_API_KEY"), { status: 500 });

  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Create job (multipart form)
    const form = new FormData();
    form.append("data_file", new Blob([bytes]), `audio.${ext}`);
    const config = {
      type: "transcription",
      transcription_config: {
        language,
        // operating_point: "enhanced", // optional
      },
    };
    form.append("config", new Blob([JSON.stringify(config)], { type: "application/json" }));

    const create = await fetch(`${SPEECHMATICS_BASE}/v2/jobs/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: controller.signal,
    });
    if (!create.ok) throw Object.assign(new Error(`Speechmatics create failed ${create.status}`), { status: create.status });
    const cj: any = await create.json();
    const jobId = cj?.id || cj?.job?.id;
    if (!jobId) throw new Error("Speechmatics missing job id");

    // Poll job status
    let status: string = "";
    let attempt = 0;
    while (true) {
      if (Date.now() - started > timeoutMs - 1000) throw Object.assign(new Error("Speechmatics timeout"), { status: 504 });
      const g = await fetch(`${SPEECHMATICS_BASE}/v2/jobs/${jobId}/`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      if (!g.ok) throw Object.assign(new Error(`Speechmatics status failed ${g.status}`), { status: g.status });
      const st: any = await g.json();
      status = st?.job?.status || st?.status || "";
      if (["done", "completed"].includes(status)) break;
      if (["failed", "error"].includes(status)) throw Object.assign(new Error("Speechmatics job failed"), { status: 500 });
      await sleep(700 + Math.min(1600, attempt * 200));
      attempt++;
    }

    // Fetch transcript (plain text if possible, else json)
    // Try txt first
    let transcript = "";
    const txt = await fetch(`${SPEECHMATICS_BASE}/v2/jobs/${jobId}/transcript?format=txt`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    if (txt.ok) {
      transcript = await txt.text();
    } else {
      const js = await fetch(`${SPEECHMATICS_BASE}/v2/jobs/${jobId}/transcript`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      if (js.ok) {
        const jj: any = await js.json();
        transcript = extractSpeechmaticsText(jj);
      }
    }

    const durationMs = Date.now() - started;
    return { transcript: (transcript || "").trim(), durationMs };
  } finally {
    clearTimeout(timeout);
  }
}

function extractSpeechmaticsText(j: any): string {
  try {
    // Best-effort extraction from a typical SM JSON structure
    const results = j?.results || j?.channels?.[0]?.alternatives?.[0]?.words;
    if (Array.isArray(results)) {
      return results.map((w: any) => w?.name || w?.word || w?.content || "").join(" ");
    }
  } catch {}
  return "";
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// small helper to create FormData from File in Edge runtimes
// (no helpers)
