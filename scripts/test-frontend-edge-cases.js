#!/usr/bin/env node

// Test edge cases and user interaction scenarios
const BASE_URL = 'http://localhost:4000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test empty search query
async function testEmptySearch() {
  const response = await fetch(`${BASE_URL}/api/posts?sort=hot`);
  const data = await response.json();
  
  if (!response.ok || !data.posts) {
    return { success: false, message: 'Base API failed' };
  }
  
  // Empty search should return all posts
  if (data.posts.length === 0) {
    return { success: false, message: 'Empty search returned no results' };
  }
  
  return { success: true, message: `Empty search returns ${data.posts.length} posts` };
}

// Test pagination parameters
async function testPagination() {
  // Test page 1
  const response1 = await fetch(`${BASE_URL}/api/posts?page=1&limit=5`);
  const data1 = await response1.json();
  
  if (!response1.ok || !data1.posts) {
    return { success: false, message: 'Pagination API failed' };
  }
  
  if (data1.posts.length > 5) {
    return { success: false, message: 'Limit parameter not working' };
  }
  
  // Test page 2
  const response2 = await fetch(`${BASE_URL}/api/posts?page=2&limit=5`);
  const data2 = await response2.json();
  
  if (!response2.ok || !data2.posts) {
    return { success: false, message: 'Page 2 failed' };
  }
  
  // Pages should have different content (if enough posts exist)
  if (data1.posts.length === 5 && data2.posts.length > 0) {
    const page1Ids = data1.posts.map(p => p.id);
    const page2Ids = data2.posts.map(p => p.id);
    const overlap = page1Ids.filter(id => page2Ids.includes(id));
    
    if (overlap.length > 0) {
      return { success: false, message: 'Pages have overlapping content' };
    }
  }
  
  return { success: true, message: 'Pagination working correctly' };
}

// Test community not found
async function testCommunityNotFound() {
  const response = await fetch(`${BASE_URL}/api/posts?community=999&sort=hot`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, message: 'API should handle non-existent community gracefully' };
  }
  
  // Should return empty array for non-existent community
  if (!data.posts || data.posts.length > 0) {
    return { success: false, message: 'Non-existent community should return empty results' };
  }
  
  return { success: true, message: 'Non-existent community handled correctly' };
}

// Test malformed requests
async function testMalformedRequests() {
  // Test with negative page
  const response1 = await fetch(`${BASE_URL}/api/posts?page=-1&limit=10`);
  const data1 = await response1.json();
  
  if (!response1.ok || !data1.posts) {
    return { success: false, message: 'Negative page number not handled gracefully' };
  }
  
  // Test with zero limit
  const response2 = await fetch(`${BASE_URL}/api/posts?page=1&limit=0`);
  const data2 = await response2.json();
  
  if (!response2.ok || !data2.posts) {
    return { success: false, message: 'Zero limit not handled gracefully' };
  }
  
  return { success: true, message: 'Malformed requests handled gracefully' };
}

// Test post content validation
async function testPostContentValidation() {
  const response = await fetch(`${BASE_URL}/api/posts?sort=hot`);
  const data = await response.json();
  
  if (!response.ok || !data.posts) {
    return { success: false, message: 'Posts API failed' };
  }
  
  const posts = data.posts;
  
  // Check that all posts have non-empty titles
  const emptyTitles = posts.filter(p => !p.title || p.title.trim() === '');
  if (emptyTitles.length > 0) {
    return { success: false, message: `Found ${emptyTitles.length} posts with empty titles` };
  }
  
  // Check that all posts have content
  const emptyContent = posts.filter(p => !p.content || p.content.trim() === '');
  if (emptyContent.length > 0) {
    return { success: false, message: `Found ${emptyContent.length} posts with empty content` };
  }
  
  // Check that vote counts are non-negative
  const negativeVotes = posts.filter(p => p.vote_count < 0);
  if (negativeVotes.length > 0) {
    return { success: false, message: `Found ${negativeVotes.length} posts with negative votes` };
  }
  
  return { success: true, message: 'All post content is valid' };
}

