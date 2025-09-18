export default function Hero({ isSignedIn }: { isSignedIn: boolean }) {
  const primary = isSignedIn
    ? { href: "/dashboard", label: "Go to Dashboard" }
    : { href: "/signup", label: "Start Learning Free" };
  const secondary = isSignedIn
    ? { href: "/speaking/lessons", label: "Browse Lessons" }
    : { href: "/login", label: "Sign In" };

  return (
    <section className="bg-[var(--background-dark)] text-[var(--text-primary)] relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 py-32 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-green-100 bg-clip-text text-transparent leading-tight">
            Master Arabic Speaking with AI
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-[var(--text-secondary)] leading-relaxed">
            Get instant pronunciation feedback, practice with interactive flashcards, and build confidence speaking Arabic with our AI-powered platform.
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={primary.href}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--accent-blue)] to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            aria-label={isSignedIn ? "Access your learning dashboard" : "Start your free Arabic learning journey"}
          >
            {primary.label}
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href={secondary.href}
            className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold ring-2 ring-[var(--border-dark)] text-white/90 hover:bg-white/10 hover:ring-white/30 transition-all duration-200"
            aria-label={isSignedIn ? "Browse available Arabic lessons" : "Sign in to your account"}
          >
            {secondary.label}
          </a>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left max-w-4xl mx-auto">
          <div className="group rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] p-6 hover:border-blue-500/50 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-white">AI Pronunciation Coach</h3>
            </div>
            <p className="text-[var(--text-secondary)]">Get instant, detailed feedback on your Arabic pronunciation with our advanced AI technology.</p>
          </div>

          <div className="group rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] p-6 hover:border-green-500/50 transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14L17 4M11 9v6M13 9v6" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-white">Real-Time Transcription</h3>
            </div>
            <p className="text-[var(--text-secondary)]">See your spoken Arabic transcribed live as you practice, helping you track your progress.</p>
          </div>

          <div className="group rounded-2xl bg-[var(--surface-dark)] border border-[var(--border-dark)] p-6 hover:border-purple-500/50 transition-all duration-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="rounded-lg bg-purple-500/10 p-3">
                <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-white">Interactive Flashcards</h3>
            </div>
            <p className="text-[var(--text-secondary)]">Master vocabulary with smart flashcards that adapt to your learning pace and track your progress.</p>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-center text-[var(--text-secondary)]">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">Free to start</span>
          </div>
        </div>

        <p className="mt-12 text-xl font-medium bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          Start speaking Arabic confidently today
        </p>
      </div>
    </section>
  );
}
