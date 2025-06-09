-- Fix all database schema inconsistencies for eng.com
-- Run this in Supabase Dashboard > SQL Editor

-- CRITICAL ISSUE 1: Column naming inconsistency - owner vs owner_id
-- The app expects 'owner_id' but some migrations use 'owner'
-- Fix projects table to use owner_id consistently

-- Check if projects table has 'owner' column and rename it to 'owner_id' if needed
DO $$
BEGIN
  -- Check if 'owner' column exists and 'owner_id' doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner' AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner_id' AND table_schema = 'public'
  ) THEN
    -- Rename 'owner' to 'owner_id'
    ALTER TABLE public.projects RENAME COLUMN owner TO owner_id;
    RAISE NOTICE 'Renamed projects.owner to projects.owner_id';
  END IF;
END $$;

-- CRITICAL ISSUE 2: Profile handle vs username inconsistency
-- The app expects 'handle' but some migrations use 'username'
DO $$
BEGIN
  -- Add handle column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'handle' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN handle text;
    RAISE NOTICE 'Added profiles.handle column';
  END IF;
  
  -- Copy data from username to handle if handle is empty and username exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username' AND table_schema = 'public'
  ) THEN
    UPDATE public.profiles SET handle = username WHERE handle IS NULL AND username IS NOT NULL;
    RAISE NOTICE 'Copied username data to handle column';
  END IF;
END $$;

-- Make handle unique
DROP INDEX IF EXISTS profiles_handle_unique;
CREATE UNIQUE INDEX profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;

-- CRITICAL ISSUE 3: Add missing project showcase columns
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS discipline text,
  ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
  ADD COLUMN IF NOT EXISTS repository_url text,
  ADD COLUMN IF NOT EXISTS demo_url text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;

-- CRITICAL ISSUE 4: Comments table body vs content_md inconsistency
-- The app expects 'body' but some migrations use 'content_md'
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
    RAISE NOTICE 'Copied content_md data to body column';
  END IF;
END $$;

-- CRITICAL ISSUE 5: Version table naming inconsistency
-- The app sometimes expects 'versions' table but migrations create 'project_versions'
-- Ensure both exist for compatibility

-- Create versions table if it doesn't exist (some parts of app expect this)
CREATE TABLE IF NOT EXISTS public.versions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  version_no integer,
  readme_md text,
  files jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz default now()
);

-- Add missing columns to project_versions table
ALTER TABLE public.project_versions 
  ADD COLUMN IF NOT EXISTS version_number text DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS changelog text;

-- CRITICAL ISSUE 6: Create project_likes table for social features
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS on project_likes
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- CRITICAL ISSUE 7: Fix RLS policies to use correct column names
-- Update policies to use owner_id instead of owner

-- Drop and recreate projects policies with correct column reference
DROP POLICY IF EXISTS "Project: owners or public" ON public.projects;
DROP POLICY IF EXISTS "Projects: owners can manage" ON public.projects;

CREATE POLICY "Projects: public readable" ON public.projects
  FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Projects: owners can manage" ON public.projects
  FOR ALL USING (auth.uid() = owner_id);

-- Drop and recreate comments policies with correct column reference
DROP POLICY IF EXISTS "Comments: read public or own project" ON public.comments;
DROP POLICY IF EXISTS "Comments: owners can manage" ON public.comments;

CREATE POLICY "Comments: read public or own project" ON public.comments
  FOR SELECT USING (
    (SELECT is_public FROM public.projects p WHERE p.id = project_id)
    OR auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
  );

CREATE POLICY "Comments: users can create" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comments: users manage own" ON public.comments
  FOR ALL USING (auth.uid() = user_id);

-- Enable RLS on versions table
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;

-- Create version policies
CREATE POLICY "Versions: read public or own project" ON public.versions
  FOR SELECT USING (
    (SELECT is_public FROM public.projects p WHERE p.id = project_id)
    OR auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
  );

CREATE POLICY "Versions: owners can manage" ON public.versions
  FOR ALL USING (
    auth.uid() = (SELECT owner_id FROM public.projects p WHERE p.id = project_id)
  );

