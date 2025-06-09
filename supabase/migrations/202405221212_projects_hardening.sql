-- 1-A  ────────────────────────────────────────────────────────────────────────
-- Automatic version_no and projects.current_version
CREATE OR REPLACE FUNCTION public.handle_new_project_version()
RETURNS TRIGGER AS $$
DECLARE
    next_no INTEGER;
BEGIN
    -- figure out the next version number for this project
    SELECT COALESCE(MAX(version_no), 0) + 1
      INTO next_no
      FROM project_versions
     WHERE project_id = NEW.project_id;

    NEW.version_no := next_no;

    -- record the UUID of the version we're inserting, **not** the number
    UPDATE projects
       SET current_version = NEW.id,
           updated_at      = NOW()
     WHERE id = NEW.project_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_handle_new_project_version
        ON project_versions;

CREATE TRIGGER trg_handle_new_project_version
BEFORE INSERT ON project_versions
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_project_version();

-- 1-B  ────────────────────────────────────────────────────────────────────────
-- Files array <= 5, allowed MIME types and ≤ 100 MB total

------------------------------------------------------------------
-- 2. Validate the `files` array stored on each project_version
------------------------------------------------------------------

-- (re-run safe) helper; uses sub-queries internally, so the CHECK
-- itself can stay simple.  Marked IMMUTABLE so PostgreSQL is happy.
create or replace function public.fn_project_files_ok(p_files jsonb)
returns boolean
language plpgsql
immutable
as $$
declare
  total_size int;      -- bytes
  mime_ok    boolean;
begin
  -- must be an array with at most 5 elements
  if jsonb_typeof(p_files) <> 'array'
     or jsonb_array_length(p_files) > 5 then
    return false;
  end if;

  -- aggregate size (sum of "size") and mime validity
  select
    sum((f->>'size')::int),
    bool_and( (f->>'mime') in (
      'image/png', 'image/jpeg', 'application/zip',
      'application/pdf', 'video/mp4'
    ))
  into  total_size, mime_ok
  from  jsonb_array_elements(p_files) as f;

  return total_size <= 104857600         -- ≤ 100 MB
         and coalesce(mime_ok, false);   -- every file's mime is allowed
end;
$$;

-- remove old broken constraint if this migration is rerun locally
alter table public.project_versions
  drop constraint if exists project_versions_files_check;

-- new, legal constraint
alter table public.project_versions
  add  constraint project_versions_files_check
  check ( public.fn_project_files_ok(files) );

-- 1-C  ────────────────────────────────────────────────────────────────────────
-- Pro plan required for private projects
CREATE OR REPLACE FUNCTION public.enforce_pro_for_private_projects()
RETURNS TRIGGER AS $$
DECLARE
    plan TEXT;
BEGIN
    SELECT plan INTO plan
      FROM profiles
     WHERE id = NEW.owner_id;        -- assumes projects.owner_id FK → profiles.id

    IF NEW.is_public = FALSE AND plan <> 'pro' THEN
        RAISE EXCEPTION 'Private projects are only available on the Pro plan.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_pro_for_private_projects
        ON projects;

CREATE TRIGGER trg_enforce_pro_for_private_projects
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION public.enforce_pro_for_private_projects();

-- 1-D  ────────────────────────────────────────────────────────────────────────
-- Storage buckets for public and private projects
insert into storage.buckets (id, name, public)
     values ('projects', 'projects', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
     values ('projects-private', 'projects-private', false)
on conflict (id) do nothing;

-- Allow only the uploader (owner) or service-role to read/write.
-- (Supabase by default generates RLS on storage.objects; you can tweak it
-- via the dashboard or with policy SQL like the commented section below.)
/*
ALTER POLICY "Owners only" ON storage.objects
    FOR SELECT USING (auth.role() = 'service_role' OR owner = auth.uid());
ALTER POLICY "Owners only" ON storage.objects
    FOR ALL   USING (auth.role() = 'service_role' OR owner = auth.uid());
*/ 