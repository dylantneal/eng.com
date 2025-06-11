import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';
import type { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase/server';

/* ───────── helper so .filter() narrows away null / undefined ───────── */
const notNull = <T,>(v: T | null | undefined): v is T => v != null;

export default async function BookmarksPage() {
  const supabase = createClient();

  /* 1️⃣  Ensure the visitor is logged in */
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/');

  /* 2️⃣  Load bookmarked projects */
  const { data: bookmarksData } = await supabase
    .from('bookmarks')
    .select(
      `
        project_id,
        projects (
          id,
          title,
          slug,
          created_at,
          owner_id,
          profiles (handle),
          project_versions (files)
        )
      `
    )
    .eq('user_id', user.id)
    .order('created_at', { referencedTable: 'projects', ascending: false });

  const bookmarks = bookmarksData?.map(b => {
    const project = Array.isArray(b.projects) ? b.projects[0] : b.projects;
    if (!project) return null;

    // Determine thumbnail: use first file from latest version, or fallback
    let thumbUrl = `https://picsum.photos/seed/${project.id}/480/360`;
    if (project.project_versions && project.project_versions.length > 0) {
        const latestVersion = project.project_versions[0]; // Assuming versions are ordered desc by creation
        if (latestVersion.files && latestVersion.files.length > 0) {
            const firstFile = latestVersion.files[0];
            // Assuming files are stored in 'projects/{project_id}/{filename}'
            // and firstFile.name contains the filename.
            // This requires project_versions.files to store {name: string, path: string, ...}
            // If files in project_versions is just an array of names/paths:
            const filePath = firstFile.path || `${project.id}/${firstFile.name}`; // Adjust based on actual file object structure
            thumbUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects/${filePath}`;
        }
    }
    
    // project.profiles will now be { handle: string } or an array of it
    const profileData = Array.isArray(project.profiles) ? project.profiles[0] : project.profiles;
    // Create an owner object that includes 'handle', derived from 'username'
    const owner = profileData ? { ...profileData, handle: profileData.handle } : null;

    return {
      project: {
        ...project,
        owner,
        thumb: thumbUrl,
        tips_cents: 0,          // ← give it so TS knows the field exists
      },
    };
  }).filter(notNull);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <h1 className="text-2xl font-semibold">My Bookmarks</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks?.map(({ project: p }) => {
          return (
            <ProjectCard
              key={p.id}
              project={{
                id: p.id,
                title: p.title,
                creator: p.owner?.handle ?? '',
                tips:   Math.round((p.tips_cents ?? 0) / 100),
                thumb:  p.thumb ?? `https://picsum.photos/seed/${p.id}/480/360`,
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