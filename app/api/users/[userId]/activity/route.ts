import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Fetch posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, created_at, upvotes')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // Fetch comments
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, content, created_at, upvotes')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Fetch votes
    const { data: votes, error: votesError } = await supabase
      .from('post_votes')
      .select('id, post_id, created_at, is_helpful')
      .eq('user_id', params.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (votesError) {
      console.error('Error fetching votes:', votesError);
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      );
    }

    // Fetch badges
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('id, badge_type, badge_name, earned_at')
      .eq('user_id', params.userId)
      .order('earned_at', { ascending: false })
      .limit(10);

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      );
    }

    // Combine and format activities
    const activities = [
      ...posts.map((post) => ({
        id: `post-${post.id}`,
        type: 'post' as const,
        title: post.title,
        description: 'Created a new post',
        created_at: post.created_at,
        aura_change: post.upvotes,
      })),
      ...comments.map((comment) => ({
        id: `comment-${comment.id}`,
        type: 'comment' as const,
        title: 'New comment',
        description: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
        created_at: comment.created_at,
        aura_change: comment.upvotes,
      })),
      ...votes.map((vote) => ({
        id: `vote-${vote.id}`,
        type: 'vote' as const,
        title: vote.is_helpful ? 'Marked as helpful' : 'Voted on post',
        description: 'Interacted with a post',
        created_at: vote.created_at,
      })),
      ...badges.map((badge) => ({
        id: `badge-${badge.id}`,
        type: 'badge' as const,
        title: `Earned ${badge.badge_name} badge`,
        description: 'Achieved a new milestone',
        created_at: badge.earned_at,
        badge_type: badge.badge_type,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 