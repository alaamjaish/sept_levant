import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

type Exercise = {
  id: string;
  exercise_type: "listening" | "speaking";
  level?: "beginner" | "intermediate" | "advanced";
};

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  let isSignedIn = false;
  let role: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = !!user;
    if (user?.id) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = (data as any)?.role ?? null;
    }
  } catch {}

  async function getCount(t: "speaking" | "listening") {
    try {
      const { count } = await supabase
        .from("exercises")
        .select("id", { count: "exact", head: true })
        .eq("exercise_type", t);
      return count || 0;
    } catch {
      return 0;
    }
  }

  const speakingCount = await getCount("speaking");
  const listeningCount = await getCount("listening");

  return (
    <main className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-[var(--text-secondary)]">Choose what to practice today.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/speaking/lessons"
            className="h-32 rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold"
          >
            Practice Speaking
          </a>
          <a
            href="/listening"
            className="h-32 rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold"
          >
            Practice Listening
          </a>
          <a
            href="/flashcards"
            className="h-32 rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold"
          >
            Study Flashcards
          </a>
          {(role === "teacher" || role === "admin") && (
            <a
              href="/speaking/stitch/lessons/new"
              className="sm:col-span-2 lg:col-span-3 h-32 rounded-2xl bg-[#0b1c25] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold"
            >
              Create Lesson
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
