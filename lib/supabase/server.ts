import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

export const supabaseServer = () =>
  createServerSupabaseClient<Database>({ cookies }); 