-- ============================================================================
-- FIX FINAL TESTING ISSUES MIGRATION
-- Addresses the remaining issues found during comprehensive database testing
-- ============================================================================

-- Fix the ambiguous column reference in project_feed view
DROP VIEW IF EXISTS public.project_feed;

CREATE VIEW public.project_feed AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.description,
  p.discipline,
  p.tags,
  p.license,
  p.image_url,
  p.view_count,
  p.like_count,
  p.download_count,
  p.is_public,
  p.created_at,
  p.updated_at,
  pr.id as author_id,
  pr.username,
  pr.handle,
  pr.display_name,
  pr.avatar_url,
  COALESCE(SUM(pa.amount_cents), 0) as tips_cents,
  (
    SELECT p.id || '/' || (v.files->0->>'name')
    FROM public.versions v
    WHERE v.project_id = p.id
    ORDER BY v.created_at DESC LIMIT 1
  ) as thumb_path
FROM public.projects p
JOIN public.profiles pr ON pr.id = p.owner_id
LEFT JOIN public.payments pa ON pa.project_id = p.id
WHERE p.is_public = true
GROUP BY p.id, pr.id, pr.username, pr.handle, pr.display_name, pr.avatar_url
ORDER BY p.created_at DESC;

-- Fix the update_user_reputation function to handle the missing is_helpful field
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS trigger AS $$
BEGIN
    -- Update post aura
    IF TG_TABLE_NAME = 'posts' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_reputation
            SET post_aura = post_aura + 1,
                total_aura = total_aura + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_reputation
            SET post_aura = post_aura - 1,
                total_aura = total_aura - 1,
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
        END IF;
    END IF;

    -- Update comment aura
    IF TG_TABLE_NAME = 'comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE user_reputation
            SET comment_aura = comment_aura + 1,
                total_aura = total_aura + 1,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE user_reputation
            SET comment_aura = comment_aura - 1,
                total_aura = total_aura - 1,
                updated_at = NOW()
            WHERE user_id = OLD.user_id;
        END IF;
    END IF;

    -- Update helpful answers (only for post_votes table with is_helpful column)
    IF TG_TABLE_NAME = 'post_votes' THEN
        -- Check if the is_helpful column exists before using it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'post_votes' 
            AND column_name = 'is_helpful'
        ) THEN
            -- Only process if is_helpful is true
            IF (TG_OP = 'INSERT' AND NEW.is_helpful = true) OR 
               (TG_OP = 'UPDATE' AND NEW.is_helpful = true AND OLD.is_helpful = false) THEN
                UPDATE user_reputation
                SET helpful_answers = helpful_answers + 1,
                    updated_at = NOW()
                WHERE user_id = NEW.user_id;
            ELSIF (TG_OP = 'DELETE' AND OLD.is_helpful = true) OR 
                  (TG_OP = 'UPDATE' AND OLD.is_helpful = true AND NEW.is_helpful = false) THEN
                UPDATE user_reputation
                SET helpful_answers = helpful_answers - 1,
                    updated_at = NOW()
                WHERE user_id = OLD.user_id;
            END IF;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update the test function to handle these fixes
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
  
  -- Ensure user_reputation record exists
  INSERT INTO user_reputation (user_id) 
  VALUES (test_user_id) 
  ON CONFLICT (user_id) DO NOTHING;
  
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
  DELETE FROM user_reputation WHERE user_id = test_user_id;
  
  result := jsonb_set(result, '{cleanup}', 'true');
  result := jsonb_set(result, '{test_completed_at}', to_jsonb(now()));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comprehensive database validation function
CREATE OR REPLACE FUNCTION validate_database_completely()
RETURNS jsonb AS $$
DECLARE
  result jsonb := '{}';
  critical_tables text[] := ARRAY['profiles', 'projects', 'versions', 'project_likes', 'comments', 'payments', 'communities', 'community_memberships', 'posts', 'post_votes', 'comment_votes', 'user_reputation'];
  table_name text;
  table_count integer := 0;
  missing_tables text[] := '{}';
  test_result jsonb;
BEGIN
  -- Check critical tables
  FOREACH table_name IN ARRAY critical_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = table_name
    ) THEN
      table_count := table_count + 1;
    ELSE
      missing_tables := array_append(missing_tables, table_name);
    END IF;
  END LOOP;
  
  result := jsonb_set(result, '{critical_tables_found}', table_count::text::jsonb);
  result := jsonb_set(result, '{critical_tables_total}', array_length(critical_tables, 1)::text::jsonb);
  result := jsonb_set(result, '{missing_tables}', to_jsonb(missing_tables));
  
  -- Check essential views
  result := jsonb_set(result, '{project_feed_exists}', 
    (EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'project_feed'))::text::jsonb);
  
  -- Check communities
  result := jsonb_set(result, '{total_communities}', 
    (SELECT COUNT(*)::text::jsonb FROM communities));
  result := jsonb_set(result, '{official_communities}', 
    (SELECT COUNT(*)::text::jsonb FROM communities WHERE is_official = true));
  
  -- Run functionality test
  SELECT test_database_functionality() INTO test_result;
  result := jsonb_set(result, '{functionality_test}', test_result);
  
  -- Overall health assessment
  IF table_count = array_length(critical_tables, 1) AND 
     EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'project_feed') AND
     (SELECT COUNT(*) FROM communities WHERE is_official = true) > 0 THEN
    result := jsonb_set(result, '{overall_health}', '"excellent"');
  ELSIF table_count >= (array_length(critical_tables, 1) * 0.9) THEN
    result := jsonb_set(result, '{overall_health}', '"good"');
  ELSE
    result := jsonb_set(result, '{overall_health}', '"needs_attention"');
  END IF;
  
  result := jsonb_set(result, '{validation_completed_at}', to_jsonb(now()));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_database_completely() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_database_completely() TO anon;

-- Add comments
COMMENT ON FUNCTION validate_database_completely() IS 'Comprehensive database validation function that checks all critical components';
COMMENT ON VIEW project_feed IS 'Main project feed view for displaying public projects with author information'; 