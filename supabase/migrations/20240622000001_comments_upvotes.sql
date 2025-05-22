alter table comments
  add column if not exists upvotes integer default 0,
  add column if not exists is_answer boolean default false;

create or replace function public.bump_rep()
returns trigger as $$
begin
  update profiles set rep = coalesce(rep,0) + 1 where id = new.user_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_bump_rep on comments;
create trigger trg_bump_rep
after insert on comments
for each row execute procedure bump_rep(); 