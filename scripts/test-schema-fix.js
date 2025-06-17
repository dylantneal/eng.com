#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('🧪 COMPREHENSIVE DATABASE SCHEMA TESTING');
console.log('=========================================');

async function testTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (error) throw error;
    return data.length > 0;
  } catch (err) {
    console.warn(`⚠️  Error checking table ${tableName}:`, err.message);
    return false;
  }
}

async function testColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName);
    
    if (error) throw error;
    return data.length > 0;
  } catch (err) {
    console.warn(`⚠️  Error checking column ${tableName}.${columnName}:`, err.message);
    return false;
  }
}

async function testTriggerExists(triggerName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name')
      .eq('trigger_name', triggerName);
    
    if (error) throw error;
    return data.length > 0;
  } catch (err) {
    console.warn(`⚠️  Error checking trigger ${triggerName}:`, err.message);
    return false;
  }
}

async function testProfileCreation() {
  console.log('\n🔍 Testing Profile Creation Workflow...');
  
  // Test if we can create a test user and check if profile is created automatically
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    // Create test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (authError) throw authError;
    console.log('✅ Test user created successfully');
    
    // Check if profile was created automatically
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for trigger
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Profile not created automatically:', profileError.message);
      return false;
    }
    
    console.log('✅ Profile created automatically with trigger');
    console.log('   Profile data:', {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      handle: profile.handle
    });
    
    // Clean up test user
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Test user cleaned up');
    
    return true;
  } catch (err) {
    console.log('❌ Profile creation test failed:', err.message);
    return false;
  }
}

async function testProfileUpdate() {
  console.log('\n🔍 Testing Profile Update Functionality...');
  
  try {
    // Get first user from profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, handle')
      .limit(1);
    
    if (error || !profiles || profiles.length === 0) {
      console.log('❌ No profiles found to test update');
      return false;
    }
    
    const testProfile = profiles[0];
    const originalUsername = testProfile.username;
    const testUsername = `test-${Date.now()}`;
    
    // Test update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: testUsername })
      .eq('id', testProfile.id);
    
    if (updateError) {
      console.log('❌ Profile update failed:', updateError.message);
      return false;
    }
    
    console.log('✅ Profile update successful');
    
    // Restore original username
    await supabase
      .from('profiles')
      .update({ username: originalUsername })
      .eq('id', testProfile.id);
    
    return true;
  } catch (err) {
    console.log('❌ Profile update test failed:', err.message);
    return false;
  }
}

async function runComprehensiveTests() {
  let passedTests = 0;
  let totalTests = 0;
  
  console.log('\n📋 TESTING DATABASE SCHEMA STRUCTURE');
  console.log('====================================');
  
  // Test 1: Core tables exist
  const coreTables = ['profiles', 'projects', 'versions', 'communities', 'posts', 'project_likes', 'comments'];
  for (const table of coreTables) {
    totalTests++;
    const exists = await testTableExists(table);
    if (exists) {
      console.log(`✅ Table '${table}' exists`);
      passedTests++;
    } else {
      console.log(`❌ Table '${table}' missing`);
    }
  }
  
  console.log('\n📋 TESTING COLUMN NAMING CONSISTENCY');
  console.log('===================================');
  
  // Test 2: Critical column naming fixes
  const columnTests = [
    ['projects', 'owner_id'],
    ['profiles', 'username'],
    ['profiles', 'handle'],
    ['profiles', 'email'],
    ['profiles', 'display_name'],
    ['comments', 'body'],
    ['profiles', 'post_karma'],
    ['profiles', 'plan']
  ];
  
  for (const [table, column] of columnTests) {
    totalTests++;
    const exists = await testColumnExists(table, column);
    if (exists) {
      console.log(`✅ Column '${table}.${column}' exists`);
      passedTests++;
    } else {
      console.log(`❌ Column '${table}.${column}' missing`);
    }
  }
  
  console.log('\n📋 TESTING TRIGGERS AND FUNCTIONS');
  console.log('=================================');
  
  // Test 3: Critical triggers exist
  totalTests++;
  const triggerExists = await testTriggerExists('on_auth_user_created');
  if (triggerExists) {
    console.log('✅ Profile creation trigger exists');
    passedTests++;
  } else {
    console.log('❌ Profile creation trigger missing');
  }
  
  console.log('\n📋 TESTING FUNCTIONAL WORKFLOWS');
  console.log('===============================');
  
  // Test 4: Profile creation workflow
  totalTests++;
  const profileCreationWorks = await testProfileCreation();
  if (profileCreationWorks) {
    passedTests++;
  }
  
  // Test 5: Profile update workflow
  totalTests++;
  const profileUpdateWorks = await testProfileUpdate();
  if (profileUpdateWorks) {
    passedTests++;
  }
  
  console.log('\n📋 TESTING RLS POLICIES');
  console.log('=======================');
  
  // Test 6: Check if RLS policies exist
  try {
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('tablename, policyname')
      .in('tablename', ['profiles', 'projects', 'comments']);
    
    totalTests++;
    if (error) {
      console.log('❌ Cannot access RLS policies:', error.message);
    } else {
      console.log(`✅ Found ${policies.length} RLS policies`);
      policies.forEach(p => console.log(`   - ${p.tablename}: ${p.policyname}`));
      passedTests++;
    }
  } catch (err) {
    console.log('❌ RLS policy test failed:', err.message);
  }
  
  console.log('\n📋 TESTING STORAGE BUCKETS');
  console.log('==========================');
  
  // Test 7: Storage buckets
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    totalTests++;
    
    if (error) {
      console.log('❌ Cannot access storage buckets:', error.message);
    } else {
      const requiredBuckets = ['projects', 'avatars'];
      const existingBuckets = buckets.map(b => b.name);
      
      let bucketsExist = true;
      for (const bucket of requiredBuckets) {
        if (existingBuckets.includes(bucket)) {
          console.log(`✅ Storage bucket '${bucket}' exists`);
        } else {
          console.log(`❌ Storage bucket '${bucket}' missing`);
          bucketsExist = false;
        }
      }
      
      if (bucketsExist) passedTests++;
    }
  } catch (err) {
    console.log('❌ Storage bucket test failed:', err.message);
  }
  
  console.log('\n🏁 TEST RESULTS SUMMARY');
  console.log('=======================');
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Database schema is properly configured.');
    console.log('✅ User registration should work');
    console.log('✅ Profile updates should work');
    console.log('✅ No more 401 errors expected');
  } else {
    console.log('⚠️  Some tests failed. Schema fix may be needed.');
    console.log('💡 Run: node scripts/apply-unified-schema-fix.js');
  }
  
  return passedTests === totalTests;
}

// Run the tests
runComprehensiveTests().catch(console.error); 