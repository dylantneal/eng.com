'use client';

import { signIn } from 'next-auth/react';

export default function SignIn() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <button
        onClick={() => signIn('github')}
        className="px-4 py-2 text-white bg-black rounded"
      >
        Sign in with GitHub
      </button>
      <button
        onClick={() => signIn('google')}
        className="px-4 py-2 text-white bg-red-500 rounded"
      >
        Sign in with Google
      </button>
    </main>
  );
} 