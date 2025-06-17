'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  supabase, 
  AuthUser, 
  UseAuthResult, 
  signInWithPassword, 
  signUpWithPassword, 
  signOut as authSignOut,
  getSession 
} from '@/lib/auth-pure-supabase';
import type { Session } from '@supabase/supabase-js';

const SupabaseAuthContext = createContext<UseAuthResult | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile from database
  const loadUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Profile loading error:', error);
        return null;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      return {
        id: profile.id,
        email: profile.email || session?.user?.email || '',
        username: profile.username,
        display_name: profile.display_name,
        plan: profile.plan || 'FREE',
        is_verified: profile.is_verified || false,
        email_verified: session?.user?.email_confirmed_at ? true : false,
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
    } catch (err) {
      console.error('Error loading user profile:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { session } = await getSession();
        
        if (session?.user) {
          const userProfile = await loadUserProfile(session.user.id);
          if (mounted) {
            setUser(userProfile);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await loadUserProfile(session.user.id);
          setUser(userProfile);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Refresh user profile data
          const userProfile = await loadUserProfile(session.user.id);
          setUser(userProfile);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      const { user: authUser, error: authError } = await signInWithPassword(email, password);
      
      if (authError) {
        throw new Error(authError);
      }

      if (!authUser) {
        throw new Error('Sign in failed');
      }

      // User state will be updated by the auth state change listener
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData?: any): Promise<any> => {
    try {
      setError(null);
      setLoading(true);
      
      const { user: authUser, error: authError } = await signUpWithPassword(email, password, userData);
      
      if (authError) {
        return { error: { message: authError }, user: null };
      }

      return { user: authUser, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      return { error: { message: errorMessage }, user: null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await authSignOut();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refetch = async (): Promise<void> => {
    try {
      setError(null);
      const { session } = await getSession();
      
      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id);
        setUser(userProfile);
      } else {
        setUser(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh session';
      setError(errorMessage);
    }
  };

  const value: UseAuthResult = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refetch,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
} 