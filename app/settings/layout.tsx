import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin');

  const items = [
    { href: '/settings/account',       label: 'Account' },
    { href: '/settings/billing',       label: 'Billing' },
    { href: '/settings/notifications', label: 'Notifications' },
    { href: '/settings/developer',     label: 'Developer' },
  ];

  return (
    <main className="container py-10 flex gap-10">
      {/* sidebar */}
      <aside className="w-44 flex flex-col gap-2">
        {items.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'rounded px-3 py-2 text-sm transition',
              href === decodeURIComponent(  // active…
                typeof window === 'undefined' ? '' : window.location.pathname
              )
                ? 'bg-brand text-white'
                : 'hover:bg-gray-100',
            )}
          >
            {label}
          </Link>
        ))}
      </aside>

      <section className="flex-1">{children}</section>
    </main>
  );
} 