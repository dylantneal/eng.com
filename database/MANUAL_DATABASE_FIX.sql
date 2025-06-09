-- ============================================================================
-- MANUAL DATABASE SCHEMA FIX FOR ENG.COM
-- Run this script in Supabase Dashboard > SQL Editor
-- This will fix all authentication and database issues
-- ============================================================================

-- 1. Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS post_karma integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_karma integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reputation integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE',
ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS joined_communities text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS saved_posts text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"theme": "dark", "email_notifications": true, "push_notifications": true, "show_online_status": true, "public_profile": true, "allow_dm": true, "feed_algorithm": "personalized", "favorite_communities": [], "blocked_users": [], "nsfw_content": false}'::jsonb,
ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS github_username text,
ADD COLUMN IF NOT EXISTS linkedin_username text,
ADD COLUMN IF NOT EXISTS engineering_discipline text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS tip_jar_on boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS lifetime_cents integer DEFAULT 0;

-- 2. Update existing profiles with default values
UPDATE profiles 
SET 
  username = COALESCE(username, handle, SPLIT_PART(email, '@', 1), 'user_' || id::text),
  display_name = COALESCE(display_name, username, handle, 'User'),
  post_karma = COALESCE(post_karma, 0),
  comment_karma = COALESCE(comment_karma, 0),
  reputation = COALESCE(reputation, 0),
  is_verified = COALESCE(is_verified, false),
  is_pro = COALESCE(is_pro, false),
  is_banned = COALESCE(is_banned, false),
  plan = COALESCE(plan, 'FREE'),
  last_active = COALESCE(last_active, created_at, now()),
  updated_at = COALESCE(updated_at, created_at, now()),
  joined_communities = COALESCE(joined_communities, '{}'),
  saved_posts = COALESCE(saved_posts, '{}'),
  preferences = COALESCE(preferences, '{"theme": "dark", "email_notifications": true, "push_notifications": true, "show_online_status": true, "public_profile": true, "allow_dm": true, "feed_algorithm": "personalized", "favorite_communities": [], "blocked_users": [], "nsfw_content": false}'::jsonb),
  profile_complete = COALESCE(profile_complete, false)
WHERE 
  username IS NULL OR 
  display_name IS NULL OR 
  post_karma IS NULL OR 
  comment_karma IS NULL OR 
  preferences IS NULL;

-- 3. Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_engineering_discipline ON profiles(engineering_discipline);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);

-- 4. Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  display_name text,
  description text,
  category text DEFAULT 'engineering',
  color text DEFAULT '#3B82F6',
  is_private boolean DEFAULT false,
  member_count integer DEFAULT 0,
  post_count integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure display_name column exists if table pre-existed
ALTER TABLE communities ADD COLUMN IF NOT EXISTS display_name text;

-- 5. Enable RLS and create policies for communities
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Communities are publicly readable" ON communities;
CREATE POLICY "Communities are publicly readable" ON communities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
CREATE POLICY "Authenticated users can create communities" ON communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Create community memberships table
CREATE TABLE IF NOT EXISTS community_memberships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  notifications_enabled boolean DEFAULT true,
  UNIQUE(user_id, community_id)
);

-- 7. Enable RLS for community memberships
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own memberships" ON community_memberships;
CREATE POLICY "Users can manage their own memberships" ON community_memberships FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Memberships are publicly readable" ON community_memberships;
CREATE POLICY "Memberships are publicly readable" ON community_memberships FOR SELECT USING (true);

-- 8. Insert default communities
INSERT INTO communities (name, display_name, description, category, color, member_count, post_count) VALUES
  ('mechanical-engineering', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'engineering', '#DC2626', 15420, 892),
  ('electronics', 'Electronics & PCB Design', 'Circuit design, PCB layout, and electronic prototyping', 'engineering', '#7C3AED', 12380, 756),
  ('software-engineering', 'Software Engineering', 'Programming, algorithms, and software development', 'engineering', '#059669', 18750, 1203),
  ('robotics', 'Robotics', 'Autonomous systems, control theory, and robot design', 'engineering', '#059669', 8950, 543),
  ('materials-science', 'Materials Science', 'Material properties, testing, and selection', 'science', '#B45309', 6780, 423),
  ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', 'manufacturing', '#DC2626', 9340, 612),
  ('general', 'General Discussion', 'General engineering topics and discussions', 'community', '#6B7280', 25600, 1567)
ON CONFLICT (name) DO NOTHING;

-- 9. Create posts table for community posts
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  post_type text DEFAULT 'discussion',
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  is_removed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Enable RLS and create policies for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts are publicly readable" ON posts;
CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users can edit own posts" ON posts;
CREATE POLICY "Users can edit own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

-- 11. Create automatic profile creation function
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    username, 
    display_name, 
    handle
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    SPLIT_PART(NEW.email, '@', 1)
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = NEW.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 13. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
CREATE TRIGGER update_communities_updated_at 
  BEFORE UPDATE ON communities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_name ON communities(name);
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user_id ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community_id ON community_memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- 16. Fix projects table if it exists (ensure owner_id column)
DO $$
BEGIN
  -- Check if projects table exists and has owner column instead of owner_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner' AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'owner_id' AND table_schema = 'public'
  ) THEN
    -- Rename 'owner' to 'owner_id'
    ALTER TABLE projects RENAME COLUMN owner TO owner_id;
  END IF;
END $$;

-- 17. Add missing columns to projects table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects' AND table_schema = 'public') THEN
    ALTER TABLE projects 
    ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS discipline text,
    ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
    ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS image_url text;
  END IF;
END $$;

-- 18. Verification - Show table structures
DO $$
DECLARE
    table_record RECORD;
    column_count INTEGER;
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DATABASE SCHEMA FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '============================================================================';
    
    -- Show profiles table columns
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' AND table_schema = 'public';
    
    RAISE NOTICE 'Profiles table has % columns', column_count;
    
    -- Show communities count
    SELECT COUNT(*) INTO column_count FROM communities;
    RAISE NOTICE 'Communities table has % records', column_count;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Authentication system is now ready!';
    RAISE NOTICE 'Visit /auth-test to test the authentication functionality';
    RAISE NOTICE '============================================================================';
END $$; 