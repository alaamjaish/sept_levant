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

export default function SpeakingLessonsDashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setIsSignedIn(!!data.user);
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
        const res = await fetch("/api/exercises/list?type=speaking&limit=100", { cache: "no-store" });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || `Failed ${res.status}`);
        if (Array.isArray(j?.items)) setItems(j.items);
      } catch (e: unknown) {
        setError((e as Error)?.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Speaking Lessons</h1>
            <div className="text-white/60 text-sm">{items.length} items</div>
          </div>
          {loading && <div className="text-white/70">Loading…</div>}
          {error && <div className="text-rose-400 text-sm mb-4">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((e) => (
              <Link
                key={e.id}
                href={`/speaking/stitch/lesson/${e.id}`}
                className="block rounded-lg border border-[var(--border-dark)] bg-[var(--surface-dark)] p-4 hover:border-[var(--accent-blue)] transition-colors"
              >
                <div className="text-white text-base mb-2 line-clamp-3" style={{fontFamily: '"Noto Sans Arabic", sans-serif'}} dir="rtl" lang="ar">
                  {e.arabic_text}
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Speaking</span>
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
