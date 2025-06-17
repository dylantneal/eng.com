'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';
import { 
  HeartIcon, 
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ArrowUturnLeftIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Comment {
  id: string;
  user_id: string;
  body?: string;
  content_md?: string;
  parent_id?: string;
  upvotes: number;
  created_at: string;
  author?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  user_vote?: boolean;
  replies?: Comment[];
  depth?: number;
}

interface EnhancedCommentsProps {
  projectId: string;
  canComment?: boolean;
}

export default function EnhancedComments({ projectId, canComment = true }: EnhancedCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_upvoted'>('newest');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadComments();
    setupRealTimeSubscription();
    return () => {
      supabase.removeAllChannels();
    };
  }, [projectId, sortBy]);

  const loadComments = async () => {
    try {
      setLoading(true);
      
      // Get comments with basic info
      const orderColumn = sortBy === 'most_upvoted' ? 'upvotes' : 'created_at';
      const ascending = sortBy === 'oldest';
      
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', projectId)
        .order(orderColumn, { ascending })
        .limit(100);

      if (error) throw error;

      if (commentsData && commentsData.length > 0) {
        // Get author information
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: authors } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', userIds);

        const authorsMap = new Map(authors?.map(author => [author.id, author]) || []);

        // Get user votes if authenticated
        let userVotes: Record<string, boolean> = {};
        if (session?.user?.id && commentsData.length > 0) {
          const commentIds = commentsData.map(c => c.id).filter(Boolean);
          if (commentIds.length > 0) {
            const { data: votes } = await supabase
              .from('comment_votes')
              .select('comment_id')
              .eq('user_id', session.user.id)
              .in('comment_id', commentIds);

            if (votes && Array.isArray(votes)) {
              userVotes = votes.reduce((acc, vote) => {
                if (vote && vote.comment_id) {
                  acc[vote.comment_id] = true;
                }
                return acc;
              }, {} as Record<string, boolean>);
            }
          }
        }

        // Process comments
        const processedComments = commentsData
          .filter(comment => comment && typeof comment === 'object')
          .map(comment => {
            const author = authorsMap.get(comment.user_id);
            return {
              id: comment.id || Math.random().toString(36),
              user_id: comment.user_id || 'unknown',
              body: comment.body || comment.content_md || comment.content || '',
              parent_id: comment.parent_id || null,
              upvotes: Number(comment.upvotes) || 0,
              created_at: comment.created_at || new Date().toISOString(),
              author: author ? {
                username: author.username || 'Unknown',
                display_name: author.display_name || 'Unknown User',
                avatar_url: author.avatar_url || null
              } : {
                username: 'unknown',
                display_name: 'Unknown User',
                avatar_url: null
              },
              user_vote: Boolean(userVotes[comment.id]),
              replies: [],
              depth: 0
            } as Comment;
          });

        // Build threaded structure
        const threadedComments = buildThreads(processedComments);
        setComments(threadedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    const channel = supabase
      .channel(`project_comments:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          loadComments(); // Reload comments when new ones are added
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const buildThreads = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // Create map of all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build hierarchy
    flatComments.forEach(comment => {
      const commentNode = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          commentNode.depth = (parent.depth || 0) + 1;
          parent.replies!.push(commentNode);
        } else {
          rootComments.push(commentNode);
        }
      } else {
        rootComments.push(commentNode);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !session?.user?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          user_id: session.user.id,
          body: newComment.trim(),
          content_md: newComment.trim(), // For compatibility
          upvotes: 0
        });

      if (error) throw error;

      setNewComment('');
      loadComments(); // Reload to show new comment
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !session?.user?.id || !replyingTo) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          user_id: session.user.id,
          body: replyText.trim(),
          content_md: replyText.trim(),
          parent_id: replyingTo,
          upvotes: 0
        });

      if (error) throw error;

      setReplyText('');
      setReplyingTo(null);
      loadComments(); // Reload to show new reply
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, currentVote: boolean) => {
    if (!session?.user?.id) return;

    try {
      const action = currentVote ? 'remove' : 'upvote';
      
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to vote');
      }

      // Reload comments to update vote counts
      loadComments();
    } catch (error) {
      console.error('Error voting on comment:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment) => {
    const isReplying = replyingTo === comment.id;
    const maxDepth = 5;
    const indentLevel = Math.min(comment.depth || 0, maxDepth);
    
    return (
      <div key={comment.id} className={`${indentLevel > 0 ? 'ml-6 border-l border-gray-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
          {/* Comment Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {comment.author?.avatar_url ? (
                  <img
                    src={comment.author.avatar_url}
                    alt={comment.author.display_name}
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {comment.author?.display_name || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500">
                  @{comment.author?.username || 'unknown'} • {formatTimeAgo(comment.created_at)}
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Comment Body */}
          <div className="mb-3">
            <p className="text-gray-700 whitespace-pre-wrap">{comment.body}</p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleVote(comment.id, comment.user_vote || false)}
              className={`flex items-center space-x-1 text-sm ${
                comment.user_vote 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-500 hover:text-red-600'
              } transition-colors`}
              disabled={!session?.user?.id}
            >
              {comment.user_vote ? (
                <HeartIconSolid className="w-4 h-4" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>{comment.upvotes}</span>
            </button>

            {canComment && session?.user?.id && (
              <button
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <textarea
                ref={replyTextareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || submitting}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {comment.replies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Comments</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Sort Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">
            Comments ({comments.reduce((count, comment) => {
              const countReplies = (c: Comment): number => 
                1 + (c.replies?.reduce((sum, reply) => sum + countReplies(reply), 0) || 0);
              return count + countReplies(comment);
            }, 0)})
          </h3>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most_upvoted">Most Upvoted</option>
        </select>
      </div>

      {/* New Comment Form */}
      {canComment && session?.user?.id && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts, ask a question, or provide feedback..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No comments yet</h4>
          <p className="text-gray-500 mb-4">Be the first to share your thoughts on this project!</p>
          {canComment && session?.user?.id && (
            <button
              onClick={() => textareaRef.current?.focus()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Write a Comment
            </button>
          )}
        </div>
      )}

      {!session?.user?.id && (
        <div className="text-center py-6 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 mb-3">Sign in to join the discussion</p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
} 