'use client';

import useSWRInfinite from 'swr/infinite';
import ProjectCard from '@/components/ProjectCard';
import { useSearchParams } from 'next/navigation';
import { useRef, useCallback, useEffect } from 'react';

type Props = { userId: string };

export default function InfiniteFeed({ userId }: Props) {
  const search = useSearchParams();
  const filter = search.get('filter') ?? 'newest';

  /* ––––– SWR infinite ––––– */
  const getKey = (page: number, prev: any) => {
    if (prev && !prev.nextCursor) return null; // reached end
    const cursor = prev?.nextCursor ?? '';
    return `/api/gallery?filter=${filter}&cursor=${cursor}`;
  };

  const { data, size, setSize, isLoading } = useSWRInfinite(getKey, (url) =>
    fetch(url).then((r) => r.json()),
  );

  const items = data?.flatMap((d) => d.items) ?? [];

  /* ––––– intersection-observer to auto-load ––––– */
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) setSize((s) => s + 1);
    },
    [setSize],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useIntersectionObserver(loadMoreRef, onIntersect);

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {items.map((p: any) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      <div ref={loadMoreRef} />
      {isLoading && <p className="text-center py-6">Loading…</p>}
      {!isLoading && items.length === 0 && (
        <p className="text-center py-6 text-sm text-gray-600">
          Nothing to show yet.
        </p>
      )}
    </>
  );
}

/* generic hook | accepts RefObject<HTMLDivElement | null>, etc. */
function useIntersectionObserver<T extends Element>(
  ref: React.RefObject<T | null>,
  cb: IntersectionObserverCallback,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(cb, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, cb]);
} 