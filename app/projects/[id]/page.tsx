import { createClient } from '@/utils/supabase-server';
import ReactMarkdown from 'react-markdown';
import Comments from '@/components/Comments';
import { notFound } from 'next/navigation';

export const revalidate = 60;                      // ISR

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();

  /* ---------- 1. project meta ---------- */
  const { data: project } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      slug,
      owner_id,
      is_public,
      created_at,
      updated_at,
      current_version
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (!project) notFound();

  /* ---------- 2. current version ---------- */
  const { data: currentVersion } = await supabase
    .from('project_versions')
    .select('readme_md, files')
    .eq('id', project.current_version)
    .single();

  if (!currentVersion) {
    console.warn(`Project ${project.id} has no current version data.`);
  }

  const files = currentVersion?.files || [];
  const readme = currentVersion?.readme_md || '';

  return (
    <main className="container max-w-4xl py-12 space-y-8">
      <h1 className="text-3xl font-bold">{project.title}</h1>

      {/* file list */}
      <ul className="space-y-1">
        {files.map((f: any) => (
          <li key={f.path || f.name}>
            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects/${f.path}`}
              target="_blank"
              className="underline"
            >
              {f.name || f.path?.split('/').pop()}
            </a>
          </li>
        ))}
      </ul>

      {/* rendered markdown */}
      <div className="prose max-w-none">
        <ReactMarkdown>{readme}</ReactMarkdown>
      </div>

      {/* tip-jar (placeholder) */}
      {/* adjust condition once the field is available */}
      {false && (
        <button className="bg-yellow-400 rounded px-4 py-2">Tip the author 💸</button>
      )}

      {/* real-time comments */}
      <Comments projectId={project.id} ownerId={project.owner_id} />
    </main>
  );
} 