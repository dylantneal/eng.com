import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase-server';
import FollowButton from '@/app/components/follow-button';
import ProBadge from '@/app/components/pro-badge';
import ProjectCard from '@/components/ProjectCard';
import clsx from 'clsx';

export const revalidate = 60;

type Params = { handle: string };

export default async function ProfilePage({ params }: { params: Params }) {
  const supabase = createClient();

  /* ---------- 1. PUBLIC PROFILE ---------- */
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, handle, avatar_url, bio, plan, lifetime_cents')
    .eq('handle', params.handle)
    .single();

  if (!profile) notFound();

  /* ---------- 2. LIFETIME TIPS ---------- */
  const lifetimeTips = (profile.lifetime_cents ?? 0) / 100;

  /* ---------- 3. PUBLIC PROJECTS ---------- */
  const { data: projectsData, error: projectsError } = await supabase
    .from('project_feed')
    .select('id, title, slug, thumb, tips_cents, handle, created_at')
    .eq('handle', params.handle)
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error("Supabase error fetching projects for profile:", JSON.stringify(projectsError, null, 2));
  }

  const projects = projectsData?.map(p => ({
    ...p,
    thumb_url: p.thumb?.startsWith('http') 
      ? p.thumb 
      : p.thumb
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects/${p.thumb}`
        : `https://picsum.photos/seed/${p.id}/480/360`,
  })) || [];

  /* ---------- 4. VIEWER & FOLLOW STATE ---------- */
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  let isFollowing = false;
  if (viewer) {
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', viewer.id)
      .eq('following_id', profile.id)
      .maybeSingle();
    isFollowing = !!existing;
  }

  /* ---------- 5. RENDER ---------- */
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      {/* ----------  Header ---------- */}
      <section className="flex items-center gap-6">
        <Image
          src={profile.avatar_url ?? `https://robohash.org/${profile.id}`}
          alt={profile.handle}
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
        />

        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            @{profile.handle}
            {/* PRO / supporter badges */}
            {profile.plan === 'pro' && <ProBadge />}
          </h1>

          {profile.bio && <p className="mt-1 text-gray-600">{profile.bio}</p>}

          <p className="mt-2 text-sm text-gray-500">
            {lifetimeTips.toFixed(2)}&nbsp;$ lifetime tips
          </p>

          {/* simplistic reputation stars – 1 star per $10 tipped */}
          <div className="mt-1 flex">
            {Array.from({ length: Math.min(5, Math.floor(lifetimeTips / 10)) }).map(
              (_, i) => (
                <svg
                  key={i}
                  className="h-4 w-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.964a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.378 2.455a1 1 0 00-.364 1.118l1.287 3.964c.3.92-.755 1.688-1.54 1.118l-3.379-2.455a1 1 0 00-1.176 0l-3.378 2.455c-.785.57-1.84-.198-1.54-1.118l1.287-3.964a1 1 0 00-.364-1.118L2.05 9.391c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.964z" />
                </svg>
              )
            )}
          </div>
        </div>

        {/* Follow / Unfollow – hidden on own profile */}
        {viewer && viewer.id !== profile.id && (
          <FollowButton targetId={profile.id} initialState={isFollowing} />
        )}
      </section>

      {/* ----------  Projects grid ---------- */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Projects</h2>

        <div
          className={clsx(
            'grid gap-6',
            'sm:grid-cols-2',
            'lg:grid-cols-3'
          )}
        >
          {projects?.map((p) => (
            <ProjectCard
              key={p.id}
              project={{
                id:      p.id,
                title:   p.title,
                creator: p.handle,
                tips:    Math.round((p.tips_cents ?? 0) / 100),
                thumb:   p.thumb_url,
              }}
            />
          ))}

          {!projects?.length && (
            <p className="text-muted-foreground">No public projects yet.</p>
          )}
        </div>
      </section>
    </main>
  );
} 