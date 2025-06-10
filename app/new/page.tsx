import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ProjectUploader from '@/components/ProjectUploader';

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin');

  return (
    <div className="pt-8">
      <h1 className="mb-6 text-2xl font-bold">Publish a project</h1>
      <ProjectUploader />
    </div>
  );
} 