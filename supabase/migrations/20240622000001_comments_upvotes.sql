-- Only modify comments table if it exists and doesn't already have these columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        -- Add upvotes column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'upvotes') THEN
            ALTER TABLE comments ADD COLUMN upvotes integer default 0;
        END IF;
        
        -- Add is_answer column if it doesn't exist  
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'is_answer') THEN
            ALTER TABLE comments ADD COLUMN is_answer boolean default false;
        END IF;
    END IF;
END $$;

create or replace function public.bump_rep()
returns trigger as $$
begin
  update profiles set rep = coalesce(rep,0) + 1 where id = new.user_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bump_rep on comments;

-- Only create trigger if comments table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments') THEN
        CREATE TRIGGER trg_bump_rep
        AFTER INSERT ON comments
        FOR EACH ROW EXECUTE PROCEDURE bump_rep();
    END IF;
END $$; 