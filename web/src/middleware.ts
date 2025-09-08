import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // This will refresh the Supabase session and set the auth cookies
  // so that server routes (RLS) can see the authenticated user.
  try {
    const supabase = createMiddlewareClient({ req, res });
    await supabase.auth.getSession();
  } catch {}
  return res;
}

// Run on all app routes except Next.js internals and static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|images|robots.txt|sitemap.xml).*)",
  ],
};

