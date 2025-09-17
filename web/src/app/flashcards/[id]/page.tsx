import { notFound } from "next/navigation";
import { flashcardSets, flashcardsBySetId } from "@/data/flashcards";
import { FlashcardPlayer } from "./FlashcardPlayer";

type FlashcardSetPageProps = {
  params: {
    id: string;
  };
};

export default function FlashcardSetPage({ params }: FlashcardSetPageProps) {
  const set = flashcardSets.find((item) => item.id === params.id);

  if (!set) {
    notFound();
  }

  const cards = flashcardsBySetId[set.id] ?? [];

  return (
    <main className="h-dvh bg-[var(--background-dark)] text-[var(--text-primary)] overflow-hidden">
      <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 py-6">
        <FlashcardPlayer set={set} cards={cards} />
      </div>
    </main>
  );
}
