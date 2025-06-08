import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseBrowser } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const readme = formData.get('readme') as string;
    const isPublic = formData.get('public') === 'true';
    
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const supabase = supabaseBrowser;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 8);

    // Handle file uploads
    const files = formData.getAll('files') as File[];
    const uploadedFiles: any[] = [];

    for (const file of files) {
      if (file.size > 0) {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${session.user.id}/${slug}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('projects')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) {
          console.error('File upload error:', uploadError);
          return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
        }

        uploadedFiles.push({
          name: file.name,
          path: filePath,
          size: file.size,
          type: file.type
        });
      }
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        slug,
        description,
        owner_id: session.user.id,
        is_public: isPublic,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // Create version with files and README
    if (project) {
      const { error: versionError } = await supabase
        .from('versions')
        .insert({
          project_id: project.id,
          files: uploadedFiles,
          readme_md: readme,
          created_at: new Date().toISOString()
        });

      if (versionError) {
        console.error('Version creation error:', versionError);
        // Don't fail the whole request, just log it
      }
    }

    return NextResponse.json({ 
      success: true, 
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