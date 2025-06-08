-- Profiles --------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text unique not null,
  avatar_url    text,
  bio           text,
  tip_jar_on    boolean default true,
  lifetime_cents integer default 0,
  plan          text default 'free',
  created_at    timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "public profiles" on public.profiles
  for select
  using (true);

-- Projects --------------------------------------------------------------------
create table if not exists public.projects (
  id             uuid primary key default uuid_generate_v4(),
  owner_id       uuid references public.profiles(id) on delete cascade,
  slug           text not null,
  title          text not null,
  is_public      boolean default true,
  current_version uuid,                -- fk added below after versions table
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  constraint unique_owner_slug unique (owner_id, slug)
);

alter table public.projects enable row level security;
create policy "Project: owners or public" on public.projects
  for select using (is_public or auth.uid() = owner_id);

-- make sure the column exists on pre-existing databases -------------------
alter table public.projects
  add column if not exists current_version uuid;

-- Versions --------------------------------------------------------------------
create table if not exists public.project_versions (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid references public.projects(id) on delete cascade,
  version_no  integer not null,
  readme_md   text,
  files       jsonb,                     -- [{name, path, size, mime}]
  created_at  timestamptz default now(),
  constraint unique_proj_version unique (project_id, version_no)
);

-- hook the projects.current_version fk (only if still missing)
do $$
begin
  -- add the column again, in case the previous ALTER was skipped
  if not exists (
    select 1
    from   information_schema.columns
    where  table_schema = 'public'
    and    table_name   = 'projects'
    and    column_name  = 'current_version'
  ) then
    alter table public.projects
      add column current_version uuid;
  end if;

  -- now add the FK constraint if it isn't there yet
  if not exists (
    select 1
    from   pg_constraint
    where  conname   = 'fk_current_version'
    and    conrelid  = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint fk_current_version
      foreign key (current_version)
      references public.project_versions(id);
  end if;
end
$$;

-- Comments (also doubles as Mini-Q&A) ----------------------------------------
create table if not exists public.comments (
  id          uuid primary key default uuid_generate_v4(),
  project_id  uuid references public.projects(id) on delete cascade,
  parent_id   uuid references public.comments(id),
  user_id     uuid references public.profiles(id) on delete cascade,
  content_md  text,
  kind        text default 'comment',    -- 'comment' | 'question' | 'answer'
  is_accepted boolean default false,
  upvotes     integer default 0,
  created_at  timestamptz default now()
);

alter table public.comments enable row level security;
create policy "Comments: read public or own project" on public.comments
  for select using (
    (select is_public from public.projects p where p.id = project_id)
    or auth.uid() = (select owner_id from public.projects p where p.id = project_id)
  );

-- Payments --------------------------------------------------------------------
create table if not exists public.payments (
  id                 uuid primary key default uuid_generate_v4(),
  payer              uuid references public.profiles(id),
  payee              uuid references public.profiles(id),
  project_id         uuid references public.projects(id),
  amount_cents       integer not null,
  stripe_intent_id   text,
  type               text,              -- 'tip' | 'subscription'
  created_at         timestamptz default now()
);

-- simple trigger to keep lifetime tip counter up-to-date
create or replace function public.fn_accumulate_tip() returns trigger as $$
begin
  if (new.type = 'tip') then
    update public.profiles
      set lifetime_cents = lifetime_cents + new.amount_cents
    where id = new.payee;
  end if;
  return new;
end $$ language plpgsql;

drop trigger if exists trg_acc_tip on public.payments;
create trigger trg_acc_tip
  after insert on public.payments
  for each row execute function public.fn_accumulate_tip();

-- Add the missing RPC function
CREATE OR REPLACE FUNCTION public.set_private_projects_read_only(p_stripe_customer_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find the user_id associated with the stripe_customer_id
  SELECT id INTO v_user_id FROM public.profiles WHERE stripe_customer_id = p_stripe_customer_id;

  IF v_user_id IS NOT NULL THEN
    -- Example: Update projects to be non-public or add a read_only flag
    -- This is a placeholder; actual logic depends on your schema and requirements.
    -- For instance, if you have an `is_archived` or `access_level` column:
    UPDATE public.projects
    SET is_public = false -- Or some other status indicating read-only for private
    WHERE owner_id = v_user_id AND is_public = false; -- Target only currently private projects
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Ensure appropriate permissions if needed, e.g., GRANT EXECUTE ON FUNCTION public.set_private_projects_read_only(TEXT) TO supabase_admin_user_or_role; 