import Link from 'next/link';
import { createClient } from '@/utils/supabase-server';
import Image from 'next/image';
import clsx from 'clsx';

export const revalidate = 30;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: { sort?: string }
}) {
  const sortIsTop = searchParams?.sort === 'top';
  const orderColumn = sortIsTop ? 'tips_cents' : 'created_at';

  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from('project_feed')
    .select(
      `
        id,
        title,
        slug,
        username,
        thumb_url,
        tips_cents,
        created_at
      `
    )
    .order(orderColumn, { ascending: false });

  if (error) throw error;

  return (
    <section className="mx-auto w-full max-w-5xl px-4">
      <nav className="mb-6 flex gap-4 text-sm font-medium">
        {[
          { label: 'Latest',   href: '/gallery',            active: !sortIsTop },
          { label: 'Most Tipped', href: '/gallery?sort=top', active:  sortIsTop },
        ].map(tab => (
          <Link
            key={tab.label}
            href={tab.href}
            className={clsx(
              'rounded px-2 py-1 transition',
              tab.active
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map(project => (
          <Link
            key={project.id}
            href={`/projects/${project.username}/${project.slug}`}
            className="break-inside-avoid mb-4 block border rounded overflow-hidden shadow-sm
                       transition-shadow hover:shadow-lg bg-white/50 backdrop-blur"
          >
            {project.thumb_url ? (
              <Image
                src={project.thumb_url}
                alt={project.title}
                width={400}
                height={300}
                className="w-full object-cover"
              />
            ) : (
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <span>No preview</span>
              </div>
            )}
            <div className="p-3">
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-xs text-gray-500">@{project.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 