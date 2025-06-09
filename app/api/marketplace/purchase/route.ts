import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketplaceService } from '@/lib/marketplace-service';

// POST /api/marketplace/purchase - Create a purchase
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { item_id, license_type } = body;

    // Validate required fields
    if (!item_id || !license_type) {
      return NextResponse.json(
        { error: 'Item ID and license type are required' },
        { status: 400 }
      );
    }

    try {
      // Create purchase record
      const purchase = await marketplaceService.createPurchase(
        item_id,
        session.user.id,
        license_type
      );

      // Process payment intent
      const processedPurchase = await marketplaceService.processPurchase(purchase.id);

      return NextResponse.json({
        success: true,
        data: {
          purchase_id: processedPurchase.id,
          payment_intent_id: processedPurchase.stripe_payment_intent_id,
          amount_cents: processedPurchase.total_cents,
          status: processedPurchase.status,
          license_key: processedPurchase.license_key
        },
        message: 'Purchase created successfully'
      });

    } catch (serviceError: any) {
      console.error('Purchase service error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Failed to create purchase' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/marketplace/purchase - Get user's purchases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: Implement real purchase fetching
    const mockPurchases = [
      {
        id: 'purchase_1',
        item_id: 'item_1',
        item_title: 'Arduino Robot Chassis Design',
        amount_cents: 1999,
        status: 'completed',
        license_type: 'personal',
        created_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T10:05:00Z'
      },
      {
        id: 'purchase_2',
        item_id: 'item_2',
        item_title: 'PCB Design Masterclass',
        amount_cents: 4999,
        status: 'in_escrow',
        license_type: 'commercial',
        created_at: '2024-01-14T14:30:00Z'
      }
    ];

    const filteredPurchases = status 
      ? mockPurchases.filter(p => p.status === status)
      : mockPurchases;

    return NextResponse.json({
      success: true,
      data: {
        purchases: filteredPurchases,
        pagination: {
          page,
          limit,
          total: filteredPurchases.length,
          pages: Math.ceil(filteredPurchases.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 