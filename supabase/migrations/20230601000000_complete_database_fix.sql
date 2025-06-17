-- ============================================================================
-- COMPLETE DATABASE FIX FOR ENG.COM
-- This migration creates a consistent schema with all required tables
-- Date: 2025-01-21
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: CLEAN UP EXISTING INCONSISTENT TABLES
-- ============================================================================

-- Drop conflicting views and tables that may have incorrect schemas
DROP VIEW IF EXISTS public.project_feed CASCADE;
DROP TABLE IF EXISTS public.project_likes CASCADE;
DROP TABLE IF EXISTS public.project_versions CASCADE;

-- ============================================================================
-- STEP 2: CREATE CORE USER PROFILES TABLE
-- ============================================================================

-- Recreate profiles table with complete schema
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic user info
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    handle VARCHAR(50) UNIQUE, -- For legacy compatibility
    
    -- Profile details
    avatar_url TEXT,
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    
    -- Social links
    github_username VARCHAR(100),
    linkedin_username VARCHAR(100),
    
    -- Engineering-specific fields
    engineering_discipline VARCHAR(100),
    experience_level VARCHAR(20) CHECK (experience_level IN ('student', 'entry', 'mid', 'senior', 'expert')),
    company VARCHAR(100),
    job_title VARCHAR(100),
    
    -- Platform metrics
    post_karma INTEGER DEFAULT 0 NOT NULL,
    comment_karma INTEGER DEFAULT 0 NOT NULL,
    reputation INTEGER DEFAULT 0 NOT NULL,
    
    -- Account status
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_pro BOOLEAN DEFAULT FALSE NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    plan TEXT DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')),
    
    -- Activity tracking
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- JSON fields for flexible data
    joined_communities TEXT[] DEFAULT '{}' NOT NULL,
    saved_posts TEXT[] DEFAULT '{}' NOT NULL,
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
    }'::jsonb NOT NULL,
    
    -- Stripe integration
    stripe_customer_id TEXT,
    stripe_account_id TEXT UNIQUE,
    
    -- Legacy fields
    tip_jar_on BOOLEAN DEFAULT TRUE,
    lifetime_cents INTEGER DEFAULT 0,
    profile_complete BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- STEP 3: CREATE COMMUNITIES SYSTEM
-- ============================================================================

CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- URL-safe name
    display_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'engineering',
    color VARCHAR(7) DEFAULT '#3B82F6' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    
    -- Settings
    is_private BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    allow_posts BOOLEAN DEFAULT TRUE,
    nsfw BOOLEAN DEFAULT FALSE,
    
    -- Metrics
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    
    -- Management
    created_by UUID REFERENCES public.profiles(id),
    rules JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community memberships
CREATE TABLE public.community_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin', 'banned')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    
    UNIQUE(user_id, community_id)
);

-- ============================================================================
-- STEP 4: CREATE PROJECTS SYSTEM (WITH CONSISTENT owner_id)
-- ============================================================================

CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Basic info
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    readme TEXT,
    
    -- Engineering fields
    discipline VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    license VARCHAR(50) DEFAULT 'MIT',
    
    -- Settings
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Metrics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    
    -- Media
    image_url TEXT,
    
    -- Versioning
    current_version UUID, -- Will reference versions table
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_owner_slug UNIQUE (owner_id, slug)
);

-- Project versions
CREATE TABLE public.versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    version_no INTEGER NOT NULL,
    readme_md TEXT,
    files JSONB DEFAULT '[]'::jsonb,
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_project_version UNIQUE (project_id, version_no)
);

-- Add foreign key for current_version
ALTER TABLE public.projects 
ADD CONSTRAINT fk_current_version 
FOREIGN KEY (current_version) REFERENCES public.versions(id);

-- Project likes
CREATE TABLE public.project_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, user_id)
);

-- ============================================================================
-- STEP 5: CREATE POSTS AND COMMENTS SYSTEM
-- ============================================================================

CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    title VARCHAR(300) NOT NULL,
    content TEXT,
    post_type VARCHAR(20) DEFAULT 'discussion' CHECK (post_type IN ('showcase', 'question', 'discussion', 'news', 'tutorial', 'project')),
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    vote_count INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
    comment_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Status
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_removed BOOLEAN DEFAULT FALSE,
    is_solved BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments (unified table for both projects and posts)
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent references (one must be set)
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For threading
    
    body TEXT NOT NULL,
    content_md TEXT, -- For legacy compatibility
    depth INTEGER DEFAULT 0,
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    vote_count INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
    
    -- Status
    is_removed BOOLEAN DEFAULT FALSE,
    is_solution BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK ((project_id IS NOT NULL) OR (post_id IS NOT NULL))
);

-- ============================================================================
-- STEP 6: CREATE VOTING SYSTEM
-- ============================================================================

CREATE TABLE public.post_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, post_id)
);

