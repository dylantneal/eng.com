'use client';

import { useState } from 'react';
import clsx from 'clsx';

export default function FollowButton({
  targetId,
  initialState,
}: {
  targetId: string;
  initialState: boolean;
}) {
  const [isFollowing, setFollowing] = useState(initialState);
  const [loading, setLoading]       = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch('/api/follow', {
      method: isFollowing ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId }),
    });

    if (res.ok) setFollowing(!isFollowing);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={clsx(
        'rounded px-4 py-2 text-sm font-medium transition',
        isFollowing
          ? 'bg-gray-200 hover:bg-gray-300'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      )}
    >
      {loading ? '…' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
} 