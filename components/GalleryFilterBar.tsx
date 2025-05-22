'use client';
import Link from 'next/link';
import clsx from 'clsx';

export default function GalleryFilterBar({ active }: { active: 'newest'|'most_tipped' }) {
  return (
    <div className="mb-6 flex gap-4 text-sm">
      {(['newest','most_tipped'] as const).map((opt) => (
        <Link
          key={opt}
          href={`/gallery?sort=${opt}`}
          className={clsx(opt === active && 'font-semibold text-brand')}
        >
          {opt === 'newest' ? 'Newest' : 'Most tipped'}
        </Link>
      ))}
    </div>
  );
} 