CREATE TABLE public.comment_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, comment_id)
);

-- ============================================================================
-- STEP 7: CREATE MARKETPLACE SYSTEM
-- ============================================================================

CREATE TABLE public.marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Item details
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    
    -- Pricing
    base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
    commercial_multiplier DECIMAL(10,2) DEFAULT 3.0,
    extended_multiplier DECIMAL(10,2) DEFAULT 10.0,
    
    -- Features
    drm_protected BOOLEAN DEFAULT FALSE,
    escrow_eligible BOOLEAN DEFAULT FALSE,
    access_control JSONB DEFAULT '{"require_verification": false}'::jsonb,
    
    -- Metrics
    view_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended', 'sold_out')),
    featured BOOLEAN DEFAULT FALSE,
    
    -- Media
    thumbnail_url TEXT,
    images TEXT[] DEFAULT '{}',
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace purchases
CREATE TABLE public.marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Transaction details
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    license_type VARCHAR(20) NOT NULL CHECK (license_type IN ('personal', 'commercial', 'extended')),
    payment_method VARCHAR(20) DEFAULT 'stripe',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'refunded', 'disputed')),
    
    -- Stripe references
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE
);

-- Marketplace reviews
CREATE TABLE public.marketplace_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.marketplace_purchases(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    
    -- Metrics
    helpful_votes INTEGER DEFAULT 0,
    
    -- Verification
    verified_purchase BOOLEAN DEFAULT FALSE,
    
    -- Media
    images TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(item_id, reviewer_id)
);

-- ============================================================================
-- STEP 8: CREATE PAYMENTS SYSTEM
-- ============================================================================

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payer_id UUID REFERENCES public.profiles(id),
    payee_id UUID REFERENCES public.profiles(id),
    project_id UUID REFERENCES public.projects(id), -- For project tips
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    type TEXT CHECK (type IN ('tip', 'subscription')),
    stripe_payment_intent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 9: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profile indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_handle ON public.profiles(handle);
CREATE INDEX idx_profiles_engineering_discipline ON public.profiles(engineering_discipline);
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active);

-- Community indexes
CREATE INDEX idx_communities_name ON public.communities(name);
CREATE INDEX idx_communities_category ON public.communities(category);
CREATE INDEX idx_community_memberships_user_id ON public.community_memberships(user_id);
CREATE INDEX idx_community_memberships_community_id ON public.community_memberships(community_id);

-- Project indexes
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_slug ON public.projects(slug);
CREATE INDEX idx_projects_discipline ON public.projects(discipline);
CREATE INDEX idx_projects_is_public ON public.projects(is_public);
CREATE INDEX idx_projects_tags ON public.projects USING GIN(tags);

-- Version indexes
CREATE INDEX idx_versions_project_id ON public.versions(project_id);

-- Post indexes
CREATE INDEX idx_posts_community_id ON public.posts(community_id);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_vote_count ON public.posts(vote_count);

-- Comment indexes
CREATE INDEX idx_comments_project_id ON public.comments(project_id);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Vote indexes
CREATE INDEX idx_post_votes_post_id ON public.post_votes(post_id);
CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX idx_project_likes_project_id ON public.project_likes(project_id);

-- Marketplace indexes
CREATE INDEX idx_marketplace_items_seller_id ON public.marketplace_items(seller_id);
CREATE INDEX idx_marketplace_items_project_id ON public.marketplace_items(project_id);
CREATE INDEX idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX idx_marketplace_items_status ON public.marketplace_items(status);
CREATE INDEX idx_marketplace_purchases_buyer_id ON public.marketplace_purchases(buyer_id);
CREATE INDEX idx_marketplace_purchases_item_id ON public.marketplace_purchases(item_id);
CREATE INDEX idx_marketplace_reviews_item_id ON public.marketplace_reviews(item_id);

-- ============================================================================
-- STEP 10: ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 11: CREATE RLS POLICIES
-- ============================================================================

-- Profiles policies
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Communities policies
CREATE POLICY "Communities are publicly readable" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Community admins can update" ON public.communities FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.community_memberships 
        WHERE community_id = communities.id 
        AND user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
    )
);

-- Projects policies
CREATE POLICY "Public projects are readable" ON public.projects FOR SELECT USING (is_public OR auth.uid() = owner_id);
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = owner_id);

-- Versions policies
CREATE POLICY "Versions follow project visibility" ON public.versions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = versions.project_id 
        AND (is_public OR owner_id = auth.uid())
    )
);
CREATE POLICY "Project owners can manage versions" ON public.versions 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.projects 
        WHERE id = versions.project_id 
        AND owner_id = auth.uid()
    )
);

-- Posts policies
CREATE POLICY "Posts are publicly readable" ON public.posts FOR SELECT USING (NOT is_removed);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are publicly readable" ON public.comments FOR SELECT USING (NOT is_removed);
CREATE POLICY "Authenticated users can comment" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);

