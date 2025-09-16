import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.FLASHCARD_ENRICH_MODEL || "gpt-4.1-mini";
const GOOGLE_TTS_VOICE = process.env.GOOGLE_TTS_VOICE || "ar-XA-Standard-A";
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase service credentials");
}

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required for enrichment");
}

if (!GOOGLE_TTS_API_KEY) {
  throw new Error("GOOGLE_TTS_API_KEY is required for speech synthesis");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function ensureBucket() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  const exists = data?.some((bucket) => bucket.name === "flashcards");
  if (!exists) {
    await supabase.storage.createBucket("flashcards", {
      public: true,
      fileSizeLimit: 1024 * 1024 * 10,
    });
  }
}

function safeString(value, max = 240) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

async function fetchNextJob() {
  const { data, error } = await supabase
    .from("fc_jobs")
    .select(
      "id, card_id, user_id, payload, fc_cards:fc_cards!inner(id, front_text, context_text, language)"
    )
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function claimJob(jobId) {
  const now = new Date().toISOString();
  const { error, data } = await supabase
    .from("fc_jobs")
    .update({ status: "running", updated_at: now })
    .eq("id", jobId)
    .eq("status", "queued")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

async function enrichCard(job) {
  const frontText = safeString(job.payload?.frontText) || job.fc_cards.front_text;
  const contextSnippet = safeString(job.payload?.contextSnippet ?? job.fc_cards.context_text ?? "", 500);
  const language = safeString(job.payload?.language ?? job.fc_cards.language ?? "ar", 8) || "ar";

  const systemPrompt =
    "You are an expert Arabic teacher helping learners understand short vocabulary. Respond ONLY with valid JSON.";
  const userPrompt = `Target language: ${language}
Word or phrase: ${frontText}
Context snippet (optional): ${contextSnippet || "(none)"}

Return a JSON object with:
- meaning_short (<= 12 English words)
- example_sentence_ar (<= 16 Arabic words)
- part_of_speech (noun/verb/etc.)
- transliteration (Latin characters)
If unsure, make your best safe guess.`;

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.4,
    max_tokens: 300,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = completion.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty enrichment response");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error("Failed to parse enrichment JSON");
  }

  return parsed;
}

async function synthesize(text) {
  if (!text) return null;
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "ar-XA", name: GOOGLE_TTS_VOICE },
      audioConfig: { audioEncoding: "MP3" },
    }),
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`TTS request failed: ${details}`);
  }
  const data = await response.json();
  if (!data.audioContent) return null;
  return Buffer.from(data.audioContent, "base64");
}

async function uploadAudio(path, buffer) {
  if (!buffer) return null;
  const { error } = await supabase.storage.from("flashcards").upload(path, buffer, {
    cacheControl: "3600",
    upsert: true,
    contentType: "audio/mpeg",
  });
  if (error) throw error;
  const { data } = supabase.storage.from("flashcards").getPublicUrl(path);
  return data.publicUrl;
}

async function processJob(job) {
  const now = new Date().toISOString();
  try {
    const enrichment = await enrichCard(job);
    const wordAudio = await synthesize(job.fc_cards.front_text);
    const exampleAudio = await synthesize(enrichment.example_sentence_ar || null);
    const basePath = `audio/${job.user_id}/${job.card_id}`;
    const wordUrl = await uploadAudio(`${basePath}/word.mp3`, wordAudio);
    const exampleUrl = await uploadAudio(`${basePath}/example.mp3`, exampleAudio);

    await supabase
      .from("fc_cards")
      .update({
        back_meaning: safeString(enrichment.meaning_short),
        example_text: safeString(enrichment.example_sentence_ar, 320),
        pos: safeString(enrichment.part_of_speech, 40),
        transliteration: safeString(enrichment.transliteration, 120),
        tts_word_url: wordUrl,
        tts_example_url: exampleUrl,
        status: "ready",
        error_reason: null,
        updated_at: now,
      })
      .eq("id", job.card_id);

    await supabase
      .from("fc_jobs")
      .update({ status: "done", error_reason: null, updated_at: now })
      .eq("id", job.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    await supabase
      .from("fc_cards")
      .update({ status: "error_enrichment", error_reason: message, updated_at: now })
      .eq("id", job.card_id);
    await supabase
      .from("fc_jobs")
      .update({ status: "error", error_reason: message, updated_at: now })
      .eq("id", job.id);
    throw error;
  }
}

async function main() {
  await ensureBucket();
  while (true) {
    const job = await fetchNextJob();
    if (!job) {
      console.log("No queued flashcard jobs.");
      break;
    }
    const claimed = await claimJob(job.id);
    if (!claimed) {
      continue;
    }
    try {
      console.log(`Processing flashcard job ${job.id}`);
      await processJob(job);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
    }
  }
}

main().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
