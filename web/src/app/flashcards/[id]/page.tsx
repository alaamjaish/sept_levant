import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Flashcard, FlashcardSet } from "@/data/flashcards";
import { FlashcardPlayer } from "./FlashcardPlayer";

type FlashcardSetPageProps = {
  params: {
    id: string;
  };
};

export default async function FlashcardSetPage({ params }: FlashcardSetPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { data: setRow, error: setError } = await supabase
    .from("flashcard_sets")
    .select("id,title,description,cover_seed,created_at")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
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
