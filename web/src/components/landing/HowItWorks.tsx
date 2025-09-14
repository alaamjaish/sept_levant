export default function HowItWorks() {
  const steps = [
    { num: 1, title: "Pick a short lesson", desc: "Quick phrases you’ll actually use." },
    { num: 2, title: "Speak out loud", desc: "Listen, then read the phrase aloud." },
    { num: 3, title: "Get your score and tips", desc: "Improve with instant guidance." },
  ];

  return (
    <section className="bg-[var(--background-dark)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="rounded-xl bg-[var(--surface-dark)] border border-[var(--border-dark)] p-5"
            >
              <div className="text-white/70 text-sm">Step {s.num}</div>
              <div className="mt-1 text-white text-lg font-semibold">{s.title}</div>
              <div className="mt-1 text-white/80 text-sm">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