-- Create policies for project_likes
CREATE POLICY "Users can view likes" ON public.project_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.project_likes
  FOR ALL USING (auth.uid() = user_id);

-- CRITICAL ISSUE 8: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_discipline ON public.projects(discipline);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_versions_project_id ON public.versions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON public.project_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON public.project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON public.project_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);

-- CRITICAL ISSUE 9: Create project_feed view with correct column references
CREATE OR REPLACE VIEW public.project_feed AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.created_at,
  p.description,
  p.tags,
  p.discipline,
  p.image_url,
  p.view_count,
  p.like_count,
  p.download_count,
  pr.handle as handle,
  coalesce(sum(pa.amount_cents), 0) as tips_cents,
  (
    select p.id || '/' || (pv.files->0->>'name')
    from public.project_versions pv
    where pv.project_id = p.id
    order by pv.created_at desc limit 1
  ) as thumb_path
FROM public.projects p
JOIN public.profiles pr ON pr.id = p.owner_id
LEFT JOIN public.payments pa ON pa.project_id = p.id AND pa.type = 'tip'
WHERE p.is_public = true
GROUP BY p.id, pr.handle;

-- CRITICAL ISSUE 10: Add missing profile columns expected by the app
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reputation integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- CRITICAL ISSUE 11: Create communities table and posts table
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL, -- URL-safe name like 'mechanical-engineering'
  display_name text NOT NULL, -- Human readable name like 'Mechanical Engineering'
  description text,
  category text DEFAULT 'engineering',
  color text DEFAULT '#3B82F6',
  member_count integer DEFAULT 0,
  post_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- Communities are publicly readable
CREATE POLICY "Communities are publicly readable" ON public.communities
  FOR SELECT USING (true);

-- Only authenticated users can create communities
CREATE POLICY "Authenticated users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create posts table for community posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id uuid REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  post_type text DEFAULT 'discussion', -- 'discussion', 'question', 'showcase'
  vote_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts are publicly readable
CREATE POLICY "Posts are publicly readable" ON public.posts
  FOR SELECT USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can edit their own posts
CREATE POLICY "Users can edit own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Add indexes for communities and posts
CREATE INDEX IF NOT EXISTS idx_communities_name ON public.communities(name);
CREATE INDEX IF NOT EXISTS idx_communities_category ON public.communities(category);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Insert default communities data
INSERT INTO public.communities (name, display_name, description, category, color, member_count, post_count) VALUES
  ('mechanical-engineering', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'engineering', '#DC2626', 15420, 892),
  ('electronics', 'Electronics & PCB Design', 'Circuit design, PCB layout, and electronic prototyping', 'engineering', '#7C3AED', 12380, 756),
  ('robotics', 'Robotics', 'Autonomous systems, control theory, and robot design', 'engineering', '#059669', 8950, 543),
  ('engineering-software', 'Engineering Software', 'CAD, simulation, and engineering tools discussion', 'software', '#2563EB', 11200, 678),
  ('materials-science', 'Materials Science', 'Material properties, testing, and selection', 'science', '#B45309', 6780, 423),
  ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', 'manufacturing', '#DC2626', 9340, 612)
ON CONFLICT (name) DO NOTHING;

-- CRITICAL ISSUE 12: Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)  
VALUES ('projects-private', 'projects-private', false)
ON CONFLICT (id) DO NOTHING;

-- CRITICAL ISSUE 13: Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, handle, plan)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1), -- Use email prefix as default handle
    'FREE'
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = NEW.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- VERIFICATION: Show final table structures
DO $$
BEGIN
  RAISE NOTICE 'Schema fix completed successfully!';
  RAISE NOTICE 'Please verify the following tables have the expected columns:';
  RAISE NOTICE '- projects: owner_id, description, tags, discipline, license, etc.';
  RAISE NOTICE '- profiles: handle, name, email, plan, reputation, etc.';
  RAISE NOTICE '- comments: body, user_id, project_id, etc.';
  RAISE NOTICE '- project_likes: project_id, user_id, created_at';
  RAISE NOTICE '- versions: project_id, version_no, readme_md, files';
  RAISE NOTICE '- project_versions: project_id, version_no, version_number, changelog';
END $$; 