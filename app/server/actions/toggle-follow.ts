'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleFollow(targetId: string) {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthenticated');

  const { data: existing } = await supabase
    .from<any>('follows' as any)
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetId)
    .maybeSingle();

  if (existing) {
    await supabase.from<any>('follows' as any).delete().eq('id', (existing as any).id);
  } else {
    await supabase
      .from<any>('follows' as any)
      .insert({ follower_id: user.id, following_id: targetId });
  }

  // re-cache viewer's and target profile pages
  revalidatePath(`/u/${user.id}`);
  revalidatePath(`/u/${targetId}`);
} 