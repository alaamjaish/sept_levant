import { NextRequest, NextResponse } from "next/server";

function normalizeArabic(input: string) {
  return (input || "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0671]/g, "") // remove diacritics/harakat
    .replace(/[\u0610-\u061A\u06D6-\u06ED]/g, "") // more marks
    .replace(/[\p{P}\p{S}]/gu, " ") // punctuation/symbols
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  const { originalText, spokenText } = await req.json();
  const a = normalizeArabic(originalText);
  const b = normalizeArabic(spokenText);

  let score = 75;
  if (!a || !b) score = 0;
  else if (a === b) score = 100;
  else if (a.includes(b) || b.includes(a)) score = 90;

  return NextResponse.json({ score });
}

