'use client';

import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { supabaseBrowser } from '@/lib/supabase/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProjectUploader() {
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!files?.length) return;
    setLoading(true);

    const supabase = supabaseBrowser;

    // 1 Create project row
    const slug =
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + uuid().slice(0, 6);

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        owner_id: session.user.id,
        title,
        slug,
        is_public: true,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // 2 Upload files to storage
    await Promise.all(
      Array.from(files).map((file) =>
        supabase.storage
          .from('projects')
          .upload(`${project.id}/${file.name}`, file, {
            cacheControl: '3600',
          }),
      ),
    );

    // 3 Initial version row
    await supabase.from('versions').insert({
      project_id: project.id,
      readme: '# My project',
      files: Array.from(files).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    });

    setLoading(false);
    router.push(`/projects/${session.user.id}/${slug}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col max-w-xl gap-4 mx-auto"
    >
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Project title"
        className="w-full px-3 py-2 border rounded"
      />

      <input
        required
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
      />

      <button
        disabled={loading}
        type="submit"
        className="self-end px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
      >
        {loading ? 'Uploading…' : 'Publish'}
      </button>
    </form>
  );
} 