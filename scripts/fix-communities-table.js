#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('🔧 Fixing Communities Table...');

async function fixCommunitiesTable() {
  try {
    // Add missing display_name column
    const { error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE public.communities 
        ADD COLUMN IF NOT EXISTS display_name text;
        
        UPDATE public.communities 
        SET display_name = COALESCE(display_name, name)
        WHERE display_name IS NULL;
        
        INSERT INTO public.communities (name, display_name, description, category, color) VALUES
          ('mechanical', 'Mechanical Engineering', 'Design and manufacturing of mechanical systems', 'engineering', '#DC2626'),
          ('electronics', 'Electronics & PCB', 'Circuit design and electronic prototyping', 'engineering', '#7C3AED'),
          ('robotics', 'Robotics', 'Autonomous systems and robot design', 'engineering', '#059669'),
          ('software', 'Engineering Software', 'CAD, simulation, and engineering tools', 'software', '#2563EB'),
          ('materials', 'Materials Science', 'Material properties and testing', 'science', '#B45309'),
          ('manufacturing', 'Manufacturing', '3D printing, CNC, and production', 'manufacturing', '#DC2626')
        ON CONFLICT (name) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          description = EXCLUDED.description;
      `
    });
    
    if (error) throw error;
    console.log('✅ Communities table fixed successfully');
    
    // Test the fix
    const { data: communities, error: testError } = await supabase
      .from('communities')
      .select('name, display_name, description')
      .limit(3);
    
    if (testError) throw testError;
    
    console.log(`✅ Communities table accessible with ${communities.length} communities`);
    communities.forEach(c => console.log(`   - ${c.name}: ${c.display_name}`));
    
  } catch (error) {
    console.error('❌ Failed to fix communities table:', error.message);
  }
}

fixCommunitiesTable(); 