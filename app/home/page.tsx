import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import FeedFilters from '@/components/FeedFilters';
import InfiniteFeed from '@/components/InfiniteFeed';
import { redirect } from 'next/navigation';

export default async function HomeFeed() {
  const session = await getServerSession(authOptions);
  if (!session) {
    /* unauthenticated visitors are sent back to the public landing page */
    redirect('/');
  }

  return (
    <main className="container py-8 space-y-6">
      <FeedFilters />
      {/* InfiniteFeed handles client-side pagination */}
      <InfiniteFeed userId={session.user.id} />
    </main>
  );
} 