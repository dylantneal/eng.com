-- Enhanced Authentication Schema for eng.com Community Platform
-- This schema supports full user authentication, community management, and social features

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION TABLES
-- ============================================================================

-- Updated profiles table with comprehensive user information
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    github_username VARCHAR(100),
    linkedin_username VARCHAR(100),
    
    -- Engineering-specific fields
    engineering_discipline VARCHAR(100),
    experience_level VARCHAR(20) CHECK (experience_level IN ('student', 'entry', 'mid', 'senior', 'expert')),
    company VARCHAR(100),
    job_title VARCHAR(100),
    
    -- Account status and metrics
    post_karma INTEGER DEFAULT 0,
    comment_karma INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_pro BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Activity tracking
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- JSON fields for flexible data
    joined_communities TEXT[] DEFAULT '{}',
    saved_posts TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{
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
    }'::jsonb
);

-- User sessions for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- COMMUNITIES & MEMBERSHIP TABLES
-- ============================================================================

-- Enhanced communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL CHECK (name ~ '^[a-z0-9-]+$'),
    display_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    category VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    
    -- Community settings
    is_private BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    allow_posts BOOLEAN DEFAULT TRUE,
    allow_images BOOLEAN DEFAULT TRUE,
    allow_polls BOOLEAN DEFAULT TRUE,
    nsfw BOOLEAN DEFAULT FALSE,
    
    -- Metrics
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Moderation
    created_by UUID REFERENCES profiles(id),
    rules JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}'
);

-- Community memberships with roles
CREATE TABLE IF NOT EXISTS community_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin', 'banned')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, community_id)
);

-- ============================================================================
-- POSTS & CONTENT TABLES
-- ============================================================================

-- Enhanced posts table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    content TEXT,
    post_type VARCHAR(20) DEFAULT 'discussion' CHECK (post_type IN ('showcase', 'question', 'discussion', 'news', 'research', 'tutorial', 'project', 'review')),
    
    -- Relationships
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Content metadata
    tags TEXT[] DEFAULT '{}',
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    images TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Engagement metrics
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    vote_count INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Algorithmic scoring
    hot_score DECIMAL DEFAULT 0,
    trending_score DECIMAL DEFAULT 0,
    
    -- Status and moderation
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_removed BOOLEAN DEFAULT FALSE,
    is_solved BOOLEAN DEFAULT FALSE,
    removal_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post votes
CREATE TABLE IF NOT EXISTS post_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, post_id)
);

-- Saved posts
CREATE TABLE IF NOT EXISTS saved_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}',
    
    UNIQUE(user_id, post_id)
);

-- ============================================================================
-- COMMENTS & DISCUSSIONS
-- ============================================================================

-- Post comments with threading support
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    depth INTEGER DEFAULT 0,
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    vote_count INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
    
    -- Status
    is_removed BOOLEAN DEFAULT FALSE,
    is_solution BOOLEAN DEFAULT FALSE,
    removal_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment votes
CREATE TABLE IF NOT EXISTS comment_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, comment_id)
);

-- ============================================================================
-- NOTIFICATIONS & MESSAGING
-- ============================================================================

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- Related entities
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_engineering_discipline ON profiles(engineering_discipline);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_communities_name ON communities(name);
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user_id ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_community_id ON community_memberships(community_id);

-- Post indexes
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_hot_score ON posts(hot_score);
CREATE INDEX IF NOT EXISTS idx_posts_vote_count ON posts(vote_count);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

-- Vote indexes
CREATE INDEX IF NOT EXISTS idx_post_votes_user_post ON post_votes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_post_id ON post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_comment_votes_user_comment ON comment_votes(user_id, comment_id);