// Test community data consistency
async function testCommunityDataConsistency() {
  const response = await fetch(`${BASE_URL}/api/communities`);
  const data = await response.json();
  
  if (!response.ok || !Array.isArray(data)) {
    return { success: false, message: 'Communities API failed' };
  }
  
  const communities = data;
  
  // Check for duplicate IDs
  const ids = communities.map(c => c.id);
  const uniqueIds = [...new Set(ids)];
  if (ids.length !== uniqueIds.length) {
    return { success: false, message: 'Found duplicate community IDs' };
  }
  
  // Check for duplicate names
  const names = communities.map(c => c.name);
  const uniqueNames = [...new Set(names)];
  if (names.length !== uniqueNames.length) {
    return { success: false, message: 'Found duplicate community names' };
  }
  
  // Check that all communities have valid colors
  const invalidColors = communities.filter(c => !c.color || !c.color.match(/^#[0-9A-Fa-f]{6}$/));
  if (invalidColors.length > 0) {
    return { success: false, message: `Found ${invalidColors.length} communities with invalid colors` };
  }
  
  // Check member counts are non-negative
  const negativeCounts = communities.filter(c => c.member_count < 0);
  if (negativeCounts.length > 0) {
    return { success: false, message: `Found ${negativeCounts.length} communities with negative member counts` };
  }
  
  return { success: true, message: 'Community data is consistent and valid' };
}

// Test personalized algorithm diversity
async function testPersonalizedDiversity() {
  const response = await fetch(`${BASE_URL}/api/posts?sort=personalized`);
  const data = await response.json();
  
  if (!response.ok || !data.posts) {
    return { success: false, message: 'Personalized API failed' };
  }
  
  const posts = data.posts;
  
  if (posts.length === 0) {
    return { success: false, message: 'No posts in personalized feed' };
  }
  
  // Check community diversity (shouldn't all be from same community)
  const communityIds = posts.map(p => p.community_id);
  const uniqueCommunities = [...new Set(communityIds)];
  
  if (uniqueCommunities.length === 1 && posts.length > 3) {
    return { success: false, message: 'Personalized feed lacks community diversity' };
  }
  
  // Check post type diversity
  const postTypes = posts.map(p => p.post_type);
  const uniqueTypes = [...new Set(postTypes)];
  
  if (uniqueTypes.length === 1 && posts.length > 3) {
    return { success: false, message: 'Personalized feed lacks post type diversity' };
  }
  
  return { 
    success: true, 
    message: `Personalized feed has good diversity (${uniqueCommunities.length} communities, ${uniqueTypes.length} post types)` 
  };
}

// Test API response times
async function testResponseTimes() {
  const endpoints = [
    '/api/communities',
    '/api/posts?sort=hot',
    '/api/posts?sort=personalized'
  ];
  
  const times = [];
  
  for (const endpoint of endpoints) {
    const start = Date.now();
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const end = Date.now();
    
    if (!response.ok) {
      return { success: false, message: `${endpoint} returned error ${response.status}` };
    }
    
    times.push(end - start);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const maxTime = Math.max(...times);
  
  if (maxTime > 5000) {
    return { success: false, message: `Response time too slow: ${maxTime}ms` };
  }
  
  return { 
    success: true, 
    message: `Good response times (avg: ${avgTime.toFixed(0)}ms, max: ${maxTime}ms)` 
  };
}

// Run all edge case tests
async function runEdgeCaseTests() {
  log('\n🔍 Starting Edge Case and Robustness Tests', 'bold');
  log('============================================', 'blue');
  
  const tests = [
    ['Empty Search Query', testEmptySearch],
    ['Pagination', testPagination],
    ['Community Not Found', testCommunityNotFound],
    ['Malformed Requests', testMalformedRequests],
    ['Post Content Validation', testPostContentValidation],
    ['Community Data Consistency', testCommunityDataConsistency],
    ['Personalized Algorithm Diversity', testPersonalizedDiversity],
    ['API Response Times', testResponseTimes]
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [name, testFn] of tests) {
    try {
      log(`\n🧪 Testing: ${name}`, 'blue');
      const result = await testFn();
      if (result.success) {
        log(`✅ PASS: ${result.message}`, 'green');
        passed++;
      } else {
        log(`❌ FAIL: ${result.message}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`💥 ERROR: ${name} - ${error.message}`, 'red');
      failed++;
    }
  }
  
  log('\n📊 Edge Case Test Results', 'bold');
  log('==========================', 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 
      failed === 0 ? 'green' : 'yellow');
  
  if (failed === 0) {
    log('\n🛡️ All edge case tests passed! The platform is robust and handles edge cases well.', 'green');
  } else {
    log('\n⚠️ Some edge case tests failed. The platform may need additional robustness improvements.', 'yellow');
  }
  
  return failed === 0;
}

// Run tests if called directly
if (require.main === module) {
  runEdgeCaseTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log(`💥 Edge case test suite crashed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runEdgeCaseTests }; 