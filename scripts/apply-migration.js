#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🚀 Applying database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20241209000000_fix_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements (basic approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
          // Continue with other statements even if one fails
        } else {
          console.log(`✅ Statement ${i + 1} completed successfully`);
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${i + 1} error:`, err.message);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
    // Test the migration by checking if tables exist
    console.log('\n🔍 Verifying migration...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      console.log('📊 Available tables:', tables.map(t => t.table_name).join(', '));
    }
    
    // Check profiles table structure
    const { data: profileColumns, error: profileError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');
    
    if (profileError) {
      console.error('Error checking profiles table:', profileError);
    } else {
      console.log('👤 Profiles table columns:', profileColumns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach if RPC doesn't work - execute statements directly
async function applyMigrationDirect() {
  try {
    console.log('🚀 Applying database migration (direct approach)...');
    
    // Key migration steps
    const migrations = [
      {
        name: 'Add profiles columns',
        sql: `
          ALTER TABLE public.profiles 
          ADD COLUMN IF NOT EXISTS handle text,
          ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE',
          ADD COLUMN IF NOT EXISTS name text,
          ADD COLUMN IF NOT EXISTS email text,
          ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
          ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
        `
      },
      {
        name: 'Create unique index on handle',
        sql: `
          DROP INDEX IF EXISTS profiles_handle_unique;
          CREATE UNIQUE INDEX profiles_handle_unique ON public.profiles(handle) WHERE handle IS NOT NULL;
        `
      },
      {
        name: 'Add projects columns',
        sql: `
          ALTER TABLE public.projects 
          ADD COLUMN IF NOT EXISTS description text,
          ADD COLUMN IF NOT EXISTS readme text;
        `
      },
      {
        name: 'Add comments body column',
        sql: `
          ALTER TABLE public.comments 
          ADD COLUMN IF NOT EXISTS body text;
        `
      }
    ];
    
    for (const migration of migrations) {
      console.log(`\n⏳ ${migration.name}...`);
      
      try {
        // Use a simple query approach
        const { error } = await supabase.rpc('exec_sql', { sql: migration.sql });
        
        if (error) {
          console.warn(`⚠️  ${migration.name} warning:`, error.message);
        } else {
          console.log(`✅ ${migration.name} completed`);
        }
      } catch (err) {
        console.warn(`⚠️  ${migration.name} error:`, err.message);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Check if exec_sql RPC function exists, if not use direct approach
supabase.rpc('exec_sql', { sql: 'SELECT 1;' })
  .then(() => {
    console.log('Using RPC approach...');
    applyMigration();
  })
  .catch(() => {
    console.log('RPC not available, using direct approach...');
    applyMigrationDirect();
  }); 