import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = supabaseServerAdmin();
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, handle, name')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error('Profile check error:', checkError);
      return NextResponse.json({ 
        error: 'Failed to check existing profile',
        details: checkError.message 
      }, { status: 500 });
    }
    
    if (!existingProfile) {
      return NextResponse.json({ 
        message: 'No profile found to delete - ready for onboarding',
        hadProfile: false
      });
    }
    
    // Delete the user's profile
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', session.user.id);
    
    if (error) {
      console.error('Profile deletion error:', error);
      return NextResponse.json({ 
        error: 'Failed to delete profile',
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: `Profile deleted successfully (was: ${existingProfile.handle || existingProfile.name || 'unnamed'})`,
      hadProfile: true,
      deletedProfile: existingProfile
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 