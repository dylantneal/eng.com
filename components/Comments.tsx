'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

type C = { id: string; author: string; body: string };

export default function Comments({ projectId, ownerId }: { projectId: string; ownerId: string }) {
  const [comments, setComments] = useState<C[]>([]);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  /* initial + realtime */
  useEffect(() => {
    supabase.from('comments').select('*').eq('project_id', projectId).then(({ data }) => {
      setComments(data ?? []);
    });

    const channel = supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          schema: 'public',
          event: 'INSERT',
          table: 'comments',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => setComments((c) => [...c, payload.new as C]),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <h2 className="font-semibold mb-2">Comments</h2>
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="border rounded p-3">
            <p className="text-sm">@{c.author}</p>
            <p>{c.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
} 