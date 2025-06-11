'use client'

import { useState, useTransition } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'

type Props = {
  /** user you want to follow / un-follow */
  followeeId: string
  /** optional cache from the server so the button renders instantly */
  initialIsFollowing?: boolean
}

export default function FollowButton({
  followeeId,
  initialIsFollowing = false,
}: Props) {
  const supabase = createBrowserClient()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [pending, startTransition] = useTransition()

  async function toggle() {
    startTransition(async () => {
      if (isFollowing) {
        await supabase.from<any>('follows' as any).delete().eq('followee_id', followeeId)
      } else {
        await supabase.from<any>('follows' as any).insert({ followee_id: followeeId })
      }
      setIsFollowing((p) => !p)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-sm"
    >
      {isFollowing ? 'Un-follow' : 'Follow'}
    </button>
  )
} 