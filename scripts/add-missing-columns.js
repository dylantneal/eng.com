#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns...');
    
    // Add missing columns to profiles
    console.log('\n👤 Updating profiles table...');
    
    // These are the columns our app expects that might be missing
    const profileUpdates = [
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name text;",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;", 
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false;",
      "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();"
    ];
    
    // Add missing columns to projects  
    console.log('\n📁 Updating projects table...');
    const projectUpdates = [
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS description text;",
      "ALTER TABLE projects ADD COLUMN IF NOT EXISTS readme text;"
    ];
    
    // Add missing columns to comments
    console.log('\n💬 Updating comments table...');
    const commentUpdates = [
      "ALTER TABLE comments ADD COLUMN IF NOT EXISTS body text;"
    ];
    
    // We'll use the Supabase REST API since direct SQL execution isn't working
    console.log('\n⚠️  Note: Column additions need to be done via Supabase Dashboard SQL Editor');
    console.log('\nPlease run these SQL commands in your Supabase Dashboard > SQL Editor:\n');
    
    console.log('-- Profiles table updates:');
    profileUpdates.forEach(sql => console.log(sql));
    
    console.log('\n-- Projects table updates:');
    projectUpdates.forEach(sql => console.log(sql));
    
    console.log('\n-- Comments table updates:');
    commentUpdates.forEach(sql => console.log(sql));
    
    console.log('\n-- Create missing communities table (for community feature):');
    console.log(`
CREATE TABLE IF NOT EXISTS communities (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  member_count integer default 0,
  post_count integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read communities
CREATE POLICY "Communities are publicly readable" ON communities FOR SELECT USING (true);

-- Create posts table for communities
CREATE TABLE IF NOT EXISTS posts (
  id uuid primary key default uuid_generate_v4(),
  community_id uuid references communities(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  title text not null,
  content text,
  upvotes integer default 0,
  downvotes integer default 0,
  comment_count integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read posts
CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (true);

-- Insert default communities
INSERT INTO communities (name, slug, description, icon) VALUES
('Mechanical Engineering', 'mechanical-engineering', 'CAD, manufacturing, mechanisms, and mechanical design', '⚙️'),
('Electronics', 'electronics', 'Circuit design, PCBs, embedded systems, and electronics projects', '🔌'),
('Software', 'software', 'Firmware, algorithms, programming, and software engineering', '💻'),
('Robotics', 'robotics', 'Automation, AI, machine learning, and robotic systems', '🤖'),
('3D Printing', '3d-printing', 'Additive manufacturing, 3D design, and printing techniques', '🖨️')
ON CONFLICT (slug) DO NOTHING;
    `);
    
    console.log('\n🎯 After running these SQL commands, your database will be fully compatible with the app!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addMissingColumns(); 