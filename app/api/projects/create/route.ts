import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ============================================================================
// ENGINEERING PROJECT CREATION API
// World-class project showcase for engineers
// ============================================================================

interface ProjectFile {
  name: string;
  size: number;
  type: string;
  path: string;
  category?: 'cad' | 'documentation' | 'image' | 'code' | 'simulation' | 'other';
}

interface CreateProjectRequest {
  title: string;
  description?: string;
  readme?: string;
  engineeringDiscipline?: string;
  projectType?: string;
  complexityLevel?: string;
  tags?: string[];
  technologies?: string[];
  materials?: string[];
  license?: string;
  isPublic: boolean;
  repositoryUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  files: File[];
}

// Engineering-specific file type validation
const ENGINEERING_FILE_TYPES = {
  // CAD Files
  cad: [
    'application/step', 'model/step', // STEP files
    'application/octet-stream', // STL files
    'model/stl',
    'application/acad', 'image/vnd.dwg', // DWG
    'application/dxf', 'image/vnd.dxf', // DXF
    'application/iges', // IGES
    'application/x-parasolid', // Parasolid
  ],
  
  // Documentation
  documentation: [
    'application/pdf',
    'text/markdown',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  
  // Images & Diagrams
  image: [
    'image/jpeg', 'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
  ],
  
  // Code & Scripts
  code: [
    'text/x-arduino',
    'text/x-c++src', 'text/x-c',
    'text/x-python',
    'text/javascript',
    'application/json',
    'text/x-matlab',
  ],
  
  // Simulation & Analysis
  simulation: [
    'application/x-ansys',
    'application/x-abaqus',
    'application/x-nastran',
    'text/csv', // Data files
  ],
  
  // Archives
  archive: [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-tar',
    'application/gzip',
  ]
};

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB per file
const MAX_TOTAL_SIZE = 2 * 1024 * 1024 * 1024; // 2GB total
const MAX_FILES = 20; // Increased for engineering projects

function categorizeFile(file: File): string {
  const fileType = file.type.toLowerCase();
  const extension = file.name.toLowerCase().split('.').pop() || '';
  
  // Check by MIME type first
  for (const [category, types] of Object.entries(ENGINEERING_FILE_TYPES)) {
    if (types.includes(fileType)) {
      return category;
    }
  }
  
  // Check by extension for files with generic MIME types
  const extensionMap: Record<string, string> = {
    // CAD extensions
    'stl': 'cad', 'step': 'cad', 'stp': 'cad', 'iges': 'cad', 'igs': 'cad',
    'dwg': 'cad', 'dxf': 'cad', 'x_t': 'cad', 'x_b': 'cad',
    
    // Documentation
    'pdf': 'documentation', 'md': 'documentation', 'txt': 'documentation',
    'doc': 'documentation', 'docx': 'documentation',
    
    // Images
    'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
    'svg': 'image', 'webp': 'image', 'tiff': 'image', 'tif': 'image',
    
    // Code
    'ino': 'code', 'cpp': 'code', 'c': 'code', 'h': 'code', 'hpp': 'code',
    'py': 'code', 'js': 'code', 'ts': 'code', 'm': 'code', 'json': 'code',
    
    // Simulation
    'inp': 'simulation', 'dat': 'simulation', 'csv': 'simulation',
    'xlsx': 'simulation', 'xls': 'simulation',
    
    // Archives
    'zip': 'archive', 'tar': 'archive', 'gz': 'archive', 'rar': 'archive'
  };
  
  return extensionMap[extension] || 'other';
}

function validateEngineeringFile(file: File): { valid: boolean; error?: string; category: string } {
  const category = categorizeFile(file);
  
  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds 500MB limit`,
      category
    };
  }
  
  // Engineering file validation
  const validCategories = ['cad', 'documentation', 'image', 'code', 'simulation', 'archive', 'other'];
  if (!validCategories.includes(category)) {
    return {
      valid: false,
      error: `File type not supported for engineering projects: ${file.name}`,
      category
    };
  }
  
  return { valid: true, category };
}

function generateEngineeringSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100) // Reasonable length
    + '-' + Date.now().toString(36); // Ensure uniqueness
}

async function uploadEngineeringFile(
  supabase: any,
  file: File,
  projectId: string,
  category: string,
  isPublic: boolean
): Promise<ProjectFile> {
  const bucketName = isPublic ? 'projects' : 'projects-private';
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${projectId}/${category}/${timestamp}/${sanitizedFileName}`;
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream'
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    return {
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      path: filePath,
      category: category as any
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting engineering project creation...');
    
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Authentication required');
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', session.user.id);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Parse form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const readme = formData.get('readme') as string;
    const engineeringDiscipline = formData.get('engineeringDiscipline') as string;
    const projectType = formData.get('projectType') as string || 'design';
    const complexityLevel = formData.get('complexityLevel') as string || 'intermediate';
    const isPublic = formData.get('public') === 'true';
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
    const technologies = formData.get('technologies') ? JSON.parse(formData.get('technologies') as string) : [];
    const materials = formData.get('materials') ? JSON.parse(formData.get('materials') as string) : [];
    const license = formData.get('license') as string || 'MIT';
    const repositoryUrl = formData.get('repositoryUrl') as string;
    const demoUrl = formData.get('demoUrl') as string;
    const videoUrl = formData.get('videoUrl') as string;
    
    const files = formData.getAll('files') as File[];

    console.log('📋 Project details:', {
      title,
      engineeringDiscipline,
      projectType,
      complexityLevel,
      fileCount: files.length,
      isPublic
    });

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Project title is required' }, 
        { status: 400 }
      );
    }

    if (title.length < 3 || title.length > 200) {
      return NextResponse.json(
        { error: 'Project title must be between 3 and 200 characters' }, 
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required for engineering projects' }, 
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` }, 
        { status: 400 }
      );
    }

    // Validate engineering files
    const fileValidations = files.map(file => validateEngineeringFile(file));
    const invalidFiles = fileValidations.filter(v => !v.valid);
    
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: invalidFiles[0].error }, 
        { status: 400 }
      );
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { error: 'Total file size exceeds 2GB limit' }, 
        { status: 400 }
      );
    }

    console.log('✅ All validations passed');

    // Generate unique slug
    const slug = generateEngineeringSlug(title);

    console.log('🔨 Creating project in database...');

    // Create project in database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        owner_id: session.user.id,
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        readme: readme?.trim() || `# ${title}\n\n${description || 'Engineering project documentation will be added here.'}`,
        engineering_discipline: engineeringDiscipline?.trim() || null,
        project_type: projectType,
        complexity_level: complexityLevel,
        tags: Array.isArray(tags) ? tags : [],
        technologies: Array.isArray(technologies) ? technologies : [],
        materials: Array.isArray(materials) ? materials : [],
        license: license.trim(),
        repository_url: repositoryUrl?.trim() || null,
        demo_url: demoUrl?.trim() || null,
        video_url: videoUrl?.trim() || null,
        is_public: isPublic,
        project_status: 'published',
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (projectError) {
      console.error('❌ Project creation error:', projectError);
      return NextResponse.json(
        { error: `Failed to create project: ${projectError.message}` }, 
        { status: 500 }
      );
    }

    console.log('✅ Project created in database:', project.id);

    // Upload engineering files
    const uploadedFiles: ProjectFile[] = [];
    
    console.log('📁 Uploading files...');
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = fileValidations[i];
        
        console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name} (${validation.category})`);
        
        const uploadedFile = await uploadEngineeringFile(
          supabase, 
          file, 
          project.id, 
          validation.category,
          isPublic
        );
        uploadedFiles.push(uploadedFile);
      }
      
      console.log('✅ All files uploaded successfully');
    } catch (uploadError) {
      console.error('❌ File upload error:', uploadError);
      
      // Clean up: delete the project if file upload fails
      await supabase.from('projects').delete().eq('id', project.id);
      
      return NextResponse.json(
        { error: uploadError instanceof Error ? uploadError.message : 'File upload failed' }, 
        { status: 500 }
      );
    }

    // Create initial version record
    console.log('📝 Creating project version...');
    
    const { data: version, error: versionError } = await supabase
      .from('project_versions')
      .insert({
        project_id: project.id,
        version_number: 'v1.0',
        version_name: 'Initial Release',
        readme_content: readme?.trim() || `# ${title}\n\nInitial version of this engineering project.`,
        files: uploadedFiles,
        total_file_size: totalSize,
        file_count: uploadedFiles.length
      })
      .select()
      .single();

    if (versionError) {
      console.error('⚠️ Version creation error:', versionError);
      // Don't fail the entire request - version is optional
    } else {
      console.log('✅ Project version created');
    }

    console.log('🎉 Engineering project created successfully!');

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
        engineeringDiscipline: project.engineering_discipline,
        projectType: project.project_type,
        complexityLevel: project.complexity_level,
        files: uploadedFiles.length,
        totalSize: totalSize,
        version: version?.version_number || 'v1.0'
      }
    });

  } catch (error) {
    console.error('💥 Project creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during project creation' }, 
      { status: 500 }
    );
  }
} 