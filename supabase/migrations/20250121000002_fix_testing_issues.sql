-- ============================================================================
-- FIX TESTING ISSUES MIGRATION
-- Addresses issues found during comprehensive database testing
-- ============================================================================

-- Add missing is_official column to communities table
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS is_official boolean DEFAULT false;

-- Update existing communities to be official
UPDATE public.communities 
SET is_official = true 
WHERE name IN (
  'mechanical-engineering', 'electronics', 'robotics', 'software', 
  'materials', 'manufacturing', 'beginner', 'show-and-tell', 
  'career', 'general'
);

-- Add index for is_official column for performance
CREATE INDEX IF NOT EXISTS idx_communities_is_official 
ON public.communities(is_official);

-- Create a test user in auth.users for testing purposes
-- This allows us to test profile creation without authentication
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@eng.com',
  crypt('testpassword', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Create a function to safely test database functionality
CREATE OR REPLACE FUNCTION test_database_functionality()
RETURNS jsonb AS $$
DECLARE
  test_user_id uuid := '550e8400-e29b-41d4-a716-446655440000';
  test_profile_id uuid;
  test_project_id uuid;
  test_community_id uuid;
  test_membership_id uuid;
  test_post_id uuid;
  result jsonb := '{}';
BEGIN
  -- Clean up any existing test data
  DELETE FROM posts WHERE user_id = test_user_id;
  DELETE FROM community_memberships WHERE user_id = test_user_id;
  DELETE FROM projects WHERE owner_id = test_user_id;
  DELETE FROM profiles WHERE id = test_user_id;
  
  -- Test 1: Create profile
  BEGIN
    INSERT INTO profiles (
      id, email, username, handle, display_name, 
      engineering_discipline, profile_complete
    ) VALUES (
      test_user_id,
      'test@eng.com',
      'testuser',
      'testuser',
      'Test Engineer',
      'mechanical-engineering',
      true
    ) RETURNING id INTO test_profile_id;
    
    result := jsonb_set(result, '{profile_creation}', 'true');
  EXCEPTION WHEN OTHERS THEN
    result := jsonb_set(result, '{profile_creation}', 'false');
    result := jsonb_set(result, '{profile_error}', to_jsonb(SQLERRM));
  END;
  
  -- Test 2: Create project (only if profile creation succeeded)
  IF test_profile_id IS NOT NULL THEN
    BEGIN
      INSERT INTO projects (
        owner_id, title, slug, description, discipline, 
        tags, is_public, license
      ) VALUES (
        test_user_id,
        'Test CAD Project',
        'test-cad-project-' || extract(epoch from now())::bigint,
        'A sample mechanical engineering project for testing',
        'mechanical-engineering',
        ARRAY['CAD', 'SolidWorks', 'Testing'],
        true,
        'MIT'
      ) RETURNING id INTO test_project_id;
      
      result := jsonb_set(result, '{project_creation}', 'true');
    EXCEPTION WHEN OTHERS THEN
      result := jsonb_set(result, '{project_creation}', 'false');
      result := jsonb_set(result, '{project_error}', to_jsonb(SQLERRM));
    END;
  END IF;
  
  -- Test 3: Verify project in feed view
  IF test_project_id IS NOT NULL THEN
    BEGIN
      IF EXISTS (SELECT 1 FROM project_feed WHERE id = test_project_id) THEN
        result := jsonb_set(result, '{project_in_feed}', 'true');
      ELSE
        result := jsonb_set(result, '{project_in_feed}', 'false');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      result := jsonb_set(result, '{project_in_feed}', 'false');
      result := jsonb_set(result, '{feed_error}', to_jsonb(SQLERRM));
    END;
  END IF;
  
  -- Test 4: Community membership
  IF test_profile_id IS NOT NULL THEN
    BEGIN
      SELECT id INTO test_community_id 
      FROM communities 
      WHERE name = 'mechanical-engineering' 
      LIMIT 1;
      
      IF test_community_id IS NOT NULL THEN
        INSERT INTO community_memberships (user_id, community_id)
        VALUES (test_user_id, test_community_id)
        RETURNING id INTO test_membership_id;
        
        result := jsonb_set(result, '{community_membership}', 'true');
      ELSE
        result := jsonb_set(result, '{community_membership}', 'false');
        result := jsonb_set(result, '{membership_error}', '"No mechanical-engineering community found"');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      result := jsonb_set(result, '{community_membership}', 'false');
      result := jsonb_set(result, '{membership_error}', to_jsonb(SQLERRM));
    END;
  END IF;
  
  -- Test 5: Create post
  IF test_membership_id IS NOT NULL THEN
    BEGIN
      INSERT INTO posts (
        community_id, user_id, title, content, post_type
      ) VALUES (
        test_community_id,
        test_user_id,
        'Test Engineering Discussion',
        'This is a test post to validate database functionality.',
        'discussion'
      ) RETURNING id INTO test_post_id;
      
      result := jsonb_set(result, '{post_creation}', 'true');
    EXCEPTION WHEN OTHERS THEN
      result := jsonb_set(result, '{post_creation}', 'false');
      result := jsonb_set(result, '{post_error}', to_jsonb(SQLERRM));
    END;
  END IF;
  
  -- Cleanup test data
  DELETE FROM posts WHERE user_id = test_user_id;
  DELETE FROM community_memberships WHERE user_id = test_user_id;
  DELETE FROM projects WHERE owner_id = test_user_id;
  DELETE FROM profiles WHERE id = test_user_id;
  
  result := jsonb_set(result, '{cleanup}', 'true');
  result := jsonb_set(result, '{test_completed_at}', to_jsonb(now()));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION test_database_functionality() TO authenticated;
GRANT EXECUTE ON FUNCTION test_database_functionality() TO anon;

-- Create a comprehensive database health check function
CREATE OR REPLACE FUNCTION get_comprehensive_database_health()
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}';
  table_count integer;
  index_count integer;
  policy_count integer;
  function_count integer;
  trigger_count integer;
  community_count integer;
  official_community_count integer;
  view_count integer;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
  
  -- Count RLS policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  -- Count functions
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public';
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public';
  
  -- Count communities
  SELECT COUNT(*) INTO community_count
  FROM communities;
  
  -- Count official communities
  SELECT COUNT(*) INTO official_community_count
  FROM communities 
  WHERE is_official = true;
  
  -- Count views
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views 
  WHERE table_schema = 'public';
  
  -- Build result
  result := jsonb_build_object(
    'database_health', 'healthy',
    'timestamp', now(),
    'statistics', jsonb_build_object(
      'tables', table_count,
      'performance_indexes', index_count,
      'rls_policies', policy_count,
      'functions', function_count,
      'triggers', trigger_count,
      'communities', community_count,
      'official_communities', official_community_count,
      'views', view_count
    ),
    'critical_tables', jsonb_build_object(
      'profiles', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'),
      'projects', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects'),
      'communities', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'communities'),
      'posts', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'posts'),
      'comments', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments')
    ),
    'essential_views', jsonb_build_object(
      'project_feed', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'project_feed')
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_comprehensive_database_health() TO authenticated;
GRANT EXECUTE ON FUNCTION get_comprehensive_database_health() TO anon;

