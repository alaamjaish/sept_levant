export default function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const primary = isSignedIn
    ? { href: "/dashboard", label: "Go to dashboard" }
    : { href: "/signup", label: "Sign up free" };
  const secondary = isSignedIn
    ? { href: "/speaking/lessons", label: "Browse lessons" }
    : { href: "/login", label: "Log in" };
  const highlights = [
    "Instant accuracy scoring",
    "Live transcript while speaking",
    "One-tap flashcards from any lesson",
    "Short, real-world phrases",
  ];

  return (
    <section className="bg-[var(--background-dark)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" dir="rtl" lang="ar">
          Practice Arabic. Remember what matters.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)]">
          Speak through short lessons, get instant feedback, and save new words to smart flashcards that fill themselves in.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={primary.href}
            className="inline-flex items-center justify-center rounded-md bg-[var(--accent-blue)] px-5 py-3 text-white font-medium hover:bg-[var(--accent-blue-hover)] transition"
          >
            {primary.label}
          </a>
          <a
            href={secondary.href}
            className="inline-flex items-center justify-center rounded-md px-5 py-3 font-medium ring-1 ring-[var(--border-dark)] text-white/90 hover:bg-[#11222a] transition"
          >
            {secondary.label}
          </a>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-sm text-white/90">
          {highlights.map((item) => (
            <div
              key={item}
              className="rounded-lg bg-[var(--surface-dark)] border border-[var(--border-dark)] px-4 py-3"
            >
              {item}
            </div>
          ))}
        </div>

        <p className="mt-8 text-white/70 text-sm">Speak Arabic with confidence</p>
      </div>
    </section>
  );
}
