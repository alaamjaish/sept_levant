import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(_req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const userRes = await supabase.auth.getUser();
  const user = userRes.data.user;
  const ret: any = {
    signed_in: !!user,
    user_id: user?.id || null,
  };

  if (!user) return NextResponse.json(ret);

  // role check
  const { data: prof } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  ret.role = prof?.role ?? null;

  // storage upload probe
  try {
    const path = `audio/${user.id}/policy-check-${Date.now()}.txt`;
    const { error } = await supabase.storage
      .from("audio")
      .upload(path, new Blob(["ping"], { type: "text/plain" }), { upsert: false });
    ret.storage_upload_ok = !error;
    ret.storage_error = error?.message || null;
    if (!error) ret.storage_object = path;
  } catch (e: any) {
    ret.storage_upload_ok = false;
    ret.storage_error = e?.message || String(e);
  }

  return NextResponse.json(ret);
}

