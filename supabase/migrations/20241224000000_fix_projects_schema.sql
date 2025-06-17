-- Fix Projects Table Schema
-- This ensures all required columns exist for project creation

-- Add missing columns to projects table if they don't exist
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS readme text,
  ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS discipline text,
  ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0;

-- Ensure projects table has the correct owner_id reference
-- First check if the constraint exists and drop it if it references auth.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'projects_owner_id_fkey' 
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE public.projects DROP CONSTRAINT projects_owner_id_fkey;
  END IF;
END $$;

-- Add the correct foreign key constraint to profiles
ALTER TABLE public.projects 
  ADD CONSTRAINT projects_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure project_versions table exists with correct structure
CREATE TABLE IF NOT EXISTS public.project_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  version_no integer NOT NULL,
  readme_md text,
  files jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_proj_version UNIQUE (project_id, version_no)
);

-- Enable RLS on project_versions if not already enabled
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_versions
DROP POLICY IF EXISTS "project_versions_select_policy" ON public.project_versions;
CREATE POLICY "project_versions_select_policy" ON public.project_versions
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND (p.is_public = true OR p.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "project_versions_insert_policy" ON public.project_versions;
CREATE POLICY "project_versions_insert_policy" ON public.project_versions
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND p.owner_id = auth.uid()
    )
  );

-- Update projects RLS policies to handle the plan column ambiguity
-- Drop existing policies
DROP POLICY IF EXISTS "Project: owners or public" ON public.projects;
DROP POLICY IF EXISTS "Owner manages project" ON public.projects;

-- Create new policies that are more explicit
CREATE POLICY "projects_select_policy" ON public.projects
  FOR SELECT 
  USING (is_public = true OR owner_id = auth.uid());

CREATE POLICY "projects_insert_policy" ON public.projects
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update_policy" ON public.projects
  FOR UPDATE 
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_delete_policy" ON public.projects
  FOR DELETE 
  USING (owner_id = auth.uid());

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_public ON public.projects(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_project_versions_project_id ON public.project_versions(project_id);

-- Add a function to handle the plan column ambiguity issue
CREATE OR REPLACE FUNCTION public.get_user_plan(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT profiles.plan FROM public.profiles WHERE profiles.id = user_id;
$$; 