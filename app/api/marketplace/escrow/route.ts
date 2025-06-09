import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketplaceService } from '@/lib/marketplace-service';

// POST /api/marketplace/escrow - Create escrow for purchase
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { purchase_id } = body;

    if (!purchase_id) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    try {
      const escrow = await marketplaceService.createEscrow(purchase_id);

      return NextResponse.json({
        success: true,
        data: {
          escrow_id: escrow.id,
          purchase_id: escrow.purchase_id,
          amount_cents: escrow.amount_cents,
          status: escrow.status,
          release_date: escrow.release_date,
          created_at: escrow.created_at
        },
        message: 'Escrow created successfully'
      });

    } catch (serviceError: any) {
      console.error('Escrow service error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Failed to create escrow' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/marketplace/escrow - Get user's escrow transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'buyer' or 'seller'

    // TODO: Implement real escrow fetching
    const mockEscrows = [
      {
        id: 'escrow_1',
        purchase_id: 'purchase_1',
        amount_cents: 75000, // $750
        status: 'holding',
        release_date: '2024-01-22T10:00:00Z',
        buyer_approved: false,
        seller_delivered: true,
        created_at: '2024-01-15T10:00:00Z',
        item_title: 'Professional PCB Design Service',
        counterparty: {
          handle: 'pcbexpert',
          role: 'seller'
        }
      },
      {
        id: 'escrow_2',
        purchase_id: 'purchase_2',
        amount_cents: 125000, // $1,250
        status: 'pending_release',
        release_date: '2024-01-20T14:30:00Z',
        buyer_approved: true,
        seller_delivered: true,
        created_at: '2024-01-13T14:30:00Z',
        item_title: 'Custom Drone Frame Design',
        counterparty: {
          handle: 'dronemaker',
          role: 'seller'
        }
      }
    ];

    const filteredEscrows = mockEscrows.filter(escrow => {
      if (status && escrow.status !== status) return false;
      if (role && escrow.counterparty.role !== role) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      data: {
        escrows: filteredEscrows,
        total: filteredEscrows.length
      }
    });

  } catch (error) {
    console.error('Error fetching escrows:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 