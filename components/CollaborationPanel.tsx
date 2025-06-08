'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, 
  MessageCircle, 
  Send, 
  Eye, 
  Edit, 
  GitCommit,
  Activity,
  User as UserIcon,
  Clock
} from 'lucide-react';

interface CollaborationPanelProps {
  projectId: string;
  currentUser?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface ActiveUser {
  user_id: string;
  name: string;
  avatar_url?: string;
  status: 'viewing' | 'editing' | 'idle';
  last_seen: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  message: string;
  created_at: string;
}

interface ProjectActivity {
  id: string;
  type: 'file_upload' | 'version_create' | 'comment' | 'user_join';
  user_name: string;
  description: string;
  created_at: string;
}

export default function CollaborationPanel({ projectId, currentUser }: CollaborationPanelProps) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'users' | 'chat' | 'activity'>('users');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!currentUser) return;

    // Set up real-time presence
    const channel = supabase.channel(`project-${projectId}`, {
      config: {
        presence: { key: currentUser.id },
      },
    });

    // Track current user's presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const presenceTrackStatus = await channel.track({
          user_id: currentUser.id,
          name: currentUser.name,
          avatar_url: currentUser.avatar_url,
          status: 'viewing',
          online_at: new Date().toISOString(),
        });
      }
    });

    // Listen for presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      const users: ActiveUser[] = [];
      
      for (const key in newState) {
        const presences = newState[key];
        if (presences && presences.length > 0) {
          const presence = presences[0] as any;
          users.push({
            user_id: presence.user_id,
            name: presence.name,
            avatar_url: presence.avatar_url,
            status: presence.status,
            last_seen: presence.online_at,
          });
        }
      }
      
      setActiveUsers(users);
    });

    // Listen for real-time chat messages
    channel.on('broadcast', { event: 'chat_message' }, (payload) => {
      setChatMessages(prev => [...prev, payload.message]);
      scrollToBottom();
    });

    // Listen for activity updates
    channel.on('broadcast', { event: 'project_activity' }, (payload) => {
      setActivities(prev => [payload.activity, ...prev.slice(0, 19)]);
    });

    channelRef.current = channel;

    // Load initial data
    loadChatHistory();
    loadProjectActivity();

    return () => {
      channel.unsubscribe();
    };
  }, [projectId, currentUser]);

  const loadChatHistory = async () => {
    try {
      // In a real implementation, this would load from a chat_messages table
      // For now, we'll use mock data
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Alice Johnson',
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b35a0f6c?w=32&h=32&fit=crop&crop=face',
          message: 'Just uploaded the latest CAD files! 🎉',
          created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Bob Smith',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
          message: 'Looks great! Should we review the tolerances?',
          created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString()
        }
      ];
      setChatMessages(mockMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const loadProjectActivity = async () => {
    try {
      // Mock project activity
      const mockActivities: ProjectActivity[] = [
        {
          id: '1',
          type: 'version_create',
          user_name: 'Alice Johnson',
          description: 'Created version v1.2 with updated motor mount',
          created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
        },
        {
          id: '2',
          type: 'file_upload',
          user_name: 'Bob Smith',
          description: 'Uploaded motor_mount.step and assembly.stl',
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: '3',
          type: 'comment',
          user_name: 'Carol Davis',
          description: 'Added comment about material specifications',
          created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
        }
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading project activity:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !channelRef.current) return;

    const message: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      user_id: currentUser.id,
      user_name: currentUser.name,
      avatar_url: currentUser.avatar_url,
      message: newMessage.trim(),
      created_at: new Date().toISOString()
    };

    // Broadcast to all connected users
    channelRef.current.send({
      type: 'broadcast',
      event: 'chat_message',
      message: message
    });

    // Add to local state immediately
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const getActivityIcon = (type: ProjectActivity['type']) => {
    switch (type) {
      case 'version_create': return GitCommit;
      case 'file_upload': return Edit;
      case 'comment': return MessageCircle;
      case 'user_join': return UserIcon;
      default: return Activity;
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full bg-white border-l shadow-lg transition-all duration-300 z-40 ${
      isExpanded ? 'w-80' : 'w-12'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-12 top-4 bg-blue-600 text-white p-2 rounded-l-lg hover:bg-blue-700 transition-colors"
      >
        <Users className="w-5 h-5" />
      </button>

      {isExpanded && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Collaboration</h3>
            
            {/* Section Tabs */}
            <div className="mt-3 flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'users', label: 'Users', icon: Users },
                { id: 'chat', label: 'Chat', icon: MessageCircle },
                { id: 'activity', label: 'Activity', icon: Activity },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as any)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                    activeSection === id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Active Users */}
            {activeSection === 'users' && (
              <div className="p-4 space-y-3">
                <div className="text-sm text-gray-600">
                  {activeUsers.length} online
                </div>
                
                {activeUsers.map((user) => (
                  <div key={user.user_id} className="flex items-center gap-2">
                    <div className="relative">
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=32`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'viewing' ? 'bg-green-500' :
                        user.status === 'editing' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.status === 'viewing' ? <Eye className="w-3 h-3 inline mr-1" /> :
                         user.status === 'editing' ? <Edit className="w-3 h-3 inline mr-1" /> : null}
                        {user.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat */}
            {activeSection === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex items-start gap-2">
                      <img
                        src={message.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.user_name)}&size=24`}
                        alt={message.user_name}
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs font-medium text-gray-900">
                            {message.user_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(message.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 break-words">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Chat Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Feed */}
            {activeSection === 'activity' && (
              <div className="p-4 space-y-3 overflow-y-auto">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user_name}</span>
                          {' '}{activity.description}
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 