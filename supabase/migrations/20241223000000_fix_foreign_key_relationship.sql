-- Fix foreign key relationship between projects and profiles
-- This migration ensures Supabase can properly join these tables

-- First, let's make sure the relationship exists and is properly named
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_owner_id_fkey;

-- Add the foreign key constraint with the correct name
ALTER TABLE public.projects 
ADD CONSTRAINT projects_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Make sure profiles table has all necessary columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS handle text;

-- Create or update the project_feed view
DROP VIEW IF EXISTS public.project_feed;

CREATE VIEW public.project_feed AS
SELECT 
  p.id,
  p.title,
  p.slug,
  p.description,
  p.readme,
  p.discipline,
  p.tags,
  p.license,
  p.is_public,
  p.view_count,
  p.like_count,
  p.download_count,
  p.image_url,
  p.created_at,
  p.updated_at,
  p.owner_id as author_id,
  pr.username,
  pr.handle,
  pr.display_name,
  pr.avatar_url,
  0 as tips_cents,
  null as thumb_path
FROM public.projects p
LEFT JOIN public.profiles pr ON p.owner_id = pr.id
WHERE p.is_public = true;

-- Grant access to the view
GRANT SELECT ON public.project_feed TO anon, authenticated;

-- Refresh the schema cache by updating the updated_at timestamp
UPDATE public.projects SET updated_at = NOW() WHERE true;
UPDATE public.profiles SET updated_at = NOW() WHERE true; 