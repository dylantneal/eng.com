'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PresenceUser {
  id: string;
  handle: string;
  avatar_url?: string;
  lastSeen: number;
}

interface PresenceIndicatorProps {
  projectId: string;
  className?: string;
}

export default function PresenceIndicator({ projectId, className = '' }: PresenceIndicatorProps) {
  const { data: session } = useSession();
  const [viewers, setViewers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!(session?.user as any)?.id) return;

    // For MVP, we'll use a simple polling approach instead of WebSockets
    // In production, you'd use a proper WebSocket connection
    let interval: NodeJS.Timeout;
    let heartbeatInterval: NodeJS.Timeout;

    const updatePresence = async () => {
      try {
        // Send heartbeat to indicate user is viewing this project
        await fetch('/api/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            userId: (session.user as any).id,
            handle: session.user?.name ?? 'Anonymous',
            avatar_url: session.user?.image,
          }),
        });

        // Get current viewers
        const response = await fetch(`/api/presence/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setViewers(data.viewers || []);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Presence error:', error);
        setIsConnected(false);
      }
    };

    // Initial update
    updatePresence();

    // Send heartbeat every 10 seconds
    heartbeatInterval = setInterval(updatePresence, 10000);

    // Update viewer list every 5 seconds
    interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/presence/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setViewers(data.viewers || []);
        }
      } catch (error) {
        console.error('Presence fetch error:', error);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(heartbeatInterval);
      
      // Send leave signal
      fetch('/api/presence/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId: (session.user as any).id,
        }),
      }).catch(console.error);
    };
  }, [projectId, (session?.user as any)?.id]);

  // Filter out current user and remove stale viewers (older than 30 seconds)
  const activeViewers = viewers.filter(viewer => 
    viewer.id !== (session?.user as any)?.id && 
    Date.now() - viewer.lastSeen < 30000
  );

  if (activeViewers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex -space-x-2">
        {activeViewers.slice(0, 3).map((viewer) => (
          <div
            key={viewer.id}
            className="relative"
            title={`@${viewer.handle} is viewing this project`}
          >
            {viewer.avatar_url ? (
              <img
                src={viewer.avatar_url}
                alt={viewer.handle}
                className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {viewer.handle.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
        ))}
      </div>
      
      {activeViewers.length > 0 && (
        <div className="text-sm text-gray-600">
          {activeViewers.length === 1 ? (
            <span>@{activeViewers[0].handle} is viewing</span>
          ) : activeViewers.length <= 3 ? (
            <span>
              {activeViewers.map(v => `@${v.handle}`).join(', ')} are viewing
            </span>
          ) : (
            <span>
              @{activeViewers[0].handle} and {activeViewers.length - 1} others are viewing
            </span>
          )}
        </div>
      )}

      {!isConnected && (
        <div className="text-xs text-gray-400" title="Presence service disconnected">
          ⚠️
        </div>
      )}
    </div>
  );
} 