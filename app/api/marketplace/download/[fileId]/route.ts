import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketplaceService } from '@/lib/marketplace-service';

// GET /api/marketplace/download/[fileId]
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId } = params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Download token is required' },
        { status: 400 }
      );
    }

    try {
      // Get client IP for tracking
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

      // Authorize download
      const downloadUrl = await marketplaceService.authorizeDownload(
        fileId,
        session.user.id,
        clientIp
      );

      if (!downloadUrl) {
        return NextResponse.json(
          { 
            error: 'Download not authorized. Check if you have purchased this item and have remaining downloads.',
            details: {
              possible_reasons: [
                'Item not purchased',
                'Download limit exceeded', 
                'Download expired',
                'Access revoked'
              ]
            }
          },
          { status: 403 }
        );
      }

      // Validate token (simplified - in production would use JWT or similar)
      try {
        const tokenData = Buffer.from(token, 'base64').toString('utf-8');
        const [tokenFileId, accessId, timestamp] = tokenData.split(':');

        if (tokenFileId !== fileId) {
          return NextResponse.json(
            { error: 'Invalid download token' },
            { status: 403 }
          );
        }

        // Check token age (5 minutes validity)
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > 5 * 60 * 1000) {
          return NextResponse.json(
            { error: 'Download token expired. Please generate a new download link.' },
            { status: 403 }
          );
        }

      } catch (tokenError) {
        return NextResponse.json(
          { error: 'Invalid download token format' },
          { status: 403 }
        );
      }

      // In production, this would redirect to a pre-signed S3 URL or stream the file
      // For now, return a success response with download info
      return NextResponse.json({
        success: true,
        data: {
          download_url: downloadUrl,
          expires_in: 300, // 5 minutes
          file_info: {
            filename: `file_${fileId}.step`,
            size_bytes: 2048576, // 2MB
            format: 'STEP',
            protected: true
          }
        },
        message: 'Download authorized. Use the provided URL to download the file.'
      });

    } catch (serviceError: any) {
      console.error('Download authorization error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Download authorization failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing download request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/download/[fileId] - Generate download token
export async function POST(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId } = params;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get client IP for tracking
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    try {
      // Check download authorization and generate secure URL
      const downloadUrl = await marketplaceService.authorizeDownload(
        fileId,
        session.user.id,
        clientIp
      );

      if (!downloadUrl) {
        return NextResponse.json(
          { 
            error: 'Download not authorized',
            details: {
              help: 'Make sure you have purchased this item and have remaining downloads'
            }
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          download_token: downloadUrl.split('token=')[1],
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          download_url: downloadUrl
        },
        message: 'Download token generated successfully'
      });

    } catch (serviceError: any) {
      console.error('Token generation error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Failed to generate download token' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error generating download token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 