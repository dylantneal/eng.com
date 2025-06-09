import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketplaceService } from '@/lib/marketplace-service';

// POST /api/marketplace/seller/onboard
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      country, 
      business_type, 
      first_name, 
      last_name, 
      email, 
      company_name 
    } = body;

    // Validate required fields
    if (!email || !country || !business_type) {
      return NextResponse.json(
        { error: 'Email, country, and business type are required' },
        { status: 400 }
      );
    }

    if (business_type === 'individual' && (!first_name || !last_name)) {
      return NextResponse.json(
        { error: 'First name and last name required for individual accounts' },
        { status: 400 }
      );
    }

    if (business_type !== 'individual' && !company_name) {
      return NextResponse.json(
        { error: 'Company name required for business accounts' },
        { status: 400 }
      );
    }

    try {
      // Create Stripe Connect account
      const stripeAccount = await marketplaceService.createSellerAccount(
        session.user.id,
        {
          country,
          business_type,
          first_name,
          last_name,
          email,
          company_name
        }
      );

      // Generate onboarding link
      const onboardingUrl = await marketplaceService.createAccountOnboardingLink(
        session.user.id
      );

      return NextResponse.json({
        success: true,
        data: {
          account_id: stripeAccount.stripe_account_id,
          onboarding_url: onboardingUrl,
          verification_status: stripeAccount.verification_status
        },
        message: 'Seller account created successfully'
      });

    } catch (serviceError: any) {
      console.error('Marketplace service error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Failed to create seller account' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating seller account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/marketplace/seller/onboard - Get onboarding status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Get seller account from database
    // For now, return mock status
    const mockStatus = {
      has_account: false,
      verification_status: 'pending',
      charges_enabled: false,
      payouts_enabled: false,
      requirements: [
        {
          field: 'individual.first_name',
          type: 'currently_due',
          description: 'First name is required'
        },
        {
          field: 'individual.last_name', 
          type: 'currently_due',
          description: 'Last name is required'
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockStatus
    });

  } catch (error) {
    console.error('Error getting onboard status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 