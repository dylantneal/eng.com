'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';

export default function ProjectEdit() {
  const { id } = useParams<{ id: string }>();
  const [readme, setReadme] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const router = useRouter();

  /* fetch existing */
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase
      .from('projects')
      .select('readme, title, is_public')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setReadme(data.readme);
        setTitle(data.title);
        setIsPublic(data.is_public);
      });
  }, [id]);

  async function publish() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase
      .from('projects')
      .update({
        readme,
        title,
        is_public: isPublic,
      })
      .eq('id', id);

    router.push(`/projects/${id}`);
  }

  return (
    <main className="grid grid-cols-2 h-screen">
      <section className="p-6 border-r overflow-y-auto">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold mb-4 w-full"
        />

        <textarea
          value={readme}
          onChange={(e) => setReadme(e.target.value)}
          className="w-full h-[70vh] border rounded p-3 font-mono"
        />

        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
          />
          Public
        </label>

        <button onClick={publish} className="mt-6 bg-brand text-white px-4 py-2 rounded">
          Publish
        </button>
      </section>

      <section className="p-6 overflow-y-auto prose max-w-none">
        <ReactMarkdown>{readme}</ReactMarkdown>
      </section>
    </main>
  );
} 