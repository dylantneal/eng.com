-- Add missing columns to projects table for enhanced project showcase
-- Run this in Supabase Dashboard > SQL Editor

-- Add description, tags, discipline, license, and other showcase fields to projects
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

-- Add version number to project_versions if missing
ALTER TABLE public.project_versions 
  ADD COLUMN IF NOT EXISTS version_number text DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS changelog text;

-- Create project_likes table for the like functionality
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Enable RLS on project_likes
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for project_likes
CREATE POLICY "Users can view likes" ON public.project_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON public.project_likes
  FOR ALL USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON public.project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON public.project_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_discipline ON public.projects(discipline);
CREATE INDEX IF NOT EXISTS idx_projects_view_count ON public.projects(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_projects_like_count ON public.projects(like_count DESC);

-- Update some sample data for demo purposes (optional)
-- You can run this to add some sample data to existing projects
/*
UPDATE public.projects SET 
  description = 'A sample engineering project showcasing innovative design and implementation.',
  discipline = 'Mechanical',
  tags = ARRAY['engineering', 'innovation', 'design'],
  view_count = floor(random() * 1000 + 100),
  download_count = floor(random() * 500 + 50),
  like_count = floor(random() * 100 + 10)
WHERE description IS NULL
LIMIT 5;
*/ 