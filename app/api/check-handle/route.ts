import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }

    // Basic validation
    if (handle.length < 3 || handle.length > 30) {
      return NextResponse.json({ available: false, reason: 'Handle must be 3-30 characters' });
    }

    // Check for valid characters (alphanumeric, dots, dashes, underscores)
    if (!/^[a-z0-9._-]+$/.test(handle)) {
      return NextResponse.json({ available: false, reason: 'Handle can only contain letters, numbers, dots, dashes, and underscores' });
    }

    // Check if handle exists in database
    const supabase = await createClient();
    const { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('handle')
      .eq('handle', handle.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking handle:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const available = !existingProfile;
    
    return NextResponse.json({ 
      available,
      reason: available ? 'Handle is available' : 'Handle is already taken'
    });

  } catch (error) {
    console.error('Handle check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 