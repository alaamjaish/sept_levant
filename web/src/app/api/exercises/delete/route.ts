import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

// Minimal delete endpoint: teachers can delete an exercise row
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data || data.length === 0) return NextResponse.json({ error: "Not found or not allowed" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

