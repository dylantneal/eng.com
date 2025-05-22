'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-20 w-full bg-white/70 backdrop-blur border-b">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-1 font-bold">
          <span className="text-brand">eng</span>
          <span className="text-gray-900">.com</span>
        </Link>

        {session ? (
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/bookmarks" className="text-sm font-medium">
              Bookmarks
            </Link>
            <Link href="/settings/account" className="text-sm font-medium">
              Settings
            </Link>
            <Link href="/projects/new" className="bg-brand text-white px-3 py-1 rounded">
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