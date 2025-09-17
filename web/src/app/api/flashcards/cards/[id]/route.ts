import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

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
