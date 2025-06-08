import { NextRequest, NextResponse } from 'next/server';

// In-memory store for MVP (in production, use Redis or similar)
const presenceStore = new Map<string, Map<string, {
  id: string;
  handle: string;
  avatar_url?: string;
  lastSeen: number;
}>>();

export async function POST(request: NextRequest) {
  try {
    const { projectId, userId, handle, avatar_url } = await request.json();

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get or create project presence map
    if (!presenceStore.has(projectId)) {
      presenceStore.set(projectId, new Map());
    }

    const projectPresence = presenceStore.get(projectId)!;

    // Update user presence
    projectPresence.set(userId, {
      id: userId,
      handle: handle || 'Anonymous',
      avatar_url,
      lastSeen: Date.now(),
    });

    // Clean up stale viewers (older than 60 seconds)
    const now = Date.now();
    for (const [id, user] of projectPresence.entries()) {
      if (now - user.lastSeen > 60000) {
        projectPresence.delete(id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Presence heartbeat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 