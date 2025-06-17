-- Communities (like subreddits for different engineering disciplines)
create table if not exists communities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique, -- e.g., "mechanical-engineering", "electronics", "robotics"
  display_name text not null, -- e.g., "Mechanical Engineering", "Electronics", "Robotics"
  description text,
  icon_url text,
  banner_url text,
  color text default '#3B82F6', -- theme color for the community
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  member_count integer default 0,
  post_count integer default 0,
  is_official boolean default false, -- for eng.com official communities
  rules jsonb default '[]'::jsonb -- community rules as array of strings
);

-- Community memberships
create table if not exists community_memberships (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid references communities on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text default 'member' check (role in ('member', 'moderator', 'admin')),
  joined_at timestamptz default now(),
  unique(community_id, user_id)
);

-- Posts (questions, discussions, show-and-tell, etc.)
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid references communities on delete cascade,
  user_id uuid references auth.users on delete cascade,
  title text not null,
  body text,
  post_type text default 'discussion' check (post_type in ('question', 'discussion', 'show_and_tell', 'help', 'news')),
  is_pinned boolean default false,
  is_locked boolean default false,
  is_removed boolean default false,
  upvotes integer default 0,
  downvotes integer default 0,
  score real default 0, -- calculated relevance score for algorithm
  comment_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Additional fields for different post types
  tags text[] default '{}', -- e.g., ["PCB", "Arduino", "Beginner"]
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  is_solved boolean default false, -- for questions
  -- Media attachments
  images text[] default '{}', -- URLs to uploaded images
  attachments jsonb default '[]'::jsonb -- CAD files, schematics, etc.
);

-- Add score column if it doesn't exist (for existing posts tables)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS score real DEFAULT 0;

-- Votes on posts
create table if not exists post_votes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts on delete cascade,
  user_id uuid references auth.users on delete cascade,
  vote_type text check (vote_type in ('upvote', 'downvote')),
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Comments (threaded like Reddit)
create table if not exists post_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts on delete cascade,
  parent_comment_id uuid references post_comments on delete cascade, -- for threading
  user_id uuid references auth.users on delete cascade,
  body text not null,
  upvotes integer default 0,
  downvotes integer default 0,
  is_removed boolean default false,
  is_edited boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  depth integer default 0 -- for easier threading queries
);

-- Votes on comments
create table if not exists comment_votes (
  id uuid primary key default uuid_generate_v4(),
  comment_id uuid references post_comments on delete cascade,
  user_id uuid references auth.users on delete cascade,
  vote_type text check (vote_type in ('upvote', 'downvote')),
  created_at timestamptz default now(),
  unique(comment_id, user_id)
);

-- User reputation/karma system
create table if not exists user_reputation (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade unique,
  total_karma integer default 0,
  post_karma integer default 0,
  comment_karma integer default 0,
  helpful_answers integer default 0, -- for answered questions
  badges jsonb default '[]'::jsonb, -- achievement badges
  updated_at timestamptz default now()
);

-- Saved posts (like Reddit's save feature)
create table if not exists saved_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  post_id uuid references posts on delete cascade,
  saved_at timestamptz default now(),
  unique(user_id, post_id)
);

-- Post reports for moderation
create table if not exists post_reports (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts on delete cascade,
  reporter_id uuid references auth.users on delete cascade,
  reason text not null,
  details text,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

-- Indexes for performance (now safe to create after ensuring score column exists)
create index if not exists idx_posts_community_score on posts(community_id, score desc, created_at desc);
create index if not exists idx_posts_community_created on posts(community_id, created_at desc);
create index if not exists idx_posts_user on posts(user_id, created_at desc);
create index if not exists idx_post_comments_post on post_comments(post_id, created_at asc);
create index if not exists idx_post_comments_parent on post_comments(parent_comment_id, created_at asc);
create index if not exists idx_community_memberships_user on community_memberships(user_id);

-- Row-level security policies
alter table communities enable row level security;
alter table community_memberships enable row level security;
alter table posts enable row level security;
alter table post_votes enable row level security;
alter table post_comments enable row level security;
alter table comment_votes enable row level security;
alter table user_reputation enable row level security;
alter table saved_posts enable row level security;
alter table post_reports enable row level security;

-- Create policies only if they don't already exist
DO $$
BEGIN
    -- Communities are publicly readable
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'communities' AND policyname = 'Communities are publicly readable') THEN
        CREATE POLICY "Communities are publicly readable" ON communities FOR SELECT USING (true);
    END IF;

    -- Community memberships
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_memberships' AND policyname = 'Community memberships are readable by members') THEN
        CREATE POLICY "Community memberships are readable by members" ON community_memberships FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'community_memberships' AND policyname = 'Users can manage their own memberships') THEN
        CREATE POLICY "Users can manage their own memberships" ON community_memberships FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Posts policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Posts are publicly readable') THEN
        CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (NOT is_removed);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Users can create posts') THEN
        CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'Authors can update their posts') THEN
        CREATE POLICY "Authors can update their posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Vote policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_votes' AND policyname = 'Users can vote on posts') THEN
        CREATE POLICY "Users can vote on posts" ON post_votes FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comment_votes' AND policyname = 'Users can vote on comments') THEN
        CREATE POLICY "Users can vote on comments" ON comment_votes FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Comment policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_comments' AND policyname = 'Comments are publicly readable') THEN
        CREATE POLICY "Comments are publicly readable" ON post_comments FOR SELECT USING (NOT is_removed);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_comments' AND policyname = 'Users can create comments') THEN
        CREATE POLICY "Users can create comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_comments' AND policyname = 'Authors can update their comments') THEN
        CREATE POLICY "Authors can update their comments" ON post_comments FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Reputation is publicly readable
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_reputation' AND policyname = 'User reputation is publicly readable') THEN
        CREATE POLICY "User reputation is publicly readable" ON user_reputation FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_reputation' AND policyname = 'Users can update their own reputation') THEN
        CREATE POLICY "Users can update their own reputation" ON user_reputation FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Saved posts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'saved_posts' AND policyname = 'Users can manage their saved posts') THEN
        CREATE POLICY "Users can manage their saved posts" ON saved_posts FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Reports
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_reports' AND policyname = 'Users can create reports') THEN
        CREATE POLICY "Users can create reports" ON post_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
    END IF;
