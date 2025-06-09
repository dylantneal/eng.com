import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketplaceService } from '@/lib/marketplace-service';

// POST /api/marketplace/escrow/[escrowId]/dispute
export async function POST(
  request: NextRequest,
  { params }: { params: { escrowId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { escrowId } = params;

    if (!escrowId) {
      return NextResponse.json(
        { error: 'Escrow ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reason, description, evidence_urls } = body;

    // Validate required fields
    if (!reason || !description) {
      return NextResponse.json(
        { error: 'Dispute reason and description are required' },
        { status: 400 }
      );
    }

    if (description.length < 50) {
      return NextResponse.json(
        { error: 'Dispute description must be at least 50 characters' },
        { status: 400 }
      );
    }

    try {
      // TODO: Verify user has permission to dispute this escrow
      // For now, allow dispute if user is authenticated

      await marketplaceService.disputeEscrow(escrowId, reason);

      // TODO: Save additional dispute details (description, evidence)
      // This would be handled by a more comprehensive dispute system

      return NextResponse.json({
        success: true,
        message: 'Dispute filed successfully. Our team will review and contact you within 24 hours.',
        data: {
          dispute_id: `dispute_${Math.random().toString(36).substr(2, 9)}`,
          status: 'open',
          created_at: new Date().toISOString(),
          expected_resolution: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
        }
      });

    } catch (serviceError: any) {
      console.error('Escrow dispute service error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Failed to file dispute' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error filing dispute:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 