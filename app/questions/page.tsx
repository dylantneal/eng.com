import Link from 'next/link';
import Card from '@/app/components/ui/Card';
import EmptyState from '@/app/components/ui/EmptyState';

type Search = {
  sort?: string;
  cursor?: string;
};

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const sort   = params.sort === 'top' ? 'top' : 'newest';
  const limit  = 20;

  // For now, skip the database query due to schema issues and use sample data
  let questions: Array<{
    id: string;
    body: string;
    upvotes: number;
    created_at: string;
    profiles: { handle: string } | null;
  }> = [];

  // Add sample engineering questions
  questions = [
    {
      id: 'sample-q1',
      body: 'How do I properly design PCB traces for high-frequency signals? I\'m working on a 2.4GHz project and experiencing signal integrity issues.',
      upvotes: 15,
      created_at: '2024-01-15T10:30:00Z',
      profiles: { handle: 'rf_engineer' }
    },
    {
      id: 'sample-q2',
      body: 'What are the best practices for thermal management in 3D printed electronics enclosures? My Arduino project keeps overheating.',
      upvotes: 8,
      created_at: '2024-01-14T16:45:00Z',
      profiles: { handle: 'maker_jane' }
    },
    {
      id: 'sample-q3',
      body: 'Can someone explain the difference between PWM and analog control for motor speed regulation? Which is more efficient for battery-powered robots?',
      upvotes: 23,
      created_at: '2024-01-12T09:20:00Z',
      profiles: { handle: 'robotics_pro' }
    },
    {
      id: 'sample-q4',
      body: 'I\'m having trouble with EMI/EMC compliance for my IoT device. Any recommendations for cost-effective pre-compliance testing tools?',
      upvotes: 12,
      created_at: '2024-01-10T14:15:00Z',
      profiles: { handle: 'compliance_guru' }
    },
    {
      id: 'sample-q5',
      body: 'How do you handle version control for mechanical CAD files? Git doesn\'t work well with large binary files like STEP models.',
      upvotes: 19,
      created_at: '2024-01-08T11:30:00Z',
      profiles: { handle: 'mech_designer' }
    },
    {
      id: 'sample-q6',
      body: 'What\'s the best approach for integrating sensors with microcontrollers when dealing with different voltage levels and communication protocols?',
      upvotes: 7,
      created_at: '2024-01-05T13:45:00Z',
      profiles: { handle: 'embedded_dev' }
    }
  ];

  // Sort the sample data based on the selected sort option
  if (sort === 'top') {
    questions.sort((a, b) => b.upvotes - a.upvotes);
  } else {
    questions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

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