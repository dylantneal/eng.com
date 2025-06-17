'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityActions } from '@/app/hooks/useCommunityActions';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  FlagIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon as ArrowUpSolidIcon, 
  ArrowDownIcon as ArrowDownSolidIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/solid';

interface PostPageProps {
  params: Promise<{
    community: string
    postId: string
  }>
}

interface PostData {
  id: string;
  title: string;
  body: string;
  community_name: string;
  community_display_name: string;
  community_color: string;
  author_handle: string;
  post_type: string;
  upvotes: number;
  downvotes: number;
  user_vote: 'upvote' | 'downvote' | null;
  comment_count: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_solved: boolean;
  is_locked: boolean;
  attachments: Array<{
    name: string;
    size: string;
    type: string;
  }>;
  images: string[];
}

// Sample post data
const samplePost: PostData = {
  id: 'mech-1',
  title: 'How to calculate the required torque for a ball screw actuator?',
  body: `I need to size a ball screw for a CNC machine application. The specifications are:

- Load: 500kg (vertical application)
- Travel distance: 300mm
- Required speed: 10mm/s
- Ball screw pitch: 5mm
- Efficiency estimate: 85%

I've been trying to use the formula: T = (F × p) / (2π × η)

Where:
- T = required torque (Nm)
- F = axial force (N) 
- p = lead/pitch (m)
- η = efficiency

But I'm getting a result of about 14.5 Nm, which seems high for this application. Am I missing something in my calculation?

Also, should I be considering additional factors like:
- Preload requirements
- Safety factor for dynamic loads
- Acceleration/deceleration torque

Any help would be greatly appreciated!`,
  community_name: 'mechanical-engineering',
  community_display_name: 'Mechanical Engineering',
  community_color: '#E11D48',
  author_handle: 'precision_guy',
  post_type: 'question',
  upvotes: 34,
  downvotes: 2,
  user_vote: null,
  comment_count: 18,
  created_at: '2024-12-08T09:15:00Z',
  updated_at: '2024-12-08T09:15:00Z',
  tags: ['Ball Screw', 'Actuator', 'Calculations', 'Linear Motion'],
  is_solved: true,
  is_locked: false,
  attachments: [
    {
      name: 'ball_screw_diagram.pdf',
      size: '245 KB',
      type: 'pdf'
    }
  ],
  images: [
    'https://picsum.photos/seed/ball-screw-cnc/600/400'
  ]
}

