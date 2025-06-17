-- ============================================================================
-- FIX MOCK DATA DEPENDENCIES - COMPLETE SCHEMA RESTORATION
-- This migration creates all missing database structure to replace mock data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: FIX PROFILES TABLE STRUCTURE
-- ============================================================================

-- Add all missing columns that the app expects
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS handle text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reputation integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS engineering_discipline text,
  ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();

-- Fix column naming inconsistency: ensure username exists
UPDATE public.profiles 
SET username = handle 
WHERE username IS NULL AND handle IS NOT NULL;

UPDATE public.profiles 
SET handle = username 
WHERE handle IS NULL AND username IS NOT NULL;

-- ============================================================================
-- STEP 2: FIX PROJECTS TABLE STRUCTURE  
-- ============================================================================

-- Fix owner vs owner_id column naming
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner' AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner_id' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.projects RENAME COLUMN owner TO owner_id;
  END IF;
END $$;

-- Add all missing project columns
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS readme text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS discipline text,
  ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
  ADD COLUMN IF NOT EXISTS repository_url text,
  ADD COLUMN IF NOT EXISTS demo_url text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0;

-- ============================================================================
-- STEP 3: CREATE MISSING VERSIONS TABLE (IF NEEDED)
-- ============================================================================

-- Create unified versions table (some migrations create project_versions)
CREATE TABLE IF NOT EXISTS public.versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  version_no integer NOT NULL,
  readme_md text,
  files jsonb DEFAULT '[]'::jsonb,
  changelog text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_project_version UNIQUE (project_id, version_no)
);

-- Migrate data from project_versions to versions if needed
INSERT INTO public.versions (id, project_id, version_no, readme_md, files, created_at)
SELECT id, project_id, version_no, readme_md, files, created_at 
FROM public.project_versions 
WHERE NOT EXISTS (SELECT 1 FROM public.versions WHERE versions.id = project_versions.id)
ON CONFLICT (project_id, version_no) DO NOTHING;

-- ============================================================================
-- STEP 4: CREATE PROJECT_LIKES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- ============================================================================
-- STEP 5: CREATE COMMUNITIES INFRASTRUCTURE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  category text DEFAULT 'engineering',
  color text DEFAULT '#3B82F6',
  member_count integer DEFAULT 0,
  post_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_memberships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, community_id)
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  post_type text DEFAULT 'discussion',
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  vote_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  is_removed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fix comments table to support both projects and posts
ALTER TABLE public.comments 
  ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS body text;

-- Migrate content_md to body if needed
UPDATE public.comments 
SET body = content_md 
WHERE body IS NULL AND content_md IS NOT NULL;

-- ============================================================================
-- STEP 6: CREATE THE CRITICAL PROJECT_FEED VIEW (only if it doesn't exist)
-- ============================================================================

-- This is the view that the API expects to query
-- Only create if it doesn't already exist from the comprehensive schema fix
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'project_feed') THEN
        CREATE VIEW public.project_feed AS
        SELECT
          p.id,
          p.title,
          p.slug,
          p.description,
          p.discipline,
          p.tags,
          p.license,
          p.image_url,
          p.view_count,
          p.like_count,
          p.download_count,
          p.is_public,
          p.created_at,
          p.updated_at,
          pr.id as author_id,
          pr.username,
          pr.handle,
          pr.display_name,
          pr.avatar_url,
          COALESCE(SUM(pa.amount_cents), 0) as tips_cents,
          (
            SELECT p.id || '/' || (v.files->0->>'name')
            FROM public.versions v
            WHERE v.project_id = p.id
            ORDER BY v.created_at DESC LIMIT 1
          ) as thumb_path
        FROM public.projects p
        JOIN public.profiles pr ON pr.id = p.owner_id
        LEFT JOIN public.payments pa ON pa.project_id = p.id AND pa.type = 'tip'
        WHERE p.is_public = true
        GROUP BY p.id, pr.id, pr.username, pr.handle, pr.display_name, pr.avatar_url;
    END IF;
END $$;

-- ============================================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for versions
DROP POLICY IF EXISTS "Versions: read public or own project" ON public.versions;
CREATE POLICY "Versions: read public or own project" ON public.versions
  FOR SELECT USING (
    (SELECT is_public FROM public.projects p WHERE p.id = project_id)
    OR auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
  );

DROP POLICY IF EXISTS "Versions: owners can manage" ON public.versions;
CREATE POLICY "Versions: owners can manage" ON public.versions
  FOR ALL USING (
    auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
  );

-- Create policies for project_likes
DROP POLICY IF EXISTS "Users can view likes" ON public.project_likes;
CREATE POLICY "Users can view likes" ON public.project_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own likes" ON public.project_likes;
CREATE POLICY "Users can manage their own likes" ON public.project_likes
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for communities (public read)
DROP POLICY IF EXISTS "Communities are publicly readable" ON public.communities;
CREATE POLICY "Communities are publicly readable" ON public.communities
  FOR SELECT USING (true);

-- Create policies for posts (public read for non-removed posts)
DROP POLICY IF EXISTS "Posts are readable" ON public.posts;
CREATE POLICY "Posts are readable" ON public.posts
  FOR SELECT USING (NOT is_removed);

-- ============================================================================
-- STEP 8: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Profile indexes
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_engineering_discipline ON public.profiles(engineering_discipline);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_discipline ON public.projects(discipline);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Version indexes
CREATE INDEX IF NOT EXISTS idx_versions_project_id ON public.versions(project_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON public.versions(created_at DESC);

-- Like indexes
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON public.project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON public.project_likes(user_id);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_communities_name ON public.communities(name);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user_id ON public.community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community_id ON public.community_memberships(community_id);

-- Post indexes
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- ============================================================================
-- STEP 9: POPULATE SAMPLE COMMUNITIES
-- ============================================================================

INSERT INTO public.communities (name, display_name, description, category, color, member_count, post_count) VALUES
  ('mechanical-engineering', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'engineering', '#DC2626', 15420, 892),
  ('electronics', 'Electronics & PCB Design', 'Circuit design, PCB layout, and electronic prototyping', 'engineering', '#7C3AED', 12380, 756),
  ('software-engineering', 'Software Engineering', 'Programming, algorithms, and software development', 'engineering', '#059669', 18750, 1203),
  ('robotics', 'Robotics', 'Autonomous systems, control theory, and robot design', 'engineering', '#059669', 8950, 543),
  ('materials-science', 'Materials Science', 'Material properties, testing, and selection', 'science', '#B45309', 6780, 423),
  ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', 'manufacturing', '#DC2626', 9340, 612),
  ('civil-engineering', 'Civil Engineering', 'Infrastructure, construction, and structural design', 'engineering', '#6B7280', 11200, 634),
  ('aerospace', 'Aerospace Engineering', 'Aircraft, spacecraft, and propulsion systems', 'engineering', '#2563EB', 7650, 445),
  ('general', 'General Discussion', 'General engineering topics and discussions', 'community', '#6B7280', 25600, 1567)
ON CONFLICT (name) DO NOTHING; 