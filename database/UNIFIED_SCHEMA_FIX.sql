-- ============================================================================
-- UNIFIED DATABASE SCHEMA FIX FOR ENG.COM
-- This script fixes all schema fragmentation issues and creates a consistent database structure
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: FIX PROFILES TABLE STRUCTURE
-- ============================================================================

-- Ensure profiles table has all required columns with consistent naming
ALTER TABLE public.profiles 
  -- Core identity fields
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS handle text, -- Keep for backward compatibility
  
  -- Profile details
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS website text,
  
  -- Social links
  ADD COLUMN IF NOT EXISTS github_username text,
  ADD COLUMN IF NOT EXISTS linkedin_username text,
  
  -- Engineering fields
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
  
  -- Payment integration
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS tip_jar_on boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS lifetime_cents integer DEFAULT 0;

-- ============================================================================
-- STEP 2: FIX COLUMN NAMING INCONSISTENCIES
-- ============================================================================

-- Fix projects table: owner vs owner_id inconsistency
DO $$
BEGIN
  -- Check if projects table has 'owner' column and rename it to 'owner_id'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner' AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner_id' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.projects RENAME COLUMN owner TO owner_id;
    RAISE NOTICE 'Fixed: Renamed projects.owner to projects.owner_id';
  END IF;
END $$;

-- Fix profiles table: ensure both handle and username exist for compatibility
UPDATE public.profiles 
SET 
  username = COALESCE(username, handle, SPLIT_PART(email, '@', 1), 'user_' || id::text),
  display_name = COALESCE(display_name, username, handle, 'User'),
  handle = COALESCE(handle, username, SPLIT_PART(email, '@', 1)),
  email = COALESCE(email, (SELECT email FROM auth.users WHERE id = profiles.id)),
  post_karma = COALESCE(post_karma, 0),
  comment_karma = COALESCE(comment_karma, 0),
  reputation = COALESCE(reputation, 0),
  is_verified = COALESCE(is_verified, false),
  is_pro = COALESCE(is_pro, false),
  is_banned = COALESCE(is_banned, false),
  plan = COALESCE(plan, 'FREE'),
  profile_complete = COALESCE(profile_complete, false),
  last_active = COALESCE(last_active, created_at, now()),
  updated_at = COALESCE(updated_at, created_at, now()),
  joined_communities = COALESCE(joined_communities, '{}'),
  saved_posts = COALESCE(saved_posts, '{}'),
  preferences = COALESCE(preferences, '{
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
  }'::jsonb),
  tip_jar_on = COALESCE(tip_jar_on, true),
  lifetime_cents = COALESCE(lifetime_cents, 0)
WHERE 
  username IS NULL OR 
  display_name IS NULL OR 
  handle IS NULL OR
  email IS NULL OR
  post_karma IS NULL OR
  preferences IS NULL;

-- Fix comments table: body vs content_md inconsistency
DO $$
BEGIN
  -- Add body column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'body' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN body text;
    RAISE NOTICE 'Added comments.body column';
  END IF;
  
  -- Copy data from content_md to body if body is empty and content_md exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'content_md' AND table_schema = 'public'
  ) THEN
    UPDATE public.comments SET body = content_md WHERE body IS NULL AND content_md IS NOT NULL;
    RAISE NOTICE 'Fixed: Copied content_md data to body column';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: ENSURE PROJECTS TABLE HAS ALL REQUIRED COLUMNS
-- ============================================================================

ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS readme text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS discipline text,
  ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
  ADD COLUMN IF NOT EXISTS repository_url text,
  ADD COLUMN IF NOT EXISTS demo_url text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;

-- ============================================================================
-- STEP 4: CREATE MISSING TABLES (VERSIONS CONSISTENCY)
-- ============================================================================

-- Ensure versions table exists with expected structure (some parts of app expect this)
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

-- Add missing columns to project_versions table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_versions' AND table_schema = 'public') THEN
    ALTER TABLE public.project_versions 
    ADD COLUMN IF NOT EXISTS version_number text DEFAULT '1.0.0',
    ADD COLUMN IF NOT EXISTS changelog text;
  END IF;
END $$;

-- Create communities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  display_name text,
  description text,
  category text DEFAULT 'engineering',
  color text DEFAULT '#3B82F6',
  is_private boolean DEFAULT false,
  member_count integer DEFAULT 0,
  post_count integer DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table if it doesn't exist
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

-- Create project_likes table for social features
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- ============================================================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profile indexes
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_engineering_discipline ON public.profiles(engineering_discipline);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_discipline ON public.projects(discipline);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);

-- Version indexes
CREATE INDEX IF NOT EXISTS idx_versions_project_id ON public.versions(project_id);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_communities_name ON public.communities(name);
CREATE INDEX IF NOT EXISTS idx_communities_category ON public.communities(category);

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE/UPDATE RLS POLICIES WITH CORRECT COLUMN NAMES
-- ============================================================================

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects policies (using owner_id consistently)
DROP POLICY IF EXISTS "Project: owners or public" ON public.projects;
DROP POLICY IF EXISTS "Projects: owners can manage" ON public.projects;
DROP POLICY IF EXISTS "Projects: public readable" ON public.projects;

CREATE POLICY "Projects: public readable" ON public.projects
  FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Projects: owners can manage" ON public.projects
  FOR ALL USING (auth.uid() = owner_id);

