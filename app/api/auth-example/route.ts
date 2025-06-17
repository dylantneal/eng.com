/**
 * Example API Route demonstrating the new authorization middleware
 * This shows how to use the withAuth wrapper and authorization checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthorizationService, PlanService } from '@/lib/auth-middleware';

// Example: Public endpoint (no auth required)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'This is a public endpoint - no authentication required',
    timestamp: new Date().toISOString(),
  });
}

// Example: Protected endpoint (authentication required)
export const POST = withAuth(async (request: NextRequest, user) => {
  // User is guaranteed to be authenticated here
  const body = await request.json();
  
  return NextResponse.json({
    message: 'Successfully authenticated!',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      plan: user.plan,
      is_verified: user.is_verified,
    },
    requestData: body,
    timestamp: new Date().toISOString(),
  });
}, { required: true });

// Example: Admin-only endpoint
export const PUT = withAuth(async (request: NextRequest, user) => {
  return NextResponse.json({
    message: 'Admin access granted!',
    adminUser: {
      id: user.id,
      email: user.email,
      plan: user.plan,
    },
    timestamp: new Date().toISOString(),
  });
}, { 
  required: true, 
  adminOnly: true 
});

// Example: Pro users only endpoint
export const PATCH = withAuth(async (request: NextRequest, user) => {
  return NextResponse.json({
    message: 'Pro user access granted!',
    proUser: {
      id: user.id,
      email: user.email,
      plan: user.plan,
    },
    timestamp: new Date().toISOString(),
  });
}, { 
  required: true, 
  proOnly: true 
});

// Example: Complex authorization logic
export const DELETE = withAuth(async (request: NextRequest, user) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID is required' },
      { status: 400 }
    );
  }

  // Check if user can edit this specific project
  const canEdit = await AuthorizationService.canEditProject(projectId, user.id);
  
  if (!canEdit) {
    return NextResponse.json(
      { error: 'You do not have permission to delete this project' },
      { status: 403 }
    );
  }

  // Check plan limits
  const canCreatePrivate = PlanService.canCreatePrivateProject(user.plan, 0);
  
  return NextResponse.json({
    message: 'Project deletion authorized!',
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
    },
    projectId,
    permissions: {
      canEditProject: true,
      canCreatePrivateProjects: canCreatePrivate,
      canAccessMarketplace: PlanService.canAccessMarketplace(user.plan),
    },
    timestamp: new Date().toISOString(),
  });
}, { required: true }); 