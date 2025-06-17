import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId, content, parentId } = body;
    const userId = session.user.id;

    if (!postId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    // Calculate depth for nested comments
    let depth = 0;
    if (parentId) {
      const { data: parentComment } = await supabase
        .from('post_comments')
        .select('depth')
        .eq('id', parentId)
        .single();
      
      if (parentComment) {
        depth = Math.min(parentComment.depth + 1, 5); // Max depth of 5
      }
    }

    // Create the comment
    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        author_id: userId,
        body: content.trim(),
        parent_comment_id: parentId || null,
        depth,
        upvotes: 0,
        downvotes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        author:profiles!author_id(id, username, display_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Update post comment count
    const { error: updateError } = await supabase.rpc('increment_post_comment_count', {
      post_id: postId
    });

    if (updateError) {
      console.error('Error updating comment count:', updateError);
      // Don't fail the request if comment count update fails
    }

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment created successfully'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 