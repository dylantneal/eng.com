import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauth' }, { status: 401 });

  const { followeeId } = await req.json();
  if (!followeeId) return NextResponse.json({ error: 'followeeId required' }, { status: 400 });

  const supabase = supabaseServerAdmin();

  /* does it already exist? */
  const { data: row } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', session.user.id)
    .eq('followee_id', followeeId)
    .single();

  if (row) {
    await supabase.from('follows').delete().eq('id', row.id);
    return NextResponse.json({ following: false });
  } else {
    await supabase
      .from('follows')
      .insert({ follower_id: session.user.id, followee_id: followeeId });
    return NextResponse.json({ following: true });
  }
} 