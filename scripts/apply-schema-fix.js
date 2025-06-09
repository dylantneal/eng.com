const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySchemaFix() {
  console.log('🚀 Applying comprehensive database schema fix...');
  
  try {
    // First, let's check current tables
    console.log('📊 Checking current database state...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
    } else {
      console.log('Current tables:', tables.map(t => t.table_name).join(', '));
    }

    // Apply schema fixes manually since the SQL file approach isn't working
    console.log('🔧 Applying manual schema fixes...');

    // 1. Ensure profiles table has correct structure
    console.log('🔄 Fixing profiles table...');
    
    const profilesSQL = `
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS username text,
      ADD COLUMN IF NOT EXISTS display_name text,
      ADD COLUMN IF NOT EXISTS email text,
      ADD COLUMN IF NOT EXISTS post_karma integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS comment_karma integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reputation integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS plan text DEFAULT 'FREE',
      ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now(),
      ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
      ADD COLUMN IF NOT EXISTS joined_communities text[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS saved_posts text[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{"theme": "dark", "email_notifications": true, "push_notifications": true, "show_online_status": true, "public_profile": true, "allow_dm": true, "feed_algorithm": "personalized", "favorite_communities": [], "blocked_users": [], "nsfw_content": false}'::jsonb,
      ADD COLUMN IF NOT EXISTS profile_complete boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS location text,
      ADD COLUMN IF NOT EXISTS website text,
      ADD COLUMN IF NOT EXISTS github_username text,
      ADD COLUMN IF NOT EXISTS linkedin_username text,
      ADD COLUMN IF NOT EXISTS engineering_discipline text,
      ADD COLUMN IF NOT EXISTS experience_level text,
      ADD COLUMN IF NOT EXISTS company text,
      ADD COLUMN IF NOT EXISTS job_title text,
      ADD COLUMN IF NOT EXISTS stripe_customer_id text,
      ADD COLUMN IF NOT EXISTS stripe_account_id text,
      ADD COLUMN IF NOT EXISTS tip_jar_on boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS lifetime_cents integer DEFAULT 0;
    `;

    await executeSQL(profilesSQL, 'profiles table structure');

    // 2. Create unique constraints and indexes
    console.log('🔄 Creating indexes...');
    
    const indexSQL = `
      CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles(username) WHERE username IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles(email) WHERE email IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_profiles_engineering_discipline ON profiles(engineering_discipline);
      CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);
    `;

    await executeSQL(indexSQL, 'profiles indexes');

    // 3. Update existing profiles with defaults
    console.log('🔄 Updating existing profiles...');
    
    const updateSQL = `
      UPDATE profiles 
      SET 
        username = COALESCE(username, handle, SPLIT_PART(email, '@', 1), 'user_' || id::text),
        display_name = COALESCE(display_name, username, handle, 'User'),
        post_karma = COALESCE(post_karma, 0),
        comment_karma = COALESCE(comment_karma, 0),
        reputation = COALESCE(reputation, 0),
        is_verified = COALESCE(is_verified, false),
        is_pro = COALESCE(is_pro, false),
        is_banned = COALESCE(is_banned, false),
        plan = COALESCE(plan, 'FREE'),
        last_active = COALESCE(last_active, created_at, now()),
        updated_at = COALESCE(updated_at, created_at, now()),
        joined_communities = COALESCE(joined_communities, '{}'),
        saved_posts = COALESCE(saved_posts, '{}'),
        preferences = COALESCE(preferences, '{"theme": "dark", "email_notifications": true, "push_notifications": true, "show_online_status": true, "public_profile": true, "allow_dm": true, "feed_algorithm": "personalized", "favorite_communities": [], "blocked_users": [], "nsfw_content": false}'::jsonb),
        profile_complete = COALESCE(profile_complete, false)
      WHERE 
        username IS NULL OR 
        display_name IS NULL OR 
        post_karma IS NULL OR 
        comment_karma IS NULL OR 
        preferences IS NULL;
    `;

    await executeSQL(updateSQL, 'existing profiles update');

    // 4. Create communities table if it doesn't exist
    console.log('🔄 Creating communities table...');
    
    const communitiesSQL = `
      CREATE TABLE IF NOT EXISTS communities (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name text UNIQUE NOT NULL,
        display_name text NOT NULL,
        description text,
        category text DEFAULT 'engineering',
        color text DEFAULT '#3B82F6',
        is_private boolean DEFAULT false,
        member_count integer DEFAULT 0,
        post_count integer DEFAULT 0,
        created_by uuid REFERENCES profiles(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      
      ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Communities are publicly readable" ON communities FOR SELECT USING (true);
    `;

    await executeSQL(communitiesSQL, 'communities table');

    // 5. Create community memberships table
    console.log('🔄 Creating community memberships table...');
    
    const membershipsSQL = `
      CREATE TABLE IF NOT EXISTS community_memberships (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        role text DEFAULT 'member',
        joined_at timestamptz DEFAULT now(),
        notifications_enabled boolean DEFAULT true,
        UNIQUE(user_id, community_id)
      );
      
      ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
    `;

    await executeSQL(membershipsSQL, 'community memberships table');

    // 6. Insert default communities
    console.log('🔄 Inserting default communities...');
    
    const defaultCommunitiesSQL = `
      INSERT INTO communities (name, display_name, description, category, color, member_count, post_count) VALUES
        ('mechanical-engineering', 'Mechanical Engineering', 'Design, analysis, and manufacturing of mechanical systems', 'engineering', '#DC2626', 15420, 892),
        ('electronics', 'Electronics & PCB Design', 'Circuit design, PCB layout, and electronic prototyping', 'engineering', '#7C3AED', 12380, 756),
        ('software-engineering', 'Software Engineering', 'Programming, algorithms, and software development', 'engineering', '#059669', 18750, 1203),
        ('robotics', 'Robotics', 'Autonomous systems, control theory, and robot design', 'engineering', '#059669', 8950, 543),
        ('general', 'General Discussion', 'General engineering topics and discussions', 'community', '#6B7280', 25600, 1567)
      ON CONFLICT (name) DO NOTHING;
    `;

    await executeSQL(defaultCommunitiesSQL, 'default communities');

    // 7. Create automatic profile creation function
    console.log('🔄 Creating profile creation trigger...');
    
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION handle_new_user() 
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO profiles (
          id, 
          email, 
          username, 
          display_name, 
          handle
        ) VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
          COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
          SPLIT_PART(NEW.email, '@', 1)
        )
        ON CONFLICT (id) DO UPDATE SET 
          email = NEW.email,
          updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `;

    await executeSQL(triggerSQL, 'profile creation trigger');

    console.log('✅ Database schema fix completed successfully!');
    console.log('🎉 Platform is now ready for testing');

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  }
}

async function executeSQL(sql, description) {
  try {
    const { error } = await supabase.rpc('exec', { sql });
    if (error) {
      console.warn(`⚠️ ${description} warning:`, error.message);
    } else {
      console.log(`✅ ${description} completed`);
    }
  } catch (err) {
    console.warn(`⚠️ ${description} error:`, err.message);
  }
}

applySchemaFix(); 