/**
 * Database Client for Eng.com
 * 
 * Centralized database access using Prisma for Google Cloud SQL
 * This provides type-safe database operations that Cursor can analyze and debug
 */

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Global Prisma instance for Next.js hot reload compatibility
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma client with optimizations
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

  // Add Prisma Accelerate if URL provided
  if (process.env.PRISMA_ACCELERATE_URL) {
    return client.$extends(withAccelerate());
  }

  return client;
};

// Singleton pattern for Prisma client
export const db = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = db;
}

// Database helper functions for common operations
export class DatabaseOperations {
  
  // Profile operations
  static async getProfileByHandle(handle: string) {
    return await db.profile.findUnique({
      where: { handle },
      include: {
        ownedProjects: {
          where: { isPublic: true },
          take: 10,
          orderBy: { updatedAt: 'desc' },
          include: {
            _count: {
              select: { likes: true, comments: true }
            }
          }
        },
        _count: {
          select: {
            ownedProjects: true,
            posts: true,
            comments: true,
            followers: true,
            following: true
          }
        }
      }
    });
  }

  static async updateProfile(id: string, data: any) {
    return await db.profile.update({
      where: { id },
      data,
    });
  }

  // Project operations
  static async createProject(data: any) {
    const project = await db.project.create({
      data: {
        ...data,
        currentVersion: {
          create: {
            versionNo: 1,
            versionNumber: '1.0.0',
            readmeMd: data.readme,
            files: data.files || [],
          }
        }
      },
      include: {
        owner: true,
        currentVersion: true,
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });

    // Update project count for owner
    await db.profile.update({
      where: { id: data.ownerId },
      data: {
        projectCount: { increment: 1 }
      }
    });

    return project;
  }

  static async getProjectById(id: string) {
    return await db.project.findUnique({
      where: { id },
      include: {
        owner: true,
        versions: {
          orderBy: { versionNo: 'desc' },
          take: 5
        },
        currentVersion: true,
        comments: {
          include: {
            user: true,
            replies: {
              include: { user: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        likes: {
          include: { user: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });
  }

  static async getPublicProjects(filters: {
    discipline?: string;
    projectType?: string;
    complexityLevel?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const {
      discipline,
      projectType,
      complexityLevel,
      tags,
      search,
      limit = 20,
      offset = 0
    } = filters;

    const where: any = {
      isPublic: true,
    };

    if (discipline) where.engineeringDiscipline = discipline;
    if (projectType) where.projectType = projectType;
    if (complexityLevel) where.complexityLevel = complexityLevel;
    if (tags?.length) {
      where.tags = {
        hasSome: tags
      };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
        { technologies: { hasSome: [search] } },
        { materials: { hasSome: [search] } }
      ];
    }

    return await db.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { updatedAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });
  }

  // Community operations
  static async getCommunityByName(name: string) {
    return await db.community.findUnique({
      where: { name },
      include: {
        creator: true,
        memberships: {
          include: { user: true },
          take: 10
        },
        posts: {
          include: {
            author: true,
            _count: {
              select: { comments: true, votes: true }
            }
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 20
        },
        _count: {
          select: { memberships: true, posts: true }
        }
      }
    });
  }

  // Search operations
  static async searchProjects(query: string, limit = 10) {
    return await db.project.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
          { technologies: { hasSome: [query] } }
        ]
      },
      include: {
        owner: {
          select: {
            handle: true,
            displayName: true,
            avatarUrl: true
          }
        }
      },
      take: limit,
      orderBy: { updatedAt: 'desc' }
    });
  }

  static async searchProfiles(query: string, limit = 10) {
    return await db.profile.findMany({
      where: {
        OR: [
          { displayName: { contains: query, mode: 'insensitive' } },
          { handle: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
          { engineeringDiscipline: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        handle: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        engineeringDiscipline: true,
        isVerified: true,
        projectCount: true,
        followerCount: true
      },
      take: limit,
      orderBy: { reputation: 'desc' }
    });
  }

  // Analytics operations
  static async getProjectAnalytics(projectId: string, ownerId: string) {
    // Verify ownership
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true }
    });

    if (!project || project.ownerId !== ownerId) {
      throw new Error('Unauthorized access to project analytics');
    }

    const [viewsToday, totalLikes, totalComments, recentActivity] = await Promise.all([
      // This would require a views table - placeholder for now
      0,
      db.projectLike.count({ where: { projectId } }),
      db.comment.count({ where: { projectId } }),
      db.comment.findMany({
        where: { projectId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return {
      viewsToday,
      totalLikes,
      totalComments,
      recentActivity
    };
  }

  // Health check
  static async healthCheck() {
    try {
      await db.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString() 
      };
    }
  }
}

// Export types for TypeScript
export type {
  Profile,
  Project,
  ProjectVersion,
  Comment,
  Community,
  Post,
  Plan,
  ProjectType,
  ComplexityLevel,
  ProjectStatus
} from '@prisma/client';

// Connection testing utility
export async function testDatabaseConnection() {
  try {
    const result = await DatabaseOperations.healthCheck();
    console.log('Database connection test:', result);
    return result.status === 'healthy';
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default db; 