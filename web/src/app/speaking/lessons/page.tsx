"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Exercise = {
  id: string;
  arabic_text: string;
  audio_url: string;
  exercise_type: "listening" | "speaking";
  created_at?: string;
  level?: "beginner" | "intermediate" | "advanced";
};

export default function SpeakingLessonsIndex() {
  const [role, setRole] = useState<string | null>(null);
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [level, setLevel] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

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

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const q = new URLSearchParams({ type: "speaking", limit: "100" });
        if (level !== "all") q.set("level", level);
        const res = await fetch(`/api/exercises/list?${q.toString()}`, { cache: "no-store" });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || `Failed ${res.status}`);
        if (Array.isArray(j?.items)) setItems(j.items);
      } catch (e: unknown) {
        setError((e as Error)?.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    })();
  }, [level]);

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
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Noto+Sans+Arabic:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
      <div className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)]" style={{fontFamily: '"Space Grotesk", "Noto Sans", sans-serif'}}>
        <header className="flex items-center justify-between border-b border-[var(--border-dark)] px-8 py-3">
          <div className="flex items-center gap-3">
            <div className="size-6 text-[var(--accent-blue)]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Lingua</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/speaking" className="text-white/70 hover:text-white text-sm">Classic</Link>
            {(role === "teacher" || role === "admin") && (
              <Link href="/speaking/stitch/lessons/new" className="ml-2 px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)] text-sm">Create</Link>
            )}
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Speaking Lessons</h1>
            <div className="flex items-center gap-3">
              <div className="text-white/60 text-sm">{items.length} items</div>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="bg-[#0f1a20] border border-[#2b4554] text-white text-sm rounded-md px-2 py-1"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          {loading && <div className="text-white/70">Loading…</div>}
          {error && <div className="text-rose-400 text-sm mb-4">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((e) => (
              <Link
                key={e.id}
                href={`/speaking?id=${e.id}`}
                className="block rounded-lg border border-[var(--border-dark)] bg-[var(--surface-dark)] p-4 hover:border-[var(--accent-blue)] transition-colors"
              >
                <div className="text-white text-base mb-2 line-clamp-3" style={{fontFamily: '"Noto Sans Arabic", sans-serif'}} dir="rtl" lang="ar">
                  {e.arabic_text}
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="capitalize">{e.level || "beginner"}</span>
                  <span>{formatDate(e.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
          {items.length === 0 && !loading && (
            <div className="text-white/60">No lessons yet.</div>
          )}
        </main>
      </div>
    </>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}
