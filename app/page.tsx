import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-6 py-24">
      <h1 className="text-5xl font-bold tracking-tight text-center">
        Publish, learn & earn as an
        <span className="text-brand"> engineer</span>
      </h1>

      <p className="max-w-xl text-center text-gray-600">
        Drag-and-drop a project, get instant feedback and receive tips from a
        global community of builders.
      </p>

      <div className="flex gap-4">
        <Link href="/gallery">
          <Button>Browse projects</Button>
        </Link>
        <Link href="/new">
          <Button variant="secondary">Publish your first project</Button>
        </Link>
      </div>
    </section>
  );
} 