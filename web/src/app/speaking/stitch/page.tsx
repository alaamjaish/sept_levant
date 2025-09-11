"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Noto_Sans_Arabic, Space_Grotesk } from "next/font/google";
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space",
});
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-ar",
});
import LiveTranscriber, { LiveTranscriberHandle } from "@/components/LiveTranscriber";
import Link from "next/link";
import LevelMeter from "@/components/LevelMeter";
import { supabase } from "@/lib/supabaseClient";

type Exercise = {
  id: string;
  arabic_text: string;
  audio_url: string;
  exercise_type: "listening" | "speaking";
};

export default function SpeakingStitchPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [lastStudentBlob, setLastStudentBlob] = useState<Blob | null>(null);
  // Last recording duration (not currently displayed)

  const [livePartial, setLivePartial] = useState<string>("");
  const [liveFinals, setLiveFinals] = useState<string[]>([]);
  const [liveStatus, setLiveStatus] = useState<
    "idle" | "connecting" | "listening" | "unsupported" | "error"
  >("idle");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const transcriberRef = useRef<LiveTranscriberHandle>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const recStartRef = useRef<number | null>(null);
  const transcribeAbortRef = useRef<AbortController | null>(null);

  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState("");

  // Audio player state (exercise audio)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Admin audio replace/remove state
  const teacherMediaRef = useRef<MediaRecorder | null>(null);
  const teacherChunksRef = useRef<BlobPart[]>([]);
  const [teacherRecording, setTeacherRecording] = useState(false);
  const [replaceSaving, setReplaceSaving] = useState(false);
  const [replaceError, setReplaceError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();
          setRole(prof?.role ?? null);
        }
      } catch {}
    })();
    fetchExercise();
    refreshLibrary();
    // clean audio listeners on unmount
    return () => {
      try {
        transcriberRef.current?.stop();
      } catch {}
      try {
        mediaRecorderRef.current?.stop();
      } catch {}
      try {
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        micStream?.getTracks().forEach((t) => t.stop());
      } catch {}
      try {
        transcribeAbortRef.current?.abort();
      } catch {}
      transcribeAbortRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (exercise?.arabic_text) setDraftText(exercise.arabic_text);
  }, [exercise?.id, exercise?.arabic_text]);

  // Reset audio state when exercise changes
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

  // Attach audio event listeners
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setAudioPlaying(true);
    const onPause = () => setAudioPlaying(false);
    const onTime = () => setAudioTime(el.currentTime || 0);
    const onLoaded = () => setAudioDuration(el.duration || 0);
    const onEnded = () => {
      setAudioPlaying(false);
      setAudioTime(el.duration || 0);
    };
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
    };
  }, [audioRef.current]);

  async function fetchExercise() {
    const res = await fetch("/api/exercises/get-one?type=speaking");
    const data = await res.json();
    setExercise(data.exercise);
    setSelectedId(data.exercise?.id || null);
  }

  async function refreshLibrary() {
    try {
      const res = await fetch("/api/exercises/list?type=speaking&limit=20", {
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data.items)) setLibrary(data.items);
    } catch {}
  }

  const startRecording = useCallback(async () => {
    setMessage("");
    setScore(null);
    setLastTranscript("");
    setLastStudentBlob(null);
    // reset last student duration
    setLivePartial("");
    setLiveFinals([]);
    try {
      transcribeAbortRef.current?.abort();
    } catch {}
    transcribeAbortRef.current = null;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    setMicStream(stream);
    recStartRef.current = Date.now();
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setLastStudentBlob(blob);
      // compute duration (optional data)

      let transcript = "";
      try {
        const base64 = await blobToBase64(blob);
        const ctrl = new AbortController();
        transcribeAbortRef.current = ctrl;
        const tRes = await fetch("/api/speechmatics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64,
            mimeType: blob.type || "audio/webm",
          }),
          signal: ctrl.signal,
        });
        const j = await tRes.json();
        transcript = j?.transcript || "";
      } catch (e: unknown) {
        const err = e as { name?: string };
        if (err?.name === "AbortError") {
          transcribeAbortRef.current = null;
          setRecording(false);
          return;
        }
      }

      setLastTranscript(transcript);

      const sRes = await fetch("/api/check-accuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: exercise?.arabic_text ?? "",
          spokenText: transcript,
        }),
      });
      let sc = 0;
      try {
        sc = (await sRes.json())?.score ?? 0;
      } catch {}
      setScore(sc);
      const passed = sc >= 90;
      setMessage(passed ? "Success! Next exercise" : "Try again");

      try {
        await fetch("/api/attempts", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise_id: exercise?.id,
            score: sc,
            passed,
          }),
        });
      } catch {}
      transcribeAbortRef.current = null;
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
    transcriberRef.current?.start();
  }, [exercise?.arabic_text, exercise?.id]);

  const stopRecording = useCallback(() => {
    const startedAt = recStartRef.current;
    try {
      mediaRecorderRef.current?.stop();
    } catch {}
    try {
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    } catch {}
    try {
      micStream?.getTracks().forEach((t) => t.stop());
    } catch {}
    setMicStream(null);
    mediaRecorderRef.current = null;
    // compute duration (optional)
    recStartRef.current = null;
    setRecording(false);
    transcriberRef.current?.stop();
  }, [micStream]);

  function timerText(start: number | null) {
    if (!start) return "00:00";
    const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  }

  return (
    <>
      <main className={`min-h-screen bg-[#101d23] text-white ${spaceGrotesk.variable} ${notoArabic.variable}`}>
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-12">
        {/* Page toolbar removed to avoid duplicating global header */}

        {/* Lessons row */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">Listening Lessons</h3>
            <a className="text-white/80 hover:text-white text-sm" href="#">
              View all →
            </a>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {library.map((e) => (
              <button
                key={e.id}
                title={e.arabic_text}
                onClick={() => {
                  setExercise(e);
                  setSelectedId(e.id);
                }}
                className={`flex-1 min-w-[260px] text-left bg-[#1a2c38] rounded-lg p-4 transition-colors border-2 ${
                  selectedId === e.id
                    ? "border-[#0da6f2]"
                    : "border-transparent hover:bg-[#223c49]"
                }`}
              >
                <div className="font-bold">{truncate(e.arabic_text, 64)}</div>
                <div className="text-white/60 text-sm mt-1">Speaking practice</div>
              </button>
            ))}
          </div>
        </div>

        {/* Practice section */}
        {exercise && (
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold">Practice your Arabic</h1>
                <p className="text-white/70 mt-2">
                  Read the text below and listen to the recording.
                </p>
              </div>
              <div className="bg-[#1a2c38] rounded-lg p-6 flex items-start gap-3">
                <p
                  className="text-2xl leading-loose text-right flex-1"
                  style={{ fontFamily: "var(--font-noto-ar), Noto Sans Arabic, sans-serif" }}
                >
                  {exercise.arabic_text}
                </p>
                {(role === "teacher" || role === "admin") && !editing && (
                  <button
                    className="text-white/60 hover:text-white"
                    onClick={() => setEditing(true)}
                    title="Edit text"
                  >
                    <IconEdit className="w-6 h-6" />
                  </button>
                )}
              </div>

              {editing && (role === "teacher" || role === "admin") && (
                <div className="bg-[#1a2c38] rounded-lg p-4">
                  <label className="text-sm text-white/80 mb-1 block">Edit text</label>
                  <textarea
                    className="w-full rounded-md bg-[#0f1a20] border border-[#2b4554] p-3 text-white"
                    rows={4}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-2 rounded-md bg-[#0da6f2] text-white hover:bg-[#0a8cd9]"
                      onClick={async () => {
                        const res = await fetch("/api/exercises/update", {
                          method: "PATCH",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: exercise.id, arabic_text: draftText }),
                        });
                        const j = await res.json().catch(() => ({}));
                        if (res.ok && j?.ok) {
                          setExercise(j.exercise as Exercise);
                          setEditing(false);
                        } else {
                          alert((j?.error) || `Failed to save (${res.status})`);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="px-3 py-2 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]"
                      onClick={() => {
                        setEditing(false);
                        setDraftText(exercise.arabic_text);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full max-w-xl mx-auto">
                {/* Hidden audio element to manage playback state */}
                <audio ref={audioRef} src={exercise.audio_url} preload="metadata" />
                <div className="flex items-center justify-center gap-4">
                  {exercise.audio_url ? (
                    !audioPlaying ? (
                      <button
                        className="flex items-center justify-center gap-3 h-14 px-8 bg-red-600 hover:bg-red-700 transition-colors text-white text-lg font-bold rounded-full"
                        onClick={() => audioRef.current?.play()}
                      >
                        <IconPlay className="w-7 h-7" />
                        <span>Play Audio</span>
                      </button>
                    ) : (
                      <button
                        className="flex items-center justify-center gap-3 h-14 px-8 bg-red-600 hover:bg-red-700 transition-colors text-white text-lg font-bold rounded-full"
                        onClick={() => audioRef.current?.pause()}
                      >
                        <IconPause className="w-7 h-7" />
                        <span>Pause Audio</span>
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-[#223c49] text-white/60 cursor-not-allowed"
                    >
                      <IconPlay className="w-7 h-7" />
                      <span>No audio attached</span>
                    </button>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-4 text-white/80 text-sm">
                  <p>{formatDuration(Math.floor(audioTime))}</p>
                  <div className="flex-1 h-1.5 bg-[#315668] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0da6f2] rounded-full"
                      style={{ width: audioDuration ? `${(audioTime / audioDuration) * 100}%` : "0%" }}
                    />
                  </div>
                  <p>{audioDuration ? `-${formatDuration(Math.max(0, Math.floor(audioDuration - audioTime)))}` : "-0:00"}</p>
                </div>

                {(role === "teacher" || role === "admin") && (
                  <div className="mt-4 p-4 rounded-lg bg-[#0f1a20] border border-[#2b4554]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-white/80">Admin: Audio Controls</div>
                      {exercise.audio_url ? (
                        <button
                          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]"
                          onClick={async () => {
                            if (!exercise?.id) return;
                            setReplaceError("");
                            setReplaceSaving(true);
                            try {
                              const res = await fetch("/api/exercises/audio/remove", {
                                method: "POST",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: exercise.id }),
                              });
                              const j = await res.json().catch(() => ({}));
                              if (!res.ok || !j?.ok) throw new Error(j?.error || `Failed ${res.status}`);
                              setExercise(j.exercise as Exercise);
                              // reset audio element
                              try { audioRef.current?.pause(); } catch {}
                              try { if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.load(); } } catch {}
                              setAudioPlaying(false);
                              setAudioTime(0);
                              setAudioDuration(0);
                            } catch (e: unknown) {
                              setReplaceError((e as Error)?.message || "Failed to remove audio");
                            } finally {
                              setReplaceSaving(false);
                            }
                          }}
                        >
                          <IconTrash className="w-4 h-4" />
                          Remove audio
                        </button>
                      ) : (
                        <div className="text-xs text-white/60">No audio attached</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a] cursor-pointer">
                          <IconUpload className="w-4 h-4" />
                          <span>Upload audio</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !exercise?.id) return;
                              setReplaceError("");
                              setReplaceSaving(true);
                              try {
                                const ext = file.name.split(".").pop() || "webm";
                                const path = `exercises/${exercise.id}/${Date.now()}.${ext}`;
                                const { error: upErr } = await supabase.storage
                                  .from("audio")
                                  .upload(path, file, { cacheControl: "3600", upsert: false });
                                if (upErr) throw new Error(upErr.message || "Upload failed");
                                const { data: pub } = supabase.storage.from("audio").getPublicUrl(path);
                                const res = await fetch("/api/exercises/update", {
                                  method: "PATCH",
                                  credentials: "include",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: exercise.id, audio_url: pub.publicUrl }),
                                });
                                const j = await res.json().catch(() => ({}));
                                if (!res.ok || !j?.ok) throw new Error(j?.error || `Failed ${res.status}`);
                                setExercise(j.exercise as Exercise);
                                // reload audio element
                                try { audioRef.current?.load(); } catch {}
                              } catch (err: unknown) {
                                setReplaceError((err as Error)?.message || "Upload failed");
                              } finally {
                                setReplaceSaving(false);
                                if (e.target) (e.target as HTMLInputElement).value = "";
                              }
                            }}
                          />
                        </label>

                        {!teacherRecording ? (
                          <button
                            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]"
                            onClick={async () => {
                              try {
                                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                                const mr = new MediaRecorder(stream);
                                teacherChunksRef.current = [];
                                mr.ondataavailable = (ev) => teacherChunksRef.current.push(ev.data);
                                mr.onstop = async () => {
                                  setTeacherRecording(false);
                                  try { stream.getTracks().forEach((t) => t.stop()); } catch {}
                                  // Auto-upload and replace
                                  setReplaceSaving(true);
                                  setReplaceError("");
                                  try {
                                    const blob = new Blob(teacherChunksRef.current, { type: "audio/webm" });
                                    const path = `exercises/${exercise?.id}/${Date.now()}.webm`;
                                    const { error: upErr } = await supabase.storage
                                      .from("audio")
                                      .upload(path, blob, { contentType: "audio/webm", upsert: false });
                                    if (upErr) throw new Error(upErr.message || "Upload failed");
                                    const { data: pub } = supabase.storage.from("audio").getPublicUrl(path);
                                    const res = await fetch("/api/exercises/update", {
                                      method: "PATCH",
                                      credentials: "include",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ id: exercise?.id, audio_url: pub.publicUrl }),
                                    });
                                    const j = await res.json().catch(() => ({}));
                                    if (!res.ok || !j?.ok) throw new Error(j?.error || `Failed ${res.status}`);
                                    setExercise(j.exercise as Exercise);
                                    try { audioRef.current?.load(); } catch {}
                                  } catch (e: unknown) {
                                    setReplaceError((e as Error)?.message || "Failed to save new audio");
                                  } finally {
                                    setReplaceSaving(false);
                                    teacherChunksRef.current = [];
                                  }
                                };
                                mr.start();
                                teacherMediaRef.current = mr;
                                setTeacherRecording(true);
                              } catch (e) {
                                setReplaceError("Microphone permission denied");
                              }
                            }}
                          >
                            <IconMic className="w-4 h-4" />
                            Record new
                          </button>
                        ) : (
                          <button
                            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-500"
                            onClick={() => {
                              try { teacherMediaRef.current?.stop(); } catch {}
                            }}
                          >
                            <IconStop className="w-4 h-4" />
                            Stop & save
                          </button>
                        )}
                      </div>
                      {replaceSaving && <div className="text-xs text-white/60">Saving…</div>}
                      {replaceError && <div className="text-xs text-rose-500">{replaceError}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Speak section */}
            <div className="flex flex-col items-center gap-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Now, your turn to speak</h2>
                <p className="text-white/70 mt-2">Click and read the text aloud.</p>
              </div>
              <div className="flex items-center justify-center">
                {!recording ? (
                  <button
                    className="flex items-center justify-center size-20 rounded-full bg-[#0da6f2] hover:bg-[#0a8cd9] shadow-[0_0_0_10px_rgba(13,166,242,0.3)]"
                    onClick={startRecording}
                    title="Start recording"
                  >
                    <IconMic className="w-9 h-9" />
                  </button>
                ) : (
                  <button
                    className="flex items-center justify-center size-20 rounded-full bg-rose-600 hover:bg-rose-500 shadow-[0_0_0_10px_rgba(244,63,94,0.35)]"
                    onClick={stopRecording}
                    title="Stop recording"
                  >
                    <IconStop className="w-8 h-8" />
                  </button>
                )}
              </div>

              {recording && (
                <div className="w-full">
                  <div className="text-xs text-white/70 mb-1 text-center">
                    Recording {timerText(recStartRef.current)}
                  </div>
                  <LevelMeter
                    stream={micStream}
                    height={42}
                    className="w-full ring-1 ring-[#2b4554] rounded-md bg-[#0f1a20]"
                  />
                </div>
              )}

              <div className="w-full min-h-[220px] bg-[#1a2c38] rounded-lg p-5 text-right" dir="rtl" lang="ar">
                <div className="text-sm text-white/70 mb-2">النسخ المباشر</div>
                {liveFinals.length > 0 && (
                  <div
                    className="mb-3 text-white text-2xl md:text-3xl leading-relaxed"
                    style={{ fontFamily: "var(--font-noto-ar), Noto Sans Arabic, sans-serif" }}
                  >
                    {liveFinals.join(" ")}
                  </div>
                )}
                <div
                  className="text-white/80 text-2xl md:text-3xl leading-relaxed"
                  style={{ fontFamily: "var(--font-noto-ar), Noto Sans Arabic, sans-serif" }}
                >
                  {recording
                    ? livePartial ||
                      (liveStatus === "unsupported"
                        ? "نسخ مباشر غير مدعوم في هذا المتصفح"
                        : liveStatus === "connecting"
                        ? "جارٍ الاتصال…"
                        : liveStatus === "listening"
                        ? "جارٍ الاستماع…"
                        : "")
                    : lastTranscript}
                </div>
                <LiveTranscriber
                  ref={transcriberRef}
                  lang="ar"
                  onPartial={(t) => setLivePartial(t)}
                  onFinal={(t) => setLiveFinals((prev) => (t ? [...prev, t] : prev))}
                  onStatus={(s) => setLiveStatus(s)}
                />
              </div>

              <div className="w-full">
                {score !== null && (
                  <div className="text-sm">Score: {score}</div>
                )}
                {message && (
                  <div className="mt-3 flex items-center gap-3">
                    <div>{message}</div>
                    <button
                      className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500"
                      onClick={fetchExercise}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
    </>
  );
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Simple inline icons (currentColor)
function IconPlay({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  );
}
function IconPause({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function IconMic({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z" />
      <path d="M5 11a1 1 0 0 1 2 0 5 5 0 1 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21h3a1 1 0 1 1 0 2H8a1 1 0 1 1 0-2h3v-3.07A7 7 0 0 1 5 11z" />
    </svg>
  );
}
function IconStop({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
function IconTrash({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1l-1 12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3L4 7H3a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1zm2 14a1 1 0 1 0 2 0V9a1 1 0 1 0-2 0v8z" />
    </svg>
  );
}
function IconEdit({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
      <path d="M20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}
function IconUpload({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3a1 1 0 0 1 1 1v8.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 8.707 10.293L11 12.586V4a1 1 0 0 1 1-1z" />
      <path d="M5 15a1 1 0 0 1 1 1v2h12v-2a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" />
    </svg>
  );
}

