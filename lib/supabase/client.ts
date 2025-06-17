import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseDB as Database } from '@/types/database';        // generated later

export const supabaseBrowser = createPagesBrowserClient<Database>({
  options: { realtime: { params: { eventsPerSecond: 10 } } },
}); 