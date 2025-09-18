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

export async function POST(req: NextRequest) {
  const { id } = await req.json();
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
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load current row to get audio_url and also validate visibility
  const { data: row, error: readErr } = await supabase
    .from("exercises")
    .select("id, audio_url")
    .eq("id", id)
    .maybeSingle();
  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 400 });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Try to remove the existing audio object if it maps to our public bucket
  const path = audioPathFromPublicUrl(row.audio_url);
  if (path) {
    // best-effort; ignore failures
    await supabase.storage.from("audio").remove([path]);
  }

  // Set audio_url to empty string (column is NOT NULL)
  const { data: updated, error: updErr } = await supabase
    .from("exercises")
    .update({ audio_url: "" })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });
  if (!updated) return NextResponse.json({ error: "Update blocked by RLS" }, { status: 403 });
  return NextResponse.json({ ok: true, exercise: updated });
}

