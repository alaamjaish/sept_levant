import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { Flashcard, FlashcardSet } from "@/data/flashcards";
import { FlashcardPlayer } from "./FlashcardPlayer";

type FlashcardSetPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FlashcardSetPage({ params }: FlashcardSetPageProps) {
  const resolvedParams = await params;
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

  if (!user?.id) {
    redirect("/login");
  }

  const { data: setRow, error: setError } = await supabase
    .from("flashcard_sets")
    .select("id,title,description,cover_seed,created_at")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .single();

  if (setError || !setRow) {
    notFound();
  }

  const { data: cardRows, error: cardError } = await supabase
    .from("flashcards")
    .select("id, front_ar, back_en, example_ar, example_en, created_at")
    .eq("set_id", setRow.id)
    .order("created_at", { ascending: true });

  if (cardError) {
    throw cardError;
  }

  const cards: Flashcard[] = (cardRows ?? []).map((row) => ({
    id: row.id,
    front: row.front_ar,
    meaning: row.back_en,
    exampleAr: row.example_ar,
    exampleEn: row.example_en,
    createdAt: row.created_at,
  }));

  const set: FlashcardSet = {
    id: setRow.id,
    title: setRow.title,
    description: setRow.description,
    cardCount: cards.length,
    coverSeed: setRow.cover_seed,
    createdAt: setRow.created_at,
  };

  return (
    <main className="h-dvh overflow-hidden bg-[var(--background-dark)] text-[var(--text-primary)]">
      <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 py-6">
        <FlashcardPlayer set={set} cards={cards} />
      </div>
    </main>
  );
}
