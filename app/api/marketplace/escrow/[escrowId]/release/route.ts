import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketplaceService } from '@/lib/marketplace-service';

// POST /api/marketplace/escrow/[escrowId]/release
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
    const { user_role } = body; // 'buyer' or 'seller' or 'admin'

    try {
      // TODO: Verify user has permission to release this escrow
      // For now, allow release if user is authenticated

      await marketplaceService.releaseEscrow(escrowId);

      return NextResponse.json({
        success: true,
        message: 'Escrow released successfully. Funds transferred to seller.'
      });

    } catch (serviceError: any) {
      console.error('Escrow release service error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Failed to release escrow' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error releasing escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 