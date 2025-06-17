-- Function to increment project comment count
CREATE OR REPLACE FUNCTION public.increment_project_comments(project_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.projects 
    SET comment_count = COALESCE(comment_count, 0) + 1
    WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment_count column if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Create trigger to automatically update comment count
CREATE OR REPLACE FUNCTION public.handle_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.projects 
        SET comment_count = COALESCE(comment_count, 0) + 1
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.projects 
        SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
        WHERE id = OLD.project_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_comment_count ON public.comments;
CREATE TRIGGER trg_handle_comment_count
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_comment_count(); 