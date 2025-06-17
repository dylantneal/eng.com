/**
 * Comprehensive Authorization Middleware for eng.com
 * Provides server-side and client-side auth utilities with proper error handling
 */

import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authOptions } from './authOptions';

// Types for authorization
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
  // Additional profile fields
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

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
  redirect?: string;
}

// Add after the existing interfaces
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
}

// Create Supabase client for server operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Server-side authentication check
 * Use this in API routes and server components
 */
export async function getAuthUser(): Promise<AuthResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return {
        success: false,
        error: 'No active session',
        redirect: '/signin',
      };
    }

    // Get fresh user data from database
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id,
        email,
        username,
        display_name,
        plan,
        is_verified,
        profile_complete,
        is_banned,
        post_karma,
        comment_karma,
        joined_communities,
        saved_posts,
        bio,
        engineering_discipline,
        company,
        avatar_url,
        location,
        website,
        github_username,
        linkedin_username,
        experience_level,
        job_title
      `)
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        error: 'User profile not found',
        redirect: '/auth/complete-profile',
      };
    }

    // Check if user is banned
    if (profile.is_banned) {
      return {
        success: false,
        error: 'Account has been suspended',
        redirect: '/auth/suspended',
      };
    }

    const user: AuthUser = {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      display_name: profile.display_name,
      plan: profile.plan || 'FREE',
      is_verified: profile.is_verified || false,
      email_verified: true, // NextAuth ensures this
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
        expires: session.expires,
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

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes where auth is mandatory
 */
export async function requireAuth(): Promise<AuthUser> {
  const authResult = await getAuthUser();
  
  if (!authResult.success || !authResult.user) {
    throw new Error(authResult.error || 'Authentication required');
  }
  
  return authResult.user;
}

/**
 * Check if user has specific permissions
 */
export async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const authResult = await getAuthUser();
  
  if (!authResult.success || !authResult.user) {
    return false;
  }

  const user = authResult.user;

  // Basic permission logic - extend as needed
  switch (resource) {
    case 'admin':
      return user.is_verified && user.plan !== 'FREE';
    
    case 'project':
      if (action === 'create') {
        return !user.is_banned;
      }
      if (action === 'edit' || action === 'delete') {
        // Check if user owns the project (would need project ID)
        return user.id === userId;
      }
      return true; // Read access
    
    case 'marketplace':
      if (action === 'sell') {
        return user.is_verified && user.profile_complete;
      }
      if (action === 'buy') {
        return !user.is_banned;
      }
      return true;
    
    case 'comment':
      return !user.is_banned;
    
    default:
      return true;
  }
}

/**
 * API Route Authorization Wrapper
 * Use this to wrap API route handlers with auth
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser, ...args: any[]) => Promise<NextResponse>,
  options: {
    required?: boolean;
    adminOnly?: boolean;
    verifiedOnly?: boolean;
    proOnly?: boolean;
  } = { required: true }
) {
  return async function(request: NextRequest, ...args: any[]): Promise<NextResponse> {
    try {
      const authResult = await getAuthUser();
      
      if (options.required && !authResult.success) {
        return NextResponse.json(
          { error: authResult.error || 'Authentication required' },
          { status: 401 }
        );
      }

      const user = authResult.user;

      if (user) {
        // Check additional requirements
        if (options.adminOnly && !user.is_verified) {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
        }

        if (options.verifiedOnly && !user.is_verified) {
          return NextResponse.json(
            { error: 'Verified account required' },
            { status: 403 }
          );
        }

        if (options.proOnly && user.plan === 'FREE') {
          return NextResponse.json(
            { error: 'Pro subscription required' },
            { status: 403 }
          );
        }

        if (user.is_banned) {
          return NextResponse.json(
            { error: 'Account suspended' },
            { status: 403 }
          );
        }
      }

      return await handler(request, user!, ...args);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Resource-specific authorization checks
 */
export class AuthorizationService {
  static async canAccessProject(projectId: string, userId?: string): Promise<boolean> {
    if (!projectId) return false;

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('owner_id, is_public')
      .eq('id', projectId)
      .single();

    if (!project) return false;

    // Public projects are accessible to everyone
    if (project.is_public) return true;

    // Private projects require ownership
    return project.owner_id === userId;
  }

  static async canEditProject(projectId: string, userId: string): Promise<boolean> {
    if (!projectId || !userId) return false;

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    return project?.owner_id === userId;
  }

  static async canAccessCommunity(communityId: string, userId?: string): Promise<boolean> {
    if (!communityId) return false;

    const { data: community } = await supabaseAdmin
      .from('communities')
      .select('is_private')
      .eq('id', communityId)
      .single();

    if (!community) return false;

    // Public communities are accessible to everyone
    if (!community.is_private) return true;

    // Private communities require membership
    if (!userId) return false;

    const { data: membership } = await supabaseAdmin
      .from('community_memberships')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    return !!membership;
  }

  static async isProjectOwner(projectId: string, userId: string): Promise<boolean> {
    if (!projectId || !userId) return false;

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    return project?.owner_id === userId;
  }

  static async isCommunityModerator(communityId: string, userId: string): Promise<boolean> {
    if (!communityId || !userId) return false;

    const { data: membership } = await supabaseAdmin
      .from('community_memberships')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();

    return membership?.role === 'moderator' || membership?.role === 'admin';
  }
}

/**
 * Plan-based feature access
 */
export class PlanService {
  static readonly PLAN_LIMITS = {
    FREE: {
      projects: 3,
      privateProjects: 0,
      storage: 100, // MB
      collaborators: 0,
      marketplace: false,
    },
    PRO: {
      projects: 50,
      privateProjects: 10,
      storage: 10000, // MB
      collaborators: 5,
      marketplace: true,
    },
    ENTERPRISE: {
      projects: -1, // unlimited
      privateProjects: -1, // unlimited
      storage: -1, // unlimited
      collaborators: -1, // unlimited
      marketplace: true,
    },
  };

  static canCreateProject(plan: string, currentCount: number): boolean {
    const limits = this.PLAN_LIMITS[plan as keyof typeof this.PLAN_LIMITS];
    return limits.projects === -1 || currentCount < limits.projects;
  }

  static canCreatePrivateProject(plan: string, currentPrivateCount: number): boolean {
    const limits = this.PLAN_LIMITS[plan as keyof typeof this.PLAN_LIMITS];
    return limits.privateProjects === -1 || currentPrivateCount < limits.privateProjects;
  }

  static canAccessMarketplace(plan: string): boolean {
    const limits = this.PLAN_LIMITS[plan as keyof typeof this.PLAN_LIMITS];
    return limits.marketplace;
  }
}

/**
 * Client-side auth hook types
 */
export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

// Add RBAC service
export class RBACService {
  static async getUserRoles(userId: string): Promise<Role[]> {
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select(`
        role:roles(
          id,
          name,
          permissions
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Properly handle the nested role data
    if (!data) return [];
    
    return data
      .filter(item => item.role)
      .map(item => ({
        id: item.role.id,
        name: item.role.name,
        permissions: item.role.permissions || []
      }));
  }

  static async hasPermission(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    const permissions = roles.flatMap(r => r.permissions);
    return permissions.includes(`${resource}:${action}`);
  }

  static async logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    await supabaseAdmin.from('audit_logs').insert({
      ...log,
      timestamp: new Date().toISOString()
    });
  }
} 