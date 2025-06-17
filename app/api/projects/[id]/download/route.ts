import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface DownloadRequest {
  filename?: string;
  version?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const version = searchParams.get('version') ? parseInt(searchParams.get('version')!) : null;
    
    const session = await getServerSession(authOptions);
    const supabase = await createClient();
    
    const projectId = (await params).id;

    // Get project details to check access permissions
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        slug,
        title,
        is_public,
        owner_id,
        download_count
      `)
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
        { error: 'Access denied. This is a private project.' },
        { status: 403 }
      );
    }

    // Get the specified version or latest version
    let versionQuery = supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', projectId);

    if (version) {
      versionQuery = versionQuery.eq('version_no', version);
    } else {
      versionQuery = versionQuery.order('created_at', { ascending: false }).limit(1);
    }

    const { data: projectVersion, error: versionError } = await versionQuery.single();

    if (versionError || !projectVersion) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    // Parse files from the version and cast to proper type
    const files = Array.isArray(projectVersion.files) ? projectVersion.files as Array<{
      name: string;
      size: number;
      type: string;
      path: string;
    }> : [];
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files found in this version' },
        { status: 404 }
      );
    }

    // If filename is specified, find that specific file
    let targetFile = null;
    if (filename) {
      targetFile = files.find(file => file.name === filename);
      if (!targetFile) {
        return NextResponse.json(
          { error: 'File not found in this version' },
          { status: 404 }
        );
      }
    } else {
      // If no filename specified, return the file list
      return NextResponse.json({
        project: {
          id: project.id,
          slug: project.slug,
          title: project.title
        },
        version: projectVersion.version_no,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          downloadUrl: `/api/projects/${projectId}/download?filename=${encodeURIComponent(file.name)}&version=${projectVersion.version_no}`
        }))
      });
    }

    // Generate download URL from Supabase Storage
    const bucketName = project.is_public ? 'projects' : 'projects-private';
    const filePath = targetFile.path;

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path not found' },
        { status: 404 }
      );
    }

    try {
      // Get signed URL for download (valid for 1 hour)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600, {
          download: true
        });

      if (urlError || !signedUrlData?.signedUrl) {
        console.error('Storage URL generation error:', urlError);
        return NextResponse.json(
          { error: 'Failed to generate download link' },
          { status: 500 }
        );
      }

      // Update download count (don't fail the request if this fails)
      try {
        await supabase
          .from('projects')
          .update({ 
            download_count: (project.download_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId);
      } catch (downloadCountError) {
        console.error('Failed to update download count:', downloadCountError);
      }

      // Return download information
      return NextResponse.json({
        downloadUrl: signedUrlData.signedUrl,
        filename: targetFile.name,
        size: targetFile.size,
        type: targetFile.type,
        version: projectVersion.version_no,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour from now
      });

    } catch (storageError) {
      console.error('Storage error:', storageError);
      return NextResponse.json(
        { error: 'Storage access failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle download tracking for public access
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { filename, version } = await request.json();
    
    // For now, just return success
    // Future: Add download analytics tracking when download_logs table is created
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Download tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track download' },
      { status: 500 }
    );
  }
} 