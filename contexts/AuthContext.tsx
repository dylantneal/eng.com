'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { AuthUser, UseAuthResult } from '@/lib/auth-middleware';

const AuthContext = createContext<UseAuthResult | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [error, setError] = useState<string | null>(null);

  // Convert NextAuth session to our AuthUser type
  const user: AuthUser | null = session?.user ? {
    id: (session.user as any).id,
    email: session.user.email!,
    username: (session.user as any).username,
    display_name: (session.user as any).display_name || session.user.name,
    plan: (session.user as any).plan || 'FREE',
    is_verified: (session.user as any).is_verified || false,
    email_verified: (session.user as any).email_verified || false,
    profile_complete: (session.user as any).profile_complete || false,
    is_banned: (session.user as any).is_banned || false,
  } : null;

  const loading = status === 'loading';

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        action: 'signin',
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (!result?.ok) {
        throw new Error('Sign in failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const signUp = async (email: string, password: string, userData?: any): Promise<any> => {
    try {
      setError(null);
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        action: 'signup',
        userData: userData ? JSON.stringify(userData) : undefined,
        redirect: false,
      });

      if (result?.error) {
        return { error: { message: result.error }, user: null };
      }

      if (!result?.ok) {
        return { error: { message: 'Sign up failed' }, user: null };
      }

      return { user: result, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      return { error: { message: errorMessage }, user: null };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await nextAuthSignOut({ redirect: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refetch = async (): Promise<void> => {
    try {
      setError(null);
      await update();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh session';
      setError(errorMessage);
    }
  };

  // Clear error when session changes
  useEffect(() => {
    if (session) {
      setError(null);
    }
  }, [session]);

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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): UseAuthResult {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convenience hooks for common auth checks
export function useAuthUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth();
  return !loading && !!user;
}

export function useRequireAuth(): AuthUser {
  const { user, loading } = useAuth();
  
  if (loading) {
    throw new Error('Auth is still loading');
  }
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Plan-based access hooks
export function useCanCreateProject(): boolean {
  const { user } = useAuth();
  if (!user) return false;
  
  // TODO: Check current project count from API
  return !user.is_banned;
}

export function useCanAccessMarketplace(): boolean {
  const { user } = useAuth();
  if (!user) return false;
  
  return user.is_verified && user.profile_complete;
}

export function useIsVerified(): boolean {
  const { user } = useAuth();
  return !!user?.is_verified;
}

export function useIsPro(): boolean {
  const { user } = useAuth();
  return user?.plan === 'PRO' || user?.plan === 'ENTERPRISE';
} 