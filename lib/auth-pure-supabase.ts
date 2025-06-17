import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Initialize Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client with service role key
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  is_verified: boolean;
  email_verified: boolean;
  profile_complete: boolean;
  is_banned?: boolean;
  post_karma?: number;
  comment_karma?: number;
  joined_communities?: string[];
  saved_posts?: string[];
  bio?: string;
  engineering_discipline?: string;
  company?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  github_username?: string;
  linkedin_username?: string;
  experience_level?: string;
  job_title?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: {
    user: AuthUser;
    expires: string;
  };
  error?: string;
  redirect?: string;
}

// Get current authenticated user
export async function getAuthUser(): Promise<AuthResult> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return {
        success: false,
        error: 'Session error',
        redirect: '/signin',
      };
    }

    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated',
        redirect: '/signin',
      };
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return {
        success: false,
        error: 'Profile not found',
        redirect: '/onboard',
      };
    }

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
        redirect: '/onboard',
      };
    }

    const user: AuthUser = {
      id: profile.id,
      email: profile.email || session.user.email!,
      username: profile.username,
      display_name: profile.display_name,
      plan: profile.plan || 'FREE',
      is_verified: profile.is_verified || false,
      email_verified: session.user.email_confirmed_at ? true : false,
      profile_complete: profile.profile_complete || false,
      is_banned: profile.is_banned || false,
      post_karma: profile.post_karma || 0,
      comment_karma: profile.comment_karma || 0,
      joined_communities: profile.joined_communities || [],
      saved_posts: profile.saved_posts || [],
      bio: profile.bio,
      engineering_discipline: profile.engineering_discipline,
      company: profile.company,
      avatar_url: profile.avatar_url,
      location: profile.location,
      website: profile.website,
      github_username: profile.github_username,
      linkedin_username: profile.linkedin_username,
      experience_level: profile.experience_level,
      job_title: profile.job_title,
    };

    return {
      success: true,
      user,
      session: {
        user,
        expires: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      success: false,
      error: 'Authentication error',
      redirect: '/signin',
    };
  }
}

// Sign in with email and password
export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, user: null };
  }

  return { user: data.user, error: null };
}

// Sign up with email and password
export async function signUpWithPassword(email: string, password: string, userData?: {
  username?: string;
  display_name?: string;
  engineering_discipline?: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData || {},
    },
  });

  if (error) {
    return { error: error.message, user: null };
  }

  return { user: data.user, error: null };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  return { error: error?.message || null };
}

// Update password
export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message || null };
}

// Get session client-side
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

// Listen to auth changes
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// Client-side auth hooks interface
export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
} 