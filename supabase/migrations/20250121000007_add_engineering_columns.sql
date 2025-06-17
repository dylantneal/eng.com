-- ============================================================================
-- ADD ENGINEERING-SPECIFIC COLUMNS TO PROJECTS TABLE
-- Comprehensive update to support world-class engineering project showcase
-- ============================================================================

-- Add missing engineering-specific columns
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS engineering_discipline VARCHAR(100),
  ADD COLUMN IF NOT EXISTS project_type VARCHAR(50) DEFAULT 'design',
  ADD COLUMN IF NOT EXISTS complexity_level VARCHAR(20) DEFAULT 'intermediate',
  ADD COLUMN IF NOT EXISTS project_status VARCHAR(30) DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS materials TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cad_file_formats TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS documentation_url TEXT,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Add constraints for engineering-specific fields (with proper error handling)
DO $$
BEGIN
    -- Add project type constraint
    BEGIN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_valid_project_type 
        CHECK (project_type IN ('design', 'prototype', 'analysis', 'simulation', 'manufacturing', 'research', 'testing'));
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
        NULL;
    END;
    
    -- Add complexity constraint
    BEGIN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_valid_complexity 
        CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
        NULL;
    END;
    
    -- Add status constraint
    BEGIN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_valid_status 
        CHECK (project_status IN ('concept', 'in-progress', 'completed', 'published'));
    EXCEPTION WHEN duplicate_object THEN
        -- Constraint already exists, skip
        NULL;
    END;
END $$;

