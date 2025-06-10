import { createClient } from '@supabase/supabase-js';
import type { SupabaseDB as Database } from '@/types/database';

export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Export with the expected name for backward compatibility
export const supabaseServerAdmin = createAdminClient(); 