/**
 * Thin re-export so `import type { Database } from '@/types/database'`
 * works everywhere without duplicating the generated file.
 * (Feel free to replace this with the full generated contents
 *  if you'd rather keep a single file.)
 */
export type { Database as SupabaseDB } from './supabase';
