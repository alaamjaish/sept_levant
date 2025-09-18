import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { FlashcardSet } from "@/data/flashcards";
import NewFlashcardSetButton from "./NewFlashcardSetButton";
import FlashcardSetCard from "./FlashcardSetCard";


export default async function FlashcardSetsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return (
      <main className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)]">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-semibold">Sign in to access flashcards</h1>
          <p className="mt-3 max-w-md text-sm text-[var(--text-secondary)]">
            Create an account or sign in to build personalised decks synced across your devices.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent-blue)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-blue-hover)]"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  const { data: rows } = await supabase
    .from("flashcard_sets")
    .select("id,title,description,cover_seed,created_at, flashcards(count)")
    .order("created_at", { ascending: false })
    .eq("user_id", user.id);

  const sets: FlashcardSet[] = (rows ?? []).map((row: any) => {
    const count = Array.isArray(row.flashcards) && row.flashcards.length > 0 ? row.flashcards[0]?.count ?? 0 : 0;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      cardCount: count,
      coverSeed: row.cover_seed,
      createdAt: row.created_at,
    };
  });

  return (
    <main className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-12 pt-6">
        <header className="flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-secondary)]">Flashcards</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">My Flashcard Sets</h1>
          <div className="mt-4 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <label className="relative block w-full flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-secondary)]">
                <svg className="h-4 w-4" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                </svg>
              </span>
              <input
                className="h-11 w-full rounded-full border border-[var(--border-dark)] bg-[var(--surface-dark)] pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                placeholder="Search sets..."
                disabled
              />
            </label>
            {/* Desktop: Keep button next to search */}
            <div className="hidden sm:block">
              <NewFlashcardSetButton />
            </div>
          </div>

          {/* Mobile: Centered New Set Button */}
          <div className="mt-6 flex justify-center sm:hidden">
            <div className="transform scale-110">
              <NewFlashcardSetButton />
            </div>
          </div>
        </header>

        <section className="mt-6 flex flex-1 justify-center">
          <div className="w-full max-w-4xl">
            {sets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-dark)] bg-[var(--surface-dark)]/40 px-6 py-16 text-center text-[var(--text-secondary)]">
                <p className="text-lg font-semibold text-[var(--text-primary)]">No sets yet</p>
                <p className="mt-2 text-sm">
                  Start your first deck to see it appear here. Each set keeps translations and examples ready.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sets.map((set, index) => (
                  <FlashcardSetCard key={set.id} set={set} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
