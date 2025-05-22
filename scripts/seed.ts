/**
 * Simple seeding script for local/dev Supabase projects.
 *
 * 1.  Add the following to your `.env.local` (or export them in your shell):
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...   <--  service-role key required for auth.admin
 *
 * 2.  Install deps once:
 *        pnpm add -D ts-node dotenv
 *        # or: npm i -D ts-node dotenv
 *
 * 3.  Run the script:
 *        pnpm seed
 *        # or: npm run seed
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// use the service-role key so we can create auth users
const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false }
});

type DemoUser = {
  email: string;
  password: string;
  username: string;
  full_name: string;
  avatar_url: string;
};

const demoUsers: DemoUser[] = [
  {
    email: 'alice@example.com',
    password: 'password',
    username: 'alice',
    full_name: 'Alice Smith',
    avatar_url: 'https://i.pravatar.cc/150?img=1'
  },
  {
    email: 'bob@example.com',
    password: 'password',
    username: 'bob',
    full_name: 'Bob Jones',
    avatar_url: 'https://i.pravatar.cc/150?img=2'
  }
];

const demoProjects = [
  {
    title: 'Astronaut on a Horse',
    description: '“Stable Diffusion 1.5” – riding into space.',
    cover_url: 'https://images.unsplash.com/photo-1544829096-22dec7ec8818',
  },
  {
    title: 'Cyberpunk Street',
    description: 'Mid-journey night-time neon, Blade-Runner vibes.',
    cover_url: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba',
  },
  {
    title: 'Retro 3-D Render',
    description: 'Low-poly desert with vapor-wave palette.',
    cover_url: 'https://images.unsplash.com/photo-1611605699445-46b7ae3ce5e1',
  }
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('🌱  Seeding database...\n');

  for (const u of demoUsers) {
    // 1) create auth user
    const { data: authUser, error: authErr } =
      await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: {
          full_name:  u.full_name,
          username:   u.username,
          avatar_url: u.avatar_url
        }
      });

    if (authErr) {
      console.error(`🛑 Failed creating user ${u.email}`, authErr.message);
      continue;
    }

    const userId = authUser.user!.id;
    console.log(`✅  created auth user ${u.username}`);

    // 2) insert profile (public.profiles)
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id:          userId,     // matches auth.users
        username:    u.username,
        full_name:   u.full_name,
        avatar_url:  u.avatar_url
      });

    if (profileErr) {
      console.error(`🛑 Failed inserting profile for ${u.username}`, profileErr.message);
      continue;
    }

    console.log(`   ↳ profile inserted`);

    // 3) create a couple of demo projects for this user
    for (const p of demoProjects) {
      const { error: projectErr } = await supabase
        .from('projects')
        .insert({
          user_id:     userId,
          title:       p.title,
          slug:        slugify(p.title),
          description: p.description,
          cover_url:   p.cover_url
        });

      if (projectErr) {
        console.warn(`   ↳ ⚠️  could not insert project "${p.title}": ${projectErr.message}`);
      } else {
        console.log(`   ↳ project "${p.title}" inserted`);
      }
    }
  }

  console.log('\n🎉  Done.  Open the app and enjoy the dummy data!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit()); 