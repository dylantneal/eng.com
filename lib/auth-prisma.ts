import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Re-export authOptions for consistency
export { authOptions } from '@/lib/authOptions';

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

// Authentication functions using Prisma
export async function signUp(email: string, password: string, userData: Partial<User>) {
  try {
    // Check if user already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user profile
    const user = await prisma.profile.create({
      data: {
        email: email.toLowerCase().trim(),
        username: userData.username || email.split('@')[0],
        handle: userData.username || email.split('@')[0],
        displayName: userData.display_name || userData.username || email.split('@')[0],
        bio: userData.bio,
        avatarUrl: userData.avatar_url,
        engineeringDiscipline: userData.engineering_discipline,
        experienceLevel: userData.experience_level,
        company: userData.company,
        location: userData.location,
        website: userData.website,
        githubUsername: userData.github_username,
        linkedinUsername: userData.linkedin_username,
      }
    });

    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // This would need to be integrated with your session management
    // For now, returning null - this will be updated when we integrate with NextAuth
    return null;
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
 * Uses Prisma instead of Supabase.
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
 * Save a post for a user using Prisma.
 */
export async function savePost(
  userId: string,
  postId: string,
  _communityId?: string,
  _tags?: string[]
) {
  try {
    // Get current saved posts
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { savedPosts: true }
    });

    if (!profile) {
      throw new Error('User not found');
    }

    const current: string[] = profile.savedPosts || [];
    if (current.includes(postId)) {
      return { success: true, message: 'Already saved' };
    }

    // Update saved posts
    await prisma.profile.update({
      where: { id: userId },
      data: { savedPosts: [...current, postId] }
    });

    return { success: true };
  } catch (error) {
    console.error('savePost error', error);
    return { success: false, error };
  }
}

/**
 * Remove a saved post from the user profile using Prisma.
 */
export async function unsavePost(userId: string, postId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { savedPosts: true }
    });

    if (!profile) {
      throw new Error('User not found');
    }

    const current: string[] = profile.savedPosts || [];
    if (!current.includes(postId)) {
      return { success: true, message: 'Not saved' };
    }

    await prisma.profile.update({
      where: { id: userId },
      data: { savedPosts: current.filter((id) => id !== postId) }
    });

    return { success: true };
  } catch (error) {
    console.error('unsavePost error', error);
    return { success: false, error };
  }
}

/**
 * Join a community using Prisma.
 */
export async function joinCommunity(userId: string, communityId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { joinedCommunities: true }
    });

    if (!profile) {
      throw new Error('User not found');
    }

    const current: string[] = profile.joinedCommunities || [];
    if (current.includes(communityId)) {
      return { success: true, message: 'Already a member' };
    }

    await prisma.profile.update({
      where: { id: userId },
      data: { joinedCommunities: [...current, communityId] }
    });

    return { success: true };
  } catch (error) {
    console.error('joinCommunity error', error);
    return { success: false, error };
  }
}

/**
 * Leave a community using Prisma.
 */
export async function leaveCommunity(userId: string, communityId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { joinedCommunities: true }
    });

    if (!profile) {
      throw new Error('User not found');
    }

    const current: string[] = profile.joinedCommunities || [];
    if (!current.includes(communityId)) {
      return { success: true, message: 'Not a member' };
    }

    await prisma.profile.update({
      where: { id: userId },
      data: { joinedCommunities: current.filter((id) => id !== communityId) }
    });

    return { success: true };
  } catch (error) {
    console.error('leaveCommunity error', error);
    return { success: false, error };
  }
}

/**
 * Check if a user is a member of a community using Prisma.
 */
export async function isUserMemberOfCommunity(userId: string, communityId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { joinedCommunities: true }
    });

    if (!profile) return false;

    const current: string[] = profile.joinedCommunities || [];
    return current.includes(communityId);
  } catch (error) {
    console.error('isUserMemberOfCommunity error', error);
    return false;
  }
}

/**
 * Retrieve the posts a user has saved using Prisma.
 */
export async function getUserSavedPosts(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { savedPosts: true }
    });

    if (!profile) {
      throw new Error('User not found');
    }

    // Get post details for saved post IDs
    const posts = await prisma.post.findMany({
      where: { id: { in: profile.savedPosts } },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, posts };
  } catch (error) {
    console.error('getUserSavedPosts error', error);
    return { success: false, error };
  }
}

/**
 * Retrieve the communities a user has joined using Prisma.
 */
export async function getUserCommunities(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { joinedCommunities: true }
    });

    if (!profile) {
      throw new Error('User not found');
    }

    const joined: string[] = profile.joinedCommunities || [];
    if (joined.length === 0) return { success: true, communities: [] };

    const communities = await prisma.community.findMany({
      where: { id: { in: joined } }
    });

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

// Debug/Dev utility stubs
export async function testSupabaseConnection() {
  // Test Prisma connection instead
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: 'Prisma connection test successful.' };
  } catch (error) {
    return { success: false, message: 'Prisma connection test failed.', error };
  }
}

export async function clearBrowserSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    window.sessionStorage.clear();
  }
  return { success: true, message: 'Browser session cleared.' };
} 