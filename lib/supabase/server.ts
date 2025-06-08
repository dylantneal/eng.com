import { cookies } from 'next/headers';
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'; // Can be removed
import type { SupabaseDB as Database } from '@/types/database';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/* ------------------------------------------------------------------
   generic helper for every RSC / Route Handler
-------------------------------------------------------------------*/
export async function createClient() {
  const cookieStore = await cookies();
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
}

/* 🔖  Back-compat alias – lets any legacy code that still calls
      `supabaseServer()` keep working. Remove later if you like.    */
export const supabaseServer = createClient;

/**
 * Thin wrapper so the rest of the code-base can just call
 * `createServerSupabaseClient<Database>()`
 */
export const createServerSupabaseClient = createClient; 