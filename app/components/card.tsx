import Link from 'next/link';
import Image from 'next/image';

type Project = {
  id: string;
  slug: string;
  title: string;
  cover_image?: string | null;
};

/* Basic, un-styled project card – expand later if you need more UI */
export default function Card({ project }: { project: Project }) {
  return (
    <Link
      href={`/p/${project.slug}`}
      className="block overflow-hidden rounded-lg border hover:shadow-lg transition-shadow"
    >
      {project.cover_image && (
        <Image
          src={project.cover_image}
          alt={project.title}
          width={800}
          height={450}
          className="h-48 w-full object-cover"
        />
      )}

      <div className="p-4">
        <h3 className="font-medium">{project.title}</h3>
      </div>
    </Link>
  );
} 