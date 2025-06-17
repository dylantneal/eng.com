/**
 * Server-side Supabase Authentication Utilities
 * Replacement for NextAuth's getServerSession
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from './auth';

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * Get the current authenticated user on the server side
 * This replaces NextAuth's getServerSession
 */
export async function getServerAuth(): Promise<{
  user: User | null;
  session: AuthSession | null;
  supabase: ReturnType<typeof createServerClient>;
}> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    }
  );

  try {
    // Get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return { user: null, session: null, supabase };
    }

    // Get the user's profile from the database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        username,
        display_name,
        avatar_url,
        bio,
        location,
        website,
        github_username,
        linkedin_username,
        engineering_discipline,
        experience_level,
        company,
        job_title,
        post_karma,
        comment_karma,
        is_verified,
        is_pro,
        joined_communities,
        saved_posts,
        preferences,
        created_at,
        last_active
      `)
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      console.warn('Profile not found for authenticated user:', authUser.id);
      // Return basic user info even if profile is missing
      const basicUser: User = {
        id: authUser.id,
        email: authUser.email || '',
        username: authUser.email?.split('@')[0] || 'user',
        display_name: authUser.email?.split('@')[0] || 'User',
        created_at: authUser.created_at || new Date().toISOString(),
        last_active: new Date().toISOString(),
        post_karma: 0,
        comment_karma: 0,
        is_verified: false,
        is_pro: false,
        joined_communities: [],
        saved_posts: [],
        preferences: {
          theme: 'dark',
          email_notifications: true,
          push_notifications: true,
          show_online_status: true,
          public_profile: true,
          allow_dm: true,
          feed_algorithm: 'personalized',
          favorite_communities: [],
          blocked_users: [],
          nsfw_content: false,
        },
      };

      return { 
        user: basicUser, 
        session: {
          user: basicUser,
          access_token: '',
          refresh_token: '',
          expires_at: 0,
        }, 
        supabase 
      };
    }

    // Convert profile to User type
    const user: User = {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      github_username: profile.github_username,
      linkedin_username: profile.linkedin_username,
      engineering_discipline: profile.engineering_discipline,
      experience_level: profile.experience_level,
      company: profile.company,
      job_title: profile.job_title,
      created_at: profile.created_at,
      last_active: profile.last_active,
      post_karma: profile.post_karma,
      comment_karma: profile.comment_karma,
      is_verified: profile.is_verified,
      is_pro: profile.is_pro,
      joined_communities: profile.joined_communities,
      saved_posts: profile.saved_posts,
      preferences: profile.preferences,
    };

    // Get session data from Supabase auth
    const { data: { session: supabaseSession } } = await supabase.auth.getSession();
    
    const session: AuthSession = {
      user,
      access_token: supabaseSession?.access_token || '',
      refresh_token: supabaseSession?.refresh_token || '',
      expires_at: supabaseSession?.expires_at || 0,
    };

    return { user, session, supabase };

  } catch (error) {
    console.error('Server auth error:', error);
    return { user: null, session: null, supabase };
  }
}

/**
 * Require authentication on the server side
 * Throws an error if user is not authenticated
 */
export async function requireServerAuth(): Promise<{
  user: User;
  session: AuthSession;
  supabase: ReturnType<typeof createServerClient>;
}> {
  const { user, session, supabase } = await getServerAuth();
  
  if (!user || !session) {
    throw new Error('Authentication required');
  }
  
  return { user, session, supabase };
}

/**
 * Check if user has specific permissions
 */
export async function checkPermission(
  userId: string, 
  resource: string, 
  action: string
): Promise<boolean> {
  // Implement your permission logic here
  // For now, return true for authenticated users
  return true;
}

/**
 * Legacy compatibility - mimics NextAuth session structure
 * Use this for gradual migration
 */
export async function getServerSession() {
  const { user, session } = await getServerAuth();
  
  if (!user) return null;
  
  // Return NextAuth-compatible session structure
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.display_name,
      image: user.avatar_url,
    },
    expires: new Date(session?.expires_at || 0).toISOString(),
  };
}

/**
 * Admin check utility
 */
export async function requireAdmin(): Promise<{
  user: User;
  session: AuthSession;
  supabase: ReturnType<typeof createServerClient>;
}> {
  const { user, session, supabase } = await requireServerAuth();
  
  // Check if user is admin (you can modify this logic)
  if (!user.is_verified) {
    throw new Error('Admin access required');
  }
  
  return { user, session, supabase };
} 