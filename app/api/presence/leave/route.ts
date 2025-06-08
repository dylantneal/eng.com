import { NextRequest, NextResponse } from 'next/server';

// Import the same store from heartbeat (in production, use shared Redis)
const presenceStore = new Map<string, Map<string, {
  id: string;
  handle: string;
  avatar_url?: string;
  lastSeen: number;
}>>();

export async function POST(request: NextRequest) {
  try {
    const { projectId, userId } = await request.json();

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      );
    }

    const projectPresence = presenceStore.get(projectId);
    
    if (projectPresence) {
      projectPresence.delete(userId);
      
      // Clean up empty project presence maps
      if (projectPresence.size === 0) {
        presenceStore.delete(projectId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Presence leave error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 