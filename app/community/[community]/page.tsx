'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChatBubbleLeftIcon,
  PlusIcon,
  FireIcon,
  ClockIcon,
  TrophyIcon,
  UserGroupIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Community {
  id: string;
  name: string;
  display_name: string;
  description: string;
  member_count: number;
  post_count: number;
  color: string;
  category: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  post_type: string;
  community_name: string;
  author_id: string;
  tags: string[];
  difficulty_level?: string;
  upvotes: number;
  downvotes: number;
  score: number;
  comment_count: number;
  created_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  community?: {
    name: string;
    display_name: string;
    color: string;
  };
}

const POST_TYPE_FILTERS = [
  { id: 'all', name: 'All Posts', icon: '📝' },
  { id: 'question', name: 'Questions', icon: '❓' },
  { id: 'discussion', name: 'Discussions', icon: '💬' },
  { id: 'show_and_tell', name: 'Show & Tell', icon: '🎯' },
  { id: 'help', name: 'Help Needed', icon: '🆘' }
];

export default function CommunityPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const communityName = params.community as string;
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sort = searchParams.get('sort') || 'hot';
  const filter = searchParams.get('type') || 'all';

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [communityName, sort, filter]);

  const fetchCommunity = async () => {
    try {
      const response = await fetch('/api/communities');
      if (!response.ok) throw new Error('Failed to fetch communities');
      const communities = await response.json();
      const foundCommunity = communities.find((c: Community) => c.name === communityName);
      
      if (foundCommunity) {
        setCommunity(foundCommunity);
      } else {
        // Fallback to sample data
        setCommunity({
          id: '1',
          name: communityName,
          display_name: communityName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: 'Engineering community for sharing knowledge and collaboration',
          member_count: 15420,
          post_count: 892,
          color: '#3B82F6',
          category: 'engineering'
        });
      }
    } catch (error) {
      console.error('Error fetching community:', error);
      setError('Failed to load community');
    }
  };

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (sort) params.append('sort', sort);
      if (filter !== 'all') params.append('type', filter);
      
      const response = await fetch(`/api/communities/${communityName}/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to sample data
      setPosts([
        {
          id: '1',
          title: 'How to calculate bearing loads in rotating machinery?',
          content: 'I\'m working on a project involving rotating machinery and need help calculating the appropriate bearing loads for my design. The shaft rotates at 1800 RPM and carries a radial load of 500N...',
          post_type: 'question',
          community_name: communityName,
          author_id: '1',
          tags: ['bearings', 'mechanics', 'calculations'],
          difficulty_level: 'intermediate',
          upvotes: 24,
          downvotes: 2,
          score: 22,
          comment_count: 8,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: {
            id: '1',
            username: 'mech_engineer_2024'
          }
        },
        {
          id: '2',
          title: '[Show & Tell] Custom PCB for IoT Weather Station',
          content: 'Just finished designing and testing my first custom PCB for an IoT weather station project. Features include ESP32, multiple sensors, and solar charging capability...',
          post_type: 'show_and_tell',
          community_name: communityName,
          author_id: '2',
          tags: ['pcb-design', 'iot', 'weather-station'],
          upvotes: 45,
          downvotes: 1,
          score: 44,
          comment_count: 12,
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          author: {
            id: '2',
            username: 'circuit_wizard'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'current-user-id', // Replace with actual user ID
          vote_type: voteType
        }),
      });

      if (!response.ok) throw new Error('Failed to vote');
      
      const result = await response.json();
      
      // Update local state
      setPosts(posts => 
        posts.map(post => 
          post.id === postId ? result.post : post
        )
      );
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'question':
        return '❓';
      case 'show_and_tell':
        return '🎯';
      case 'discussion':
        return '💬';
      case 'help':
        return '🆘';
      default:
        return '📝';
    }
  };

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Community not found'}</p>
          <Link href="/community" className="text-blue-600 hover:text-blue-800">
            ← Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Community Header */}
      <div className="bg-white border-b border-gray-200">
        <div 
          className="h-32 bg-gradient-to-r relative"
          style={{ 
            background: `linear-gradient(135deg, ${community.color}20, ${community.color}40)` 
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 pb-6">
            <div className="flex items-end space-x-6">
              {/* Community Icon */}
              <div 
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: community.color }}
              >
                r/
              </div>
              
              {/* Community Info */}
              <div className="flex-1 min-w-0 pb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  r/{community.display_name}
                </h1>
                <p className="text-gray-600 mb-3">
                  {community.description}
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-1" />
                    {community.member_count.toLocaleString()} members
                  </span>
                  <span className="flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    {community.post_count.toLocaleString()} posts
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online: {Math.floor(community.member_count * 0.05).toLocaleString()}
                  </span>
                </div>
              </div>
              
              {/* Join Button */}
              <div className="pb-4">
                <button 
                  className="px-6 py-2 font-semibold rounded-lg transition-colors text-white"
                  style={{ backgroundColor: community.color }}
                >
                  Join Community
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <Link
                href={`/community/${communityName}/create`}
                className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <PlusIcon className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-gray-500">Create a post in r/{community.display_name}</span>
              </Link>
            </div>
            
            {/* Sort and Filter Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <Link
                      href={`/community/${communityName}?sort=hot&type=${filter}`}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        sort === 'hot' 
                          ? 'bg-orange-50 text-orange-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <FireIcon className="w-4 h-4 mr-1" />
                      Hot
                    </Link>
                    <Link
                      href={`/community/${communityName}?sort=new&type=${filter}`}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        sort === 'new' 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <ClockIcon className="w-4 h-4 mr-1" />
                      New
                    </Link>
                    <Link
                      href={`/community/${communityName}?sort=top&type=${filter}`}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        sort === 'top' 
                          ? 'bg-purple-50 text-purple-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <TrophyIcon className="w-4 h-4 mr-1" />
                      Top
                    </Link>
                  </div>
                  
                  {/* Post Type Filter */}
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="w-4 h-4 text-gray-500" />
                    <select
                      value={filter}
                      onChange={(e) => {
                        const newFilter = e.target.value;
                        window.location.href = `/community/${communityName}?sort=${sort}&type=${newFilter}`;
                      }}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {POST_TYPE_FILTERS.map((filterOption) => (
                        <option key={filterOption.id} value={filterOption.id}>
                          {filterOption.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Posts */}
              <div className="divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No posts found. Be the first to post in this community!</p>
                    <Link
                      href={`/community/${communityName}/create`}
                      className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Post
                    </Link>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex space-x-3">
                        {/* Voting */}
                        <div className="flex flex-col items-center space-y-1">
                          <button 
                            onClick={() => handleVote(post.id, 'up')}
                            className="p-1 hover:bg-orange-100 rounded transition"
                          >
                            <ChevronUpIcon className="h-5 w-5 text-gray-600 hover:text-orange-600" />
                          </button>
                          <span className="text-sm font-medium text-gray-900">
                            {post.score}
                          </span>
                          <button 
                            onClick={() => handleVote(post.id, 'down')}
                            className="p-1 hover:bg-orange-100 rounded transition"
                          >
                            <ChevronDownIcon className="h-5 w-5 text-gray-600 hover:text-orange-600" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">{getPostTypeIcon(post.post_type)}</span>
                            <span className="text-sm text-gray-500">
                              u/{post.author?.username} • {formatTimeAgo(post.created_at)}
                            </span>
                            {post.difficulty_level && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(post.difficulty_level)}`}>
                                  {post.difficulty_level}
                                </span>
                              </>
                            )}
                          </div>

                          <Link
                            href={`/community/${communityName}/posts/${post.id}`}
                            className="block group"
                          >
                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 mt-1 line-clamp-2">
                              {post.content}
                            </p>
                          </Link>

                          <div className="flex items-center space-x-4 mt-3">
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition">
                              <ChatBubbleLeftIcon className="h-4 w-4" />
                              <span className="text-sm">{post.comment_count} comments</span>
                            </button>
                            
                            <div className="flex space-x-2">
                              {post.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">About Community</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{community.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Members</span>
                    <span className="font-medium">{community.member_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Posts</span>
                    <span className="font-medium">{community.post_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Online</span>
                    <span className="font-medium text-green-600">
                      {Math.floor(community.member_count * 0.05).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Rules */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Community Rules</h3>
              </div>
              <div className="p-4 space-y-3 text-sm text-gray-600">
                <div className="flex space-x-2">
                  <span className="font-medium text-gray-900">1.</span>
                  <span>Be respectful and professional</span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-medium text-gray-900">2.</span>
                  <span>Stay on topic and relevant to the community</span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-medium text-gray-900">3.</span>
                  <span>Search before posting duplicates</span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-medium text-gray-900">4.</span>
                  <span>Include relevant details and context</span>
                </div>
                <div className="flex space-x-2">
                  <span className="font-medium text-gray-900">5.</span>
                  <span>Use appropriate tags and categories</span>
                </div>
              </div>
            </div>

            {/* Moderators */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Moderators</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">u/mod_engineer</p>
                    <p className="text-xs text-gray-500">Community Moderator</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">u/admin_tech</p>
                    <p className="text-xs text-gray-500">Admin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 