import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseDB as Database } from '@/types/database';        // generated later

export const supabaseBrowser = createBrowserSupabaseClient<Database>({
  options: { realtime: { params: { eventsPerSecond: 10 } } },
}); 