'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between w-full py-4 border-b">
      <Link href="/" className="text-lg font-bold">
        eng.com
      </Link>

      {session ? (
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-medium">
            Dashboard
          </Link>
          <button
            onClick={() => signOut()}
            className="px-3 py-1 text-sm text-white bg-gray-900 rounded"
          >
            Sign out
          </button>
        </div>
      ) : (
        <Link
          href="/signin"
          className="px-3 py-1 text-sm text-white bg-gray-900 rounded"
        >
          Sign in
        </Link>
      )}
    </nav>
  );
} 