'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function FollowButton({ followeeId }: { followeeId: string }) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState<boolean | null>(null); // null = loading

  /* initial state */
  useEffect(() => {
    if (!session) return; // not signed-in
    supabaseBrowser
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', session.user.id)
      .eq('followee_id', followeeId)
      .then(({ count }) => setFollowing(Boolean(count)));
  }, [session, followeeId]);

  if (!session || following === null) return null; // hide for anon / while loading

  async function toggle() {
    const r = await fetch('/api/follow', {
      method: 'POST',
      body: JSON.stringify({ followeeId }),
    });
    const { following: next } = await r.json();
    setFollowing(next);
  }

  return (
    <Button size="sm" variant={following ? 'secondary' : 'primary'} onClick={toggle}>
      {following ? 'Following' : 'Follow'}
    </Button>
  );
} 