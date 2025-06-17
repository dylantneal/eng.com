import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Fetch communities from database
    const { data: communities, error } = await supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) {
      console.error('Database query failed:', error.message);
      return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
    }

    // Return real data - the migration should have populated this
    if (communities && communities.length > 0) {
      return NextResponse.json(communities);
    }

    // If no communities exist, return empty array
    console.log('No communities found in database');
    return NextResponse.json([]);

  } catch (error) {
    console.error('Communities API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, display_name, description, category, color } = body;

    const { data, error } = await supabase
      .from('communities')
      .insert([{
        name,
        display_name,
        description,
        category,
        color: color || '#3B82F6',
        member_count: 0,
        post_count: 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating community:', error);
      return NextResponse.json({ error: 'Failed to create community' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 