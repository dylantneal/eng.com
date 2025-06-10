import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!    // service key so we can update any row
  )
  await supabase.rpc('increment', { row_id: resolvedParams.id, col: 'upvotes' })
  return Response.json({ ok: true })
} 