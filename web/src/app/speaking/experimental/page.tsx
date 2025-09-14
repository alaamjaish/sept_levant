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

export default function SpeakingExperimentalPage() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [livePartial, setLivePartial] = useState("");
  const [liveFinals, setLiveFinals] = useState<string[]>([]);
  const [liveStatus, setLiveStatus] = useState<"idle" | "connecting" | "listening" | "unsupported" | "error">("idle");
  const [lastTranscript, setLastTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const transcriberRef = useRef<LiveTranscriberHandle>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const recStartRef = useRef<number | null>(null);
  const transcribeAbortRef = useRef<AbortController | null>(null);

  // Teacher-only edit flow
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        setRole(prof?.role ?? null);
      }
    })();
    fetchExercise();
    refreshLibrary();
    return () => {
      try { transcriberRef.current?.stop(); } catch {}
      try { mediaRecorderRef.current?.stop(); } catch {}
      try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
      try { micStream?.getTracks().forEach((t) => t.stop()); } catch {}
      try { transcribeAbortRef.current?.abort(); } catch {}
      transcribeAbortRef.current = null;
    };
  }, []);

  // Sync draft when exercise changes
  useEffect(() => {
    if (exercise?.arabic_text && role === "teacher") setDraftText(exercise.arabic_text);
  }, [exercise?.id, exercise?.arabic_text, role]);

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
    setScore(null);
    setLastTranscript("");
    setLivePartial("");
    setLiveFinals([]);
    try { transcribeAbortRef.current?.abort(); } catch {}
    transcribeAbortRef.current = null;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    setMicStream(stream);
    recStartRef.current = Date.now();
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const inferredType = (chunksRef.current[0] as any)?.type || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: inferredType });
      let transcript = "";
      try {
        const base64 = await blobToBase64(blob);
        const ctrl = new AbortController();
        transcribeAbortRef.current = ctrl;
        const tRes = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioBase64: base64, mimeType: blob.type || "audio/webm" }),
          signal: ctrl.signal,
        });
        const data = await tRes.json();
        transcript = data?.transcript || "";
      } catch (e: unknown) {
        const err = e as { name?: string };
        if (err?.name === "AbortError") {
          transcribeAbortRef.current = null;
          setRecording(false);
          return;
        }
      }

      setLastTranscript(transcript);

      // Accuracy check
      const sRes = await fetch("/api/check-accuracy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalText: exercise?.arabic_text ?? "", spokenText: transcript }),
      });
      let sc = 0;
      try { sc = (await sRes.json())?.score ?? 0; } catch {}
      setScore(sc);
      const passed = sc >= 90;
      setMessage(passed ? "Success! Next exercise" : "Try again");

      // Persist attempt (best-effort)
      try {
        await fetch("/api/attempts", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercise_id: exercise?.id, score: sc, passed }),
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
    try { mediaRecorderRef.current?.stop(); } catch {}
    try { mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop()); } catch {}
    try { micStream?.getTracks().forEach((t) => t.stop()); } catch {}
    setMicStream(null);
    mediaRecorderRef.current = null;
    recStartRef.current = null;
    setRecording(false);
    transcriberRef.current?.stop();
  }, [micStream]);

  function timerText(start: number | null) {
    if (!start) return "00:00";
    const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-slate-900">Speaking Practice (Experimental)</h1>

        {library.length > 0 && (
          <div className="bg-white/70 rounded-xl ring-1 ring-slate-900/10 p-2 overflow-x-auto">
            <div className="flex gap-2 min-w-full w-max">
              {library.map((e) => (
                <button
                  key={e.id}
                  title={e.arabic_text}
                  onClick={() => { setExercise(e); setSelectedId(e.id); setEditing(false); setDraftText(e.arabic_text); }}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${selectedId===e.id? 'bg-slate-900 text-white' : 'ring-1 ring-slate-300 hover:bg-slate-50'}`}
                >
                  {e.arabic_text.length > 24 ? e.arabic_text.slice(0,24)+"…" : e.arabic_text}
                </button>
              ))}
            </div>
          </div>
        )}

        {exercise && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: prompt */}
            <div className="bg-white/90 rounded-xl ring-1 ring-slate-900/10 shadow-sm p-6">
              {!editing ? (
                <>
                  <div className="text-3xl mb-4 text-slate-800 break-words">{exercise.arabic_text}</div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      onClick={() => { try { transcriberRef.current?.stop(); } catch {}; try { micStream?.getTracks().forEach((t) => t.stop()); } catch {}; new Audio(exercise.audio_url).play(); }}
                    >Listen</button>
                    {role === "teacher" && (
                      <>
                        <button className="px-3 py-2 rounded-lg ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => { setEditing(true); setDraftText(exercise.arabic_text); }}>Edit Text</button>
                        <button
                          className="px-3 py-2 rounded-lg ring-1 ring-rose-300 text-rose-600 hover:bg-rose-50"
                          onClick={async () => {
                            if (!confirm("Delete this exercise?")) return;
                            const delAudio = confirm("Also delete the audio file from storage?");
                            try {
                              const res = await fetch("/api/exercises/delete", {
                                method: "DELETE",
                                credentials: "include",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: exercise.id, deleteAudio: delAudio }),
                              });
                              const j = await res.json().catch(() => ({}));
                              if (!res.ok || (j as any)?.error) throw new Error(((j as any)?.error) || `Failed ${res.status}`);
                              setExercise(null); setSelectedId(null); await refreshLibrary();
                            } catch (e) { alert((e as any)?.message || "Delete failed"); }
                          }}
                        >Delete</button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-sm text-slate-700 mb-1 block">Edit text</label>
                  <textarea className="w-full border border-slate-300 rounded-lg p-2" rows={4} value={draftText} onChange={(e) => setDraftText(e.target.value)} />
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      onClick={async () => {
                        const res = await fetch("/api/exercises/update", {
                          method: "PATCH",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: exercise.id, arabic_text: draftText }),
                        });
                        const j = await res.json().catch(() => ({}));
                        if (res.ok && (j as any)?.ok) { setExercise((j as any).exercise); setEditing(false); }
                        else alert(((j as any)?.error) || `Failed to save (${res.status})`);
                      }}
                    >Save</button>
                    <button className="px-3 py-2 rounded-lg ring-1 ring-slate-300 hover:bg-slate-50" onClick={() => { setEditing(false); setDraftText(exercise.arabic_text); }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: controls */}
            <div className="bg-white/90 rounded-xl ring-1 ring-slate-900/10 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-3">
                {!recording ? (
                  <button className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-sky-500" onClick={startRecording}>Record</button>
                ) : (
                  <button className="px-4 py-2 rounded-lg text-white bg-rose-600 hover:bg-rose-500" onClick={stopRecording}>Stop</button>
                )}
                <div className="text-xs text-slate-500">{recording ? `Recording ${timerText(recStartRef.current)}` : ""}</div>
              </div>

              {recording && (
                <LevelMeter stream={micStream} height={42} className="w-full ring-1 ring-slate-200 rounded-md bg-white/60 mb-3" />
              )}

              <div className="text-sm font-medium text-slate-700 mb-1">Live transcript</div>
              <div className="min-h-20 rounded border border-slate-200 p-3 text-slate-800 bg-white/60">
                {liveFinals.length > 0 && <div className="mb-2 text-slate-700">{liveFinals.join(" ")}</div>}
                <div className="text-slate-500">
                  {livePartial || (liveStatus === "unsupported" ? "Live captions not supported in this browser" : liveStatus === "connecting" ? "Connecting…" : liveStatus === "listening" ? "Listening…" : "")}
                </div>
              </div>

              <LiveTranscriber
                ref={transcriberRef}
                lang="ar"
                onPartial={(t) => setLivePartial(t)}
                onFinal={(t) => setLiveFinals((prev) => (t ? [...prev, t] : prev))}
                onStatus={(s) => setLiveStatus(s)}
              />

              {score !== null && <div className="mt-3 text-sm text-slate-600">Score: {score}</div>}
              {lastTranscript && <div className="mt-2 text-sm text-slate-600 break-words">Transcript: {lastTranscript}</div>}
              {message && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="text-slate-700">{message}</div>
                  <button className="px-3 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-500" onClick={fetchExercise}>Next</button>
                </div>
              )}
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
    reader.onloadend = () => resolve((reader.result as string).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

