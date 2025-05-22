import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

/* ------------------------------------------------------------------
   NEW: generic "createClient" helper that all RSCs can call
-------------------------------------------------------------------*/
export const createClient = (
  cookieStore: ReturnType<typeof cookies> = cookies(), // when you pass cookies()
) =>
  createServerComponentClient<Database>({
    cookies: () => cookieStore, // adapter shape the helper expects
  });

/* 🔖  Back-compat alias – lets any legacy code that still calls
      `supabaseServer()` keep working. Remove later if you like.    */
export const supabaseServer = createClient;

/**
 * Thin wrapper so the rest of the code-base can just call
 * `createServerSupabaseClient<Database>()`
 */
export const createServerSupabaseClient = () =>
  createServerComponentClient<Database>({ cookies }); 