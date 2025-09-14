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
import { supabase } from "@/lib/supabaseClient";

type Exercise = {
  id: string;
  arabic_text: string;
  audio_url: string;
  exercise_type: "listening" | "speaking";
  difficulty_level?: number;
};

export default function SpeakingStitch3Page() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [library, setLibrary] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [recording, setRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [feedbackDetail, setFeedbackDetail] = useState<string>("");
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [lastStudentBlob, setLastStudentBlob] = useState<Blob | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

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
  const capturedTranscriptionRef = useRef<{finals: string[], partial: string} | null>(null);

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
    setAttemptCount(0); // Reset attempt counter for new exercise
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

  function getDifficultyLabel(level?: number) {
    const levels = {
      1: "Beginner",
      2: "Intermediate", 
      3: "Advanced",
      4: "Expert",
      5: "Master"
    };
    return levels[level as keyof typeof levels] || "Intermediate";
  }

  const startRecording = useCallback(async () => {
    setScore(null);
    setFeedbackMessage("");
    setFeedbackDetail("");
    setLastTranscript("");
    setLastStudentBlob(null);
    setAttemptCount(prev => prev + 1);
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
      const inferredType = (chunksRef.current[0] as any)?.type || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: inferredType });
      setLastStudentBlob(blob);

      // Use the captured transcription from stopRecording
      const captured = capturedTranscriptionRef.current;
      console.log("mr.onstop called, captured transcription:", captured);

      // Use the live transcription results instead of speechmatics API
      let transcript = "";
      if (captured && captured.finals.length > 0) {
        transcript = captured.finals.join(" ");
        console.log("Using captured finals:", transcript);
      } else if (captured && captured.partial.trim()) {
        // Use the partial transcript if no finals but we have partial text
        transcript = captured.partial.trim();
        console.log("Using captured partial:", transcript);
      } else {
        // Fallback to speechmatics only if no live transcription at all
        console.log("No captured transcription found, using speechmatics fallback");
        try {
          const base64 = await blobToBase64(blob);
          const ctrl = new AbortController();
          transcribeAbortRef.current = ctrl;
          const tRes = await fetch("/api/transcribe", {
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
          console.log("Using speechmatics fallback:", transcript);
        } catch (e: unknown) {
          const err = e as { name?: string };
          if (err?.name === "AbortError") {
            transcribeAbortRef.current = null;
            setRecording(false);
            return;
          }
        }
      }

      console.log("Final transcript being sent:", transcript);
      setLastTranscript(transcript);

      // Use new enhanced LLM feedback endpoint
      const sRes = await fetch("/api/check-accuracy-enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: exercise?.arabic_text ?? "",
          spokenText: transcript,
        }),
      });
      let responseData = { score: 0, feedbackMessage: "", feedbackDetail: "" };
      try {
        responseData = await sRes.json();
      } catch {}
      
      setScore(responseData.score || 0);
      setFeedbackMessage(responseData.feedbackMessage || "");
      setFeedbackDetail(responseData.feedbackDetail || "");
      const passed = (responseData.score || 0) >= 60;

      try {
        await fetch("/api/attempts", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercise_id: exercise?.id,
            score: responseData.score || 0,
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
    
    // CAPTURE TRANSCRIPTION BEFORE STOPPING ANYTHING
    const capturedFinals = [...liveFinals];
    const capturedPartial = livePartial;
    console.log("Capturing transcription before stop - Finals:", capturedFinals, "Partial:", capturedPartial);
    
    // Store in ref so mr.onstop can access it
    capturedTranscriptionRef.current = {
      finals: capturedFinals,
      partial: capturedPartial
    };
    
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
    recStartRef.current = null;
    setRecording(false);
    transcriberRef.current?.stop();
  }, [micStream, liveFinals, livePartial]);

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
    <div className={`min-h-screen bg-[#101d23] text-white ${spaceGrotesk.variable} ${notoArabic.variable}`}>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#223c49] px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="size-6 text-[#0da6f2]">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" />
            </svg>
          </div>
            <h2 className="text-xl font-bold tracking-tight"><Link href="/dashboard">LevantTalk</Link></h2>
        </div>
        <nav className="hidden md:flex items-center gap-9">
          <a className="text-white/80 hover:text-white text-sm font-medium" href="#">Home</a>
          <a className="text-white/80 hover:text-white text-sm font-medium" href="#">Lessons</a>
          <a className="text-white/80 hover:text-white text-sm font-medium" href="#">Community</a>
          <a className="text-white/80 hover:text-white text-sm font-medium" href="#">Resources</a>
        </nav>
        <div className="flex gap-2">
          <button className="h-10 px-4 rounded-md bg-[#0da6f2] text-white text-sm font-bold hover:bg-[#0a8cd9]">
            Sign up
          </button>
          <button className="h-10 px-4 rounded-md bg-[#223c49] text-white text-sm font-bold hover:bg-[#2c4c5c]">
            Log in
          </button>
        </div>
      </header>

      {/* Lesson Navigation */}
      <div className="py-4">
        <div className="container mx-auto flex items-center justify-center gap-4">
          <button className="text-white/50 hover:text-white">
            <IconChevronLeft className="w-10 h-10" />
          </button>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((num, idx) => (
              <div
                key={num}
                className={`w-16 h-10 rounded-md border flex items-center justify-center text-sm font-medium ${
                  idx === 1
                    ? "bg-[#0da6f2] border-[#0da6f2] text-white font-bold"
                    : "bg-[#1a2c38] border-[#223c49] text-white/70"
                }`}
              >
                {num}
              </div>
            ))}
            <div className="w-16 h-10 rounded-md bg-[#1a2c38] border border-[#223c49] flex items-center justify-center text-sm font-medium text-white/70">
              ...
            </div>
            <div className="w-16 h-10 rounded-md bg-[#1a2c38] border border-[#223c49] flex items-center justify-center text-sm font-medium text-white/70">
              10
            </div>
          </div>
          <button className="text-white/50 hover:text-white">
            <IconChevronRight className="w-10 h-10" />
          </button>
        </div>
      </div>

      {exercise && (
        <main className="flex p-8 pt-0 gap-8 min-h-[calc(100vh-200px)]">
          {/* Left Column - Text and Audio */}
          <div className="flex flex-col w-1/2 bg-[#1a2c38] rounded-xl p-8 justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 bg-[#2c4c5c] text-white px-3 py-1 rounded-full text-sm font-medium">
                  <IconMedal className="w-4 h-4" />
                  <span>{getDifficultyLabel(exercise.difficulty_level)}</span>
                </div>
                <div className="text-white/60 text-sm font-medium">
                  Attempt {attemptCount > 0 ? `${attemptCount}/5` : "1/5"}
                </div>
              </div>
              
              {!editing ? (
                <div className="relative group">
                  <p 
                    className="text-white text-2xl font-normal leading-loose text-right pr-10"
                    style={{ fontFamily: "var(--font-noto-ar), Noto Sans Arabic, sans-serif" }}
                  >
                    {exercise.arabic_text}
                  </p>
                  {(role === "teacher" || role === "admin") && (
                    <button
                      className="absolute top-0 right-0 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setEditing(true)}
                      title="Edit text"
                    >
                      <IconEdit className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    className="w-full rounded-md bg-[#0f1a20] border border-[#2b4554] p-3 text-white text-right"
                    rows={4}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    style={{ fontFamily: "var(--font-noto-ar), Noto Sans Arabic, sans-serif" }}
                  />
                  <div className="flex gap-2">
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
            </div>

            {/* Audio Controls */}
            <div className="w-full flex flex-col items-center gap-4">
              <audio ref={audioRef} src={exercise.audio_url} preload="metadata" />
              <div className="w-full flex items-center gap-4 text-white/60 text-sm font-medium">
                <p>{formatDuration(Math.floor(audioTime))}</p>
                <div className="relative flex-1 h-1.5 bg-[#315668] rounded-full">
                  <div 
                    className="absolute h-full bg-[#0da6f2] rounded-full"
                    style={{ width: audioDuration ? `${(audioTime / audioDuration) * 100}%` : "0%" }}
                  />
                  <div 
                    className="absolute w-4 h-4 bg-white rounded-full -top-1.5"
                    style={{ left: audioDuration ? `${(audioTime / audioDuration) * 100}%` : "0%" }}
                  />
                </div>
                <p>{audioDuration ? `-${formatDuration(Math.max(0, Math.floor(audioDuration - audioTime)))}` : "-0:00"}</p>
              </div>
              
              {exercise.audio_url ? (
                <button
                  className="flex items-center justify-center gap-3 h-12 w-12 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-full"
                  onClick={() => audioPlaying ? audioRef.current?.pause() : audioRef.current?.play()}
                >
                  {audioPlaying ? <IconPause className="w-8 h-8" /> : <IconPlay className="w-8 h-8" />}
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-3 h-12 w-12 rounded-full bg-[#223c49] text-white/60 cursor-not-allowed"
                >
                  <IconPlay className="w-8 h-8" />
                </button>
              )}

              {/* Admin Audio Controls */}
              {(role === "teacher" || role === "admin") && (
                <div className="w-full mt-4 p-4 rounded-lg bg-[#0f1a20] border border-[#2b4554]">
                  <div className="text-xs text-white/80 mb-3">Admin: Audio Controls</div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a] cursor-pointer">
                        <IconUpload className="w-3 h-3" />
                        <span>Upload</span>
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
                          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]"
                          onClick={async () => {
                            try {
                              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                              const mr = new MediaRecorder(stream);
                              teacherChunksRef.current = [];
                              mr.ondataavailable = (ev) => teacherChunksRef.current.push(ev.data);
                              mr.onstop = async () => {
                                setTeacherRecording(false);
                                try { stream.getTracks().forEach((t) => t.stop()); } catch {}
                                setReplaceSaving(true);
                                setReplaceError("");
                                try {
                                  const teacherType = (teacherChunksRef.current[0] as any)?.type || "audio/webm";
                                  const blob = new Blob(teacherChunksRef.current, { type: teacherType });
                                  const path = `exercises/${exercise?.id}/${Date.now()}.webm`;
                                  const { error: upErr } = await supabase.storage
                                    .from("audio")
                                    .upload(path, blob, { contentType: teacherType, upsert: false });
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
                          <IconMic className="w-3 h-3" />
                          Record
                        </button>
                      ) : (
                        <button
                          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-500"
                          onClick={() => {
                            try { teacherMediaRef.current?.stop(); } catch {}
                          }}
                        >
                          <IconStop className="w-3 h-3" />
                          Stop
                        </button>
                      )}

                      {exercise.audio_url && (
                        <button
                          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]"
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
                          <IconTrash className="w-3 h-3" />
                          Remove
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

          {/* Right Column - Recording and Results */}
          <div className="flex flex-col w-1/2 bg-[#1a2c38] rounded-xl p-8 gap-6">
            <div className="flex-grow flex flex-col justify-center">
              <h2 className="text-white text-2xl font-bold tracking-tight text-center mb-1">Your Turn to Speak</h2>
              <p className="text-white/60 text-base text-center mb-6">Tap to record, then see your live transcription below.</p>
              
              <div className="flex justify-center items-center h-[180px] bg-black/20 rounded-lg border border-dashed border-[#223c49] p-4">
                <div
                  className="text-white/80 text-right text-xl leading-relaxed w-full"
                  style={{ fontFamily: "var(--font-noto-ar), Noto Sans Arabic, sans-serif" }}
                  dir="rtl"
                  lang="ar"
                >
                  {recording ? (
                    <>
                      {liveFinals.length > 0 && (
                        <div className="mb-3 text-white">
                          {liveFinals.join(" ")}
                        </div>
                      )}
                      <div className="text-white/70">
                        {livePartial ||
                          (liveStatus === "unsupported"
                            ? "نسخ مباشر غير مدعوم في هذا المتصفح"
                            : liveStatus === "connecting"
                            ? "جارٍ الاتصال…"
                            : liveStatus === "listening"
                            ? "جارٍ الاستماع…"
                            : "")}
                      </div>
                    </>
                  ) : lastTranscript ? (
                    lastTranscript
                  ) : (
                    <span className="text-white/40">Your transcription will appear here...</span>
                  )}
                </div>
                <LiveTranscriber
                  ref={transcriberRef}
                  lang="ar"
                  onPartial={(t) => setLivePartial(t)}
                  onFinal={(t) => setLiveFinals((prev) => (t ? [...prev, t] : prev))}
                  onStatus={(s) => setLiveStatus(s)}
                />
              </div>
            </div>

            <div className="flex justify-center items-center mb-6">
              <button
                className={`flex items-center justify-center gap-3 h-20 w-20 rounded-full transition-colors text-white ${
                  recording
                    ? "bg-red-600 hover:bg-red-500 shadow-[0_0_0_10px_rgba(244,63,94,0.35)]"
                    : "bg-[#0da6f2] hover:bg-[#0a8cd9] shadow-[0_0_0_10px_rgba(13,166,242,0.3)]"
                }`}
                onClick={recording ? stopRecording : startRecording}
              >
                {recording ? <IconStop className="w-10 h-10" /> : <IconMic className="w-10 h-10" />}
              </button>
            </div>

            {recording && (
              <div className="text-center text-white/70 text-sm mb-4">
                Recording {timerText(recStartRef.current)}
              </div>
            )}

            {/* Results Panel */}
            {score !== null && (
              <div className="bg-[#101d23] rounded-lg p-6 border border-[#223c49]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-2/3">
                    <p className="text-white/60 text-sm font-medium">Your Score</p>
                    <p className="text-white text-4xl font-bold">{score}%</p>
                  </div>
                  <div className="w-1/3 flex items-center justify-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-[#315668]"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className={score >= 80 ? "text-green-500" : score >= 60 ? "text-yellow-500" : "text-red-500"}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray={`${score}, 100`}
                          strokeLinecap="round"
                          strokeWidth="3"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                        {score}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-white/70 text-sm mb-4">
                  <p className="font-medium text-white mb-1">{feedbackMessage}</p>
                  <p>{feedbackDetail}</p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 mt-4 border-t border-[#223c49]">
                  <button
                    className="flex-1 h-10 px-4 rounded-md bg-[#223c49] text-white text-sm font-bold hover:bg-[#2c4c5c]"
                    onClick={startRecording}
                  >
                    Try Again
                  </button>
                  {score >= 60 && (
                    <button
                      className="flex-1 h-10 px-4 rounded-md bg-[#0da6f2] text-white text-sm font-bold hover:bg-[#0a8cd9]"
                      onClick={fetchExercise}
                    >
                      Next Challenge
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
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

// Icons
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

function IconTrash({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9 3h6a1 1 0 0 1 1v1h4a1 1 0 1 1 0 2h-1l-1 12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3L4 7H3a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1zm2 14a1 1 0 1 0 2 0V9a1 1 0 1 0-2 0v8z" />
    </svg>
  );
}

function IconMedal({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-8c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
    </svg>
  );
}

function IconChevronLeft({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

function IconChevronRight({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}
