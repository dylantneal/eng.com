#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Manual Database Migration Application');
console.log('==========================================\n');

// Read the migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20241220000000_fix_mock_data_dependencies.sql');

if (!fs.existsSync(migrationPath)) {
  console.log('❌ Migration file not found!');
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📁 Migration file found and loaded successfully!');
console.log(`📄 Size: ${(migrationSQL.length / 1024).toFixed(1)}KB`);
console.log(`📍 Location: ${migrationPath}\n`);

console.log('🎯 TO APPLY THIS MIGRATION:');
console.log('===========================');
console.log('1. Go to: https://supabase.com/dashboard/project/ewbopfohuxlhhddtptka');
console.log('2. Click on "SQL Editor" in the left sidebar');
console.log('3. Click "New Query"');
console.log('4. Copy and paste the SQL below into the editor');
console.log('5. Click "Run" to execute the migration\n');

console.log('📋 SQL TO COPY AND PASTE:');
console.log('=' + '='.repeat(50));
console.log(migrationSQL);
console.log('=' + '='.repeat(50));

console.log('\n✅ After running the SQL:');
console.log('- Restart your dev server: npm run dev');
console.log('- Check that database errors are gone');
console.log('- Test project functionality');

console.log('\n🔍 Quick verification:');
console.log('You should see these logs disappear:');
console.log('❌ "Could not find a relationship between project_feed and profiles"');
console.log('❌ "Database data incomplete, using fallback data"');
console.log('✅ Projects should load from real database instead of mock data\n'); 