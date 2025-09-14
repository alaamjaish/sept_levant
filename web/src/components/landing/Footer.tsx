export default function Footer() {
  return (
    <footer className="bg-[var(--background-dark)] text-[var(--text-primary)] border-t border-[var(--border-dark)]">
      <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between text-sm text-white/70">
        <div>© LevantTalk</div>
        <nav className="flex items-center gap-4">
          <a className="hover:text-white" href="/docs">Docs</a>
          <a className="hover:text-white" href="#">Privacy</a>
          <a className="hover:text-white" href="#">Contact</a>
        </nav>
      </div>
    </footer>
  );
}

