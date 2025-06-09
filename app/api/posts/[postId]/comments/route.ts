import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:profiles(id, username, avatar_url),
        replies:post_comments!parent_id(
          *,
          author:profiles(id, username, avatar_url)
        )
      `)
      .eq('post_id', params.postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const body = await request.json();
    const { content, author_id, parent_id } = body;

    if (!content || !author_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate depth if this is a reply
    let depth = 0;
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from('post_comments')
        .select('depth')
        .eq('id', parent_id)
        .single();
      
      if (parentComment) {
        depth = parentComment.depth + 1;
      }
    }

    const { data, error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: params.postId,
        content,
        author_id,
        parent_id: parent_id || null,
        depth,
        upvotes: 0,
        downvotes: 0,
        score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        author:profiles(id, username, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // Update post comment count
    await supabase.rpc('increment_post_comments', { 
      post_id: params.postId 
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 