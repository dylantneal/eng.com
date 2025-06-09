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
    
    // Get table schema info
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Schema query error:', error);
    }
    
    // Also try to get one profile record to see what exists
    const { data: sampleProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    return NextResponse.json({ 
      columns: columns || [],
      columnError: error?.message,
      sampleProfile,
      profileError: profileError?.message,
      sessionInfo: {
        userId: session.user.id,
        email: session.user.email
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 