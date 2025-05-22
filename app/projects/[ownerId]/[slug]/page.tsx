import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabaseServer } from '@/lib/supabase/server';
import CommentThread from '@/components/CommentThread';
import TipJarButton from '@/components/TipJarButton';
import { Database } from '@/types/database';

interface Props {
  params: { ownerId: string; slug: string };
}

// helper alias for brevity
type ProjectRow = Database['public']['Tables']['projects']['Row'];

export default async function ProjectPage({ params }: Props) {
  const supabase = supabaseServer();
  const { data: project } = await supabase
    .from('projects')
    .select(
      'id, title, owner_id, slug, tips:payments(amount_cents), profiles!inner(handle), versions(id, readme, files, created_at)'
    )
    .eq('owner_id', params.ownerId as any)
    .eq('slug', params.slug as any)
    .order('created_at', { referencedTable: 'versions', ascending: false })
    .limit(1, { referencedTable: 'versions' })
    .single();

  // small helper so the rest of the file can use dot-notation without
  // fighting the generated types (tips/profiles/versions come back
  // as nested objects when you use column-renaming)
  const proj = project as unknown as {
    id: string;
    title: string;
    profiles: { handle: string };
    tips?: { amount_cents: number }[];
    versions?: { id: string; readme: string; files: any; created_at: string }[];
  };

  if (!proj) notFound();

  const latest = proj.versions?.[0];
  return (
    <article className="prose mx-auto py-10">
      <h1>{proj.title}</h1>
      <p className="text-sm text-gray-500">
        by @{proj.profiles.handle}{' '}
        {proj.tips ? `• ${(proj.tips[0].amount_cents / 100).toFixed(2)} $ tips` : null}
      </p>

      {/* README */}
      {latest && (
        <ReactMarkdown remarkPlugins={[remarkGfm as any]}>
          {latest.readme}
        </ReactMarkdown>
      )}

      {/* simple file list */}
      {latest?.files?.length && (
        <>
          <h3>Files</h3>
          <ul>
            {latest.files.map((f: any) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        </>
      )}

      {/* comments */}
      <CommentThread projectId={proj.id} />

      {/* Tip-jar */}
      {/* (hide if viewer is the owner) */}
      {proj.id !== params.ownerId && (
        <TipJarButton projectId={proj.id} />
      )}
    </article>
  );
} 