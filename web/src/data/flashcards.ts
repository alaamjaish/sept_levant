export type Flashcard = {
  front: string;
  meaning: string;
  exampleAr: string;
  exampleEn: string;
};

export type FlashcardSet = {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  image: string;
  lastReviewed: string;
  tags: string[];
};

export const flashcardSets: FlashcardSet[] = [
  {
    id: "greetings",
    title: "Greetings & Small Talk",
    description: "Friendly openers to help you start conversations politely.",
    cardCount: 3,
    image: "linear-gradient(135deg, rgba(13,166,242,0.65), rgba(26,44,56,0.85))",
    lastReviewed: "Reviewed 2 days ago",
    tags: ["Beginner", "Everyday"],
  },
  {
    id: "market",
    title: "Souk Essentials",
    description: "Useful phrases for navigating markets and bargaining with confidence.",
    cardCount: 3,
    image: "linear-gradient(135deg, rgba(26,44,56,0.9), rgba(13,166,242,0.5))",
    lastReviewed: "New set",
    tags: ["Shopping", "Practical"],
  },
  {
    id: "travel",
    title: "Travel Basics",
    description: "Key expressions for airports, hotels, and getting around town.",
    cardCount: 3,
    image: "linear-gradient(135deg, rgba(13,166,242,0.55), rgba(16,29,35,0.9))",
    lastReviewed: "Reviewed yesterday",
    tags: ["On the go"],
  },
  {
    id: "food",
    title: "Food & Dining",
    description: "Order, compliment, and chat about dishes like a local.",
    cardCount: 3,
    image: "linear-gradient(135deg, rgba(21,141,210,0.6), rgba(16,29,35,0.85))",
    lastReviewed: "Reviewed last week",
    tags: ["Culture", "Intermediate"],
  },
];

export const flashcardsBySetId: Record<string, Flashcard[]> = {
  greetings: [
    {
      front: "أهلاً وسهلاً",
      meaning: "Welcome",
      exampleAr: "أهلاً بك صديقي",
      exampleEn: "Welcome, my friend",
    },
    {
      front: "كيف حالك؟",
      meaning: "How are you?",
      exampleAr: "كيف حالك الآن؟",
      exampleEn: "How are you now",
    },
    {
      front: "تشرفنا",
      meaning: "Nice to meet you",
      exampleAr: "تشرفنا بلقائك",
      exampleEn: "Glad we met you",
    },
  ],
  market: [
    {
      front: "بكم هذا؟",
      meaning: "How much is this?",
      exampleAr: "بكم هذا المنتج؟",
      exampleEn: "How much is it",
    },
    {
      front: "هل يمكنك تخفيض السعر؟",
      meaning: "Can you lower the price?",
      exampleAr: "اخفض السعر قليلاً",
      exampleEn: "Lower the price",
    },
    {
      front: "سآخذ اثنين",
      meaning: "I will take two",
      exampleAr: "سآخذ اثنين منه",
      exampleEn: "I will take two",
    },
  ],
  travel: [
    {
      front: "أين محطة القطار؟",
      meaning: "Where is the train station?",
      exampleAr: "أين أقرب محطة؟",
      exampleEn: "Where is the station",
    },
    {
      front: "أحتاج إلى حجز غرفة",
      meaning: "I need to book a room",
      exampleAr: "أريد غرفة ليلتين",
      exampleEn: "Need a room tonight",
    },
    {
      front: "متى تقلع الرحلة؟",
      meaning: "When does the flight depart?",
      exampleAr: "متى تغادر الرحلة؟",
      exampleEn: "When does it depart",
    },
  ],
  food: [
    {
      front: "لذيذ جداً",
      meaning: "Very delicious",
      exampleAr: "الطعم لذيذ جداً",
      exampleEn: "This tastes amazing",
    },
    {
      front: "هل القائمة تحتوي على صور؟",
      meaning: "Does the menu have pictures?",
      exampleAr: "هل القائمة فيها صور؟",
      exampleEn: "Does menu have photos",
    },
    {
      front: "أنا نباتي",
      meaning: "I am vegetarian",
      exampleAr: "أنا نباتي تماماً",
      exampleEn: "I am vegetarian",
    },
  ],
};
