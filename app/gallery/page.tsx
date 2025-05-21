import ProjectCard from '@/components/ProjectCard';

export const metadata = { title: 'Gallery – eng.com' };

export default async function GalleryPage() {
  // TODO: fetch real projects via supabase
  const mock = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    title: `Project ${i + 1}`,
    creator: 'alice',
    tips: Math.floor(Math.random() * 23),
    thumb: `https://picsum.photos/seed/${i}/480/360`,
  }));

  return (
    <section className="py-8">
      <h1 className="mb-6 text-2xl font-bold">Public gallery</h1>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {mock.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
} 