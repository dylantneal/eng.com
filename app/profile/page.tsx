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
  AcademicCapIcon
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

const TAB_OPTIONS = [
  { key: 'overview', label: 'Overview', icon: ChartBarIcon },
  { key: 'saved', label: 'Saved Posts', icon: BookmarkIcon },
  { key: 'communities', label: 'Communities', icon: UserGroupIcon },
  { key: 'settings', label: 'Settings', icon: CogIcon }
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
        setSavedPosts(savedPostsResult.posts as SavedPostData[]);
      }

      if (communitiesResult.communities) {
        setUserCommunities(communitiesResult.communities as CommunityData[]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
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

  const getPostTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'showcase': '🚀',
      'question': '❓',
      'discussion': '💬', 
      'news': '📰',
      'research': '🔬',
      'tutorial': '📚'
    };
    return iconMap[type] || '📝';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.username ? user.username.charAt(0).toUpperCase() : '?'}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.display_name || user.username || 'User'}
                </h1>
                {user.is_verified && (
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                    Verified
                  </div>
                )}
                {user.is_pro && (
                  <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                    Pro
                  </div>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-1">u/{user.username || 'unknown'}</p>
              
              {user.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-3">{user.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {user.engineering_discipline && (
                  <div className="flex items-center space-x-1">
                    <AcademicCapIcon className="w-4 h-4" />
                    <span>{user.engineering_discipline}</span>
                  </div>
                )}
                
                {user.company && (
                  <div className="flex items-center space-x-1">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{user.company}</span>
                  </div>
                )}

                {user.job_title && (
                  <div className="flex items-center space-x-1">
                    <span>{user.job_title}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>Joined {user.created_at ? formatTimeAgo(user.created_at) : 'recently'}</span>
                </div>
              </div>
            </div>

            {/* Karma Stats */}
            <div className="text-right">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {(user.post_karma || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Post Karma</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FireIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {(user.comment_karma || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Comment Karma</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {TAB_OPTIONS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Activity Summary
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {savedPosts.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Saved Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {userCommunities.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Communities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Account Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Member since:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatTimeAgo(user.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last active:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatTimeAgo(user.last_active)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Experience:</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {user.experience_level || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600 dark:text-gray-400">Loading saved posts...</div>
              </div>
            ) : savedPosts.length === 0 ? (
              <div className="text-center py-8">
                <BookmarkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No saved posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Posts you save will appear here for easy reference later.
                </p>
              </div>
            ) : (
              savedPosts.map((savedPost) => (
                <div
                  key={savedPost.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Link
                          href={`/community/${savedPost.post.community.name}`}
                          className="flex items-center space-x-1 hover:underline"
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: savedPost.post.community.color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            r/{savedPost.post.community.display_name}
                          </span>
                        </Link>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          by u/{savedPost.post.author.username}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(savedPost.post.created_at)}
                        </span>
                        <span className="text-xs">
                          {getPostTypeIcon(savedPost.post.post_type)}
                        </span>
                      </div>

                      <Link
                        href={`/community/${savedPost.post.community.name}/posts/${savedPost.post.id}`}
                        className="block group"
                      >
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                          {savedPost.post.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-3">
                          {savedPost.post.content}
                        </p>
                      </Link>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <TrophyIcon className="w-4 h-4 mr-1" />
                          {savedPost.post.vote_count} points
                        </span>
                        <span className="flex items-center">
                          💬 {savedPost.post.comment_count} comments
                        </span>
                        <span className="text-xs text-gray-400">
                          Saved {formatTimeAgo(savedPost.saved_at)}
                        </span>
                      </div>

                      {savedPost.post.tags && savedPost.post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {savedPost.post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'communities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-600 dark:text-gray-400">Loading communities...</div>
              </div>
            ) : userCommunities.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No communities joined yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Join engineering communities to connect with peers and share knowledge.
                </p>
                <Link
                  href="/community"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Communities
                </Link>
              </div>
            ) : (
              userCommunities.map((membership) => (
                <div
                  key={membership.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <Link
                    href={`/community/${membership.community.name}`}
                    className="block group"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full"
                        style={{ backgroundColor: membership.community.color }}
                      ></div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          r/{membership.community.display_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {membership.community.member_count.toLocaleString()} members
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {membership.community.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Joined {formatTimeAgo(membership.joined_at)}</span>
                      <span className="capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {membership.role}
                      </span>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Account Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={user.display_name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Privacy & Notifications
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={user.preferences?.email_notifications}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      readOnly
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Email notifications
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={user.preferences?.public_profile}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      readOnly
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Public profile
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Settings are currently read-only. Full profile editing will be available soon.
                </p>
                <button
                  disabled
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                >
                  <PencilIcon className="w-4 h-4 inline mr-2" />
                  Edit Profile (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 