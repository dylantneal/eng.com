import { NextRequest, NextResponse } from 'next/server';
import { gitService } from '@/lib/git-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/version-control/branches?projectId=xxx
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // TODO: Implement actual database query
    // For now, return mock data
    const branches = [
      {
        id: '1',
        projectId,
        name: 'main',
        description: 'Main development branch',
        createdBy: session.user?.id || 'user1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-08'),
        headCommitId: 'abc123',
        isDefault: true,
        isProtected: true,
        protectionRules: {
          requirePullRequest: true,
          requireReviews: true,
          minReviewers: 2,
          dismissStaleReviews: false,
          requireCodeOwnerReviews: false,
          requireStatusChecks: false,
          requireUpToDate: false,
          restrictPushes: false,
          allowedPushers: [],
          allowForcePushes: false,
          allowDeletions: false
        },
        status: 'active'
      },
      {
        id: '2',
        projectId,
        name: 'feature/motor-improvements',
        description: 'Enhanced motor control algorithms',
        createdBy: session.user?.id || 'user2',
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date('2024-06-07'),
        headCommitId: 'def456',
        parentBranchId: '1',
        isDefault: false,
        isProtected: false,
        protectionRules: {
          requirePullRequest: false,
          requireReviews: false,
          minReviewers: 1,
          dismissStaleReviews: false,
          requireCodeOwnerReviews: false,
          requireStatusChecks: false,
          requireUpToDate: false,
          restrictPushes: false,
          allowedPushers: [],
          allowForcePushes: false,
          allowDeletions: false
        },
        status: 'active'
      }
    ];

    return NextResponse.json({
      success: true,
      data: branches,
      meta: {
        total: branches.length,
        defaultBranch: 'main'
      }
    });

  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/version-control/branches
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, branchName, fromBranch, description } = body;

    if (!projectId || !branchName) {
      return NextResponse.json(
        { error: 'Project ID and branch name are required' },
        { status: 400 }
      );
    }

    // Validate branch name
    if (!/^[a-zA-Z0-9_\-\/]+$/.test(branchName)) {
      return NextResponse.json(
        { error: 'Invalid branch name. Use only letters, numbers, hyphens, underscores, and forward slashes.' },
        { status: 400 }
      );
    }

    try {
      const newBranch = await gitService.createBranch(projectId, branchName, fromBranch);

      return NextResponse.json({
        success: true,
        data: newBranch,
        message: `Branch '${branchName}' created successfully`
      }, { status: 201 });

    } catch (gitError: any) {
      return NextResponse.json(
        { error: gitError.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/version-control/branches?branchId=xxx&projectId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const projectId = searchParams.get('projectId');

    if (!branchId || !projectId) {
      return NextResponse.json(
        { error: 'Branch ID and Project ID are required' },
        { status: 400 }
      );
    }

    try {
      await gitService.deleteBranch(projectId, branchId);

      return NextResponse.json({
        success: true,
        message: 'Branch deleted successfully'
      });

    } catch (gitError: any) {
      return NextResponse.json(
        { error: gitError.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 