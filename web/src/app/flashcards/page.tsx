import Link from "next/link";
import { flashcardSets } from "@/data/flashcards";

const panelClass = "rounded-2xl border border-[var(--border-dark)] bg-[var(--surface-dark)]";

export default function FlashcardSetsPage() {
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
            <button className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--accent-blue)] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-blue-hover)]">
              <span aria-hidden>+</span>
              <span>New Set</span>
            </button>
          </div>
        </header>

        <section className="mt-6 grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {flashcardSets.map((set) => (
            <Link
              key={set.id}
              href={`/flashcards/${set.id}`}
              className={`${panelClass} group flex flex-col overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.2)] transition hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(0,0,0,0.25)]`}
            >
              <div className="relative aspect-[4/3] w-full" style={{ background: set.image }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {set.cardCount} Cards
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between px-5 pb-6 pt-5">
                <div>
                  <h2 className="text-lg font-semibold">{set.title}</h2>
                  <p className="mt-2 text-sm leading-snug text-[var(--text-secondary)]">{set.description}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--accent-blue)]">
                  {set.tags.map((tag) => (
                    <span key={`${set.id}-${tag}`} className="rounded-full bg-[var(--accent-blue)]/15 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
