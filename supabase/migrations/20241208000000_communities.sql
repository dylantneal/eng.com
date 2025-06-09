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
  author_id uuid references auth.users on delete cascade,
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
  author_id uuid references auth.users on delete cascade,
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

-- Indexes for performance
create index if not exists idx_posts_community_score on posts(community_id, score desc, created_at desc);
create index if not exists idx_posts_community_created on posts(community_id, created_at desc);
create index if not exists idx_posts_author on posts(author_id, created_at desc);
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

-- Communities are publicly readable
create policy "Communities are publicly readable" on communities for select using (true);

-- Community memberships
create policy "Community memberships are readable by members" on community_memberships for select using (true);
create policy "Users can manage their own memberships" on community_memberships for all using (auth.uid() = user_id);

-- Posts policies
create policy "Posts are publicly readable" on posts for select using (not is_removed);
create policy "Users can create posts" on posts for insert with check (auth.uid() = author_id);
create policy "Authors can update their posts" on posts for update using (auth.uid() = author_id);

-- Vote policies
create policy "Users can vote on posts" on post_votes for all using (auth.uid() = user_id);
create policy "Users can vote on comments" on comment_votes for all using (auth.uid() = user_id);

-- Comment policies
create policy "Comments are publicly readable" on post_comments for select using (not is_removed);
create policy "Users can create comments" on post_comments for insert with check (auth.uid() = author_id);
create policy "Authors can update their comments" on post_comments for update using (auth.uid() = author_id);

-- Reputation is publicly readable
create policy "User reputation is publicly readable" on user_reputation for select using (true);
create policy "Users can update their own reputation" on user_reputation for all using (auth.uid() = user_id);

-- Saved posts
create policy "Users can manage their saved posts" on saved_posts for all using (auth.uid() = user_id);

-- Reports
create policy "Users can create reports" on post_reports for insert with check (auth.uid() = reporter_id);

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

-- Insert default engineering communities
insert into communities (name, display_name, description, color, is_official) values
  ('mechanical-engineering', 'Mechanical Engineering', 'Design, manufacturing, CAD, and everything mechanical', '#E11D48', true),
  ('electronics', 'Electronics & PCB Design', 'Circuit design, PCBs, embedded systems, and electronic components', '#7C3AED', true),
  ('robotics', 'Robotics', 'Robots, automation, control systems, and mechatronics', '#059669', true),
  ('software', 'Engineering Software', 'CAD software, simulation tools, programming for engineers', '#DC2626', true),
  ('materials', 'Materials Science', 'Material selection, testing, and engineering properties', '#EA580C', true),
  ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', '#0891B2', true),
  ('beginner', 'Beginner Questions', 'New to engineering? Ask your questions here!', '#8B5CF6', true),
  ('show-and-tell', 'Show and Tell', 'Share your projects, prototypes, and achievements', '#10B981', true),
  ('career', 'Engineering Careers', 'Job advice, career paths, and professional development', '#F59E0B', true),
  ('general', 'General Discussion', 'Everything else engineering-related', '#6B7280', true)
on conflict (name) do nothing; 