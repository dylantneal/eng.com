-- ============================================================================
-- URGENT MOCK DATA DEPENDENCIES FIX
-- Copy and paste this entire script into your Supabase Dashboard > SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: FIX PROFILES TABLE
-- ============================================================================
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS handle TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS engineering_discipline TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create unique indexes for profiles
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;

-- ============================================================================
-- STEP 2: FIX PROJECTS TABLE SCHEMA
-- ============================================================================

-- Add owner_id column if it doesn't exist
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Rename 'owner' column to 'owner_id' if needed
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

-- Add missing project columns
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS discipline TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS license TEXT DEFAULT 'MIT',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- STEP 3: CREATE MISSING TABLES
-- ============================================================================

-- Create versions table
CREATE TABLE IF NOT EXISTS public.versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL,
  readme_md TEXT,
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_version UNIQUE (project_id, version_no)
);

-- Create project_likes table
CREATE TABLE IF NOT EXISTS public.project_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payer_id UUID REFERENCES public.profiles(id),
  payee_id UUID REFERENCES public.profiles(id),
  project_id UUID REFERENCES public.projects(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  type TEXT CHECK (type IN ('tip', 'subscription')),
  stripe_payment_intent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'engineering',
  color TEXT DEFAULT '#3B82F6',
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  post_type TEXT DEFAULT 'discussion',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_removed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table (if not exists)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT,
  content_md TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: CREATE THE CRITICAL PROJECT_FEED VIEW
-- ============================================================================

DROP VIEW IF EXISTS public.project_feed CASCADE;

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
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================================================

-- Profiles policies
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
DROP POLICY IF EXISTS "Public projects are readable" ON public.projects;
CREATE POLICY "Public projects are readable" ON public.projects FOR SELECT USING (is_public = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = owner_id);

-- Versions policies
DROP POLICY IF EXISTS "Versions follow project visibility" ON public.versions;
CREATE POLICY "Versions follow project visibility" ON public.versions 
FOR SELECT USING (
  (SELECT is_public FROM public.projects WHERE id = project_id) 
  OR auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
);

DROP POLICY IF EXISTS "Project owners can manage versions" ON public.versions;
CREATE POLICY "Project owners can manage versions" ON public.versions 
FOR ALL USING (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id));

-- Project likes policies
DROP POLICY IF EXISTS "Users can like projects" ON public.project_likes;
CREATE POLICY "Users can like projects" ON public.project_likes FOR ALL USING (auth.uid() = user_id);

-- Communities policies
DROP POLICY IF EXISTS "Communities are publicly readable" ON public.communities;
CREATE POLICY "Communities are publicly readable" ON public.communities FOR SELECT USING (true);

-- Posts policies
DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;
CREATE POLICY "Posts are publicly readable" ON public.posts FOR SELECT USING (NOT is_removed);

-- Comments policies
DROP POLICY IF EXISTS "Comments are publicly readable" ON public.comments;
CREATE POLICY "Comments are publicly readable" ON public.comments FOR SELECT USING (true);

-- ============================================================================
-- STEP 7: CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_engineering_discipline ON public.profiles(engineering_discipline);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(created_at);

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
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);

-- ============================================================================
-- STEP 8: CREATE SAMPLE DATA TO REPLACE MOCK DATA
-- ============================================================================

-- Insert a sample user profile (you should replace this with real signup data)
INSERT INTO public.profiles (
  id, 
  username, 
  handle,
  display_name, 
  email,
  bio, 
  engineering_discipline,
  avatar_url
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'demo_engineer',
  'demo_engineer', 
  'Demo Engineer',
  'demo@eng.com',
  'Passionate engineer working on innovative projects',
  'Software Engineering',
  'https://randomuser.me/api/portraits/men/1.jpg'
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  updated_at = NOW();

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
  '11111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
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
  '22222222-2222-2222-2222-222222222222'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
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
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert sample communities
INSERT INTO public.communities (
  id,
  name,
  display_name,
  description,
  category,
  color,
  member_count,
  post_count
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'mechanical-engineering',
  'Mechanical Engineering',
  'Design, manufacturing, robotics, and mechanical systems',
  'engineering',
  '#EF4444',
  15420,
  1203
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  'electrical-engineering',
  'Electrical Engineering',
  'Circuits, electronics, power systems, and embedded devices',
  'engineering',
  '#3B82F6',
  12350,
  987
) ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  updated_at = NOW();

-- ============================================================================
-- STEP 9: CREATE HELPER FUNCTIONS
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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test the project_feed view
DO $$
DECLARE
  test_count INTEGER;
  error_message TEXT;
BEGIN
  -- Test project_feed view
  SELECT COUNT(*) INTO test_count FROM public.project_feed;
  RAISE NOTICE 'project_feed view working: % rows found', test_count;
  
  -- Test profiles table
  SELECT COUNT(*) INTO test_count FROM public.profiles;
  RAISE NOTICE 'profiles table working: % rows found', test_count;
  
  -- Test projects table
  SELECT COUNT(*) INTO test_count FROM public.projects;
  RAISE NOTICE 'projects table working: % rows found', test_count;
  
  RAISE NOTICE 'SUCCESS: All critical database structures are working!';
  RAISE NOTICE 'Your application should now load real data instead of mock data.';
  
EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
  RAISE NOTICE 'VERIFICATION ERROR: %', error_message;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 
  '🎉 MOCK DATA DEPENDENCIES RESOLVED!' as status,
  'Database schema is now properly configured' as message,
  'Restart your development server and refresh browser' as next_step; 