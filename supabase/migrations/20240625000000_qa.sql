alter table public.comments
  add column if not exists kind text
    check (kind in ('comment','question','answer')) default 'comment',
  add column if not exists question_id uuid references public.comments(id) on delete cascade,
  add column if not exists tags text[]   default '{}',
  add column if not exists is_accepted boolean default false;

-- Define the function to award reputation (idempotent)
CREATE OR REPLACE FUNCTION public.fn_award_rep()
RETURNS TRIGGER AS $$
DECLARE
  answer_author uuid;
BEGIN
  -- fire only on first acceptance
  IF NEW.is_accepted = TRUE AND COALESCE(OLD.is_accepted, FALSE) = FALSE THEN
     SELECT user_id INTO answer_author FROM public.comments WHERE id = NEW.id;
     UPDATE public.profiles
        SET reputation = COALESCE(reputation, 0) + 5
      WHERE id = answer_author;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- award +5 reputation when an answer is accepted -----------------
drop trigger if exists trg_award_rep on public.comments;
create trigger trg_award_rep
  before update of is_accepted on public.comments
  for each row execute function public.fn_award_rep(); 