"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LiveTranscriber, { LiveTranscriberHandle } from "@/components/LiveTranscriber";
import { supabase } from "@/lib/supabaseClient";

type Exercise = {
  id: string;
  arabic_text: string;
  audio_url: string;
  exercise_type: "listening" | "speaking";
};

export default function SpeakingLessonPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const lessonId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [role, setRole] = useState<string | null>(null);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [lastTranscript, setLastTranscript] = useState<string>("");

  const [livePartial, setLivePartial] = useState<string>("");
  const [liveFinals, setLiveFinals] = useState<string[]>([]);
  const [liveStatus, setLiveStatus] = useState<"idle" | "connecting" | "listening" | "unsupported" | "error">("idle");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const transcriberRef = useRef<LiveTranscriberHandle>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const recStartRef = useRef<number | null>(null);
  const transcribeAbortRef = useRef<AbortController | null>(null);
  const capturedTranscriptionRef = useRef<{ finals: string[]; partial: string } | null>(null);

  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState("");

  // Audio player for exercise audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
          setRole(prof?.role ?? null);
        }
      } catch {}
    })();
  }, []);

  // Load library and pick current by id (fallback to first)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/exercises/list?type=speaking&limit=100", { cache: "no-store" });
        const j = await res.json();
        const items: Exercise[] = Array.isArray(j?.items) ? j.items : [];
        if (cancelled) return;
        setLibrary(items);
        const cur = items.find((x) => x.id === lessonId) || items[0] || null;
        setExercise(cur);
      } catch {}
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  useEffect(() => {
    if (exercise?.arabic_text) setDraftText(exercise.arabic_text);
  }, [exercise?.id, exercise?.arabic_text]);

  useEffect(() => {
    setAudioPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
    const el = audioRef.current;
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch {}
  }, [exercise?.id]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !exercise?.audio_url) {
      setAudioTime(0);
      setAudioDuration(0);
      setAudioPlaying(false);
      return;
    }
    setAudioTime(0);
    setAudioDuration(0);
    setAudioPlaying(false);
    try { el.load(); } catch {}
  }, [exercise?.audio_url]);

  const idx = useMemo(() => (exercise && library.length ? library.findIndex((x) => x.id === exercise.id) : -1), [exercise?.id, library]);
  const canPrev = idx > 0;
  const canNext = idx >= 0 && idx < library.length - 1;

  function goPrev() {
    if (!canPrev) return;
    const prev = library[idx - 1];
    router.push(`/speaking/lesson/${prev.id}`);
  }
  function goNext() {
    if (!canNext) return;
    const next = library[idx + 1];
    router.push(`/speaking/lesson/${next.id}`);
  }

  function clickAudioProgress(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, x / rect.width));
    const t = ratio * (audioDuration || 0);
    try {
      el.currentTime = t;
    } catch {}
  }

  async function startRecording() {
    setFeedbackMessage("");
    setScore(null);
    setLastTranscript("");
    setLivePartial("");
    setLiveFinals([]);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        try { s.getTracks().forEach((t) => t.stop()); } catch {}
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        setRecording(false);
        const captured = capturedTranscriptionRef.current;
        let transcript = "";
        if (captured && captured.finals.length > 0) transcript = captured.finals.join(" ");
        else if (captured && captured.partial.trim()) transcript = captured.partial.trim();
        else {
          try {
            const base64 = await blobToBase64(blob);
            const ctrl = new AbortController();
            transcribeAbortRef.current = ctrl;
            const tRes = await fetch("/api/speechmatics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audioBase64: base64, mimeType: blob.type || "audio/webm" }), signal: ctrl.signal });
            const data = await tRes.json();
            transcript = data?.transcript || "";
          } catch {}
        }
        setLastTranscript(transcript);
        transcribeAbortRef.current = null;
        try {
          const sRes = await fetch("/api/check-accuracy-enhanced", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ originalText: exercise?.arabic_text ?? "", spokenText: transcript }) });
          const j = await sRes.json().catch(() => ({}));
          const sc = Number((j as any)?.score) || 0;
          setScore(sc);
          setFeedbackMessage(truncateFeedback((j as any)?.feedbackMessage || ""));
        } catch {}
      };
      recStartRef.current = Date.now();
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      transcriberRef.current?.start();
    } catch (e) {}
  }

  function stopRecording() {
    const capturedFinals = [...liveFinals];
    const capturedPartial = livePartial;
    capturedTranscriptionRef.current = { finals: capturedFinals, partial: capturedPartial };
    try { mediaRecorderRef.current?.stop(); } catch {}
    try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
    try { micStream?.getTracks().forEach((t) => t.stop()); } catch {}
    setMicStream(null);
    mediaRecorderRef.current = null;
    recStartRef.current = null;
    setRecording(false);
    transcriberRef.current?.stop();
  }

  if (loading) {
    return <div className="min-h-screen bg-[#101d23] text-white flex items-center justify-center">Loading…</div>;
  }

  return (
    <>
      <style jsx global>{`
        :root { --background-dark:#101d23; --surface-dark:#1a2c38; --border-dark:#223c49; --accent-blue:#0da6f2; --accent-blue-hover:#0a8cd9; --text-primary:#ffffff; --text-secondary:#ffffffb3; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Noto+Sans+Arabic:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>

      <div className="flex min-h-screen flex-col bg-[var(--background-dark)] text-[var(--text-primary)]" style={{fontFamily:'"Space Grotesk", "Noto Sans", sans-serif'}}>
        <header className="flex items-center justify-between border-b border-[var(--border-dark)] px-8 py-3">
          <div className="flex items-center gap-3">
            <a className="text-white/80 hover:text-white text-sm" href="/speaking/lessons">Lessons</a>
            <span className="text-white/40">/</span>
            <a className="text-white/60 hover:text-white text-sm" href="/speaking">Classic</a>
          </div>
          <div className="flex items-center gap-2">
            <a href="/speaking/lessons" className="text-white/70 hover:text-white text-sm">All Lessons</a>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-6xl mx-auto w-full">
          {exercise ? (
            <>
              {/* Left column: exercise content */}
              <div className="rounded-xl border border-[var(--border-dark)] bg-[var(--surface-dark)] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => router.push("/speaking/lessons")} className="text-white/60 hover:text-white text-xs">← All lessons</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={!canPrev} onClick={goPrev} className="px-2 py-1 rounded-md ring-1 ring-[#2b4554] text-white/80 disabled:opacity-40">Prev</button>
                    <button disabled={!canNext} onClick={goNext} className="px-2 py-1 rounded-md ring-1 ring-[#2b4554] text-white/80 disabled:opacity-40">Next</button>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0f1a20] border border-[#2b4554] min-h-[120px]">
                  <p className="text-white text-xl leading-relaxed text-right" style={{fontFamily:'"Noto Sans Arabic", sans-serif'}} dir="rtl" lang="ar">{exercise.arabic_text}</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                    <span>Exercise Audio</span>
                    <span>{formatDuration(audioDuration)}</span>
                  </div>
                  <div className="relative group">
                    <audio ref={audioRef} src={exercise.audio_url || undefined} onPlay={() => setAudioPlaying(true)} onPause={() => setAudioPlaying(false)} onLoadedMetadata={(e) => setAudioDuration((e.target as HTMLAudioElement).duration || 0)} onTimeUpdate={(e) => setAudioTime((e.target as HTMLAudioElement).currentTime || 0)} className="hidden" preload="metadata"/>
                    <div className="h-2 bg-[#0f1a20] rounded-md overflow-hidden border border-[#2b4554] cursor-pointer" onClick={clickAudioProgress}>
                      <div className="h-full bg-[var(--accent-blue)]" style={{ width: `${audioDuration ? (audioTime / audioDuration) * 100 : 0}%` }}></div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => { const el = audioRef.current; if (!el) return; if (audioPlaying) el.pause(); else el.play(); }} className="px-3 py-1 rounded-md bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white text-xs font-bold">
                        {audioPlaying ? "Pause" : "Play"}
                      </button>
                      <div className="text-white/60 text-xs">{formatDuration(audioTime)} / {formatDuration(audioDuration)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: recording + feedback */}
              <div className="rounded-xl border border-[var(--border-dark)] bg-[var(--surface-dark)] p-4">
                <div className="mb-2">
                  <p className="text-white/80 text-sm">Tap to record, then see your live transcription below.</p>
                  <div className="flex-grow flex justify-center items-center bg-black/20 rounded-lg border border-dashed border-[var(--border-dark)] p-4 min-h-[120px]">
                    <div className="w-full">
                      {recording ? (
                        <div className="text-[var(--text-secondary)] text-xl leading-relaxed text-right" style={{fontFamily:'"Noto Sans Arabic", sans-serif'}} dir="rtl" lang="ar">
                          {liveFinals.length > 0 && (<div className="mb-3 text-white">{liveFinals.join(" ")}</div>)}
                          <div className="text-white/70">
                            {livePartial || (liveStatus === "unsupported" ? "Live captions not supported" : liveStatus === "connecting" ? "Connecting…" : liveStatus === "listening" ? "Listening…" : "")}
                          </div>
                        </div>
                      ) : lastTranscript ? (
                        <div className="text-[var(--text-secondary)] text-xl leading-relaxed text-right" style={{fontFamily:'"Noto Sans Arabic", sans-serif'}} dir="rtl" lang="ar">{lastTranscript}</div>
                      ) : (
                        <div className="text-white/40 text-center text-lg">Your transcription will appear here...</div>
                      )}
                    </div>
                    <LiveTranscriber ref={transcriberRef} lang="ar" onPartial={(t) => setLivePartial(t)} onFinal={(t) => setLiveFinals((prev) => (t ? [...prev, t] : prev))} onStatus={(s) => setLiveStatus(s)} />
                  </div>
                </div>
                <div className="flex justify-center items-center mb-4 relative">
                  <button className={`flex items-center justify-center gap-3 h-16 w-16 rounded-full transition-colors text-white shadow-[0_0_0_8px_rgba(13,166,242,0.3)] ${recording ? "bg-red-600 hover:bg-red-500" : "bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)]"}`} onClick={recording ? stopRecording : startRecording}>
                    <span className="material-symbols-outlined text-4xl">{recording ? 'stop' : 'mic'}</span>
                  </button>
                </div>

                <div className="bg-[#101d23] rounded-lg p-4 border border-[var(--border-dark)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2/3">
                      <p className="text-[var(--text-secondary)] text-xs font-medium">Your Score</p>
                      <p className="text-white text-2xl font-bold">{score !== null ? score : 0}%</p>
                    </div>
                    <div className="w-1/3 flex items-center justify-center">
                      <div className="relative w-12 h-12">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-[#315668]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                          <path className={score !== null ? (score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500") : "text-[#315668]"} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${score || 0}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{score !== null ? score : 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[var(--text-secondary)] text-xs mb-3 h-8 overflow-hidden">
                    <p className="font-medium text-white mb-1 line-clamp-2">{score !== null ? (feedbackMessage || "Great job! Keep practicing to improve your pronunciation.") : "Ready to start? Press the microphone button and speak clearly."}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 mt-2 border-t border-[var(--border-dark)]">
                    <button className="flex-1 h-8 px-3 rounded-md bg-[var(--border-dark)] text-white text-xs font-bold hover:bg-[#2c4c5c]" onClick={startRecording}><span className="truncate">{score !== null ? "Try Again" : "Start Recording"}</span></button>
                    {score !== null && score >= 60 && (
                      <button className="flex-1 h-8 px-3 rounded-md bg-[var(--accent-blue)] text-white text-xs font-bold hover:bg-[var(--accent-blue-hover)]" onClick={goNext}><span className="truncate">Next Challenge</span></button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-white/60">Lesson not found</div>
          )}
        </main>
      </div>
    </>
  );
}

function formatDuration(sec: number) {
  if (!sec || isNaN(sec) || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function truncateFeedback(text: string): string {
  const maxLength = 140;
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf(".");
  const lastExclamation = truncated.lastIndexOf("!");
  const lastQuestion = truncated.lastIndexOf("?");
  const lastPunctuation = Math.max(lastSentence, lastExclamation, lastQuestion);
  if (lastPunctuation > maxLength * 0.7) {
    return text.substring(0, lastPunctuation + 1);
  }
  const lastSpace = truncated.lastIndexOf(" ");
  return lastSpace > maxLength * 0.7 ? text.substring(0, lastSpace) + "..." : truncated + "...";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

