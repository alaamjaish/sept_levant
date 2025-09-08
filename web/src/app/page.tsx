import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function Home() {
  let isSignedIn = false;
  try {
    const supabase = createServerComponentClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    isSignedIn = !!session;
  } catch {}
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            Learn Arabic by Listening and Speaking
          </h1>
          <p className="text-slate-600 text-lg mb-10">
            Simple MVP: listen, read, record, and get feedback.
          </p>
        </div>

        <div className="flex gap-4">
          {isSignedIn ? (
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3 text-white font-medium shadow-sm hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500"
            >
              Go to Dashboard
            </a>
          ) : (
            <>
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-3 text-white font-medium shadow-sm hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              >
                Sign Up
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-white/90 px-5 py-3 text-slate-900 font-medium shadow-sm ring-1 ring-slate-900/10 hover:bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400"
              >
                Login
              </a>
            </>
          )}
        </div>

        <div className="mt-16 w-full max-w-2xl rounded-2xl bg-white/80 backdrop-blur-sm ring-1 ring-slate-900/10 shadow-sm p-6">
          <p className="text-slate-700 text-center">
            Tip: you can try the demo without configuring anything. For full
            functionality, connect Supabase and Speechmatics in the README.
          </p>
        </div>
      </div>
    </main>
  );
}
