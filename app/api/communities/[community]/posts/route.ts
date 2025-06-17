import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ community: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'hot';
    const postType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Build the query
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!user_id(id, username, display_name, avatar_url),
        community:communities!community_id(id, name, display_name, color),
        _count:comments(count)
      `, { count: 'exact' })
      .eq('communities.name', resolvedParams.community)
      .eq('is_removed', false)
      .range(offset, offset + limit - 1);

    if (postType && postType !== 'all') {
      query = query.eq('post_type', postType);
    }

    // Apply sorting
    switch (sort) {
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('vote_count', { ascending: false });
        break;
      case 'hot':
      default:
        // Hot algorithm: combination of votes and recency
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

    // Transform data to include comment count
    const transformedData = data?.map(post => ({
      ...post,
      comment_count: post._count?.[0]?.count || 0,
      _count: undefined
    })) || [];

    return NextResponse.json({
      posts: transformedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ community: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    const { 
      title, 
      content, 
      post_type, 
      tags, 
      attachments 
    } = body;

    // First, get the community ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('name', resolvedParams.community)
      .single();

    if (communityError || !community) {
      return NextResponse.json({ 
        error: 'Community not found' 
      }, { status: 404 });
    }

    // Create the post
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title,
        content,
        post_type: post_type || 'discussion',
        community_id: community.id,
        user_id: session.user.id,
        tags: tags || [],
        attachments: attachments || [],
        upvotes: 0,
        downvotes: 0,
        comment_count: 0,
        view_count: 0,
        is_pinned: false,
        is_locked: false,
        is_removed: false,
        is_solved: false
      }])
      .select(`
        *,
        author:profiles!user_id(id, username, display_name, avatar_url),
        community:communities!community_id(id, name, display_name, color)
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
      .eq('id', community.id)
      .single();
    
    await supabase
      .from('communities')
      .update({ 
        post_count: (currentCommunity?.post_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', community.id);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 