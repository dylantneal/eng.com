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

  const { data: project, error: insertError } = await supabase
    .from('projects')
    .insert({
      owner_id: session.user.id,
      title: body.title ?? 'Untitled project',
      slug: body.slug,
      is_public: body.is_public ?? true,
    })
    .select('id')
    .single();

  if (insertError || !project) {
    return new Response(insertError?.message ?? 'Could not create project', { status: 500 });
  }

  const { error: versionError } = await supabase
    .from('project_versions')
    .insert({
      project_id: project.id,
      readme_md: body.readme ?? '# New project\n\nStart writing…',
      files: body.files ?? [],
    });

  if (versionError) {
    return new Response(versionError.message, { status: 500 });
  }

  return Response.json({ id: project.id });
} 