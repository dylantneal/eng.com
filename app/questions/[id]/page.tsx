import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/server';
import VoteButton from '@/app/components/vote-button';
import AcceptAnswerToggle from '@/app/components/accept-answer-toggle';
import Card from '@/app/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: question, error: qErr } = await supabase
    .from('comments')
    .select('id, content, upvotes, created_at, user_id, profiles(handle)')
    .eq('kind', 'question')
    .eq('id', params.id)
    .single();

  if (qErr || !question) return notFound();

  const { data: answersData, error: aErr } = await supabase
    .from('comments')
    .select('id, content, upvotes, is_accepted, user_id, created_at, profiles(handle)')
    .eq('kind', 'answer')
    .eq('parent_id', params.id)
    .order('is_accepted', { ascending: false })
    .order('upvotes', { ascending: false });

  if (aErr) console.error(aErr);
  const answers = answersData ?? [];

  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user.id;

  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <Link href="/questions" className="text-indigo-600 hover:underline">← Back</Link>

      {/* Question */}
      <Card>
        <article className="p-6">
          <div className="flex gap-4">
            <VoteButton commentId={question.id} initialUpvotes={question.upvotes} />
            <div className="flex-1">
              <ReactMarkdown className="prose">{question.content}</ReactMarkdown>
              <p className="text-sm text-gray-500 mt-2">
                asked by {question.profiles?.[0]?.handle} on {new Date(question.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </article>
      </Card>

      {/* Answers */}
      <section className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Answers</h2>
        <ul className="space-y-6">
          {answers.map(a => (
            <Card key={a.id}>
              <div className={`p-4 ${a.is_accepted ? 'bg-green-50' : ''}`}>
                <div className="flex gap-4">
                  <VoteButton commentId={a.id} initialUpvotes={a.upvotes} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <ReactMarkdown className="prose">{a.content}</ReactMarkdown>

                      {uid === question.user_id && (
                        <AcceptAnswerToggle
                          answerId={a.id}
                          isAccepted={a.is_accepted}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {a.upvotes} ▲ • {a.profiles?.[0]?.handle} •{' '}
                      {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </ul>
      </section>
    </main>
  );
}