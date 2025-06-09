'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  CollaborationSession, 
  SessionParticipant, 
  LiveCursor,
  CollaborativeComment,
  TeamCommunication,
  VideoCallState 
} from '@/types/collaboration';
import { collaborationService } from '@/lib/collaboration-service';

interface CollaborationHubProps {
  projectId: string;
  currentUserId: string;
  onSessionStart?: (session: CollaborationSession) => void;
  onSessionEnd?: () => void;
}

export default function CollaborationHub({ 
  projectId, 
  currentUserId,
  onSessionStart,
  onSessionEnd 
}: CollaborationHubProps) {
  const [isCollaborationActive, setIsCollaborationActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [cursors, setCursors] = useState<Map<string, LiveCursor>>(new Map());
  const [comments, setComments] = useState<CollaborativeComment[]>([]);
  const [messages, setMessages] = useState<TeamCommunication[]>([]);
  const [videoCall, setVideoCall] = useState<VideoCallState | null>(null);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'participants' | 'chat' | 'comments' | 'activity'>('participants');

  useEffect(() => {
    // Initialize collaboration service
    collaborationService.connect(currentUserId);

    // Set up event listeners
    collaborationService.on('user_joined', handleUserJoined);
    collaborationService.on('user_left', handleUserLeft);
    collaborationService.on('cursor_moved', handleCursorMoved);
    collaborationService.on('comment_added', handleCommentAdded);
    collaborationService.on('message_sent', handleMessageSent);
    collaborationService.on('video_toggled', handleVideoToggled);

    return () => {
      // Cleanup
      collaborationService.disconnect();
    };
  }, [currentUserId]);

  const handleUserJoined = (event: any) => {
    const participant: SessionParticipant = event.data;
    setParticipants(prev => [...prev, participant]);
  };

  const handleUserLeft = (event: any) => {
    const { userId } = event.data;
    setParticipants(prev => prev.filter(p => p.userId !== userId));
    setCursors(prev => {
      const newCursors = new Map(prev);
      newCursors.delete(userId);
      return newCursors;
    });
  };

  const handleCursorMoved = (event: any) => {
    const cursor: LiveCursor = event.data;
    setCursors(prev => new Map(prev.set(cursor.userId, cursor)));
  };

  const handleCommentAdded = (event: any) => {
    const comment: CollaborativeComment = event.data;
    setComments(prev => [...prev, comment]);
  };

  const handleMessageSent = (event: any) => {
    const message: TeamCommunication = event.data;
    setMessages(prev => [...prev, message]);
  };

  const handleVideoToggled = (event: any) => {
    // Handle video call state changes
    console.log('Video call event:', event.data);
  };

  const startCollaboration = async () => {
    try {
      const session = await collaborationService.createSession(projectId, {
        allowVideoAudio: true,
        allowScreenSharing: true,
        allowFileEditing: true,
        maxParticipants: 10
      });

      setCurrentSession(session);
      setIsCollaborationActive(true);
      setShowCollaborationPanel(true);
      onSessionStart?.(session);
    } catch (error) {
      console.error('Error starting collaboration:', error);
    }
  };

  const endCollaboration = async () => {
    if (currentSession) {
      await collaborationService.leaveSession(currentSession.id, currentUserId);
      setCurrentSession(null);
      setIsCollaborationActive(false);
      setShowCollaborationPanel(false);
      setParticipants([]);
      setCursors(new Map());
      onSessionEnd?.();
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const participant = await collaborationService.joinSession(sessionId, currentUserId);
      setIsCollaborationActive(true);
      setShowCollaborationPanel(true);
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  return (
    <div className="fixed top-0 right-0 z-50">
      {/* Collaboration Toggle Button */}
      {!showCollaborationPanel && (
        <button
          onClick={() => setShowCollaborationPanel(true)}
          className={`m-4 p-3 rounded-full shadow-lg transition-all ${
            isCollaborationActive 
              ? 'bg-green-500 text-white animate-pulse' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      )}

      {/* Live Cursors Overlay */}
      <LiveCursorsOverlay cursors={cursors} />

      {/* Comments Overlay */}
      <CommentsOverlay comments={comments} onAddComment={addComment} />

      {/* Collaboration Panel */}
      {showCollaborationPanel && (
        <div className="bg-white shadow-2xl border-l border-gray-200 w-96 h-screen flex flex-col">
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {isCollaborationActive ? 'Live Collaboration' : 'Collaboration'}
            </h3>
            <div className="flex items-center space-x-2">
              {isCollaborationActive && (
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Live</span>
                </div>
              )}
              <button
                onClick={() => setShowCollaborationPanel(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Session Controls */}
          {!isCollaborationActive ? (
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={startCollaboration}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Live Session
              </button>
            </div>
          ) : (
            <div className="p-4 border-b border-gray-200 space-y-3">
              {/* Video Call Controls */}
              <div className="flex items-center space-x-2">
                <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Video
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Share
                </button>
              </div>
              
              <button
                onClick={endCollaboration}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                End Session
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { key: 'participants', label: 'Users', count: participants.length },
              { key: 'chat', label: 'Chat', count: messages.length },
              { key: 'comments', label: 'Comments', count: comments.length },
              { key: 'activity', label: 'Activity', count: 0 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 px-2 text-sm font-medium ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'participants' && (
              <ParticipantsView participants={participants} />
            )}
            {activeTab === 'chat' && (
              <ChatView 
                messages={messages} 
                onSendMessage={sendMessage}
                currentUserId={currentUserId}
              />
            )}
            {activeTab === 'comments' && (
              <CommentsView 
                comments={comments} 
                onAddComment={addComment}
                currentUserId={currentUserId}
              />
            )}
            {activeTab === 'activity' && (
              <ActivityView />
            )}
          </div>
        </div>
      )}
    </div>
  );

  async function addComment(content: string, position: any) {
    if (!currentSession) return;

    await collaborationService.addComment({
      projectId,
      content,
      position
    });
  }

  async function sendMessage(content: string) {
    if (!currentSession) return;

    await collaborationService.sendMessage({
      projectId,
      content
    });
  }
}

// Live Cursors Overlay Component
function LiveCursorsOverlay({ cursors }: { cursors: Map<string, LiveCursor> }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {Array.from(cursors.values()).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-100"
          style={{
            left: cursor.position.x,
            top: cursor.position.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: cursor.color }}
            ></div>
            <div 
              className="bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-md"
              style={{ borderColor: cursor.color }}
            >
              {cursor.userName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Comments Overlay Component
function CommentsOverlay({ 
  comments, 
  onAddComment 
}: { 
  comments: CollaborativeComment[];
  onAddComment: (content: string, position: any) => void;
}) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });
  const [commentContent, setCommentContent] = useState('');

  const handleDoubleClick = (e: React.MouseEvent) => {
    setCommentPosition({ x: e.clientX, y: e.clientY });
    setShowCommentInput(true);
  };

  const submitComment = () => {
    if (commentContent.trim()) {
      onAddComment(commentContent, {
        x: commentPosition.x,
        y: commentPosition.y,
        anchor: 'point'
      });
      setCommentContent('');
      setShowCommentInput(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-30 pointer-events-none"
      onDoubleClick={handleDoubleClick}
    >
      {/* Existing Comments */}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="absolute pointer-events-auto"
          style={{
            left: comment.position.x,
            top: comment.position.y
          }}
        >
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 shadow-md max-w-xs">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                {comment.authorName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{comment.authorName}</p>
                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Comment Input */}
      {showCommentInput && (
        <div
          className="absolute pointer-events-auto"
          style={{
            left: commentPosition.x,
            top: commentPosition.y
          }}
        >
          <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Add a comment..."
              className="w-64 h-20 border border-gray-300 rounded p-2 text-sm resize-none"
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowCommentInput(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitComment}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Participants View Component
function ParticipantsView({ participants }: { participants: SessionParticipant[] }) {
  return (
    <div className="p-4 space-y-3">
      {participants.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No active participants</p>
      ) : (
        participants.map((participant) => (
          <div key={participant.userId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {participant.userName.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                participant.status === 'online' ? 'bg-green-500' : 
                participant.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{participant.userName}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  participant.role === 'host' ? 'bg-purple-100 text-purple-800' :
                  participant.role === 'co-host' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {participant.role}
                </span>
                {participant.videoEnabled && (
                  <span className="text-green-600 text-xs">📹</span>
                )}
                {participant.audioEnabled && (
                  <span className="text-green-600 text-xs">🎤</span>
                )}
                {participant.screenSharing && (
                  <span className="text-blue-600 text-xs">📱</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Chat View Component
function ChatView({ 
  messages, 
  onSendMessage, 
  currentUserId 
}: { 
  messages: TeamCommunication[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs px-3 py-2 rounded-lg ${
              message.senderId === currentUserId
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              {message.senderId !== currentUserId && (
                <p className="text-xs font-medium mb-1">{message.senderName}</p>
              )}
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Comments View Component
function CommentsView({ 
  comments, 
  onAddComment, 
  currentUserId 
}: { 
  comments: CollaborativeComment[];
  onAddComment: (content: string, position: any) => void;
  currentUserId: string;
}) {
  return (
    <div className="p-4 space-y-4">
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No comments yet</p>
          <p className="text-sm text-gray-400 mt-1">Double-click on the design to add comments</p>
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-medium">
                {comment.authorName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">{comment.authorName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                {comment.status === 'resolved' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 mt-2">
                    ✓ Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Activity View Component
function ActivityView() {
  return (
    <div className="p-4">
      <p className="text-gray-500 text-center py-8">Activity feed coming soon</p>
    </div>
  );
} 