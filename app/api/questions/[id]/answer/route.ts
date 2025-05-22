import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { body, user_id } = await req.json()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { error } = await supabase.from('comments').insert({
    kind: 'answer',
    question_id: params.id,
    body,
    user_id,
  })
  if (error) return new Response(error.message, { status: 500 })
  return Response.json({ ok: true })
} 