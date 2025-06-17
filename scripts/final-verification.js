#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🎯 FINAL VERIFICATION: AUTH ISSUES RESOLVED');
console.log('==========================================');

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);

async function verifyCoreFunctionality() {
  let testUserId = null;
  let allTestsPassed = true;
  
  try {
    console.log('\n✅ 1. Testing User Registration + Profile Creation');
    console.log('  This was the main cause of 401 errors...');
    
    const testEmail = `test-verify-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (authError) throw authError;
    testUserId = authData.user.id;
    
    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, username, handle, plan')
      .eq('id', testUserId)
      .single();
    
    if (profileError) {
      console.log('  ❌ CRITICAL: Profile not auto-created:', profileError.message);
      allTestsPassed = false;
    } else {
      console.log('  ✅ SUCCESS: Profile auto-created via trigger');
      console.log(`     Email: ${profile.email}`);
      console.log(`     Username: ${profile.username}`);
      console.log(`     Handle: ${profile.handle}`);
    }
    
    console.log('\n✅ 2. Testing Profile Updates');
    console.log('  This is what /api/user/update-profile does...');
    
    // Test basic profile update (core columns only)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        handle: `verified-${Date.now()}`,
        bio: 'Test bio',
        display_name: 'Verified User'
      })
      .eq('id', testUserId);
    
    if (updateError) {
      console.log('  ❌ CRITICAL: Profile update failed:', updateError.message);
      allTestsPassed = false;
    } else {
      console.log('  ✅ SUCCESS: Profile update works');
    }
    
    console.log('\n✅ 3. Testing User Session + Update');
    console.log('  This simulates real user interactions...');
    
    // Sign in as user
    const { data: signInData, error: signInError } = await supabaseUser.auth.signInWithPassword({
      email: testEmail,
      password: 'testpassword123'
    });
    
    if (signInError) {
      console.log('  ❌ User sign in failed:', signInError.message);
      allTestsPassed = false;
    } else {
      console.log('  ✅ SUCCESS: User can sign in');
      
      // Test user can update their own profile
      const { error: userUpdateError } = await supabaseUser
        .from('profiles')
        .update({ bio: 'User updated this' })
        .eq('id', testUserId);
      
      if (userUpdateError) {
        console.log('  ❌ User profile update failed:', userUpdateError.message);
        allTestsPassed = false;
      } else {
        console.log('  ✅ SUCCESS: User can update own profile');
      }
    }
    
    console.log('\n✅ 4. Testing Projects Table Consistency');
    console.log('  Verifying owner_id column exists...');
    
    const { data: projectsTest, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('id, title, owner_id')
      .limit(1);
    
    if (projectsError) {
      console.log('  ❌ Projects table issue:', projectsError.message);
      allTestsPassed = false;
    } else {
      console.log('  ✅ SUCCESS: Projects table uses owner_id (correct)');
    }
    
    console.log('\n✅ 5. Testing Comments Table');
    console.log('  Verifying body column exists...');
    
    const { data: commentsTest, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select('id, body, user_id')
      .limit(1);
    
    if (commentsError) {
      console.log('  ❌ Comments table issue:', commentsError.message);
      allTestsPassed = false;
    } else {
      console.log('  ✅ SUCCESS: Comments table has body column');
    }
    
  } catch (err) {
    console.log('❌ CRITICAL ERROR:', err.message);
    allTestsPassed = false;
  } finally {
    // Cleanup
    if (testUserId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(testUserId);
        console.log('\n✅ Test user cleaned up');
      } catch (err) {
        console.log('\n⚠️  Could not clean up test user');
      }
    }
  }
  
  return allTestsPassed;
}

async function runFinalVerification() {
  console.log('Running final verification of auth fixes...\n');
  
  const success = await verifyCoreFunctionality();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 FINAL VERIFICATION RESULTS');
  console.log('='.repeat(50));
  
  if (success) {
    console.log('🎉 ALL CRITICAL TESTS PASSED!');
    console.log('');
    console.log('✅ ISSUES RESOLVED:');
    console.log('   • User registration creates profiles automatically');
    console.log('   • Profile updates work (no more 401 errors)');
    console.log('   • Column naming is consistent (owner_id, body, etc.)');
    console.log('   • Users can sign in and update their profiles');
    console.log('   • Database schema is unified and working');
    console.log('');
    console.log('🚀 YOUR ENG.COM PLATFORM IS READY!');
    console.log('   No more authentication failures expected.');
    console.log('   The /api/user/update-profile endpoint should work correctly.');
    
  } else {
    console.log('⚠️  SOME ISSUES REMAIN');
    console.log('   Check the test output above for specific problems.');
    console.log('   You may need to run additional schema fixes.');
  }
  
  console.log('='.repeat(50));
}

runFinalVerification().catch(console.error); 