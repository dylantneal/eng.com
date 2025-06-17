-- Marketplace Database Schema
-- This creates all necessary tables for the marketplace functionality

-- ============================================================================
-- Marketplace Items Table
-- ============================================================================
CREATE TABLE public.marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id), -- Optional link to project
    
    -- Basic Information
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('designs', 'kits', 'services', 'tutorials')),
    
    -- Pricing
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Licensing
    license_type VARCHAR(50) NOT NULL CHECK (license_type IN ('personal', 'commercial', 'extended')),
    license_terms TEXT,
    
    -- Media
    thumbnail_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    
    -- Metrics
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'suspended')),
    featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Marketplace Files Table
-- ============================================================================
CREATE TABLE public.marketplace_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
    
    -- File Information
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    
    -- Storage
    storage_url TEXT NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE,
    
    -- Access Control
    requires_purchase BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Purchases Table
-- ============================================================================
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.marketplace_items(id),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Transaction Details
    amount_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER NOT NULL,
    seller_earnings_cents INTEGER NOT NULL,
    tax_cents INTEGER DEFAULT 0,
    total_cents INTEGER NOT NULL,
    
    -- License
    license_type VARCHAR(50) NOT NULL,
    license_key UUID DEFAULT uuid_generate_v4(),
    
    -- Payment
    stripe_payment_intent_id TEXT,
    payment_method VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
    
    -- Escrow (if applicable)
    escrow_id UUID,
    escrow_released_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Reviews Table
-- ============================================================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
    purchase_id UUID NOT NULL REFERENCES public.purchases(id),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    
    -- Metadata
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'removed')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one review per purchase
    UNIQUE(purchase_id)
);

-- ============================================================================
-- Escrow Table
-- ============================================================================
CREATE TABLE public.escrows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES public.purchases(id),
    
    -- Escrow Details
    amount_cents INTEGER NOT NULL,
    release_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_release BOOLEAN DEFAULT TRUE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'holding' CHECK (status IN ('holding', 'released', 'disputed', 'refunded')),
    
    -- Dispute Information
    dispute_reason TEXT,
    dispute_filed_at TIMESTAMP WITH TIME ZONE,
    dispute_resolved_at TIMESTAMP WITH TIME ZONE,
    resolution VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Seller Analytics Table
-- ============================================================================
CREATE TABLE public.seller_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    date DATE NOT NULL,
    
    -- Metrics
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    purchases INTEGER DEFAULT 0,
    revenue_cents INTEGER DEFAULT 0,
    
    -- Aggregated Data
    top_items JSONB DEFAULT '[]',
    traffic_sources JSONB DEFAULT '{}',
    
    -- Unique constraint
    UNIQUE(seller_id, date)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX idx_marketplace_items_seller_id ON public.marketplace_items(seller_id);
CREATE INDEX idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX idx_marketplace_items_status ON public.marketplace_items(status);
CREATE INDEX idx_marketplace_items_price ON public.marketplace_items(price_cents);
CREATE INDEX idx_marketplace_items_rating ON public.marketplace_items(rating DESC);
CREATE INDEX idx_marketplace_items_tags ON public.marketplace_items USING GIN(tags);

CREATE INDEX idx_purchases_buyer_id ON public.purchases(buyer_id);
CREATE INDEX idx_purchases_seller_id ON public.purchases(seller_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);
CREATE INDEX idx_purchases_created_at ON public.purchases(created_at DESC);

CREATE INDEX idx_reviews_item_id ON public.reviews(item_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_analytics ENABLE ROW LEVEL SECURITY;

-- Marketplace Items Policies
CREATE POLICY "Public items are viewable by all" ON public.marketplace_items
    FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage their own items" ON public.marketplace_items
    FOR ALL USING (auth.uid() = seller_id);

-- Purchases Policies
CREATE POLICY "Users can view their own purchases" ON public.purchases
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Only system can create purchases" ON public.purchases
    FOR INSERT WITH CHECK (false); -- Only through API

-- Reviews Policies
CREATE POLICY "Reviews are publicly readable" ON public.reviews
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create reviews for their purchases" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM public.purchases
            WHERE id = purchase_id AND buyer_id = auth.uid()
        )
    );

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Update marketplace item metrics after purchase
CREATE OR REPLACE FUNCTION update_marketplace_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE public.marketplace_items
        SET purchase_count = purchase_count + 1
        WHERE id = NEW.item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_item_metrics_on_purchase
    AFTER UPDATE ON public.purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_marketplace_metrics();

-- Update item rating after review
CREATE OR REPLACE FUNCTION update_item_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.marketplace_items
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(3,2)
            FROM public.reviews
            WHERE item_id = NEW.item_id AND status = 'active'
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE item_id = NEW.item_id AND status = 'active'
        )
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_item_rating(); 