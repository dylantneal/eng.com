import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/gallery?filter=newest|top&cursor=abc
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
  const filter = searchParams.get('filter') ?? 'newest';
  const cursor = searchParams.get('cursor') ?? null;
  const cursorTipsParam = searchParams.get('cursorTips');
  const pageSize = 12;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  /* ––––– build a query for public projects ––––– */
  let query = supabase
    .from('projects')
    .select('*')
    .eq('is_public', true)  // Only show public projects
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