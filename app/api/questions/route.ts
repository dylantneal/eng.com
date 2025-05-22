import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/questions?cursor=<uuid>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor')
  let q = supabase.from('questions_feed').select('*').order('created_at', { ascending: false }).limit(15)
  if (cursor) q = q.lt('id', cursor)
  const { data, error } = await q
  if (error) return new Response(error.message, { status: 500 })
  return Response.json({ items: data, nextCursor: data.at(-1)?.id ?? null })
}

// POST  { title, tags }
export async function POST(req: NextRequest) {
  const { title, tags, user_id } = await req.json()
  const { error, data } = await supabase.from('comments').insert({
    kind: 'question',
    body: title,
    tags,
    user_id,
  }).select('id').single()
  if (error) return new Response(error.message, { status: 500 })
  return Response.json({ id: data.id })
} 