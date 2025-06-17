-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('CONCEPT', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ComplexityLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('DESIGN', 'PROTOTYPE', 'ANALYSIS', 'SIMULATION', 'MANUFACTURING', 'RESEARCH', 'TESTING');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('SHOWCASE', 'QUESTION', 'DISCUSSION', 'NEWS', 'TUTORIAL', 'PROJECT');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "display_name" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "cover_image_url" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "engineering_discipline" TEXT,
    "experience_level" TEXT,
    "company" TEXT,
    "location" TEXT,
    "website" TEXT,
    "github_username" TEXT,
    "linkedin_username" TEXT,
    "follower_count" INTEGER NOT NULL DEFAULT 0,
    "following_count" INTEGER NOT NULL DEFAULT 0,
    "project_count" INTEGER NOT NULL DEFAULT 0,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "post_karma" INTEGER NOT NULL DEFAULT 0,
    "comment_karma" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "last_active" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "joined_communities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "saved_posts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stripe_customer_id" TEXT,
    "stripe_account_id" TEXT,
    "tip_jar_on" BOOLEAN NOT NULL DEFAULT true,
    "lifetime_cents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "readme" TEXT,
    "engineering_discipline" TEXT,
    "project_type" "ProjectType" NOT NULL DEFAULT 'DESIGN',
    "complexity_level" "ComplexityLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "project_status" "ProjectStatus" NOT NULL DEFAULT 'COMPLETED',
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "materials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cad_file_formats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail_url" TEXT,
    "gallery_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_url" TEXT,
    "repository_url" TEXT,
    "demo_url" TEXT,
    "documentation_url" TEXT,
    "video_url" TEXT,
    "license" TEXT NOT NULL DEFAULT 'MIT',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "bookmark_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "owner_id" UUID NOT NULL,
    "current_version_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "published_at" TIMESTAMPTZ,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_versions" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "version_number" TEXT NOT NULL DEFAULT '1.0.0',
    "readme_md" TEXT,
    "changelog" TEXT,
    "files" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "project_id" UUID,
    "post_id" UUID,
    "user_id" UUID NOT NULL,
    "parent_id" UUID,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communities" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "category" TEXT NOT NULL DEFAULT 'engineering',
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "post_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_memberships" (
    "id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "joined_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "post_type" "PostType" NOT NULL DEFAULT 'DISCUSSION',
    "community_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "vote_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "is_removed" BOOLEAN NOT NULL DEFAULT false,
    "is_solved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_likes" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_votes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "id" UUID NOT NULL,
    "follower_id" UUID NOT NULL,
    "following_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "payer_id" UUID,
    "payee_id" UUID,
    "amount_cents" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "stripe_payment_intent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_handle_key" ON "profiles"("handle");

-- CreateIndex
CREATE INDEX "profiles_engineering_discipline_idx" ON "profiles"("engineering_discipline");

-- CreateIndex
CREATE INDEX "profiles_is_verified_idx" ON "profiles"("is_verified");

-- CreateIndex
CREATE INDEX "profiles_reputation_idx" ON "profiles"("reputation");

-- CreateIndex
CREATE INDEX "profiles_last_active_idx" ON "profiles"("last_active");

-- CreateIndex
CREATE INDEX "projects_is_public_idx" ON "projects"("is_public");

-- CreateIndex
CREATE INDEX "projects_engineering_discipline_idx" ON "projects"("engineering_discipline");

-- CreateIndex
CREATE INDEX "projects_project_type_idx" ON "projects"("project_type");

-- CreateIndex
CREATE INDEX "projects_complexity_level_idx" ON "projects"("complexity_level");

-- CreateIndex
CREATE INDEX "projects_is_featured_idx" ON "projects"("is_featured");

-- CreateIndex
CREATE INDEX "projects_technologies_idx" ON "projects"("technologies");

-- CreateIndex
CREATE INDEX "projects_materials_idx" ON "projects"("materials");

-- CreateIndex
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at");

-- CreateIndex
CREATE INDEX "projects_published_at_idx" ON "projects"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "projects_owner_id_slug_key" ON "projects"("owner_id", "slug");

-- CreateIndex
CREATE INDEX "project_versions_project_id_idx" ON "project_versions"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_versions_project_id_version_no_key" ON "project_versions"("project_id", "version_no");

-- CreateIndex
CREATE INDEX "comments_project_id_idx" ON "comments"("project_id");

-- CreateIndex
CREATE INDEX "comments_post_id_idx" ON "comments"("post_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "communities_name_key" ON "communities"("name");

-- CreateIndex
CREATE INDEX "communities_category_idx" ON "communities"("category");

-- CreateIndex
CREATE INDEX "communities_is_private_idx" ON "communities"("is_private");

-- CreateIndex
CREATE UNIQUE INDEX "community_memberships_community_id_user_id_key" ON "community_memberships"("community_id", "user_id");

-- CreateIndex
CREATE INDEX "posts_community_id_idx" ON "posts"("community_id");

-- CreateIndex
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");

-- CreateIndex
CREATE INDEX "posts_post_type_idx" ON "posts"("post_type");

-- CreateIndex
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at");

-- CreateIndex
CREATE INDEX "posts_is_pinned_idx" ON "posts"("is_pinned");

-- CreateIndex
CREATE UNIQUE INDEX "project_likes_project_id_user_id_key" ON "project_likes"("project_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_votes_post_id_user_id_key" ON "post_votes"("post_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_follows_follower_id_following_id_key" ON "user_follows"("follower_id", "following_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_current_version_id_fkey" FOREIGN KEY ("current_version_id") REFERENCES "project_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_versions" ADD CONSTRAINT "project_versions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_memberships" ADD CONSTRAINT "community_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_likes" ADD CONSTRAINT "project_likes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_likes" ADD CONSTRAINT "project_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_votes" ADD CONSTRAINT "post_votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_votes" ADD CONSTRAINT "post_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
