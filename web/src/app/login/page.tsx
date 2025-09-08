"use client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If already signed in, redirect immediately
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/dashboard");
    })();

    // Also listen for sign-in events
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") router.replace("/dashboard");
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center">
      <div className="max-w-md mx-auto w-full p-6 bg-white/90 rounded-xl shadow-sm ring-1 ring-slate-900/10">
        <h1 className="text-2xl font-semibold mb-4 text-center text-slate-900">Log in</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{ theme: ThemeSupa }}
          view="sign_in"
          redirectTo={typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined}
        />
      </div>
    </main>
  );
}
