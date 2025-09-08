import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Using auth-helpers ensures your browser sign-in sets the HTTP cookies
// that server routes use for Row Level Security.
export const supabase = createClientComponentClient();
