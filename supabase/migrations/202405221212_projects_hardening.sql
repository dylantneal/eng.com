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

    UPDATE projects
       SET current_version = next_no,
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
ALTER TABLE project_versions
    DROP CONSTRAINT IF EXISTS project_versions_files_check;

ALTER TABLE project_versions
    ADD CONSTRAINT project_versions_files_check
    CHECK (
          jsonb_array_length(files) <= 5
      AND (SELECT SUM( (f->>'size')::INTEGER )
             FROM jsonb_array_elements(files) AS f) <= 104857600 -- 100 MB
      AND (SELECT BOOL_AND( (f->>'mime') IN (
                 'image/png', 'image/jpeg', 'application/zip',
                 'application/pdf', 'video/mp4'))
             FROM jsonb_array_elements(files) AS f)
    );

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
-- Private storage bucket for non-public projects
select storage.create_bucket('projects-private', false, 'disabled');

-- Allow only the uploader (owner) or service-role to read/write.
-- (Supabase by default generates RLS on storage.objects; you can tweak it
-- via the dashboard or with policy SQL like the commented section below.)
/*
ALTER POLICY "Owners only" ON storage.objects
    FOR SELECT USING (auth.role() = 'service_role' OR owner = auth.uid());
ALTER POLICY "Owners only" ON storage.objects
    FOR ALL   USING (auth.role() = 'service_role' OR owner = auth.uid());
*/ 