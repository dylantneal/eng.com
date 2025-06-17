'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface VoteState {
  upvotes: number;
  downvotes: number;
  userVote: 'upvote' | 'downvote' | null;
}

interface PostActions {
  isSaved: boolean;
  isReported: boolean;
}

export function useCommunityActions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const setItemLoading = (key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  };

  const voteOnPost = async (
    postId: string, 
    voteType: 'upvote' | 'downvote',
    currentState: VoteState
  ): Promise<VoteState> => {
    const loadingKey = `post-vote-${postId}`;
    setItemLoading(loadingKey, true);

    try {
      // Calculate new vote state based on current state and action
      let newState = { ...currentState };

      if (currentState.userVote === voteType) {
        // Remove vote (toggle off)
        newState.userVote = null;
        if (voteType === 'upvote') {
          newState.upvotes = Math.max(0, newState.upvotes - 1);
        } else {
          newState.downvotes = Math.max(0, newState.downvotes - 1);
        }
      } else if (currentState.userVote === null) {
        // Add new vote
        newState.userVote = voteType;
        if (voteType === 'upvote') {
          newState.upvotes += 1;
        } else {
          newState.downvotes += 1;
        }
      } else {
        // Change vote
        newState.userVote = voteType;
        if (voteType === 'upvote') {
          newState.upvotes += 1;
          newState.downvotes = Math.max(0, newState.downvotes - 1);
        } else {
          newState.upvotes = Math.max(0, newState.upvotes - 1);
          newState.downvotes += 1;
        }
      }

      // If user is authenticated, try to sync with backend
      if (user?.id) {
        try {
          const response = await fetch(`/api/posts/${postId}/vote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vote_type: voteType }),
          });

          if (!response.ok) {
            console.warn('Failed to sync vote with backend, but continuing with optimistic update');
          }
        } catch (error) {
          console.warn('Failed to sync vote with backend:', error);
          // Continue with optimistic update even if backend fails
        }
      }

      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 300));

      return newState;
    } catch (error) {
      console.error('Error voting on post:', error);
      throw error;
    } finally {
      setItemLoading(loadingKey, false);
    }
  };

  const voteOnComment = async (
    commentId: string,
    voteType: 'upvote' | 'downvote',
    currentState: VoteState
  ): Promise<VoteState> => {
    const loadingKey = `comment-vote-${commentId}`;
    setItemLoading(loadingKey, true);

    try {
      // Calculate new vote state (works for both authenticated and demo mode)
      let newState = { ...currentState };

      if (currentState.userVote === voteType) {
        // Remove vote (toggle off)
        newState.userVote = null;
        if (voteType === 'upvote') {
          newState.upvotes = Math.max(0, newState.upvotes - 1);
        } else {
          newState.downvotes = Math.max(0, newState.downvotes - 1);
        }
      } else if (currentState.userVote === null) {
        // Add new vote
        newState.userVote = voteType;
        if (voteType === 'upvote') {
          newState.upvotes += 1;
        } else {
          newState.downvotes += 1;
        }
      } else {
        // Change vote
        newState.userVote = voteType;
        if (voteType === 'upvote') {
          newState.upvotes += 1;
          newState.downvotes = Math.max(0, newState.downvotes - 1);
        } else {
          newState.upvotes = Math.max(0, newState.upvotes - 1);
          newState.downvotes += 1;
        }
      }

      // If user is authenticated, try to sync with backend
      if (user?.id) {
        try {
          const response = await fetch(`/api/comments/${commentId}/vote`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: voteType }),
          });

          if (!response.ok) {
            console.warn('Failed to sync vote with backend, but continuing with optimistic update');
          }
        } catch (error) {
          console.warn('Failed to sync vote with backend:', error);
          // Continue with optimistic update even if backend fails
        }
      }

      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return newState;
    } catch (error) {
      console.error('Error voting on comment:', error);
      throw error;
    } finally {
      setItemLoading(loadingKey, false);
    }
  };

  const savePost = async (postId: string, currentlySaved: boolean): Promise<boolean> => {
    const loadingKey = `post-save-${postId}`;
    setItemLoading(loadingKey, true);

    try {
      // Toggle saved state optimistically
      const newSavedState = !currentlySaved;

      // If user is authenticated, try to sync with backend
      if (user?.id) {
        try {
          const response = await fetch(`/api/posts/${postId}/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.warn('Failed to sync save state with backend, but continuing with optimistic update');
          }
        } catch (error) {
          console.warn('Failed to sync save state with backend:', error);
          // Continue with optimistic update even if backend fails
        }
      }

      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 300));

      return newSavedState;
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    } finally {
      setItemLoading(loadingKey, false);
    }
  };

  const reportPost = async (postId: string, reason: string, details?: string): Promise<void> => {
    const loadingKey = `post-report-${postId}`;
    setItemLoading(loadingKey, true);

    try {
      // If user is authenticated, try to sync with backend
      if (user?.id) {
        try {
          const response = await fetch(`/api/posts/${postId}/report`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason, details }),
          });

          if (!response.ok) {
            console.warn('Failed to sync report with backend, but continuing with optimistic update');
          }
        } catch (error) {
          console.warn('Failed to sync report with backend:', error);
          // Continue with optimistic update even if backend fails
        }
      }

      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, always succeed
    } catch (error) {
      console.error('Error reporting post:', error);
      throw error;
    } finally {
      setItemLoading(loadingKey, false);
    }
  };

  const createComment = async (
    postId: string,
    content: string,
    parentId?: string
  ): Promise<any> => {
    if (!user?.id) {
      // For demo purposes, create a mock comment when not authenticated
      const mockComment = {
        id: `comment-${Date.now()}`,
        post_id: postId,
        parent_comment_id: parentId || null,
        author_id: 'demo-user',
        body: content,
        upvotes: 0,
        downvotes: 0,
        depth: parentId ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          id: 'demo-user',
          username: 'demo_user',
          display_name: 'Demo User',
          avatar_url: null
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockComment;
    }

    const loadingKey = `comment-create-${postId}`;
    setItemLoading(loadingKey, true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, content, parentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create comment');
      }

      const result = await response.json();
      return result.comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    } finally {
      setItemLoading(loadingKey, false);
    }
  };

  const sharePost = async (postId: string, title: string): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: `${window.location.origin}/community/posts/${postId}`,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/community/posts/${postId}`;
      await navigator.clipboard.writeText(url);
      // You might want to show a toast notification here
    }
  };

  const isLoading = (key: string): boolean => {
    return loading[key] || false;
  };

  return {
    voteOnPost,
    voteOnComment,
    savePost,
    reportPost,
    createComment,
    sharePost,
    isLoading,
    isAuthenticated: !!user?.id,
  };
} 