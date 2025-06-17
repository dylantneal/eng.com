-- Public projects + creator handle + cumulative tips + thumb (first file of latest version)
-- Only create this view if it doesn't already exist from the comprehensive schema fix
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'project_feed') THEN
        CREATE VIEW public.project_feed AS
        SELECT
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
        FROM public.projects p
        JOIN public.profiles       pr ON pr.id = p.owner_id
        -- Sum tips specifically for this project's owner (payee) and related to this project if payments table has project_id
        -- The current join on pa.payee_id = p.owner_id is for all tips to the owner.
        -- If tips are project-specific in payments table:
        LEFT JOIN public.payments  pa ON pa.project_id = p.id AND pa.type = 'tip'
        WHERE p.is_public = true
        GROUP BY p.id, pr.handle;
    END IF;
END $$; 