END $$;

-- Functions for maintaining counts and scores
create or replace function update_post_score()
returns trigger as $$
begin
  update posts
  set 
    score = (
      -- Reddit-like hot score algorithm
      log(greatest(abs(upvotes - downvotes), 1)) * 
      sign(upvotes - downvotes) + 
      (extract(epoch from created_at) - 1134028003) / 45000.0
    ),
    updated_at = now()
  where id = new.post_id;
  return new;
end;
$$ language plpgsql;

create or replace function update_post_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.vote_type = 'upvote' then
      update posts set upvotes = upvotes + 1 where id = new.post_id;
    else
      update posts set downvotes = downvotes + 1 where id = new.post_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    if old.vote_type = 'upvote' and new.vote_type = 'downvote' then
      update posts set upvotes = upvotes - 1, downvotes = downvotes + 1 where id = new.post_id;
    elsif old.vote_type = 'downvote' and new.vote_type = 'upvote' then
      update posts set downvotes = downvotes - 1, upvotes = upvotes + 1 where id = new.post_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.vote_type = 'upvote' then
      update posts set upvotes = upvotes - 1 where id = old.post_id;
    else
      update posts set downvotes = downvotes - 1 where id = old.post_id;
    end if;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

create or replace function update_comment_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if new.vote_type = 'upvote' then
      update post_comments set upvotes = upvotes + 1 where id = new.comment_id;
    else
      update post_comments set downvotes = downvotes + 1 where id = new.comment_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    if old.vote_type = 'upvote' and new.vote_type = 'downvote' then
      update post_comments set upvotes = upvotes - 1, downvotes = downvotes + 1 where id = new.comment_id;
    elsif old.vote_type = 'downvote' and new.vote_type = 'upvote' then
      update post_comments set downvotes = downvotes - 1, upvotes = upvotes + 1 where id = new.comment_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if old.vote_type = 'upvote' then
      update post_comments set upvotes = upvotes - 1 where id = old.comment_id;
    else
      update post_comments set downvotes = downvotes - 1 where id = old.comment_id;
    end if;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

-- Triggers
create trigger update_post_score_trigger
  after insert or update or delete on post_votes
  for each row execute function update_post_score();

create trigger update_post_vote_counts_trigger
  after insert or update or delete on post_votes
  for each row execute function update_post_vote_counts();

create trigger update_comment_vote_counts_trigger
  after insert or update or delete on comment_votes
  for each row execute function update_comment_vote_counts();

-- Insert default engineering communities (only if they don't exist)
insert into communities (name, display_name, description, color) values
  ('mechanical-engineering', 'Mechanical Engineering', 'Design, manufacturing, CAD, and everything mechanical', '#E11D48'),
  ('electronics', 'Electronics & PCB Design', 'Circuit design, PCBs, embedded systems, and electronic components', '#7C3AED'),
  ('robotics', 'Robotics', 'Robots, automation, control systems, and mechatronics', '#059669'),
  ('software', 'Engineering Software', 'CAD software, simulation tools, programming for engineers', '#DC2626'),
  ('materials', 'Materials Science', 'Material selection, testing, and engineering properties', '#EA580C'),
  ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', '#0891B2'),
  ('beginner', 'Beginner Questions', 'New to engineering? Ask your questions here!', '#8B5CF6'),
  ('show-and-tell', 'Show and Tell', 'Share your projects, prototypes, and achievements', '#10B981'),
  ('career', 'Engineering Careers', 'Job advice, career paths, and professional development', '#F59E0B'),
  ('general', 'General Discussion', 'Everything else engineering-related', '#6B7280')
on conflict (name) do nothing; 