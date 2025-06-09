import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = supabaseServerAdmin();
    
    // Extract handle from email
    const handle = session.user.email?.split('@')[0] || 'user';
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();
    
    if (existingProfile) {
      return NextResponse.json({ 
        message: 'Profile already exists',
        profile: existingProfile 
      });
    }
    
    // Create new profile
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        handle: handle,
        avatar_url: session.user.image || null,
        bio: null,
        plan: 'FREE'
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Profile creation error:', error);
      return NextResponse.json({ 
        error: 'Failed to create profile',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.redirect(new URL('/debug-profile?created=true', process.env.NEXTAUTH_URL || 'http://localhost:4000'));
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 