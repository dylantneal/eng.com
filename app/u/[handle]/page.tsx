import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import FollowButton from '@/app/components/follow-button';
import Card from '@/app/components/card';

export const revalidate = 60;

type Params = { handle: string };

export default async function ProfilePage({ params }: { params: Params }) {
  const supabase = createServerSupabaseClient();

  /* ---------- 1. PUBLIC PROFILE ---------- */
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
        id,
        handle,
        display_name,
        avatar_url,
        bio,
        is_pro,
        supporter_level,
        reputation
    `)
    .eq('handle', params.handle)
    .single();

  if (!profile) notFound();

  /* ---------- 2. LIFETIME TIPS ---------- */
  const { data: tipsAgg } = await supabase
    .from('tips')
    .select('amount')
    .eq('recipient_id', profile.id);

  const lifetimeTips =
    tipsAgg?.reduce((sum: number, r: { amount: number }) => sum + r.amount, 0) ?? 0;

  /* ---------- 3. PUBLIC PROJECTS ---------- */
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, cover_image, slug')
    .eq('author_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

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
    <section className="mx-auto max-w-5xl p-4">
      {/* header */}
      <header className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <Image
          src={profile.avatar_url}
          alt={`${profile.display_name}'s avatar`}
          width={96}
          height={96}
          className="rounded-full object-cover"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            {profile.display_name}
            {profile.is_pro && <span className="badge badge-pro">PRO</span>}
            {!!profile.supporter_level && (
              <span className="badge badge-supporter">S{profile.supporter_level}</span>
            )}
          </h1>
          <p className="text-muted-foreground">@{profile.handle}</p>
          {profile.bio && <p className="mt-2 whitespace-pre-wrap">{profile.bio}</p>}

          <div className="mt-4 flex items-center gap-6 text-sm">
            <span className="font-medium">
              {lifetimeTips.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}{' '}
              tips
            </span>
            <span className="flex items-center gap-1">
              {Array.from({ length: profile.reputation ?? 0 }).map((_, i) => (
                <svg
                  key={i}
                  className="h-4 w-4 fill-current text-yellow-500"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </span>
          </div>
        </div>

        {viewer && viewer.id !== profile.id && (
          <FollowButton
            targetId={profile.id}
            initialState={isFollowing}
            className="self-stretch"
          />
        )}
      </header>

      {/* projects */}
      <hr className="my-8 border-muted" />
      {!projects?.length ? (
        <p className="text-muted-foreground text-center">No public projects yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
} 