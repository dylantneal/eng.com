import { createClient } from '@supabase/supabase-js';
import type { SupabaseDB as Database } from '@/types/database';

// Factory to create a new Supabase admin client instance
export const createAdminClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

// Keep the original named export but change it to a factory function so
// existing code that expects to call `supabaseServerAdmin()` continues to work.
export const supabaseServerAdmin = () => createAdminClient(); 