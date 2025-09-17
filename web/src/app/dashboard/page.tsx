import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  let role: string | null = null;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
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
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Dashboard</h1>
          <p className="text-[var(--text-secondary)]">Choose what to practice today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/speaking/lessons"
            className="h-32 rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex flex-col items-center justify-center text-center px-4"
          >
            <span className="text-xl font-bold">Practice Speaking</span>
            <span className="text-sm text-[var(--text-secondary)]">{speakingCount} lessons</span>
          </a>
          <a
            href="/listening"
            className="h-32 rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex flex-col items-center justify-center text-center px-4"
          >
            <span className="text-xl font-bold">Practice Listening</span>
            <span className="text-sm text-[var(--text-secondary)]">{listeningCount} tracks</span>
          </a>
          <a
            href="/flashcards"
            className="h-32 rounded-2xl bg-[#0b1c25] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex flex-col items-center justify-center text-center px-4 sm:col-span-2"
          >
            <span className="text-xl font-bold">Study Flashcards</span>
            <span className="text-sm text-[var(--text-secondary)]">Craft Levantine cards with short examples</span>
          </a>
          {(role === "teacher" || role === "admin") && (
            <a
              href="/speaking/stitch/lessons/new"
              className="sm:col-span-2 h-32 rounded-2xl bg-[#112734] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold"
            >
              Create Lesson
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

