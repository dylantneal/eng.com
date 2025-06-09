import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cadProcessor, CAD_FILE_FORMATS } from '@/lib/cad-processor';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Process the file
    const result = await cadProcessor.processFile(
      fileBuffer,
      file.name,
      file.type,
      session.user.id,
      projectId
    );

    return NextResponse.json({
      success: true,
      processingResult: result,
      supportedFormats: Object.keys(CAD_FILE_FORMATS),
    });

  } catch (error) {
    console.error('File processing error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to process file' 
    }, { status: 500 });
  }
}

// Get processing status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const fileId = url.searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    const status = await cadProcessor.getProcessingStatus(fileId);

    if (!status) {
      return NextResponse.json({ error: 'Processing result not found' }, { status: 404 });
    }

    return NextResponse.json({ status });

  } catch (error) {
    console.error('Error fetching processing status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 