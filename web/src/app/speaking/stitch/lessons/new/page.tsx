"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSpeakingLessonPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [text, setText] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [recording, setRecording] = useState(false);
  const chunksRef = useRef<BlobPart[]>([]);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

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
  }, []);

  async function startRec() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(s);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        try { s.getTracks().forEach((t) => t.stop()); } catch {}
        const inferredType = (chunksRef.current[0] as any)?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: inferredType });
        setLastBlob(blob);
        setRecording(false);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e) {
      setError("Microphone permission denied");
    }
  }

  function stopRec() {
    try { mediaRef.current?.stop(); } catch {}
  }

  async function save() {
    if (!text.trim()) { setError("Please enter the exercise text"); return; }
    if (!lastBlob) { setError("Please record audio first"); return; }
    setSaving(true);
    setError("");
    try {
      const { data: u } = await supabase.auth.getUser();
      const path = `audio/${u?.user?.id || "anon"}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("audio")
        .upload(path, lastBlob, { contentType: lastBlob.type || "audio/webm", upsert: false });
      if (upErr) throw new Error(upErr.message || "Upload failed");
      const { data: pub } = supabase.storage.from("audio").getPublicUrl(path);
      const res = await fetch("/api/exercises/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arabic_text: text.trim(),
          audio_url: pub.publicUrl,
          exercise_type: "speaking",
          level,
          title: title.trim() ? title.trim() : undefined,
          short_description: desc.trim() ? desc.trim() : undefined,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !(j as any)?.ok) throw new Error(((j as any)?.error) || `Failed ${res.status}`);
      const id = (j as any)?.exercise?.id;
      router.push(id ? `/speaking/stitch/lesson/${id}` : "/speaking/stitch/lessons");
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --background-dark: #101d23;
          --surface-dark: #1a2c38;
          --border-dark: #223c49;
          --accent-blue: #0da6f2;
          --accent-blue-hover: #0a8cd9;
          --text-primary: #ffffff;
          --text-secondary: #ffffffb3;
        }
      `}</style>
      <div className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)]" style={{fontFamily: '"Space Grotesk", "Noto Sans", sans-serif'}}>
        <header className="flex items-center justify-between border-b border-[var(--border-dark)] px-8 py-3">
          <h1 className="text-lg font-bold">New Speaking Lesson</h1>
          <a href="/speaking/stitch/lessons" className="text-white/70 hover:text-white text-sm">Back</a>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          {(role !== "teacher" && role !== "admin") && (
            <div className="mb-4 text-amber-300 text-sm">You might need teacher/admin role to save.</div>
          )}
          {error && <div className="mb-3 text-rose-400 text-sm">{error}</div>}

          <div className="mb-4">
            <label className="block text-sm text-white/80 mb-1">Level</label>
            <select
              className="w-full rounded-md bg-[#0f1a20] border border-[#2b4554] p-2 text-white"
              value={level}
              onChange={(e) => setLevel(e.target.value as any)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-white/80 mb-1">Title <span className="text-white/40">(optional)</span></label>
            <input
              className="w-full rounded-md bg-[#0f1a20] border border-[#2b4554] p-2 text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 60))}
              placeholder="Short title (max 60 chars)"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-white/80 mb-1">Short description <span className="text-white/40">(optional)</span></label>
            <textarea
              className="w-full rounded-md bg-[#0f1a20] border border-[#2b4554] p-3 text-white"
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value.slice(0, 160))}
              placeholder="One or two lines (max 160 chars)"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-white/80 mb-1">Exercise text</label>
            <textarea className="w-full rounded-md bg-[#0f1a20] border border-[#2b4554] p-3 text-white" rows={4} value={text} onChange={(e) => setText(e.target.value)} style={{fontFamily: '"Noto Sans Arabic", sans-serif'}} dir="rtl" lang="ar"/>
          </div>

          <div className="flex items-center gap-3 mb-4">
            {!recording ? (
              <button className="px-3 py-2 rounded-md bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)]" onClick={startRec}>Record</button>
            ) : (
              <button className="px-3 py-2 rounded-md bg-rose-600 hover:bg-rose-500" onClick={stopRec}>Stop</button>
            )}
            <button className="px-3 py-2 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]" onClick={() => { if (lastBlob) new Audio(URL.createObjectURL(lastBlob)).play(); }} disabled={!lastBlob}>Play</button>
            <button className="px-3 py-2 rounded-md ring-1 ring-[#2b4554] hover:bg-[#11222a]" onClick={() => setLastBlob(null)} disabled={!lastBlob}>Discard</button>
          </div>

          <button
            className="px-4 py-2 rounded-md bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] disabled:opacity-50"
            disabled={saving || !text.trim() || !lastBlob}
            onClick={save}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </main>
      </div>
    </>
  );
}
