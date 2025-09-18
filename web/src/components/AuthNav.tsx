"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function AuthNav({
  isSignedIn,
  email,
}: {
  isSignedIn: boolean;
  email?: string | null;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <a href="/login" className="px-3 py-1.5 rounded-md text-white/80 hover:bg-[#0b1c25]">Login</a>
        <a href="/signup" className="px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)]">Sign Up</a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <a href="/dashboard" className="px-3 py-1.5 rounded-md bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)]">Dashboard</a>
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

