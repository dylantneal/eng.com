import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const session = await getServerSession();
  
  if (!session?.user?.id) {
    redirect('/signin?redirect=/admin');
  }

  const supabase = supabaseBrowser;
  
  // Check if user is admin (you'll need to add an is_admin field to profiles)
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle, plan')
    .eq('id', session.user.id)
    .single();

  // For MVP, let's allow access if user has a specific handle (replace with your admin handle)
  const isAdmin = profile?.handle === 'admin' || session.user.email === 'admin@eng.com';
  
  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Console</h1>
          <p className="text-gray-600 mt-2">Platform management and moderation tools</p>
        </div>
        
        <AdminDashboard />
      </div>
    </div>
  );
} 