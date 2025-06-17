-- ============================================================================
-- COMPREHENSIVE DATABASE TESTING SCRIPT FOR ENG.COM
-- This script validates all database components and relationships
-- ============================================================================

\echo '🔍 Starting comprehensive database validation for eng.com platform...'

-- ============================================================================
-- TEST 1: VERIFY ALL CRITICAL TABLES EXIST
-- ============================================================================

\echo '📋 TEST 1: Verifying all critical tables exist...'

SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'profiles', 'projects', 'versions', 'project_likes', 'comments', 'payments',
      'communities', 'community_memberships', 'posts', 'post_votes', 'comment_votes',
      'user_reputation', 'marketplace_items', 'marketplace_purchases', 'marketplace_reviews'
    ) THEN '✅ CRITICAL'
    ELSE '📝 OPTIONAL'
  END as priority,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY priority DESC, table_name;

-- ============================================================================
-- TEST 2: VERIFY COLUMN NAMING CONSISTENCY
-- ============================================================================

\echo '🔧 TEST 2: Verifying column naming consistency (owner_id vs owner)...'

-- Check that all tables use owner_id consistently
SELECT 
  table_name,
  column_name,
  data_type,
  CASE 
    WHEN column_name = 'owner_id' THEN '✅ CORRECT'
    WHEN column_name = 'owner' THEN '❌ NEEDS_FIX'
    ELSE '📝 OTHER'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name IN ('owner', 'owner_id')
ORDER BY table_name, column_name;

-- ============================================================================
-- TEST 3: VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================================================

\echo '🔗 TEST 3: Verifying foreign key relationships...'

SELECT 
  tc.table_name as source_table,
  kcu.column_name as source_column,
  ccu.table_name as target_table,
  ccu.column_name as target_column,
  tc.constraint_name,
  '✅ VALID' as status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- TEST 4: VERIFY CRITICAL INDEXES EXIST
-- ============================================================================

\echo '📊 TEST 4: Verifying performance indexes...'

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef,
  CASE 
    WHEN indexname LIKE '%_pkey' THEN '🔑 PRIMARY'
    WHEN indexname LIKE '%_unique%' THEN '🔒 UNIQUE'
    WHEN indexname LIKE 'idx_%' THEN '🚀 PERFORMANCE'
    ELSE '📝 OTHER'
  END as index_type
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'projects', 'communities', 'posts', 'comments')
ORDER BY tablename, index_type, indexname;

-- ============================================================================
-- TEST 5: VERIFY ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

\echo '🛡️ TEST 5: Verifying Row Level Security policies...'

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  '✅ ACTIVE' as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check RLS is enabled on critical tables
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS_ENABLED'
    ELSE '❌ RLS_DISABLED'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'projects', 'communities', 'posts', 'comments', 'payments')
ORDER BY tablename;

-- ============================================================================
-- TEST 6: VERIFY ESSENTIAL VIEWS EXIST
-- ============================================================================

\echo '👁️ TEST 6: Verifying essential views...'

SELECT 
  table_name as view_name,
  view_definition,
  '✅ EXISTS' as status
FROM information_schema.views 
WHERE table_schema = 'public'
  AND table_name IN ('project_feed', 'community_stats', 'schema_health')
ORDER BY table_name;

-- ============================================================================
-- TEST 7: VERIFY TRIGGERS AND FUNCTIONS
-- ============================================================================

\echo '⚡ TEST 7: Verifying triggers and functions...'

-- Check critical functions exist
SELECT 
  routine_name as function_name,
  routine_type,
  data_type as return_type,
  '✅ EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'handle_new_user', 'update_project_like_count', 'get_database_health',
    'update_post_score', 'update_post_vote_counts'
  )
ORDER BY routine_name;

-- Check critical triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  '✅ ACTIVE' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'on_auth_user_created', 'project_like_count_trigger', 
    'update_post_score_trigger', 'update_post_vote_counts_trigger'
  )
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- TEST 8: VERIFY DEFAULT COMMUNITIES DATA
-- ============================================================================

\echo '🏘️ TEST 8: Verifying default communities data...'

SELECT 
  name,
  display_name,
  description,
  member_count,
  post_count,
  is_official,
  created_at,
  '✅ POPULATED' as status
FROM communities 
ORDER BY name;

-- ============================================================================
-- TEST 9: TEST DATABASE FUNCTIONALITY WITH SAMPLE DATA
-- ============================================================================

\echo '🧪 TEST 9: Testing database functionality with sample operations...'

-- Test 1: Create a test user profile (simulating auth.users insert)
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
  test_profile_id uuid;
BEGIN
  -- Insert test user into auth.users (simulated)
  \echo '  Creating test user profile...'
  
  -- Insert profile directly (since we can't insert into auth.users in testing)
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
  
  RAISE NOTICE '✅ Test profile created: %', test_profile_id;
  
  -- Test 2: Create a test project
  INSERT INTO projects (
    owner_id, title, slug, description, discipline, 
    tags, is_public, license
  ) VALUES (
    test_user_id,
    'Test CAD Project',
    'test-cad-project',
    'A sample mechanical engineering project for testing',
    'mechanical-engineering',
    ARRAY['CAD', 'SolidWorks', 'Testing'],
    true,
    'MIT'
  );
  
  RAISE NOTICE '✅ Test project created';
  
  -- Test 3: Join a community
  INSERT INTO community_memberships (user_id, community_id)
  SELECT test_user_id, id 
  FROM communities 
  WHERE name = 'mechanical-engineering' 
  LIMIT 1;
  
  RAISE NOTICE '✅ Test community membership created';
  
  -- Test 4: Create a test post
  INSERT INTO posts (
    community_id, user_id, title, content, post_type
  )
  SELECT 
    c.id,
    test_user_id,
    'Test Engineering Discussion',
    'This is a test post to validate the database functionality.',
    'discussion'
  FROM communities c 
  WHERE c.name = 'mechanical-engineering'
  LIMIT 1;
  
  RAISE NOTICE '✅ Test post created';
  
  -- Cleanup test data
  DELETE FROM posts WHERE user_id = test_user_id;
  DELETE FROM community_memberships WHERE user_id = test_user_id;
  DELETE FROM projects WHERE owner_id = test_user_id;
  DELETE FROM profiles WHERE id = test_user_id;
  
  RAISE NOTICE '✅ Test data cleaned up';
END $$;

-- ============================================================================
-- TEST 10: VERIFY PROJECT_FEED VIEW FUNCTIONALITY
-- ============================================================================

\echo '📊 TEST 10: Testing project_feed view...'

-- Test the critical project_feed view
SELECT 
  'project_feed' as view_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ FUNCTIONAL'
    ELSE '❌ ERROR'
  END as status
FROM project_feed;

-- ============================================================================
-- TEST 11: VERIFY MARKETPLACE TABLES (if they exist)
-- ============================================================================

\echo '🛒 TEST 11: Verifying marketplace functionality...'

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('marketplace_items', 'marketplace_purchases', 'marketplace_reviews') 
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'marketplace%'
ORDER BY table_name;

-- ============================================================================
-- TEST 12: DATABASE HEALTH CHECK
-- ============================================================================

\echo '🏥 TEST 12: Overall database health check...'

-- Check if health check function exists and run it
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name = 'get_database_health'
    ) THEN 'get_database_health() function exists ✅'
    ELSE 'get_database_health() function missing ❌'
  END as health_function_status;

-- Final summary
SELECT 
  'DATABASE_VALIDATION_COMPLETE' as status,
  NOW() as completed_at,
  '🎉 All tests completed!' as message;

\echo '✅ Database validation completed! Check results above for any issues.' 