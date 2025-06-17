import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';
import { createClient } from '@/lib/supabase/server';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = session.user.id;

    // Delete user data in the correct order (to handle foreign key constraints)
    
    // 1. Delete project-related data
    await supabase.from('project_versions').delete().eq('user_id', userId);
    await supabase.from('comments').delete().eq('user_id', userId);
    await supabase.from('project_likes').delete().eq('user_id', userId);
    await supabase.from('projects').delete().eq('owner_id', userId);

    // 2. Delete community data
    await supabase.from('posts').delete().eq('author_id', userId);
    await supabase.from('comment_votes').delete().eq('user_id', userId);

    // 3. Delete bookmarks
    await supabase.from('bookmarks').delete().eq('user_id', userId);

    // 4. Delete payments
    await supabase.from('payments').delete().eq('user_id', userId);

    // 9. Finally, delete the profile (this should cascade to auth.users)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }

    // 10. Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Error deleting auth user:', authError);
      // Profile is already deleted, so this is not a critical failure
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 