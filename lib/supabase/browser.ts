import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

/** Client-side Supabase instance (runs only in the browser) */
export const createBrowserClient = () =>
  createPagesBrowserClient<Database>() 