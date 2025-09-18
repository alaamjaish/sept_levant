import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  if (!resolvedParams.id) {
    return NextResponse.json({ error: "missing_card_id" }, { status: 422 });
  }

  const { data: cardRow, error: cardError } = await supabase
    .from("flashcards")
    .select("id")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (cardError) {
    return NextResponse.json({ error: "card_lookup_failed" }, { status: 500 });
  }

  if (!cardRow) {
    return NextResponse.json({ error: "card_not_found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("flashcards")
    .delete({ count: "exact" })
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
