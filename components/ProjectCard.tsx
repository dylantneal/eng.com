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
    <Card className="break-inside-avoid relative group">
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

      {/* quick actions */}
      <div className="absolute inset-0 flex items-start justify-end p-2 opacity-0 group-hover:opacity-100 transition">
        <button title="Bookmark" className="icon-btn" onClick={bookmark}>
          🔖
        </button>
        <button title="Copy link" className="icon-btn" onClick={copyLink}>
          🔗
        </button>
        <button title="Tip" className="icon-btn" onClick={tip}>
          💸
        </button>
      </div>
    </Card>
  );
}

function bookmark() { /* TODO */ }
function copyLink()  { navigator.clipboard.writeText(window.location.href); }
function tip()       { /* open stripe checkout */ } 