-- Public projects + creator handle + cumulative tips + thumb (first file of latest version)
create or replace view public.project_feed as
select
  p.id,
  p.title,
  p.slug,
  p.created_at,
  pr.handle as handle,
  coalesce(sum(pa.amount_cents), 0)             as tips_cents,
  (
    select p.id || '/' || (pv.files->0->>'name') -- Construct path: project_id/filename
    from public.project_versions pv
    where pv.project_id = p.id
    -- and pv.id = p.current_version -- If you want thumb from specifically the current_version
    order by pv.created_at desc limit 1 -- Or, thumb from the absolute latest version
  )                                             as thumb_path -- This is the crucial column
from public.projects p
join public.profiles       pr on pr.id = p.owner_id
-- Sum tips specifically for this project's owner (payee) and related to this project if payments table has project_id
-- The current join on pa.payee_id = p.owner_id is for all tips to the owner.
-- If tips are project-specific in payments table:
left join public.payments  pa on pa.project_id = p.id and pa.type = 'tip'
where p.is_public = true
group by p.id, pr.handle; 