-- Comment indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON post_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update post vote counts
CREATE OR REPLACE FUNCTION update_post_votes(post_id UUID, karma_change INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET 
        upvotes = GREATEST(0, upvotes + CASE WHEN karma_change > 0 THEN karma_change ELSE 0 END),
        downvotes = GREATEST(0, downvotes + CASE WHEN karma_change < 0 THEN ABS(karma_change) ELSE 0 END),
        last_activity_at = NOW()
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment community member count
CREATE OR REPLACE FUNCTION increment_community_members(community_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE communities 
    SET member_count = member_count + 1 
    WHERE id = community_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement community member count
CREATE OR REPLACE FUNCTION decrement_community_members(community_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE communities 
    SET member_count = GREATEST(0, member_count - 1) 
    WHERE id = community_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment community post count
CREATE OR REPLACE FUNCTION increment_community_posts(community_name VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE communities 
    SET post_count = post_count + 1 
    WHERE name = community_name;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate hot score (Reddit-style algorithm)
CREATE OR REPLACE FUNCTION calculate_hot_score(upvotes INTEGER, downvotes INTEGER, created_at TIMESTAMP WITH TIME ZONE)
RETURNS DECIMAL AS $$
DECLARE
    score INTEGER;
    order_val DECIMAL;
    sign_val INTEGER;
    seconds DECIMAL;
BEGIN
    score := upvotes - downvotes;
    
    IF score > 0 THEN
        sign_val := 1;
    ELSIF score < 0 THEN
        sign_val := -1;
    ELSE
        sign_val := 0;
    END IF;
    
    order_val := LOG(GREATEST(ABS(score), 1));
    seconds := EXTRACT(EPOCH FROM (created_at - '2005-12-08 07:46:43'::timestamp)) / 45000;
    
    RETURN ROUND((sign_val * order_val + seconds)::numeric, 7);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA - Engineering Communities
-- ============================================================================

INSERT INTO communities (name, display_name, description, category, color, created_at) VALUES
-- Core Engineering Disciplines
('mechanical', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'core', '#1F2937', NOW()),
('electrical', 'Electrical Engineering', 'Circuits, power systems, and electrical design', 'core', '#3B82F6', NOW()),
('civil', 'Civil Engineering', 'Infrastructure, construction, and structural engineering', 'core', '#10B981', NOW()),
('chemical', 'Chemical Engineering', 'Process design, materials, and chemical systems', 'core', '#F59E0B', NOW()),
('software', 'Software Engineering', 'Programming, systems design, and software development', 'core', '#8B5CF6', NOW()),
('aerospace', 'Aerospace Engineering', 'Aircraft, spacecraft, and propulsion systems', 'core', '#EF4444', NOW()),
('biomedical', 'Biomedical Engineering', 'Medical devices, biomaterials, and healthcare technology', 'core', '#EC4899', NOW()),

-- Specialized Fields
('robotics', 'Robotics & Automation', 'Robotic systems, automation, and AI applications', 'specialized', '#059669', NOW()),
('electronics', 'Electronics & PCB Design', 'Circuit design, PCBs, and electronic systems', 'specialized', '#DC2626', NOW()),
('materials', 'Materials Science', 'Material properties, testing, and development', 'specialized', '#7C3AED', NOW()),
('manufacturing', 'Manufacturing & Production', 'Manufacturing processes and production systems', 'specialized', '#0891B2', NOW()),
('3d-printing', '3D Printing & Additive Manufacturing', 'Additive manufacturing technologies and applications', 'specialized', '#F97316', NOW()),

-- Technology Areas
('iot', 'IoT & Embedded Systems', 'Internet of Things and embedded system development', 'technology', '#06B6D4', NOW()),
('ai-ml', 'AI & Machine Learning', 'Artificial intelligence and machine learning applications', 'technology', '#8B5CF6', NOW()),
('renewable-energy', 'Renewable Energy', 'Solar, wind, and sustainable energy technologies', 'technology', '#10B981', NOW()),
('automotive', 'Automotive Engineering', 'Vehicle design, autonomous systems, and transportation', 'technology', '#374151', NOW()),
('quantum', 'Quantum Computing', 'Quantum systems and quantum computing research', 'technology', '#7C3AED', NOW()),
('nanotech', 'Nanotechnology', 'Nanoscale engineering and applications', 'technology', '#F59E0B', NOW()),

-- Tools and Career
('cad-design', 'CAD & Design Tools', 'Computer-aided design and engineering tools', 'tools', '#6B7280', NOW()),
('simulation', 'Simulation & Analysis', 'FEA, CFD, and engineering simulation tools', 'tools', '#1F2937', NOW()),
('careers', 'Engineering Careers', 'Career advice, interviews, and professional development', 'career', '#3B82F6', NOW()),
('projects', 'Project Showcase', 'Share your engineering projects and get feedback', 'community', '#EF4444', NOW()),
('students', 'Engineering Students', 'Resources and discussions for engineering students', 'community', '#10B981', NOW()),
('fundamentals', 'Engineering Fundamentals', 'Basic concepts, theory, and educational content', 'community', '#F59E0B', NOW())

ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Create a sample admin user (in production, this would be created through the app)
INSERT INTO profiles (
    id, email, username, display_name, engineering_discipline, 
    experience_level, company, job_title, bio, is_verified, is_pro
) VALUES (
    uuid_generate_v4(),
    'admin@eng.com',
    'eng_admin',
    'Engineering Admin',
    'Software Engineering',
    'expert',
    'eng.com',
    'Platform Engineer',
    'Building the future of engineering collaboration',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

COMMENT ON SCHEMA public IS 'Enhanced eng.com authentication and community platform schema'; 