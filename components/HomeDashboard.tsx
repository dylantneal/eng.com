'use client';

import Link from 'next/link';

interface HomeDashboardProps {
  user: {
    name: string;
    email: string;
    avatar: string | null;
    handle: string | null;
  };
  stats: {
    projectCount: number;
    activityCount: number;
    plan: string;
    memberSince?: string | null;
  };
}

export default function HomeDashboard({ user, stats }: HomeDashboardProps) {
  const formatMemberSince = (dateString?: string | null) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const quickActions = [
    {
      title: 'New Project',
      href: '/projects/new',
      icon: '🚀',
      description: 'Share your latest work',
      color: 'bg-blue-500'
    },
    {
      title: 'My Projects',
      href: '/dashboard',
      icon: '📁',
      description: 'Manage your projects',
      color: 'bg-green-500'
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: '⚙️',
      description: 'Account & preferences',
      color: 'bg-gray-500'
    },
    {
      title: 'Upgrade',
      href: '/pricing',
      icon: '💎',
      description: 'Get Pro features',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {user.name}
            </h3>
            <p className="text-sm text-gray-600">
              {user.handle ? `@${user.handle}` : user.email}
            </p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
              stats.plan === 'PRO' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {stats.plan} Plan
            </span>
          </div>
        </div>
        
        <Link
          href={`/u/${user.handle || 'profile'}`}
          className="block w-full text-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
        >
          View Public Profile
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Your Stats</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">🔧</span>
              </div>
              <span className="text-sm text-gray-700">Projects</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.projectCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">💬</span>
              </div>
              <span className="text-sm text-gray-700">Activity</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.activityCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-sm">📅</span>
              </div>
              <span className="text-sm text-gray-700">Member for</span>
            </div>
            <span className="font-semibold text-gray-900">{formatMemberSince(stats.memberSince)}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
        
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-xs font-medium text-gray-900 group-hover:text-blue-600">
                  {action.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {action.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Plan Upgrade Banner (if FREE) */}
      {stats.plan !== 'PRO' && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <div className="text-center">
            <div className="text-3xl mb-2">💎</div>
            <h4 className="font-semibold mb-1">Upgrade to Pro</h4>
            <p className="text-sm text-purple-100 mb-4">
              Unlimited private projects, 1GB storage, and priority support
            </p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 bg-white text-purple-600 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 