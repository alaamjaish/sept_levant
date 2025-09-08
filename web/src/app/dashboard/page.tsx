"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        setRole(prof?.role ?? null);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">Welcome{email ? `, ${email}` : ""}</h1>
        <div className="flex gap-4 mt-6">
          <Link href="/listening" className="px-4 py-2 rounded-lg text-lg text-white bg-gradient-to-r from-indigo-600 to-sky-500 shadow-sm hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500">
            Practice Listening
          </Link>
          <Link href="/speaking" className="px-4 py-2 rounded-lg text-lg text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-sm hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500">
            Practice Speaking
          </Link>
          {role === "teacher" && (
            <Link href="/admin" className="px-4 py-2 rounded-lg text-lg text-white bg-slate-900 hover:bg-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500">
              Add Content
            </Link>
          )}
        </div>
        <button
          className="mt-8 text-sm text-slate-600 underline hover:text-slate-800"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
