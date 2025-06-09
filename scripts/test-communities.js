#!/usr/bin/env node

const BASE_URL = 'http://localhost:4000';

// Colors for console output
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

async function runTest(testName, testFn) {
  try {
    log(`\n🧪 Testing: ${testName}`, 'blue');
    const result = await testFn();
    if (result.success) {
      log(`✅ PASS: ${result.message}`, 'green');
    } else {
      log(`❌ FAIL: ${result.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`💥 ERROR: ${testName} - ${error.message}`, 'red');
    return false;
  }
  return true;
}

// Test Communities API
async function testCommunitiesAPI() {
  const response = await fetch(`${BASE_URL}/api/communities`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, message: `API returned ${response.status}` };
  }
  
  if (!Array.isArray(data)) {
    return { success: false, message: 'API did not return an array' };
  }
  
  if (data.length !== 24) {
    return { success: false, message: `Expected 24 communities, got ${data.length}` };
  }
  
  // Validate structure of first community
  const firstCommunity = data[0];
  const requiredFields = ['id', 'name', 'display_name', 'description', 'category', 'color', 'member_count'];
  
  for (const field of requiredFields) {
    if (!firstCommunity.hasOwnProperty(field)) {
      return { success: false, message: `Missing required field: ${field}` };
    }
  }
  
  return { 
    success: true, 
    message: `${data.length} communities loaded with correct structure` 
  };
}

// Test Posts API - Hot sorting
async function testPostsAPIHot() {
  const response = await fetch(`${BASE_URL}/api/posts?sort=hot`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, message: `API returned ${response.status}` };
  }
  
  if (!data.posts || !Array.isArray(data.posts)) {
    return { success: false, message: 'API did not return posts array' };
  }
  
  if (data.posts.length === 0) {
    return { success: false, message: 'No posts returned' };
  }
  
  // Validate structure of first post
  const firstPost = data.posts[0];
  const requiredFields = ['id', 'title', 'content', 'community_id', 'username', 'vote_count', 'comment_count'];
  
  for (const field of requiredFields) {
    if (!firstPost.hasOwnProperty(field)) {
      return { success: false, message: `Missing required field in post: ${field}` };
    }
  }
  
  return { 
    success: true, 
    message: `${data.posts.length} posts loaded with hot sorting` 
  };
}

// Test Posts API - Personalized sorting
async function testPostsAPIPersonalized() {
  const response = await fetch(`${BASE_URL}/api/posts?sort=personalized`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, message: `API returned ${response.status}` };
  }
  
  if (!data.posts || !Array.isArray(data.posts)) {
    return { success: false, message: 'API did not return posts array' };
  }
  
  // Check if personalized sorting is working (first post should be robotics-related)
  const firstPost = data.posts[0];
  if (!firstPost.title.toLowerCase().includes('robotic') && 
      !firstPost.tags.some(tag => tag.includes('robotics'))) {
    return { success: false, message: 'Personalized algorithm not working correctly' };
  }
  
  return { 
    success: true, 
    message: `Personalized feed working (${data.posts.length} posts)` 
  };
}

// Test Community Filtering
async function testCommunityFiltering() {
  const response = await fetch(`${BASE_URL}/api/posts?community=8&sort=hot`);
  const data = await response.json();
  
  if (!response.ok) {
    return { success: false, message: `API returned ${response.status}` };
  }
  
  if (!data.posts || !Array.isArray(data.posts)) {
    return { success: false, message: 'API did not return posts array' };
  }
  
  // All posts should be from community 8 (Robotics)
  const nonMatchingPosts = data.posts.filter(post => post.community_id !== '8');
  if (nonMatchingPosts.length > 0) {
    return { success: false, message: `Found ${nonMatchingPosts.length} posts not from community 8` };
  }
  
  return { 
    success: true, 
    message: `Community filtering working (${data.posts.length} posts from Robotics)` 
  };
}

// Test Sorting Algorithms
async function testSortingAlgorithms() {
  const sorts = ['hot', 'new', 'top'];
  const results = {};
  
  for (const sort of sorts) {
    const response = await fetch(`${BASE_URL}/api/posts?sort=${sort}`);
    const data = await response.json();
    
    if (!response.ok || !data.posts) {
      return { success: false, message: `${sort} sorting failed` };
    }
    
    results[sort] = data.posts;
  }
  
  // Verify that sorting produces different orders
  const hotOrder = results.hot.map(p => p.id).join(',');
  const newOrder = results.new.map(p => p.id).join(',');
  const topOrder = results.top.map(p => p.id).join(',');
  
  if (hotOrder === newOrder && newOrder === topOrder) {
    return { success: false, message: 'All sorting algorithms return same order' };
  }
  
  // Verify top sorting is by vote count (descending)
  const topPosts = results.top;
  for (let i = 0; i < topPosts.length - 1; i++) {
    if (topPosts[i].vote_count < topPosts[i + 1].vote_count) {
      return { success: false, message: 'Top sorting not working correctly' };
    }
  }
  
  return { 
    success: true, 
    message: 'All sorting algorithms working correctly' 
  };
}

// Test Community Categories
async function testCommunityCategories() {
  const response = await fetch(`${BASE_URL}/api/communities`);
  const data = await response.json();
  
  if (!response.ok || !Array.isArray(data)) {
    return { success: false, message: 'Communities API failed' };
  }
  
  // Group by category
  const categories = {};
  data.forEach(community => {
    const category = community.category;
    if (!categories[category]) categories[category] = [];
    categories[category].push(community);
  });
  
  const expectedCategories = ['engineering', 'software', 'robotics', 'electronics', 'science', 'manufacturing', 'technology', 'energy', 'tools', 'career', 'projects', 'education'];
  const missingCategories = expectedCategories.filter(cat => !categories[cat]);
  
  if (missingCategories.length > 0) {
    return { success: false, message: `Missing categories: ${missingCategories.join(', ')}` };
  }
  
  return { 
    success: true, 
    message: `${Object.keys(categories).length} categories with proper distribution` 
  };
}

// Test Post Types and Tags
async function testPostTypesAndTags() {
  const response = await fetch(`${BASE_URL}/api/posts?sort=hot`);
  const data = await response.json();
  
  if (!response.ok || !data.posts) {
    return { success: false, message: 'Posts API failed' };
  }
  
  const posts = data.posts;
  
  // Check post types
  const postTypes = [...new Set(posts.map(p => p.post_type))];
  const expectedTypes = ['showcase', 'question', 'discussion', 'news', 'research', 'project', 'review', 'advice', 'case-study'];
  
  const hasValidTypes = postTypes.some(type => expectedTypes.includes(type));
  if (!hasValidTypes) {
    return { success: false, message: 'No valid post types found' };
  }
  
  // Check tags
  const allTags = posts.flatMap(p => p.tags || []);
  if (allTags.length === 0) {
    return { success: false, message: 'No tags found in posts' };
  }
  
  return { 
    success: true, 
    message: `${postTypes.length} post types and ${allTags.length} total tags found` 
  };
}

// Test Frontend Page Loading
async function testFrontendLoading() {
  const response = await fetch(`${BASE_URL}/community`);
  const html = await response.text();
  
  if (!response.ok) {
    return { success: false, message: `Frontend returned ${response.status}` };
  }
  
  if (!html.includes('Engineering Communities')) {
    return { success: false, message: 'Page title not found in HTML' };
  }
  
  if (!html.includes('All Communities')) {
    return { success: false, message: 'Community navigation not found' };
  }
  
  if (!html.includes('For You')) {
    return { success: false, message: 'Personalized feed option not found' };
  }
  
  return { 
    success: true, 
    message: 'Frontend page loads correctly with all elements' 
  };
}

// Test API Error Handling
async function testErrorHandling() {
  // Test invalid community ID
  const response1 = await fetch(`${BASE_URL}/api/posts?community=invalid&sort=hot`);
  const data1 = await response1.json();
  
  if (!response1.ok) {
    return { success: false, message: 'API should handle invalid community gracefully' };
  }
  
  // Should return empty posts array for invalid community
  if (!data1.posts || data1.posts.length > 0) {
    return { success: false, message: 'Invalid community should return empty results' };
  }
  
  // Test invalid sort parameter
  const response2 = await fetch(`${BASE_URL}/api/posts?sort=invalid`);
  const data2 = await response2.json();
  
  if (!response2.ok || !data2.posts) {
    return { success: false, message: 'API should handle invalid sort gracefully' };
  }
  
  return { 
    success: true, 
    message: 'Error handling works correctly' 
  };
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting Comprehensive Community Platform Tests', 'bold');
  log('================================================', 'blue');
  
  const tests = [
    ['Communities API Structure', testCommunitiesAPI],
    ['Posts API - Hot Sorting', testPostsAPIHot],
    ['Posts API - Personalized Feed', testPostsAPIPersonalized],
    ['Community Filtering', testCommunityFiltering],
    ['Sorting Algorithms', testSortingAlgorithms],
    ['Community Categories', testCommunityCategories],
    ['Post Types and Tags', testPostTypesAndTags],
    ['Frontend Page Loading', testFrontendLoading],
    ['Error Handling', testErrorHandling]
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const [name, testFn] of tests) {
    const success = await runTest(name, testFn);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }
  
  log('\n📊 Test Results', 'bold');
  log('================', 'blue');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`, 
      failed === 0 ? 'green' : 'yellow');
  
  if (failed === 0) {
    log('\n🎉 All tests passed! The community platform is fully functional.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please review the issues above.', 'yellow');
  }
  
  return failed === 0;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log(`💥 Test suite crashed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests }; 