-- Public projects + creator handle + cumulative tips + thumb (first file of latest version)
create or replace view public.project_feed as
select
  p.id,
  p.title,
  p.slug,
  p.created_at,
  pr.handle,
  coalesce(sum(pa.amount_cents), 0)             as tips_cents,
  (
    select (v.files->0->>'name')                -- crude thumb (first file)
    from versions v
    where v.project_id = p.id
    order by v.created_at desc limit 1
  )                                             as thumb
from projects p
join profiles       pr on pr.id = p.owner_id
left join payments  pa on pa.payee_id = p.owner_id and pa.type = 'tip'
where p.is_public = true
group by p.id, pr.handle; 