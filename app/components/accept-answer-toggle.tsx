'use client';

import { useTransition } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

type Props = { answerId: string | number; isAccepted: boolean };
export default function AcceptAnswerToggle({ answerId, isAccepted }: Props) {
  const supabase = createClientComponentClient();
  const router   = useRouter();
  const [isPending, startTrans] = useTransition();

  async function handleClick() {
    await supabase
      .from('comments')
      .update({ is_accepted: !isAccepted })
      .eq('id', answerId);

    startTrans(() => router.refresh());
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={isAccepted ? 'Un-accept' : 'Mark as accepted'}
      className={isAccepted ? 'text-green-600' : 'text-gray-300'}
    >
      ✓
    </button>
  );
} 