-- Vote policies
CREATE POLICY "Users can manage own votes" ON public.post_votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own comment votes" ON public.comment_votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own project likes" ON public.project_likes FOR ALL USING (auth.uid() = user_id);

-- Marketplace policies
CREATE POLICY "Active items are publicly readable" ON public.marketplace_items FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own items" ON public.marketplace_items FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can view own purchases" ON public.marketplace_purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Authenticated users can purchase" ON public.marketplace_purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Reviews are publicly readable" ON public.marketplace_reviews FOR SELECT USING (true);
CREATE POLICY "Verified buyers can review" ON public.marketplace_reviews FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.marketplace_purchases 
        WHERE item_id = marketplace_reviews.item_id 
        AND buyer_id = auth.uid() 
        AND status = 'completed'
    )
);

-- ============================================================================
-- STEP 12: CREATE TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_items_updated_at BEFORE UPDATE ON public.marketplace_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        username, 
        display_name, 
        handle
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
        SPLIT_PART(NEW.email, '@', 1)
    )
    ON CONFLICT (id) DO UPDATE SET 
        email = NEW.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 13: INSERT DEFAULT COMMUNITIES
-- ============================================================================

INSERT INTO public.communities (name, display_name, description, category, color, member_count, post_count) VALUES
    ('mechanical-engineering', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'engineering', '#DC2626', 15420, 892),
    ('electronics', 'Electronics & PCB Design', 'Circuit design, PCB layout, and electronic prototyping', 'engineering', '#7C3AED', 12380, 756),
    ('software-engineering', 'Software Engineering', 'Programming, algorithms, and software development', 'engineering', '#059669', 18750, 1203),
    ('robotics', 'Robotics', 'Autonomous systems, control theory, and robot design', 'engineering', '#059669', 8950, 543),
    ('materials-science', 'Materials Science', 'Material properties, testing, and selection', 'science', '#B45309', 6780, 423),
    ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', 'manufacturing', '#DC2626', 9340, 612),
    ('civil-engineering', 'Civil Engineering', 'Infrastructure, construction, and structural design', 'engineering', '#6B7280', 11200, 634),
    ('aerospace', 'Aerospace Engineering', 'Aircraft, spacecraft, and propulsion systems', 'engineering', '#2563EB', 7650, 445),
    ('chemical-engineering', 'Chemical Engineering', 'Process design, reaction engineering, and chemical plants', 'engineering', '#059669', 5890, 378),
    ('ai-ml', 'AI & Machine Learning', 'Artificial intelligence and machine learning applications', 'technology', '#8B5CF6', 13420, 823),
    ('general', 'General Discussion', 'General engineering topics and discussions', 'community', '#6B7280', 25600, 1567)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 14: CREATE USEFUL VIEWS
-- ============================================================================

-- Project feed view with all necessary data
CREATE OR REPLACE VIEW public.project_feed AS
SELECT
    p.id,
    p.title,
    p.slug,
    p.description,
    p.discipline,
    p.tags,
    p.license,
    p.image_url,
    p.view_count,
    p.like_count,
    p.download_count,
    p.is_public,
    p.created_at,
    p.updated_at,
    pr.username,
    pr.handle,
    pr.display_name,
    pr.avatar_url,
    COALESCE(SUM(pa.amount_cents), 0) as tips_cents
FROM public.projects p
JOIN public.profiles pr ON pr.id = p.owner_id
LEFT JOIN public.payments pa ON pa.project_id = p.id AND pa.type = 'tip'
WHERE p.is_public = true
GROUP BY p.id, pr.username, pr.handle, pr.display_name, pr.avatar_url;

-- Community stats view
CREATE OR REPLACE VIEW public.community_stats AS
SELECT
    c.id,
    c.name,
    c.display_name,
    c.description,
    c.category,
    c.color,
    COUNT(DISTINCT cm.user_id) as actual_member_count,
    COUNT(DISTINCT p.id) as actual_post_count,
    c.created_at
FROM public.communities c
LEFT JOIN public.community_memberships cm ON cm.community_id = c.id
LEFT JOIN public.posts p ON p.community_id = c.id
GROUP BY c.id, c.name, c.display_name, c.description, c.category, c.color, c.created_at;

-- ============================================================================
-- VERIFICATION AND MONITORING
-- ============================================================================

-- Create database monitoring function
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    size_pretty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename AS table_name,
        n_live_tup AS row_count,
        pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size_pretty
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY n_live_tup DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_database_stats() TO authenticated;

-- ============================================================================
-- FINAL MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DATABASE MIGRATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'All tables created with proper schema and RLS policies';
    RAISE NOTICE 'Default communities inserted';
    RAISE NOTICE 'Automatic profile creation trigger installed';
    RAISE NOTICE 'Database monitoring function created';
    RAISE NOTICE '============================================================================';
END $$; 