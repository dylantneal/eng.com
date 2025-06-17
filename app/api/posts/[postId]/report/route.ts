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

    const body = await request.json();
    const { reason, details } = body;
    const { postId } = params;
    const userId = session.user.id;

    if (!reason) {
      return NextResponse.json(
        { error: 'Report reason is required' },
        { status: 400 }
      );
    }

    // Check if user has already reported this post
    const { data: existingReport } = await supabase
      .from('post_reports')
      .select('id')
      .eq('post_id', postId)
      .eq('reporter_id', userId)
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this post' },
        { status: 400 }
      );
    }

    // Create the report
    const { error } = await supabase
      .from('post_reports')
      .insert({
        post_id: postId,
        reporter_id: userId,
        reason,
        details: details || null,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating report:', error);
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully. Our moderation team will review it.'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 