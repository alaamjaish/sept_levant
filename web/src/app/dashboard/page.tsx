import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import { featureFlags } from "@/lib/featureFlags";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const flashcardsEnabled = featureFlags.flashcards.enabled;
  let role: string | null = null;
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (userId) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (data && typeof data === "object" && "role" in data) {
        const candidate = (data as { role: string | null | undefined }).role;
        role = typeof candidate === "string" ? candidate : candidate ?? null;
      }
    }
  } catch {
    // ignore profile lookup issues for dashboard chrome
  }

  return (
    <main className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Dashboard</h1>
          <p className="text-[var(--text-secondary)]">Choose what to practice today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="/speaking/lessons" className="h-32 rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold">Practice Speaking</a>
          <a href="/listening" className="h-32 rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold">Practice Listening</a>
          {flashcardsEnabled && (
            <Link
              href="/flashcards"
              className="h-32 rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold"
            >
              My Cards
            </Link>
          )}
          {(role === "teacher" || role === "admin") && (
            <a href="/speaking/stitch/lessons/new" className="sm:col-span-2 h-32 rounded-2xl bg-[#0b1c25] border border-[var(--border-dark)] hover:border-[var(--accent-blue)] flex items-center justify-center text-xl font-bold">Create Lesson</a>
          )}
        </div>
      </div>
    </main>
  );
}
