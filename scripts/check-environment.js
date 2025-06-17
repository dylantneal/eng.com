#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 eng.com Environment Check');
console.log('============================\n');

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

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  log('red', '❌ .env.local file is missing');
  log('yellow', '💡 Run: npm run setup:local-supabase (for testing) or npm run setup:env (for production)');
  hasErrors = true;
} else {
  log('green', '✅ .env.local file exists');
}

// If .env.local exists, check its contents
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  // Required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  console.log('\n📋 Environment Variables Check:');
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      const line = envContent.split('\n').find(line => line.startsWith(varName));
      if (line && line.split('=')[1] && line.split('=')[1].trim() !== '') {
        if (line.includes('your-') || line.includes('placeholder')) {
          log('yellow', `⚠️  ${varName}: Set but contains placeholder values`);
          hasWarnings = true;
        } else {
          log('green', `✅ ${varName}: Configured`);
        }
      } else {
        log('red', `❌ ${varName}: Empty value`);
        hasErrors = true;
      }
    } else {
      log('red', `❌ ${varName}: Missing`);
      hasErrors = true;
    }
  });

  // Check for local vs production setup
  if (envContent.includes('127.0.0.1:54321')) {
    log('blue', '\n🔧 Local Supabase Configuration Detected');
    log('yellow', '⚠️  This is for development only - you\'ll need real Supabase for full functionality');
  } else if (envContent.includes('.supabase.co')) {
    log('blue', '\n🚀 Production Supabase Configuration Detected');
    log('green', '✅ Good! You\'re using a real Supabase instance');
  }
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  log('red', '\n❌ node_modules directory missing');
  log('yellow', '💡 Run: npm install');
  hasErrors = true;
} else {
  log('green', '\n✅ Dependencies installed');
}

// Check critical files
const criticalFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json'
];

console.log('\n📁 Critical Files Check:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    log('green', `✅ ${file}`);
  } else {
    log('red', `❌ ${file} missing`);
    hasErrors = true;
  }
});

// Check if we can import environment
console.log('\n🔗 Environment Loading Test:');
try {
  // Try to load Next.js environment
  require('dotenv').config({ path: '.env.local' });
  
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    log('green', '✅ Environment variables loading correctly');
  } else {
    log('yellow', '⚠️  Environment variables not loading properly');
    hasWarnings = true;
  }
} catch (error) {
  log('red', `❌ Error loading environment: ${error.message}`);
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  log('red', '❌ ENVIRONMENT CHECK FAILED');
  log('yellow', '\n🔧 QUICK FIXES:');
  log('yellow', '1. Run: npm run setup:local-supabase (for immediate testing)');
  log('yellow', '2. Or run: npm run setup:env (for production setup)');
  log('yellow', '3. Follow the prompts to configure your environment');
  process.exit(1);
} else if (hasWarnings) {
  log('yellow', '⚠️  ENVIRONMENT CHECK PASSED WITH WARNINGS');
  log('blue', '\n💡 Your environment is functional but may need refinement for production');
  process.exit(0);
} else {
  log('green', '✅ ENVIRONMENT CHECK PASSED');
  log('blue', '\n🚀 Your environment is properly configured!');
  log('blue', '   Ready to run: npm run dev');
  process.exit(0);
} 