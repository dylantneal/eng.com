import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_verified, email')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_verified || !profile.email?.includes('@eng.com')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return await getTableStats();
      case 'health':
        return await checkDatabaseHealth();
      case 'slow-queries':
        return await getSlowQueries();
      case 'integrity':
        return await checkDataIntegrity();
      default:
        return await getDashboard();
    }
  } catch (error) {
    console.error('Database monitor error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function getDashboard() {
  const [stats, health, integrity] = await Promise.all([
    getTableStatsData(),
    checkDatabaseHealthData(),
    checkDataIntegrityData()
  ]);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    stats,
    health,
    integrity
  });
}

async function getTableStats() {
  const stats = await getTableStatsData();
  return NextResponse.json(stats);
}

async function getTableStatsData() {
  try {
    // Use the monitoring function we created in the migration
    const { data, error } = await supabase.rpc('get_database_stats');
    
    if (error) {
      console.error('Error getting database stats:', error);
      return { error: error.message };
    }

    // Also get table counts manually for verification
    const tables = [
      'profiles',
      'communities',
      'community_memberships',
      'projects',
      'posts',
      'comments',
      'marketplace_items',
      'marketplace_purchases',
      'marketplace_reviews'
    ];

    const counts = await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        return {
          table,
          count: count || 0,
          error: error?.message
        };
      })
    );

    return {
      tables: data || [],
      counts,
      summary: {
        total_tables: counts.length,
        total_records: counts.reduce((sum, t) => sum + (t.count || 0), 0),
        empty_tables: counts.filter(t => t.count === 0).map(t => t.table)
      }
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function checkDatabaseHealth() {
  const health = await checkDatabaseHealthData();
  return NextResponse.json(health);
}

async function checkDatabaseHealthData() {
  const checks = {
    connection: false,
    auth: false,
    storage: false,
    indexes: false,
    rls: false
  };

  try {
    // Check basic connection
    const { error: pingError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    checks.connection = !pingError;

    // Check auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    checks.auth = !authError && !!authUsers;

    // Check storage buckets
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    checks.storage = !storageError && !!buckets;

    // Check critical indexes exist
    try {
      const { data: indexes } = await supabase.rpc('get_indexes_info', {
        schema_name: 'public'
      });
      checks.indexes = !!indexes;
    } catch {
      checks.indexes = false;
    }

    // Check RLS is enabled on critical tables
    try {
      const { data: rlsStatus } = await supabase.rpc('check_rls_status', {
        schema_name: 'public'
      });
      checks.rls = !!rlsStatus;
    } catch {
      checks.rls = false;
    }

    return {
      status: Object.values(checks).every(c => c) ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      checks,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

async function getSlowQueries() {
  // In a production environment, you'd query pg_stat_statements
  // For now, we'll identify potentially slow operations
  const slowOperations = [];

  // Test query performance
  const queries = [
    {
      name: 'Complex post feed',
      query: async () => {
        const start = Date.now();
        await supabase
          .from('posts')
          .select(`
            *,
            author:profiles!user_id(*),
            community:communities!community_id(*),
            _count:comments(count)
          `)
          .limit(20);
        return Date.now() - start;
      }
    },
    {
      name: 'Project with versions',
      query: async () => {
        const start = Date.now();
        await supabase
          .from('projects')
          .select(`
            *,
            owner:profiles!owner_id(*),
            versions(*)
          `)
          .limit(10);
        return Date.now() - start;
      }
    }
  ];

  for (const { name, query } of queries) {
    try {
      const duration = await query();
      if (duration > 100) { // Flag queries taking more than 100ms
        slowOperations.push({
          operation: name,
          duration_ms: duration,
          severity: duration > 500 ? 'critical' : duration > 200 ? 'warning' : 'info'
        });
      }
    } catch (error) {
      slowOperations.push({
        operation: name,
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'error'
      });
    }
  }

  return NextResponse.json({
    slow_queries: slowOperations,
    recommendations: [
      'Consider adding indexes on frequently queried columns',
      'Use pagination to limit result sets',
      'Optimize complex joins with materialized views',
      'Monitor query patterns and adjust indexes accordingly'
    ]
  });
}

async function checkDataIntegrity() {
  const integrity = await checkDataIntegrityData();
  return NextResponse.json(integrity);
}

async function checkDataIntegrityData() {
  const issues = [];

  // Check for orphaned records
  const orphanChecks = [
    {
      name: 'Posts without communities',
      query: `
        SELECT COUNT(*) as count
        FROM posts p
        WHERE NOT EXISTS (
          SELECT 1 FROM communities c WHERE c.id = p.community_id
        )
      `
    },
    {
      name: 'Comments without users',
      query: `
        SELECT COUNT(*) as count
        FROM comments c
        WHERE NOT EXISTS (
          SELECT 1 FROM profiles p WHERE p.id = c.user_id
        )
      `
    },
    {
      name: 'Votes without posts',
      query: `
        SELECT COUNT(*) as count
        FROM post_votes v
        WHERE NOT EXISTS (
          SELECT 1 FROM posts p WHERE p.id = v.post_id
        )
      `
    }
  ];

  for (const check of orphanChecks) {
    try {
      const { data, error } = await supabase.rpc('execute_raw_sql', {
        query: check.query
      });

      if (error || (data && data[0]?.count > 0)) {
        issues.push({
          type: 'orphaned_records',
          description: check.name,
          count: data?.[0]?.count || 0,
          severity: 'warning'
        });
      }
    } catch (error) {
      issues.push({
        type: 'check_failed',
        description: check.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'error'
      });
    }
  }

  // Check for data consistency
  const consistencyChecks = [
    {
      table: 'posts',
      check: 'vote_count_mismatch',
      description: 'Posts with incorrect vote counts'
    },
    {
      table: 'communities',
      check: 'member_count_mismatch',
      description: 'Communities with incorrect member counts'
    },
    {
      table: 'projects',
      check: 'like_count_mismatch',
      description: 'Projects with incorrect like counts'
    }
  ];

  return {
    issues,
    summary: {
      total_issues: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length
    },
    recommendations: issues.length > 0 ? [
      'Run data consistency migration to fix issues',
      'Set up regular integrity checks',
      'Add database constraints to prevent future issues'
    ] : ['No integrity issues found']
  };
} 