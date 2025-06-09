import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = supabaseServerAdmin();
    
    // Get all table names
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    // Get user-related data from different potential tables
    const queries = await Promise.allSettled([
      // Check auth.users (Supabase Auth table)
      supabase.auth.admin.listUsers(),
      
      // Check profiles table
      supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
      
      // Check if NextAuth tables exist and have data for this user
      supabase.from('users').select('*').eq('id', session.user.id).maybeSingle(),
      supabase.from('accounts').select('*').eq('userId', session.user.id),
      supabase.from('sessions').select('*').eq('userId', session.user.id),
    ]);
    
    return NextResponse.json({ 
      tables: tables?.map(t => t.table_name) || [],
      tablesError: tablesError?.message,
      userQueries: {
        supabaseAuthUsers: queries[0],
        profilesTable: queries[1],
        nextAuthUsers: queries[2],
        nextAuthAccounts: queries[3],
        nextAuthSessions: queries[4],
      },
      currentUserId: session.user.id,
      currentUserEmail: session.user.email
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 