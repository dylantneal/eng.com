'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SignIn() {
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState<string | null>(null);

  async function handleCredLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error) setError(res.error);
    else if (res?.ok) window.location.href = '/';
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4 space-x-6 flex-wrap">
      {/* Password login */}
      <Card className="w-full max-w-xs p-6 space-y-4">
        <h1 className="text-lg font-semibold text-center">Sign in</h1>
        <form onSubmit={handleCredLogin} className="space-y-3">
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
        <p className="text-center text-sm">
          No account?{' '}
          <a href="/signup" className="text-brand underline">
            Create one
          </a>
        </p>
      </Card>

      {/* Social buttons */}
      <Card className="w-full max-w-xs p-6 space-y-4">
        <h2 className="text-center font-medium">or continue with</h2>
        <Button className="w-full" onClick={() => signIn('github')}>
          GitHub
        </Button>
        <Button className="w-full" onClick={() => signIn('google')}>
          Google
        </Button>
      </Card>
    </main>
  );
} 