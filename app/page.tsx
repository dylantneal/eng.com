import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <h1 className="text-4xl font-bold">Welcome to eng.com 👋</h1>
      <p className="max-w-xl text-center text-gray-600">
        A zero-friction space to publish projects, fill knowledge gaps and earn revenue.
      </p>

      <div className="flex gap-4">
        <Link
          href="/gallery"
          className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
        >
          Browse projects
        </Link>
        <Link
          href="/new"
          className="px-4 py-2 text-white bg-gray-900 rounded"
        >
          Publish your first project
        </Link>
      </div>
    </div>
  );
} 