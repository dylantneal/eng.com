-- Function to increment project like count
CREATE OR REPLACE FUNCTION increment_project_like_count(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET like_count = like_count + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement project like count
CREATE OR REPLACE FUNCTION decrement_project_like_count(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE projects
  SET like_count = GREATEST(like_count - 1, 0)
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for project likes
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all project likes"
  ON project_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like projects"
  ON project_likes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can unlike their own likes"
  ON project_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS project_likes_project_id_idx ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS project_likes_user_id_idx ON project_likes(user_id);
CREATE INDEX IF NOT EXISTS project_likes_project_user_idx ON project_likes(project_id, user_id); 