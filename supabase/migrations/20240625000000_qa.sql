alter table public.comments
  add column if not exists kind text
    check (kind in ('comment','question','answer')) default 'comment',
  add column if not exists question_id uuid references public.comments(id) on delete cascade,
  add column if not exists tags text[]   default '{}',
  add column if not exists is_accepted boolean default false;

-- a tiny helper view for the feed
create or replace view public.questions_feed as
select
  c.id,
  c.body        as title,
  c.tags,
  c.created_at,
  p.handle,
  ( select count(*) from comments a where a.kind = 'answer' and a.question_id = c.id ) as answers,
  ( select max(is_accepted::int) from comments a where a.question_id = c.id )          as solved
from comments c
join profiles p on p.id = c.user_id
where c.kind = 'question'; 