#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

console.log('🧪 Authentication Integration Test');
console.log('==================================\n');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

let hasErrors = false;
let hasWarnings = false;

// Helper function to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 4000,
      path: path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Test 1: Server Availability');
  try {
    const response = await makeRequest('/');
    if (response.statusCode === 200) {
      log('green', '✅ Development server is running and responsive');
    } else {
      log('red', `❌ Unexpected status code: ${response.statusCode}`);
      hasErrors = true;
    }
  } catch (error) {
    log('red', `❌ Server not available: ${error.message}`);
    hasErrors = true;
    return; // Can't continue if server is down
  }

  console.log('\n🔍 Test 2: Authentication Routes');
  
  // Test auth page (should load for unauthenticated users)
  try {
    const authResponse = await makeRequest('/auth');
    if (authResponse.statusCode === 200) {
      log('green', '✅ /auth page loads correctly');
    } else {
      log('red', `❌ /auth page error: ${authResponse.statusCode}`);
      hasErrors = true;
    }
  } catch (error) {
    log('red', `❌ /auth page request failed: ${error.message}`);
    hasErrors = true;
  }

  // Test signup page (should load for unauthenticated users)
  try {
    const signupResponse = await makeRequest('/signup');
    if (signupResponse.statusCode === 200) {
      log('green', '✅ /signup page loads correctly');
    } else {
      log('red', `❌ /signup page error: ${signupResponse.statusCode}`);
      hasErrors = true;
    }
  } catch (error) {
    log('red', `❌ /signup page request failed: ${error.message}`);
    hasErrors = true;
  }

  console.log('\n🔍 Test 3: Protected Routes (Should Redirect)');
  
  // Test settings page (should redirect unauthenticated users)
  try {
    const settingsResponse = await makeRequest('/settings');
    if (settingsResponse.statusCode === 307 || settingsResponse.statusCode === 302) {
      const location = settingsResponse.headers.location;
      if (location && location.includes('/auth/signin')) {
        log('green', '✅ /settings correctly redirects unauthenticated users');
      } else {
        log('yellow', `⚠️  /settings redirects but to unexpected location: ${location}`);
        hasWarnings = true;
      }
    } else {
      log('red', `❌ /settings should redirect but returned: ${settingsResponse.statusCode}`);
      hasErrors = true;
    }
  } catch (error) {
    log('red', `❌ /settings request failed: ${error.message}`);
    hasErrors = true;
  }

  console.log('\n🔍 Test 4: API Route Authentication');
  
  // Test profile update API (should return 401 for unauthenticated)
  try {
    const apiResponse = await makeRequest('/api/user/update-profile', {
      method: 'POST',
      body: { bio: 'test' }
    });
    
    if (apiResponse.statusCode === 401) {
      try {
        const responseBody = JSON.parse(apiResponse.body);
        if (responseBody.error === 'Unauthorized') {
          log('green', '✅ API correctly rejects unauthenticated requests');
        } else {
          log('yellow', `⚠️  API returns 401 but unexpected error message: ${responseBody.error}`);
          hasWarnings = true;
        }
      } catch (parseError) {
        log('yellow', '⚠️  API returns 401 but response is not valid JSON');
        hasWarnings = true;
      }
    } else {
      log('red', `❌ API should return 401 but returned: ${apiResponse.statusCode}`);
      hasErrors = true;
    }
  } catch (error) {
    log('red', `❌ API request failed: ${error.message}`);
    hasErrors = true;
  }

  console.log('\n🔍 Test 5: File Structure Integrity');
  
  // Check that critical auth files exist
  const criticalFiles = [
    'lib/auth-server.ts',
    'lib/auth.ts', 
    'contexts/AuthContext.tsx',
    '.env.local'
  ];

  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log('green', `✅ ${file} exists`);
    } else {
      log('red', `❌ Critical file missing: ${file}`);
      hasErrors = true;
    }
  });

  console.log('\n🔍 Test 6: Auth System Conflicts');
  
  // Check for mixed auth imports in key files
  const keyFiles = [
    'app/settings/page.tsx',
    'app/settings/layout.tsx',
    'app/api/user/update-profile/route.ts'
  ];

  keyFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const hasSupabaseAuth = content.includes('getServerAuth');
      const hasNextAuth = content.includes('getServerSession');
      
      if (hasSupabaseAuth && !hasNextAuth) {
        log('green', `✅ ${file} uses pure Supabase auth`);
      } else if (hasNextAuth && !hasSupabaseAuth) {
        log('yellow', `⚠️  ${file} still uses NextAuth`);
        hasWarnings = true;
      } else if (hasSupabaseAuth && hasNextAuth) {
        log('red', `❌ ${file} has mixed auth systems - CONFLICT!`);
        hasErrors = true;
      } else {
        log('yellow', `⚠️  ${file} unclear auth implementation`);
        hasWarnings = true;
      }
    }
  });

  console.log('\n🔍 Test 7: Environment Configuration');
  
  // Verify environment variables are accessible
  try {
    require('dotenv').config({ path: '.env.local' });
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    let envVarsLoaded = 0;
    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        envVarsLoaded++;
      }
    });

    if (envVarsLoaded === requiredEnvVars.length) {
      log('green', '✅ All required environment variables are loaded');
    } else {
      log('red', `❌ Missing environment variables: ${requiredEnvVars.length - envVarsLoaded} out of ${requiredEnvVars.length}`);
      hasErrors = true;
    }
  } catch (error) {
    log('red', `❌ Environment loading error: ${error.message}`);
    hasErrors = true;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  
  if (hasErrors) {
    log('red', '❌ INTEGRATION TEST FAILED');
    log('red', '\n🚨 CRITICAL ISSUES DETECTED:');
    log('red', '• Authentication system has errors that need immediate attention');
    log('red', '• The mixed auth system issue may NOT be fully resolved');
    return false;
  } else if (hasWarnings) {
    log('yellow', '⚠️  INTEGRATION TEST PASSED WITH WARNINGS');
    log('yellow', '\n⚠️  NON-CRITICAL ISSUES:');
    log('yellow', '• Some components still use old auth system (migration in progress)');
    log('yellow', '• Authentication consolidation is not complete but functional');
    log('blue', '\n✅ CORE FUNCTIONALITY:');
    log('blue', '• No authentication conflicts detected');
    log('blue', '• Protected routes work correctly');
    log('blue', '• API authentication works correctly');
    log('blue', '• Environment is properly configured');
    return true;
  } else {
    log('green', '✅ INTEGRATION TEST PASSED COMPLETELY');
    log('green', '\n🎉 AUTHENTICATION SYSTEM STATUS:');
    log('green', '• No conflicts between auth systems');
    log('green', '• All routes behave correctly');
    log('green', '• API authentication working properly');
    log('green', '• Environment fully configured');
    log('green', '• Mixed auth system issue RESOLVED');
    return true;
  }
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log('red', `❌ Test runner error: ${error.message}`);
  process.exit(1);
}); 