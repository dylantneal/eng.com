import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fallback data when database is not available
const fallbackPosts = {
  'mechanical-engineering': [
    {
      id: '1',
      title: 'How to calculate bearing loads in rotating machinery?',
      content: 'I\'m working on a project involving rotating machinery and need help calculating the appropriate bearing loads for my design. The shaft rotates at 1800 RPM and carries a radial load of 500N. I\'ve been using the basic L10 life calculation but I\'m not sure if I\'m accounting for all the dynamic factors correctly. Any guidance on the proper methodology would be appreciated.',
      post_type: 'question',
      community_name: 'mechanical-engineering',
      author_id: 'user-1',
      tags: ['bearings', 'mechanics', 'calculations'],
      difficulty_level: 'intermediate',
      upvotes: 24,
      downvotes: 2,
      score: 22,
      hot_score: 15.5,
      comment_count: 8,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: {
        id: 'user-1',
        username: 'mech_engineer_2024'
      }
    },
    {
      id: '2',
      title: 'Best practices for thermal management in 3D printed enclosures?',
      content: 'I\'m designing enclosures for electronic devices using 3D printing (PLA and PETG). The devices generate moderate heat (up to 60°C) and I\'m concerned about thermal management. What are the best practices for ventilation design, material selection, and heat dissipation in 3D printed enclosures?',
      post_type: 'question',
      community_name: 'mechanical-engineering',
      author_id: 'user-3',
      tags: ['3d-printing', 'thermal', 'enclosures', 'design'],
      difficulty_level: 'intermediate',
      upvotes: 31,
      downvotes: 1,
      score: 30,
      hot_score: 18.7,
      comment_count: 18,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      author: {
        id: 'user-3',
        username: 'maker_pro'
      }
    }
  ],
  'electronics': [
    {
      id: '3',
      title: '[Show & Tell] Custom PCB for IoT Weather Station',
      content: 'Just finished designing and testing my first custom PCB for an IoT weather station project. Features include ESP32, multiple sensors (BME280, light sensor, rain detector), and solar charging capability. The board is 4-layer with proper ground planes and has been running stable for 2 months now. Happy to share the design files and lessons learned!',
      post_type: 'show_and_tell',
      community_name: 'electronics',
      author_id: 'user-2',
      tags: ['pcb-design', 'iot', 'weather-station', 'esp32'],
      upvotes: 45,
      downvotes: 1,
      score: 44,
      hot_score: 28.2,
      comment_count: 12,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      author: {
        id: 'user-2',
        username: 'circuit_wizard'
      }
    }
  ],
  'robotics': [
    {
      id: '4',
      title: 'Quadruped robot gait optimization using genetic algorithms',
      content: 'Spent the last 6 months developing a genetic algorithm to optimize quadruped robot gaits. The system can now automatically adapt walking patterns for different terrains and speeds. The robot uses 12 servo motors and an IMU for feedback. Performance improved by 40% in energy efficiency compared to hand-tuned gaits.',
      post_type: 'show_and_tell',
      community_name: 'robotics',
      author_id: 'user-4',
      tags: ['quadruped', 'gait', 'genetic-algorithm', 'optimization'],
      difficulty_level: 'advanced',
      upvotes: 67,
      downvotes: 3,
      score: 64,
      hot_score: 42.1,
      comment_count: 23,
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      author: {
        id: 'user-4',
        username: 'robot_researcher'
      }
    }
  ]
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ community: string }> }
) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'hot';
    const postType = searchParams.get('type');
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, avatar_url),
        community:communities(name, display_name, color)
      `)
      .eq('community_name', resolvedParams.community);

    if (postType && postType !== 'all') {
      query = query.eq('post_type', postType);
    }

    // Apply sorting
    switch (sort) {
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('score', { ascending: false });
        break;
      case 'hot':
      default:
        query = query.order('hot_score', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.log('Database not available, using fallback data:', error.message);
      const fallbackData = fallbackPosts[resolvedParams.community as keyof typeof fallbackPosts] || [];
      return NextResponse.json(fallbackData);
    }

    // If no data from database, return fallback
    if (!data || data.length === 0) {
      const fallbackData = fallbackPosts[resolvedParams.community as keyof typeof fallbackPosts] || [];
      return NextResponse.json(fallbackData);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log('Database connection failed, using fallback data:', error);
    const fallbackData = fallbackPosts[resolvedParams.community as keyof typeof fallbackPosts] || [];
    return NextResponse.json(fallbackData);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ community: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { 
      title, 
      content, 
      post_type, 
      tags, 
      difficulty_level, 
      author_id,
      attachments 
    } = body;

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title,
        content,
        post_type: post_type || 'discussion',
        community_name: resolvedParams.community,
        author_id,
        tags: tags || [],
        difficulty_level,
        attachments: attachments || [],
        upvotes: 0,
        downvotes: 0,
        score: 0,
        hot_score: 0,
        comment_count: 0,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        author:profiles(id, username, avatar_url),
        community:communities(name, display_name, color)
      `)
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    // Update community post count
    await supabase.rpc('increment_community_posts', { 
      community_name: resolvedParams.community 
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 