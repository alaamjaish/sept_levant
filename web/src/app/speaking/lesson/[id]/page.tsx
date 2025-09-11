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
  level?: "beginner" | "intermediate" | "advanced";
};

export default function SpeakingLessonPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const lessonId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [role, setRole] = useState<string | null>(null);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  // Recording + scoring state (match classic page)
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [livePartial, setLivePartial] = useState<string>("");
  const [liveFinals, setLiveFinals] = useState<string[]>([]);
  const [liveStatus, setLiveStatus] = useState<"idle" | "connecting" | "listening" | "unsupported" | "error">("idle");
  const [transcribing, setTranscribing] = useState(false);
  const [lastDurationSec, setLastDurationSec] = useState<number | null>(null);

  // Media + transcriber
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const transcriberRef = useRef<LiveTranscriberHandle>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const recStartRef = useRef<number | null>(null);
  const transcribeAbortRef = useRef<AbortController | null>(null);
  const capturedTranscriptionRef = useRef<{ finals: string[]; partial: string } | null>(null);

  // Admin audio replace state
  const teacherMediaRef = useRef<MediaRecorder | null>(null);
  const teacherChunksRef = useRef<BlobPart[]>([]);
  const [teacherRecording, setTeacherRecording] = useState(false);
  const [replaceSaving, setReplaceSaving] = useState(false);
  const [replaceError, setReplaceError] = useState("");
  const [levelDraft, setLevelDraft] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [levelSaving, setLevelSaving] = useState(false);
  const [levelError, setLevelError] = useState("");

  // Exercise text edit
  const [editingExercise, setEditingExercise] = useState(false);
  const [exerciseDraft, setExerciseDraft] = useState("");

  // Exercise audio player (stitch-style)
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

  // Load library and set current by id
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
    return () => { cancelled = true; };
  }, [lessonId]);

  // Reset UI when switching exercise (match classic)
  useEffect(() => {
    if (exercise?.arabic_text) setExerciseDraft(exercise.arabic_text);
    setAudioPlaying(false);
    setAudioTime(0);
    setAudioDuration(0);
    const el = audioRef.current; if (el) { try { el.pause(); el.currentTime = 0; } catch {} }
    setLastScore(null); setMessage(""); setLastTranscript(""); setLivePartial(""); setLiveFinals([]); setTranscribing(false);
  }, [exercise?.id]);

  useEffect(() => {
    if (exercise?.level) setLevelDraft(exercise.level);
  }, [exercise?.level]);

  // Reload audio when URL changes
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !exercise?.audio_url) {
      setAudioTime(0); setAudioDuration(0); setAudioPlaying(false); return;
    }
    setAudioTime(0); setAudioDuration(0); setAudioPlaying(false);
    try { el.load(); } catch {}
  }, [exercise?.audio_url]);

  // Library navigation (Prev/Next) with routing
  const idx = useMemo(() => (exercise && library.length ? library.findIndex((x) => x.id === exercise.id) : -1), [exercise?.id, library]);
  const canPrev = idx > 0;
  const canNext = idx >= 0 && idx < library.length - 1;
  const goPrev = () => { if (!canPrev) return; const prev = library[idx - 1]; router.push(`/speaking/lesson/${prev.id}`); };
  const goNext = () => { if (!canNext) return; const next = library[idx + 1]; router.push(`/speaking/lesson/${next.id}`); };

  const startRecording = useCallback(async () => {
    setMessage(""); setLastScore(null); setLastTranscript(""); setLivePartial(""); setLiveFinals([]); setLastDurationSec(null);
    try { transcribeAbortRef.current?.abort(); } catch {};
    transcribeAbortRef.current = null; setTranscribing(false);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    setMicStream(stream);
    recStartRef.current = Date.now();
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setTranscribing(true);
      let transcript = "";
      const captured = capturedTranscriptionRef.current;
      if (captured && captured.finals.length > 0) {
        transcript = captured.finals.join(" ");
      } else if (captured && captured.partial.trim()) {
        transcript = captured.partial.trim();
      } else {
        try {
          const base64 = await blobToBase64(blob);
          const ctrl = new AbortController();
          transcribeAbortRef.current = ctrl;
          const tRes = await fetch("/api/speechmatics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audioBase64: base64, mimeType: blob.type || "audio/webm" }), signal: ctrl.signal });
          const data = await tRes.json(); transcript = data?.transcript || "";
        } catch (e: any) {
          if (e?.name === "AbortError") { setTranscribing(false); transcribeAbortRef.current = null; return; }
        }
      }
      setTranscribing(false); setLastTranscript(transcript || "");
      if (transcribeAbortRef.current?.signal.aborted) { transcribeAbortRef.current = null; return; }
      const sRes = await fetch("/api/check-accuracy-enhanced", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ originalText: exercise?.arabic_text ?? "", spokenText: transcript }) });
      let resp: any = { score: 0, feedbackMessage: "" };
      try { resp = await sRes.json(); } catch {}
      const score = Number(resp?.score) || 0;
      setLastScore(score);
      setMessage(truncateFeedback(resp?.feedbackMessage || ""));
      const passed = score >= 60;
      try { await fetch("/api/attempts", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exercise_id: exercise?.id, score, passed }) }); } catch {}
      transcribeAbortRef.current = null;
    };
    mr.start(); mediaRecorderRef.current = mr; setRecording(true); transcriberRef.current?.start();
  }, [exercise?.arabic_text, exercise?.id]);

  const stopRecording = useCallback(() => {
    // capture finals/partial from live ASR before stopping
    const capturedFinals = [...liveFinals];
    const capturedPartial = livePartial;
    capturedTranscriptionRef.current = { finals: capturedFinals, partial: capturedPartial };
    const startedAt = recStartRef.current;
    try { mediaRecorderRef.current?.stop(); } catch {}
    try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
    try { micStream?.getTracks().forEach((t) => t.stop()); } catch {}
    setMicStream(null); mediaRecorderRef.current = null;
    if (startedAt) { const sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000)); setLastDurationSec(sec); }
    recStartRef.current = null; setRecording(false); transcriberRef.current?.stop();
  }, [liveFinals, livePartial, micStream]);

  function formatDuration(sec: number) {
    if (!sec || isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60); const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
  function timerText(start: number | null) {
    if (!start) return "00:00";
    const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
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
    if (lastPunctuation > maxLength * 0.7) return text.substring(0, lastPunctuation + 1);
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
            <span className="text-white/80 text-sm">Lesson {idx >= 0 ? idx + 1 : "-"} of {library.length || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md ring-1 ring-[var(--border-dark)] hover:bg-[#11222a] text-sm disabled:opacity-40" onClick={goPrev} disabled={!canPrev}>Prev</button>
            <button className="px-3 py-1.5 rounded-md bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-sm disabled:opacity-40" onClick={goNext} disabled={!canNext}>Next</button>
            {(role === "teacher" || role === "admin") && (
              <a href="/speaking/stitch/lessons/new" className="ml-2 px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)] text-sm">Create</a>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exercise ? (
            <>
              {/* Left: Exercise + audio + admin */}
              <div className="flex flex-col bg-[var(--surface-dark)] rounded-xl p-6 gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Practice</h2>
                </div>
                {!editingExercise ? (
                  <div className="relative group">
                    <p className="text-white text-2xl leading-loose text-right" style={{fontFamily:'"Noto Sans Arabic", sans-serif'}} dir="rtl" lang="ar">{exercise.arabic_text}</p>
                    {(role === "teacher" || role === "admin") && (
                      <button className="absolute top-0 right-0 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditingExercise(true)} title="Edit text">✏️</button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea className="w-full rounded-md bg-[#0f1a20] border border-[#2b4554] p-3 text-white text-right" rows={4} value={exerciseDraft} onChange={(e) => setExerciseDraft(e.target.value)} style={{fontFamily:'"Noto Sans Arabic", sans-serif'}}/>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 rounded-md bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)]" onClick={async () => {
                        if (!exercise) return;
                        const res = await fetch("/api/exercises/update", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: exercise.id, arabic_text: exerciseDraft }) });
                        const j = await res.json().catch(() => ({} as any));
                        if (res.ok && (j as any)?.ok) { setExercise((j as any).exercise as Exercise); setEditingExercise(false); } else { alert(((j as any)?.error) || `Failed to save (${res.status})`); }
                      }}>Save</button>
                      <button className="px-3 py-2 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]" onClick={() => { setEditingExercise(false); if (exercise?.arabic_text) setExerciseDraft(exercise.arabic_text); }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Audio player */}
                <div className="w-full flex flex-col items-center gap-4">
                  <audio ref={audioRef} src={exercise?.audio_url} preload="metadata"
                    onLoadedData={() => { const el = audioRef.current; if (el && el.duration && !isNaN(el.duration) && isFinite(el.duration)) { setAudioDuration(el.duration); setAudioTime(0); } }}
                    onCanPlay={() => { const el = audioRef.current; if (el && el.duration && !isNaN(el.duration) && isFinite(el.duration)) { setAudioDuration(el.duration); } }}
                    onDurationChange={() => { const el = audioRef.current; if (el && el.duration && !isNaN(el.duration) && isFinite(el.duration)) { setAudioDuration(el.duration); } }}
                    onTimeUpdate={() => { const el = audioRef.current; if (el && !isNaN(el.currentTime)) { setAudioTime(el.currentTime); } }}
                    onPlay={() => setAudioPlaying(true)} onPause={() => setAudioPlaying(false)} onEnded={() => { setAudioPlaying(false); const el = audioRef.current; if (el && el.duration) setAudioTime(el.duration); }}
                    onError={() => { setAudioDuration(0); setAudioTime(0); }} />
                  <div className="w-full flex items-center gap-4 text-[var(--text-secondary)] text-sm font-medium">
                    <p>{formatDuration(audioTime)}</p>
                    <div className="relative flex-1 h-1.5 bg-[#315668] rounded-full cursor-pointer" onClick={(e) => {
                      e.preventDefault(); const el = audioRef.current; if (!el || !audioDuration || audioDuration <= 0) return; const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); const newTime = percent * audioDuration; try { el.currentTime = newTime; setAudioTime(newTime); } catch {}
                    }}>
                      <div className="absolute h-full bg-[var(--accent-blue)] rounded-full" style={{ width: audioDuration ? `${(audioTime / audioDuration) * 100}%` : "0%" }}></div>
                      <div className="absolute w-4 h-4 bg-white rounded-full -top-1.5 cursor-pointer hover:scale-110 transition-transform" style={{ left: audioDuration ? `${(audioTime / audioDuration) * 100}%` : "0%" }}></div>
                    </div>
                    <p>{audioDuration ? `-${formatDuration(Math.max(0, audioDuration - audioTime))}` : "-0:00"}</p>
                    <button className="flex items-center justify-center gap-3 h-12 w-12 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-full" onClick={() => audioPlaying ? audioRef.current?.pause() : audioRef.current?.play()}>
                      <span className="material-symbols-outlined text-3xl">{audioPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>
                  </div>

                  {(role === "teacher" || role === "admin") && (
                    <div className="w-full mt-2 p-4 rounded-lg bg-[#0f1a20] border border-[#2b4554]">
                      <div className="text-xs text-white/80 mb-3">Admin: Exercise Controls</div>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/80 w-16">Level</span>
                          <select className="flex-1 rounded-md bg-[#0f1a20] border border-[#2b4554] p-2 text-white capitalize" value={levelDraft} onChange={(e) => setLevelDraft(e.target.value as any)}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                          <button className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)] disabled:opacity-50" disabled={levelSaving || !exercise?.id} onClick={async () => {
                            if (!exercise?.id) return; setLevelError(""); setLevelSaving(true);
                            try {
                              const res = await fetch('/api/exercises/update', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: exercise.id, level: levelDraft }) });
                              const j = await res.json().catch(() => ({} as any));
                              if (!res.ok || !(j as any)?.ok) throw new Error(((j as any)?.error) || `Failed ${res.status}`);
                              setExercise(((j as any).exercise) as Exercise);
                            } catch (e: unknown) { setLevelError((e as Error)?.message || 'Failed to update level'); } finally { setLevelSaving(false); }
                          }}>{levelSaving ? 'Saving…' : 'Save Level'}</button>
                        </div>
                        {levelError && <div className="text-xs text-rose-500">{levelError}</div>}
                        <div className="flex items-center gap-3">
                          {!teacherRecording ? (
                            <button className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]" onClick={async () => {
                              try {
                                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                                const mr = new MediaRecorder(stream);
                                teacherChunksRef.current = [];
                                mr.ondataavailable = (ev) => teacherChunksRef.current.push(ev.data);
                                mr.onstop = async () => { setTeacherRecording(false); try { stream.getTracks().forEach((t) => t.stop()); } catch {} };
                                mr.start(); teacherMediaRef.current = mr; setTeacherRecording(true);
                              } catch { setReplaceError("Microphone permission denied"); }
                            }}>Record</button>
                          ) : (
                            <button className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-500" onClick={() => { try { teacherMediaRef.current?.stop(); } catch {} }}>Stop</button>
                          )}

                          {exercise?.id && teacherChunksRef.current.length > 0 && (
                            <>
                              <button className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]" onClick={() => new Audio(URL.createObjectURL(new Blob(teacherChunksRef.current, { type: 'audio/webm' }))).play()}>Play New</button>
                              <button className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)] disabled:opacity-50" disabled={replaceSaving} onClick={async () => {
                                setReplaceError(""); setReplaceSaving(true);
                                try {
                                  const blob = new Blob(teacherChunksRef.current, { type: 'audio/webm' });
                                  const { data: u } = await supabase.auth.getUser();
                                  const path = `audio/${u?.user?.id || 'anon'}/${Date.now()}.webm`;
                                  const { error: upErr } = await supabase.storage.from('audio').upload(path, blob, { contentType: 'audio/webm', upsert: false });
                                  if (upErr) throw new Error(upErr.message || 'Upload failed');
                                  const { data: pub } = supabase.storage.from('audio').getPublicUrl(path);
                                  const res = await fetch('/api/exercises/update', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: exercise.id, audio_url: pub.publicUrl }) });
                                  const j = await res.json().catch(() => ({} as any));
                                  if (!res.ok || !(j as any)?.ok) throw new Error(((j as any)?.error) || `Failed ${res.status}`);
                                  setExercise(((j as any).exercise) as Exercise); teacherChunksRef.current = []; try { audioRef.current?.load(); } catch {}
                                } catch (e: unknown) { setReplaceError((e as Error)?.message || 'Failed to replace audio'); } finally { setReplaceSaving(false); }
                              }}>Use This Audio</button>
                              <button className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]" onClick={() => { teacherChunksRef.current = []; }}>Discard</button>
                            </>
                          )}

                          {exercise?.id && (
                            <button className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ring-1 ring-rose-500 text-rose-400 hover:bg-[#2a1214]" onClick={async () => {
                              if (!confirm('Delete this exercise?')) return; try {
                                const delAudio = confirm('Also delete the audio file from storage?');
                                const res = await fetch('/api/exercises/delete', { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: exercise.id, deleteAudio: delAudio }) });
                                const j = await res.json().catch(() => ({} as any)); if (!res.ok || (j as any)?.error) throw new Error(((j as any)?.error) || `Failed ${res.status}`);
                                setExercise(null);
                                // Refresh library
                                try { const lr = await fetch('/api/exercises/list?type=speaking&limit=100', { cache: 'no-store' }); const lj = await lr.json(); if (Array.isArray(lj?.items)) setLibrary(lj.items); } catch {}
                              } catch (e: unknown) { alert((e as any)?.message || 'Delete failed'); }
                            }}>Delete</button>
                          )}
                        </div>
                        {replaceSaving && <div className="text-xs text-white/60">Saving…</div>}
                        {replaceError && <div className="text-xs text-rose-500">{replaceError}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Record + transcript + score */}
              <div className="flex flex-col bg-[var(--surface-dark)] rounded-xl p-6 gap-4">
                <div className="flex-grow flex flex-col justify-center">
                  <h2 className="text-white text-xl font-bold tracking-tight text-center mb-1">Your Turn to Speak</h2>
                  <p className="text-[var(--text-secondary)] text-sm text-center mb-4">Tap to record, then see your live transcription below.</p>
                  <div className="flex-grow flex justify-center items-center bg-black/20 rounded-lg border border-dashed border-[var(--border-dark)] p-4 min-h-[120px]">
                    <div className="w-full">
                      {recording ? (
                        <div className="text-[var(--text-secondary)] text-xl leading-relaxed text-right" style={{fontFamily:'"Noto Sans Arabic", sans-serif'}} dir="rtl" lang="ar">
                          {liveFinals.length > 0 && (<div className="mb-3 text-white">{liveFinals.join(" ")}</div>)}
                          <div className="text-white/70">{livePartial || (liveStatus === "unsupported" ? "Live captions not supported" : liveStatus === "connecting" ? "Connecting…" : liveStatus === "listening" ? "Listening…" : "")}</div>
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

                <div className="flex justify-center items-center mb-2 relative">
                  <button className={`flex items-center justify-center gap-3 h-16 w-16 rounded-full transition-colors text-white shadow-[0_0_0_8px_rgba(13,166,242,0.3)] ${recording ? "bg-red-600 hover:bg-red-500" : "bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)]"}`} onClick={recording ? stopRecording : startRecording}>
                    <span className="material-symbols-outlined text-4xl">{recording ? 'stop' : 'mic'}</span>
                  </button>
                  {recording && (<div className="absolute left-1/2 translate-x-12 text-white/70 text-xs font-medium bg-black/20 px-2 py-1 rounded-md whitespace-nowrap">Recording {timerText(recStartRef.current)}</div>)}
                </div>
                {recording && (<div></div>)}

                <div className="bg-[#101d23] rounded-lg p-4 border border-[var(--border-dark)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-2/3">
                      <p className="text-[var(--text-secondary)] text-xs font-medium">Your Score</p>
                      <p className="text-white text-2xl font-bold">{lastScore !== null ? lastScore : 0}%</p>
                    </div>
                    <div className="w-1/3 flex items-center justify-center">
                      <div className="relative w-12 h-12">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-[#315668]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                          <path className={lastScore !== null ? (lastScore >= 80 ? "text-green-500" : lastScore >= 60 ? "text-yellow-500" : "text-red-500") : "text-[#315668]"} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={`${lastScore || 0}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{lastScore !== null ? lastScore : 0}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[var(--text-secondary)] text-xs mb-3 h-8 overflow-hidden">
                    <p className="font-medium text-white mb-1 line-clamp-2">{lastScore !== null ? (message || "Great job! Keep practicing to improve your pronunciation.") : "Ready to start? Press the microphone button and speak clearly, remember, we all start somewhere!"}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 mt-2 border-t border-[var(--border-dark)]">
                    <button className="flex-1 h-8 px-3 rounded-md bg-[var(--border-dark)] text-white text-xs font-bold hover:bg-[#2c4c5c]" onClick={startRecording}><span className="truncate">{lastScore !== null ? "Try Again" : "Start Recording"}</span></button>
                    {lastScore !== null && lastScore >= 60 && (
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
