'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DebugResetPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const resetProfile = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/debug-reset-profile', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`${data.message} - Redirecting to onboarding in 3 seconds...`);
        setTimeout(() => {
          router.push('/onboard');
        }, 3000);
      } else {
        setMessage(`Error: ${data.error}${data.details ? ` - ${data.details}` : ''}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in first</p>
          <button 
            onClick={() => router.push('/signin')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug: Reset Profile</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What this does:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Deletes your eng.com profile data (name, handle, etc.)</li>
              <li>✅ Keeps your login credentials intact</li>
              <li>✅ Redirects you to onboarding to create a new profile</li>
              <li>❌ Does NOT delete your authentication account</li>
            </ul>
            <p className="text-sm text-blue-700 mt-3 font-medium">
              After reset: Stay signed in, don't try to "sign up" again!
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              <p><strong>Current User:</strong> {session.user!.email}</p>
              <p><strong>User ID:</strong> {(session.user as any).id ?? 'unknown'}</p>
            </div>
            
            {message && (
              <div className={`p-4 rounded-xl ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
            
            <button
              onClick={resetProfile}
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-medium transition-colors ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Deleting Profile...
                </div>
              ) : (
                'Delete Profile & Test Onboarding'
              )}
            </button>
            
            <button
              onClick={() => router.push('/home')}
              className="w-full py-3 px-6 rounded-xl font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel - Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 