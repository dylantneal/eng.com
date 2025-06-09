'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DebugStatusPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileStatus, setProfileStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return;
    
    // Check profile status
    fetchProfileStatus();
  }, [session, status]);

  const fetchProfileStatus = async () => {
    try {
      const response = await fetch('/api/debug-schema');
      const data = await response.json();
      setProfileStatus(data);
    } catch (error) {
      console.error('Error fetching profile status:', error);
    }
    setLoading(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading status...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Not signed in</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug: Current Status</h1>
          
          {/* Session Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Authentication Status</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p><strong>Status:</strong> ✅ Signed In</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>User ID:</strong> {session.user.id}</p>
              <p><strong>Name:</strong> {session.user.name || 'Not set'}</p>
              <p><strong>Image:</strong> {session.user.image || 'Not set'}</p>
            </div>
          </div>

          {/* Profile Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Profile Status</h2>
            {profileStatus?.sampleProfile ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p><strong>Status:</strong> ✅ Profile Exists</p>
                <p><strong>Handle:</strong> {profileStatus.sampleProfile.handle || 'Not set'}</p>
                <p><strong>Name:</strong> {profileStatus.sampleProfile.name || 'Not set'}</p>
                <p><strong>Complete:</strong> {profileStatus.sampleProfile.profile_complete ? 'Yes' : 'No'}</p>
                <p><strong>Created:</strong> {profileStatus.sampleProfile.created_at || 'Unknown'}</p>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p><strong>Status:</strong> ❌ No Profile Found</p>
                <p>You need to complete onboarding to create your profile.</p>
              </div>
            )}
          </div>

          {/* Available Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Available Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/home')}
                className="p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Go to Home Dashboard
              </button>
              
              <button
                onClick={() => router.push('/onboard')}
                className="p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                Go to Onboarding
              </button>
              
              <button
                onClick={() => router.push('/debug-reset')}
                className="p-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Reset Profile (Delete)
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="p-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
              >
                Refresh Status
              </button>
            </div>
          </div>

          {/* Raw Data */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Raw Debug Data</h2>
            <details className="bg-gray-50 rounded-xl p-4">
              <summary className="cursor-pointer font-medium">Click to expand</summary>
              <pre className="mt-4 text-xs overflow-auto">
                {JSON.stringify({ session, profileStatus }, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
} 