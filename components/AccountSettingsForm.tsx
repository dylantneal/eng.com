'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface Profile {
  handle?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  plan?: string | null;
  created_at?: string | null;
}

interface AccountSettingsFormProps {
  user: User;
  profile: Profile | null;
}

export default function AccountSettingsForm({ user, profile }: AccountSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    handle: profile?.handle || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || user.image || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.refresh();
        alert('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatMemberSince = (dateString?: string | null) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
      {/* Profile Photo Section */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Profile Picture</h4>
            <p className="text-sm text-gray-500 mb-3">
              This will be displayed on your profile and projects
            </p>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
              placeholder="Enter image URL"
              className="w-64 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username/Handle
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">@</span>
              <input
                type="text"
                value={formData.handle}
                onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="username"
                pattern="[a-z0-9_]+"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Only lowercase letters, numbers, and underscores
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell others about yourself and your engineering interests..."
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/200 characters
            </p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900">Plan</div>
            <div className={`text-lg font-semibold mt-1 ${
              profile?.plan === 'PRO' ? 'text-purple-600' : 'text-gray-600'
            }`}>
              {profile?.plan || 'FREE'}
            </div>
            {profile?.plan !== 'PRO' && (
              <a
                href="/pricing"
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
              >
                Upgrade to Pro →
              </a>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900">Member Since</div>
            <div className="text-lg font-semibold text-gray-600 mt-1">
              {formatMemberSince(profile?.created_at)}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900">User ID</div>
            <div className="text-sm text-gray-600 mt-1 font-mono">
              {user.id.substring(0, 8)}...
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/settings')}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>

          <div className="flex space-x-3">
            <a
              href={`/u/${formData.handle || 'profile'}`}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              View Public Profile
            </a>
          </div>
        </div>
      </div>
    </form>
  );
} 