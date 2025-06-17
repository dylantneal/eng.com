-- ============================================================================
-- UNIFIED SCHEMA FIX FOR ENG.COM - CRITICAL RESOLUTION
-- This migration fixes all authentication, schema, and data consistency issues
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: FIX PROFILES TABLE SCHEMA INCONSISTENCIES
-- ============================================================================

-- Ensure profiles table has consistent column naming and all required fields
ALTER TABLE public.profiles 
  -- Core identity fields (ensure consistency)
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS display_name text,
  
  -- Profile details
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS website text,
  
  -- Social links
  ADD COLUMN IF NOT EXISTS github_username text,
  ADD COLUMN IF NOT EXISTS linkedin_username text,
  
  -- Engineering-specific fields
  ADD COLUMN IF NOT EXISTS engineering_discipline text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS job_title text,
  
  -- Platform metrics
  ADD COLUMN IF NOT EXISTS post_karma integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_karma integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reputation integer DEFAULT 0,
  
  -- Account status
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
  
  -- Activity tracking
  ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  
  -- JSON fields for flexible data
  ADD COLUMN IF NOT EXISTS joined_communities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS saved_posts text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{
    "theme": "dark",
    "email_notifications": true,
    "push_notifications": true,
    "show_online_status": true,
    "public_profile": true,
    "allow_dm": true,
    "feed_algorithm": "personalized",
    "favorite_communities": [],
    "blocked_users": [],
    "nsfw_content": false
  }'::jsonb,
  
  -- Stripe integration
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  
  -- Legacy compatibility
  ADD COLUMN IF NOT EXISTS tip_jar_on boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS lifetime_cents integer DEFAULT 0;

-- Fix handle/username consistency
UPDATE public.profiles 
SET username = handle 
WHERE username IS NULL AND handle IS NOT NULL;

UPDATE public.profiles 
SET handle = username 
WHERE handle IS NULL AND username IS NOT NULL;

-- Ensure email is populated from auth.users
UPDATE public.profiles 
SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id)
WHERE email IS NULL;

-- ============================================================================
-- STEP 2: FIX PROJECTS TABLE SCHEMA
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
  ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_version uuid;

-- ============================================================================
-- STEP 3: CREATE MISSING TABLES AND FIX EXISTING ONES
-- ============================================================================

-- Fix payments table to ensure it has project_id column
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Create versions table with proper relationships
CREATE TABLE IF NOT EXISTS public.versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_no integer NOT NULL,
  readme_md text,
  files jsonb DEFAULT '[]'::jsonb,
  changelog text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_project_version UNIQUE (project_id, version_no)
);

-- Create project_likes table
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create communities infrastructure
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
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, community_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS content_md text,
  ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vote_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Migrate content to body if needed
UPDATE public.comments 
SET body = content_md 
WHERE body IS NULL AND content_md IS NOT NULL;

-- ============================================================================
-- STEP 4: CREATE CRITICAL PROJECT_FEED VIEW
-- ============================================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.project_feed;

-- Create the project_feed view that APIs expect
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
  COALESCE(tips.total_tips, 0) as tips_cents,
  v.thumb_path
FROM public.projects p
JOIN public.profiles pr ON pr.id = p.owner_id
LEFT JOIN (
  SELECT 
    project_id,
    SUM(amount_cents) as total_tips
  FROM public.payments 
  WHERE type = 'tip'
  GROUP BY project_id
) tips ON tips.project_id = p.id
LEFT JOIN (
  SELECT DISTINCT ON (project_id)
    project_id,
    p.id || '/' || (files->0->>'name') as thumb_path
  FROM public.versions v
  JOIN public.projects p ON p.id = v.project_id
  ORDER BY project_id, v.created_at DESC
) v ON v.project_id = p.id
WHERE p.is_public = true;

-- ============================================================================
-- STEP 5: CREATE AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username,
    handle,
    display_name,
    created_at,
    updated_at,
    profile_complete
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NOW(),
    NOW(),
    false
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it
    UPDATE public.profiles
    SET 
      email = NEW.email,
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY AND POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'versions' AND policyname = 'Versions: read public or own project') THEN
        CREATE POLICY "Versions: read public or own project" ON public.versions
          FOR SELECT USING (
            (SELECT is_public FROM public.projects p WHERE p.id = project_id)
            OR auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
          );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'versions' AND policyname = 'Versions: owners can manage') THEN
        CREATE POLICY "Versions: owners can manage" ON public.versions
          FOR ALL USING (
            auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
          );
    END IF;
