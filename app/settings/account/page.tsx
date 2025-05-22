import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Card from '@/components/ui/Card';

export default async function AccountSettings() {
  const session = await getServerSession(authOptions);

  return (
    <Card className="p-6 space-y-4">
      <h2 className="font-semibold text-lg">Account</h2>
      <p>Display name: <strong>{session?.user?.name ?? '—'}</strong></p>
      <p>Email: <strong>{session?.user?.email}</strong></p>
      {/* TODO: add form for handle / avatar / delete account */}
    </Card>
  );
} 