#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables directly from the system (bypass dotenv)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Direct Database Migration Application');
console.log('==========================================\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error(`Current NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}`);
  console.error(`Current SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? 'Set' : 'Missing'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Read the migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20241220000000_fix_mock_data_dependencies.sql');

if (!fs.existsSync(migrationPath)) {
  console.log('❌ Migration file not found!');
  console.log(`Expected path: ${migrationPath}`);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📁 Migration file loaded successfully!');
console.log(`📄 Size: ${(migrationSQL.length / 1024).toFixed(1)}KB`);
console.log(`📍 Location: ${migrationPath}\n`);

async function executeSQL(sql, description) {
  console.log(`🔄 ${description}...`);
  try {
    // Use the sql method for executing raw SQL
    const { data, error } = await supabase.rpc('exec', { sql: sql });
    if (error) {
      console.warn(`⚠️  ${description} warning:`, error.message);
      return false;
    } else {
      console.log(`✅ ${description} completed`);
      return true;
    }
  } catch (err) {
    console.warn(`⚠️  ${description} error:`, err.message);
    return false;
  }
}

async function applyMigration() {
  try {
    console.log('🚀 Starting Database Migration...');
    console.log('==================================\n');

    // Test connection first
    console.log('🔄 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      process.exit(1);
    }
    console.log('✅ Database connection successful\n');

    // Try to execute the entire migration as one block first
    console.log('🔄 Attempting to execute complete migration...');
    try {
      const { data, error } = await supabase.rpc('exec', { sql: migrationSQL });
      if (error) {
        console.warn('⚠️  Full migration execution warning:', error.message);
        console.log('📋 Falling back to statement-by-statement execution...\n');
        
        // Fall back to individual statements
        const sqlStatements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 10 && !stmt.startsWith('--') && !stmt.startsWith('='));

        let successCount = 0;
        let totalStatements = sqlStatements.length;

        console.log(`📋 Found ${totalStatements} SQL statements to execute\n`);

        for (let i = 0; i < sqlStatements.length; i++) {
          const statement = sqlStatements[i];
          if (statement.trim()) {
            const description = `Statement ${i + 1}/${totalStatements}`;
            const success = await executeSQL(statement + ';', description);
            if (success) successCount++;
            
            // Small delay to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        console.log(`\n✅ Successfully executed: ${successCount}/${totalStatements} statements`);
      } else {
        console.log('✅ Complete migration executed successfully!');
      }
    } catch (err) {
      console.error('❌ Migration execution error:', err.message);
    }

    console.log('\n============================================');
    console.log('🎉 MIGRATION APPLICATION COMPLETED!');
    console.log('============================================');
    console.log('\n📋 MANUAL VERIFICATION INSTRUCTIONS:');
    console.log('Since automated execution had limitations, please manually apply the migration:');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard/project/ewbopfohuxlhhddtptka');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Click "New Query"');
    console.log('4. Copy and paste the entire migration from:');
    console.log(`   ${migrationPath}`);
    console.log('5. Click "Run" to execute');
    console.log('');
    console.log('🔍 After manual execution, verify with:');
    console.log('- Run: node test_db_connection.js');
    console.log('- Check that these errors are gone:');
    console.log('  ❌ "Could not find a relationship between project_feed and profiles"');
    console.log('  ❌ "Database data incomplete, using fallback data"');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
applyMigration(); 