import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface AnalyticsData {
  views: {
    total: number;
    unique: number;
    recent: Array<{ date: string; count: number }>;
  };
  downloads: {
    total: number;
    unique_users: number;
    recent: Array<{ date: string; count: number; filename?: string }>;
  };
  engagement: {
    likes: number;
    comments: number;
    saves: number;
  };
  traffic_sources: Array<{ source: string; count: number }>;
  top_files: Array<{ filename: string; downloads: number }>;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const supabase = await createClient();
    const projectId = (await params).id;
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Check if user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, owner_id, title, view_count, like_count, download_count')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.owner_id !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Access denied. Only project owners can view analytics.' },
        { status: 403 }
      );
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get project views (mock data for now)
    const viewsData = {
      total: project.view_count || 0,
      unique: Math.floor((project.view_count || 0) * 0.7), // Estimate unique views
      recent: generateMockTimeSeriesData(days, 'views')
    };

    // Get download analytics
    const downloadsData = {
      total: project.download_count || 0,
      unique_users: Math.floor((project.download_count || 0) * 0.8),
      recent: generateMockTimeSeriesData(days, 'downloads')
    };

    // Get engagement metrics
    const { data: comments } = await supabase
      .from('comments')
      .select('id')
      .eq('project_id', projectId);

    const engagementData = {
      likes: project.like_count || 0,
      comments: comments?.length || 0,
      saves: Math.floor((project.like_count || 0) * 0.3) // Estimate saves
    };

    // Mock traffic sources
    const trafficSources = [
      { source: 'Direct', count: Math.floor(viewsData.total * 0.4) },
      { source: 'Search', count: Math.floor(viewsData.total * 0.3) },
      { source: 'Social Media', count: Math.floor(viewsData.total * 0.2) },
      { source: 'Referral', count: Math.floor(viewsData.total * 0.1) }
    ];

    // Mock top files
    const topFiles = [
      { filename: 'main_assembly.stl', downloads: Math.floor(downloadsData.total * 0.4) },
      { filename: 'parts_list.pdf', downloads: Math.floor(downloadsData.total * 0.3) },
      { filename: 'schematic.png', downloads: Math.floor(downloadsData.total * 0.2) },
      { filename: 'README.md', downloads: Math.floor(downloadsData.total * 0.1) }
    ];

    const analytics: AnalyticsData = {
      views: viewsData,
      downloads: downloadsData,
      engagement: engagementData,
      traffic_sources: trafficSources,
      top_files: topFiles
    };

    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title
      },
      period: {
        days,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      analytics
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock time series data
function generateMockTimeSeriesData(days: number, type: 'views' | 'downloads') {
  const data = [];
  const baseValue = type === 'views' ? 10 : 3;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Generate realistic-looking data with some randomness
    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const multiplier = isWeekend ? 0.6 : 1;
    
    const value = Math.floor(
      baseValue * multiplier * (0.5 + Math.random()) + 
      Math.random() * 5
    );
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.max(0, value)
    });
  }
  
  return data;
}

// POST - Track a project view
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const projectId = (await params).id;
    const { action, metadata } = await request.json();

    if (action === 'view') {
      // Get current view count and increment
      const { data: currentProject } = await supabase
        .from('projects')
        .select('view_count')
        .eq('id', projectId)
        .single();

      const newViewCount = (currentProject?.view_count || 0) + 1;

      // Update view count
      const { error } = await supabase
        .from('projects')
        .update({ 
          view_count: newViewCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error tracking view:', error);
      }

      // In a real implementation, you might also log detailed view data
      // including IP, user agent, referrer, etc. for more detailed analytics

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 