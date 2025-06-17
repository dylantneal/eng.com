-- ============================================================================
-- FIX MOCK DATA DEPENDENCIES - COMPLETE SCHEMA RESTORATION
-- This script creates all missing database structure to replace mock data
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
-- STEP 6: CREATE THE CRITICAL PROJECT_FEED VIEW
-- ============================================================================

-- This is the view that the API expects to query
CREATE OR REPLACE VIEW public.project_feed AS
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

-- ============================================================================
-- STEP 10: CREATE SAMPLE DATA (TO REPLACE MOCK DATA)
-- ============================================================================

-- Insert a sample user if none exist
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, last_sign_in_at)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'demo@eng.com',
  now(),
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample profile
INSERT INTO public.profiles (
  id, 
  username, 
  handle,
  display_name, 
  email,
  bio, 
  engineering_discipline,
  avatar_url,
  profile_complete
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'demo_user',
  'demo_user', 
  'Demo Engineer',
  'demo@eng.com',
  'Passionate engineer working on innovative projects',
  'Software Engineering',
  'https://randomuser.me/api/portraits/men/1.jpg',
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample projects to replace mock data
INSERT INTO public.projects (
  id,
  owner_id,
  title,
  slug,
  description,
  discipline,
  tags,
  license,
  image_url,
  view_count,
  like_count,
  download_count,
  is_public
) VALUES 
(
  'a1b2c3d4-5e6f-7890-abcd-ef1234567890',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Arduino Weather Station',
  'arduino-weather-station',
  'A comprehensive IoT weather monitoring system built with Arduino, featuring real-time data collection, wireless transmission, and web-based dashboard visualization.',
  'Electrical Engineering',
  ARRAY['arduino', 'iot', 'sensors', 'weather', 'electronics'],
  'MIT',
  'https://picsum.photos/seed/weather-station/600/400',
  1280,
  47,
  245,
  true
),
(
  'b2c3d4e5-6f78-9012-bcde-f23456789012',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '3D Printed Robot Arm',
  '3d-printed-robot-arm',
  'A 6-axis robotic arm designed for educational purposes, featuring 3D printed components, servo control, and Arduino-based motion planning with inverse kinematics.',
  'Mechanical Engineering',
  ARRAY['robotics', '3d-printing', 'mechanical', 'automation', 'education'],
  'MIT',
  'https://picsum.photos/seed/robot-arm/600/400',
  3420,
  156,
  892,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample versions
INSERT INTO public.versions (
  id,
  project_id,
  version_no,
  readme_md,
  files
) VALUES 
(
  'v1a2b3c4-5d6e-7f89-0123-456789abcdef',
  'a1b2c3d4-5e6f-7890-abcd-ef1234567890',
  1,
  '# Arduino Weather Station\n\nA comprehensive weather monitoring system...',
  '[{"name": "weather_station.ino", "size": 5420, "mime": "text/x-arduino"}]'::jsonb
),
(
  'v2b3c4d5-6e7f-8901-2345-6789abcdef01',
  'b2c3d4e5-6f78-9012-bcde-f23456789012',
  1,
  '# 3D Printed Robot Arm\n\nEducational robotic arm project...',
  '[{"name": "robot_arm.stl", "size": 15670, "mime": "application/sla"}]'::jsonb
)
ON CONFLICT (project_id, version_no) DO NOTHING;

-- Update projects with current_version
UPDATE public.projects 
SET current_version = 'v1a2b3c4-5d6e-7f89-0123-456789abcdef'
WHERE id = 'a1b2c3d4-5e6f-7890-abcd-ef1234567890';

UPDATE public.projects 
SET current_version = 'v2b3c4d5-6e7f-8901-2345-6789abcdef01'
WHERE id = 'b2c3d4e5-6f78-9012-bcde-f23456789012';

-- ============================================================================
-- STEP 11: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to update project stats
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update like count
    IF TG_TABLE_NAME = 'project_likes' THEN
      UPDATE public.projects 
      SET like_count = like_count + 1 
      WHERE id = NEW.project_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update like count
    IF TG_TABLE_NAME = 'project_likes' THEN
      UPDATE public.projects 
      SET like_count = GREATEST(like_count - 1, 0)
      WHERE id = OLD.project_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to auto-update project stats
DROP TRIGGER IF EXISTS project_likes_stats_trigger ON public.project_likes;
CREATE TRIGGER project_likes_stats_trigger
  AFTER INSERT OR DELETE ON public.project_likes
  FOR EACH ROW EXECUTE FUNCTION update_project_stats();

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Verify critical tables exist
DO $$
DECLARE
  missing_tables text[] := '{}';
BEGIN
  -- Check for required tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    missing_tables := array_append(missing_tables, 'profiles');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
    missing_tables := array_append(missing_tables, 'projects');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'versions' AND table_schema = 'public') THEN
    missing_tables := array_append(missing_tables, 'versions');
  END IF;
  
  -- Check for required views
  IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'project_feed' AND table_schema = 'public') THEN
    missing_tables := array_append(missing_tables, 'project_feed (view)');
  END IF;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing critical tables/views: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'SUCCESS: All critical database structures are in place!';
  END IF;
END $$; 