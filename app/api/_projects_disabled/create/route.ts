import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const readme = formData.get('readme') as string;
    const isPublic = formData.get('public') === 'true';
    const files = formData.getAll('files') as File[];

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Create project slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Upload files to storage
    const filesDescriptor: any[] = [];
    for (const file of files) {
      const path = `${session.user.id}/${slug}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from(isPublic ? 'projects' : 'projects-private')
        .upload(path, file, { contentType: file.type });
      
      if (error) {
        console.error('Storage upload error:', error);
        return NextResponse.json({ error: 'Storage upload failed: ' + error.message }, { status: 500 });
      }
      
      filesDescriptor.push({
        name: file.name,
        path,
        size: file.size,
        mime: file.type,
      });
    }

    // Insert project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        owner_id: session.user.id,
        slug,
        title,
        description,
        is_public: isPublic,
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return NextResponse.json({ error: 'Failed to create project: ' + projectError.message }, { status: 500 });
    }

    // Insert version
    if (project) {
      const { error: versionError } = await supabase.from('versions').insert({
        project_id: project.id,
        files: filesDescriptor,
        readme_md: readme,
      });
      
      if (versionError) {
        console.error('Version creation error:', versionError);
        return NextResponse.json({ error: 'Failed to create version: ' + versionError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title
      }
    });

  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 