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
  title?: string | null;
  short_description?: string | null;
};

export default function SpeakingLessonsIndex() {
  const [role, setRole] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [allItems, setAllItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [level, setLevel] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

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
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError("");
      try {
        const q = new URLSearchParams({ type: "speaking", limit: "200" });
        const res = await fetch(`/api/exercises/list?${q.toString()}`, { cache: "no-store", signal: ac.signal as any });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || `Failed ${res.status}`);
        if (Array.isArray(j?.items)) setAllItems(j.items);
      } catch (e: unknown) {
        if ((e as any)?.name !== 'AbortError') setError((e as Error)?.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // Persist selected level and reflect in URL for shareability (no reload)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (level === "all") {
        url.searchParams.delete("level");
      } else {
        url.searchParams.set("level", level);
      }
      window.history.replaceState({}, "", url.toString());
      localStorage.setItem("speaking_level_filter", level);
    } catch {}
  }, [level]);

  // Initialize from URL or last choice
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const fromUrl = (url.searchParams.get("level") || "").toLowerCase();
      const saved = localStorage.getItem("speaking_level_filter") || "";
      const valid = ["all","beginner","intermediate","advanced"] as const;
      const init = (valid as readonly string[]).includes(fromUrl) ? fromUrl : ((valid as readonly string[]).includes(saved) ? saved : "all");
      setLevel(init as any);
    } catch {}
  }, []);

  // Filter + sort locally for instant toggles
  const items = (() => {
    const filtered = level === "all" ? allItems : allItems.filter((x) => (x.level || "beginner") === level);
    const rank = (lvl?: string) => {
      switch ((lvl || 'beginner').toLowerCase()) {
        case 'beginner': return 0;
        case 'intermediate': return 1;
        case 'advanced': return 2;
        default: return 3;
      }
    };
    return [...filtered].sort((a, b) => {
      const ra = rank(a.level);
      const rb = rank(b.level);
      if (ra !== rb) return ra - rb;
      const ta = new Date(a.created_at || 0).getTime();
      const tb = new Date(b.created_at || 0).getTime();
      return tb - ta;
    });
  })();

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
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-3 text-center">Speaking Lessons</h1>
            <div className="grid grid-cols-3 items-center">
              <div className="text-white/60 text-sm">{items.length} items</div>
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1 p-1 rounded-xl border border-[#2b4554] bg-[#0f1a20]">
                  {([
                    { key: "all", label: "All" },
                    { key: "beginner", label: "Beginner" },
                    { key: "intermediate", label: "Intermediate" },
                    { key: "advanced", label: "Advanced" },
                  ] as const).map((opt) => {
                    const active = level === opt.key;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setLevel(opt.key)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          active ? "bg-[var(--accent-blue)] text-white" : "text-white/70 hover:text-white hover:bg-[#0b1c25]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div></div>
            </div>
          </div>
          {error && <div className="text-rose-400 text-sm mb-4">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((e) => (
              <Link
                key={e.id}
                href={`/speaking?id=${e.id}`}
                className="block rounded-lg border border-[var(--border-dark)] bg-[var(--surface-dark)] p-4 hover:border-[var(--accent-blue)] transition-colors h-40 sm:h-44 lg:h-48"
              >
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <div className="text-white text-base font-semibold mb-1 line-clamp-1">{deriveTitle(e)}</div>
                    <div className="text-white/70 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                      {e.short_description ? clampDesc(e.short_description) : ''}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/60 mt-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block size-2 rounded-full ${levelDotClass(e.level)}`}></span>
                      <span className="capitalize">{e.level || 'beginner'}</span>
                    </div>
                    <span>{formatDate(e.created_at)}</span>
                  </div>
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

function deriveTitle(e: { title?: string | null; arabic_text: string; id: string }): string {
  const t = (e.title || "").trim();
  if (t) return t.length > 60 ? t.slice(0, 60) : t;
  const a = (e.arabic_text || "").trim();
  if (!a) return `Lesson ${e.id}`;
  const first = (a.split(/[\.\!\؟\!\?\n\r]/)[0] || a).trim();
  const base = first || a;
  return base.length > 60 ? base.slice(0, 60) : base;
}

function clampDesc(d?: string | null): string {
  const s = (d || "").trim();
  if (!s) return "";
  return s.length > 160 ? s.slice(0, 160) : s;
}

function levelDotClass(level?: string) {
  switch ((level || 'beginner').toLowerCase()) {
    case 'advanced':
      return 'bg-rose-400';
    case 'intermediate':
      return 'bg-amber-300';
    default:
      return 'bg-emerald-300';
  }
}




