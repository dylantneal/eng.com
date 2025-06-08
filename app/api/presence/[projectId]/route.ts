import { NextRequest, NextResponse } from 'next/server';

// Import the same store from heartbeat (in production, use shared Redis)
const presenceStore = new Map<string, Map<string, {
  id: string;
  handle: string;
  avatar_url?: string;
  lastSeen: number;
}>>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const projectPresence = presenceStore.get(projectId);
    
    if (!projectPresence) {
      return NextResponse.json({ viewers: [] });
    }

    // Clean up stale viewers and convert to array
    const now = Date.now();
    const viewers = Array.from(projectPresence.values()).filter(user => {
      const isActive = now - user.lastSeen < 60000;
      if (!isActive) {
        projectPresence.delete(user.id);
      }
      return isActive;
    });

    return NextResponse.json({ viewers });
  } catch (error) {
    console.error('Presence fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 