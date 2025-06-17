-- ============================================================================
-- FIX PROJECT CREATION ISSUE
-- Resolves the ambiguous "plan" column reference in enforce_pro_for_private_projects function
-- ============================================================================

-- Fix the enforce_pro_for_private_projects function to avoid column ambiguity
CREATE OR REPLACE FUNCTION enforce_pro_for_private_projects()
RETURNS TRIGGER AS $$
DECLARE
    user_plan TEXT;
BEGIN
    -- Use qualified column name to avoid ambiguity
    SELECT profiles.plan INTO user_plan
      FROM profiles
     WHERE profiles.id = NEW.owner_id;

    IF NEW.is_public = FALSE AND COALESCE(user_plan, 'free') <> 'pro' THEN
        RAISE EXCEPTION 'Private projects are only available on the Pro plan.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Test that project creation now works
DO $$
DECLARE
    test_project_id uuid;
BEGIN
    -- Clean up any existing test data
    DELETE FROM projects WHERE slug = 'test-project-creation-fix';
    
    -- Test project creation
    INSERT INTO projects (
        owner_id, title, slug, description, discipline, 
        tags, is_public, license
    ) VALUES (
        '550e8400-e29b-41d4-a716-446655440000',
        'Test Project Creation Fix',
        'test-project-creation-fix',
        'Testing that project creation works after fixing the plan column ambiguity',
        'mechanical-engineering',
        ARRAY['test', 'fix'],
        true,
        'MIT'
    ) RETURNING id INTO test_project_id;
    
    RAISE NOTICE '✅ Project creation test successful! Project ID: %', test_project_id;
    
    -- Clean up test project
    DELETE FROM projects WHERE id = test_project_id;
    RAISE NOTICE '✅ Test project cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION '❌ Project creation test failed: %', SQLERRM;
END $$;

-- Update the test_database_functionality function to remove the user_reputation requirement
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
  
  -- Ensure user_reputation record exists (but don't fail if table doesn't exist)
  BEGIN
    INSERT INTO user_reputation (user_id) 
    VALUES (test_user_id) 
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if user_reputation table doesn't exist
    NULL;
  END;
  
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
  
  -- Clean up user_reputation if it exists
  BEGIN
    DELETE FROM user_reputation WHERE user_id = test_user_id;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if table doesn't exist
    NULL;
  END;
  
  result := jsonb_set(result, '{cleanup}', 'true');
  result := jsonb_set(result, '{test_completed_at}', to_jsonb(now()));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment explaining the fix
COMMENT ON FUNCTION enforce_pro_for_private_projects() IS 'Enforces Pro plan requirement for private projects. Fixed column ambiguity issue with plan variable name.';

-- Log success
DO $$
BEGIN
    RAISE NOTICE '✅ PROJECT CREATION FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '✅ The plan column ambiguity has been resolved';
    RAISE NOTICE '✅ Users can now create projects without demo mode fallback';
END $$; 