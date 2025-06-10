import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    let query = supabase
      .from('project_feed')
      .select('*, author:profiles(id, display_name, username, avatar_url)');

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    query = query.order('created_at', { ascending: false });

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Ensure author object is always present
    const projectsWithAuthors = (projects || []).map((project: any) => ({
      ...project,
      author: project.author || {
        id: project.author_id,
        display_name: 'Unknown Author',
        username: '',
        avatar_url: '',
      },
    }));
    return NextResponse.json(projectsWithAuthors);
  } catch (error) {
    console.error('Error in projects API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 