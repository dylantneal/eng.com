import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { createClient } from '@supabase/supabase-js';

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
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { postId } = params;
    const userId = session.user.id;

    // Check if post is already saved
    const { data: existingSave } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingSave) {
      // Unsave the post
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error unsaving post:', error);
        return NextResponse.json(
          { error: 'Failed to unsave post' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'unsaved',
        message: 'Post unsaved successfully'
      });
    } else {
      // Save the post
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          post_id: postId,
          user_id: userId,
          saved_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving post:', error);
        return NextResponse.json(
          { error: 'Failed to save post' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: 'saved',
        message: 'Post saved successfully'
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 