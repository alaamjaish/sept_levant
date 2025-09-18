import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Hero from "@/components/landing/Hero";

export default async function Home() {
  let isSignedIn = false;
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = !!user;
  } catch {}
  return (
    <main className="bg-[var(--background-dark)]">
      <Hero isSignedIn={isSignedIn} />
    </main>
  );
}
