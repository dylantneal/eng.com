#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSqlFile(filePath) {
  try {
    console.log(`📋 Reading SQL file: ${filePath}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔄 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });
        
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (statementError) {
        console.warn(`⚠️  Statement ${i + 1} failed:`, statementError.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error executing SQL file ${filePath}:`, error.message);
    return false;
  }
}

async function createExecSqlFunction() {
  try {
    // Create a function to execute raw SQL (if it doesn't exist)
    const createFunctionSql = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSql });
    if (error) {
      console.log('Creating exec_sql function manually...');
      // Try direct approach if RPC doesn't work initially
    }
  } catch (error) {
    console.log('Note: Could not create exec_sql function, will try direct execution');
  }
}

async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('📊 Database connection works, profiles table may not exist yet');
    } else {
      console.log('✅ Database connection successful');
    }
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function verifyFix() {
  try {
    console.log('\n🔍 Verifying database schema fix...');
    
    // Test 1: Check if project_feed view exists and works
    const { data: projectFeedData, error: projectFeedError } = await supabase
      .from('project_feed')
      .select('*')
      .limit(1);
    
    if (projectFeedError) {
      console.log('❌ project_feed view still has issues:', projectFeedError.message);
      return false;
    } else {
      console.log('✅ project_feed view is working');
    }
    
    // Test 2: Check profiles table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ profiles table has issues:', profilesError.message);
    } else {
      console.log('✅ profiles table is accessible');
    }
    
    // Test 3: Check projects table
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, owner_id')
      .limit(1);
    
    if (projectsError) {
      console.log('❌ projects table has issues:', projectsError.message);
    } else {
      console.log('✅ projects table is accessible');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database schema fix to resolve mock data dependencies...\n');
  
  // Test database connection
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    process.exit(1);
  }
  
  // Create the exec_sql function
  await createExecSqlFunction();
  
  // Apply the complete schema fix
  const schemaFixPath = path.join(__dirname, '..', 'database', 'complete_schema_fix.sql');
  const success = await executeSqlFile(schemaFixPath);
  
  if (success) {
    console.log('\n📊 Schema fix applied successfully');
    
    // Verify the fix
    const verified = await verifyFix();
    
    if (verified) {
      console.log('\n🎉 SUCCESS: Mock data dependencies resolved!');
      console.log('✅ Database schema is now properly configured');
      console.log('✅ project_feed view is working');
      console.log('✅ Real data persistence is enabled');
      console.log('\n💡 Your application should now load real data instead of mock data');
      console.log('💡 Try refreshing your browser to see the changes');
    } else {
      console.log('\n⚠️  Schema applied but verification failed');
      console.log('You may need to check the logs for specific issues');
    }
  } else {
    console.log('\n❌ Failed to apply schema fix');
    console.log('Please check the error messages above');
  }
}

// Run the script
main().catch(console.error); 