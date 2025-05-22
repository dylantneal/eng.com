'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { key: 'following', label: 'Following' },
  { key: 'newest',    label: 'Newest'    },
  { key: 'top',       label: 'Most Tipped' },
  { key: 'bookmarks', label: 'My Bookmarks' },
];

export default function FeedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const search   = useSearchParams();
  const active   = search.get('filter') ?? 'newest';

  const setFilter = (key: string) => {
    const params = new URLSearchParams(search);
    params.set('filter', key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {items.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setFilter(key)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-sm transition',
            active === key
              ? 'bg-brand text-white'
              : 'bg-white/30 hover:bg-white/50',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
} 