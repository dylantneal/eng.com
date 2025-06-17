import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const community = searchParams.get('community');
    const sort = searchParams.get('sort') || 'hot';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Get the current user's session for personalization
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Build the base query
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!user_id(
          id, 
          username, 
          display_name, 
          avatar_url,
          engineering_discipline
        ),
        community:communities!community_id(
          id,
          name, 
          display_name, 
          color,
          category
        ),
        user_vote:post_votes!left(vote_type),
        _comment_count:comments(count)
      `, { count: 'exact' })
      .eq('is_removed', false)
      .range(offset, offset + limit - 1);

    // Filter by community if specified
    if (community) {
      query = query.eq('community_id', community);
    }

    // Add user vote filter if authenticated
    if (userId) {
      query = query.eq('post_votes.user_id', userId);
    }

    // Apply sorting
    switch (sort) {
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('vote_count', { ascending: false });
        break;
      case 'personalized':
        // For personalized feed, we'll order by vote count and recency
        // In a real implementation, you'd have a recommendation algorithm
        query = query
          .order('vote_count', { ascending: false })
          .order('created_at', { ascending: false });
        break;
      case 'hot':
      default:
        // Hot algorithm: combination of votes and recency
        // You might want to add a computed hot_score column for better performance
        query = query
          .order('vote_count', { ascending: false })
          .order('created_at', { ascending: false });
        break;
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch posts',
        details: error.message
      }, { status: 500 });
    }

    // Transform the data to include comment count and user vote
    const transformedPosts = data?.map(post => ({
      ...post,
      comment_count: post._comment_count?.[0]?.count || 0,
      user_vote: post.user_vote?.[0]?.vote_type || null,
      _comment_count: undefined,
      post_votes: undefined
    })) || [];

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, community_id, post_type, tags, images } = body;

    // Validate community exists
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('id', community_id)
      .single();

    if (communityError || !community) {
      return NextResponse.json({ error: 'Invalid community' }, { status: 400 });
    }

    // Create the post
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title,
        content,
        community_id,
        user_id: session.user.id,
        post_type: post_type || 'discussion',
        tags: tags || [],
        images: images || [],
        upvotes: 0,
        downvotes: 0,
        comment_count: 0,
        view_count: 0
      }])
      .select(`
        *,
        author:profiles!user_id(
          id, 
          username, 
          display_name, 
          avatar_url
        ),
        community:communities!community_id(
          id,
          name, 
          display_name, 
          color
        )
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ 
        error: 'Failed to create post',
        details: error.message
      }, { status: 500 });
    }

    // Update community post count
    const { data: currentCommunity } = await supabase
      .from('communities')
      .select('post_count')
      .eq('id', community_id)
      .single();
    
    await supabase
      .from('communities')
      .update({ 
        post_count: (currentCommunity?.post_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', community_id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 