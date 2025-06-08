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

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

/* Load variables from .env.local first, then .env  */
config({ path: '.env.local', override: false });
config();                     // .env (default) – ignored if already set

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// use the service-role key so we can create auth users
const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Helper to get a random element from an array
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

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
    id: '', // Will be populated after insertion
  },
  {
    title: 'Cyberpunk Street',
    description: 'Mid-journey night-time neon, Blade-Runner vibes.',
    cover_url: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba',
    id: '', // Will be populated after insertion
  },
  {
    title: 'Retro 3-D Render',
    description: 'Low-poly desert with vapor-wave palette.',
    cover_url: 'https://images.unsplash.com/photo-1611605699445-46b7ae3ce5e1',
    id: '', // Will be populated after insertion
  }
];

type DemoQuestion = {
  body: string;
  tags: string[];
  answers: Array<{ body: string; is_accepted?: boolean, voterUsernames?: string[] }>;
  voterUsernames?: string[]; // Users who upvoted the question itself
};

const demoQuestions: DemoQuestion[] = [
  {
    body: "What's the best way to learn Next.js App Router?",
    tags: ["nextjs", "react", "learning"],
    voterUsernames: ["alice"],
    answers: [
      { body: "Start with the official Next.js documentation, it's very comprehensive!", is_accepted: true, voterUsernames: ["bob"] },
      { body: "Build small projects and incrementally add features. Practice is key.", voterUsernames: ["alice"] },
    ],
  },
  {
    body: "How do I manage global state in a Supabase project?",
    tags: ["supabase", "state-management", "best-practices"],
    voterUsernames: ["bob", "alice"],
    answers: [
      { body: "You can use React Context, Zustand, or Jotai. For server state, SWR or React Query with Supabase client works well.", voterUsernames: ["alice"] },
    ],
  },
  {
    body: "Any tips for optimizing Supabase database queries?",
    tags: ["supabase", "database", "performance"],
    answers: [
      { body: "Ensure you have proper indexes on columns used in WHERE clauses and JOINs. Use `.explain()` to analyze query plans.", is_accepted: true, voterUsernames: ["bob"] },
      { body: "Limit the columns you select using `.select()` instead of `*`.", voterUsernames: ["alice", "bob"]},
    ],
  },
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('🌱  Seeding database...\n');

  const createdUserIds: { [username: string]: string } = {};
  const createdProjectIds: string[] = [];

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
    createdUserIds[u.username] = userId;

    // 2) insert profile (public.profiles)
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id:         userId,      // matches auth.users
        handle:     u.username,  // current column name
        avatar_url: u.avatar_url
      });

    if (profileErr) {
      console.error(`🛑 Failed inserting profile for ${u.username}`, profileErr.message);
      continue;
    }

    console.log(`   ↳ profile inserted`);

    // 3) create a couple of demo projects for this user
    for (const p of demoProjects) {
      const { data: projectData, error: projectErr } = await supabase
        .from('projects')
        .insert({
          owner_id: userId,
          title:       p.title,
          slug:        slugify(`${u.username}-${p.title}`),
          // cover_url:   p.cover_url // Remove if not in schema, or add to schema
          // If you intend to use the first file as a cover, that logic would be elsewhere (e.g., when creating versions)
        })
        .select('id')
        .single();

      if (projectErr) {
        console.warn(`   ↳ ⚠️  could not insert project "${p.title}" for ${u.username}: ${projectErr.message}`);
      } else if (projectData) {
        console.log(`   ↳ project "${p.title}" inserted for ${u.username}`);
        createdProjectIds.push(projectData.id);
        // Store the created project ID back if needed for other relations, e.g., bookmarks
        const demoProjectEntry = demoProjects.find(dp => dp.title === p.title);
        if (demoProjectEntry && !demoProjectEntry.id) { // Store first one, or handle multiple users creating same named project
            demoProjectEntry.id = projectData.id;
        }
      }
    }
  }

  // 4) Create Q&A items
  console.log('\n🌱  Seeding Q&A...');
  for (const q of demoQuestions) {
    const questionAskerUsername = getRandomElement(Object.keys(createdUserIds));
    const questionAskerId = createdUserIds[questionAskerUsername];

    const { data: questionData, error: questionErr } = await supabase
      .from('comments')
      .insert({
        user_id: questionAskerId,
        body: q.body,
        kind: 'question',
        tags: q.tags,
      })
      .select('id')
      .single();

    if (questionErr) {
      console.error(`🛑 Failed creating question "${q.body.slice(0,30)}..."`, questionErr.message);
      continue;
    }
    const questionId = questionData!.id;
    console.log(`✅  Created question: "${q.body.slice(0,30)}..." (id: ${questionId})`);

    // Create upvotes for the question itself
    if (q.voterUsernames) {
      for (const voterUsername of q.voterUsernames) {
        if (createdUserIds[voterUsername]) {
          const { error: voteErr } = await supabase.from('comment_votes').insert({
            comment_id: questionId,
            user_id: createdUserIds[voterUsername],
          });
          if (voteErr) console.warn(`   ↳ ⚠️  could not vote on question ${questionId} by ${voterUsername}: ${voteErr.message}`);
          else console.log(`   ↳ ${voterUsername} voted on question ${questionId}`);
        }
      }
    }

    // Create answers for this question
    for (const ans of q.answers) {
      const answererUsername = getRandomElement(Object.keys(createdUserIds).filter(name => name !== questionAskerUsername)); // Different user answers
      const answererId = createdUserIds[answererUsername];

      const { data: answerData, error: answerErr } = await supabase
        .from('comments')
        .insert({
          user_id: answererId,
          body: ans.body,
          kind: 'answer',
          question_id: questionId,
          is_accepted: ans.is_accepted ?? false,
        })
        .select('id')
        .single();

      if (answerErr) {
        console.error(`   ↳ 🛑 Failed creating answer for question ${questionId}`, answerErr.message);
        continue;
      }
      const answerId = answerData!.id;
      console.log(`   ↳ ✅  Created answer by ${answererUsername} (id: ${answerId})`);

      // Create upvotes for the answer
      if (ans.voterUsernames) {
        for (const voterUsername of ans.voterUsernames) {
          if (createdUserIds[voterUsername]) {
            const { error: voteErr } = await supabase.from('comment_votes').insert({
              comment_id: answerId,
              user_id: createdUserIds[voterUsername],
            });
            if (voteErr) console.warn(`     ↳ ⚠️  could not vote on answer ${answerId} by ${voterUsername}: ${voteErr.message}`);
            else console.log(`     ↳ ${voterUsername} voted on answer ${answerId}`);
          }
        }
      }
    }
  }

  // 5) Create some bookmarks
  console.log('\n🌱  Seeding bookmarks...');
  if (createdProjectIds.length > 0 && Object.keys(createdUserIds).length > 0) {
    const usersWhoBookmark = getRandomSubset(Object.values(createdUserIds), 2); // Max 2 users will bookmark
    for (const userId of usersWhoBookmark) {
      const projectsToBookmark = getRandomSubset(createdProjectIds, Math.min(2, createdProjectIds.length)); // Max 2 projects per user
      for (const projectId of projectsToBookmark) {
        const { error: bookmarkErr } = await supabase
          .from('bookmarks') // Assuming 'bookmarks' is the table name
          .insert({
            user_id: userId,
            project_id: projectId,
          });
        if (bookmarkErr) {
          // It's possible a unique constraint (user_id, project_id) prevents duplicates if run multiple times, which is fine.
          if (bookmarkErr.code !== '23505') { // 23505 is unique_violation
             console.warn(`   ↳ ⚠️  Could not create bookmark for user ${userId} on project ${projectId}: ${bookmarkErr.message}`);
          } else {
             console.log(`   ↳ User ${userId} already bookmarked project ${projectId}.`);
          }
        } else {
          console.log(`   ↳ ✅  User ${userId} bookmarked project ${projectId}`);
        }
      }
    }
  } else {
    console.log('   ↳ No projects or users available to create bookmarks.');
  }

  console.log('\n🎉  Done.  Open the app and enjoy the dummy data!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => process.exit());