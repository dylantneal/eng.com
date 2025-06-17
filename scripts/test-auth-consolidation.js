#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Authentication Consolidation');
console.log('======================================\n');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

let hasIssues = false;

// Test 1: Check that auth-server.ts exists and is properly typed
console.log('📋 Test 1: Server Auth Implementation');
if (fs.existsSync('lib/auth-server.ts')) {
  log('green', '✅ lib/auth-server.ts exists');
  
  const authServerContent = fs.readFileSync('lib/auth-server.ts', 'utf8');
  if (authServerContent.includes('getServerAuth')) {
    log('green', '✅ getServerAuth function implemented');
  } else {
    log('red', '❌ getServerAuth function missing');
    hasIssues = true;
  }
  
  if (authServerContent.includes('requireServerAuth')) {
    log('green', '✅ requireServerAuth function implemented');
  } else {
    log('red', '❌ requireServerAuth function missing');
    hasIssues = true;
  }
} else {
  log('red', '❌ lib/auth-server.ts missing');
  hasIssues = true;
}

// Test 2: Check converted API routes
console.log('\n📋 Test 2: API Route Conversion');
const testRoutes = [
  'app/api/user/update-profile/route.ts',
];

testRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    const content = fs.readFileSync(route, 'utf8');
    
    if (content.includes('getServerAuth')) {
      log('green', `✅ ${route} uses Supabase auth`);
    } else if (content.includes('getServerSession')) {
      log('yellow', `⚠️  ${route} still uses NextAuth`);
      hasIssues = true;
    } else {
      log('yellow', `⚠️  ${route} unclear auth implementation`);
    }
  } else {
    log('red', `❌ ${route} not found`);
  }
});

// Test 3: Check converted pages
console.log('\n📋 Test 3: Server Component Conversion');
const testPages = [
  'app/settings/page.tsx',
  'app/settings/layout.tsx',
];

testPages.forEach(page => {
  if (fs.existsSync(page)) {
    const content = fs.readFileSync(page, 'utf8');
    
    if (content.includes('getServerAuth')) {
      log('green', `✅ ${page} uses Supabase auth`);
    } else if (content.includes('getServerSession')) {
      log('yellow', `⚠️  ${page} still uses NextAuth`);
      hasIssues = true;
    } else {
      log('yellow', `⚠️  ${page} unclear auth implementation`);
    }
  } else {
    log('red', `❌ ${page} not found`);
  }
});

// Test 4: Check for remaining NextAuth imports
console.log('\n📋 Test 4: NextAuth Usage Analysis');
try {
  const { execSync } = require('child_process');
  
  // Count getServerSession usage (excluding node_modules and .git)
  const nextAuthCount = execSync(
    'grep -r "getServerSession" app/ lib/ --include="*.ts" --include="*.tsx" | wc -l',
    { encoding: 'utf8' }
  ).trim();
  
  log('blue', `📊 Files still using getServerSession: ${nextAuthCount}`);
  
  if (parseInt(nextAuthCount) > 20) {
    log('yellow', '⚠️  Many files still need conversion');
  } else if (parseInt(nextAuthCount) > 0) {
    log('yellow', '⚠️  Some files still need conversion');
  } else {
    log('green', '✅ All files converted!');
  }
} catch (error) {
  log('yellow', '⚠️  Could not analyze NextAuth usage');
}

// Test 5: Check client-side auth usage
console.log('\n📋 Test 5: Client Auth Usage');
try {
  const { execSync } = require('child_process');
  
  // Count useAuth usage
  const useAuthCount = execSync(
    'grep -r "useAuth.*AuthContext" app/ components/ --include="*.ts" --include="*.tsx" | wc -l',
    { encoding: 'utf8' }
  ).trim();
  
  // Count useSession usage
  const useSessionCount = execSync(
    'grep -r "useSession.*next-auth" app/ components/ --include="*.ts" --include="*.tsx" | wc -l',
    { encoding: 'utf8' }
  ).trim();
  
  log('blue', `📊 Components using Supabase useAuth: ${useAuthCount}`);
  log('blue', `📊 Components using NextAuth useSession: ${useSessionCount}`);
  
  if (parseInt(useSessionCount) > 0) {
    log('yellow', '⚠️  Some components still use NextAuth useSession');
    hasIssues = true;
  }
} catch (error) {
  log('yellow', '⚠️  Could not analyze client auth usage');
}

// Test 6: Check auth context availability
console.log('\n📋 Test 6: Auth Context Check');
if (fs.existsSync('contexts/AuthContext.tsx')) {
  log('green', '✅ AuthContext.tsx exists');
  
  const contextContent = fs.readFileSync('contexts/AuthContext.tsx', 'utf8');
  if (contextContent.includes('getCurrentUser')) {
    log('green', '✅ AuthContext uses Supabase auth functions');
  }
} else {
  log('red', '❌ AuthContext.tsx missing');
  hasIssues = true;
}

// Test 7: Check for orphaned NextAuth files
console.log('\n📋 Test 7: NextAuth Cleanup Check');
const nextAuthFiles = [
  'lib/authOptions.ts',
  'app/api/auth/[...nextauth]/route.ts',
];

let nextAuthRemaining = 0;
nextAuthFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log('yellow', `⚠️  NextAuth file still exists: ${file}`);
    nextAuthRemaining++;
  }
});

if (nextAuthRemaining === 0) {
  log('green', '✅ All NextAuth files cleaned up');
} else {
  log('blue', '💡 NextAuth files still exist (OK for gradual migration)');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasIssues) {
  log('yellow', '⚠️  AUTHENTICATION CONSOLIDATION IN PROGRESS');
  log('blue', '\n🔧 NEXT STEPS:');
  log('blue', '1. Continue converting remaining API routes');
  log('blue', '2. Convert remaining server components');
  log('blue', '3. Update client components to use consistent auth');
  log('blue', '4. Test authentication flow end-to-end');
  log('blue', '5. Remove NextAuth files when conversion is complete');
} else {
  log('green', '✅ AUTHENTICATION CONSOLIDATION LOOKS GOOD');
  log('blue', '\n🎉 Key improvements:');
  log('blue', '• Unified Supabase authentication system');
  log('blue', '• Consistent user data handling');
  log('blue', '• Eliminated authentication conflicts');
  log('blue', '• Ready for advanced Supabase features');
}

process.exit(hasIssues ? 1 : 0); 