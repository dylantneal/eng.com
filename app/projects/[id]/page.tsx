import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import Comments from '@/components/Comments';
import { notFound } from 'next/navigation';

export const revalidate = 60;                      // ISR

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!project) notFound();                        // private + no access → paywall later

  return (
    <main className="container max-w-4xl py-12 space-y-8">
      <h1 className="text-3xl font-bold">{project.title}</h1>

      {/* file list */}
      <ul className="space-y-1">
        {project.files.map((f: any) => (
          <li key={f.path}>
            <a
              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-files/${f.path}`}
              target="_blank"
              className="underline"
            >
              {f.path.split('/').pop()}
            </a>
          </li>
        ))}
      </ul>

      {/* rendered markdown */}
      <div className="prose max-w-none">
        <ReactMarkdown>{project.readme}</ReactMarkdown>
      </div>

      {/* tip-jar (placeholder) */}
      {project.stripe_account && (
        <button className="bg-yellow-400 rounded px-4 py-2">Tip the author 💸</button>
      )}

      {/* real-time comments */}
      <Comments projectId={project.id} ownerId={project.owner_id} />
    </main>
  );
} 