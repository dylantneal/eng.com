'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import clsx from 'clsx';

const PaletteCtx = createContext({ open: () => {} });
export const useCommandPalette = () => useContext(PaletteCtx);

export default function CommandPaletteProvider({ children }: React.PropsWithChildren) {
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(false);

  /* ⌘K / Ctrl-K listener */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  const { data } = useSWR(
    visible && query ? `/api/search?q=${encodeURIComponent(query)}` : null,
    (url) => fetch(url).then((r) => r.json()),
  );

  return (
    <PaletteCtx.Provider value={{ open: () => setVisible(true) } as any}>
      {children}

      {/* overlay */}
      {visible && (
        <div
          className="fixed inset-0 z-[200] bg-black/40 flex items-start justify-center pt-32"
          onClick={() => setVisible(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-xl bg-white p-4 space-y-3 shadow-lg"
          >
            <input
              autoFocus
              placeholder="Search projects, users, questions…"
              className="w-full border rounded px-3 py-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {query && (
              <div className="max-h-80 overflow-y-auto space-y-4">
                {['projects', 'users', 'questions'].map((k) => (
                  <Section key={k} title={k} items={data?.[k] ?? []} />
                ))}
                {!data && <p className="text-sm">Searching…</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </PaletteCtx.Provider>
  );
}

function Section({ title, items }: { title: string; items: any[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1 text-xs uppercase text-gray-500">{title}</p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li
            key={it.id}
            className={clsx(
              'px-3 py-1.5 rounded hover:bg-gray-100 cursor-pointer',
            )}
            onClick={() => (window.location.href = linkFor(it, title))}
          >
            {it.title || it.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
function linkFor(it: any, section: string) {
  if (section === 'projects')   return `/projects/${it.owner_id}/${it.id}`;
  if (section === 'users')      return `/u/${it.id}`;
  return `/questions/${it.id}`;
} 