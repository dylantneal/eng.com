/**
 * Seed script: inserts one demo user & project for local development.
 * RUN WITH:  npx ts-node scripts/seed.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  // 1. create user (magic if exists)
  const { data: user } = await supabase.auth.admin.createUser({
    email: 'demo@eng.com',
    password: 'password',
    email_confirm: true,
  });

  // 2. profile & project
  if (user?.user?.id) {
    await supabase.from('profiles').upsert({
      id: user.user.id,
      handle: 'demo',
      avatar_url: null,
      bio: '🌱 Seeding is believing',
    });

    await supabase.from('projects').insert({
      owner_id: user.user.id,
      title: 'Seeded Project',
      slug: 'seeded-project',
      is_public: true,
    });
  }
  console.log('✅  seed complete');
}

main(); 