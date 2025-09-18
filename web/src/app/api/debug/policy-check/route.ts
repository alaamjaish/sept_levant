import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(_req: NextRequest) {
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

