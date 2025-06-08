import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseBrowser } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, handle, bio, avatar_url } = body;

    const supabase = supabaseBrowser;

    // Check if handle is already taken by another user
    if (handle) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', handle)
        .neq('id', session.user.id)
        .single();

      if (existingProfile) {
        return NextResponse.json({ error: 'Handle already taken' }, { status: 400 });
      }
    }

    // Update or insert profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        handle: handle || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 