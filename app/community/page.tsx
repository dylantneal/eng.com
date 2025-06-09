'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronUpIcon, ChevronDownIcon, ChatBubbleLeftIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { voteOnPost, savePost, unsavePost, joinCommunity, leaveCommunity, isUserMemberOfCommunity } from '@/lib/auth';

interface Community {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  color: string;
  member_count: number;
  post_count: number;
  created_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  community_id: string;
  community_name: string;
  community_display_name: string;
  community_color: string;
  user_id: string;
  username: string;
  user_avatar: string;
  vote_count: number;
  comment_count: number;
  created_at: string;
  post_type: string;
  tags: string[];
  images: string[];
  is_pinned: boolean;
  user_vote: number | null;
}

export default function CommunityPage() {
  const { user, requireAuth } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top' | 'personalized'>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [userMemberships, setUserMemberships] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch communities
        const communitiesResponse = await fetch('/api/communities');
        if (!communitiesResponse.ok) {
          throw new Error(`Communities API failed: ${communitiesResponse.status}`);
        }
        const communitiesData = await communitiesResponse.json();
        
        // Validate communities data
        if (!Array.isArray(communitiesData)) {
          throw new Error('Invalid communities data format');
        }
        setCommunities(communitiesData.filter(c => c && c.display_name && c.description));

        // Fetch posts
        const postsUrl = selectedCommunity 
          ? `/api/posts?community=${selectedCommunity}&sort=${sortBy}`
          : `/api/posts?sort=${sortBy}`;
        const postsResponse = await fetch(postsUrl);
        if (!postsResponse.ok) {
          throw new Error(`Posts API failed: ${postsResponse.status}`);
        }
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCommunity, sortBy]);

  useEffect(() => {
    if (user && communities.length > 0) {
      loadUserMemberships();
    }
  }, [user, communities]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getPostTypeIcon = (type: string) => {
    const iconMap = {
      showcase: '🎯',
      question: '❓',
      discussion: '💬',
      news: '📰',
      research: '🔬',
      project: '🚀',
      review: '📝',
      advice: '💡',
      'case-study': '📊'
    };
    return iconMap[type as keyof typeof iconMap] || '💬';
  };

  const handleVote = async (postId: string, voteType: 'upvote' | 'downvote') => {
    requireAuth(async () => {
      if (!user) return;
      
      try {
        const { success, error } = await voteOnPost(user.id, postId, voteType);
        if (success) {
          // Update the local state
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === postId) {
                let newVoteCount = post.vote_count;
                let newUserVote = post.user_vote;

                if (post.user_vote === null) {
                  // New vote
                  newVoteCount += voteType === 'upvote' ? 1 : -1;
                  newUserVote = voteType === 'upvote' ? 1 : -1;
                } else if ((post.user_vote === 1 && voteType === 'upvote') || 
                          (post.user_vote === -1 && voteType === 'downvote')) {
                  // Remove vote (toggle)
                  newVoteCount -= post.user_vote;
                  newUserVote = null;
                } else {
                  // Change vote
                  newVoteCount += voteType === 'upvote' ? 2 : -2;
                  newUserVote = voteType === 'upvote' ? 1 : -1;
                }

                return { ...post, vote_count: newVoteCount, user_vote: newUserVote };
              }
              return post;
            })
          );
        } else {
          console.error('Vote failed:', error);
        }
      } catch (error) {
        console.error('Error voting:', error);
      }
    });
  };

  const handleSave = async (postId: string, communityId: string, tags: string[]) => {
    requireAuth(async () => {
      if (!user) return;
      
      try {
        const { success, error } = await savePost(user.id, postId, communityId, tags);
        if (success) {
          // Could show a toast notification here
          console.log('Post saved successfully');
        } else {
          console.error('Save failed:', error);
        }
      } catch (error) {
        console.error('Error saving post:', error);
      }
    });
  };

  const loadUserMemberships = async () => {
    if (!user) return;
    
    try {
      const memberships = new Set<string>();
      // Load user's joined communities from their profile or check each one
      for (const community of communities) {
        const isMember = await isUserMemberOfCommunity(user.id, community.id);
        if (isMember) {
          memberships.add(community.id);
        }
      }
      setUserMemberships(memberships);
    } catch (error) {
      console.error('Error loading user memberships:', error);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    requireAuth(async () => {
      if (!user) return;
      
      try {
        const { success, error } = await joinCommunity(user.id, communityId);
        if (success) {
          setUserMemberships(prev => new Set([...prev, communityId]));
          console.log('Joined community successfully');
        } else {
          console.error('Join failed:', error);
        }
      } catch (error) {
        console.error('Error joining community:', error);
      }
    });
  };

  const handleLeaveCommunity = async (communityId: string) => {
    requireAuth(async () => {
      if (!user) return;
      
      try {
        const { success, error } = await leaveCommunity(user.id, communityId);
        if (success) {
          setUserMemberships(prev => {
            const newSet = new Set(prev);
            newSet.delete(communityId);
            return newSet;
          });
          console.log('Left community successfully');
        } else {
          console.error('Leave failed:', error);
        }
      } catch (error) {
        console.error('Error leaving community:', error);
      }
    });
  };

  // Filter communities based on search
  const filteredCommunities = communities.filter(community =>
    community && 
    community.display_name && 
    community.description && (
      community.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Group communities by category
  const groupedCommunities = filteredCommunities.reduce((acc, community) => {
    const category = community.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(community);
    return acc;
  }, {} as Record<string, Community[]>);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">Engineering Communities</h1>
          <p className="text-xl text-blue-100">
            Connect with engineers worldwide. Share knowledge, ask questions, and collaborate on projects.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Communities List */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-gray-800 rounded-lg p-4 sticky top-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !selectedCommunity 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  🏠 All Communities
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedCommunities).map(([category, categoryCommunitites]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                      {category.replace('-', ' ')}
                    </h3>
                    {categoryCommunitites.map((community) => (
                      <div key={community.id} className="space-y-2">
                        <button
                          onClick={() => setSelectedCommunity(community.id)}
                          className={`w-full text-left p-2 rounded-lg transition-colors ${
                            selectedCommunity === community.id
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: community.color }}
                            >
                              {community.display_name?.[0] || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {community.display_name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatNumber(community.member_count)} members
                              </div>
                            </div>
                          </div>
                        </button>
                        
                        {user && (
                          <div className="px-2">
                            {userMemberships.has(community.id) ? (
                              <button
                                onClick={() => handleLeaveCommunity(community.id)}
                                className="w-full text-xs px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                              >
                                Leave
                              </button>
                            ) : (
                              <button
                                onClick={() => handleJoinCommunity(community.id)}
                                className="w-full text-xs px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                              >
                                Join
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="flex-1">
            {/* Feed Controls */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {selectedCommunity 
                    ? communities.find(c => c.id === selectedCommunity)?.display_name 
                    : 'All Communities'}
                </h2>
                <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
                  {(['hot', 'new', 'top', 'personalized'] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        sortBy === sort
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {sort === 'personalized' ? '🎯 For You' : sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            {error ? (
              <div className="text-center py-12">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-red-400 font-medium mb-2">Error loading content</p>
                  <p className="text-red-300 text-sm mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-2">Loading posts...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                    <div className="flex">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center p-4 bg-gray-800 rounded-l-lg">
                        <button 
                          onClick={() => handleVote(post.id, 'upvote')}
                          className={`p-1 rounded transition-colors ${
                            post.user_vote === 1 
                              ? 'text-orange-500 bg-orange-500/20' 
                              : 'text-gray-400 hover:text-orange-500 hover:bg-gray-700'
                          }`}
                        >
                          <ChevronUpIcon className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold text-gray-300 my-1">
                          {formatNumber(post.vote_count)}
                        </span>
                        <button 
                          onClick={() => handleVote(post.id, 'downvote')}
                          className={`p-1 rounded transition-colors ${
                            post.user_vote === -1 
                              ? 'text-blue-500 bg-blue-500/20' 
                              : 'text-gray-400 hover:text-blue-500 hover:bg-gray-700'
                          }`}
                        >
                          <ChevronDownIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="flex-1 p-4">
                        {/* Post Header */}
                        <div className="flex items-center space-x-2 mb-2">
                          <Link 
                            href={`/community/${post.community_name}`}
                            className="flex items-center space-x-1 hover:underline"
                          >
                            <div 
                              className="w-5 h-5 rounded-full"
                              style={{ backgroundColor: post.community_color }}
                            ></div>
                            <span className="text-sm font-medium text-white">
                              r/{post.community_display_name}
                            </span>
                          </Link>
                          <span className="text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            Posted by u/{post.username} {formatTimeAgo(post.created_at)}
                          </span>
                          {post.is_pinned && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              Pinned
                            </span>
                          )}
                          <span className="text-xs">
                            {getPostTypeIcon(post.post_type)}
                          </span>
                        </div>

                        {/* Post Title */}
                        <Link 
                          href={`/community/${post.community_name}/posts/${post.id}`}
                          className="block"
                        >
                          <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400 cursor-pointer transition-colors">
                            {post.title}
                          </h3>
                        </Link>

                        {/* Post Content Preview */}
                        <Link 
                          href={`/community/${post.community_name}/posts/${post.id}`}
                          className="block"
                        >
                          <p className="text-gray-300 text-sm mb-3 line-clamp-3 hover:text-gray-200 transition-colors">
                            {post.content}
                          </p>
                        </Link>

                        {/* Post Image */}
                        {post.images.length > 0 && (
                          <div className="mb-3">
                            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                              <Image
                                src={post.images[0]}
                                alt="Post image"
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-gray-400 text-xs">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center space-x-4 text-gray-400 text-sm">
                          <button className="flex items-center space-x-1 hover:text-white transition-colors">
                            <ChatBubbleLeftIcon className="w-4 h-4" />
                            <span>{post.comment_count} comments</span>
                          </button>
                          <button className="flex items-center space-x-1 hover:text-white transition-colors">
                            <ShareIcon className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                          <button 
                            onClick={() => handleSave(post.id, post.community_id, post.tags)}
                            className="flex items-center space-x-1 hover:text-white transition-colors"
                          >
                            <BookmarkIcon className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {posts.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No posts found for this community.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 