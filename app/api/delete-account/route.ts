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

    const body = await request.json();
    const { confirmationText } = body;

    // Require confirmation
    if (confirmationText !== 'DELETE MY ACCOUNT') {
      return NextResponse.json({ 
        error: 'Invalid confirmation text. Please type "DELETE MY ACCOUNT" exactly.' 
      }, { status: 400 });
    }

    const supabase = supabaseServerAdmin();
    
    // Get user profile before deletion for logging
    const { data: profile } = await supabase
      .from('profiles')
      .select('handle, name, email')
      .eq('id', session.user.id)
      .single();

    // Delete user's projects first (if any)
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', session.user.id);

    if (projectsError) {
      console.error('Error deleting projects:', projectsError);
      // Don't fail the account deletion for this, just log it
    }

    // Delete user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', session.user.id);

    if (profileError) {
      console.error('Profile deletion error:', profileError);
      return NextResponse.json({ 
        error: 'Failed to delete profile',
        details: profileError.message 
      }, { status: 500 });
    }

    // Delete from Supabase Auth (this is the main user record)
    const { error: authUserError } = await supabase.auth.admin.deleteUser(session.user.id);

    if (authUserError) {
      console.error('Auth user deletion error:', authUserError);
      return NextResponse.json({ 
        error: 'Failed to delete authentication account',
        details: authUserError.message 
      }, { status: 500 });
    }

    // Also clean up any NextAuth adapter tables if they exist
    try {
      await supabase.from('users').delete().eq('id', session.user.id);
      await supabase.from('accounts').delete().eq('userId', session.user.id);  
      await supabase.from('sessions').delete().eq('userId', session.user.id);
    } catch (error) {
      // These tables might not exist, so don't fail the deletion
      console.log('NextAuth tables cleanup (optional):', error);
    }

    // Log the account deletion for audit purposes
    console.log(`Account deleted: ${profile?.email || session.user.email} (${profile?.handle || 'no-handle'}) at ${new Date().toISOString()}`);

    return NextResponse.json({ 
      message: 'Account deleted successfully',
      deletedUser: {
        email: profile?.email || session.user.email,
        handle: profile?.handle,
        name: profile?.name
      }
    });
    
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 