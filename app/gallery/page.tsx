import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import ProjectCard from '@/components/ProjectCard';
import GalleryFilterBar from '@/components/GalleryFilterBar';

export const revalidate   = 30;            // ISR
export const fetchCache   = 'force-cache'; // edge-cached

const PAGE_SIZE = 12;

interface Props {
  searchParams?: { sort?: string; cursor?: string };
}

export default async function GalleryPage({ searchParams }: Props) {
  const sort   = searchParams?.sort === 'most_tipped' ? 'most_tipped' : 'newest';
  const cursor = searchParams?.cursor;

  const supabase = supabaseServer();
  let query = supabase.from('project_feed').select('*').limit(PAGE_SIZE + 1);

  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
    if (cursor) query = query.lt('created_at', cursor);
  } else {
    query = query.order('tips_cents', { ascending: false });
    if (cursor) query = query.lt('tips_cents', Number(cursor));
  }

  const { data, error } = await query;
  if (error) throw error;

  const hasNext  = (data?.length ?? 0) > PAGE_SIZE;
  const projects = hasNext ? data!.slice(0, PAGE_SIZE) : data ?? [];

  const nextCursor =
    hasNext
      ? sort === 'newest'
          ? (projects[projects.length - 1] as any).created_at
          : (projects[projects.length - 1] as any).tips_cents.toString()
      : null;

  return (
    <section className="py-8">
      <h1 className="text-2xl font-bold mb-2">Public gallery</h1>

      <GalleryFilterBar active={sort} />

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {projects.map((p: any) => (
          <ProjectCard
            key={p.id}
            project={{
              id:     p.id,
              title:  p.title,
              creator:p.handle,
              tips:   Math.round(p.tips_cents / 100),
              thumb:  p.thumb ?? `https://picsum.photos/seed/${p.id}/480/360`,
            }}
          />
        ))}
      </div>

      {hasNext && (
        <div className="text-center mt-8">
          <Link
            href={`/gallery?sort=${sort}&cursor=${nextCursor}`}
            className="text-sm text-brand underline"
          >
            Load more →
          </Link>
        </div>
      )}
    </section>
  );
} 