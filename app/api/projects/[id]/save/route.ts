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

    // Check if the user has already saved the project
    const { data: existingSave, error: saveError } = await supabase
      .from('saved_posts')
      .select('*')
      .eq('post_id', params.id)
      .eq('user_id', user_id)
      .eq('post_type', 'project')
      .single();

    if (saveError && saveError.code !== 'PGRST116') {
      console.error('Error checking existing save:', saveError);
      return NextResponse.json({ error: 'Failed to check save status' }, { status: 500 });
    }

    if (existingSave) {
      // Unsave the project
      const { error: deleteError } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', params.id)
        .eq('user_id', user_id)
        .eq('post_type', 'project');

      if (deleteError) {
        console.error('Error removing save:', deleteError);
        return NextResponse.json({ error: 'Failed to remove save' }, { status: 500 });
      }

      return NextResponse.json({ saved: false });
    } else {
      // Save the project
      const { error: insertError } = await supabase
        .from('saved_posts')
        .insert({
          post_id: params.id,
          user_id: user_id,
          post_type: 'project'
        });

      if (insertError) {
        console.error('Error adding save:', insertError);
        return NextResponse.json({ error: 'Failed to add save' }, { status: 500 });
      }

      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error('Error in project save API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 