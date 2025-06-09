#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('🔍 Checking current database state...');
    
    // Check what tables exist by trying to query them
    const tables = ['profiles', 'projects', 'comments', 'versions', 'project_versions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' - ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - ${err.message}`);
      }
    }
    
    // Try to get profiles table structure by querying it
    console.log('\n👤 Checking profiles table...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (data && data.length > 0) {
        console.log('Profiles table columns:', Object.keys(data[0]));
      } else if (error) {
        console.log('Profiles table error:', error.message);
      } else {
        console.log('Profiles table exists but is empty');
      }
    } catch (err) {
      console.log('Profiles table error:', err.message);
    }
    
    // Check projects table
    console.log('\n📁 Checking projects table...');
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      if (data && data.length > 0) {
        console.log('Projects table columns:', Object.keys(data[0]));
      } else if (error) {
        console.log('Projects table error:', error.message);
      } else {
        console.log('Projects table exists but is empty');
      }
    } catch (err) {
      console.log('Projects table error:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase(); 