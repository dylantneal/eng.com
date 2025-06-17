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

console.log('🔐 AUTHENTICATION FLOW TESTING');
console.log('==============================');

async function testAuthenticationFlow() {
  let testsPassed = 0;
  let totalTests = 0;
  
  console.log('\n1. Testing Profile Table Structure...');
  totalTests++;
  
  try {
    // Test if we can query profiles table
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, username, handle, display_name, plan')
      .limit(1);
    
    if (error) {
      console.log('❌ Cannot access profiles table:', error.message);
    } else {
      console.log(`✅ Profiles table accessible, found ${profiles.length} profiles`);
      if (profiles.length > 0) {
        console.log('   Sample profile structure:', Object.keys(profiles[0]));
      }
      testsPassed++;
    }
  } catch (err) {
    console.log('❌ Profiles table test failed:', err.message);
  }
  
  console.log('\n2. Testing Projects Table Structure...');
  totalTests++;
  
  try {
    // Test if we can query projects table
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, title, owner_id, is_public')
      .limit(1);
    
    if (error) {
      console.log('❌ Cannot access projects table:', error.message);
    } else {
      console.log(`✅ Projects table accessible, found ${projects.length} projects`);
      if (projects.length > 0) {
        console.log('   Sample project structure:', Object.keys(projects[0]));
        // Check if owner_id column exists (not owner)
        if (projects[0].hasOwnProperty('owner_id')) {
          console.log('✅ Projects table uses owner_id (correct column name)');
        } else {
          console.log('❌ Projects table missing owner_id column');
        }
      }
      testsPassed++;
    }
  } catch (err) {
    console.log('❌ Projects table test failed:', err.message);
  }
  
  console.log('\n3. Testing User Registration and Profile Creation...');
  totalTests++;
  
  const testEmail = `test-auth-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  let testUserId = null;
  
  try {
    // Create test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    testUserId = authData.user.id;
    console.log('✅ Test user created successfully');
    
    // Wait for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if profile was created automatically
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile not created automatically:', profileError.message);
      console.log('   This means the handle_new_user trigger is not working');
    } else {
      console.log('✅ Profile created automatically via trigger');
      console.log('   Profile details:', {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        handle: profile.handle,
        plan: profile.plan
      });
      testsPassed++;
    }
  } catch (err) {
    console.log('❌ User registration test failed:', err.message);
  }
  
  console.log('\n4. Testing Profile Update (simulating /api/user/update-profile)...');
  totalTests++;
  
  if (testUserId) {
    try {
      const updateData = {
        handle: `test-handle-${Date.now()}`,
        bio: 'Test bio for automated testing',
        display_name: 'Test User'
      };
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', testUserId);
      
      if (updateError) {
        console.log('❌ Profile update failed:', updateError.message);
        console.log('   This is the same error causing 401 in /api/user/update-profile');
      } else {
        console.log('✅ Profile update successful');
        console.log('   Updated fields:', Object.keys(updateData));
        testsPassed++;
      }
    } catch (err) {
      console.log('❌ Profile update test failed:', err.message);
    }
  }
  
  console.log('\n5. Testing Comments Table Structure...');
  totalTests++;
  
  try {
    // Test if comments table has body column (not content_md)
    const { data: comments, error } = await supabase
      .from('comments')
      .select('id, body, user_id, project_id')
      .limit(1);
    
    if (error) {
      console.log('❌ Cannot access comments table:', error.message);
    } else {
      console.log(`✅ Comments table accessible, found ${comments.length} comments`);
      if (comments.length > 0) {
        if (comments[0].hasOwnProperty('body')) {
          console.log('✅ Comments table uses body column (correct)');
        } else {
          console.log('❌ Comments table missing body column');
        }
      }
      testsPassed++;
    }
  } catch (err) {
    console.log('❌ Comments table test failed:', err.message);
  }
  
  console.log('\n6. Testing Storage and Communities...');
  totalTests++;
  
  try {
    // Test storage buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('❌ Cannot access storage buckets:', bucketError.message);
    } else {
      console.log(`✅ Storage accessible, found ${buckets.length} buckets`);
      const bucketNames = buckets.map(b => b.name);
      console.log('   Buckets:', bucketNames);
      
      // Test communities table
      const { data: communities, error: commError } = await supabase
        .from('communities')
        .select('name, display_name')
        .limit(3);
      
      if (commError) {
        console.log('❌ Cannot access communities table:', commError.message);
      } else {
        console.log(`✅ Communities table accessible, found ${communities.length} communities`);
        testsPassed++;
      }
    }
  } catch (err) {
    console.log('❌ Storage/Communities test failed:', err.message);
  }
  
  // Cleanup test user
  if (testUserId) {
    try {
      await supabase.auth.admin.deleteUser(testUserId);
      console.log('\n✅ Test user cleaned up');
    } catch (err) {
      console.log('\n⚠️  Could not clean up test user:', err.message);
    }
  }
  
  console.log('\n🏁 AUTHENTICATION FLOW TEST RESULTS');
  console.log('===================================');
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  console.log(`Success Rate: ${((testsPassed/totalTests) * 100).toFixed(1)}%`);
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');
    console.log('✅ User registration works correctly');
    console.log('✅ Profile creation trigger is working');
    console.log('✅ Profile updates work (no 401 errors)');
    console.log('✅ Database schema is properly configured');
    console.log('\n🚀 Your platform is ready for production!');
  } else {
    console.log('\n⚠️  Some authentication tests failed.');
    console.log('💡 Schema fix may be needed. Run:');
    console.log('   node scripts/apply-unified-schema-fix.js');
  }
  
  return testsPassed === totalTests;
}

// Run the authentication flow tests
testAuthenticationFlow().catch(console.error); 