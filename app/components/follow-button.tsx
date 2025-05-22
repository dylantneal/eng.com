'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleFollow } from '@/app/server/actions/toggle-follow';

type Props = {
  targetId: string;          // profile we're (un)following
  initialState: boolean;
  className?: string;
};

export default function FollowButton({
  targetId,
  initialState,
  className,
}: Props) {
  const [optimistic, setOptimistic] = useOptimistic(initialState);
  const [pending, start] = useTransition();

  return (
    <form
      action={async () => {
        start(async () => {
          setOptimistic(!optimistic);          // 🔮 optimistic swap
          await toggleFollow(targetId);        // 🗄️ server action
        });
      }}
      className={className}
    >
      <button
        type="submit"
        disabled={pending}
        className={`btn ${optimistic ? 'btn-secondary' : 'btn-primary'}`}
      >
        {optimistic ? 'Following' : 'Follow'}
      </button>
    </form>
  );
} 