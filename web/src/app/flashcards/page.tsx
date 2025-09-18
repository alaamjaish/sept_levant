import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { FlashcardSet } from "@/data/flashcards";
import NewFlashcardSetButton from "./NewFlashcardSetButton";

const gradients = [
  "linear-gradient(135deg, rgba(13,166,242,0.65), rgba(26,44,56,0.85))",
  "linear-gradient(135deg, rgba(26,44,56,0.9), rgba(13,166,242,0.5))",
  "linear-gradient(135deg, rgba(13,166,242,0.55), rgba(16,29,35,0.9))",
  "linear-gradient(135deg, rgba(21,141,210,0.6), rgba(16,29,35,0.85))",
];

function gradientFromSeed(seed: string | null | undefined, fallbackIndex: number) {
  if (!seed) {
    return gradients[fallbackIndex % gradients.length];
  }
  const hash = hashSeed(seed);
  return gradients[hash % gradients.length];
}

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  }
  return Math.abs(hash);
}

function formatCardCount(count: number) {
  if (count === 1) return "1 Card";
  return `${count} Cards`;
}

export default async function FlashcardSetsPage() {
  const supabase = createServerComponentClient({ cookies });
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
            <NewFlashcardSetButton />
          </div>
        </header>

        <section className="mt-6 grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {sets.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-dark)] bg-[var(--surface-dark)]/40 px-6 py-16 text-center text-[var(--text-secondary)]">
              <p className="text-lg font-semibold text-[var(--text-primary)]">No sets yet</p>
              <p className="mt-2 text-sm">
                Start your first deck to see it appear here. Each set keeps translations and examples ready.
              </p>
            </div>
          )}

          {sets.map((set, index) => (
            <Link
              key={set.id}
              href={`/flashcards/${set.id}`}
              className="group relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-xl border border-[var(--border-dark)] bg-[var(--surface-dark)] shadow-[0_12px_24px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,0,0,0.2)]"
              style={{ background: gradientFromSeed(set.coverSeed, index) }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
              <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-white">
                {formatCardCount(set.cardCount)}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-lg font-bold text-white line-clamp-2">{set.title}</h2>
                {set.description && (
                  <p className="mt-1 text-sm text-white/80 line-clamp-1">
                    {set.description}
                  </p>
                )}
                <div className="mt-2">
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs text-white">Updated recently</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
