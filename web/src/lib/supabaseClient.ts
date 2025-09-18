import { createBrowserClient } from '@supabase/ssr';

// Using the new SSR package ensures your browser sign-in sets the HTTP cookies
// that server routes use for Row Level Security.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
