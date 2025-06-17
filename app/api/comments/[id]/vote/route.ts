import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VoteRequest {
  action: 'upvote' | 'downvote' | 'remove';
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const commentId = params.id;
    const { action }: VoteRequest = await request.json();

    // Validate action
    if (!['upvote', 'downvote', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "upvote", "downvote", or "remove"' },
        { status: 400 }
      );
    }

    // Check if comment exists
    const { data: comment, error: commentError } = await supabase
      .from('post_comments')
      .select('id, author_id, upvotes, downvotes')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Prevent self-voting
    if (comment.author_id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot vote on your own comment' },
        { status: 400 }
      );
    }

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('id, vote_type')
      .eq('comment_id', commentId)
      .eq('user_id', session.user.id)
      .single();

    if (action === 'remove') {
      if (!existingVote) {
        return NextResponse.json(
          { error: 'No vote to remove' },
          { status: 400 }
        );
      }

      // Remove vote
      const { error: removeError } = await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', session.user.id);

      if (removeError) {
        console.error('Error removing vote:', removeError);
        return NextResponse.json(
          { error: 'Failed to remove vote' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'remove',
        message: 'Vote removed successfully'
      });

    } else {
      // Handle upvote or downvote
      const voteType = action;

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Same vote type - remove it (toggle off)
          const { error: removeError } = await supabase
            .from('comment_votes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', session.user.id);

          if (removeError) {
            console.error('Error removing vote:', removeError);
            return NextResponse.json(
              { error: 'Failed to remove vote' },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            action: 'removed',
            message: 'Vote removed successfully'
          });
        } else {
          // Different vote type - update it
          const { error: updateError } = await supabase
            .from('comment_votes')
            .update({ vote_type: voteType })
            .eq('comment_id', commentId)
            .eq('user_id', session.user.id);

          if (updateError) {
            console.error('Error updating vote:', updateError);
            return NextResponse.json(
              { error: 'Failed to update vote' },
              { status: 500 }
            );
          }

          return NextResponse.json({
            success: true,
            action: 'updated',
            vote_type: voteType,
            message: 'Vote updated successfully'
          });
        }
      } else {
        // New vote
        const { error: voteError } = await supabase
          .from('comment_votes')
          .insert({
            comment_id: commentId,
            user_id: session.user.id,
            vote_type: voteType
          });

        if (voteError) {
          console.error('Error adding vote:', voteError);
          return NextResponse.json(
            { error: 'Failed to add vote' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          action: 'added',
          vote_type: voteType,
          message: 'Vote added successfully'
        });
      }
    }

  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check if user has voted on a comment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ has_voted: false });
    }

    const commentId = params.id;

    const { data: vote } = await supabase
      .from('comment_votes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', session.user.id)
      .single();

    return NextResponse.json({
      has_voted: !!vote
    });

  } catch (error) {
    console.error('Vote check error:', error);
    return NextResponse.json({ has_voted: false });
  }
} 