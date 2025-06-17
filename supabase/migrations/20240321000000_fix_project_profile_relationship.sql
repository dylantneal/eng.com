-- Fix project-profile relationship
-- This migration ensures proper foreign key relationships between projects and profiles

-- First, ensure the profiles table has the correct structure
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS handle text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS engineering_discipline text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create unique indexes for profiles if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;

-- Fix the projects table structure
-- First, ensure owner_id column exists
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Rename 'owner' column to 'owner_id' if it exists
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

-- Ensure all required columns exist in projects table
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS readme text,
  ADD COLUMN IF NOT EXISTS discipline text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS current_version uuid,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create unique constraint for owner_id + slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_owner_slug' 
    AND conrelid = 'public.projects'::regclass
  ) THEN
    ALTER TABLE public.projects 
    ADD CONSTRAINT unique_owner_slug UNIQUE (owner_id, slug);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_discipline ON public.projects(discipline);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON public.projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON public.projects USING GIN(tags);

-- Ensure RLS is enabled and policies are set
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Project: owners or public" ON public.projects;
DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

-- Create new policies
CREATE POLICY "Project: owners or public" ON public.projects
  FOR SELECT USING (is_public OR auth.uid() = owner_id);

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Update any existing projects to ensure they have valid owner_id references
UPDATE public.projects p
SET owner_id = (
  SELECT id FROM auth.users 
  WHERE id IN (
    SELECT id FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1
  )
)
WHERE p.owner_id IS NULL; 