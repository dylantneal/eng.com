import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Get user_id from request body
    const body = await request.json();
    const { user_id } = body;
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Check if the user has already liked the project
    const { data: existingLike, error: likeError } = await supabase
      .from('project_likes')
      .select('*')
      .eq('project_id', params.id)
      .eq('user_id', user_id)
      .single();

    if (likeError && likeError.code !== 'PGRST116') {
      console.error('Error checking existing like:', likeError);
      return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
    }

    if (existingLike) {
      // Unlike the project
      const { error: deleteError } = await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', params.id)
        .eq('user_id', user_id);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return NextResponse.json({ error: 'Failed to remove like' }, { status: 500 });
      }

      // Decrement like count
      const { error: updateError } = await supabase.rpc('decrement_project_like_count', {
        project_id: params.id
      });

      if (updateError) {
        console.error('Error updating like count:', updateError);
      }

      return NextResponse.json({ liked: false });
    } else {
      // Like the project
      const { error: insertError } = await supabase
        .from('project_likes')
        .insert({
          project_id: params.id,
          user_id: user_id
        });

      if (insertError) {
        console.error('Error adding like:', insertError);
        return NextResponse.json({ error: 'Failed to add like' }, { status: 500 });
      }

      // Increment like count
      const { error: updateError } = await supabase.rpc('increment_project_like_count', {
        project_id: params.id
      });

      if (updateError) {
        console.error('Error updating like count:', updateError);
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error in project like API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 