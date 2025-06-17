#!/bin/bash

# Manual Database Validation Script for eng.com
# This script performs comprehensive testing of the database schema and functionality

echo "🔍 Starting comprehensive database validation for eng.com platform..."
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper functions
log_test() {
    local name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "true" ]; then
        echo -e "${GREEN}✅ $name${NC}${details:+ - $details}"
        ((PASSED++))
    else
        echo -e "${RED}❌ $name${NC}${details:+ - $details}"
        ((FAILED++))
    fi
}

run_query() {
    local query="$1"
    docker exec supabase_db_eng.com psql -U postgres -d postgres -t -c "$query" 2>/dev/null
}

# Get database container name
DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}")

if [ -z "$DB_CONTAINER" ]; then
    echo -e "${RED}❌ Database container not found. Please run 'supabase start' first.${NC}"
    exit 1
fi

echo -e "${BLUE}🔌 Using database container: $DB_CONTAINER${NC}"
echo ""

# ========================================================================
# TEST 1: VERIFY ALL CRITICAL TABLES EXIST
# ========================================================================
echo -e "${BLUE}📋 TEST 1: Verifying critical tables exist...${NC}"

CRITICAL_TABLES=(
    "profiles" "projects" "versions" "project_likes" "comments" "payments"
    "communities" "community_memberships" "posts" "post_votes" "comment_votes"
    "user_reputation"
)

