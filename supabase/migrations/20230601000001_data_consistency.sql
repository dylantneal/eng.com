-- ============================================================================
-- DATA CONSISTENCY MIGRATION
-- This migration ensures data consistency after the schema fix
-- Date: 2025-01-21
-- ============================================================================

-- ============================================================================
-- STEP 1: MIGRATE EXISTING DATA WITH COLUMN NAME FIXES
-- ============================================================================

-- Fix any projects that might have 'owner' instead of 'owner_id'
DO $$
BEGIN
    -- Check if 'owner' column exists and rename it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'owner'
    ) THEN
        ALTER TABLE public.projects RENAME COLUMN owner TO owner_id;
    END IF;
END $$;

-- ============================================================================
-- STEP 2: ENSURE PROFILE COMPLETENESS
-- ============================================================================

-- Update profiles to ensure all required fields are populated
UPDATE public.profiles
SET 
    display_name = COALESCE(display_name, username),
    handle = COALESCE(handle, username),
    engineering_discipline = COALESCE(engineering_discipline, 'general'),
    experience_level = COALESCE(experience_level, 'mid')
WHERE display_name IS NULL OR handle IS NULL;

-- ============================================================================
-- STEP 3: LINK EXISTING POSTS TO COMMUNITIES
-- ============================================================================

-- If posts exist without community_id, link them to general community
DO $$
DECLARE
    general_community_id UUID;
BEGIN
    -- Get or create general community
    SELECT id INTO general_community_id 
    FROM public.communities 
    WHERE name = 'general';
    
    IF general_community_id IS NULL THEN
        INSERT INTO public.communities (
            name, 
            display_name, 
            description, 
            category, 
            color
        ) VALUES (
            'general',
            'General Discussion',
            'General engineering topics and discussions',
            'community',
            '#6B7280'
        ) RETURNING id INTO general_community_id;
    END IF;
    
    -- Update posts without community
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'posts' 
        AND column_name = 'community_name'
    ) THEN
        -- Handle posts with community_name but no community_id
        UPDATE public.posts p
        SET community_id = c.id
        FROM public.communities c
        WHERE p.community_name = c.name
        AND p.community_id IS NULL;
    END IF;
    
    -- Set remaining posts to general community
    UPDATE public.posts
    SET community_id = general_community_id
    WHERE community_id IS NULL;
END $$;

-- ============================================================================
-- STEP 4: UPDATE VOTE COUNTS
-- ============================================================================

-- Recalculate vote counts for posts
UPDATE public.posts p
SET 
    upvotes = COALESCE((
        SELECT COUNT(*) 
        FROM public.post_votes 
        WHERE post_id = p.id AND vote_type = 'upvote'
    ), 0),
    downvotes = COALESCE((
        SELECT COUNT(*) 
        FROM public.post_votes 
        WHERE post_id = p.id AND vote_type = 'downvote'
    ), 0);

-- Recalculate vote counts for comments
UPDATE public.comments c
SET 
    upvotes = COALESCE((
        SELECT COUNT(*) 
        FROM public.comment_votes 
        WHERE comment_id = c.id AND vote_type = 'upvote'
    ), 0),
    downvotes = COALESCE((
        SELECT COUNT(*) 
        FROM public.comment_votes 
        WHERE comment_id = c.id AND vote_type = 'downvote'
    ), 0);

-- ============================================================================
-- STEP 5: UPDATE METRICS
-- ============================================================================

-- Update project like counts
UPDATE public.projects p
SET like_count = COALESCE((
    SELECT COUNT(*) 
    FROM public.project_likes 
    WHERE project_id = p.id
), 0);

-- Update comment counts for posts
UPDATE public.posts p
SET comment_count = COALESCE((
    SELECT COUNT(*) 
    FROM public.comments 
    WHERE post_id = p.id
), 0);

-- Update community member counts
UPDATE public.communities c
SET member_count = COALESCE((
    SELECT COUNT(*) 
    FROM public.community_memberships 
    WHERE community_id = c.id
), 0);

-- Update community post counts
UPDATE public.communities c
SET post_count = COALESCE((
    SELECT COUNT(*) 
    FROM public.posts 
    WHERE community_id = c.id
), 0);

-- ============================================================================
-- STEP 6: CREATE DEFAULT USER MEMBERSHIPS
-- ============================================================================

-- Add all existing users to general community
INSERT INTO public.community_memberships (user_id, community_id, role)
SELECT 
    p.id,
    c.id,
    'member'
FROM public.profiles p
CROSS JOIN public.communities c
WHERE c.name = 'general'
ON CONFLICT (user_id, community_id) DO NOTHING;

-- ============================================================================
-- STEP 7: CLEAN UP ORPHANED DATA
-- ============================================================================

-- Remove votes for non-existent posts
DELETE FROM public.post_votes
WHERE post_id NOT IN (SELECT id FROM public.posts);

-- Remove votes for non-existent comments
DELETE FROM public.comment_votes
WHERE comment_id NOT IN (SELECT id FROM public.comments);

-- Remove likes for non-existent projects
DELETE FROM public.project_likes
WHERE project_id NOT IN (SELECT id FROM public.projects);

-- ============================================================================
-- STEP 8: VERIFY DATA INTEGRITY
-- ============================================================================

DO $$
DECLARE
    table_record RECORD;
    constraint_violations INTEGER;
BEGIN
    -- Check for foreign key violations
    constraint_violations := 0;
    
    -- Check posts reference valid communities
    SELECT COUNT(*) INTO constraint_violations
    FROM public.posts p
    WHERE NOT EXISTS (
        SELECT 1 FROM public.communities c WHERE c.id = p.community_id
    );
    
    IF constraint_violations > 0 THEN
        RAISE NOTICE 'Found % posts with invalid community references', constraint_violations;
    END IF;
    
    -- Check comments reference valid users
    SELECT COUNT(*) INTO constraint_violations
    FROM public.comments c
    WHERE NOT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = c.user_id
    );
    
    IF constraint_violations > 0 THEN
        RAISE NOTICE 'Found % comments with invalid user references', constraint_violations;
    END IF;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DATA CONSISTENCY MIGRATION COMPLETED';
    RAISE NOTICE '============================================================================';
END $$; 