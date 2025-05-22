'use client';

import { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';                 // sanitise preview
import { supabaseBrowser } from '@/lib/supabase/client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const MAX_FILES = 5;
const MAX_BYTES = 100 * 1024 * 1024;               // 100 MB

export default function ProjectUploader() {
  const [title, setTitle] = useState('');
  const [readme, setReadme] = useState('# My project');
  const [files, setFiles]   = useState<File[]>([]);
  const [isPublic, setPublic] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  /* ----------  drag-and-drop ------------------------------------ */
  const onDrop = useCallback((accepted: File[]) => {
    setError(null);

    const all = [...files, ...accepted].slice(0, MAX_FILES);
    const totalBytes = all.reduce((sum, f) => sum + f.size, 0);

    if (accepted.length + files.length > MAX_FILES)
      return setError(`Maximum ${MAX_FILES} files`);
    if (totalBytes > MAX_BYTES)
      return setError('Total size exceeds 100 MB');

    setFiles(all);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  /* ----------  submit ------------------------------------------ */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!files.length) return setError('Please attach at least one file');

    setLoading(true);
    const supabase = supabaseBrowser;

    // slugify title & ensure uniqueness
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let slug   = `${base}-${uuid().slice(0, 6)}`;

    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) slug = `${base}-${uuid().slice(0, 8)}`;

    /* 1 ─ create project row */
    const { data: project, error: insertErr } = await supabase
      .from('projects')
      .insert({
        owner_id: session.user.id,
        title,
        slug,
        is_public: isPublic,
      })
      .select()
      .single();

    if (insertErr || !project) {
      setError(insertErr?.message ?? 'Could not create project');
      setLoading(false);
      return;
    }

    /* 2 ─ upload files to storage */
    await Promise.all(
      files.map((file) =>
        supabase.storage
          .from('projects')
          .upload(`${project.id}/${file.name}`, file, { cacheControl: '3600' }),
      ),
    );

    /* 3 ─ initial version */
    await supabase.from('versions').insert({
      project_id: project.id,
      readme,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    });

    router.push(`/projects/${session.user.id}/${slug}`);
  }

  /* ----------  UI  --------------------------------------------- */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      {/* Visibility toggle */}
      <label className="flex items-center gap-2 text-sm select-none">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setPublic(e.target.checked)}
        />
        Public project
      </label>

      {/* Drag-and-drop area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${
          isDragActive ? 'border-brand' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive
          ? 'Drop the files here…'
          : 'Drag & drop files, or click to browse'}
        <p className="mt-2 text-xs text-gray-500">
          Up to {MAX_FILES} files / 100 MB total
        </p>
        {!!files.length && (
          <ul className="mt-3 text-left text-sm">
            {files.map((f) => (
              <li key={f.name}>• {f.name}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Markdown editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          className="w-full h-64 border rounded p-3 font-mono text-sm"
          value={readme}
          onChange={(e) => setReadme(e.target.value)}
        />
        <div className="prose max-w-none border rounded p-3 overflow-y-auto h-64">
          <ReactMarkdown
            remarkPlugins={[remarkGfm as any]}
            components={{
              /* sanitise every element */
              p: ({ node, ...props }) => (
                <p
                  {...props}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(String(props.children)),
                  }}
                />
              ),
            }}
          >
            {readme}
          </ReactMarkdown>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button disabled={loading} type="submit" className="w-full">
        {loading ? 'Publishing…' : 'Publish'}
      </Button>
    </form>
  );
} 