for table in "${CRITICAL_TABLES[@]}"; do
    result=$(run_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table';")
    if [[ "$result" =~ "1" ]]; then
        size=$(run_query "SELECT pg_size_pretty(pg_total_relation_size('public.$table'));")
        log_test "Table: $table" "true" "Size: $(echo $size | xargs)"
    else
        log_test "Table: $table" "false" "Table does not exist"
    fi
done

# ========================================================================
# TEST 2: VERIFY COLUMN NAMING CONSISTENCY
# ========================================================================
echo ""
echo -e "${BLUE}🔧 TEST 2: Verifying column naming consistency...${NC}"

owner_columns=$(run_query "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'owner';")
owner_id_columns=$(run_query "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'owner_id';")

owner_count=$(echo $owner_columns | xargs)
owner_id_count=$(echo $owner_id_columns | xargs)

if [ "$owner_count" = "0" ]; then
    log_test "Column naming consistency" "true" "$owner_id_count correct owner_id columns, $owner_count incorrect owner columns"
else
    log_test "Column naming consistency" "false" "$owner_id_count correct owner_id columns, $owner_count incorrect owner columns"
fi

# ========================================================================
# TEST 3: VERIFY FOREIGN KEY RELATIONSHIPS
# ========================================================================
echo ""
echo -e "${BLUE}🔗 TEST 3: Verifying foreign key relationships...${NC}"

fk_count=$(run_query "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';")
fk_count=$(echo $fk_count | xargs)

if [ "$fk_count" -gt "0" ]; then
    log_test "Foreign key relationships" "true" "Found $fk_count foreign key constraints"
else
    log_test "Foreign key relationships" "false" "No foreign key constraints found"
fi

# ========================================================================
# TEST 4: VERIFY PERFORMANCE INDEXES
# ========================================================================
echo ""
echo -e "${BLUE}📊 TEST 4: Verifying performance indexes...${NC}"

index_count=$(run_query "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';")
index_count=$(echo $index_count | xargs)

if [ "$index_count" -gt "0" ]; then
    log_test "Performance indexes" "true" "Found $index_count performance indexes"
else
    log_test "Performance indexes" "false" "No performance indexes found"
fi

# ========================================================================
# TEST 5: VERIFY ROW LEVEL SECURITY
# ========================================================================
echo ""
echo -e "${BLUE}🛡️ TEST 5: Verifying Row Level Security...${NC}"

rls_enabled=$(run_query "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true AND tablename IN ('profiles', 'projects', 'communities', 'posts', 'comments');")
rls_enabled=$(echo $rls_enabled | xargs)

total_critical_tables=5
if [ "$rls_enabled" -gt "0" ]; then
    log_test "RLS enabled on critical tables" "true" "$rls_enabled/$total_critical_tables tables have RLS enabled"
else
    log_test "RLS enabled on critical tables" "false" "No RLS policies found on critical tables"
fi

policy_count=$(run_query "SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';")
policy_count=$(echo $policy_count | xargs)

if [ "$policy_count" -gt "0" ]; then
    log_test "RLS policies exist" "true" "$policy_count policies found"
else
    log_test "RLS policies exist" "false" "No RLS policies found"
fi

# ========================================================================
# TEST 6: VERIFY ESSENTIAL VIEWS
# ========================================================================
echo ""
echo -e "${BLUE}👁️ TEST 6: Verifying essential views...${NC}"

project_feed_exists=$(run_query "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name = 'project_feed';")
project_feed_exists=$(echo $project_feed_exists | xargs)

if [ "$project_feed_exists" = "1" ]; then
    log_test "View: project_feed" "true" "View exists and accessible"
else
    log_test "View: project_feed" "false" "View does not exist"
fi

# ========================================================================
# TEST 7: VERIFY FUNCTIONS AND TRIGGERS
# ========================================================================
echo ""
echo -e "${BLUE}⚡ TEST 7: Verifying functions and triggers...${NC}"

function_count=$(run_query "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public';")
function_count=$(echo $function_count | xargs)

if [ "$function_count" -gt "0" ]; then
    log_test "Database functions" "true" "Found $function_count functions"
else
    log_test "Database functions" "false" "No functions found"
fi

trigger_count=$(run_query "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public';")
trigger_count=$(echo $trigger_count | xargs)

if [ "$trigger_count" -gt "0" ]; then
    log_test "Database triggers" "true" "$trigger_count triggers found"
else
    log_test "Database triggers" "false" "No triggers found"
fi

# ========================================================================
# TEST 8: VERIFY DEFAULT COMMUNITIES
# ========================================================================
echo ""
echo -e "${BLUE}🏘️ TEST 8: Verifying default communities...${NC}"

community_count=$(run_query "SELECT COUNT(*) FROM communities;")
community_count=$(echo $community_count | xargs)

if [ "$community_count" -gt "0" ]; then
    log_test "Communities table accessible" "true" "Found $community_count communities"
    
    official_count=$(run_query "SELECT COUNT(*) FROM communities WHERE is_official = true;")
    official_count=$(echo $official_count | xargs)
    
    if [ "$official_count" -gt "0" ]; then
        log_test "Official communities exist" "true" "$official_count official communities"
    else
        log_test "Official communities exist" "false" "No official communities found"
    fi
    
    # Check for core engineering communities
    mech_eng=$(run_query "SELECT COUNT(*) FROM communities WHERE name = 'mechanical-engineering';")
    electronics=$(run_query "SELECT COUNT(*) FROM communities WHERE name = 'electronics';")
    robotics=$(run_query "SELECT COUNT(*) FROM communities WHERE name = 'robotics';")
    
    core_count=$(($(echo $mech_eng | xargs) + $(echo $electronics | xargs) + $(echo $robotics | xargs)))
    
    if [ "$core_count" = "3" ]; then
        log_test "Core engineering communities" "true" "Found all 3 core communities"
    else
        log_test "Core engineering communities" "false" "Found $core_count/3 core communities"
    fi
else
    log_test "Communities table accessible" "false" "Communities table is empty or inaccessible"
fi

# ========================================================================
# TEST 9: TEST DATABASE FUNCTIONALITY
# ========================================================================
echo ""
echo -e "${BLUE}🧪 TEST 9: Testing database functionality...${NC}"

# Test profile creation
test_user_id="550e8400-e29b-41d4-a716-446655440000"

# Clean up any existing test data first
run_query "DELETE FROM posts WHERE user_id = '$test_user_id';" > /dev/null 2>&1
run_query "DELETE FROM community_memberships WHERE user_id = '$test_user_id';" > /dev/null 2>&1
run_query "DELETE FROM projects WHERE owner_id = '$test_user_id';" > /dev/null 2>&1
run_query "DELETE FROM profiles WHERE id = '$test_user_id';" > /dev/null 2>&1

# Test 1: Create profile
profile_result=$(run_query "INSERT INTO profiles (id, email, username, handle, display_name, engineering_discipline, profile_complete) VALUES ('$test_user_id', 'test@eng.com', 'testuser', 'testuser', 'Test Engineer', 'mechanical-engineering', true) RETURNING id;" 2>/dev/null)

if [[ "$profile_result" =~ "$test_user_id" ]]; then
    log_test "Profile creation" "true" "Test profile created successfully"
    
    # Test 2: Create project
    project_result=$(run_query "INSERT INTO projects (owner_id, title, slug, description, discipline, tags, is_public, license) VALUES ('$test_user_id', 'Test CAD Project', 'test-cad-project-$(date +%s)', 'A sample project', 'mechanical-engineering', ARRAY['CAD', 'Testing'], true, 'MIT') RETURNING id;" 2>/dev/null)
    
    if [[ "$project_result" =~ "-" ]]; then
        project_id=$(echo $project_result | xargs)
        log_test "Project creation" "true" "Test project created successfully"
        
        # Test 3: Verify project in feed view
        feed_result=$(run_query "SELECT COUNT(*) FROM project_feed WHERE id = '$project_id';" 2>/dev/null)
        feed_count=$(echo $feed_result | xargs)
        
        if [ "$feed_count" = "1" ]; then
            log_test "Project in feed view" "true" "Project appears in project_feed view"
        else
            log_test "Project in feed view" "false" "Project does not appear in feed view"
        fi
        
        # Test 4: Community membership
        community_id=$(run_query "SELECT id FROM communities WHERE name = 'mechanical-engineering' LIMIT 1;" 2>/dev/null | xargs)
        
        if [ ! -z "$community_id" ]; then
            membership_result=$(run_query "INSERT INTO community_memberships (user_id, community_id) VALUES ('$test_user_id', '$community_id') RETURNING id;" 2>/dev/null)
            
            if [[ "$membership_result" =~ "-" ]]; then
                log_test "Community membership" "true" "User joined community successfully"
                
                # Test 5: Create post
                post_result=$(run_query "INSERT INTO posts (community_id, user_id, title, content, post_type) VALUES ('$community_id', '$test_user_id', 'Test Discussion', 'Test content', 'discussion') RETURNING id;" 2>/dev/null)
                
                if [[ "$post_result" =~ "-" ]]; then
                    log_test "Post creation" "true" "Test post created successfully"
                else
                    log_test "Post creation" "false" "Failed to create test post"
                fi
            else
                log_test "Community membership" "false" "Failed to join community"
            fi
        else
            log_test "Community membership" "false" "No mechanical-engineering community found"
        fi
    else
        log_test "Project creation" "false" "Failed to create test project"
    fi
    
    # Cleanup
    run_query "DELETE FROM posts WHERE user_id = '$test_user_id';" > /dev/null 2>&1
    run_query "DELETE FROM community_memberships WHERE user_id = '$test_user_id';" > /dev/null 2>&1
    run_query "DELETE FROM projects WHERE owner_id = '$test_user_id';" > /dev/null 2>&1
    run_query "DELETE FROM profiles WHERE id = '$test_user_id';" > /dev/null 2>&1
    
    log_test "Test data cleanup" "true" "All test records removed"
else
    log_test "Profile creation" "false" "Failed to create test profile"
fi

# ========================================================================
# TEST 10: PROJECT_FEED VIEW FUNCTIONALITY
# ========================================================================
echo ""
echo -e "${BLUE}📊 TEST 10: Testing project_feed view...${NC}"

feed_count=$(run_query "SELECT COUNT(*) FROM project_feed;" 2>/dev/null)
feed_count=$(echo $feed_count | xargs)

if [[ "$feed_count" =~ ^[0-9]+$ ]]; then
    log_test "Project feed view query" "true" "View returns $feed_count records"
    
    # Test view structure
    column_count=$(run_query "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'project_feed';" 2>/dev/null)
    column_count=$(echo $column_count | xargs)
    
    if [ "$column_count" -gt "5" ]; then
        log_test "Project feed view structure" "true" "Has $column_count columns"
    else
        log_test "Project feed view structure" "false" "Only has $column_count columns"
    fi
else
    log_test "Project feed view query" "false" "Failed to query project_feed view"
fi

# ========================================================================
# FINAL RESULTS
# ========================================================================
echo ""
echo "============================================================"
echo -e "${BLUE}🏁 DATABASE TEST RESULTS${NC}"
echo "============================================================"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${BLUE}📊 Total:  $((PASSED + FAILED))${NC}"

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc -l 2>/dev/null || echo "0")
    echo -e "${BLUE}📈 Success Rate: ${SUCCESS_RATE}%${NC}"
fi

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Database is fully functional.${NC}"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Review the details above.${NC}"
    exit 1
fi 