import Link from 'next/link';
import { createClient } from '@/utils/supabase-server';

export const dynamic = 'force-dynamic';   // always fresh

type Search = { cursor?: string; sort?: 'top' | 'newest' };

export default async function QuestionsPage({ searchParams }: { searchParams: Search }) {
  const supabase = createClient();
  const sort   = searchParams.sort === 'top' ? 'top' : 'newest';
  const limit  = 20;

  let query = supabase
    .from('comments')
    .select('id, content, upvotes, created_at, profiles(username)')
    .eq('kind', 'question');

  query = sort === 'top'
    ? query.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
    : query.order('created_at', { ascending: false });

  if (searchParams.cursor) {
    query = sort === 'top'
      ? query.lt('upvotes', searchParams.cursor)
      : query.lt('created_at', searchParams.cursor);
  }

  const { data, error } = await query.limit(limit);
  if (error) console.error(error);

  // flatten `profiles` from array → single object
  const questions = (data ?? []).map(q => ({
    ...q,
    profiles: q.profiles?.[0] ?? null            // take first profile or null
  })) as Array<{
    id: string;
    content: string;
    upvotes: number;
    created_at: string;
    profiles: { username: string } | null;
  }>;

  const nextCursor = questions.length === limit
    ? (sort === 'top'
        ? questions[questions.length - 1].upvotes
        : questions[questions.length - 1].created_at)
    : undefined;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Questions</h1>

      <nav className="flex gap-4 mb-6">
        <Link href="/questions?sort=newest" className={sort==='newest' ? 'font-semibold' : ''}>Newest</Link>
        <Link href="/questions?sort=top"    className={sort==='top'    ? 'font-semibold' : ''}>Top</Link>
      </nav>

      <ul className="space-y-6">
        {questions.map(q => (
          <li key={q.id} className="border p-4 rounded">
            <Link href={`/questions/${q.id}`} className="block hover:underline">
              <h2 className="text-lg font-medium mb-1">
                {q.content.slice(0, 120)}{q.content.length > 120 && '…'}
              </h2>
            </Link>
            <p className="text-sm text-gray-500">
              {q.upvotes} ▲ • {q.profiles?.username} • {new Date(q.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      {nextCursor && (
        <Link
          href={`/questions?sort=${sort}&cursor=${encodeURIComponent(String(nextCursor))}`}
          className="block text-center mt-8 text-indigo-600 hover:underline"
        >
          Next →
        </Link>
      )}
    </main>
  );
} 