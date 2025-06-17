'use client';

import { useCallback, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';                 // sanitise preview
import { projectsStorage } from '@/lib/storage';
import { prisma } from '@/lib/prisma';
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
    if (!session?.user?.id) return;
    if (!files.length) return setError('Please attach at least one file');

    setLoading(true);

    try {
      // slugify title & ensure uniqueness
      const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let slug = `${base}-${uuid().slice(0, 6)}`;

      const existing = await prisma.project.findFirst({
        where: { slug },
        select: { id: true }
      });

      if (existing) slug = `${base}-${uuid().slice(0, 8)}`;

      /* 1 ─ create project row */
      const project = await prisma.project.create({
        data: {
          ownerId: session.user.id,
          title,
          slug,
          isPublic,
          readme,
        }
      });

      /* 2 ─ upload files to storage */
      const uploadPromises = files.map(async (file) => {
        const bucketName = isPublic ? 'eng-platform-projects' : 'eng-platform-projects-private';
        const storage = projectsStorage; // Use public storage for now
        const filePath = `${project.id}/${file.name}`;
        
        return storage.upload(filePath, file, { 
          cacheControl: 'public, max-age=3600',
          contentType: file.type 
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Check for upload errors
      const uploadErrors = uploadResults.filter((result: any) => result.error);
      if (uploadErrors.length > 0) {
        throw new Error('Failed to upload some files');
      }

      /* 3 ─ initial version */
      await prisma.projectVersion.create({
        data: {
          projectId: project.id,
          versionNo: 1,
          readmeMd: readme,
          files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        }
      });

      router.push(`/projects/${project.id}/${project.slug}`);
    } catch (error) {
      console.error('Project creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
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