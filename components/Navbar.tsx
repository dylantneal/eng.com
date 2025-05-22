'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav
      className="
        sticky top-0 z-30
        bg-white/10 supports-[backdrop-filter]:bg-white/10
        backdrop-blur-md
        ring-1 ring-white/20 shadow-sm
      "
    >
      <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold tracking-tight text-xl">
          eng<span className="text-pink-600">.com</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {[
            { href: '/gallery', label: 'Gallery' },
            { href: '/questions', label: 'Mini Q&A' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? 'text-pink-600' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {session ? (
          <div className="flex items-center gap-4">
            <Link href="/home"        className="text-sm">Home</Link>
            <Link href="/bookmarks"   className="text-sm">Bookmarks</Link>
            <Link href="/settings"    className="text-sm">Settings</Link>
            <Link
              href="/projects/new"
              className="rounded px-3 py-1 text-white bg-pink-600 hover:bg-pink-700 transition-colors"
            >
              New Project
            </Link>
            <Button
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="whitespace-nowrap"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => (window.location.href = '/signin')}
            >
              Sign in
            </Button>
            <Button size="sm" onClick={() => (window.location.href = '/signup')}>
              Sign up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
} 