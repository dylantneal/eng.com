-- Create user_reputation table
CREATE TABLE IF NOT EXISTS user_reputation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_aura INTEGER DEFAULT 0,
    post_aura INTEGER DEFAULT 0,
    comment_aura INTEGER DEFAULT 0,
    helpful_answers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    description TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_type)
);

-- Create function to update reputation
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update post aura
    IF TG_TABLE_NAME = 'posts' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_reputation
            SET post_aura = post_aura + 1,
                total_aura = total_aura + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_reputation
            SET post_aura = post_aura - 1,
                total_aura = total_aura - 1,
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
        END IF;
    END IF;

    -- Update comment aura
    IF TG_TABLE_NAME = 'comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_reputation
            SET comment_aura = comment_aura + 1,
                total_aura = total_aura + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_reputation
            SET comment_aura = comment_aura - 1,
                total_aura = total_aura - 1,
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
        END IF;
    END IF;

    -- Update helpful answers
    IF TG_TABLE_NAME = 'post_votes' AND NEW.is_helpful = true THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_reputation
            SET helpful_answers = helpful_answers + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_reputation
            SET helpful_answers = helpful_answers - 1,
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for reputation updates
CREATE TRIGGER update_reputation_on_post
    AFTER INSERT OR DELETE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_reputation();

CREATE TRIGGER update_reputation_on_comment
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_user_reputation();

CREATE TRIGGER update_reputation_on_vote
    AFTER INSERT OR DELETE ON post_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_user_reputation();

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
BEGIN
    -- Helper badge
    IF NEW.helpful_answers >= 10 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, description)
        VALUES (NEW.user_id, 'helper', 'Helper', 'Helped 10 or more users')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- Popular badge
    IF NEW.post_aura >= 100 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, description)
        VALUES (NEW.user_id, 'popular', 'Popular', 'Received 100 or more post upvotes')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    -- Commentator badge
    IF NEW.comment_aura >= 50 THEN
        INSERT INTO user_badges (user_id, badge_type, badge_name, description)
        VALUES (NEW.user_id, 'commentator', 'Commentator', 'Received 50 or more comment upvotes')
        ON CONFLICT (user_id, badge_type) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for badge awards
CREATE TRIGGER check_badges_on_reputation_update
    AFTER UPDATE ON user_reputation
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_badges();

-- Add RLS policies
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Allow users to read any reputation
CREATE POLICY "Users can read any reputation"
    ON user_reputation FOR SELECT
    USING (true);

-- Allow users to read any badges
CREATE POLICY "Users can read any badges"
    ON user_badges FOR SELECT
    USING (true);

-- Only allow system to modify reputation
CREATE POLICY "Only system can modify reputation"
    ON user_reputation FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (false);

-- Only allow system to modify badges
CREATE POLICY "Only system can modify badges"
    ON user_badges FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (false); 