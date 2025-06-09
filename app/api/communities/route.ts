import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fallback data when database is not available
const fallbackCommunities = [
  {
    id: '1',
    name: 'mechanical-engineering',
    display_name: 'Mechanical Engineering',
    description: 'Design, analysis, and manufacturing of mechanical systems',
    category: 'engineering',
    color: '#DC2626',
    member_count: 15420,
    post_count: 892,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'electronics',
    display_name: 'Electronics & PCB Design',
    description: 'Circuit design, PCB layout, and electronic prototyping',
    category: 'engineering',
    color: '#7C3AED',
    member_count: 12380,
    post_count: 756,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'robotics',
    display_name: 'Robotics',
    description: 'Autonomous systems, control theory, and robot design',
    category: 'engineering',
    color: '#059669',
    member_count: 8950,
    post_count: 543,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'engineering-software',
    display_name: 'Engineering Software',
    description: 'CAD, simulation, and engineering tools discussion',
    category: 'software',
    color: '#2563EB',
    member_count: 11200,
    post_count: 678,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'materials-science',
    display_name: 'Materials Science',
    description: 'Material properties, testing, and selection',
    category: 'science',
    color: '#B45309',
    member_count: 6780,
    post_count: 423,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'manufacturing',
    display_name: 'Manufacturing',
    description: '3D printing, CNC, injection molding, and production',
    category: 'manufacturing',
    color: '#DC2626',
    member_count: 9340,
    post_count: 612,
    created_at: new Date().toISOString()
  }
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .order('member_count', { ascending: false });

    if (error) {
      console.log('Database not available, using fallback data:', error.message);
      return NextResponse.json(fallbackCommunities);
    }

    // If no data from database, return fallback
    if (!data || data.length === 0) {
      return NextResponse.json(fallbackCommunities);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log('Database connection failed, using fallback data:', error);
    return NextResponse.json(fallbackCommunities);
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