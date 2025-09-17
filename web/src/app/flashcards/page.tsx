import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import FlashcardsScreen from "@/components/flashcards/FlashcardsScreen";

export default async function FlashcardsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/flashcards");
  }

  return <FlashcardsScreen />;
}

