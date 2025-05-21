import Card from '@/components/ui/Card';
import Link from 'next/link';

type Props = {
  project: {
    id: number | string;
    title: string;
    creator: string;
    tips: number;
    thumb: string;
  };
};

export default function ProjectCard({ project }: Props) {
  return (
    <Card className="break-inside-avoid">
      <Link href="#">
        <img
          src={project.thumb}
          alt={project.title}
          className="w-full aspect-video object-cover rounded-t-lg"
        />
        <div className="p-4 space-y-1.5">
          <h2 className="font-medium">{project.title}</h2>
          <p className="text-sm text-gray-500">@{project.creator}</p>
          <p className="text-sm text-brand font-semibold">
            {project.tips} tips
          </p>
        </div>
      </Link>
    </Card>
  );
} 