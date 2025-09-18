import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function audioPathFromPublicUrl(url?: string | null): string | null {
  if (!url) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  const prefix = `${base.replace(/\/$/, "")}/storage/v1/object/public/audio/`;
  if (url.startsWith(prefix)) return url.substring(prefix.length);
  return null;
}

// Minimal delete endpoint: teachers can delete an exercise row
export async function DELETE(req: NextRequest) {
  const { id, deleteAudio } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check row is visible (read policy) to give clearer errors
  const exists = await supabase
    .from("exercises")
    .select("id, audio_url")
    .eq("id", id)
    .maybeSingle();
  if ((exists as any)?.error) {
    return NextResponse.json({ error: (exists as any).error.message }, { status: 400 });
  }
  if (!(exists as any)?.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data || data.length === 0)
    return NextResponse.json({ error: "Not allowed (RLS). Ensure delete_exercises_teachers policy exists and you are a teacher." }, { status: 403 });

  if (deleteAudio) {
    const url = (exists as any)?.data?.audio_url as string | undefined;
    const path = audioPathFromPublicUrl(url);
    if (path) {
      // Best-effort removal; ignore errors
      await supabase.storage.from("audio").remove([path]);
    }
  }
  return NextResponse.json({ ok: true });
}
