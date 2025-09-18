import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
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
    const supabase = createServerComponentClient({ cookies });
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
        <header data-root-header="true" className="sticky top-0 z-40 w-full border-b border-[#2b4554] bg-[#0f1a20]/90 text-white backdrop-blur supports-[backdrop-filter]:bg-[#0f1a20]/80">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold tracking-tight">LevantTalk</a>
            <AuthNav isSignedIn={isSignedIn} email={email} />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
