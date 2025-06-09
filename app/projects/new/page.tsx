import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ModernProjectForm from '@/components/ModernProjectForm';

export const metadata = { title: 'New Project — eng.com' };

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin');
  }

  const supabase = await createClient();
  
  // Get user profile and project count
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle, plan')
    .eq('id', session.user.id)
    .single();

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('owner', session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-2 text-gray-600">
            Share your engineering project with the community
          </p>
        </div>

        <ModernProjectForm
          userPlan={profile?.plan || 'FREE'}
          currentProjectCount={projectCount || 0}
          userHandle={profile?.handle || null}
        />
      </div>
    </div>
  );
} 