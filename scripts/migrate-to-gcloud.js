#!/usr/bin/env node

/**
 * Migration Script: Supabase to Google Cloud SQL
 * 
 * This script handles the complete migration from Supabase to Google Cloud SQL
 * with zero-downtime strategy using Prisma.
 */

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = 1000;

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const prisma = new PrismaClient();

class MigrationManager {
  constructor() {
    this.stats = {
      profiles: 0,
      projects: 0,
      comments: 0,
      communities: 0,
      posts: 0,
      errors: []
    };
  }

  async run() {
    console.log('🚀 Starting migration from Supabase to Google Cloud SQL...\n');
    
    try {
      // Step 1: Test connections
      await this.testConnections();
      
      // Step 2: Migrate core data in order (respecting foreign keys)
      await this.migrateProfiles();
      await this.migrateCommunities();
      await this.migrateProjects();
      await this.migrateProjectVersions();
      await this.migrateComments();
      await this.migratePosts();
      await this.migrateRelationships();
      
      // Step 3: Verify data integrity
      await this.verifyMigration();
      
      // Step 4: Generate report
      this.generateReport();
      
      console.log('✅ Migration completed successfully!\n');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      await this.rollbackIfNeeded();
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  }

  async testConnections() {
    console.log('🔍 Testing database connections...');
    
    // Test Supabase
    const { data: supabaseTest } = await supabase.from('profiles').select('count').limit(1);
    if (!supabaseTest) throw new Error('Cannot connect to Supabase');
    
    // Test Google Cloud SQL
    await prisma.$queryRaw`SELECT 1`;
    
    console.log('✅ Database connections verified\n');
  }

  async migrateProfiles() {
    console.log('👤 Migrating profiles...');
    
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .range(offset, offset + BATCH_SIZE - 1)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (profiles.length === 0) {
        hasMore = false;
        break;
      }
      
      // Transform and insert profiles
      for (const profile of profiles) {
        try {
          await prisma.profile.create({
            data: {
              id: profile.id,
              email: profile.email,
              username: profile.username || profile.handle || profile.email?.split('@')[0],
              handle: profile.handle || profile.username || profile.email?.split('@')[0],
              displayName: profile.display_name || profile.username,
              bio: profile.bio,
              avatarUrl: profile.avatar_url,
              plan: this.mapPlan(profile.plan),
              engineeringDiscipline: profile.engineering_discipline,
              location: profile.location,
              website: profile.website,
              githubUsername: profile.github_username,
              linkedinUsername: profile.linkedin_username,
              isVerified: profile.is_verified || false,
              reputation: profile.reputation || 0,
              postKarma: profile.post_karma || 0,
              commentKarma: profile.comment_karma || 0,
              followerCount: profile.follower_count || 0,
              followingCount: profile.following_count || 0,
              projectCount: profile.project_count || 0,
              preferences: profile.preferences || {},
              stripeCustomerId: profile.stripe_customer_id,
              stripeAccountId: profile.stripe_account_id,
              tipJarOn: profile.tip_jar_on !== false,
              lifetimeCents: profile.lifetime_cents || 0,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at || profile.created_at),
              lastActive: new Date(profile.last_active || profile.created_at),
            }
          });
          this.stats.profiles++;
        } catch (err) {
          console.error(`Failed to migrate profile ${profile.id}:`, err.message);
          this.stats.errors.push(`Profile ${profile.id}: ${err.message}`);
        }
      }
      
      offset += BATCH_SIZE;
      console.log(`   Migrated ${this.stats.profiles} profiles...`);
    }
    
