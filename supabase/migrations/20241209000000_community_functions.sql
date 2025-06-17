-- Database functions for community operations

-- Function to increment post comment count
CREATE OR REPLACE FUNCTION increment_post_comment_count(post_id text)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comment_count = comment_count + 1,
      updated_at = now()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement post comment count
CREATE OR REPLACE FUNCTION decrement_post_comment_count(post_id text)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET comment_count = GREATEST(comment_count - 1, 0),
      updated_at = now()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update vote counts when votes are added/removed/changed
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New vote added
    IF NEW.vote_type = 'upvote' THEN
      UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
    ELSIF NEW.vote_type = 'downvote' THEN
      UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Vote changed
    IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
      UPDATE posts SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.post_id;
    ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
      UPDATE posts SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Vote removed
    IF OLD.vote_type = 'upvote' THEN
      UPDATE posts SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.post_id;
    ELSIF OLD.vote_type = 'downvote' THEN
      UPDATE posts SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment vote counts
CREATE OR REPLACE FUNCTION update_comment_vote_counts()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New vote added
    IF NEW.vote_type = 'upvote' THEN
      UPDATE post_comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.vote_type = 'downvote' THEN
      UPDATE post_comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Vote changed
    IF OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN
      UPDATE post_comments SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.comment_id;
    ELSIF OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN
      UPDATE post_comments SET downvotes = downvotes - 1, upvotes = upvotes + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Vote removed
    IF OLD.vote_type = 'upvote' THEN
      UPDATE post_comments SET upvotes = GREATEST(upvotes - 1, 0) WHERE id = OLD.comment_id;
    ELSIF OLD.vote_type = 'downvote' THEN
      UPDATE post_comments SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for post votes (drop existing first to avoid conflicts)
DROP TRIGGER IF EXISTS post_votes_trigger ON post_votes;
CREATE TRIGGER post_votes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON post_votes
  FOR EACH ROW EXECUTE FUNCTION update_post_vote_counts();

-- Create triggers for comment votes (drop existing first to avoid conflicts)
DROP TRIGGER IF EXISTS comment_votes_trigger ON comment_votes;
CREATE TRIGGER comment_votes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON comment_votes
  FOR EACH ROW EXECUTE FUNCTION update_comment_vote_counts();

-- Function to get post with vote information for a specific user
CREATE OR REPLACE FUNCTION get_post_with_user_vote(post_id text, user_id uuid)
RETURNS TABLE (
  id text,
  title text,
  content text,
  community_id text,
  author_id uuid,
  upvotes integer,
  downvotes integer,
  comment_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  user_vote text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.community_id,
    p.user_id as author_id,
    p.vote_count as upvotes,
    0 as downvotes, -- Assuming vote_count is net votes for now
    p.comment_count,
    p.created_at,
    p.updated_at,
    pv.vote_type as user_vote
  FROM posts p
  LEFT JOIN post_votes pv ON p.id = pv.post_id AND pv.user_id = get_post_with_user_vote.user_id
  WHERE p.id = get_post_with_user_vote.post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get comments with vote information for a specific user
CREATE OR REPLACE FUNCTION get_comments_with_user_votes(target_post_id text, target_user_id uuid)
RETURNS TABLE (
  id uuid,
  post_id uuid,
  parent_comment_id uuid,
  author_id uuid,
  body text,
  upvotes integer,
  downvotes integer,
  depth integer,
  created_at timestamptz,
  updated_at timestamptz,
  user_vote text,
  author_username text,
  author_display_name text,
  author_avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.post_id,
    pc.parent_comment_id,
    pc.author_id,
    pc.body,
    pc.upvotes,
    pc.downvotes,
    pc.depth,
    pc.created_at,
    pc.updated_at,
    cv.vote_type as user_vote,
    p.username as author_username,
    p.display_name as author_display_name,
    p.avatar_url as author_avatar_url
  FROM post_comments pc
  LEFT JOIN comment_votes cv ON pc.id = cv.comment_id AND cv.user_id = target_user_id
  LEFT JOIN profiles p ON pc.author_id = p.id
  WHERE pc.post_id::text = target_post_id
  ORDER BY pc.created_at ASC;
END;
$$ LANGUAGE plpgsql; 