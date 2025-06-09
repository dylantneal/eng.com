import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Realistic engineering posts for the feed
const fallbackPosts = [
  {
    id: '1',
    title: 'Just finished my first 6-DOF robotic arm project!',
    content: 'After 6 months of design and manufacturing, my Arduino-controlled robotic arm is finally working. Used inverse kinematics for path planning and custom PCBs for motor control. The precision is incredible - can pick up a paperclip!',
    community_id: '8',
    community_name: 'robotics',
    community_display_name: 'Robotics & Automation',
    community_color: '#059669',
    user_id: 'user_1',
    username: 'robotics_enthusiast',
    user_avatar: 'https://picsum.photos/seed/user1/40/40',
    vote_count: 156,
    comment_count: 23,
    created_at: '2024-01-15T10:30:00Z',
    post_type: 'showcase',
    tags: ['robotics', 'arduino', 'inverse-kinematics', 'project'],
    images: ['https://picsum.photos/seed/robot-arm/600/400'],
    is_pinned: false,
    user_vote: null
  },
  {
    id: '2',
    title: 'Need help with FEA simulation convergence issues',
    content: 'Working on a pressure vessel analysis in ANSYS. The simulation keeps failing to converge when I refine the mesh beyond 100k elements. Material is steel, internal pressure 200 PSI. Any suggestions for mesh quality improvement?',
    community_id: '18',
    community_name: 'simulation',
    community_display_name: 'Simulation & Analysis',
    community_color: '#7C3AED',
    user_id: 'user_2',
    username: 'fem_analyst',
    user_avatar: 'https://picsum.photos/seed/user2/40/40',
    vote_count: 34,
    comment_count: 12,
    created_at: '2024-01-15T08:45:00Z',
    post_type: 'question',
    tags: ['ansys', 'fea', 'pressure-vessel', 'meshing'],
    images: [],
    is_pinned: false,
    user_vote: null
  },
  {
    id: '3',
    title: 'New breakthrough in quantum error correction',
    content: 'MIT researchers just published a paper on a new quantum error correction scheme that reduces error rates by 90%. This could be huge for practical quantum computing applications. Link to paper in comments.',
    community_id: '19',
    community_name: 'quantum-computing',
    community_display_name: 'Quantum Computing',
    community_color: '#EC4899',
    user_id: 'user_3',
    username: 'quantum_researcher',
    user_avatar: 'https://picsum.photos/seed/user3/40/40',
    vote_count: 89,
    comment_count: 15,
    created_at: '2024-01-15T07:20:00Z',
    post_type: 'news',
    tags: ['quantum-computing', 'error-correction', 'research', 'mit'],
    images: [],
    is_pinned: true,
    user_vote: 1
  },
  {
    id: '4',
    title: 'PCB Design Review - First attempt at 4-layer board',
    content: 'Designing my first 4-layer PCB for a motor controller. Would love feedback on trace routing and component placement. Especially concerned about the power plane layout and thermal management.',
    community_id: '9',
    community_name: 'electronics',
    community_display_name: 'Electronics & PCB Design',
    community_color: '#7C3AED',
    user_id: 'user_4',
    username: 'pcb_newbie',
    user_avatar: 'https://picsum.photos/seed/user4/40/40',
    vote_count: 67,
    comment_count: 18,
    created_at: '2024-01-15T06:15:00Z',
    post_type: 'review',
    tags: ['pcb-design', 'motor-controller', '4-layer', 'review'],
    images: ['https://picsum.photos/seed/pcb-design/600/400'],
    is_pinned: false,
    user_vote: null
  },
  {
    id: '5',
    title: 'Tesla\'s new manufacturing process for Model Y',
    content: 'Fascinating video from Tesla about their new casting process that reduces the Model Y body from 370 parts to just 1. The engineering behind this is incredible - single-piece casting for the entire rear section.',
    community_id: '16',
    community_name: 'automotive',
    community_display_name: 'Automotive Engineering',
    community_color: '#374151',
    user_id: 'user_5',
    username: 'auto_engineer',
    user_avatar: 'https://picsum.photos/seed/user5/40/40',
    vote_count: 234,
    comment_count: 45,
    created_at: '2024-01-15T05:30:00Z',
    post_type: 'discussion',
    tags: ['tesla', 'manufacturing', 'casting', 'automotive'],
    images: [],
    is_pinned: false,
    user_vote: 1
  },
  {
    id: '6',
    title: 'Sustainable concrete alternatives for construction',
    content: 'Working on a project to replace traditional concrete with bio-based alternatives. Current prototype uses mycelium and agricultural waste. Compressive strength is 80% of traditional concrete but carbon footprint is 95% lower.',
    community_id: '3',
    community_name: 'civil-engineering',
    community_display_name: 'Civil Engineering',
    community_color: '#6B7280',
    user_id: 'user_6',
    username: 'green_builder',
    user_avatar: 'https://picsum.photos/seed/user6/40/40',
    vote_count: 145,
    comment_count: 29,
    created_at: '2024-01-15T04:45:00Z',
    post_type: 'research',
    tags: ['sustainability', 'concrete', 'bio-materials', 'construction'],
    images: ['https://picsum.photos/seed/bio-concrete/600/400'],
    is_pinned: false,
    user_vote: null
  },
  {
    id: '7',
    title: 'How to transition from Mechanical to Software Engineering?',
    content: 'I\'ve been a mechanical engineer for 5 years but want to move into software. Currently learning Python and working on automation scripts. What programming languages and frameworks should I focus on for engineering applications?',
    community_id: '21',
    community_name: 'engineering-careers',
    community_display_name: 'Engineering Careers',
    community_color: '#6366F1',
    user_id: 'user_7',
    username: 'career_changer',
    user_avatar: 'https://picsum.photos/seed/user7/40/40',
    vote_count: 78,
    comment_count: 31,
    created_at: '2024-01-15T03:20:00Z',
    post_type: 'advice',
    tags: ['career-change', 'mechanical-engineering', 'software-engineering', 'programming'],
    images: [],
    is_pinned: false,
    user_vote: null
  },
  {
    id: '8',
    title: 'My 3D printed jet engine actually works!',
    content: 'After 8 months of design iterations, my 3D printed turbojet engine successfully completed its first test run. Thrust output is 2.5 lbf at 45,000 RPM. Used inconel powder for the hot section and titanium for the compressor.',
    community_id: '12',
    community_name: '3d-printing',
    community_display_name: '3D Printing & Additive Manufacturing',
    community_color: '#F97316',
    user_id: 'user_8',
    username: 'turbo_maker',
    user_avatar: 'https://picsum.photos/seed/user8/40/40',
    vote_count: 312,
    comment_count: 67,
    created_at: '2024-01-15T02:10:00Z',
    post_type: 'showcase',
    tags: ['3d-printing', 'jet-engine', 'metal-printing', 'aerospace'],
    images: ['https://picsum.photos/seed/jet-engine/600/400'],
    is_pinned: false,
    user_vote: 1
  },
  {
    id: '9',
    title: 'Solar panel efficiency breakthrough at Stanford',
    content: 'Researchers achieved 47% efficiency in perovskite-silicon tandem solar cells. This is a major step toward making solar energy more cost-effective. The new design uses a novel anti-reflection coating and optimized light management.',
    community_id: '15',
    community_name: 'renewable-energy',
    community_display_name: 'Renewable Energy',
    community_color: '#10B981',
    user_id: 'user_9',
    username: 'solar_scientist',
    user_avatar: 'https://picsum.photos/seed/user9/40/40',
    vote_count: 198,
    comment_count: 42,
    created_at: '2024-01-15T01:30:00Z',
    post_type: 'news',
    tags: ['solar', 'efficiency', 'perovskite', 'research'],
    images: [],
    is_pinned: true,
    user_vote: null
  },
  {
    id: '10',
    title: 'Machine learning for predictive maintenance in manufacturing',
    content: 'Implemented an ML system that predicts equipment failures 2 weeks in advance with 94% accuracy. Using vibration sensors, temperature data, and historical maintenance records. Reduced unplanned downtime by 60%.',
    community_id: '14',
    community_name: 'ai-ml',
    community_display_name: 'AI & Machine Learning',
    community_color: '#8B5CF6',
    user_id: 'user_10',
    username: 'ml_engineer',
    user_avatar: 'https://picsum.photos/seed/user10/40/40',
    vote_count: 156,
    comment_count: 28,
    created_at: '2024-01-15T00:45:00Z',
    post_type: 'case-study',
    tags: ['machine-learning', 'predictive-maintenance', 'manufacturing', 'iot'],
    images: ['https://picsum.photos/seed/ml-maintenance/600/400'],
    is_pinned: false,
    user_vote: null
  },
  {
    id: '11',
    title: 'Best practices for version control in SOLIDWORKS projects?',
    content: 'Our team is struggling with version control for large assemblies in SOLIDWORKS. Currently using PDM but having issues with file references and check-in/check-out workflows. What systems do you recommend for collaborative CAD work?',
    community_id: '17',
    community_name: 'cad-design',
    community_display_name: 'CAD & Design Tools',
    community_color: '#2563EB',
    user_id: 'user_11',
    username: 'cad_manager',
    user_avatar: 'https://picsum.photos/seed/user11/40/40',
    vote_count: 45,
    comment_count: 19,
    created_at: '2024-01-14T23:20:00Z',
    post_type: 'question',
    tags: ['solidworks', 'version-control', 'pdm', 'collaboration'],
    images: [],
    is_pinned: false,
    user_vote: null
  },
  {
    id: '12',
    title: 'IoT sensors for smart agriculture monitoring',
    content: 'Built a network of wireless sensors for monitoring soil moisture, pH, and nutrient levels in crop fields. Data is transmitted via LoRaWAN to a central dashboard. Farmers can optimize irrigation and fertilization in real-time.',
    community_id: '13',
    community_name: 'iot',
    community_display_name: 'IoT & Embedded Systems',
    community_color: '#06B6D4',
    user_id: 'user_12',
    username: 'iot_farmer',
    user_avatar: 'https://picsum.photos/seed/user12/40/40',
    vote_count: 89,
    comment_count: 24,
    created_at: '2024-01-14T22:15:00Z',
    post_type: 'project',
    tags: ['iot', 'agriculture', 'sensors', 'lorawan'],
    images: ['https://picsum.photos/seed/smart-farm/600/400'],
    is_pinned: false,
    user_vote: null
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const community = searchParams.get('community');
    const sort = searchParams.get('sort') || 'hot'; // 'hot', 'new', 'top', 'personalized'
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const userId = searchParams.get('userId'); // For personalized recommendations

    // Try to fetch from database first
    let query = supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        community_id,
        user_id,
        vote_count,
        comment_count,
        created_at,
        post_type,
        tags,
        images,
        is_pinned,
        communities(name, display_name, color),
        profiles(username, avatar_url)
      `)
      .range((page - 1) * limit, page * limit - 1);

    if (community) {
      query = query.eq('community_id', community);
    }

    // Apply sorting
    if (sort === 'new') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'top') {
      query = query.order('vote_count', { ascending: false });
    } else {
      // 'hot' algorithm: combination of votes and recency
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error || !data) {
      console.log('Database not available or no posts, using fallback data:', error?.message);
      
      // Filter and sort fallback data
      let filteredPosts = community 
        ? fallbackPosts.filter(post => post.community_id === community)
        : fallbackPosts;

      // Apply sorting to fallback data
      if (sort === 'new') {
        filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sort === 'top') {
        filteredPosts.sort((a, b) => b.vote_count - a.vote_count);
      } else if (sort === 'personalized') {
        // Personalized algorithm based on user interests
        filteredPosts = personalizePostFeed(filteredPosts, userId);
      } else {
        // Hot algorithm: posts with recent high engagement
        filteredPosts.sort((a, b) => {
          const aScore = calculateHotScore(a);
          const bScore = calculateHotScore(b);
          return bScore - aScore;
        });
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        posts: paginatedPosts,
        pagination: {
          page,
          limit,
          total: filteredPosts.length,
          pages: Math.ceil(filteredPosts.length / limit)
        }
      });
    }

    return NextResponse.json({
      posts: data,
      pagination: {
        page,
        limit,
        total: data.length,
        pages: Math.ceil(data.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Personalized feed algorithm
function personalizePostFeed(posts: any[], userId?: string | null) {
  // Mock user preferences - in real app, this would come from database
  const userPreferences = getUserPreferences(userId);
  
  return posts
    .map(post => ({
      ...post,
      personalScore: calculatePersonalScore(post, userPreferences)
    }))
    .sort((a, b) => b.personalScore - a.personalScore);
}

// Calculate hot score for posts
function calculateHotScore(post: any): number {
  const now = Date.now();
  const postTime = new Date(post.created_at).getTime();
  const ageHours = (now - postTime) / (1000 * 60 * 60);
  
  // Reddit-style hot algorithm
  const score = Math.log10(Math.max(Math.abs(post.vote_count), 1)) + 
                (post.comment_count * 0.5) - 
                (ageHours / 24);
  
  return post.is_pinned ? score + 100 : score;
}

// Calculate personalized score for posts
function calculatePersonalScore(post: any, preferences: UserPreferences): number {
  let score = 0;
  
  // Base engagement score
  score += Math.log10(Math.max(post.vote_count, 1)) * 10;
  score += post.comment_count * 2;
  
  // Time decay factor
  const now = Date.now();
  const postTime = new Date(post.created_at).getTime();
  const ageHours = (now - postTime) / (1000 * 60 * 60);
  score -= ageHours * 0.1;
  
  // Community interest boost
  if (preferences.favoriteCommunitites.includes(post.community_id)) {
    score += 50;
  }
  
  // Tag interest boost
  const tagMatches = post.tags.filter((tag: string) => 
    preferences.interestedTags.includes(tag)
  ).length;
  score += tagMatches * 15;
  
  // Post type preference
  if (preferences.preferredPostTypes.includes(post.post_type)) {
    score += 20;
  }
  
  // Engineering discipline match
  const disciplineKeywords = {
    'mechanical': ['mechanical', 'cad', 'manufacturing', 'design'],
    'electrical': ['electrical', 'circuit', 'pcb', 'electronics'],
    'software': ['software', 'programming', 'algorithm', 'code'],
    'robotics': ['robotics', 'automation', 'control', 'robot'],
    'materials': ['materials', 'testing', 'properties'],
    'manufacturing': ['manufacturing', 'production', '3d-printing', 'cnc']
  };
  
  for (const [discipline, keywords] of Object.entries(disciplineKeywords)) {
    if (preferences.engineeringDisciplines.includes(discipline)) {
      const contentLower = (post.title + ' ' + post.content).toLowerCase();
      const keywordMatches = keywords.filter(keyword => 
        contentLower.includes(keyword)
      ).length;
      score += keywordMatches * 10;
    }
  }
  
  // Diversity factor - slightly boost posts from different communities
  // This prevents echo chambers
  if (!preferences.recentlyViewedCommunities.includes(post.community_id)) {
    score += 5;
  }
  
  return score;
}

// Mock user preferences - in real app, this would be fetched from database
function getUserPreferences(userId?: string | null): UserPreferences {
  // Default preferences for anonymous users
  if (!userId) {
    return {
      favoriteCommunitites: ['1', '5', '8'], // Mechanical, Software, Robotics
      interestedTags: ['robotics', 'arduino', 'programming', 'design', 'project'],
      preferredPostTypes: ['showcase', 'question', 'discussion'],
      engineeringDisciplines: ['mechanical', 'software', 'robotics'],
      recentlyViewedCommunities: ['1', '2']
    };
  }
  
  // Mock user-specific preferences based on activity
  const userPreferencesMap = {
    'user_1': {
      favoriteCommunitites: ['8', '14', '13'], // Robotics, AI/ML, IoT
      interestedTags: ['robotics', 'machine-learning', 'iot', 'sensors'],
      preferredPostTypes: ['showcase', 'research', 'project'],
      engineeringDisciplines: ['robotics', 'software'],
      recentlyViewedCommunities: ['8', '14']
    },
    'user_2': {
      favoriteCommunitites: ['1', '17', '18'], // Mechanical, CAD, Simulation
      interestedTags: ['cad', 'solidworks', 'fea', 'design'],
      preferredPostTypes: ['question', 'review', 'advice'],
      engineeringDisciplines: ['mechanical'],
      recentlyViewedCommunities: ['1', '17']
    }
  };
  
  return userPreferencesMap[userId as keyof typeof userPreferencesMap] || getUserPreferences();
}

interface UserPreferences {
  favoriteCommunitites: string[];
  interestedTags: string[];
  preferredPostTypes: string[];
  engineeringDisciplines: string[];
  recentlyViewedCommunities: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, community_id, post_type, tags, images } = body;

    // In a real implementation, you'd get user_id from authentication
    const user_id = 'current_user_id';

    const { data, error } = await supabase
      .from('posts')
      .insert([{
        title,
        content,
        community_id,
        user_id,
        post_type: post_type || 'discussion',
        tags: tags || [],
        images: images || [],
        vote_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 