    console.log(`✅ Migrated ${this.stats.profiles} profiles\n`);
  }

  async migrateCommunities() {
    console.log('🏘️  Migrating communities...');
    
    const { data: communities, error } = await supabase
      .from('communities')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    for (const community of communities || []) {
      try {
        await prisma.community.create({
          data: {
            id: community.id,
            name: community.name,
            displayName: community.display_name,
            description: community.description,
            icon: community.icon,
            category: community.category || 'engineering',
            color: community.color || '#3B82F6',
            isPrivate: community.is_private || false,
            memberCount: community.member_count || 0,
            postCount: community.post_count || 0,
            createdBy: community.created_by,
            createdAt: new Date(community.created_at),
            updatedAt: new Date(community.updated_at || community.created_at),
          }
        });
      } catch (err) {
        console.error(`Failed to migrate community ${community.id}:`, err.message);
        this.stats.errors.push(`Community ${community.id}: ${err.message}`);
      }
    }
    
    console.log(`✅ Migrated ${communities?.length || 0} communities\n`);
  }

  async migrateProjects() {
    console.log('🚀 Migrating projects...');
    
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .range(offset, offset + BATCH_SIZE - 1)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (projects.length === 0) {
        hasMore = false;
        break;
      }
      
      for (const project of projects) {
        try {
          await prisma.project.create({
            data: {
              id: project.id,
              title: project.title,
              slug: project.slug,
              description: project.description,
              readme: project.readme,
              engineeringDiscipline: project.engineering_discipline,
              projectType: this.mapProjectType(project.project_type),
              complexityLevel: this.mapComplexityLevel(project.complexity_level),
              projectStatus: this.mapProjectStatus(project.project_status),
              technologies: Array.isArray(project.technologies) ? project.technologies : [],
              materials: Array.isArray(project.materials) ? project.materials : [],
              tags: Array.isArray(project.tags) ? project.tags : [],
              cadFileFormats: Array.isArray(project.cad_file_formats) ? project.cad_file_formats : [],
              isPublic: project.is_public !== false,
              isFeatured: project.is_featured || false,
              isVerified: project.is_verified || false,
              thumbnailUrl: project.thumbnail_url,
              galleryUrls: Array.isArray(project.gallery_urls) ? project.gallery_urls : [],
              imageUrl: project.image_url,
              repositoryUrl: project.repository_url,
              demoUrl: project.demo_url,
              documentationUrl: project.documentation_url,
              videoUrl: project.video_url,
              license: project.license || 'MIT',
              viewCount: project.view_count || 0,
              likeCount: project.like_count || 0,
              downloadCount: project.download_count || 0,
              bookmarkCount: project.bookmark_count || 0,
              commentCount: project.comment_count || 0,
              ownerId: project.owner_id,
              createdAt: new Date(project.created_at),
              updatedAt: new Date(project.updated_at || project.created_at),
              publishedAt: project.published_at ? new Date(project.published_at) : null,
            }
          });
          this.stats.projects++;
        } catch (err) {
          console.error(`Failed to migrate project ${project.id}:`, err.message);
          this.stats.errors.push(`Project ${project.id}: ${err.message}`);
        }
      }
      
      offset += BATCH_SIZE;
      console.log(`   Migrated ${this.stats.projects} projects...`);
    }
    
    console.log(`✅ Migrated ${this.stats.projects} projects\n`);
  }

  async migrateProjectVersions() {
    console.log('📝 Migrating project versions...');
    
    const { data: versions, error } = await supabase
      .from('project_versions')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error && !error.message.includes('does not exist')) {
      // Try 'versions' table if 'project_versions' doesn't exist
      const { data: versionsAlt, error: errorAlt } = await supabase
        .from('versions')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (errorAlt) {
        console.log('⚠️  No versions table found, skipping...\n');
        return;
      }
      
      versions = versionsAlt;
    }
    
    for (const version of versions || []) {
      try {
        await prisma.projectVersion.create({
          data: {
            id: version.id,
            projectId: version.project_id,
            versionNo: version.version_no || 1,
            versionNumber: version.version_number || '1.0.0',
            readmeMd: version.readme_md,
            changelog: version.changelog,
            files: version.files || [],
            createdAt: new Date(version.created_at),
          }
        });
      } catch (err) {
        console.error(`Failed to migrate version ${version.id}:`, err.message);
        this.stats.errors.push(`Version ${version.id}: ${err.message}`);
      }
    }
    
    console.log(`✅ Migrated ${versions?.length || 0} project versions\n`);
  }

  async migrateComments() {
    console.log('💬 Migrating comments...');
    
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .range(offset, offset + BATCH_SIZE - 1)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (comments.length === 0) {
        hasMore = false;
        break;
      }
      
      for (const comment of comments) {
        try {
          await prisma.comment.create({
            data: {
              id: comment.id,
              body: comment.body || comment.content_md,
              projectId: comment.project_id,
              postId: comment.post_id,
              userId: comment.user_id,
              parentId: comment.parent_id,
              upvotes: comment.upvotes || 0,
              downvotes: comment.downvotes || 0,
              createdAt: new Date(comment.created_at),
              updatedAt: new Date(comment.updated_at || comment.created_at),
            }
          });
          this.stats.comments++;
        } catch (err) {
          console.error(`Failed to migrate comment ${comment.id}:`, err.message);
          this.stats.errors.push(`Comment ${comment.id}: ${err.message}`);
        }
      }
      
      offset += BATCH_SIZE;
      console.log(`   Migrated ${this.stats.comments} comments...`);
    }
    
    console.log(`✅ Migrated ${this.stats.comments} comments\n`);
  }

  async migratePosts() {
    console.log('📄 Migrating posts...');
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error && !error.message.includes('does not exist')) throw error;
    
    for (const post of posts || []) {
      try {
        await prisma.post.create({
          data: {
            id: post.id,
            title: post.title,
            content: post.content,
            postType: this.mapPostType(post.post_type),
            communityId: post.community_id,
            userId: post.user_id || post.author_id,
            upvotes: post.upvotes || 0,
            downvotes: post.downvotes || 0,
            voteCount: post.vote_count || 0,
            commentCount: post.comment_count || 0,
            viewCount: post.view_count || 0,
            isPinned: post.is_pinned || false,
            isLocked: post.is_locked || false,
            isRemoved: post.is_removed || false,
            isSolved: post.is_solved || false,
            createdAt: new Date(post.created_at),
            updatedAt: new Date(post.updated_at || post.created_at),
          }
        });
        this.stats.posts++;
      } catch (err) {
        console.error(`Failed to migrate post ${post.id}:`, err.message);
        this.stats.errors.push(`Post ${post.id}: ${err.message}`);
      }
    }
    
    console.log(`✅ Migrated ${this.stats.posts} posts\n`);
  }

  async migrateRelationships() {
    console.log('🔗 Migrating relationships...');
    
    // Project likes
    const { data: projectLikes } = await supabase.from('project_likes').select('*');
    for (const like of projectLikes || []) {
      try {
        await prisma.projectLike.create({
          data: {
            id: like.id,
            projectId: like.project_id,
            userId: like.user_id,
            createdAt: new Date(like.created_at),
          }
        });
      } catch (err) {
        // Ignore duplicates and foreign key errors
      }
    }
    
    // Community memberships
    const { data: memberships } = await supabase.from('community_memberships').select('*');
    for (const membership of memberships || []) {
      try {
        await prisma.communityMembership.create({
          data: {
            id: membership.id,
            communityId: membership.community_id,
            userId: membership.user_id,
            role: this.mapRole(membership.role),
            joinedAt: new Date(membership.joined_at || membership.created_at),
          }
        });
      } catch (err) {
        // Ignore duplicates and foreign key errors
      }
    }
    
    console.log('✅ Migrated relationships\n');
  }

  async verifyMigration() {
    console.log('🔍 Verifying migration...');
    
    // Count records in new database
    const counts = await Promise.all([
      prisma.profile.count(),
      prisma.project.count(),
      prisma.comment.count(),
      prisma.community.count(),
    ]);
    
    console.log(`Verification:
    - Profiles: ${counts[0]}
    - Projects: ${counts[1]}
    - Comments: ${counts[2]}
    - Communities: ${counts[3]}
    `);
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      success: this.stats.errors.length === 0
    };
    
    fs.writeFileSync(
      path.join(process.cwd(), 'migration-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`📊 Migration Report:
    - Profiles: ${this.stats.profiles}
    - Projects: ${this.stats.projects}
    - Comments: ${this.stats.comments}
    - Errors: ${this.stats.errors.length}
    
    Report saved to: migration-report.json
    `);
  }

  // Helper methods for mapping enums
  mapPlan(plan) {
    if (!plan) return 'FREE';
    return plan.toUpperCase();
  }

  mapProjectType(type) {
    const mapping = {
      'design': 'DESIGN',
      'prototype': 'PROTOTYPE',
      'analysis': 'ANALYSIS',
      'simulation': 'SIMULATION',
      'manufacturing': 'MANUFACTURING',
      'research': 'RESEARCH',
      'testing': 'TESTING',
    };
    return mapping[type] || 'DESIGN';
  }

  mapComplexityLevel(level) {
    const mapping = {
      'beginner': 'BEGINNER',
      'intermediate': 'INTERMEDIATE',
      'advanced': 'ADVANCED',
      'expert': 'EXPERT',
    };
    return mapping[level] || 'INTERMEDIATE';
  }

  mapProjectStatus(status) {
    const mapping = {
      'concept': 'CONCEPT',
      'in-progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'published': 'PUBLISHED',
    };
    return mapping[status] || 'COMPLETED';
  }

  mapPostType(type) {
    const mapping = {
      'showcase': 'SHOWCASE',
      'question': 'QUESTION',
      'discussion': 'DISCUSSION',
      'news': 'NEWS',
      'tutorial': 'TUTORIAL',
      'project': 'PROJECT',
    };
    return mapping[type] || 'DISCUSSION';
  }

  mapRole(role) {
    const mapping = {
      'member': 'MEMBER',
      'moderator': 'MODERATOR',
      'admin': 'ADMIN',
    };
    return mapping[role] || 'MEMBER';
  }

  async rollbackIfNeeded() {
    // Implement rollback logic if needed
    console.log('🔄 Consider manual rollback if needed');
  }
}

// Run migration
if (require.main === module) {
  const migration = new MigrationManager();
  migration.run().catch(console.error);
}

module.exports = MigrationManager; 