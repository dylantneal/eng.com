import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/home-feed?filter=newest|top|bookmarks&cursor=abc
 *
 * Returned shape:
 * {
 *   items: Project[],
 *   nextCursor: string | null
 * }
 */
export const revalidate = 30;          // ISR – regenerate JSON every 30 s

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') ?? 'following';
  const cursor = searchParams.get('cursor') ?? null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  /* ––––– build a query per requested filter ––––– */
  let query = supabase
    .from('projects')
    .select('*')
    .limit(12)
    .order('created_at', { ascending: false });

  if (filter === 'top')      query = query.order('tips', { ascending: false });

  if (cursor) query = query.gt('id', cursor);  // naïve cursor by id

  /* ——— bookmarks ——— */
  if (filter === 'bookmarks') {
    const userId = searchParams.get('uid');
    const { data: rows, error } = await supabase
      .from('bookmarks')
      .select('project_id')
      .eq('user_id', userId);
    if (error) return new Response(error.message, { status: 500 });

    const ids = rows?.map((r) => r.project_id) ?? [];
    if (!ids.length) return Response.json({ items: [], nextCursor: null });
    query = query.in('id', ids);
  }

  /* ——— following ——— */
  if (filter === 'following') {
    const userId = searchParams.get('uid');
    const { data: rows, error } = await supabase
      .from('follows')
      .select('followee_id')
      .eq('follower_id', userId);
    if (error) return new Response(error.message, { status: 500 });

    const followIds = rows?.map((r) => r.followee_id) ?? [];
    if (!followIds.length) return Response.json({ items: [], nextCursor: null });
    query = query.in('owner_id', followIds);
  }

  const { data, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const last = data.at(-1);
  return Response.json({
    items: data,
    nextCursor: last ? last.id : null,
  });
} 