import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';
import type { Database } from '@/types/supabase';

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin');

  const supabase = supabaseServer();

  /* 1️⃣ bookmarked IDs */
  type BookmarkId = Pick<
    Database['public']['Tables']['bookmarks']['Row'],
    'project_id'
  >;

  const { data: rows } = await supabase
    .from('bookmarks')
    .select('project_id, user_id')
    .eq(
      'user_id',
      session.user.id as Database['public']['Tables']['bookmarks']['Row']['user_id']
    )
    .returns<BookmarkId[]>()
    .throwOnError();

  const ids = rows.map((r: BookmarkId) => r.project_id);
  if (!ids.length)
    return <p className="p-6 text-center text-sm">No bookmarks yet.</p>;

  /* 2️⃣ fetch projects */
  type ProjectRow = Database['public']['Views']['project_feed']['Row'];

  const { data: projects } = await supabase
    .from('project_feed')
    .select('*')
    .in('id', ids)
    .returns<ProjectRow[]>()
    .throwOnError();

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookmarks</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((p: ProjectRow) => (
          <ProjectCard
            key={p.id}
            project={{
              id: p.id,
              title: p.title,
              creator: p.handle,
              tips: Math.round(p.tips_cents / 100),
              thumb: p.thumb ?? `https://picsum.photos/seed/${p.id}/480/360`,
            }}
          />
        ))}
      </div>
    </main>
  );
} 