-- Create additional indexes for engineering-specific queries
CREATE INDEX IF NOT EXISTS idx_projects_engineering_discipline ON projects(engineering_discipline);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_complexity_level ON projects(complexity_level);
CREATE INDEX IF NOT EXISTS idx_projects_project_status ON projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_technologies ON projects USING gin(technologies);
CREATE INDEX IF NOT EXISTS idx_projects_materials ON projects USING gin(materials);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_verified ON projects(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_projects_published_at ON projects(published_at DESC) WHERE published_at IS NOT NULL;

-- Update existing projects to have engineering discipline from the old discipline column
UPDATE projects 
SET engineering_discipline = discipline 
WHERE engineering_discipline IS NULL AND discipline IS NOT NULL;

-- Create enhanced project showcase view
CREATE OR REPLACE VIEW project_showcase AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.description,
    p.readme,
    p.engineering_discipline,
    p.project_type,
    p.complexity_level,
    p.project_status,
    p.tags,
    p.technologies,
    p.materials,
    p.license,
    p.thumbnail_url,
    p.gallery_urls,
    p.cad_file_formats,
    p.repository_url,
    p.demo_url,
    p.documentation_url,
    p.video_url,
    p.view_count,
    p.like_count,
    p.download_count,
    p.comment_count,
    p.bookmark_count,
    p.is_public,
    p.is_featured,
    p.is_verified,
    p.created_at,
    p.updated_at,
    p.published_at,
    
    -- Owner information
    prof.id as owner_id,
    prof.username,
    prof.display_name,
    prof.avatar_url,
    prof.engineering_discipline as owner_discipline,
    prof.is_verified as owner_verified,
    
    -- Latest version info
    pv.version_no as latest_version,
    pv.files as latest_files
    
FROM projects p
JOIN profiles prof ON prof.id = p.owner_id
LEFT JOIN LATERAL (
    SELECT version_no, files
    FROM project_versions 
    WHERE project_id = p.id 
    ORDER BY created_at DESC 
    LIMIT 1
) pv ON true
WHERE p.is_public = true
ORDER BY p.created_at DESC;

-- Test comprehensive project creation with all new fields
DO $$
DECLARE
    test_project_id uuid;
    test_user_id uuid := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
    -- Ensure test user exists
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
    VALUES (test_user_id, 'test@eng.com', NOW(), NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO profiles (id, email, username, handle, display_name, engineering_discipline, profile_complete)
    VALUES (test_user_id, 'test@eng.com', 'testuser', 'testuser', 'Test User', 'mechanical-engineering', true)
    ON CONFLICT (id) DO NOTHING;
    
    -- Test comprehensive project creation with all engineering fields
    INSERT INTO projects (
        owner_id, title, slug, description, readme,
        engineering_discipline, project_type, complexity_level, project_status,
        tags, technologies, materials, license,
        repository_url, demo_url, documentation_url, video_url,
        is_public, is_featured, published_at
    ) VALUES (
        test_user_id,
        'Comprehensive Engineering Test Project',
        'comprehensive-engineering-test-' || extract(epoch from now())::bigint,
        'Testing all engineering-specific fields in the projects table',
        '# Comprehensive Test Project\n\nThis project tests all engineering fields.',
        'mechanical-engineering',
        'prototype',
        'advanced',
        'completed',
        ARRAY['test', 'engineering', 'comprehensive'],
        ARRAY['SolidWorks', 'Arduino', 'Python'],
        ARRAY['Aluminum', 'Steel', 'ABS Plastic'],
        'MIT',
        'https://github.com/test/project',
        'https://demo.example.com',
        'https://docs.example.com',
        'https://youtube.com/watch?v=test',
        true,
        false,
        NOW()
    ) RETURNING id INTO test_project_id;
    
    RAISE NOTICE '✅ SUCCESS: Comprehensive engineering project created! ID: %', test_project_id;
    
    -- Test that the project appears in the showcase view
    IF EXISTS (SELECT 1 FROM project_showcase WHERE id = test_project_id) THEN
        RAISE NOTICE '✅ SUCCESS: Project appears in showcase view';
    ELSE
        RAISE NOTICE '❌ WARNING: Project does not appear in showcase view';
    END IF;
    
    -- Clean up test project
    DELETE FROM projects WHERE id = test_project_id;
    RAISE NOTICE '✅ Test project cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION '❌ FAILED: Comprehensive project creation failed: %', SQLERRM;
END $$;

-- Create function to validate project data
CREATE OR REPLACE FUNCTION validate_project_data()
RETURNS TABLE(
    test_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Test 1: Check all required columns exist
    RETURN QUERY
    SELECT 
        'Required Columns Check'::TEXT,
        CASE WHEN COUNT(*) = 21 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*) || ' out of 21 expected engineering columns'::TEXT
    FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name IN (
        'id', 'owner_id', 'title', 'slug', 'description', 'readme',
        'engineering_discipline', 'project_type', 'complexity_level', 'project_status',
        'tags', 'technologies', 'materials', 'license',
        'repository_url', 'demo_url', 'documentation_url', 'video_url',
        'is_public', 'is_featured', 'is_verified'
    );
    
    -- Test 2: Check constraints exist
    RETURN QUERY
    SELECT 
        'Constraints Check'::TEXT,
        CASE WHEN COUNT(*) >= 3 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*) || ' engineering-specific constraints'::TEXT
    FROM information_schema.check_constraints 
    WHERE constraint_name LIKE 'projects_valid_%';
    
    -- Test 3: Check indexes exist
    RETURN QUERY
    SELECT 
        'Indexes Check'::TEXT,
        CASE WHEN COUNT(*) >= 15 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*) || ' performance indexes'::TEXT
    FROM pg_indexes 
    WHERE tablename = 'projects';
    
    -- Test 4: Check view exists
    RETURN QUERY
    SELECT 
        'Showcase View Check'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'project_showcase') 
             THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Project showcase view availability'::TEXT;
    
    -- Test 5: Check RLS policies
    RETURN QUERY
    SELECT 
        'Security Policies Check'::TEXT,
        CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        'Found ' || COUNT(*) || ' RLS policies protecting projects'::TEXT
    FROM pg_policies 
    WHERE tablename = 'projects';
    
END;
$$ LANGUAGE plpgsql;

-- Run comprehensive validation
SELECT * FROM validate_project_data();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 ENGINEERING COLUMNS MIGRATION COMPLETED!';
    RAISE NOTICE '✅ All engineering-specific fields added to projects table';
    RAISE NOTICE '✅ Comprehensive constraints and indexes created';
    RAISE NOTICE '✅ Enhanced project showcase view available';
    RAISE NOTICE '✅ Database is now ready for world-class engineering projects';
END $$; 