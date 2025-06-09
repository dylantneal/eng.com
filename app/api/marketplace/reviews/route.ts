import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketplaceService } from '@/lib/marketplace-service';

// POST /api/marketplace/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      item_id, 
      purchase_id, 
      rating, 
      title, 
      content, 
      images 
    } = body;

    // Validate required fields
    if (!item_id || !purchase_id || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Item ID, purchase ID, rating, title, and content are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 20) {
      return NextResponse.json(
        { error: 'Review content must be at least 20 characters' },
        { status: 400 }
      );
    }

    if (title.length < 5) {
      return NextResponse.json(
        { error: 'Review title must be at least 5 characters' },
        { status: 400 }
      );
    }

    try {
      const review = await marketplaceService.createReview({
        item_id,
        purchase_id,
        reviewer_id: session.user.id,
        rating,
        title,
        content,
        images: images || []
      });

      return NextResponse.json({
        success: true,
        data: {
          review_id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          verified_purchase: review.verified_purchase,
          created_at: review.created_at
        },
        message: 'Review submitted successfully'
      });

    } catch (serviceError: any) {
      console.error('Review service error:', serviceError);
      return NextResponse.json(
        { error: serviceError.message || 'Failed to create review' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/marketplace/reviews - Get reviews for an item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sort') || 'newest'; // 'newest', 'oldest', 'rating_high', 'rating_low', 'helpful'

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // TODO: Implement real review fetching
    const mockReviews = [
      {
        id: 'review_1',
        item_id: itemId,
        reviewer: {
          handle: 'maker123',
          avatar_url: 'https://picsum.photos/seed/maker123/40/40',
          verified_purchaser: true
        },
        rating: 5,
        title: 'Excellent design, easy to print',
        content: 'This chassis design is fantastic! The documentation is clear, the tolerances are perfect, and it printed without any issues. Highly recommended for anyone building Arduino robots.',
        helpful_votes: 12,
        verified_purchase: true,
        images: ['https://picsum.photos/seed/review1/300/200'],
        created_at: '2024-01-10T14:30:00Z',
        seller_response: {
          content: 'Thank you for the great review! Glad the design worked well for your project.',
          created_at: '2024-01-11T09:15:00Z'
        }
      },
      {
        id: 'review_2',
        item_id: itemId,
        reviewer: {
          handle: 'robotbuilder',
          avatar_url: 'https://picsum.photos/seed/robotbuilder/40/40',
          verified_purchaser: true
        },
        rating: 4,
        title: 'Good design with minor assembly challenges',
        content: 'Overall a solid design. The main chassis parts fit perfectly, but I had some trouble with the motor mounts. The holes were slightly too small for my servos. Otherwise great work!',
        helpful_votes: 8,
        verified_purchase: true,
        images: [],
        created_at: '2024-01-08T11:20:00Z',
        seller_response: {
          content: 'Thanks for the feedback! I\'ve updated the design to include multiple motor mount sizes.',
          created_at: '2024-01-08T16:45:00Z'
        }
      },
      {
        id: 'review_3',
        item_id: itemId,
        reviewer: {
          handle: 'engstudent',
          avatar_url: 'https://picsum.photos/seed/engstudent/40/40',
          verified_purchaser: true
        },
        rating: 5,
        title: 'Perfect for learning robotics',
        content: 'Used this for my engineering class project. The design is well thought out and the assembly instructions are very detailed. Great learning experience!',
        helpful_votes: 15,
        verified_purchase: true,
        images: ['https://picsum.photos/seed/review3a/300/200', 'https://picsum.photos/seed/review3b/300/200'],
        created_at: '2024-01-05T16:10:00Z'
      }
    ];

    // Sort reviews
    const sortedReviews = [...mockReviews].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'rating_high':
          return b.rating - a.rating;
        case 'rating_low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful_votes - a.helpful_votes;
        default:
          return 0;
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedReviews = sortedReviews.slice(startIndex, startIndex + limit);

    // Calculate rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
      rating: star,
      count: mockReviews.filter(r => r.rating === star).length,
      percentage: Math.round((mockReviews.filter(r => r.rating === star).length / mockReviews.length) * 100)
    }));

    const averageRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;

    return NextResponse.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        pagination: {
          page,
          limit,
          total: mockReviews.length,
          pages: Math.ceil(mockReviews.length / limit)
        },
        summary: {
          total_reviews: mockReviews.length,
          average_rating: Math.round(averageRating * 10) / 10,
          rating_distribution: ratingDistribution
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 