export default function Features() {
  const items = [
    { title: "Instant accuracy scoring and tips", desc: "Understand what to fix right away." },
    { title: "Live transcript while speaking", desc: "See what the mic hears in real time." },
    {
      title: "Flashcards that fill themselves",
      desc: "Save new words from any lesson and get the meaning, example, and audio automatically.",
    },
    { title: "Short, real‑world phrases", desc: "Practice everyday Arabic that sticks." },
    { title: "Teacher tools for custom lessons", desc: "Create lessons with your own audio." },
  ];

  return (
    <section className="bg-[var(--background-dark)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold tracking-tight">Why it helps</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div
              key={f.title}
              className="rounded-xl bg-[var(--surface-dark)] border border-[var(--border-dark)] p-5"
            >
              <div className="text-white font-semibold">{f.title}</div>
              <div className="mt-1 text-white/80 text-sm">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

