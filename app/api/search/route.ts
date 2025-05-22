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

  const [projects, users, questions] = await Promise.all([
    supabase.from('projects').select('id,title,thumb,owner_id').ilike('title', fuzzy).limit(5),
    supabase.from('users').select('id,username,avatar_url').ilike('username', fuzzy).limit(5),
    supabase.from('questions').select('id,title').ilike('title', fuzzy).limit(5),
  ]);

  return Response.json({
    projects:  projects.data ?? [],
    users:     users.data    ?? [],
    questions: questions.data?? [],
  });
} 