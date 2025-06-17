'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
// API routes handle database operations

export default function FollowButton({ followeeId }: { followeeId: string }) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState<boolean | null>(null); // null = loading

  /* initial state */
  useEffect(() => {
    if (!session?.user?.id) return; // not signed-in
    
    // Check if already following
    fetch(`/api/follow/status?followeeId=${followeeId}`)
      .then(res => res.json())
      .then(data => setFollowing(data.following))
      .catch(err => {
        console.error('Error checking follow status:', err);
        setFollowing(false);
      });
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