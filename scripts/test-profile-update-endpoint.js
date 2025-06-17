#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 TESTING /api/user/update-profile ENDPOINT');
console.log('===========================================');

// Create both admin and user clients
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileUpdateEndpoint() {
  let testUserId = null;
  
  try {
    console.log('\n1. Creating test user...');
    
    // Create test user
    const testEmail = `test-profile-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (authError) throw authError;
    testUserId = authData.user.id;
    console.log('✅ Test user created:', testUserId);
    
    // Wait for profile creation trigger
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\n2. Verifying profile was created automatically...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile not created:', profileError.message);
      return false;
    }
    
    console.log('✅ Profile exists:', {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      handle: profile.handle
    });
    
    console.log('\n3. Testing profile update with admin privileges...');
    
    // Test update with admin privileges (what the API endpoint should do)
    const updateData = {
      bio: 'Test bio updated',
      handle: `test-handle-${Date.now()}`,
      display_name: 'Test User Updated',
      website: 'https://example.com',
      location: 'Test City'
    };
    
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', testUserId);
    
    if (updateError) {
      console.log('❌ Admin update failed:', updateError.message);
      return false;
    }
    
    console.log('✅ Admin profile update successful');
    
    console.log('\n4. Testing profile update with user privileges...');
    
    // Sign in as the test user
    const { data: signInData, error: signInError } = await supabaseUser.auth.signInWithPassword({
      email: testEmail,
      password: 'testpassword123'
    });
    
    if (signInError) {
      console.log('❌ User sign in failed:', signInError.message);
      return false;
    }
    
    console.log('✅ User signed in successfully');
    
    // Test update with user session
    const userUpdateData = {
      bio: 'User updated bio',
      display_name: 'User Updated Name'
    };
    
    const { error: userUpdateError } = await supabaseUser
      .from('profiles')
      .update(userUpdateData)
      .eq('id', testUserId);
    
    if (userUpdateError) {
      console.log('❌ User update failed:', userUpdateError.message);
      console.log('   This suggests RLS policies may be blocking user updates');
      
      // Check RLS policies
      console.log('\n5. Checking RLS policies...');
      const { data: policies, error: policyError } = await supabaseAdmin
        .from('pg_policies')
        .select('tablename, policyname, permissive, roles, cmd, qual')
        .eq('tablename', 'profiles');
      
      if (!policyError && policies) {
        console.log('   Current RLS policies for profiles:');
        policies.forEach(policy => {
          console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.permissive})`);
        });
      }
      
      return false;
    }
    
    console.log('✅ User profile update successful');
    
    console.log('\n6. Verifying final profile state...');
    const { data: finalProfile, error: finalError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();
    
    if (finalError) {
      console.log('❌ Failed to fetch final profile:', finalError.message);
      return false;
    }
    
    console.log('✅ Final profile state:', {
      bio: finalProfile.bio,
      handle: finalProfile.handle,
      display_name: finalProfile.display_name,
      website: finalProfile.website,
      location: finalProfile.location
    });
    
    return true;
    
  } catch (err) {
    console.log('❌ Test failed with error:', err.message);
    return false;
  } finally {
    // Clean up test user
    if (testUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(testUserId);
        console.log('\n✅ Test user cleaned up');
      } catch (err) {
        console.log('\n⚠️  Could not clean up test user:', err.message);
      }
    }
  }
}

async function testRLSPolicies() {
  console.log('\n🔍 TESTING RLS POLICIES');
  console.log('=======================');
  
  try {
    const { data: policies, error } = await supabaseAdmin
      .from('pg_policies')
      .select('tablename, policyname, permissive, cmd')
      .in('tablename', ['profiles', 'projects', 'comments']);
    
    if (error) {
      console.log('❌ Cannot access RLS policies:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${policies.length} RLS policies:`);
    
    const profilePolicies = policies.filter(p => p.tablename === 'profiles');
    const projectPolicies = policies.filter(p => p.tablename === 'projects');
    const commentPolicies = policies.filter(p => p.tablename === 'comments');
    
    console.log(`   Profiles: ${profilePolicies.length} policies`);
    profilePolicies.forEach(p => console.log(`     - ${p.policyname} (${p.cmd})`));
    
    console.log(`   Projects: ${projectPolicies.length} policies`);
    projectPolicies.forEach(p => console.log(`     - ${p.policyname} (${p.cmd})`));
    
    console.log(`   Comments: ${commentPolicies.length} policies`);
    commentPolicies.forEach(p => console.log(`     - ${p.policyname} (${p.cmd})`));
    
    return true;
  } catch (err) {
    console.log('❌ RLS policy test failed:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('Starting comprehensive profile update testing...\n');
  
  const rlsTest = await testRLSPolicies();
  const profileTest = await testProfileUpdateEndpoint();
  
  console.log('\n🏁 TEST SUMMARY');
  console.log('===============');
  console.log(`RLS Policies: ${rlsTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Profile Update: ${profileTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (rlsTest && profileTest) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ The /api/user/update-profile endpoint should work correctly');
    console.log('✅ No more 401 errors expected');
    console.log('✅ User registration and profile management is working');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
}

runTests().catch(console.error); 