-- A simple "bookmark" join-table between users and projects
create table if not exists public.bookmarks (
  user_id    uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  inserted_at timestamptz default now(),

  primary key (user_id, project_id)
);

/* --- Row-Level-Security (optional but recommended) ---------------------- */
alter table public.bookmarks enable row level security;

create policy "Users can see their own bookmarks"
  on public.bookmarks for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own bookmark"
  on public.bookmarks for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own bookmark"
  on public.bookmarks for delete
  using ( auth.uid() = user_id ); 