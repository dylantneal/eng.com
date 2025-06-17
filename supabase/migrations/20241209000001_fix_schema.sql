-- Fix database schema inconsistencies
-- This migration ensures all tables have the expected columns for the current codebase

-- 1. Ensure profiles table has all expected columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS handle text,
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2. Make handle unique if not already
DROP INDEX IF EXISTS profiles_handle_unique;
CREATE UNIQUE INDEX profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;

-- 3. Ensure projects table has expected columns
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS readme text;

-- 4. Fix version control table naming (app expects 'versions' but some migrations create 'project_versions')
-- Create versions table if it doesn't exist with expected structure
CREATE TABLE IF NOT EXISTS public.versions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  version_no integer,
  readme_md text,
  files jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz default now()
);

-- 5. Enable RLS on new tables
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;

-- 6. Create version policies
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

-- 7. Update projects policies to be more comprehensive
DROP POLICY IF EXISTS "Projects: owners can manage" ON public.projects;
CREATE POLICY "Projects: owners can manage" ON public.projects
  FOR ALL USING (auth.uid() = owner_id);

-- 8. Ensure comments table has expected columns
ALTER TABLE public.comments 
  ADD COLUMN IF NOT EXISTS body text;

-- Update existing content_md to body if body is empty
UPDATE public.comments 
SET body = content_md 
WHERE body IS NULL AND content_md IS NOT NULL;

-- 9. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)  
VALUES ('projects-private', 'projects-private', false)
ON CONFLICT (id) DO NOTHING;

-- 10. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_versions_project_id ON public.versions(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- 11. Create a function to sync profile data from auth.users
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

-- Create trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Add updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at(); 