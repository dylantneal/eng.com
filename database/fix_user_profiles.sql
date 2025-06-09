-- Fix User Profiles Migration Script
-- This script ensures all existing users have complete profile data

-- First, ensure the profiles table has all required columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS post_karma INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_karma INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS joined_communities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS saved_posts TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
    "theme": "dark",
    "email_notifications": true,
    "push_notifications": true,
    "show_online_status": true,
    "public_profile": true,
    "allow_dm": true,
    "feed_algorithm": "personalized",
    "favorite_communities": [],
    "blocked_users": [],
    "nsfw_content": false
}'::jsonb;

-- Update existing users who may have NULL values
UPDATE profiles 
SET 
    post_karma = COALESCE(post_karma, 0),
    comment_karma = COALESCE(comment_karma, 0),
    is_verified = COALESCE(is_verified, FALSE),
    is_pro = COALESCE(is_pro, FALSE),
    joined_communities = COALESCE(joined_communities, '{}'),
    saved_posts = COALESCE(saved_posts, '{}'),
    preferences = COALESCE(preferences, '{
        "theme": "dark",
        "email_notifications": true,
        "push_notifications": true,
        "show_online_status": true,
        "public_profile": true,
        "allow_dm": true,
        "feed_algorithm": "personalized",
        "favorite_communities": [],
        "blocked_users": [],
        "nsfw_content": false
    }'::jsonb),
    display_name = COALESCE(display_name, username, 'User'),
    last_active = COALESCE(last_active, created_at, NOW()),
    created_at = COALESCE(created_at, NOW())
WHERE 
    post_karma IS NULL OR 
    comment_karma IS NULL OR 
    is_verified IS NULL OR 
    is_pro IS NULL OR 
    joined_communities IS NULL OR 
    saved_posts IS NULL OR 
    preferences IS NULL OR
    display_name IS NULL OR
    last_active IS NULL OR
    created_at IS NULL;

-- Ensure usernames are unique and valid
UPDATE profiles 
SET username = 'user_' || id::text 
WHERE username IS NULL OR username = '';

-- Add NOT NULL constraints after fixing data
ALTER TABLE profiles 
ALTER COLUMN post_karma SET NOT NULL,
ALTER COLUMN comment_karma SET NOT NULL,
ALTER COLUMN is_verified SET NOT NULL,
ALTER COLUMN is_pro SET NOT NULL,
ALTER COLUMN joined_communities SET NOT NULL,
ALTER COLUMN saved_posts SET NOT NULL,
ALTER COLUMN preferences SET NOT NULL,
ALTER COLUMN display_name SET NOT NULL,
ALTER COLUMN last_active SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_post_karma ON profiles(post_karma);
CREATE INDEX IF NOT EXISTS idx_profiles_comment_karma ON profiles(comment_karma);
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_is_pro ON profiles(is_pro);

-- Refresh schema cache by dropping and recreating a function
DROP FUNCTION IF EXISTS refresh_schema_cache();
CREATE OR REPLACE FUNCTION refresh_schema_cache()
RETURNS void AS $$
BEGIN
    -- This function exists to force schema cache refresh
    PERFORM 1;
END;
$$ LANGUAGE plpgsql;

SELECT refresh_schema_cache(); 