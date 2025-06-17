import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Database } from '@/types/supabase';

interface CreateCommentRequest {
  body: string;
  parent_id?: string;
}

interface CommentWithAuthor {
  id: string;
  body: string;
  user_id: string;
  parent_id: string | null;
  upvotes: number;
  created_at: string;
  updated_at: string;
  depth: number;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  user_vote?: 'upvote' | 'downvote' | null;
  replies?: CommentWithAuthor[];
}

interface DatabaseComment {
  id: string;
  body: string;
  user_id: string;
  parent_id: string | null;
  upvotes: number;
  created_at: string;
  updated_at: string;
  depth: number;
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// GET - Fetch comments for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'newest'; // newest, oldest, most_upvoted
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const session = await getServerSession(authOptions);
    const supabase = await createClient();
    const projectId = (await params).id;

    // Check if project exists and is accessible
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, is_public, owner_id, title')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const hasAccess = project.is_public || session?.user?.id === project.owner_id;
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Build the sort clause
    let orderClause = 'created_at';
    let ascending = false;
    
    switch (sort) {
      case 'oldest':
        orderClause = 'created_at';
        ascending = true;
        break;
      case 'most_upvoted':
        orderClause = 'upvotes';
        ascending = false;
        break;
      case 'newest':
      default:
        orderClause = 'created_at';
        ascending = false;
        break;
    }

    // Fetch comments with author information - using basic query for compatibility
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectId)
      .order(orderClause, { ascending })
      .limit(limit);

    if (commentsError || !commentsData) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Get author information separately to avoid join issues
    const userIds = commentsData.map(c => c.user_id).filter((id): id is string => id !== null);
    const { data: authorsData } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds);

    const authorsMap = new Map(authorsData?.map(author => [author.id, author]) || []);

    // Get user's votes if authenticated (only upvotes are supported)
    let userVotes: Record<string, boolean> = {};
    if (session?.user?.id && commentsData.length > 0) {
      const commentIds = commentsData.map(c => c.id);
      const { data: votes } = await supabase
        .from('comment_votes')
        .select('comment_id')
        .eq('user_id', session.user.id)
        .in('comment_id', commentIds);

      if (votes) {
        userVotes = votes.reduce((acc, vote) => {
          acc[vote.comment_id] = true; // User has upvoted
          return acc;
        }, {} as Record<string, boolean>);
      }
    }

    // Transform comments and build thread structure
    const processedComments = commentsData.map((comment: any) => {
      const author = authorsMap.get(comment.user_id);
      const body = comment.body || comment.content_md || comment.content || '';
      
      return {
        id: comment.id,
        body: body,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        upvotes: comment.upvotes || 0,
        created_at: comment.created_at,
        updated_at: comment.updated_at || comment.created_at,
        depth: 0, // Will be calculated during threading
        author: {
          id: author?.id || comment.user_id,
          username: author?.username || 'Unknown',
          display_name: author?.display_name || 'Unknown User',
          avatar_url: author?.avatar_url || null
        },
        user_vote: userVotes[comment.id] ? ('upvote' as const) : null,
        replies: []
      };
    });

    // Build threaded comment structure
    const threadedComments = buildCommentTree(processedComments);

    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title
      },
      comments: threadedComments,
      total_count: processedComments.length,
      sort,
      can_comment: !!session?.user?.id
    });

  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { body, parentId } = await request.json();
    if (!body) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Create the comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        project_id: params.id,
        user_id: session.user.id,
        parent_id: parentId || null,
        body,
        depth: parentId ? 1 : 0,
        upvotes: 0,
        downvotes: 0,
        is_removed: false,
        is_solution: false,
      })
      .select('*, profiles:user_id(*)')
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // Update project comment count
    const { error: rpcError } = await supabase.rpc('increment_project_comments', {
      project_id: params.id,
    });

    if (rpcError) {
      console.error('Error updating comment count:', rpcError);
      // Don't fail the request if this fails
    }

    // Format the response
    const response = {
      ...comment,
      author: {
        id: comment.profiles.id,
        username: comment.profiles.username,
        displayName: comment.profiles.display_name,
        avatarUrl: comment.profiles.avatar_url,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/projects/[id]/comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to build threaded comment structure
function buildCommentTree(comments: CommentWithAuthor[]): CommentWithAuthor[] {
  const commentMap = new Map<string, CommentWithAuthor>();
  const rootComments: CommentWithAuthor[] = [];

  // Create a map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Build the tree structure
  comments.forEach(comment => {
    const commentNode = commentMap.get(comment.id)!;
    
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        commentNode.depth = (parent.depth || 0) + 1;
        parent.replies = parent.replies || [];
        parent.replies.push(commentNode);
      } else {
        // Parent not found, treat as root comment
        rootComments.push(commentNode);
      }
    } else {
      rootComments.push(commentNode);
    }
  });

  // Sort replies by creation date within each level
  const sortReplies = (comments: CommentWithAuthor[]) => {
    comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        sortReplies(comment.replies);
      }
    });
  };

  sortReplies(rootComments);
  return rootComments;
} 