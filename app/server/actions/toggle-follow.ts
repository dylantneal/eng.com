'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type FollowRow = {
  id?: string;
  follower_id: string;
  followee_id: string;
  inserted_at?: string | null;
};

export async function toggleFollow(targetId: string) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthenticated');

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id!);
  } else {
    await supabase
      .from('follows')
      .insert({ follower_id: user.id, followee_id: targetId });
  }

  // re-cache viewer's and target profile pages
  revalidatePath(`/u/${user.id}`);
  revalidatePath(`/u/${targetId}`);
} 