import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('unauth', { status: 401 });

  const body = await req.json();           // { title, files: [{path,type}] }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase
    .from('projects')
    .insert({
      owner_id: session.user.id,
      title: body.title ?? 'Untitled project',
      files: body.files,
      readme: '# New project\n\nStart writing…',
      is_public: true,
      version: '0.1.0',
    })
    .select('id')
    .single();

  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ id: data.id });
} 