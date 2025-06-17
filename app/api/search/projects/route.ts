import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface SearchFilters {
  query?: string;
  disciplines?: string[];
  tags?: string[];
  licenses?: string[];
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'most_liked' | 'most_viewed' | 'most_downloaded';
  dateRange?: '24h' | '7d' | '30d' | '90d' | 'all';
  minLikes?: number;
  minViews?: number;
  hasFiles?: boolean;
  limit?: number;
  offset?: number;
}

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  discipline: string;
  tags: string[];
  license: string;
  image_url: string;
  view_count: number;
  like_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  relevance_score?: number;
  match_type?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const filters: SearchFilters = {
      query: searchParams.get('q') || '',
      disciplines: searchParams.get('disciplines')?.split(',').filter(Boolean) || [],
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      licenses: searchParams.get('licenses')?.split(',').filter(Boolean) || [],
      sortBy: (searchParams.get('sort') as any) || 'relevance',
      dateRange: (searchParams.get('date') as any) || 'all',
      minLikes: searchParams.get('minLikes') ? parseInt(searchParams.get('minLikes')!) : undefined,
      minViews: searchParams.get('minViews') ? parseInt(searchParams.get('minViews')!) : undefined,
      hasFiles: searchParams.get('hasFiles') === 'true',
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const supabase = await createClient();

    // Build base query - using basic select to avoid join issues
    let query = supabase
      .from('projects')
      .select(`
        id,
        title,
        slug,
        description,
        discipline,
        tags,
        license,
        image_url,
        view_count,
        like_count,
        download_count,
        created_at,
        updated_at,
        owner_id
      `)
      .eq('is_public', true);

    // Apply text search if query provided
    if (filters.query && filters.query.trim()) {
      const searchTerms = filters.query.trim().toLowerCase();
      
      // Use ilike for broader matching
      query = query.or(
        `title.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%,tags.cs.{${searchTerms}}`
      );
    }

    // Apply discipline filters
    if (filters.disciplines && filters.disciplines.length > 0) {
      query = query.in('discipline', filters.disciplines);
    }

    // Apply tag filters
    if (filters.tags && filters.tags.length > 0) {
      // Check if any of the specified tags are present
      const tagConditions = filters.tags.map(tag => `tags.cs.{${tag}}`).join(',');
      query = query.or(tagConditions);
    }

    // Apply license filters
    if (filters.licenses && filters.licenses.length > 0) {
      query = query.in('license', filters.licenses);
    }

    // Apply metric filters
    if (filters.minLikes !== undefined) {
      query = query.gte('like_count', filters.minLikes);
    }

    if (filters.minViews !== undefined) {
      query = query.gte('view_count', filters.minViews);
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most_liked':
        query = query.order('like_count', { ascending: false });
        break;
      case 'most_viewed':
        query = query.order('view_count', { ascending: false });
        break;
      case 'most_downloaded':
        query = query.order('download_count', { ascending: false });
        break;
      case 'relevance':
      default:
        // For relevance, we'll sort by a combination of factors after fetching
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination with defaults
    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    query = query.range(offset, offset + limit - 1);

    const { data: projects, error } = await query;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      );
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        results: [],
        facets: { disciplines: [], tags: [], licenses: [] },
        pagination: { total: 0, limit, offset, hasMore: false },
        search_info: {
          query: filters.query,
          filters_applied: {
            disciplines: filters.disciplines,
            tags: filters.tags,
            licenses: filters.licenses,
            date_range: filters.dateRange,
            sort_by: filters.sortBy
          },
          took_ms: 0
        }
      });
    }

    // Get author information separately to avoid join issues
    const authorIds = [...new Set(projects.map((p: any) => p.owner_id).filter(Boolean))];
    const { data: authors } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', authorIds);

    const authorsMap = new Map(authors?.map(author => [author.id, author]) || []);

    // Process results and calculate relevance scores
    const processedResults = projects.map((project: any) => {
      let relevanceScore = 0;
      let matchTypes: string[] = [];

      if (filters.query && filters.query.trim()) {
        const searchTerms = filters.query.toLowerCase();
        
        // Title match (highest weight)
        if (project.title?.toLowerCase().includes(searchTerms)) {
          relevanceScore += 10;
          matchTypes.push('title');
        }

        // Description match
        if (project.description?.toLowerCase().includes(searchTerms)) {
          relevanceScore += 5;
          matchTypes.push('description');
        }

        // Tag match
        if (project.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerms))) {
          relevanceScore += 3;
          matchTypes.push('tags');
        }

        // Discipline match
        if (project.discipline?.toLowerCase().includes(searchTerms)) {
          relevanceScore += 2;
          matchTypes.push('discipline');
        }
      }

      // Boost score based on engagement metrics
      relevanceScore += Math.log(1 + (project.like_count || 0)) * 0.5;
      relevanceScore += Math.log(1 + (project.view_count || 0)) * 0.2;
      relevanceScore += Math.log(1 + (project.download_count || 0)) * 0.3;

      // Boost recent projects slightly
      const createdAt = project.created_at ? new Date(project.created_at) : new Date();
      const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 30) {
        relevanceScore += (30 - ageInDays) * 0.1;
      }

      const author = authorsMap.get(project.owner_id);

      return {
        id: project.id,
        title: project.title,
        slug: project.slug,
        description: project.description,
        discipline: project.discipline,
        tags: project.tags || [],
        license: project.license,
        image_url: project.image_url,
        view_count: project.view_count || 0,
        like_count: project.like_count || 0,
        download_count: project.download_count || 0,
        created_at: project.created_at,
        updated_at: project.updated_at,
        author: {
          id: author?.id || project.owner_id || '',
          username: author?.username || 'Unknown',
          display_name: author?.display_name || 'Unknown User',
          avatar_url: author?.avatar_url || ''
        },
        relevance_score: relevanceScore,
        match_type: matchTypes
      } as SearchResult;
    });

    // Sort by relevance if requested
    if (filters.sortBy === 'relevance') {
      processedResults.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    }

    // Get search facets for filtering UI
    const facets = await getSearchFacets(supabase, filters);

    // Get total count for pagination (approximation)
    const totalCount = processedResults.length;

    return NextResponse.json({
      results: processedResults,
      facets,
      pagination: {
        total: totalCount,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: processedResults.length === filters.limit
      },
      search_info: {
        query: filters.query,
        filters_applied: {
          disciplines: filters.disciplines,
          tags: filters.tags,
          licenses: filters.licenses,
          date_range: filters.dateRange,
          sort_by: filters.sortBy
        },
        took_ms: Date.now() // Placeholder - would need actual timing
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get search facets
async function getSearchFacets(supabase: any, filters: SearchFilters) {
  try {
    // Get available disciplines
    const { data: disciplines } = await supabase
      .from('projects')
      .select('discipline')
      .eq('is_public', true)
      .not('discipline', 'is', null);

    // Get popular tags
    const { data: tagData } = await supabase
      .from('projects')
      .select('tags')
      .eq('is_public', true)
      .not('tags', 'is', null);

    // Get available licenses
    const { data: licenses } = await supabase
      .from('projects')
      .select('license')
      .eq('is_public', true)
      .not('license', 'is', null);

    // Process disciplines
    const disciplineCounts = new Map<string, number>();
    disciplines?.forEach((item: any) => {
      if (item.discipline) {
        disciplineCounts.set(item.discipline, (disciplineCounts.get(item.discipline) || 0) + 1);
      }
    });

    // Process tags
    const tagCounts = new Map<string, number>();
    tagData?.forEach((item: any) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    // Process licenses
    const licenseCounts = new Map<string, number>();
    licenses?.forEach((item: any) => {
      if (item.license) {
        licenseCounts.set(item.license, (licenseCounts.get(item.license) || 0) + 1);
      }
    });

    return {
      disciplines: Array.from(disciplineCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      tags: Array.from(tagCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50), // Top 50 tags
      licenses: Array.from(licenseCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    };
  } catch (error) {
    console.error('Error getting facets:', error);
    return {
      disciplines: [],
      tags: [],
      licenses: []
    };
  }
} 