import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketplaceService } from '@/lib/marketplace-service';

// GET /api/marketplace/seller/analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'day', 'week', 'month', 'year'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Validate period
    const validPeriods = ['day', 'week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Must be one of: day, week, month, year' },
        { status: 400 }
      );
    }

    try {
      // TODO: Check if user is a verified seller
      // For now, allow any authenticated user

      const analytics = await marketplaceService.getSellerAnalytics(
        session.user.id,
        period
      );

      return NextResponse.json({
        success: true,
        data: analytics
      });

    } catch (serviceError: any) {
      console.error('Analytics service error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Failed to fetch analytics' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/marketplace/seller/analytics/dashboard - Get dashboard summary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enhanced dashboard data with more metrics
    const dashboardData = {
      overview: {
        total_revenue_cents: 245000, // $2,450
        total_sales: 47,
        active_listings: 8,
        average_rating: 4.8,
        total_reviews: 156,
        conversion_rate: 2.1,
        refund_rate: 0.8
      },
      recent_activity: [
        {
          type: 'sale',
          item_title: 'Arduino Robot Chassis Design',
          amount_cents: 1999,
          buyer_handle: 'maker123',
          timestamp: '2024-01-15T14:30:00Z'
        },
        {
          type: 'review',
          item_title: 'PCB Design Masterclass',
          rating: 5,
          reviewer_handle: 'engstudent',
          timestamp: '2024-01-15T12:15:00Z'
        },
        {
          type: 'sale',
          item_title: 'IoT Sensor Kit',
          amount_cents: 3499,
          buyer_handle: 'robotbuilder',
          timestamp: '2024-01-15T09:45:00Z'
        }
      ],
      top_performing_items: [
        {
          id: 'item_1',
          title: 'Arduino Robot Chassis Design',
          sales_count: 25,
          revenue_cents: 49975,
          rating: 4.9,
          conversion_rate: 3.2
        },
        {
          id: 'item_2',
          title: 'PCB Design Masterclass',
          sales_count: 18,
          revenue_cents: 89982,
          rating: 4.8,
          conversion_rate: 2.1
        },
        {
          id: 'item_3',
          title: 'IoT Sensor Kit',
          sales_count: 15,
          revenue_cents: 52485,
          rating: 4.7,
          conversion_rate: 1.8
        }
      ],
      revenue_trend: {
        period: 'month',
        data: [
          { date: '2024-01-01', revenue_cents: 15000, sales: 8 },
          { date: '2024-01-02', revenue_cents: 8500, sales: 4 },
          { date: '2024-01-03', revenue_cents: 12000, sales: 6 },
          { date: '2024-01-04', revenue_cents: 0, sales: 0 },
          { date: '2024-01-05', revenue_cents: 25000, sales: 12 },
          { date: '2024-01-06', revenue_cents: 18500, sales: 9 },
          { date: '2024-01-07', revenue_cents: 7200, sales: 3 }
        ]
      },
      geographic_breakdown: [
        { country: 'United States', sales: 28, revenue_cents: 147000, percentage: 60 },
        { country: 'Canada', sales: 8, revenue_cents: 42000, percentage: 17 },
        { country: 'United Kingdom', sales: 6, revenue_cents: 31500, percentage: 13 },
        { country: 'Germany', sales: 3, revenue_cents: 15750, percentage: 6 },
        { country: 'Australia', sales: 2, revenue_cents: 8750, percentage: 4 }
      ],
      pending_payouts: {
        total_cents: 156000, // $1,560
        next_payout_date: '2024-01-22T00:00:00Z',
        items: [
          {
            description: 'Sales from Jan 1-7',
            amount_cents: 89000,
            status: 'pending'
          },
          {
            description: 'Sales from Jan 8-14',
            amount_cents: 67000,
            status: 'processing'
          }
        ]
      },
      goals: {
        monthly_revenue_target_cents: 300000, // $3,000
        monthly_revenue_actual_cents: 245000, // $2,450
        monthly_sales_target: 60,
        monthly_sales_actual: 47,
        progress_percentage: 82
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 