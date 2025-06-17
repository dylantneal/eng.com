import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface CreateVersionRequest {
  readme_md?: string;
  changelog?: string;
  files: File[];
  version_type?: 'major' | 'minor' | 'patch';
}

// GET - Fetch version history for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const session = await getServerSession(authOptions);
    const supabase = await createClient();
    const projectId = (await params).id;

    // Get project to check access permissions
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, is_public, owner_id, title')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = project.is_public || session?.user?.id === project.owner_id;
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch version history
    const { data: versions, error: versionsError } = await supabase
      .from('project_versions')
      .select(`
        id,
        version_no,
        readme_md,
        files,
        created_at
      `)
      .eq('project_id', projectId)
      .order('version_no', { ascending: false })
      .range(offset, offset + limit - 1);

    if (versionsError) {
      console.error('Error fetching versions:', versionsError);
      return NextResponse.json(
        { error: 'Failed to fetch version history' },
        { status: 500 }
      );
    }

    // Process versions to add file count and size information
    const processedVersions = versions.map(version => {
      const files = Array.isArray(version.files) ? version.files : [];
      const totalSize = files.reduce((sum: number, file: any) => sum + (file.size || 0), 0);
      
      return {
        id: version.id,
        version_no: version.version_no,
        readme_md: version.readme_md,
        file_count: files.length,
        total_size: totalSize,
        created_at: version.created_at,
        has_files: files.length > 0
      };
    });

    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title
      },
      versions: processedVersions,
      pagination: {
        limit,
        offset,
        total: versions.length
      }
    });

  } catch (error) {
    console.error('Version history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new version
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const projectId = (await params).id;

    // Check if user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, owner_id, title, is_public')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Only project owners can create new versions' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const readme_md = formData.get('readme_md') as string;
    const changelog = formData.get('changelog') as string;
    const files = formData.getAll('files') as File[];

    // Validation
    if (!changelog?.trim()) {
      return NextResponse.json(
        { error: 'Changelog is required for new versions' },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required for new versions' },
        { status: 400 }
      );
    }

    // Get the latest version number
    const { data: latestVersion, error: latestVersionError } = await supabase
      .from('project_versions')
      .select('version_no')
      .eq('project_id', projectId)
      .order('version_no', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNo = latestVersionError ? 1 : (latestVersion.version_no + 1);

    // Upload files to storage (similar to project creation)
    const uploadedFiles: Array<{
      name: string;
      size: number;
      type: string;
      path: string;
    }> = [];

    const bucketName = project.is_public ? 'projects' : 'projects-private';
    const timestamp = new Date().toISOString().split('T')[0];

    try {
      for (const file of files) {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${projectId}/v${nextVersionNo}/${timestamp}/${sanitizedFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || 'application/octet-stream'
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          path: filePath
        });
      }
    } catch (uploadError) {
      return NextResponse.json(
        { error: uploadError instanceof Error ? uploadError.message : 'File upload failed' },
        { status: 500 }
      );
    }

    // Create new version record
    const { data: newVersion, error: versionError } = await supabase
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_no: nextVersionNo,
        readme_md: readme_md?.trim() || '',
        files: uploadedFiles as any
      })
      .select()
      .single();

    if (versionError) {
      console.error('Version creation error:', versionError);
      
      // Clean up uploaded files if version creation fails
      for (const file of uploadedFiles) {
        try {
          await supabase.storage.from(bucketName).remove([file.path]);
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', file.path, cleanupError);
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create version' },
        { status: 500 }
      );
    }

    // Update project's current_version reference and updated_at
    await supabase
      .from('projects')
      .update({
        current_version: newVersion.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    return NextResponse.json({
      success: true,
      version: {
        id: newVersion.id,
        version_no: newVersion.version_no,
        file_count: uploadedFiles.length,
        created_at: newVersion.created_at
      }
    });

  } catch (error) {
    console.error('Create version API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 