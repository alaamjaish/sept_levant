import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

interface PageProps {
  params: { setId: string };
}

export default async function FlashcardSetPage({ params }: PageProps) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const destination = `/flashcards?set=${encodeURIComponent(params.setId)}`;

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(destination)}`);
  }

  redirect(destination);
}
