#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your .env.local file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper function to execute SQL with better error handling
async function executeSQLStatement(statement, description) {
  try {
    // Clean up the statement
    const cleanStatement = statement.trim();
    if (!cleanStatement || cleanStatement.startsWith('--')) {
      return { success: true, skipped: true };
    }

    console.log(`🔄 ${description}...`);
    
    // Use the sql helper for raw SQL execution
    const { data, error } = await supabase.sql`${cleanStatement}`;
    
    if (error) {
      // Some errors are expected (like table already exists)
      if (error.message.includes('already exists') || 
          error.message.includes('IF NOT EXISTS') ||
          error.message.includes('does not exist') && statement.includes('DROP')) {
        console.log(`✅ ${description} (already exists/handled)`);
        return { success: true, warning: error.message };
      }
      throw error;
    }
    
    console.log(`✅ ${description}`);
    return { success: true, data };
    
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function applyMigrationStepByStep() {
  console.log('🚀 Starting Robust Database Migration for eng.com');
  console.log('===============================================');

  const steps = [
    // Step 1: Extensions
    {
      sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      description: 'Enable UUID extension'
    },

    // Step 2: Fix profiles table
    {
      sql: `ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS email text,
        ADD COLUMN IF NOT EXISTS username text,
        ADD COLUMN IF NOT EXISTS display_name text,
        ADD COLUMN IF NOT EXISTS bio text,
        ADD COLUMN IF NOT EXISTS avatar_url text,
        ADD COLUMN IF NOT EXISTS location text,
        ADD COLUMN IF NOT EXISTS website text,
        ADD COLUMN IF NOT EXISTS github_username text,
        ADD COLUMN IF NOT EXISTS linkedin_username text,
        ADD COLUMN IF NOT EXISTS engineering_discipline text,
        ADD COLUMN IF NOT EXISTS experience_level text,
        ADD COLUMN IF NOT EXISTS company text,
        ADD COLUMN IF NOT EXISTS job_title text,
        ADD COLUMN IF NOT EXISTS post_karma integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS comment_karma integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS reputation integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE',
        ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now(),
        ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
        ADD COLUMN IF NOT EXISTS joined_communities text[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS saved_posts text[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"theme": "dark", "email_notifications": true}'::jsonb,
        ADD COLUMN IF NOT EXISTS stripe_customer_id text,
        ADD COLUMN IF NOT EXISTS stripe_account_id text,
        ADD COLUMN IF NOT EXISTS tip_jar_on boolean DEFAULT true,
        ADD COLUMN IF NOT EXISTS lifetime_cents integer DEFAULT 0;`,
      description: 'Add missing columns to profiles table'
    },

    // Step 3: Fix username/handle consistency
    {
      sql: `UPDATE public.profiles SET username = handle WHERE username IS NULL AND handle IS NOT NULL;`,
      description: 'Fix username from handle'
    },
    {
      sql: `UPDATE public.profiles SET handle = username WHERE handle IS NULL AND username IS NOT NULL;`,
      description: 'Fix handle from username'
    },

    // Step 4: Fix projects table
    {
      sql: `ALTER TABLE public.projects 
        ADD COLUMN IF NOT EXISTS description text,
        ADD COLUMN IF NOT EXISTS readme text,
        ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS discipline text,
        ADD COLUMN IF NOT EXISTS license text DEFAULT 'MIT',
        ADD COLUMN IF NOT EXISTS repository_url text,
        ADD COLUMN IF NOT EXISTS demo_url text,
        ADD COLUMN IF NOT EXISTS image_url text,
        ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS current_version uuid;`,
      description: 'Add missing columns to projects table'
    },

    // Step 5: Fix payments table to have project_id
    {
      sql: `ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS project_id uuid;`,
      description: 'Add project_id to payments table'
    },

    // Step 6: Create versions table
    {
      sql: `CREATE TABLE IF NOT EXISTS public.versions (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
        version_no integer NOT NULL,
        readme_md text,
        files jsonb DEFAULT '[]'::jsonb,
        changelog text,
        created_at timestamptz DEFAULT now(),
        CONSTRAINT unique_project_version UNIQUE (project_id, version_no)
      );`,
      description: 'Create versions table'
    },

    // Step 7: Create project_likes table
    {
      sql: `CREATE TABLE IF NOT EXISTS public.project_likes (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT now(),
        UNIQUE(project_id, user_id)
      );`,
      description: 'Create project_likes table'
    },

    // Step 8: Create communities table
    {
      sql: `CREATE TABLE IF NOT EXISTS public.communities (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text UNIQUE NOT NULL,
        display_name text NOT NULL,
        description text,
        category text DEFAULT 'engineering',
        color text DEFAULT '#3B82F6',
        member_count integer DEFAULT 0,
        post_count integer DEFAULT 0,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );`,
      description: 'Create communities table'
    },

    // Step 9: Create posts table
    {
      sql: `CREATE TABLE IF NOT EXISTS public.posts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        title text NOT NULL,
        content text,
        post_type text DEFAULT 'discussion',
        upvotes integer DEFAULT 0,
        downvotes integer DEFAULT 0,
        vote_count integer DEFAULT 0,
        comment_count integer DEFAULT 0,
        view_count integer DEFAULT 0,
        is_pinned boolean DEFAULT false,
        is_locked boolean DEFAULT false,
        is_removed boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );`,
      description: 'Create posts table'
    },

    // Step 10: Fix comments table
    {
      sql: `ALTER TABLE public.comments 
        ADD COLUMN IF NOT EXISTS post_id uuid,
        ADD COLUMN IF NOT EXISTS body text,
        ADD COLUMN IF NOT EXISTS content_md text,
        ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS downvotes integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS vote_count integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();`,
      description: 'Fix comments table structure'
    },

    // Step 11: Create project_feed view (simplified to avoid payments issue)
    {
      sql: `DROP VIEW IF EXISTS public.project_feed;`,
      description: 'Drop existing project_feed view'
    },
    {
      sql: `CREATE VIEW public.project_feed AS
        SELECT
          p.id,
          p.title,
          p.slug,
          p.description,
          p.discipline,
          p.tags,
          p.license,
          p.image_url,
          p.view_count,
          p.like_count,
          p.download_count,
          p.is_public,
          p.created_at,
          p.updated_at,
          pr.id as author_id,
          pr.username,
          pr.handle,
          pr.display_name,
          pr.avatar_url,
          0 as tips_cents,
          NULL as thumb_path
        FROM public.projects p
        JOIN public.profiles pr ON pr.id = p.owner_id
        WHERE p.is_public = true;`,
      description: 'Create simplified project_feed view'
    },

    // Step 12: Create profile trigger
    {
      sql: `CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.profiles (
            id, email, username, handle, display_name, created_at, updated_at, profile_complete
          ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
            NOW(), NOW(), false
          );
          RETURN NEW;
        EXCEPTION
          WHEN unique_violation THEN
            UPDATE public.profiles SET email = NEW.email, updated_at = NOW() WHERE id = NEW.id;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;`,
      description: 'Create profile creation function'
    },

    // Step 13: Create trigger
    {
      sql: `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
      description: 'Drop existing trigger'
    },
    {
      sql: `CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
      description: 'Create profile creation trigger'
    },

    // Step 14: Enable RLS
    {
      sql: `ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;`,
      description: 'Enable RLS on versions'
    },
    {
      sql: `ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;`,
      description: 'Enable RLS on project_likes'
    },
    {
      sql: `ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;`,
      description: 'Enable RLS on communities'
    },
    {
      sql: `ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;`,
      description: 'Enable RLS on posts'
    },

    // Step 15: Create basic policies
    {
      sql: `CREATE POLICY "Communities are publicly readable" ON public.communities FOR SELECT USING (true);`,
      description: 'Create communities read policy'
    },
    {
      sql: `CREATE POLICY "Posts are readable" ON public.posts FOR SELECT USING (NOT is_removed);`,
      description: 'Create posts read policy'
    },

    // Step 16: Populate communities
    {
      sql: `INSERT INTO public.communities (name, display_name, description, category, color, member_count, post_count) VALUES
        ('mechanical-engineering', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'engineering', '#DC2626', 15420, 892),
        ('electrical-engineering', 'Electrical Engineering', 'Circuit design, power systems, and electrical analysis', 'engineering', '#F59E0B', 12380, 756),
        ('software-engineering', 'Software Engineering', 'Programming, algorithms, and software development', 'software', '#3B82F6', 18750, 1203),
        ('civil-engineering', 'Civil Engineering', 'Infrastructure, construction, and structural design', 'engineering', '#6B7280', 11200, 634),
        ('robotics', 'Robotics & Automation', 'Autonomous systems, control theory, and robot design', 'robotics', '#059669', 8950, 543),
        ('electronics', 'Electronics & PCB Design', 'Circuit design, PCB layout, and electronic prototyping', 'electronics', '#7C3AED', 12380, 756),
        ('manufacturing', 'Manufacturing', '3D printing, CNC, injection molding, and production', 'manufacturing', '#DC2626', 9340, 612),
        ('materials-science', 'Materials Science', 'Material properties, testing, and selection', 'science', '#B45309', 6780, 423),
        ('aerospace', 'Aerospace Engineering', 'Aircraft, spacecraft, and propulsion systems', 'engineering', '#2563EB', 7650, 445),
        ('general', 'General Discussion', 'General engineering topics and discussions', 'community', '#6B7280', 25600, 1567)
        ON CONFLICT (name) DO NOTHING;`,
      description: 'Populate essential communities'
    }
  ];

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const result = await executeSQLStatement(step.sql, `${i + 1}/${steps.length}: ${step.description}`);
    
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
      errors.push({ step: step.description, error: result.error });
    }

    // Small delay between steps
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful steps: ${successCount}`);
  console.log(`❌ Failed steps: ${errorCount}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Errors encountered:`);
    errors.forEach(err => {
      console.log(`   • ${err.step}: ${err.error}`);
    });
  }

  return errorCount === 0;
}

async function verifyMigration() {
  console.log('\n🔍 Verifying Migration Results');
  console.log('==============================');

  const checks = [
    { table: 'profiles', description: 'User profiles' },
    { table: 'projects', description: 'Projects' },
    { table: 'communities', description: 'Communities' },
    { table: 'versions', description: 'Project versions' },
    { table: 'project_likes', description: 'Project likes' },
    { table: 'posts', description: 'Community posts' },
  ];

  for (const check of checks) {
    try {
      const { count, error } = await supabase
        .from(check.table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${check.description}: ${error.message}`);
      } else {
        console.log(`✅ ${check.description}: ${count || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${check.description}: ${err.message}`);
    }
  }

  // Test project_feed view
  try {
    const { data, error } = await supabase
      .from('project_feed')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ project_feed view: Not working');
      console.log(`   Error: ${error.message}`);
    } else {
      console.log('✅ project_feed view: Working correctly');
    }
  } catch (err) {
    console.log(`❌ project_feed view: ${err.message}`);
  }
}

async function main() {
  console.log('🎯 Robust Database Migration for eng.com');
  console.log('========================================\n');

  const success = await applyMigrationStepByStep();
  
  if (success) {
    console.log('\n🎉 Migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with some issues');
  }

  await verifyMigration();

  console.log('\n📋 Next Steps:');
  console.log('1. Test your APIs: /api/projects and /api/communities');
  console.log('2. Try creating a new user account');
  console.log('3. Check that real data is loading instead of mock data');
  console.log('4. Update your app to use the new auth system if needed');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyMigrationStepByStep, verifyMigration }; 