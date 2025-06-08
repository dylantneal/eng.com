import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (!q) return Response.json({ projects: [], users: [], questions: [] });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const fuzzy = `%${q}%`;

  const [projectsRes, usersRes, questionsRes] = await Promise.all([
    supabase.from('projects').select('id,title,thumb_path,owner_id').ilike('title', fuzzy).limit(5),
    supabase.from('profiles').select('id,handle,avatar_url').ilike('handle', fuzzy).limit(5),
    supabase.from('comments').select('id,body').eq('kind', 'question').ilike('body', fuzzy).limit(5),
  ]);

  return Response.json({
    projects:  projectsRes.data ?? [],
    users:     usersRes.data?.map(u => ({ ...u, username: u.handle })) ?? [],
    questions: questionsRes.data?.map(q => ({ id: q.id, title: q.body })) ?? [],
  });
} 