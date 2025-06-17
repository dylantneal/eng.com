-- Fix for missing display_name column in communities table
-- This resolves the "column communities_1.display_name does not exist" error

-- First, check if display_name column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communities' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE communities ADD COLUMN display_name text;
    END IF;
END $$;

-- Update existing communities to have display_name based on name
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
WHERE display_name IS NULL OR display_name = '';

-- Ensure communities table has proper color column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'communities' AND column_name = 'color'
    ) THEN
        ALTER TABLE communities ADD COLUMN color text DEFAULT '#3B82F6';
    END IF;
END $$;

-- Update community colors
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
WHERE color IS NULL OR color = '';

-- Handle posts table - create if not exists, add missing columns if exists
DO $$ 
BEGIN
    -- Create posts table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        CREATE TABLE posts (
            id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
            title text NOT NULL,
            content text,
            community_id text REFERENCES communities(id),
            user_id uuid REFERENCES profiles(id),
            vote_count integer DEFAULT 0,
            comment_count integer DEFAULT 0,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            post_type text DEFAULT 'discussion',
            tags text[] DEFAULT '{}',
            images text[] DEFAULT '{}',
            is_pinned boolean DEFAULT false
        );
    ELSE
        -- Table exists, add missing columns
        
        -- Add user_id if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
            ALTER TABLE posts ADD COLUMN user_id uuid REFERENCES profiles(id);
        END IF;
        
        -- Add vote_count if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'vote_count') THEN
            ALTER TABLE posts ADD COLUMN vote_count integer DEFAULT 0;
        END IF;
        
        -- Add comment_count if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comment_count') THEN
            ALTER TABLE posts ADD COLUMN comment_count integer DEFAULT 0;
        END IF;
        
        -- Add post_type if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'post_type') THEN
            ALTER TABLE posts ADD COLUMN post_type text DEFAULT 'discussion';
        END IF;
        
        -- Add tags if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'tags') THEN
            ALTER TABLE posts ADD COLUMN tags text[] DEFAULT '{}';
        END IF;
        
        -- Add images if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'images') THEN
            ALTER TABLE posts ADD COLUMN images text[] DEFAULT '{}';
        END IF;
        
        -- Add is_pinned if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_pinned') THEN
            ALTER TABLE posts ADD COLUMN is_pinned boolean DEFAULT false;
        END IF;
        
        -- Add updated_at if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
            ALTER TABLE posts ADD COLUMN updated_at timestamptz DEFAULT now();
        END IF;
    END IF;
END $$;

-- Insert sample posts if table is empty (only if user_id column now exists)
DO $$
BEGIN
    -- Only insert if posts table is empty and has user_id column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') 
       AND NOT EXISTS (SELECT 1 FROM posts WHERE id = '1') THEN
        
        -- Insert sample post if we have both communities and profiles
        IF EXISTS (SELECT 1 FROM communities WHERE name = 'robotics')
           AND EXISTS (SELECT 1 FROM profiles) THEN
            
            INSERT INTO posts (id, title, content, community_id, user_id, post_type, tags, vote_count, comment_count, created_at)
            VALUES (
                '1', 
                'Welcome to the Engineering Community!',
                'This is a test post to verify the database is working correctly.',
                (SELECT id FROM communities WHERE name = 'robotics' LIMIT 1),
                (SELECT id FROM profiles LIMIT 1),
                'announcement',
                ARRAY['welcome', 'test'],
                5,
                2,
                now()
            );
        END IF;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_vote_count ON posts(vote_count DESC); 