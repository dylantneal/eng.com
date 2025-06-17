-- Precise Database Fix - Based on Diagnostic Results
-- This addresses the exact mismatches between your database and API expectations

-- ===========================================
-- FIX 1: COMMUNITIES TABLE - Add missing columns
-- ===========================================

-- Add display_name column
ALTER TABLE communities ADD COLUMN IF NOT EXISTS display_name text;

-- Add color column  
ALTER TABLE communities ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6';

-- Update display_name values for existing communities
UPDATE communities 
SET display_name = CASE 
    WHEN name = 'robotics' THEN 'Robotics & Automation'
    WHEN name = 'electronics' THEN 'Electronics & PCB Design'
    WHEN name = 'simulation' THEN 'Simulation & Analysis'
    WHEN name = 'quantum-computing' THEN 'Quantum Computing'
    WHEN name = 'civil-engineering' THEN 'Civil Engineering'
    WHEN name = '3d-printing' THEN '3D Printing & Additive Manufacturing'
    WHEN name = 'iot' THEN 'IoT & Embedded Systems'
    WHEN name = 'ai-ml' THEN 'AI & Machine Learning'
    WHEN name = 'renewable-energy' THEN 'Renewable Energy'
    WHEN name = 'automotive' THEN 'Automotive Engineering'
    WHEN name = 'cad-design' THEN 'CAD & Design Tools'
    WHEN name = 'engineering-careers' THEN 'Engineering Careers'
    ELSE initcap(replace(name, '-', ' '))
END
WHERE display_name IS NULL;

-- Update color values for existing communities
UPDATE communities 
SET color = CASE 
    WHEN name = 'robotics' THEN '#059669'
    WHEN name = 'electronics' THEN '#7C3AED'
    WHEN name = 'simulation' THEN '#7C3AED'
    WHEN name = 'quantum-computing' THEN '#EC4899'
    WHEN name = 'civil-engineering' THEN '#6B7280'
    WHEN name = '3d-printing' THEN '#F97316'
    WHEN name = 'iot' THEN '#06B6D4'
    WHEN name = 'ai-ml' THEN '#8B5CF6'
    WHEN name = 'renewable-energy' THEN '#10B981'
    WHEN name = 'automotive' THEN '#374151'
    WHEN name = 'cad-design' THEN '#2563EB'
    WHEN name = 'engineering-careers' THEN '#6366F1'
    ELSE '#3B82F6'
END
WHERE color IS NULL OR color = '#3B82F6';

-- ===========================================
-- FIX 2: POSTS TABLE - Add missing columns
-- ===========================================

-- Add user_id column (reference to profiles)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id);

-- Add vote_count column (computed from upvotes - downvotes)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS vote_count integer DEFAULT 0;

-- Add missing columns that API expects
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'discussion';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Copy author_id to user_id
UPDATE posts SET user_id = author_id WHERE user_id IS NULL;

-- Calculate vote_count from upvotes and downvotes
UPDATE posts 
SET vote_count = COALESCE(upvotes, 0) - COALESCE(downvotes, 0)
WHERE vote_count = 0;

-- ===========================================
-- FIX 3: PROFILES TABLE - Add username alias
-- ===========================================

-- Add username column that mirrors handle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text;

-- Copy handle to username
UPDATE profiles SET username = handle WHERE username IS NULL;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Test the exact API query that was failing
SELECT 'Testing fixed API query...' as test_name;

SELECT 
    p.id,
    p.title,
    p.community_id,
    p.user_id,
    p.vote_count,
    p.comment_count,
    p.post_type,
    c.name as community_name,
    c.display_name as community_display_name,
    c.color as community_color,
    pr.username,
    pr.avatar_url
FROM posts p
LEFT JOIN communities c ON p.community_id = c.id
LEFT JOIN profiles pr ON p.user_id = pr.id
LIMIT 3;

-- Verify communities table
SELECT 'Communities verification...' as test_name;
SELECT id, name, display_name, color FROM communities LIMIT 5;

-- Verify posts table
SELECT 'Posts verification...' as test_name;
SELECT id, title, user_id, vote_count, post_type FROM posts LIMIT 3;

-- Success message
SELECT 'Database fix completed successfully! The posts API should now work.' as status; 