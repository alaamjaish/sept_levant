"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import LiveTranscriber, { LiveTranscriberHandle } from "@/components/LiveTranscriber";
import LevelMeter from "@/components/LevelMeter";
import { supabase } from "@/lib/supabaseClient";

type Exercise = {
  id: string;
  arabic_text: string;
  audio_url: string;
  exercise_type: "listening" | "speaking";
};

export default function SpeakingPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [livePartial, setLivePartial] = useState<string>("");
  const [liveFinals, setLiveFinals] = useState<string[]>([]);
  const [liveStatus, setLiveStatus] = useState<"idle" | "connecting" | "listening" | "unsupported" | "error">("idle");
  const [role, setRole] = useState<string | null>(null);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const transcriberRef = useRef<LiveTranscriberHandle>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const recStartRef = useRef<number | null>(null);
  const transcribeAbortRef = useRef<AbortController | null>(null);

  const teacherMediaRef = useRef<MediaRecorder | null>(null);
  const teacherChunksRef = useRef<BlobPart[]>([]);
  const [teacherRecording, setTeacherRecording] = useState(false);
  const [teacherStream, setTeacherStream] = useState<MediaStream | null>(null);
  const [builderText, setBuilderText] = useState("");
  const [builderTranscript, setBuilderTranscript] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastStudentBlob, setLastStudentBlob] = useState<Blob | null>(null);
  const [builderError, setBuilderError] = useState<string>("");
  const [teacherTranscribing, setTeacherTranscribing] = useState(false);
  // Simple controls
  const [lastDurationSec, setLastDurationSec] = useState<number | null>(null);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [transcriptDraft, setTranscriptDraft] = useState("");
  // Inline edit/replace near the exercise box (teacher)
  const [editingExercise, setEditingExercise] = useState(false);
  const [exerciseDraft, setExerciseDraft] = useState("");
  const [replaceSaving, setReplaceSaving] = useState(false);
  const [replaceError, setReplaceError] = useState("");

  useEffect(() => {
    fetchExercise();
    // fetch role for inline builder
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        setRole(prof?.role ?? null);
      }
    })();
    refreshLibrary();
    // Cleanup: ensure mic and recognition fully stop on page unload/unmount
    return () => {
      try { transcriberRef.current?.stop(); } catch {}
      try { mediaRecorderRef.current?.stop(); } catch {}
      try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
      try { micStream?.getTracks().forEach((t) => t.stop()); } catch {}
      try { transcribeAbortRef.current?.abort(); } catch {}
      transcribeAbortRef.current = null;
    };
  }, []);

  // Reset simple UI when switching exercise
  useEffect(() => {
    setEditingTranscript(false);
    setTranscriptDraft("");
    if (exercise?.arabic_text) setExerciseDraft(exercise.arabic_text);
  }, [exercise?.id]);

  async function fetchExercise() {
    const res = await fetch("/api/exercises/get-one?type=speaking");
    const data = await res.json();
    setExercise(data.exercise);
    setSelectedId(data.exercise?.id || null);
  }

  async function refreshLibrary() {
    try {
      const res = await fetch("/api/exercises/list?type=speaking&limit=20", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.items)) setLibrary(data.items);
    } catch {}
  }

  const startRecording = useCallback(async () => {
    setMessage("");
    setLastScore(null);
    setLastTranscript("");
    setLivePartial("");
    setLiveFinals([]);
    setLastDurationSec(null);
    // If a background transcription is running, cancel it
    try { transcribeAbortRef.current?.abort(); } catch {}
    transcribeAbortRef.current = null;
    setTranscribing(false);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    setMicStream(stream);
    recStartRef.current = Date.now();
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      setLastStudentBlob(blob);
      setTranscribing(true);
      let transcript = "";
      try {
        const base64 = await blobToBase64(blob);
        // Abortable request so user actions (e.g., Listen) can cancel
        const ctrl = new AbortController();
        transcribeAbortRef.current = ctrl;
        const tRes = await fetch("/api/speechmatics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64: base64, mimeType: blob.type || "audio/webm" }),
          signal: ctrl.signal,
        });
        const data = await tRes.json();
        transcript = data?.transcript || "";
      } catch (e: unknown) {
        // If aborted, just exit early and clear state
        const err = e as { name?: string };
        if (err?.name === "AbortError") {
          setTranscribing(false);
          transcribeAbortRef.current = null;
          return;
        }
      }
      setTranscribing(false);
      setLastTranscript(transcript || "");
      // If cancelled in the meantime, do not proceed
      if (transcribeAbortRef.current?.signal.aborted) {
        transcribeAbortRef.current = null;
        return;
      }
      const sRes = await fetch("/api/check-accuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: exercise?.arabic_text ?? "",
          spokenText: transcript,
        }),
        signal: transcribeAbortRef.current?.signal,
      });
      let score = 0;
      try {
        const j = await sRes.json();
        score = j?.score ?? 0;
      } catch {}
      setLastScore(score);
      const passed = score >= 90;
      setMessage(passed ? "Success! Next exercise" : "Try again");

      // Persist attempt (best-effort; ignore if unauthenticated)
      try {
        // Attempt persistence best-effort; ignore aborts
        await fetch("/api/attempts", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise_id: exercise?.id,
            score,
            passed,
          }),
        });
      } catch (e) {
        // no-op
      }
      transcribeAbortRef.current = null;
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
    // Start live captions (browser engine for realtime feedback)
    transcriberRef.current?.start();
  }, [exercise?.arabic_text]);

  const stopRecording = useCallback(() => {
    // Stop media recorder and all audio tracks
    const startedAt = recStartRef.current;
    try { mediaRecorderRef.current?.stop(); } catch {}
    try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
    try { micStream?.getTracks().forEach((t) => t.stop()); } catch {}
    setMicStream(null);
    mediaRecorderRef.current = null;
    if (startedAt) {
      const sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      setLastDurationSec(sec);
    }
    recStartRef.current = null;
    setRecording(false);
    transcriberRef.current?.stop();
  }, []);

  function timerText(start: number | null) {
    if (!start) return "00:00";
    const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-slate-900">Speaking Practice</h1>
        {/* Selector chips above */}
        {library.length > 0 && (
          <div className="bg-white/70 rounded-xl ring-1 ring-slate-900/10 p-2 overflow-x-auto">
            <div className="flex gap-2 min-w-full w-max">
              {library.map((e) => (
                <button
                  key={e.id}
                  title={e.arabic_text}
                  onClick={() => { setExercise(e); setSelectedId(e.id); }}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedId===e.id? 'bg-slate-900 text-white' : 'ring-1 ring-slate-300 hover:bg-slate-50'}`}
                >
                  {e.arabic_text.length > 24 ? e.arabic_text.slice(0,24)+"…" : e.arabic_text}
                </button>
              ))}
            </div>
          </div>
        )}

        {exercise && (
          <div className="bg-white/90 rounded-xl ring-1 ring-slate-900/10 shadow-sm p-6">
            {/* Exercise text + controls row */}
            {!editingExercise ? (
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl mb-4 text-slate-800 flex-1 break-words">{exercise.arabic_text}</div>
                <div className="flex flex-col gap-2 items-end">
                  <button
                    className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800"
                    onClick={() => new Audio(exercise.audio_url).play()}
                  >
                    Play
                  </button>
                  {role === "teacher" && (
                    <button
                      className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50"
                      onClick={() => { setEditingExercise(true); setExerciseDraft(exercise.arabic_text); }}
                    >
                      Edit Text
                    </button>
                  )}
                  {role === "teacher" && !teacherRecording && (
                    <button
                      className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50"
                      onClick={async () => {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const mr = new MediaRecorder(stream);
                        teacherChunksRef.current = [];
                        setTeacherStream(stream);
                        mr.ondataavailable = (e) => teacherChunksRef.current.push(e.data);
                        mr.onstop = () => { setTeacherRecording(false); setTeacherStream(null); };
                        mr.start();
                        teacherMediaRef.current = mr;
                        setTeacherRecording(true);
                      }}
                    >
                      Replace Audio (Record)
                    </button>
                  )}
                  {role === "teacher" && teacherRecording && (
                    <button
                      className="text-sm px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-500"
                      onClick={() => {
                        try { teacherMediaRef.current?.stop(); } catch {}
                        try { teacherMediaRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
                      }}
                    >
                      Stop Recording
                    </button>
                  )}
                  {role === "teacher" && teacherChunksRef.current.length > 0 && (
                    <div className="flex gap-2">
                      <button
                        className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50"
                        onClick={() => new Audio(URL.createObjectURL(new Blob(teacherChunksRef.current, { type: 'audio/webm' }))).play()}
                      >
                        Play New
                      </button>
                      <button
                        disabled={replaceSaving}
                        className="text-sm px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                        onClick={async () => {
                          if (!exercise?.id) return;
                          setReplaceError("");
                          setReplaceSaving(true);
                          try {
                            const blob = new Blob(teacherChunksRef.current, { type: 'audio/webm' });
                            const { data: u } = await supabase.auth.getUser();
                            const path = `audio/${u?.user?.id || 'anon'}/${Date.now()}.webm`;
                            const { error: upErr } = await supabase.storage.from('audio').upload(path, blob, {
                              contentType: 'audio/webm',
                              upsert: false,
                            });
                            if (upErr) throw new Error(upErr.message || 'Upload failed');
                            const { data: pub } = supabase.storage.from('audio').getPublicUrl(path);
                            const res = await fetch('/api/exercises/update', {
                              method: 'PATCH',
                              credentials: 'include',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ id: exercise.id, audio_url: pub.publicUrl }),
                            });
                            const j = await res.json();
                            if (!res.ok || !j?.ok) throw new Error(j?.error || `Failed ${res.status}`);
                            setExercise(j.exercise);
                            teacherChunksRef.current = [];
                          } catch (e: unknown) {
                            const msg = (e as Error)?.message || 'Failed to replace audio';
                            setReplaceError(msg);
                          } finally {
                            setReplaceSaving(false);
                          }
                        }}
                      >
                        Use This Audio
                      </button>
                      <button
                        className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50"
                        onClick={() => { teacherChunksRef.current = []; }}
                      >
                        Discard
                      </button>
                    </div>
                  )}
                  {replaceError && (<div className="text-xs text-rose-600 max-w-56 text-right">{replaceError}</div>)}
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="text-sm text-slate-700 mb-1 block">Edit text</label>
                <textarea className="w-full border border-slate-300 rounded-lg p-2" rows={3} value={exerciseDraft} onChange={(e) => setExerciseDraft(e.target.value)} />
                <div className="mt-2 flex gap-2">
                  <button
                    className="px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800"
                    onClick={async () => {
                      if (!exercise?.id) return;
                      const res = await fetch('/api/exercises/update', {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: exercise.id, arabic_text: exerciseDraft }),
                      });
                      const j = await res.json().catch(() => ({}));
                      if (res.ok && (j as any)?.ok) {
                        setExercise((j as any).exercise);
                        setEditingExercise(false);
                      } else {
                        alert(((j as any)?.error) || `Failed to save (${res.status})`);
                      }
                    }}
                  >Save</button>
                  <button className="px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => { setEditingExercise(false); setExerciseDraft(exercise?.arabic_text || ''); }}>Cancel</button>
                </div>
              </div>
            )}
            <button
              disabled={recording}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg mr-3 hover:bg-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500 disabled:opacity-50"
              onClick={() => {
                // Ensure mic/transcriber are fully stopped before playing
                try { transcriberRef.current?.stop(); } catch {}
                try { micStream?.getTracks().forEach((t) => t.stop()); } catch {}
                // Cancel any background transcription and clear UI state
                try { transcribeAbortRef.current?.abort(); } catch {}
                transcribeAbortRef.current = null;
                setTranscribing(false);
                new Audio(exercise.audio_url).play();
              }}
            >
              Listen
            </button>
            {!recording ? (
              <button
                className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-sky-500 shadow-sm hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                onClick={startRecording}
              >
                Record
              </button>
            ) : (
              <button
                className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-500 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500"
                onClick={stopRecording}
              >
                Stop
              </button>
            )}
            {message && <div className="mt-4 text-slate-700">{message}</div>}
            {recording && (
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">Recording {timerText(recStartRef.current)}</div>
                <LevelMeter stream={micStream} height={42} className="w-full ring-1 ring-slate-200 rounded-md bg-white/60" />
              </div>
            )}
            <div className="mt-5">
            <div className="text-sm font-medium text-slate-700 mb-1">Live transcript</div>
            <div className="min-h-16 rounded border border-slate-200 p-3 text-slate-800 bg-white/60">
              {liveFinals.length > 0 && (
                <div className="mb-2 text-slate-700">{liveFinals.join(" ")}</div>
              )}
              <div className="flex items-center justify-between gap-3 text-slate-500">
                <div>
                  {transcribing
                    ? "Processing recording…"
                    : (livePartial || (liveStatus === "unsupported"
                        ? "Live captions not supported in this browser"
                        : liveStatus === "connecting"
                        ? "Connecting…"
                        : liveStatus === "listening"
                        ? "Listening…"
                        : ""))}
                </div>
                {transcribing && (
                  <button
                    className="text-xs px-2 py-1 rounded ring-1 ring-slate-300 hover:bg-slate-50"
                    onClick={() => { try { transcribeAbortRef.current?.abort(); } catch {}; transcribeAbortRef.current = null; setTranscribing(false); }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            </div>
            <LiveTranscriber
              ref={transcriberRef}
              lang="ar"
              onPartial={(t) => setLivePartial(t)}
              onFinal={(t) => setLiveFinals((prev) => (t ? [...prev, t] : prev))}
              onStatus={(s) => setLiveStatus(s)}
            />
            <div className="mt-3 flex flex-col gap-2">
              {lastScore !== null && (
                <div className="text-sm text-slate-600">Score: {lastScore}</div>
              )}
              {(lastStudentBlob || lastTranscript) && (
                <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="text-sm text-slate-700">
                      Last recording: {lastDurationSec !== null ? `${Math.floor(lastDurationSec/60).toString().padStart(2,'0')}:${(lastDurationSec%60).toString().padStart(2,'0')}` : '—'}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => { if (lastStudentBlob) new Audio(URL.createObjectURL(lastStudentBlob)).play(); }}>Play</button>
                      <button className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => { setLastStudentBlob(null); setLastTranscript(""); setLastScore(null); setMessage(""); }}>Delete</button>
                      <button className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800" onClick={startRecording}>Re-record</button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium text-slate-700">Transcript</div>
                      {!editingTranscript ? (
                        <div className="flex gap-2">
                          <button className="text-xs px-2 py-1 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => { setEditingTranscript(true); setTranscriptDraft(lastTranscript); }}>Edit</button>
                          <button className="text-xs px-2 py-1 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => setLastTranscript("")}>Clear</button>
                        </div>
                      ) : null}
                    </div>
                    {!editingTranscript ? (
                      <div className="text-sm text-slate-700 break-words min-h-6">{lastTranscript || ""}</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <textarea className="w-full border border-slate-300 rounded-lg p-2 text-sm" rows={3} value={transcriptDraft} onChange={(e) => setTranscriptDraft(e.target.value)} />
                        <div className="flex gap-2">
                          <button className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800" onClick={() => { setLastTranscript(transcriptDraft); setEditingTranscript(false); }}>Save</button>
                          <button className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => { setEditingTranscript(false); setTranscriptDraft(""); }}>Cancel</button>
                          {role === 'teacher' && (
                            <button className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => { setBuilderText((p) => (p ? p + ' ' : '') + (transcriptDraft || lastTranscript)); }}>Apply to Text Box</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {message.startsWith("Success") && (
              <button
                className="mt-4 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-sm hover:shadow-md transition"
                onClick={fetchExercise}
              >
                Next Exercise
              </button>
            )}
            {!message.startsWith("Success") && (
              <button
                className="mt-4 px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-sky-500 shadow-sm hover:shadow-md transition"
                onClick={() => {
                  if (library.length > 0 && exercise) {
                    const idx = library.findIndex((x) => x.id === exercise.id);
                    const next = library[(idx + 1) % library.length];
                    setExercise(next);
                    setSelectedId(next.id);
                  } else {
                    fetchExercise();
                  }
                }}
              >
                Next
              </button>
            )}
          </div>
        )}

        {role === "teacher" && (
          <div className="bg-white/90 rounded-xl ring-1 ring-slate-900/10 shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-3 text-slate-900">Build Mode (Teacher)</h2>
            <div className="text-sm text-slate-600 mb-2">Record a reference line, capture transcript, and save as a new exercise.</div>

            <div className="flex gap-3 mb-3">
              {!teacherRecording ? (
                <button
                  disabled={teacherTranscribing}
                  className="px-3 py-2 rounded-lg text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
                  onClick={async () => {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const mr = new MediaRecorder(stream);
                    teacherChunksRef.current = [];
                    setTeacherStream(stream);
                    mr.ondataavailable = (e) => teacherChunksRef.current.push(e.data);
                    mr.onstop = async () => {
                      const blob = new Blob(teacherChunksRef.current, { type: "audio/webm" });
                      // Get an accurate transcript via Speechmatics (one-shot)
                      setTeacherTranscribing(true);
                      try {
                        const base64 = await blobToBase64(blob);
                        const res = await fetch("/api/speechmatics", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ audioBase64: base64, mimeType: blob.type }),
                        });
                        const data = await res.json();
                        setBuilderTranscript(data?.transcript || "");
                      } catch {}
                      setTeacherTranscribing(false);
                    };
                    mr.start();
                    teacherMediaRef.current = mr;
                    setTeacherRecording(true);
                  }}
                >
                  Record Reference
                </button>
              ) : (
                <button
                  className="px-3 py-2 rounded-lg text-white bg-rose-600 hover:bg-rose-500"
                  onClick={() => {
                    teacherMediaRef.current?.stop();
                    teacherMediaRef.current?.stream.getTracks().forEach((t) => t.stop());
                    setTeacherStream(null);
                    setTeacherRecording(false);
                  }}
                >
                  Stop
                </button>
              )}
              <button
                disabled={teacherTranscribing}
                className="px-3 py-2 rounded-lg text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setBuilderText((p) => (p ? p + " " : "") + (builderTranscript || liveFinals.join(" ")))}
              >
                Use Transcript as Text
              </button>
            </div>

            <div className="mb-2 text-sm text-slate-600">
              Reference audio: {teacherChunksRef.current.length > 0 ? "recorded" : lastStudentBlob ? "using last recording" : "not recorded"}
            </div>
            {teacherRecording && (
              <LevelMeter stream={teacherStream} height={36} className="w-full ring-1 ring-slate-200 rounded-md bg-white/60 mb-2" />
            )}
            <div className="flex flex-wrap gap-3 mb-3">
              <button
                className="px-3 py-2 rounded-lg text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                onClick={() => {
                  if (lastStudentBlob) {
                    teacherChunksRef.current = [lastStudentBlob];
                    setBuilderTranscript(lastTranscript || builderTranscript);
                  } else {
                    alert("No previous recording found. Please record a reference or make a student recording first.");
                  }
                }}
              >
                Use Last Recording
              </button>
              <button
                disabled={teacherTranscribing}
                className="px-3 py-2 rounded-lg text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => {
                  let blob: Blob | null = null;
                  if (teacherChunksRef.current.length > 0) {
                    blob = new Blob(teacherChunksRef.current, { type: "audio/webm" });
                  } else if (lastStudentBlob) {
                    blob = lastStudentBlob;
                  }
                  if (!blob) {
                    alert("Nothing to play yet. Record or use last recording.");
                    return;
                  }
                  const url = URL.createObjectURL(blob);
                  const audio = new Audio(url);
                  audio.play();
                }}
              >
                Play Reference
              </button>
              <button
                disabled={teacherTranscribing}
                className="px-3 py-2 rounded-lg text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => {
                  teacherChunksRef.current = [];
                  setBuilderTranscript("");
                }}
              >
                Discard Reference
              </button>
            </div>
            <div className="mb-3">
              <label className="text-sm text-slate-700 mb-1 block">Exercise text</label>
              <textarea className="w-full border border-slate-300 rounded-lg p-2" rows={3} value={builderText} onChange={(e) => setBuilderText(e.target.value)} />
            </div>
            {builderError && (
              <div className="text-sm text-rose-600 mb-2">{builderError}</div>
            )}
            <button
              disabled={saving || !builderText.trim()}
              className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-sky-500 disabled:opacity-50"
              onClick={async () => {
                if (!builderText.trim()) return;
                setSaving(true);
                setBuilderError("");
                try {
                  let blob: Blob | null = null;
                  if (teacherChunksRef.current.length > 0) {
                    blob = new Blob(teacherChunksRef.current, { type: "audio/webm" });
                  } else if (lastStudentBlob) {
                    blob = lastStudentBlob;
                  }
                  if (!blob) {
                    setBuilderError("Please record a reference (or use last recording) before saving.");
                    setSaving(false);
                    return;
                  }
                  const { data: u } = await supabase.auth.getUser();
                  const path = `audio/${u?.user?.id || "anon"}/${Date.now()}.webm`;
                  const { error: upErr } = await supabase.storage.from("audio").upload(path, blob, {
                    contentType: "audio/webm",
                    upsert: false,
                  });
                  if (upErr) {
                    console.error("Storage upload error", upErr);
                    throw new Error(upErr.message || "Storage upload failed");
                  }
                  const { data: pub } = supabase.storage.from("audio").getPublicUrl(path);
                  const res = await fetch("/api/exercises/create", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ arabic_text: builderText.trim(), audio_url: pub.publicUrl, exercise_type: "speaking" }),
                  });
                  let data: any = null;
                  try { data = await res.json(); } catch {}
                  if (!res.ok || !data?.ok) {
                    console.error("Insert exercise error", data);
                    throw new Error(data?.error || `Failed to save (status ${res.status})`);
                  }
                  setExercise(data.exercise);
                  setSelectedId(data.exercise?.id || null);
                  setBuilderText("");
                  teacherChunksRef.current = [];
                  // refresh library so the new exercise appears in chips
                  await refreshLibrary();
                } catch (e: unknown) {
                  const msg = (e as Error)?.message || "Failed to save exercise. Check role and storage policies.";
                  setBuilderError(msg);
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save as New Speaking Exercise
            </button>
            {builderTranscript && (
              <div className="mt-3 text-sm text-slate-600 break-words">Suggested transcript: {builderTranscript}</div>
            )}
          </div>
        )}


        {role === "teacher" && (
          <div className="bg-white/90 rounded-xl ring-1 ring-slate-900/10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900">Exercise Library (latest)</h2>
              <button className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={refreshLibrary}>Refresh</button>
            </div>
            <div className="flex flex-col gap-2">
              {library.length === 0 && <div className="text-slate-500 text-sm">No exercises yet.</div>}
              {library.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg p-2">
                  <div className="truncate text-slate-800" title={e.arabic_text}>{e.arabic_text}</div>
                  <div className="flex gap-2">
                    <button className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800" onClick={() => setExercise(e)}>Load</button>
                    <button className="text-sm px-3 py-1.5 rounded ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => new Audio(e.audio_url).play()}>Play</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve((reader.result as string).split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