END $$;

-- Create policies only if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_likes' AND policyname = 'Users can view likes') THEN
        CREATE POLICY "Users can view likes" ON public.project_likes
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_likes' AND policyname = 'Users can manage their own likes') THEN
        CREATE POLICY "Users can manage their own likes" ON public.project_likes
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create policies only if they don't already exist
DO $$
BEGIN
    -- Communities policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'Communities are publicly readable') THEN
        CREATE POLICY "Communities are publicly readable" ON public.communities
          FOR SELECT USING (true);
    END IF;

    -- Posts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Posts are readable') THEN
        CREATE POLICY "Posts are readable" ON public.posts
          FOR SELECT USING (NOT is_removed);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Users can create posts') THEN
        CREATE POLICY "Users can create posts" ON public.posts
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Users can edit own posts') THEN
        CREATE POLICY "Users can edit own posts" ON public.posts
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- STEP 7: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Profile indexes
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles(email) WHERE email IS NOT NULL;

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Version indexes
CREATE INDEX IF NOT EXISTS idx_versions_project_id ON public.versions(project_id);
CREATE INDEX IF NOT EXISTS idx_versions_created_at ON public.versions(created_at DESC);

-- Community and post indexes
CREATE INDEX IF NOT EXISTS idx_communities_name ON public.communities(name);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- ============================================================================
-- STEP 8: POPULATE ESSENTIAL COMMUNITIES DATA
-- ============================================================================

-- Insert essential engineering communities
INSERT INTO public.communities (name, display_name, description, category, color, member_count, post_count) VALUES
  ('mechanical-engineering', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'engineering', '#DC2626', 15420, 892),
  ('electrical-engineering', 'Electrical Engineering', 'Circuit design, power systems, and electrical analysis', 'engineering', '#F59E0B', 12380, 756),
  ('software-engineering', 'Software Engineering', 'Programming, algorithms, and software development', 'software', '#3B82F6', 18750, 1203),
  ('civil-engineering', 'Civil Engineering', 'Infrastructure, construction, and structural design', 'engineering', '#6B7280', 11200, 634),
  ('robotics', 'Robotics & Automation', 'Autonomous systems, control theory, and robot design', 'robotics', '#059669', 8950, 543),
  ('electronics', 'Electronics & PCB Design', 'Circuit design, PCB layout, and electronic prototyping', 'electronics', '#7C3AED', 12380, 756),
  ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', 'manufacturing', '#DC2626', 9340, 612),
  ('materials-science', 'Materials Science', 'Material properties, testing, and selection', 'science', '#B45309', 6780, 423),
  ('aerospace', 'Aerospace Engineering', 'Aircraft, spacecraft, and propulsion systems', 'engineering', '#2563EB', 7650, 445),
  ('general', 'General Discussion', 'General engineering topics and discussions', 'community', '#6B7280', 25600, 1567)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 9: UPDATE FUNCTION TO MAINTAIN COMPUTED COLUMNS
-- ============================================================================

-- Function to update project like counts
CREATE OR REPLACE FUNCTION update_project_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects 
    SET like_count = like_count + 1 
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for like count updates
DROP TRIGGER IF EXISTS project_like_count_trigger ON public.project_likes;
CREATE TRIGGER project_like_count_trigger
  AFTER INSERT OR DELETE ON public.project_likes
  FOR EACH ROW EXECUTE FUNCTION update_project_like_count();

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Create a health check view
CREATE OR REPLACE VIEW public.schema_health AS
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as has_email,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as has_username
FROM public.profiles
UNION ALL
SELECT 
  'projects' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN owner_id IS NOT NULL THEN 1 END) as has_owner_id,
  COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as has_title
FROM public.projects
UNION ALL
SELECT 
  'communities' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as has_display_name,
  NULL as unused_column
FROM public.communities;

-- Log completion
SELECT 'Unified schema fix completed successfully' as status, now() as completed_at; 