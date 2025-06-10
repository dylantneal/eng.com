import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  ctx: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { id: slug } = await ctx.params;

    // Fetch project details with author join
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`*, author:profiles(id, display_name, username, avatar_url)`) // join profiles as author
      .eq('slug', slug)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }

    if (!project) {
      // DEV ONLY: fallback mock project for demo if DB is empty
      const mockProject = {
        id: 'mock-id',
        slug,
        title: 'Demo Project: ' + slug.replace(/-/g, ' '),
        description: 'This is a mock project for demo purposes. Replace with real data.',
        author_id: 'mock-author',
        author: {
          id: 'mock-author',
          display_name: 'Demo Author',
          username: 'demoauthor',
          avatar_url: '/placeholder-project.jpg',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['demo', 'hardware', 'engineering'],
        discipline: 'Mechanical',
        visibility: 'Public',
        version_count: 1,
        forked_from: null,
        view_count: 0,
        files: [
          {
            id: 'file-1',
            name: 'main-assembly.step',
            type: 'cad',
            size: 1048576,
            url: '/files/main-assembly.step',
            created_at: new Date().toISOString(),
          },
        ],
      };
      return NextResponse.json(mockProject);
    }

    // Increment view count
    const { error: updateError } = await supabase
      .from('projects')
      .update({ view_count: project.view_count + 1 })
      .eq('slug', slug);

    if (updateError) {
      console.error('Error updating view count:', updateError);
    }

    // Mock files array for MVP
    const mockFiles = [
      {
        id: 'file-1',
        name: 'main-assembly.step',
        type: 'cad',
        size: 1048576,
        url: '/files/main-assembly.step',
        created_at: project.created_at,
      },
      {
        id: 'file-2',
        name: 'readme.md',
        type: 'doc',
        size: 2048,
        url: '/files/readme.md',
        created_at: project.created_at,
      },
      {
        id: 'file-3',
        name: 'schematic.kicad_sch',
        type: 'pcb',
        size: 40960,
        url: '/files/schematic.kicad_sch',
        created_at: project.created_at,
      },
    ];

    // Add meta fields for UI consistency and ensure author object is always present
    const projectWithMeta = {
      ...project,
      author: project.author || {
        id: project.author_id,
        display_name: 'Unknown Author',
        username: '',
        avatar_url: '',
      },
      visibility: project.visibility || 'Public',
      version_count: project.version_count ?? 1,
      forked_from: project.forked_from || null,
      files: project.files || mockFiles,
    };
    return NextResponse.json(projectWithMeta);
  } catch (error) {
    console.error('Error in project API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 