-- ============================================================================
-- COMPREHENSIVE AUTHENTICATION SCHEMA FIX FOR ENG.COM
-- This script fixes all authorization and database schema issues
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: CLEAN UP EXISTING CONFLICTS
-- ============================================================================

-- Drop conflicting policies first
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public projects are readable" ON public.projects;
DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;

-- Drop triggers to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- ============================================================================
-- STEP 2: FIX PROFILES TABLE STRUCTURE
-- ============================================================================

-- Ensure profiles table has all required columns with proper types
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
-- STEP 3: FIX DATA CONSISTENCY ISSUES
-- ============================================================================

-- Update existing profiles with consistent data
UPDATE public.profiles 
SET 
  email = COALESCE(email, (SELECT email FROM auth.users WHERE id = profiles.id)),
  username = COALESCE(username, handle, SPLIT_PART(COALESCE(email, (SELECT email FROM auth.users WHERE id = profiles.id)), '@', 1), 'user_' || id::text),
  display_name = COALESCE(display_name, username, handle, 'User'),
  handle = COALESCE(handle, username, SPLIT_PART(COALESCE(email, (SELECT email FROM auth.users WHERE id = profiles.id)), '@', 1)),
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
  email IS NULL OR 
  username IS NULL OR 
  display_name IS NULL OR 
  handle IS NULL OR
  post_karma IS NULL OR
  preferences IS NULL;

-- ============================================================================
-- STEP 4: FIX PROJECTS TABLE NAMING INCONSISTENCY
-- ============================================================================

-- Ensure projects table has consistent column naming
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
  END IF;
END $$;

-- Ensure projects table has all required columns
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS discipline text,
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ============================================================================
-- STEP 5: FIX POSTS/PROFILES RELATIONSHIP CONFLICT
-- ============================================================================

-- Create posts table with correct structure if it doesn't exist
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- STEP 6: CREATE PROPER INDEXES
-- ============================================================================

-- Create unique constraints and indexes
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_engineering_discipline ON public.profiles(engineering_discipline);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- ============================================================================
-- STEP 7: CREATE ESSENTIAL FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Critical function to handle new user registration
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
    profile_complete,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    SPLIT_PART(NEW.email, '@', 1),
    'FREE',
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = NEW.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 8: CREATE TRIGGERS
-- ============================================================================

-- Trigger for automatic profile creation when auth user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at fields
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON public.posts 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON public.comments 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STEP 9: ENABLE ROW LEVEL SECURITY AND CREATE POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are publicly readable" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Public projects are readable" 
  ON public.projects FOR SELECT 
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can manage own projects" 
  ON public.projects FOR ALL 
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create projects" 
  ON public.projects FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Posts policies
CREATE POLICY "Posts are publicly readable" 
  ON public.posts FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.posts FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can edit own posts" 
  ON public.posts FOR UPDATE 
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are publicly readable" 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can comment" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can edit own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 10: VERIFY SCHEMA INTEGRITY
-- ============================================================================

-- Create a view to check schema integrity
CREATE OR REPLACE VIEW public.schema_health AS
SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as has_email,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as has_username,
  COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as has_display_name
FROM public.profiles
UNION ALL
SELECT 
  'projects' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN owner_id IS NOT NULL THEN 1 END) as has_owner_id,
  COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as has_title,
  COUNT(CASE WHEN slug IS NOT NULL THEN 1 END) as has_slug
FROM public.projects
UNION ALL
SELECT 
  'posts' as table_name,
  COUNT(*) as record_count,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as has_user_id,
  COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as has_title,
  NULL as unused_column
FROM public.posts;

-- Final verification query
SELECT 'Schema fix completed successfully' as status, now() as completed_at; 