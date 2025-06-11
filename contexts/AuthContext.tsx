'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getCurrentUser, signIn, signUp, signOut, onAuthStateChange, getSupabaseClient } from '@/lib/auth';

interface AuthContextType {
  /* Auth state */
  user: User | null;
  loading: boolean;

  /* Basic auth helpers (legacy names kept for compatibility) */
  signIn: (email: string, password: string) => Promise<{ user: any; session?: any; error: any }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ user: any; session?: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;

  /* Aliases expected by older components */
  login: (email: string, password: string) => Promise<{ user: any; session?: any; error: any }>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<{ user: any; session?: any; error: any }>;

  /* Modal state (login / signup) */
  showLoginModal: boolean;
  showSignupModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  setShowSignupModal: (show: boolean) => void;

  /* Utility */
  requireAuth: () => Promise<boolean>; // returns true if signed in, false otherwise
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // local modal state for UI components
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const userData = await getCurrentUser();
      setUser(userData);
      console.log('✅ User data refreshed:', userData ? 'User found' : 'No user');
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setUser(null);
    }
  };

  // Load user on mount
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        console.log('🔄 Loading initial user...');
        const userData = await getCurrentUser();
        
        if (mounted) {
          setUser(userData);
          setLoading(false);
          console.log('✅ Initial user loaded:', userData ? 'User found' : 'No user');
        }
      } catch (error) {
        console.error('❌ Error loading initial user:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    console.log('🔄 Setting up auth state listener...');
    
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ User signed in, refreshing user data...');
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        console.log('✅ User signed out, clearing user data...');
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 Token refreshed, updating user data...');
        await refreshUser();
      }
    });

    return () => {
      console.log('🔄 Cleaning up auth state listener...');
      subscription.unsubscribe();
    };
  }, []);

  // Wrapper functions that refresh user data after auth operations
  const handleSignIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Signing in...');
      const result = await signIn(email, password);
      
      if (result.user && !result.error) {
        console.log('✅ Sign in successful, refreshing user...');
        await refreshUser();
      }
      
      return result;
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { user: null, session: null, error };
    }
  };

  const handleSignUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      console.log('🔄 Signing up...');
      const result = await signUp(email, password, userData);
      
      if (result.user && !result.error) {
        console.log('✅ Sign up successful, refreshing user...');
        await refreshUser();
      }
      
      return result;
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { user: null, error };
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🔄 Signing out...');
      const result = await signOut();
      
      if (!result.error) {
        console.log('✅ Sign out successful');
        setUser(null);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { error };
    }
  };

  // Utility to ensure user is logged in; if not, open login modal and return false
  const requireAuth = async () => {
    if (user) return true;
    setShowLoginModal(true);
    return false;
  };

  const value: AuthContextType = {
    user,
    loading,

    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUser,

    login: handleSignIn,
    register: handleSignUp,

    showLoginModal,
    showSignupModal,
    setShowLoginModal,
    setShowSignupModal,

    requireAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 