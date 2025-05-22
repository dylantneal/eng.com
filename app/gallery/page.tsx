import Link from 'next/link';
import { createClient } from '@/utils/supabase-server';
import Image from 'next/image';

export const revalidate = 30;

export default async function GalleryPage() {
  const supabase = createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, slug, owner:owner(username), project_versions(files)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(40);

  return (
    <div className="columns-1 md:columns-3 gap-4 p-4 transition-opacity animate-in fade-in">
      {(projects ?? []).map((p: any) => {
        const thumb = p.project_versions[0]?.files?.[0];
        return (
          <Link
            key={p.id}
            href={`/projects/${p.owner.username}/${p.slug}`}
            className="break-inside-avoid mb-4 block border rounded overflow-hidden shadow-sm
                       transition-shadow hover:shadow-lg bg-white/50 backdrop-blur"
          >
            {thumb ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${thumb.path}`}
                alt={p.title}
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
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-xs text-gray-500">@{p.owner.username}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 