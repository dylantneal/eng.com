# 🔧 Manual Migration Steps - Copy to Supabase

## **CRITICAL: Apply These SQL Commands in Order**

Copy each section below into your **Supabase Dashboard → SQL Editor** and execute them **one by one** in the exact order shown. This will fix the `project_id` error and all other database issues.

---

## **Step 1: Enable Extensions**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## **Step 2: Fix Profiles Table**
```sql
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS github_username text,
  ADD COLUMN IF NOT EXISTS linkedin_username text,
  ADD COLUMN IF NOT EXISTS engineering_discipline text,
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS post_karma integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_karma integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reputation integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS joined_communities text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS saved_posts text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"theme": "dark", "email_notifications": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS tip_jar_on boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS lifetime_cents integer DEFAULT 0;
```

---

## **Step 3: Fix Username/Handle Consistency**
```sql
UPDATE public.profiles 
SET username = handle 
WHERE username IS NULL AND handle IS NOT NULL;

UPDATE public.profiles 
SET handle = username 
WHERE handle IS NULL AND username IS NOT NULL;
```

---

## **Step 4: Fix Projects Table**
```sql
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
```

---

## **Step 5: Fix Payments Table (Critical - This Fixes Your Error)**
```sql
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;
```

---

## **Step 6: Create Missing Tables**

### Versions Table:
```sql
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
```

### Project Likes Table:
```sql
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);
```

### Communities Table:
```sql
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
```

### Posts Table:
```sql
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
```

---

## **Step 7: Fix Comments Table**
```sql
ALTER TABLE public.comments 
  ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS content_md text,
  ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vote_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
```

---

## **Step 8: Create Project Feed View (Fixed)**
```sql
-- Drop existing view first
DROP VIEW IF EXISTS public.project_feed;

-- Create working project_feed view
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
  NULL as thumb_path
FROM public.projects p
JOIN public.profiles pr ON pr.id = p.owner_id
LEFT JOIN (
  SELECT 
    project_id,
    SUM(amount_cents) as total_tips
  FROM public.payments 
  WHERE type = 'tip' AND project_id IS NOT NULL
  GROUP BY project_id
) tips ON tips.project_id = p.id
WHERE p.is_public = true;
```

---

## **Step 9: Create Profile Creation Trigger**
```sql
-- Create the function
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
    UPDATE public.profiles
    SET 
      email = NEW.email,
      updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## **Step 10: Enable Security**
```sql
-- Enable Row Level Security
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Communities are publicly readable" ON public.communities 
  FOR SELECT USING (true);

CREATE POLICY "Posts are readable" ON public.posts 
  FOR SELECT USING (NOT is_removed);

CREATE POLICY "Project likes are viewable" ON public.project_likes 
  FOR SELECT USING (true);

CREATE POLICY "Versions are viewable for public projects" ON public.versions 
  FOR SELECT USING (
    (SELECT is_public FROM public.projects p WHERE p.id = project_id) = true
  );
```

---

## **Step 11: Populate Communities**
```sql
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
```

---

## **Step 12: Verification Query**
```sql
-- Test that everything works
SELECT 'Migration completed successfully' as status, now() as completed_at;

-- Test the project_feed view
SELECT COUNT(*) as project_feed_count FROM public.project_feed;

-- Test communities
SELECT COUNT(*) as communities_count FROM public.communities;
```

---

## **✅ Expected Results**
After running all steps:
- ✅ No more "column project_id does not exist" errors
- ✅ `project_feed` view works correctly
- ✅ All missing columns added to tables
- ✅ Automatic profile creation enabled
- ✅ Communities populated with data
- ✅ Row Level Security enabled

## **🚀 Next Steps**
1. Test your `/api/projects` endpoint - should return real data
2. Test your `/api/communities` endpoint - should return 10 communities
3. Try creating a new user account - profile should be created automatically
4. No more mock data fallbacks! 