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
    // 1) Create a Speechmatics batch job
    const createRes = await fetch("https://asr.api.speechmatics.com/v2/jobs/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "transcription",
        transcription_config: {
          language: "ar",
        },
        audio: {
          type: "base64",
          data: audioBase64,
          mime_type: mimeType || "audio/webm",
        },
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error("Speechmatics create job failed:", text);
      return NextResponse.json({ transcript: "" }, { status: 502 });
    }
    const created = await createRes.json();
    const jobId = created?.id || created?.job?.id;
    if (!jobId) {
      return NextResponse.json({ transcript: "" }, { status: 502 });
    }

    // 2) Poll for completion (up to ~20s)
    let status = "";
    for (let i = 0; i < 20; i++) {
      const stRes = await fetch(
        `https://asr.api.speechmatics.com/v2/jobs/${jobId}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );
      if (!stRes.ok) break;
      const st = await stRes.json();
      status = st?.job?.status || st?.status || "";
      if (status === "done" || status === "completed") break;
      if (status === "failed") {
        console.error("Speechmatics job failed:", JSON.stringify(st));
        return NextResponse.json({ transcript: "" }, { status: 502 });
      }
      await sleep(1000);
    }

    // 3) Fetch plain text transcript
    const txRes = await fetch(
      `https://asr.api.speechmatics.com/v2/jobs/${jobId}/transcript?format=txt`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    if (!txRes.ok) {
      const text = await txRes.text();
      console.error("Speechmatics transcript fetch failed:", text);
      return NextResponse.json({ transcript: "" }, { status: 502 });
    }
    const transcript = await txRes.text();
    return NextResponse.json({ transcript: transcript?.trim?.() || transcript });
  } catch (err) {
    console.error("Speechmatics error:", err);
    // Graceful fallback for demo continuity
    return NextResponse.json({ transcript: "" }, { status: 500 });
  }
}

