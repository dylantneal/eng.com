import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/marketplace/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { item_id, rating, title, content, images } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user has purchased the item
    const { data: purchase, error: purchaseError } = await supabase
      .from('marketplace_purchases')
      .select('id')
      .eq('item_id', item_id)
      .eq('buyer_id', session.user.id)
      .eq('status', 'completed')
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ 
        error: 'You must purchase this item before leaving a review' 
      }, { status: 403 });
    }

    // Check if user has already reviewed this item
    const { data: existingReview } = await supabase
      .from('marketplace_reviews')
      .select('id')
      .eq('item_id', item_id)
      .eq('reviewer_id', session.user.id)
      .single();

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already reviewed this item' 
      }, { status: 400 });
    }

    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('marketplace_reviews')
      .insert([{
        item_id,
        reviewer_id: session.user.id,
        purchase_id: purchase.id,
        rating,
        title,
        content,
        images: images || [],
        verified_purchase: true,
        helpful_votes: 0
      }])
      .select(`
        *,
        reviewer:profiles!reviewer_id(
          id,
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      return NextResponse.json({ 
        error: 'Failed to create review',
        details: reviewError.message
      }, { status: 500 });
    }

    // Update item rating and review count
    const { data: allReviews } = await supabase
      .from('marketplace_reviews')
      .select('rating')
      .eq('item_id', item_id);

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await supabase
        .from('marketplace_items')
        .update({
          rating: avgRating,
          review_count: allReviews.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', item_id);
    }

    return NextResponse.json({
      success: true,
      data: review
    });

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
    const sortBy = searchParams.get('sort') || 'newest';
    const offset = (page - 1) * limit;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Build the query
    let query = supabase
      .from('marketplace_reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id(
          id,
          username,
          display_name,
          avatar_url
        ),
        purchase:marketplace_purchases!purchase_id(
          id,
          created_at
        )
      `, { count: 'exact' })
      .eq('item_id', itemId)
      .range(offset, offset + limit - 1);

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      case 'helpful':
        query = query.order('helpful_votes', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch reviews',
        details: error.message
      }, { status: 500 });
    }

    // Get item details for rating summary
    const { data: item } = await supabase
      .from('marketplace_items')
      .select('rating, review_count')
      .eq('id', itemId)
      .single();

    // Calculate rating distribution
    const { data: ratingDist } = await supabase
      .from('marketplace_reviews')
      .select('rating')
      .eq('item_id', itemId);

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    ratingDist?.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews: data || [],
        summary: {
          average_rating: item?.rating || 0,
          total_reviews: item?.review_count || 0,
          rating_distribution: ratingDistribution
        },
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
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

// PUT /api/marketplace/reviews - Mark a review as helpful
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('review_id');
    const action = searchParams.get('action'); // 'helpful' or 'unhelpful'

    if (!reviewId || !action) {
      return NextResponse.json(
        { error: 'Review ID and action are required' },
        { status: 400 }
      );
    }

    // For now, we'll just increment helpful votes
    // In a full implementation, you'd track who voted to prevent duplicates
    if (action === 'helpful') {
      const { data: review } = await supabase
        .from('marketplace_reviews')
        .select('helpful_votes')
        .eq('id', reviewId)
        .single();

      if (review) {
        await supabase
          .from('marketplace_reviews')
          .update({
            helpful_votes: review.helpful_votes + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewId);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 