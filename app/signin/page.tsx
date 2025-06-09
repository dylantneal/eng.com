'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam === 'account-deleted') {
      setMessage('Your account has been successfully deleted. Thank you for using eng.com!');
    }
  }, [searchParams]);

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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {message && (
          <div className="w-full max-w-md mx-auto mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-center">{message}</p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          {/* Email signin */}
          <Card className="w-full max-w-sm p-6 space-y-4">
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

          {/* Social signin - only show if OAuth is configured */}
          <Card className="w-full max-w-sm p-6 space-y-4">
            <h2 className="text-center font-medium">or continue with</h2>
            <p className="text-center text-sm text-gray-500">
              OAuth providers not configured in development
            </p>
            <div className="space-y-2 opacity-50">
              <Button className="w-full" disabled>
                GitHub (Not configured)
              </Button>
              <Button className="w-full" disabled>
                Google (Not configured)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
} 