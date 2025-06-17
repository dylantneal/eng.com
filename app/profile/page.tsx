'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookmarkIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  TrophyIcon,
  PencilIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  EyeIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  FolderIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  KeyIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUserSavedPosts, getUserCommunities } from '@/lib/auth';

interface SavedPostData {
  id: string;
  saved_at: string;
  post: {
    id: string;
    title: string;
    content: string;
    vote_count: number;
    comment_count: number;
    created_at: string;
    post_type: string;
    tags: string[];
    community: {
      name: string;
      display_name: string;
      color: string;
    };
    author: {
      username: string;
      avatar_url?: string;
    };
  };
}

interface CommunityData {
  id: string;
  joined_at: string;
  role: string;
  community: {
    id: string;
    name: string;
    display_name: string;
    description: string;
    color: string;
    member_count: number;
    post_count: number;
  };
}

const DASHBOARD_TABS = [
  { key: 'overview', label: 'Overview', icon: ChartBarIcon },
  { key: 'account', label: 'Account', icon: UserIcon },
  { key: 'security', label: 'Security', icon: ShieldCheckIcon },
  { key: 'notifications', label: 'Notifications', icon: BellIcon },
  { key: 'projects', label: 'My Projects', icon: FolderIcon },
  { key: 'products', label: 'My Products', icon: ShoppingBagIcon },
  { key: 'purchases', label: 'Purchases', icon: CreditCardIcon },
  { key: 'analytics', label: 'Analytics', icon: ChartBarIcon },
  { key: 'billing', label: 'Billing', icon: CreditCardIcon },
  { key: 'developer', label: 'Developer', icon: CodeBracketIcon }
];

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [savedPosts, setSavedPosts] = useState<SavedPostData[]>([]);
  const [userCommunities, setUserCommunities] = useState<CommunityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [savedPostsResult, communitiesResult] = await Promise.all([
        getUserSavedPosts(user.id),
        getUserCommunities(user.id)
      ]);

      if (savedPostsResult.posts) {
        setSavedPosts(savedPostsResult.posts as any);
      }

      if (communitiesResult.communities) {
        setUserCommunities(communitiesResult.communities as any);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y ago`;
  };

  // Mock data for demonstration
  const mockStats = {
    projects: 5,
    views: 12847,
    downloads: 3421,
    earnings: 89.50,
    followers: 234
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iMiIvPjxjaXJjbGUgY3g9IjI3IiBjeT0iNyIgcj0iMiIvPjxjaXJjbGUgY3g9IjQ3IiBjeT0iNyIgcj0iMiIvPjxjaXJjbGUgY3g9IjciIGN5PSIyNyIgcj0iMiIvPjxjaXJjbGUgY3g9IjI3IiBjeT0iMjciIHI9IjIiLz48Y2lyY2xlIGN4PSI0NyIgY3k9IjI3IiByPSIyIi8+PGNpcmNsZSBjeD0iNyIgY3k9IjQ3IiByPSIyIi8+PGNpcmNsZSBjeD0iMjciIGN5PSI0NyIgcj0iMiIvPjxjaXJjbGUgY3g9IjQ3IiBjeT0iNDciIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30">
                {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  Welcome back, {user.display_name || user.username || 'User'}
                </h1>
                <p className="text-white/80 mb-2">Your engineering command center</p>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span>@{user.username || 'user'}</span>
                  <span>•</span>
                                     <span>Member since {formatTimeAgo((user as any)?.created_at)}</span>
                   {(user as any)?.is_pro && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-1 bg-yellow-500/20 rounded-full text-yellow-200 text-xs font-medium">
                        Pro Member
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Link
                href={`/u/${user.username || 'user'}`}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all border border-white/30"
              >
                <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                View Public Profile
              </Link>
              <Link
                href="/projects/new"
                className="px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-medium transition-all shadow-lg"
              >
                <PlusIcon className="w-4 h-4 inline mr-2" />
                New Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4 overflow-x-auto">
            {DASHBOARD_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                    <FolderIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{mockStats.projects}</div>
                </div>
                <div className="text-gray-900 font-semibold">Projects</div>
                <div className="text-sm text-gray-600 mt-1">Your engineering portfolio</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{mockStats.views.toLocaleString()}</div>
                </div>
                <div className="text-gray-900 font-semibold">Views</div>
                <div className="text-sm text-gray-600 mt-1">Community engagement</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                    <ArrowDownTrayIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{mockStats.downloads.toLocaleString()}</div>
                </div>
                <div className="text-gray-900 font-semibold">Downloads</div>
                <div className="text-sm text-gray-600 mt-1">Project downloads</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl group-hover:scale-110 transition-transform">
                    <TrophyIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">${mockStats.earnings}</div>
                </div>
                <div className="text-gray-900 font-semibold">Earnings</div>
                <div className="text-sm text-gray-600 mt-1">This month</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 group hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">{mockStats.followers}</div>
                </div>
                <div className="text-gray-900 font-semibold">Followers</div>
                <div className="text-sm text-gray-600 mt-1">Growing community</div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FireIcon className="w-6 h-6 text-orange-600" />
                  Quick Actions
                </h3>
                
                <div className="space-y-4">
                  {[
                    { href: '/projects/new', icon: PlusIcon, label: 'Create New Project', desc: 'Start your next engineering project', color: 'blue' },
                    { href: '/marketplace/sell', icon: ShoppingBagIcon, label: 'List Product', desc: 'Monetize your expertise', color: 'green' },
                    { href: '/community', icon: UserGroupIcon, label: 'Join Discussion', desc: 'Engage with the community', color: 'purple' },
                    { href: '/settings', icon: CogIcon, label: 'Account Settings', desc: 'Manage your profile', color: 'gray' }
                  ].map((action, index) => {
                    const Icon = action.icon;
                    const colorClasses = {
                      blue: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
                      green: 'from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700',
                      purple: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
                      gray: 'from-gray-500 to-gray-600 group-hover:from-gray-600 group-hover:to-gray-700'
                    }[action.color];
                    
                    return (
                      <Link
                        key={index}
                        href={action.href}
                        className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                      >
                        <div className={`p-3 bg-gradient-to-br ${colorClasses} rounded-xl transition-all group-hover:scale-110`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{action.label}</div>
                          <div className="text-sm text-gray-600">{action.desc}</div>
                        </div>
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                  Recent Activity
                </h3>
                
                <div className="space-y-4">
                  {[
                    { type: 'project', action: 'Created', target: 'Arduino Weather Station', time: '2h ago', icon: FolderIcon },
                    { type: 'comment', action: 'Commented on', target: 'PCB Design Best Practices', time: '4h ago', icon: DocumentTextIcon },
                    { type: 'follow', action: 'Gained follower', target: '@engineergirl', time: '1d ago', icon: UserGroupIcon },
                    { type: 'sale', action: 'Sold', target: '3D Printed Drone Frame', time: '2d ago', icon: ShoppingBagIcon }
                  ].map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.action}</span>{' '}
                            <span className="text-blue-600 hover:text-blue-700 cursor-pointer">{activity.target}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Overview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                  Performance
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Profile Views</span>
                      <span className="text-sm text-gray-600">+23% this week</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Downloads</span>
                      <span className="text-sm text-gray-600">+45% this month</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Community Engagement</span>
                      <span className="text-sm text-gray-600">+12% this week</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <UserIcon className="w-7 h-7 text-blue-600" />
              Account Settings
            </h2>
            
            <div className="space-y-8">
              {/* Profile Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user.display_name || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue={user.username || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="your-username"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      defaultValue={user.bio || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Tell the engineering community about yourself..."
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engineering Discipline
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                      <option value="">Select discipline...</option>
                      <option value="mechanical">Mechanical Engineering</option>
                      <option value="electrical">Electrical Engineering</option>
                      <option value="software">Software Engineering</option>
                      <option value="civil">Civil Engineering</option>
                      <option value="aerospace">Aerospace Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                      <option value="">Select level...</option>
                      <option value="student">Student</option>
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (3-7 years)</option>
                      <option value="senior">Senior Level (8+ years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      defaultValue={user.company || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Your company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      defaultValue={user.job_title || ''}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder="Your job title"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
        {activeTab !== 'overview' && activeTab !== 'account' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CogIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {DASHBOARD_TABS.find(tab => tab.key === activeTab)?.label} Settings
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                This section is under development. Advanced {activeTab} features coming soon!
              </p>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                Create Project Instead
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 