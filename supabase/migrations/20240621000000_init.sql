-- UUID helpers -------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- Profiles (1-to-1 with auth.users) ---------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Projects -----------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users on delete cascade,
  title text not null,
  slug text not null unique,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Versions -----------------------------------------------------------------
create table if not exists versions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects on delete cascade,
  readme text,
  files jsonb,
  created_at timestamptz default now()
);

-- Comments -----------------------------------------------------------------
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects on delete cascade,
  user_id uuid references auth.users on delete cascade,
  body text,
  created_at timestamptz default now()
);

-- Payments (tips & subscriptions) -----------------------------------------
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  payer_id uuid references auth.users,
  payee_id uuid references auth.users,
  amount_cents integer not null check (amount_cents > 0),
  type text check (type in ('tip','subscription')),
  stripe_payment_intent text,
  created_at timestamptz default now()
);

-- Row-level security -------------------------------------------------------
alter table profiles enable row level security;
alter table projects enable row level security;
alter table versions enable row level security;
alter table comments enable row level security;
alter table payments enable row level security;

create policy "Public profiles are viewable" on profiles for select using (true);
create policy "Users manage own profile"    on profiles for all
  using (auth.uid() = id);

create policy "Owner manages project"       on projects for all
  using (auth.uid() = owner_id);

create policy "Public projects are readable" on projects for select
  using (is_public or auth.uid() = owner_id); 