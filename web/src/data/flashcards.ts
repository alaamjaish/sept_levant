export type Flashcard = {
  id: string;
  front: string;
  meaning: string;
  exampleAr: string;
  exampleEn: string;
  createdAt: string;
};

export type FlashcardSet = {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  coverSeed: string | null;
  createdAt: string;
};
