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
    // Fetch user reputation
    const { data: reputation, error: reputationError } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', params.userId)
      .single();

    if (reputationError) {
      console.error('Error fetching reputation:', reputationError);
      return NextResponse.json(
        { error: 'Failed to fetch reputation' },
        { status: 500 }
      );
    }

    // Fetch user badges
    const { data: badges, error: badgesError } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', params.userId)
      .order('earned_at', { ascending: false });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return NextResponse.json(
        { error: 'Failed to fetch badges' },
        { status: 500 }
      );
    }

    // If no reputation record exists, create one
    if (!reputation) {
      const { data: newReputation, error: createError } = await supabase
        .from('user_reputation')
        .insert([
          {
            user_id: params.userId,
            total_aura: 0,
            post_aura: 0,
            comment_aura: 0,
            helpful_answers: 0,
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error('Error creating reputation:', createError);
        return NextResponse.json(
          { error: 'Failed to create reputation' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ...newReputation,
        badges: badges || [],
      });
    }

    return NextResponse.json({
      ...reputation,
      badges: badges || [],
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 