"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthNav({
  isSignedIn,
  email,
}: {
  isSignedIn: boolean;
  email?: string | null;
}) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Link href="/flashcards" className="px-3 py-1.5 rounded-md text-white/80 hover:bg-[#0b1c25]">Flashcards</Link>
        <Link href="/login" className="px-3 py-1.5 rounded-md text-white/80 hover:bg-[#0b1c25]">Login</Link>
        <Link href="/signup" className="px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)]">Sign Up</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Link href="/flashcards" className="px-3 py-1.5 rounded-md text-white/80 hover:bg-[#0b1c25]">Flashcards</Link>
      <Link href="/dashboard" className="px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)]">Dashboard</Link>
      <span className="hidden sm:block px-2 py-1 rounded-md bg-white/5 text-white/80">{email || "Signed in"}</span>
      <button
        className="px-3 py-1.5 rounded-md text-white/80 hover:bg-[#0b1c25]"
        onClick={async () => {
          try { await supabase.auth.signOut(); } catch {}
          router.push("/");
          router.refresh();
        }}
      >
        Sign out
      </button>
    </div>
  );
}

