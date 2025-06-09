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

    const data = await request.json();
    const {
      name,
      handle,
      bio,
      location,
      website,
      company,
      jobTitle,
      primaryDomain,
      experienceLevel,
      interests,
      avatar_url
    } = data;

    // Validate required fields
    if (!name || !handle || !primaryDomain || !experienceLevel || !interests?.length) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, handle, primaryDomain, experienceLevel, and at least one interest' 
      }, { status: 400 });
    }

    const supabase = supabaseServerAdmin();
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, handle')
      .eq('id', session.user.id)
      .single();

    // Check if handle is taken by someone else
    const { data: existingHandle } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', handle.toLowerCase())
      .neq('id', session.user.id)
      .single();
    
    if (existingHandle) {
      return NextResponse.json({ 
        error: 'Handle is already taken'
      }, { status: 409 });
    }
    
    let newProfile, error;
    
    if (existingProfile) {
      // Update existing profile - only use fields that exist in schema
      const result = await supabase
        .from('profiles')
        .update({
          handle: handle.toLowerCase(),
          bio: bio?.trim() || null,
          avatar_url: avatar_url || session.user.image || null
        })
        .eq('id', session.user.id)
        .select('*')
        .single();
      
      newProfile = result.data;
      error = result.error;
    } else {
      // Create new profile - only use fields that exist in schema
      const result = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          handle: handle.toLowerCase(),
          bio: bio?.trim() || null,
          avatar_url: avatar_url || session.user.image || null
        })
        .select('*')
        .single();
        
      newProfile = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('Profile creation error:', error);
      return NextResponse.json({ 
        error: 'Failed to create profile',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Profile created successfully',
      profile: newProfile 
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 