/* Server component – gate the uploader behind authentication */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ProjectUploader from '@/components/ProjectUploader';

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin');           // 🔒 gate

  return (
    <div className="pt-8">
      <h1 className="mb-6 text-2xl font-bold">Publish a project</h1>
      {/* client-side uploader */}
      <ProjectUploader />
    </div>
  );
} 