import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PostResult {
  id: string;
  title: string;
  community: { name: string } | null;
  author: { username: string } | null;
  score: number;
  created_at: string;
}

interface ProjectResult {
  id: string;
  title: string;
  author: { username: string } | null;
  view_count: number;
  created_at: string;
}

interface UserResult {
  id: string;
  username: string;
  reputation: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const type = searchParams.get('type') || 'all';

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const results = [];

    // Search posts
    if (type === 'all' || type === 'posts') {
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          community:communities(name),
          author:profiles(username),
          score,
          created_at
        `)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('score', { ascending: false })
        .limit(5);

      if (!postsError && posts) {
        results.push(
          ...posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            type: 'post' as const,
            community: post.community?.name,
            author: post.author?.username,
            score: post.score,
            created_at: post.created_at,
          }))
        );
      }
    }

    // Search projects
    if (type === 'all' || type === 'projects') {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          author:profiles(username),
          view_count,
          created_at
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('view_count', { ascending: false })
        .limit(5);

      if (!projectsError && projects) {
        results.push(
          ...projects.map((project: any) => ({
            id: project.id,
            title: project.title,
            type: 'project' as const,
            author: project.author?.username,
            score: project.view_count,
            created_at: project.created_at,
          }))
        );
      }
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          reputation,
          created_at
        `)
        .or(`username.ilike.%${query}%,bio.ilike.%${query}%`)
        .order('reputation', { ascending: false })
        .limit(5);

      if (!usersError && users) {
        results.push(
          ...users.map((user: any) => ({
            id: user.id,
            title: user.username,
            type: 'user' as const,
            author: user.username,
            score: user.reputation,
            created_at: user.created_at,
          }))
        );
      }
    }

    // Sort all results by score
    results.sort((a, b) => (b.score || 0) - (a.score || 0));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 