import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Re-export authOptions for consistency
export { authOptions } from '@/lib/authOptions';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Listen to authentication state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Get Supabase client instance
 */
export function getSupabaseClient() {
  return supabase;
}

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  interests?: string;
  location?: string;
  website?: string;
  github_username?: string;
  linkedin_username?: string;
  engineering_discipline?: string;
  experience_level?: 'student' | 'entry' | 'mid' | 'senior' | 'expert';
  company?: string;
  job_title?: string;
  created_at: string;
  last_active: string;
  post_karma: number;
  comment_karma: number;
  is_verified: boolean;
  is_pro: boolean;
  joined_communities: string[];
  saved_posts: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  push_notifications: boolean;
  show_online_status: boolean;
  public_profile: boolean;
  allow_dm: boolean;
  feed_algorithm: 'hot' | 'new' | 'top' | 'personalized';
  favorite_communities: string[];
  blocked_users: string[];
  nsfw_content: boolean;
}

// Authentication functions
export async function signUp(email: string, password: string, userData: Partial<User>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          display_name: userData.display_name,
          avatar_url: userData.avatar_url,
          bio: userData.bio,
          interests: userData.interests,
          engineering_discipline: userData.engineering_discipline,
          experience_level: userData.experience_level,
        },
      },
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) return null;
    return profile as User;
  } catch (error) {
    return null;
  }
}

// Utility to handle fetch with JSON
async function fetchJson(url: string, options: RequestInit) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw data?.error || new Error(`Request failed: ${res.status}`);
  }
  return data;
}

/**
 * Vote on a post (upvote or downvote).
 * Wraps the API route `/api/posts/[postId]/vote`.
 */
export async function voteOnPost(
  userId: string,
  postId: string,
  voteType: 'upvote' | 'downvote'
) {
  try {
    const data = await fetchJson(`/api/posts/${postId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, vote_type: voteType === 'upvote' ? 'up' : 'down' }),
    });
    return { success: true, ...data };
  } catch (error) {
    console.error('voteOnPost error', error);
    return { success: false, error };
  }
}

/**
 * Save a post for a user.
 * Currently updates the `saved_posts` array column in the `profiles` table.
 */
export async function savePost(
  userId: string,
  postId: string,
  _communityId?: string,
  _tags?: string[]
) {
  try {
    // Get current saved posts
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('saved_posts')
      .eq('id', userId)
      .single();

    if (profileErr) throw profileErr;

    const current: string[] = profile?.saved_posts || [];
    if (current.includes(postId)) {
      return { success: true, message: 'Already saved' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ saved_posts: [...current, postId] })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('savePost error', error);
    return { success: false, error };
  }
}

/**
 * Remove a saved post from the user profile.
 */
export async function unsavePost(userId: string, postId: string) {
  try {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('saved_posts')
      .eq('id', userId)
      .single();
    if (profileErr) throw profileErr;
    const current: string[] = profile?.saved_posts || [];
    if (!current.includes(postId)) return { success: true, message: 'Not saved' };

    const { error } = await supabase
      .from('profiles')
      .update({ saved_posts: current.filter((id) => id !== postId) })
      .eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('unsavePost error', error);
    return { success: false, error };
  }
}

/**
 * Join a community by adding the community ID to the user's `joined_communities` array.
 */
export async function joinCommunity(userId: string, communityId: string) {
  try {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('joined_communities')
      .eq('id', userId)
      .single();
    if (profileErr) throw profileErr;

    const current: string[] = profile?.joined_communities || [];
    if (current.includes(communityId)) {
      return { success: true, message: 'Already a member' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ joined_communities: [...current, communityId] })
      .eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('joinCommunity error', error);
    return { success: false, error };
  }
}

/**
 * Leave a community by removing the community ID from the user's `joined_communities` array.
 */
export async function leaveCommunity(userId: string, communityId: string) {
  try {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('joined_communities')
      .eq('id', userId)
      .single();
    if (profileErr) throw profileErr;

    const current: string[] = profile?.joined_communities || [];
    if (!current.includes(communityId)) {
      return { success: true, message: 'Not a member' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ joined_communities: current.filter((id) => id !== communityId) })
      .eq('id', userId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('leaveCommunity error', error);
    return { success: false, error };
  }
}

/**
 * Check if a user is a member of a community.
 */
export async function isUserMemberOfCommunity(userId: string, communityId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('joined_communities')
      .eq('id', userId)
      .single();
    if (error) throw error;
    const current: string[] = profile?.joined_communities || [];
    return current.includes(communityId);
  } catch (error) {
    console.error('isUserMemberOfCommunity error', error);
    return false;
  }
}

/**
 * Retrieve the posts a user has saved.
 */
export async function getUserSavedPosts(userId: string) {
  try {
    // Assuming a table named `post_details` view or join to get full post data.
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`id, saved_at:created_at, post:posts(*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, posts: data };
  } catch (error) {
    console.error('getUserSavedPosts error', error);
    return { success: false, error };
  }
}

/**
 * Retrieve the communities a user has joined along with membership metadata.
 */
export async function getUserCommunities(userId: string) {
  try {
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('joined_communities')
      .eq('id', userId)
      .single();
    if (profileErr) throw profileErr;

    const joined: string[] = profile?.joined_communities || [];
    if (joined.length === 0) return { success: true, communities: [] };

    const { data: communities, error } = await supabase
      .from('communities')
      .select('*')
      .in('id', joined);
    if (error) throw error;

    // Map to membership objects similar to expected by UI
    const enriched = communities.map((c) => ({
      id: `${userId}-${c.id}`,
      joined_at: '',
      role: 'member',
      community: c,
    }));

    return { success: true, communities: enriched };
  } catch (error) {
    console.error('getUserCommunities error', error);
    return { success: false, error };
  }
}

// Helper: returns the session or throws 401 (for server actions)
export async function requireUserSession() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.id) {
    throw new Error('Unauthenticated');
  }
  return session;
} 