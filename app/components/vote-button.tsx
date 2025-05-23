'use client';

import { useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Props = { commentId: string | number; initialUpvotes: number };

export default function VoteButton({ commentId, initialUpvotes }: Props) {
  const supabase = createClientComponentClient();
  const router   = useRouter();
  const [count, setCount]         = useOptimistic(initialUpvotes);
  const [isPending, startTrans]   = useTransition();

  async function toggle() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push('/login');

    const uid = session.user.id;
    const { data: exists } = await supabase
      .from('comment_votes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', uid)
      .maybeSingle();

    // optimistic UI
    setCount(c => c + (exists ? -1 : +1));

    if (exists) {
      await supabase.from('comment_votes').delete().eq('id', exists.id);
    } else {
      await supabase.from('comment_votes').insert({ comment_id: commentId, user_id: uid });
    }

    startTrans(() => router.refresh());
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="flex flex-col items-center px-1 text-gray-600 hover:text-indigo-600 disabled:opacity-50"
      title="Toggle up-vote"
    >
      ▲
      <span>{count}</span>
    </button>
  );
} 