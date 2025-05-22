import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export default async function BookmarksPage() {
  const supabase = createClient(cookies());

  /* 1️⃣  Ensure the visitor is logged in */
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  /* 2️⃣  Load bookmarked projects */
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select(
      'project:projects ( id, title, slug, cover_image, tips_total, created_at, owner:profiles (handle) )'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">My Bookmarks</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks?.map(({ project }) => {
          // Supabase types think `project` is an array; make sure we use the row
          const p = Array.isArray(project) ? project[0] : project

          return (
            <ProjectCard
              key={p.id}
              project={{
                id: p.id,
                title: p.title,
                creator: p.owner?.[0]?.handle ?? '',
                tips:   Math.round(p.tips_total / 100),
                thumb:  p.cover_image ?? `https://picsum.photos/seed/${p.id}/480/360`,
              }}
            />
          )
        })}
        {!bookmarks?.length && (
          <p className="text-muted-foreground">
            You haven't bookmarked any projects yet.
          </p>
        )}
      </div>
    </main>
  );
} 