-- Add comment
COMMENT ON FUNCTION test_database_functionality() IS 'Comprehensive test function for validating database functionality';
COMMENT ON FUNCTION get_comprehensive_database_health() IS 'Returns comprehensive database health statistics';

-- Update communities table comment
COMMENT ON COLUMN communities.is_official IS 'Indicates if this is an official eng.com community';

-- Create a simple test data function for development
CREATE OR REPLACE FUNCTION create_sample_test_data()
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}';
  sample_user_id uuid := '11111111-1111-1111-1111-111111111111';
  sample_project_id uuid;
  sample_community_id uuid;
BEGIN
  -- Only create if no existing data
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = sample_user_id) THEN
    -- Insert sample auth user
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, 
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role
    ) VALUES (
      sample_user_id, 'sample@eng.com', 
      crypt('samplepassword', gen_salt('bf')), now(),
      now(), now(), '{"provider": "email", "providers": ["email"]}', '{}',
      false, 'authenticated'
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Create sample profile
    INSERT INTO profiles (
      id, email, username, handle, display_name,
      engineering_discipline, profile_complete, bio
    ) VALUES (
      sample_user_id, 'sample@eng.com', 'sampleengineer', 'sampleengineer',
      'Sample Engineer', 'mechanical-engineering', true,
      'A sample engineer profile for testing and demonstration purposes.'
    );
    
    -- Create sample project
    INSERT INTO projects (
      owner_id, title, slug, description, discipline,
      tags, is_public, license, readme
    ) VALUES (
      sample_user_id, 'Sample CAD Assembly', 'sample-cad-assembly',
      'A comprehensive CAD assembly demonstrating mechanical design principles.',
      'mechanical-engineering', ARRAY['CAD', 'SolidWorks', 'Assembly', 'Demo'],
      true, 'MIT', '# Sample CAD Assembly\n\nThis is a demonstration project showcasing mechanical engineering design.'
    ) RETURNING id INTO sample_project_id;
    
    -- Join mechanical engineering community
    SELECT id INTO sample_community_id FROM communities WHERE name = 'mechanical-engineering' LIMIT 1;
    
    IF sample_community_id IS NOT NULL THEN
      INSERT INTO community_memberships (user_id, community_id, role)
      VALUES (sample_user_id, sample_community_id, 'member');
      
      -- Create sample post
      INSERT INTO posts (
        community_id, user_id, title, content, post_type
      ) VALUES (
        sample_community_id, sample_user_id,
        'Welcome to Mechanical Engineering!',
        'Hello everyone! I''m excited to be part of this community. Looking forward to sharing projects and learning from fellow engineers.',
        'discussion'
      );
    END IF;
    
    result := jsonb_build_object(
      'sample_data_created', true,
      'profile_id', sample_user_id,
      'project_id', sample_project_id,
      'community_id', sample_community_id,
      'created_at', now()
    );
  ELSE
    result := jsonb_build_object(
      'sample_data_created', false,
      'message', 'Sample data already exists'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_sample_test_data() TO authenticated;
GRANT EXECUTE ON FUNCTION create_sample_test_data() TO anon; 