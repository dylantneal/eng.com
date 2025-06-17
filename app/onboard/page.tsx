'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    handle: '',
    bio: '',
    primaryDomain: 'software',
    experienceLevel: 'entry',
    interests: ['Arduino']
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/signin');
      return;
    }
    
    if (session.user.email && !profileData.handle) {
      const suggestedHandle = session.user.email.split('@')[0];
      setProfileData(prev => ({ ...prev, handle: suggestedHandle }));
    }
  }, [session, status, router, profileData.handle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/create-profile-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        router.push('/home?welcome=true');
      } else {
        const error = await response.json();
        alert(`Error creating profile: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    }
    setLoading(false);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to eng.com!</h1>
          <p className="text-xl text-gray-600">Let's set up your engineering profile</p>
          {session?.user?.email && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-sm text-green-800">
                ✅ Signed in as: <strong>{session.user.email}</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Complete the form below to create your profile
              </p>
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., Alex Johnson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username/Handle *
              </label>
              <input
                type="text"
                required
                value={profileData.handle}
                onChange={(e) => setProfileData(prev => ({ ...prev, handle: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '') }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="e.g., alexjohnson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio/Description
              </label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Tell the community about yourself and your engineering interests..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Engineering Domain *
              </label>
              <select
                required
                value={profileData.primaryDomain}
                onChange={(e) => setProfileData(prev => ({ ...prev, primaryDomain: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="mechanical">Mechanical Engineering</option>
                <option value="electrical">Electrical Engineering</option>
                <option value="software">Software Engineering</option>
                <option value="robotics">Robotics & Automation</option>
                <option value="aerospace">Aerospace Engineering</option>
                <option value="biomedical">Biomedical Engineering</option>
                <option value="civil">Civil Engineering</option>
                <option value="chemical">Chemical Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                required
                value={profileData.experienceLevel}
                onChange={(e) => setProfileData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="student">Student</option>
                <option value="entry">0-2 years</option>
                <option value="mid">3-7 years</option>
                <option value="senior">8-15 years</option>
                <option value="expert">15+ years</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-medium transition-colors ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Profile...
                </div>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}