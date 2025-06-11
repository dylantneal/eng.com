import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseDB as Database } from '@/types/database';

// Allow passing in a pre-fetched cookie store (handy in Server Components that
// already called `cookies()`), otherwise retrieve it lazily.
export const createClient = (existingCookies?: any) => {
  const cookieStore: any = existingCookies ?? cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

// ---------------------------------------------------------------------------
// Compatibility exports
// ---------------------------------------------------------------------------

// Some parts of the codebase (and perhaps older articles) still import
// `createServerSupabaseClient` or `supabaseServer` from this module.  To avoid
// touching dozens of files right now we simply provide thin aliases that
// delegate to `createClient()` so that existing imports keep working without
// any behavioural change.

export const createServerSupabaseClient = createClient;
export const supabaseServer = createClient; 