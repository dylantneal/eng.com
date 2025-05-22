'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

export default function UploadNewVersion({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    setLoading(true);

    await supabaseBrowser.storage
      .from('projects')
      .upload(`${projectId}/${file.name}`, file, { cacheControl: '3600' });

    await supabaseBrowser.from('versions').insert({
      project_id: projectId,
      readme: 'New upload',
      files: [{ name: file.name, size: file.size, type: file.type }],
    });

    setLoading(false);
    window.location.reload();
  }

  return (
    <>
      <input
        id="new-ver"
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      <label htmlFor="new-ver">
        <Button size="sm" disabled={loading}>
          {loading ? 'Uploading…' : 'Upload new version'}
        </Button>
      </label>
    </>
  );
} 