// Sample comments with threading
const sampleComments = [
  {
    id: 'comment-1',
    post_id: 'mech-1',
    parent_comment_id: null,
    author_handle: 'mechanical_guru',
    body: `Your calculation looks correct for the basic torque requirement. However, you're right to consider additional factors:

1. **Preload**: If you're using preloaded ball screws (recommended for precision), add about 20-30% to your torque calculation.

2. **Acceleration torque**: For the acceleration phase, you'll need additional torque. Use T_acc = (J × α) / i, where J is inertia, α is angular acceleration, and i is the gear ratio.

3. **Safety factor**: I typically use 1.5-2.0 for dynamic applications.

Your 14.5 Nm is actually reasonable for this load. Consider a servo motor in the 1-2 kW range.`,
    upvotes: 28,
    downvotes: 1,
    user_vote: null,
    is_removed: false,
    is_edited: false,
    created_at: '2024-12-08T10:30:00Z',
    depth: 0,
    children: [
      {
        id: 'comment-2',
        post_id: 'mech-1',
        parent_comment_id: 'comment-1',
        author_handle: 'precision_guy',
        body: 'Thanks for the detailed response! That makes sense about the preload. Do you have any recommendations for ball screw manufacturers that provide good technical data?',
        upvotes: 8,
        downvotes: 0,
        user_vote: null,
        is_removed: false,
        is_edited: false,
        created_at: '2024-12-08T11:15:00Z',
        depth: 1,
        children: [
          {
            id: 'comment-3',
            post_id: 'mech-1',
            parent_comment_id: 'comment-2',
            author_handle: 'mechanical_guru',
            body: 'NSK, THK, and Hiwin all provide excellent technical documentation. NSK\'s ball screw selection software is particularly helpful for sizing.',
            upvotes: 12,
            downvotes: 0,
            user_vote: null,
            is_removed: false,
            is_edited: false,
            created_at: '2024-12-08T12:00:00Z',
            depth: 2,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'comment-4',
    post_id: 'mech-1',
    parent_comment_id: null,
    author_handle: 'cnc_pro',
    body: `Don't forget about the buckling load calculation for vertical applications! With 300mm travel, you'll want to check the critical buckling load:

P_cr = (π² × E × I) / (L_e)²

Where L_e is the effective length (depends on end fixity). For a 500kg load, make sure your ball screw diameter can handle this without buckling.`,
    upvotes: 15,
    downvotes: 0,
    user_vote: null,
    is_removed: false,
    is_edited: false,
    created_at: '2024-12-08T13:45:00Z',
    depth: 0,
    children: []
  },
  {
    id: 'comment-5',
    post_id: 'mech-1',
    parent_comment_id: null,
    author_handle: 'bearing_expert',
    body: `Also consider the bearing life calculation. With a 500kg load, you'll want to verify that the ball nut and support bearings have adequate L10 life for your duty cycle.

Most manufacturers provide online calculators for this. Aim for at least 20,000 hours of operation.`,
    upvotes: 9,
    downvotes: 0,
    user_vote: null,
    is_removed: false,
    is_edited: false,
    created_at: '2024-12-08T14:20:00Z',
    depth: 0,
    children: []
  }
]

function formatTimeAgo(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

function Comment({ 
  comment, 
  depth = 0, 
  onVote, 
  onReply,
  isLoading 
}: { 
  comment: any, 
  depth?: number,
  onVote: (commentId: string, voteType: 'upvote' | 'downvote') => void,
  onReply: (commentId: string) => void,
  isLoading: (key: string) => boolean
}) {
  const marginLeft = depth * 24 // 24px per level
  
  return (
    <div className="relative" style={{ marginLeft: `${marginLeft}px` }}>
      {depth > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"
          style={{ left: '-12px' }}
        />
      )}
      
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <span className="font-medium text-gray-900">u/{comment.author_handle}</span>
          <span>•</span>
          <span>{formatTimeAgo(comment.created_at)}</span>
          {comment.is_edited && (
            <>
              <span>•</span>
              <span className="text-gray-400">edited</span>
            </>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none mb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{comment.body}</p>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => onVote(comment.id, 'upvote')}
              disabled={isLoading(`comment-vote-${comment.id}`)}
              className={`p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 ${
                comment.user_vote === 'upvote' ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              {comment.user_vote === 'upvote' ? 
                <ArrowUpSolidIcon className="w-4 h-4" /> : 
                <ArrowUpIcon className="w-4 h-4" />
              }
            </button>
            <span className="font-medium text-gray-900 min-w-[20px] text-center">
              {comment.upvotes - comment.downvotes}
            </span>
            <button 
              onClick={() => onVote(comment.id, 'downvote')}
              disabled={isLoading(`comment-vote-${comment.id}`)}
              className={`p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 ${
                comment.user_vote === 'downvote' ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              {comment.user_vote === 'downvote' ? 
                <ArrowDownSolidIcon className="w-4 h-4" /> : 
                <ArrowDownIcon className="w-4 h-4" />
              }
            </button>
          </div>
          
          <button 
            onClick={() => onReply(comment.id)}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Reply
          </button>
          
          <button className="text-gray-500 hover:text-gray-700">
            Share
          </button>
          
          {depth < 5 && comment.children && comment.children.length > 0 && (
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>
      
      {/* Render child comments */}
      {comment.children && comment.children.map((child: any) => (
        <Comment 
          key={child.id} 
          comment={child} 
          depth={depth + 1} 
          onVote={onVote}
          onReply={onReply}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}

export default function PostPage({ params }: PostPageProps) {
  // All hooks must be called at the top level, before any conditional returns
  const [resolvedParams, setResolvedParams] = useState<{ community: string; postId: string } | null>(null);
  const [post, setPost] = useState(samplePost);
  const [comments, setComments] = useState(sampleComments);
  const [commentText, setCommentText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { user } = useAuth();
  const {
    voteOnPost,
    voteOnComment,
    savePost,
    reportPost,
    createComment,
    sharePost,
    isLoading,
    isAuthenticated
  } = useCommunityActions();

  // All useEffect hooks must be called unconditionally
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Early returns only after all hooks are called
  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  const { community, postId } = resolvedParams;

  // Handle post not found case without calling notFound() which can cause issues
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
          <Link 
            href={`/community/${community}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Community
          </Link>
        </div>
      </div>
    );
  }

  const handlePostVote = async (voteType: 'upvote' | 'downvote') => {
    try {
      const currentState = {
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        userVote: post.user_vote as 'upvote' | 'downvote' | null
      };

      const newState = await voteOnPost(post.id, voteType, currentState);
      
      setPost(prev => ({
        ...prev,
        upvotes: newState.upvotes,
        downvotes: newState.downvotes,
        user_vote: newState.userVote
      }));

      if (!user) {
        setMessage({ type: 'success', text: 'Vote recorded (demo mode)' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to vote' });
    }
  };

  const handleCommentVote = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    try {
      // Find the comment in the nested structure
      const findAndUpdateComment = (comments: any[], id: string): any[] => {
        return comments.map(comment => {
          if (comment.id === id) {
            const currentState = {
              upvotes: comment.upvotes,
              downvotes: comment.downvotes,
              userVote: comment.user_vote as 'upvote' | 'downvote' | null
            };

            // This is async but we'll handle it optimistically
            voteOnComment(id, voteType, currentState).then(newState => {
              setComments(prevComments => {
                const updateComment = (comments: any[]): any[] => {
                  return comments.map(c => {
                    if (c.id === id) {
                      return {
                        ...c,
                        upvotes: newState.upvotes,
                        downvotes: newState.downvotes,
                        user_vote: newState.userVote
                      };
                    }
                    if (c.children) {
                      return { ...c, children: updateComment(c.children) };
                    }
                    return c;
                  });
                };
                return updateComment(prevComments);
              });
            });

            return comment;
          }
          if (comment.children) {
            return { ...comment, children: findAndUpdateComment(comment.children, id) };
          }
          return comment;
        });
      };

      setComments(prevComments => findAndUpdateComment(prevComments, commentId));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to vote' });
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      setMessage({ type: 'error', text: 'Please enter a comment' });
      return;
    }

    try {
      const newComment = await createComment(post.id, commentText);
      
      // Add the new comment to the list
      setComments(prev => [...prev, {
        ...newComment,
        author_handle: user?.display_name || user?.username || 'Demo User',
        children: [],
        depth: 0
      }]);
      
      setCommentText('');
      setMessage({ 
        type: 'success', 
        text: user ? 'Comment added successfully!' : 'Comment added (demo mode)!' 
      });
      
      // Update comment count
      setPost(prev => ({
        ...prev,
        comment_count: prev.comment_count + 1
      }));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create comment' });
    }
  };

  const handleSave = async () => {
    try {
      const newSavedState = await savePost(post.id, isSaved);
      setIsSaved(newSavedState);
      setMessage({ 
        type: 'success', 
        text: user 
          ? (newSavedState ? 'Post saved!' : 'Post unsaved!') 
          : (newSavedState ? 'Post saved (demo mode)!' : 'Post unsaved (demo mode)!')
      });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save post' });
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      setMessage({ type: 'error', text: 'Please select a reason for reporting' });
      return;
    }

    try {
      await reportPost(post.id, reportReason, reportDetails);
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
      setMessage({ 
        type: 'success', 
        text: user ? 'Report submitted successfully' : 'Report submitted (demo mode)' 
      });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to report post' });
    }
  };

  const handleShare = async () => {
    try {
      await sharePost(post.id, post.title);
      setMessage({ type: 'success', text: 'Post shared!' });
    } catch (error) {
      // Sharing was cancelled or failed, no need to show error
    }
  };

  const handleReply = (commentId: string) => {
    // For now, just focus on the main comment box
    // In a full implementation, you'd show a reply form under the specific comment
    setMessage({ type: 'success', text: 'Reply functionality coming soon!' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo mode indicator */}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> You're viewing the platform without authentication. 
                  All interactions work but won't be saved to the database.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/community" className="hover:text-gray-700">Communities</Link>
            <span>/</span>
            <Link 
              href={`/community/${community}`} 
              className="hover:text-gray-700"
              style={{ color: post.community_color }}
            >
              c/{community}
            </Link>
            <span>/</span>
            <span className="text-gray-900">Post</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Post */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                {/* Post Header */}
                <div className="flex space-x-4 mb-4">
                  {/* Vote Section */}
                  <div className="flex flex-col items-center space-y-1 min-w-0">
                    <button 
                      onClick={() => handlePostVote('upvote')}
                      disabled={isLoading(`post-vote-${post.id}`)}
                      className={`p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 ${
                        post.user_vote === 'upvote' ? 'text-orange-500 bg-orange-50' : 'text-gray-400'
                      }`}
                    >
                      {post.user_vote === 'upvote' ? 
                        <ArrowUpSolidIcon className="w-6 h-6" /> : 
                        <ArrowUpIcon className="w-6 h-6" />
                      }
                    </button>
                    <span className="text-lg font-bold text-gray-900">
                      {post.upvotes - post.downvotes}
                    </span>
                    <button 
                      onClick={() => handlePostVote('downvote')}
                      disabled={isLoading(`post-vote-${post.id}`)}
                      className={`p-2 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 ${
                        post.user_vote === 'downvote' ? 'text-blue-500 bg-blue-50' : 'text-gray-400'
                      }`}
                    >
                      {post.user_vote === 'downvote' ? 
                        <ArrowDownSolidIcon className="w-6 h-6" /> : 
                        <ArrowDownIcon className="w-6 h-6" />
                      }
                    </button>
                  </div>
                  
                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <Link 
                        href={`/community/${community}`}
                        className="font-medium hover:underline"
                        style={{ color: post.community_color }}
                      >
                        c/{post.community_name}
                      </Link>
                      <span>•</span>
                      <span>Posted by u/{post.author_handle}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.created_at)}</span>
                      {post.is_solved && (
                        <>
                          <span>•</span>
                          <div className="flex items-center text-green-600">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            <span className="font-medium">Solved</span>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      {post.title}
                    </h1>
                    
                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{post.body}</p>
                    </div>
                    
                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-4 space-y-3">
                        {post.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="max-w-full h-auto rounded-lg border border-gray-200"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments:</h4>
                        <div className="space-y-2">
                          {post.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                              <PaperClipIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{attachment.name}</span>
                              <span className="text-xs text-gray-500">({attachment.size})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Post Actions */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                        {post.comment_count} comments
                      </span>
                      
                      <button 
                        onClick={handleShare}
                        className="flex items-center hover:text-gray-700"
                      >
                        <ShareIcon className="w-4 h-4 mr-1" />
                        Share
                      </button>
                      
                      <button 
                        onClick={handleSave}
                        disabled={isLoading(`post-save-${post.id}`)}
                        className={`flex items-center hover:text-gray-700 disabled:opacity-50 ${
                          isSaved ? 'text-blue-600' : ''
                        }`}
                      >
                        <BookmarkIcon className="w-4 h-4 mr-1" />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                      
                      <button 
                        onClick={() => setShowReportModal(true)}
                        className="flex items-center hover:text-gray-700"
                      >
                        <FlagIcon className="w-4 h-4 mr-1" />
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a comment</h3>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your thoughts or help solve this problem..."
                />
                <div className="flex justify-end mt-3">
                  <button 
                    onClick={handleCommentSubmit}
                    disabled={isLoading(`comment-create-${post.id}`) || !commentText.trim()}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading(`comment-create-${post.id}`) ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments ({comments.length})
              </h3>
              {comments.map((comment) => (
                <Comment 
                  key={comment.id} 
                  comment={comment} 
                  onVote={handleCommentVote}
                  onReply={handleReply}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Link href={`/community/${community}`} className="block">
                <h4 className="font-semibold text-gray-900 mb-2">c/{post.community_name}</h4>
                <p className="text-sm text-gray-600 mb-3">{post.community_display_name}</p>
                <button 
                  className="w-full px-3 py-2 text-sm font-medium text-white rounded-md transition-colors"
                  style={{ backgroundColor: post.community_color }}
                >
                  Join Community
                </button>
              </Link>
            </div>

            {/* Author Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-3">About the Author</h4>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {post.author_handle.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">u/{post.author_handle}</p>
                  <p className="text-sm text-gray-500">Mechanical Engineer</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Post Karma:</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Comment Karma:</span>
                  <span className="font-medium">3,891</span>
                </div>
                <div className="flex justify-between">
                  <span>Cake Day:</span>
                  <span className="font-medium">Jan 15, 2023</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Post</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="misinformation">Misinformation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Provide more details about why you're reporting this post..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={isLoading(`post-report-${post.id}`) || !reportReason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading(`post-report-${post.id}`) ? 'Reporting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 