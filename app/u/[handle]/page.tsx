import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabaseServer } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';
import FollowButton from '@/components/FollowButton';
import type { Database } from '@/types/supabase';

type Props = { params: { handle: string } };

/* row helper for the project_feed view */
type ProjectRow = Database['public']['Views']['project_feed']['Row'];

export default async function ProfilePage({ params }: Props) {
  const supabase = supabaseServer();

  /* fetch profile by handle */
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, handle, avatar_url, bio, plan, rep')
    .eq('handle', params.handle)
    .single();

  if (!profile) notFound();

  /* lifetime tips in cents */
  const { data: tipsRows } = await supabase
    .from('payments')
    .select('amount_cents')
    .eq('payee_id', profile.id)
    .eq('type', 'tip');

  const lifetimeCents =
    tipsRows?.reduce(
      (sum: number, t: { amount_cents: number | null }) =>
        sum + (t.amount_cents ?? 0),
      0
    ) ?? 0;

  /* last projects (public only) */
  const { data: projects } = await supabase
    .from('project_feed') // ← view already groups + adds thumb
    .select('*')
    .eq('handle', profile.handle)
    .order('created_at', { ascending: false })
    .returns<ProjectRow[]>()        // ✅ typed result
    .throwOnError();

  return (
    <main className="container max-w-5xl py-10">
      {/* header */}
      <div className="flex items-center gap-6 mb-10">
        <Image
          src={profile.avatar_url ?? `https://robohash.org/${profile.id}?size=96x96`}
          width={96}
          height={96}
          alt=""
          className="rounded-full object-cover"
        />

        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            @{profile.handle}
            {profile.plan === 'pro' && (
              <span className="px-2 py-0.5 text-xs rounded bg-yellow-400/20 text-yellow-700">
                PRO
              </span>
            )}
          </h1>
          {profile.bio && <p className="text-gray-600 mt-1">{profile.bio}</p>}
          <p className="mt-2 text-sm text-gray-500">
            ⭐ {profile.rep ?? 0} • ${ (lifetimeCents / 100).toFixed(2) } tips
          </p>
        </div>

        {/* follow button (hidden for self via prop check) */}
        <FollowButton followeeId={profile.id} />
      </div>

      {/* projects grid */}
      <h2 className="font-semibold mb-4">Projects</h2>
      {projects?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p: ProjectRow) => (
            <ProjectCard
              key={p.id}
              project={{
                id: p.id,
                title: p.title,
                creator: p.handle,
                tips:   Math.round(p.tips_cents / 100),
                thumb:  p.thumb ?? `https://picsum.photos/seed/${p.id}/480/360`,
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No public projects yet.</p>
      )}
    </main>
  );
} 