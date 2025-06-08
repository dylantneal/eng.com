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
  const cursorTipsParam = searchParams.get('cursorTips');
  const pageSize = 12;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  /* ––––– build a query per requested filter ––––– */
  let query = supabase
    .from('projects')
    .select('*')
    .limit(pageSize);

  if (filter === 'top') {
    query = query.order('tips_cents', { ascending: false });
  }
  query = query.order('created_at', { ascending: false }).order('id', { ascending: false });

  if (cursor) {
    const [lastCursorCreatedAt, lastCursorId] = cursor.split('_');
    if (filter === 'top') {
      const lastCursorTips = parseFloat(cursorTipsParam || '0');
      query = query.or(
        [
          `tips_cents.lt.${lastCursorTips}`,
          `and(tips_cents.eq.${lastCursorTips},created_at.lt.${lastCursorCreatedAt})`,
          `and(tips_cents.eq.${lastCursorTips},created_at.eq.${lastCursorCreatedAt},id.lt.${lastCursorId})`,
        ].join(',')
      );
    } else {
      query = query.or(
        [
          `created_at.lt.${lastCursorCreatedAt}`,
          `and(created_at.eq.${lastCursorCreatedAt},id.lt.${lastCursorId})`,
        ].join(',')
      );
    }
  }

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

  let nextCursor = null;
  let nextCursorTips: number | null = null;
  if (data && data.length === pageSize) {
    const lastItem = data[data.length - 1];
    nextCursor = `${lastItem.created_at}_${lastItem.id}`;
    if (filter === 'top') {
      nextCursorTips = lastItem.tips_cents;
    }
  }

  return Response.json({
    items: data,
    nextCursor,
    nextCursorTips,
  });
} 