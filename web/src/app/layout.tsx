import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AuthNav from "@/components/AuthNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LevantTalk — Learn Arabic by Speaking",
  description:
    "Practice Arabic with short lessons and instant feedback. Listen, speak, and improve your pronunciation and accuracy every day.",
  openGraph: {
    title: "LevantTalk — Learn Arabic by Speaking",
    description:
      "Practice Arabic with short lessons and instant feedback.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LevantTalk — Learn Arabic by Speaking",
    description:
      "Practice Arabic with short lessons and instant feedback.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check auth session on the server to render proper nav
  let isSignedIn = false;
  let email: string | null = null;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = !!user;
    email = user?.email ?? null;
  } catch {}
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header data-root-header="true" className="sticky top-0 z-50 w-full border-b border-[var(--border-dark)] bg-[var(--background-dark)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--background-dark)]/95">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent hover:from-blue-100 hover:to-white transition-all duration-200">
              LevantTalk
            </a>
            <AuthNav isSignedIn={isSignedIn} email={email} />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
