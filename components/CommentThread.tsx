'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function CommentThread({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const { data: session } = useSession();

  useEffect(() => {
    const supabase = supabaseBrowser;

    supabase
      .from('comments')
      .select('id, body, profiles(handle)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setComments(data ?? []));

    // live updates
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => setComments((c) => [payload.new as any, ...c]),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    await supabaseBrowser.from('comments').insert({
      project_id: projectId,
      user_id: (session.user as any).id,
      body,
    });
    setBody('');
  }

  return (
    <section className="mt-10">
      <h3 className="mb-4">Comments</h3>

      {session && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            placeholder="Write a comment…"
            className="flex-1 border rounded px-3 py-2"
          />
          <Button size="sm" disabled={!body}>
            Post
          </Button>
        </form>
      )}

      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id}>
            <p className="text-sm">
              <span className="font-medium">@{c.profiles?.handle}</span>:{' '}
              {c.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
} 