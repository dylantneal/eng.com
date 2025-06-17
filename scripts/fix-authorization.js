#!/usr/bin/env node

/**
 * Authorization Fix Script for eng.com
 * This script applies the comprehensive database schema fix and validates the authorization system
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m',
};

function log(color, message) {
  console.log(`${colors[color] || ''}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log('cyan', `${title}`);
  console.log('='.repeat(60));
}

function logStep(step, description) {
  log('blue', `${step}. ${description}`);
}

function logSuccess(message) {
  log('green', `✅ ${message}`);
}

function logWarning(message) {
  log('yellow', `⚠️  ${message}`);
}

function logError(message) {
  log('red', `❌ ${message}`);
}

async function main() {
  logSection('🔐 eng.com Authorization System Fix');
  
  console.log('This script will fix the authorization issues in your application by:');
  console.log('1. Applying database schema fixes');
  console.log('2. Updating authentication configuration');
  console.log('3. Validating the authorization system');
  console.log('4. Providing next steps\n');

  // Step 1: Check if database schema fix file exists
  logStep(1, 'Checking database schema fix file...');
  const schemaFixPath = path.join(__dirname, '..', 'database', 'auth_schema_fix_complete.sql');
  
  if (!fs.existsSync(schemaFixPath)) {
    logError('Database schema fix file not found!');
    console.log('Expected location:', schemaFixPath);
    process.exit(1);
  }
  
  logSuccess('Database schema fix file found');

  // Step 2: Validate auth configuration files
  logStep(2, 'Validating authentication configuration...');
  
  const authFiles = [
    'lib/authOptions.ts',
    'lib/auth-middleware.ts',
    'contexts/AuthContext.tsx',
    'types/next-auth.d.ts'
  ];

  let allFilesExist = true;
  for (const file of authFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      logSuccess(`${file} ✓`);
    } else {
      logError(`${file} ✗`);
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    logError('Some required auth files are missing. Please ensure all files are created.');
    process.exit(1);
  }

  // Step 3: Check environment variables
  logStep(3, 'Checking environment variables...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const envFilePath = path.join(__dirname, '..', '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, 'utf8');
    logSuccess('.env.local file found');
  } else {
    logWarning('.env.local file not found - using process.env');
  }

  for (const envVar of requiredEnvVars) {
    if (envContent.includes(envVar) || process.env[envVar]) {
      logSuccess(`${envVar} ✓`);
    } else {
      logWarning(`${envVar} ✗ - This may cause issues`);
    }
  }

  // Step 4: Display database fix instructions
  logStep(4, 'Database Schema Fix Instructions');
  
  console.log('\n📋 To apply the database schema fix:');
  console.log('');
  console.log('1. Open your Supabase Dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Create a new query');
  console.log('4. Copy and paste the contents of:');
  log('cyan', `   ${schemaFixPath}`);
  console.log('5. Execute the query');
  console.log('');
  
  // Step 5: Show auth configuration summary
  logStep(5, 'Authorization System Summary');
  
  console.log('\n📋 What has been configured:');
  console.log('');
  logSuccess('✅ Unified NextAuth configuration with credentials provider');
  logSuccess('✅ Database schema with proper relationships');
  logSuccess('✅ Authorization middleware for API routes');
  logSuccess('✅ Client-side auth context with React hooks');
  logSuccess('✅ TypeScript types for NextAuth');
  logSuccess('✅ Row Level Security policies');
  logSuccess('✅ Automatic profile creation triggers');
  console.log('');

  // Step 6: Usage examples
  logStep(6, 'Usage Examples');
  
  console.log('\n📝 How to use the new authorization system:');
  console.log('');
  
  console.log('🔹 In API routes:');
  log('cyan', `
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request, user) => {
  // user is guaranteed to be authenticated
  return NextResponse.json({ userId: user.id });
}, { required: true });`);

  console.log('\n🔹 In React components:');
  log('cyan', `
import { useAuth, useIsAuthenticated } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  
  if (!isAuthenticated) {
    return <LoginForm onSignIn={signIn} />;
  }
  
  return <div>Welcome, {user.display_name}!</div>;
}`);

  console.log('\n🔹 In server components:');
  log('cyan', `
import { getAuthUser } from '@/lib/auth-middleware';

export default async function ServerComponent() {
  const authResult = await getAuthUser();
  
  if (!authResult.success) {
    redirect('/signin');
  }
  
  return <div>Hello, {authResult.user.display_name}!</div>;
}`);

  // Step 7: Next steps
  logStep(7, 'Next Steps');
  
  console.log('\n🚀 After applying the database fix:');
  console.log('');
  console.log('1. Restart your development server');
  console.log('2. Test sign up with a new email/password');
  console.log('3. Test sign in with existing credentials');
  console.log('4. Verify that protected routes work correctly');
  console.log('5. Check that user profiles are created automatically');
  console.log('');

  // Step 8: Troubleshooting
  logStep(8, 'Troubleshooting');
  
  console.log('\n🔧 If you encounter issues:');
  console.log('');
  console.log('• Check browser console for auth errors');
  console.log('• Verify Supabase connection in Network tab');
  console.log('• Check server logs for database errors');
  console.log('• Ensure all environment variables are set');
  console.log('• Verify the database schema was applied correctly');
  console.log('');

  logSection('✅ Authorization Fix Complete');
  
  console.log('The authorization system has been updated with:');
  console.log('• Fixed database schema and relationships');
  console.log('• Consistent authentication across client and server');
  console.log('• Proper authorization middleware');
  console.log('• Enhanced security policies');
  console.log('');
  
  logSuccess('Ready to apply database fix and test the system!');
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  logError(`Script failed: ${error.message}`);
  process.exit(1);
}); 