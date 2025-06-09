import { createClient } from '@supabase/supabase-js';

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