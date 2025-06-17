#!/usr/bin/env node

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = 'http://localhost:4000';
const TESTS = [];

// Test utilities
function addTest(name, testFn) {
  TESTS.push({ name, testFn });
}

function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '🔄';
  console.log(`${emoji} ${name}${details ? ` - ${details}` : ''}`);
}

function logSection(title) {
  console.log(`\n🔍 ${title}`);
  console.log('=' + '='.repeat(title.length + 3));
}

// Simple HTTP client using built-in modules
function httpRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data, isHtml: true });
        }
      });
    }).on('error', reject);
  });
}

// API Testing Functions
async function testAPI(endpoint, expectedKeys = []) {
  try {
    const result = await httpRequest(`${BASE_URL}${endpoint}`);
    
    if (result.statusCode !== 200) {
      return { success: false, error: `HTTP ${result.statusCode}`, data: result.data };
    }
    
    if (result.isHtml) {
      return { success: false, error: 'Received HTML instead of JSON' };
    }
    
    const data = result.data;
    
    // Check if we got real data vs fallback
    const isRealData = !data.isFallback && !data.error && Array.isArray(data) ? data.length > 0 : true;
    
    // Validate expected keys if provided
    let hasExpectedStructure = true;
    if (expectedKeys.length > 0 && Array.isArray(data) && data.length > 0) {
      hasExpectedStructure = expectedKeys.every(key => key in data[0]);
    } else if (expectedKeys.length > 0 && !Array.isArray(data)) {
      hasExpectedStructure = expectedKeys.every(key => key in data);
    }
    
    return { 
      success: true, 
      isRealData, 
      hasExpectedStructure,
      dataLength: Array.isArray(data) ? data.length : 1,
      data: Array.isArray(data) ? data.slice(0, 2) : data // Sample data
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Define all tests
addTest('API: Projects endpoint', async () => {
  const result = await testAPI('/api/projects', ['id', 'title', 'username']);
  if (!result.success) {
    return { status: 'FAIL', details: `Error: ${result.error}` };
  }
  if (!result.isRealData) {
    return { status: 'FAIL', details: 'Still using fallback data' };
  }
  if (!result.hasExpectedStructure) {
    return { status: 'FAIL', details: 'Missing expected project structure' };
  }
  return { status: 'PASS', details: `${result.dataLength} projects loaded from database` };
});

addTest('API: Communities endpoint', async () => {
  const result = await testAPI('/api/communities', ['id', 'name', 'display_name']);
  if (!result.success) {
    return { status: 'FAIL', details: `Error: ${result.error}` };
  }
  if (!result.isRealData) {
    return { status: 'FAIL', details: 'Still using fallback data' };
  }
  return { status: 'PASS', details: `${result.dataLength} communities loaded` };
});

addTest('API: Posts endpoint', async () => {
  const result = await testAPI('/api/posts?sort=hot', ['id', 'title']);
  if (!result.success) {
    return { status: 'FAIL', details: `Error: ${result.error}` };
  }
  if (!result.isRealData) {
    return { status: 'FAIL', details: 'Still using fallback data' };
  }
  return { status: 'PASS', details: `${result.dataLength} posts loaded` };
});

addTest('Database: project_feed view exists', async () => {
  const result = await testAPI('/api/projects');
  if (!result.success) {
    return { status: 'FAIL', details: 'API call failed' };
  }
  
  // Check if the response has the project_feed structure
  const hasProjectFeedStructure = result.data && Array.isArray(result.data) && 
    result.data.length > 0 && result.data[0].username !== undefined;
    
  if (!hasProjectFeedStructure) {
    return { status: 'FAIL', details: 'project_feed view not working' };
  }
  
  return { status: 'PASS', details: 'project_feed view functioning correctly' };
});

addTest('Database: Profile relationships', async () => {
  const result = await testAPI('/api/projects');
  if (!result.success || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
    return { status: 'FAIL', details: 'No project data to test relationships' };
  }
  
  const project = result.data[0];
  const hasProfileData = project.username || project.display_name || project.author_id;
  
  if (!hasProfileData) {
    return { status: 'FAIL', details: 'Profile relationship missing' };
  }
  
  return { status: 'PASS', details: 'Profile relationships working' };
});

addTest('Performance: Page load speed', async () => {
  const start = Date.now();
  const result = await testAPI('/api/projects');
  const loadTime = Date.now() - start;
  
  if (!result.success) {
    return { status: 'FAIL', details: 'API call failed' };
  }
  
  if (loadTime > 2000) {
    return { status: 'FAIL', details: `Slow response: ${loadTime}ms` };
  }
  
  return { status: 'PASS', details: `Response time: ${loadTime}ms` };
});

addTest('Integration: Front-end connectivity', async () => {
  try {
    const result = await httpRequest(`${BASE_URL}/projects`);
    if (result.statusCode !== 200) {
      return { status: 'FAIL', details: `HTTP ${result.statusCode}` };
    }
    
    // Check for actual error indicators in HTML (not just the word "error")
    const errorIndicators = [
      'Internal Server Error',
      'Application error',
      'Runtime Error',
      'Failed to compile',
      'Something went wrong',
      'Error: ',
      '500 Internal Server Error',
      'This page has crashed'
    ];
    
    const hasActualError = errorIndicators.some(indicator => 
      result.data.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (hasActualError) {
      return { status: 'FAIL', details: 'Actual error detected in page content' };
    }
    
    // Check that the page has the expected structure
    const hasProjectsStructure = result.data.includes('Project Gallery') && 
                                 result.data.includes('eng.com');
    
    if (!hasProjectsStructure) {
      return { status: 'FAIL', details: 'Page structure not as expected' };
    }
    
    return { status: 'PASS', details: 'Front-end pages loading successfully' };
  } catch (error) {
    return { status: 'FAIL', details: `Connection error: ${error.message}` };
  }
});

// Main test runner
async function runTests() {
  console.log('🧪 DATABASE FIXES COMPREHENSIVE TESTING');
  console.log('========================================');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log(`⏱️  Started at: ${new Date().toISOString()}\n`);
  
  let passCount = 0;
  let failCount = 0;
  
  for (const test of TESTS) {
    try {
      const result = await test.testFn();
      logTest(test.name, result.status, result.details);
      
      if (result.status === 'PASS') passCount++;
      else failCount++;
      
    } catch (error) {
      logTest(test.name, 'FAIL', `Exception: ${error.message}`);
      failCount++;
    }
  }
  
  logSection('Test Summary');
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Success Rate: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);
  
  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Database fixes are working correctly.');
    console.log('✅ Your eng.com platform should now be fully functional.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the issues above.');
    console.log('💡 Make sure you applied the database migration correctly.');
  }
  
  console.log(`\n⏱️  Completed at: ${new Date().toISOString()}`);
}

// Check if server is running
async function checkServer() {
  try {
    const result = await httpRequest(`${BASE_URL}/api/projects`);
    return result.statusCode === 200 || result.statusCode === 500; // 500 means server is running but has errors
  } catch {
    return false;
  }
}

// Main execution
(async () => {
  console.log('🔍 Checking if development server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Development server not detected at http://localhost:4000');
    console.log('💡 Please start your server first: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Development server is running!\n');
  await runTests();
})(); 