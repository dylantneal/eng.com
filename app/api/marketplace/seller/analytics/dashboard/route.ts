import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock comprehensive dashboard data showcasing all our advanced features
    const dashboardData = {
      overview: {
        total_revenue_cents: 1247300, // $12,473.00
        total_sales: 156,
        active_listings: 23,
        average_rating: 4.8,
        total_reviews: 87,
        conversion_rate: 12.4,
        refund_rate: 2.1
      },
      recent_activity: [
        {
          type: 'sale',
          item_title: 'Arduino Robot Chassis Design',
          amount_cents: 4998, // Commercial license
          buyer_handle: 'maker123',
          timestamp: '2024-01-20T10:30:00Z'
        },
        {
          type: 'review',
          item_title: 'PCB Design Masterclass',
          rating: 5,
          reviewer_handle: 'engstudent',
          timestamp: '2024-01-20T09:15:00Z'
        },
        {
          type: 'sale',
          item_title: 'Custom Enclosure Design Service',
          amount_cents: 75000, // High-value escrow transaction
          buyer_handle: 'robotbuilder',
          timestamp: '2024-01-19T16:45:00Z'
        },
        {
          type: 'payout',
          item_title: 'Quarterly Payout',
          amount_cents: 234500,
          timestamp: '2024-01-19T08:00:00Z'
        },
        {
          type: 'review',
          item_title: 'IoT Sensor Kit',
          rating: 4,
          reviewer_handle: 'iotdev',
          timestamp: '2024-01-18T14:20:00Z'
        }
      ],
      top_performing_items: [
        {
          id: '1',
          title: 'Arduino Robot Chassis Design',
          sales_count: 45,
          revenue_cents: 89775,
          rating: 4.8,
          conversion_rate: 15.2
        },
        {
          id: '2',
          title: 'PCB Design Masterclass',
          sales_count: 38,
          revenue_cents: 189620,
          rating: 4.9,
          conversion_rate: 18.7
        },
        {
          id: '3',
          title: 'IoT Sensor Kit',
          sales_count: 32,
          revenue_cents: 111968,
          rating: 4.6,
          conversion_rate: 11.3
        },
        {
          id: '4',
          title: 'Custom Enclosure Design Service',
          sales_count: 12,
          revenue_cents: 900000,
          rating: 4.7,
          conversion_rate: 25.0
        }
      ],
      revenue_trend: {
        period: 'last_30_days',
        data: [
          { date: '2024-01-01', revenue_cents: 15420, sales: 4 },
          { date: '2024-01-02', revenue_cents: 8750, sales: 2 },
          { date: '2024-01-03', revenue_cents: 23100, sales: 6 },
          { date: '2024-01-04', revenue_cents: 0, sales: 0 },
          { date: '2024-01-05', revenue_cents: 34500, sales: 8 },
          { date: '2024-01-06', revenue_cents: 12300, sales: 3 },
          { date: '2024-01-07', revenue_cents: 45600, sales: 11 },
          { date: '2024-01-08', revenue_cents: 78900, sales: 15 },
          { date: '2024-01-09', revenue_cents: 23400, sales: 5 },
          { date: '2024-01-10', revenue_cents: 56700, sales: 12 },
          { date: '2024-01-11', revenue_cents: 34200, sales: 7 },
          { date: '2024-01-12', revenue_cents: 67800, sales: 14 },
          { date: '2024-01-13', revenue_cents: 89100, sales: 18 },
          { date: '2024-01-14', revenue_cents: 45300, sales: 9 },
          { date: '2024-01-15', revenue_cents: 123400, sales: 24 },
          { date: '2024-01-16', revenue_cents: 78600, sales: 16 },
          { date: '2024-01-17', revenue_cents: 56200, sales: 11 },
          { date: '2024-01-18', revenue_cents: 234700, sales: 42 },
          { date: '2024-01-19', revenue_cents: 156800, sales: 28 },
          { date: '2024-01-20', revenue_cents: 89400, sales: 17 }
        ]
      },
      geographic_breakdown: [
        {
          country: 'United States',
          sales: 78,
          revenue_cents: 623400,
          percentage: 50.0
        },
        {
          country: 'Germany',
          sales: 23,
          revenue_cents: 187300,
          percentage: 14.7
        },
        {
          country: 'United Kingdom',
          sales: 19,
          revenue_cents: 156200,
          percentage: 12.2
        },
        {
          country: 'Canada',
          sales: 15,
          revenue_cents: 123400,
          percentage: 9.6
        },
        {
          country: 'Australia',
          sales: 12,
          revenue_cents: 98700,
          percentage: 7.7
        },
        {
          country: 'France',
          sales: 9,
          revenue_cents: 67800,
          percentage: 5.8
        }
      ],
      pending_payouts: {
        total_cents: 67800,
        next_payout_date: '2024-01-25T00:00:00Z',
        items: [
          {
            description: 'Sales from Jan 1-15, 2024',
            amount_cents: 45600,
            status: 'pending'
          },
          {
            description: 'Platform bonuses',
            amount_cents: 12200,
            status: 'pending'
          },
          {
            description: 'Referral commissions',
            amount_cents: 10000,
            status: 'pending'
          }
        ]
      },
      goals: {
        monthly_revenue_target_cents: 150000, // $1,500
        monthly_revenue_actual_cents: 124730,  // $1,247.30
        monthly_sales_target: 200,
        monthly_sales_actual: 156,
        progress_percentage: 83.2
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: dashboardData 
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
} 