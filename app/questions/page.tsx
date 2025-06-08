import Link from 'next/link';
import Card from '@/app/components/ui/Card';
import EmptyState from '@/app/components/ui/EmptyState';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';   // always fresh

type Search = {
  sort?: string;
  cursor?: string;
};

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const sort   = params.sort === 'top' ? 'top' : 'newest';
  const limit  = 20;

  let query = supabase
    .from('comments')
    .select('id, body, upvotes, created_at, profiles(handle)')
    .eq('kind', 'question');

  query = sort === 'top'
    ? query.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
    : query.order('created_at', { ascending: false });

  if (params.cursor) {
    if (sort === 'top') {
      const numericCursor = parseInt(params.cursor, 10);
      if (!isNaN(numericCursor)) {
        query = query.lt('upvotes', numericCursor);
      } else {
        console.warn('Invalid numeric cursor for upvotes sort:', params.cursor);
      }
    } else {
      query = query.lt('created_at', params.cursor);
    }
  }

  const { data, error } = await query.limit(limit);
  if (error) {
    console.error('Supabase query error:', error.message, error.details, error.hint);
  }

  // flatten `profiles` from array → single object
  const questions = (data ?? []).map(q => ({
    ...q,
    profiles: Array.isArray(q.profiles) ? q.profiles[0] : q.profiles ?? null
  })) as Array<{
    id: string;
    body: string;
    upvotes: number;
    created_at: string;
    profiles: { handle: string } | null;
  }>;

  const nextCursor = questions.length === limit
    ? (sort === 'top'
        ? questions[questions.length - 1].upvotes.toString()
        : questions[questions.length - 1].created_at)
    : undefined;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Questions</h1>

      <nav className="flex gap-4 mb-6">
        <Link href="/questions?sort=newest" className={sort==='newest' ? 'font-semibold' : ''}>Newest</Link>
        <Link href="/questions?sort=top"    className={sort==='top'    ? 'font-semibold' : ''}>Top</Link>
      </nav>

      <ul className="space-y-6">
        {questions.map(q => (
          <Card key={q.id}>
            <div className="p-4">
              <Link href={`/questions/${q.id}`} className="block hover:underline">
                <h2 className="text-lg font-medium mb-1">
                  {q.body.slice(0, 120)}{q.body.length > 120 && '…'}
                </h2>
              </Link>
              <p className="text-sm text-gray-500">
                {q.upvotes} ▲ • {q.profiles?.handle} • {new Date(q.created_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        ))}
      </ul>

      {questions.length === 0 && <EmptyState label="Nothing to show yet." />}

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