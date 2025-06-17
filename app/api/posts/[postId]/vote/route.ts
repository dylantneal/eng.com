import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vote_type } = body; // 'up' or 'down'
    const user_id = session.user.id;
    const post_id = params.postId;

    if (!vote_type || !['up', 'down'].includes(vote_type)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Check if user has already voted on this post
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('user_id', user_id)
      .eq('post_id', post_id)
      .single();

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.error('Error checking existing vote:', voteCheckError);
      return NextResponse.json({ error: 'Failed to check vote' }, { status: 500 });
    }

    let operation = '';
    const voteValue = vote_type === 'up' ? 'upvote' : 'downvote';

    if (existingVote) {
      if (existingVote.vote_type === voteValue) {
        // Remove vote if clicking the same vote type
        const { error: deleteError } = await supabase
          .from('post_votes')
          .delete()
          .eq('user_id', user_id)
          .eq('post_id', post_id);

        if (deleteError) {
          console.error('Error deleting vote:', deleteError);
          return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
        }
        operation = 'removed';
      } else {
        // Update vote if changing vote type
        const { error: updateError } = await supabase
          .from('post_votes')
          .update({ vote_type: voteValue })
          .eq('user_id', user_id)
          .eq('post_id', post_id);

        if (updateError) {
          console.error('Error updating vote:', updateError);
          return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
        }
        operation = 'changed';
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from('post_votes')
        .insert({ 
          user_id, 
          post_id, 
          vote_type: voteValue 
        });

      if (insertError) {
        console.error('Error creating vote:', insertError);
        return NextResponse.json({ error: 'Failed to create vote' }, { status: 500 });
      }
      operation = 'created';
    }

    // Recalculate post vote counts
    const { data: upvotes } = await supabase
      .from('post_votes')
      .select('id', { count: 'exact' })
      .eq('post_id', post_id)
      .eq('vote_type', 'upvote');

    const { data: downvotes } = await supabase
      .from('post_votes')
      .select('id', { count: 'exact' })
      .eq('post_id', post_id)
      .eq('vote_type', 'downvote');

    const upvoteCount = upvotes?.length || 0;
    const downvoteCount = downvotes?.length || 0;

    // Update post vote counts
    const { error: updatePostError } = await supabase
      .from('posts')
      .update({ 
        upvotes: upvoteCount,
        downvotes: downvoteCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', post_id);

    if (updatePostError) {
      console.error('Error updating post counts:', updatePostError);
    }

    // Get the updated post
    const { data: updatedPost, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!user_id(id, username, display_name, avatar_url),
        community:communities!community_id(id, name, display_name, color)
      `)
      .eq('id', post_id)
      .single();

    if (postError) {
      console.error('Error fetching updated post:', postError);
      return NextResponse.json({ error: 'Failed to fetch updated post' }, { status: 500 });
    }

    // Update user karma
    if (updatedPost?.user_id && updatedPost.user_id !== user_id) {
      const karmaChange = operation === 'created' 
        ? (vote_type === 'up' ? 1 : -1)
        : operation === 'removed'
        ? (vote_type === 'up' ? -1 : 1)
        : (vote_type === 'up' ? 2 : -2); // Changed vote

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('post_karma')
        .eq('id', updatedPost.user_id)
        .single();

      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({ 
            post_karma: (currentProfile.post_karma || 0) + karmaChange,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedPost.user_id);
      }
    }

    return NextResponse.json({ 
      post: updatedPost, 
      operation,
      message: `Vote ${operation} successfully` 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 