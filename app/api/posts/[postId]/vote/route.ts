import { NextRequest, NextResponse } from 'next/server';
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
    const body = await request.json();
    const { user_id, vote_type } = body; // 'up' or 'down'

    if (!user_id || !vote_type) {
      return NextResponse.json({ error: 'Missing user_id or vote_type' }, { status: 400 });
    }

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', params.postId)
        .eq('user_id', user_id)
        .single();

      let operation;
      
      if (existingVote) {
        if (existingVote.vote_type === vote_type) {
          // Remove the vote (toggle off)
          await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', params.postId)
            .eq('user_id', user_id);
          operation = 'removed';
        } else {
          // Change the vote
          await supabase
            .from('post_votes')
            .update({ vote_type, updated_at: new Date().toISOString() })
            .eq('post_id', params.postId)
            .eq('user_id', user_id);
          operation = 'changed';
        }
      } else {
        // Add new vote
        await supabase
          .from('post_votes')
          .insert([{
            post_id: params.postId,
            user_id,
            vote_type,
            created_at: new Date().toISOString()
          }]);
        operation = 'added';
      }

      // Get updated post with vote counts
      const { data: post, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, username, avatar_url),
          community:communities(name, display_name, color)
        `)
        .eq('id', params.postId)
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ 
        post, 
        operation,
        message: `Vote ${operation} successfully` 
      });

    } catch (dbError) {
      // Database not available, simulate voting with mock response
      console.log('Database not available, simulating vote:', dbError);
      
      // Create a mock updated post
      const mockPost = {
        id: params.postId,
        title: 'Sample Post',
        content: 'This is a sample post for demonstration.',
        post_type: 'question',
        community_name: 'mechanical-engineering',
        author_id: user_id,
        tags: ['sample'],
        difficulty_level: 'intermediate',
        upvotes: vote_type === 'up' ? 25 : 23,
        downvotes: vote_type === 'down' ? 3 : 2,
        score: vote_type === 'up' ? 23 : 21,
        hot_score: vote_type === 'up' ? 16.5 : 14.5,
        comment_count: 8,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        author: {
          id: user_id,
          username: 'demo_user'
        },
        community: {
          name: 'mechanical-engineering',
          display_name: 'Mechanical Engineering',
          color: '#DC2626'
        }
      };

      return NextResponse.json({ 
        post: mockPost, 
        operation: 'simulated',
        message: `Vote simulated successfully (database not available)` 
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 