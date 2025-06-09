'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SignUp() {
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) router.push('/onboard');
    else {
      const { error } = await res.json();
      setError(error ?? 'Unknown error');
      setLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-4 space-x-6 flex-wrap">
      {/* Email signup */}
      <Card className="w-full max-w-xs p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">Create account</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Sign up'}
          </Button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <a href="/signin" className="text-brand underline">
            Sign in
          </a>
        </p>
      </Card>

      {/* Social signup */}
      <Card className="w-full max-w-xs p-6 space-y-4">
        <h2 className="text-center font-medium">or create with</h2>
        <Button 
          className="w-full" 
          onClick={() => signIn('github', { callbackUrl: '/auth/welcome' })}
        >
          GitHub
        </Button>
        <Button 
          className="w-full" 
          onClick={() => signIn('google', { callbackUrl: '/auth/welcome' })}
        >
          Google
        </Button>
      </Card>
    </main>
  );
} 