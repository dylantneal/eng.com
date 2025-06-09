import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { authOptions } from '@/lib/auth';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/signin?redirect=/settings');
  }

  const supabase = await createClient();
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle, bio, avatar_url, plan')
    .eq('id', session.user.id)
    .single();

  const settingsItems = [
    {
      title: 'Account',
      description: 'Manage your profile, handle, and basic account settings',
      href: '/settings/account',
      icon: '👤',
    },
    {
      title: 'Billing',
      description: 'View your subscription, billing history, and payment methods',
      href: '/settings/billing',
      icon: '💳',
    },
    {
      title: 'Notifications',
      description: 'Configure email notifications and alert preferences',
      href: '/settings/notifications',
      icon: '🔔',
    },
    {
      title: 'Developer',
      description: 'API keys, webhooks, and developer tools',
      href: '/settings/developer',
      icon: '⚙️',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and configuration
          </p>
        </div>

        {/* Quick Profile Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                session.user.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.handle ? `@${profile.handle}` : session.user.name}
              </h2>
              <p className="text-gray-600">
                {profile?.bio || 'No bio set yet'}
              </p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                profile?.plan === 'PRO' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {profile?.plan || 'FREE'} Plan
              </span>
            </div>
            <Link
              href="/settings/account"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg group-hover:bg-blue-100 transition-colors">
                    {item.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ⚡ New Project
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              💎 Upgrade to Pro
            </Link>
            <Link
              href={`/u/${profile?.handle || 'profile'}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              👀 View Public Profile
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            Danger Zone
          </h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-700 mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <ul className="text-xs text-red-600 mt-2 list-disc list-inside space-y-1">
                  <li>Your profile and all personal information will be deleted</li>
                  <li>All your projects and files will be permanently removed</li>
                  <li>Your username will become available for others to use</li>
                  <li>You will be immediately signed out</li>
                </ul>
              </div>
              <Link
                href="/settings/delete-account"
                className="ml-4 inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 