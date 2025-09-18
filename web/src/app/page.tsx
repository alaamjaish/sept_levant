import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Metadata } from "next";
import Hero from "@/components/landing/Hero";

export const metadata: Metadata = {
  title: "LevantTalk - Learn Arabic with AI-Powered Speaking Practice",
  description: "Master Arabic pronunciation and conversation skills with AI-powered feedback. Practice speaking Arabic with instant accuracy scoring, live transcripts, and real-world phrases. Start your Arabic learning journey today.",
  keywords: ["learn Arabic", "Arabic pronunciation", "Arabic speaking practice", "AI language learning", "Arabic conversation", "speak Arabic", "Arabic lessons", "language learning app"],
  authors: [{ name: "LevantTalk" }],
  creator: "LevantTalk",
  publisher: "LevantTalk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://levanttalk.com'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LevantTalk - Learn Arabic with AI-Powered Speaking Practice",
    description: "Master Arabic pronunciation and conversation skills with AI-powered feedback. Practice speaking Arabic with instant accuracy scoring and real-world phrases.",
    url: "/",
    siteName: "LevantTalk",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LevantTalk - AI-Powered Arabic Learning Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LevantTalk - Learn Arabic with AI-Powered Speaking Practice",
    description: "Master Arabic pronunciation with AI feedback. Practice speaking Arabic with instant scoring and real-world phrases.",
    images: ["/og-image.jpg"],
    creator: "@levanttalk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default async function Home() {
  let isSignedIn = false;
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
  } catch {}
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "LevantTalk",
            "description": "AI-powered Arabic language learning platform with speaking practice and pronunciation feedback",
            "url": "https://levanttalk.com",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "featureList": [
              "AI-powered pronunciation feedback",
              "Instant accuracy scoring",
              "Live transcript while speaking",
              "Real-world Arabic phrases",
              "Speaking lessons",
              "Flashcard system"
            ],
            "inLanguage": ["en", "ar"],
            "educationalUse": "Language Learning",
            "educationalLevel": "Beginner to Advanced",
            "learningResourceType": "Interactive Application"
          })
        }}
      />
      <main className="bg-[var(--background-dark)] min-h-screen">
        <Hero isSignedIn={isSignedIn} />
      </main>
    </>
  );
}
