import { NextRequest, NextResponse } from 'next/server';
import { collaborationService } from '@/lib/collaboration-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/collaboration/sessions?projectId=xxx
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

    // TODO: Implement actual database query for active sessions
    // For now, return mock data
    const activeSessions = [
      {
        id: 'session1',
        projectId,
        name: 'Design Review Session',
        hostId: session.user?.id || 'user1',
        hostName: session.user?.name || 'Host User',
        participants: [
          {
            userId: session.user?.id || 'user1',
            userName: session.user?.name || 'Current User',
            email: session.user?.email || 'user@example.com',
            joinedAt: new Date(),
            lastSeen: new Date(),
            status: 'online',
            role: 'host',
            permissions: {
              canEdit: true,
              canComment: true,
              canUseVideo: true,
              canUseAudio: true,
              canShareScreen: true,
              canInviteOthers: true
            },
            videoEnabled: false,
            audioEnabled: false,
            screenSharing: false
          }
        ],
        createdAt: new Date(),
        status: 'active',
        settings: {
          allowVideoAudio: true,
          allowScreenSharing: true,
          allowFileEditing: true,
          allowChatMessages: true,
          recordSession: false,
          requireApprovalToJoin: false,
          maxParticipants: 10,
          autoSaveInterval: 30,
          cursorUpdateInterval: 100
        },
        sharedViewport: {
          id: 'viewport1',
          type: '3d',
          camera: {
            position: { x: 5, y: 5, z: 5 },
            target: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            fov: 45
          },
          zoom: 1,
          pan: { x: 0, y: 0 },
          displaySettings: {
            showGrid: true,
            showAxes: true,
            showDimensions: false,
            showMaterials: true,
            wireframeMode: false,
            lightingMode: 'standard',
            backgroundStyle: 'gradient'
          },
          synchronizeView: false,
          followHost: false
        },
        permissions: {
          canEdit: [session.user?.id || 'user1'],
          canView: [session.user?.id || 'user1'],
          canComment: [session.user?.id || 'user1'],
          canManageSession: [session.user?.id || 'user1']
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: activeSessions,
      meta: {
        total: activeSessions.length,
        activeParticipants: activeSessions.reduce((sum, s) => sum + s.participants.length, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching collaboration sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/collaboration/sessions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, name, description, settings } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    try {
      const newSession = await collaborationService.createSession(projectId, {
        ...settings,
        allowVideoAudio: settings?.allowVideoAudio ?? true,
        allowScreenSharing: settings?.allowScreenSharing ?? true,
        allowFileEditing: settings?.allowFileEditing ?? true,
        allowChatMessages: settings?.allowChatMessages ?? true,
        recordSession: settings?.recordSession ?? false,
        requireApprovalToJoin: settings?.requireApprovalToJoin ?? false,
        maxParticipants: settings?.maxParticipants ?? 10,
        autoSaveInterval: settings?.autoSaveInterval ?? 30,
        cursorUpdateInterval: settings?.cursorUpdateInterval ?? 100
      });

      // Update session with provided name and description
      if (name) {
        newSession.name = name;
      }
      if (description) {
        newSession.description = description;
      }

      return NextResponse.json({
        success: true,
        data: newSession,
        message: 'Collaboration session created successfully'
      }, { status: 201 });

    } catch (collaborationError: any) {
      return NextResponse.json(
        { error: collaborationError.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating collaboration session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/collaboration/sessions?sessionId=xxx
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    try {
      await collaborationService.updateSessionSettings(sessionId, settings);

      return NextResponse.json({
        success: true,
        message: 'Session settings updated successfully'
      });

    } catch (collaborationError: any) {
      return NextResponse.json(
        { error: collaborationError.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating session settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 