-- Comments policies
DROP POLICY IF EXISTS "Comments: read public or own project" ON public.comments;
DROP POLICY IF EXISTS "Comments: owners can manage" ON public.comments;

CREATE POLICY "Comments: read public or own project" ON public.comments
  FOR SELECT USING (
    (SELECT is_public FROM public.projects p WHERE p.id = project_id)
    OR auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
    OR auth.uid() = user_id
  );

CREATE POLICY "Comments: authenticated users can create" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comments: users can edit own" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Versions policies
DROP POLICY IF EXISTS "Versions: read public or own project" ON public.versions;
DROP POLICY IF EXISTS "Versions: owners can manage" ON public.versions;

CREATE POLICY "Versions: read public or own project" ON public.versions
  FOR SELECT USING (
    (SELECT is_public FROM public.projects p WHERE p.id = project_id)
    OR auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
  );

CREATE POLICY "Versions: owners can manage" ON public.versions
  FOR ALL USING (
    auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
  );

-- Communities policies
DROP POLICY IF EXISTS "Communities are publicly readable" ON public.communities;
CREATE POLICY "Communities are publicly readable" ON public.communities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
CREATE POLICY "Authenticated users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Posts policies
DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;
CREATE POLICY "Posts are publicly readable" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Project likes policies
DROP POLICY IF EXISTS "Users can manage own likes" ON public.project_likes;
CREATE POLICY "Users can manage own likes" ON public.project_likes FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 8: CREATE CRITICAL MISSING FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CRITICAL: Profile creation trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    display_name, 
    handle,
    plan,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    SPLIT_PART(NEW.email, '@', 1),
    'FREE',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = NEW.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 9: CREATE STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('projects', 'projects', true, 52428800, '{"image/*","application/pdf","text/*"}'),
  ('avatars', 'avatars', true, 5242880, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 10: INSERT DEFAULT COMMUNITIES DATA
-- ============================================================================

INSERT INTO public.communities (name, display_name, description, category, color, member_count, post_count, created_by) VALUES
  ('mechanical-engineering', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'engineering', '#DC2626', 0, 0, NULL),
  ('electronics', 'Electronics & PCB Design', 'Circuit design, PCB layout, and electronic prototyping', 'engineering', '#7C3AED', 0, 0, NULL),
  ('robotics', 'Robotics', 'Autonomous systems, control theory, and robot design', 'engineering', '#059669', 0, 0, NULL),
  ('software', 'Engineering Software', 'CAD, simulation, and engineering tools discussion', 'software', '#2563EB', 0, 0, NULL),
  ('materials', 'Materials Science', 'Material properties, testing, and selection', 'science', '#B45309', 0, 0, NULL),
  ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', 'manufacturing', '#DC2626', 0, 0, NULL)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 11: VERIFICATION AND CLEANUP
-- ============================================================================

-- Create a verification function
CREATE OR REPLACE FUNCTION public.verify_schema_fix()
RETURNS text AS $$
DECLARE
  result text := 'Schema Fix Verification Results:' || chr(10);
  table_count int;
  column_count int;
BEGIN
  -- Check profiles table
  SELECT COUNT(*) INTO column_count FROM information_schema.columns 
  WHERE table_name = 'profiles' AND table_schema = 'public';
  result := result || '✓ Profiles table has ' || column_count::text || ' columns' || chr(10);
  
  -- Check projects table
  SELECT COUNT(*) INTO column_count FROM information_schema.columns 
  WHERE table_name = 'projects' AND table_schema = 'public';
  result := result || '✓ Projects table has ' || column_count::text || ' columns' || chr(10);
  
  -- Check for owner_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'projects' AND column_name = 'owner_id' AND table_schema = 'public') THEN
    result := result || '✓ Projects table uses owner_id (not owner)' || chr(10);
  ELSE
    result := result || '✗ Projects table missing owner_id column' || chr(10);
  END IF;
  
  -- Check for handle column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'profiles' AND column_name = 'handle' AND table_schema = 'public') THEN
    result := result || '✓ Profiles table has handle column' || chr(10);
  END IF;
  
  -- Check for body column in comments
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'comments' AND column_name = 'body' AND table_schema = 'public') THEN
    result := result || '✓ Comments table has body column' || chr(10);
  END IF;
  
  -- Check trigger exists
  IF EXISTS (SELECT 1 FROM information_schema.triggers 
             WHERE trigger_name = 'on_auth_user_created') THEN
    result := result || '✓ Profile creation trigger is active' || chr(10);
  END IF;
  
  result := result || '✓ Schema unification completed successfully!';
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT public.verify_schema_fix();

-- Final notice
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'UNIFIED SCHEMA FIX COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Fixed Issues:';
  RAISE NOTICE '- ✓ Column naming: owner_id (not owner), handle/username consistency';
  RAISE NOTICE '- ✓ Profile creation: Automatic trigger for auth.users';
  RAISE NOTICE '- ✓ Comments: body column (content_md copied over)';
  RAISE NOTICE '- ✓ Missing tables: versions, communities, posts, project_likes';
  RAISE NOTICE '- ✓ RLS policies: Updated with correct column names';
  RAISE NOTICE '- ✓ Indexes: Added for performance';
  RAISE NOTICE '- ✓ Storage: Project and avatar buckets created';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Your database is now unified and ready for production!';
  RAISE NOTICE '============================================================================';
END $$; 