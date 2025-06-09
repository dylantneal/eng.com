import {
  CollaborationSession,
  SessionParticipant,
  SessionSettings,
  LiveCursor,
  SharedViewport,
  CollaborativeComment,
  CommentReply,
  CommentReaction,
  TeamCommunication,
  VideoCallState,
  VideoCallSettings,
  NotificationEvent,
  WebSocketEvent,
  WebSocketEventType,
  CollaborationOperations
} from '@/types/collaboration';

export class CollaborationService implements CollaborationOperations {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentSessionId: string | null = null;
  private currentUserId: string | null = null;
  private eventListeners: Map<string, ((event: WebSocketEvent) => void)[]> = new Map();
  private isConnected = false;

  constructor() {
    this.setupHeartbeat();
  }

  // WebSocket Connection Management
  async connect(userId: string): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Use wss:// for production, ws:// for development
        const wsUrl = process.env.NODE_ENV === 'production' 
          ? `wss://${window.location.host}/ws/collaboration`
          : `ws://localhost:4000/ws/collaboration`;
        
        this.ws = new WebSocket(`${wsUrl}?userId=${userId}`);
        this.currentUserId = userId;

        this.ws.onopen = () => {
          console.log('✅ Collaboration WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: WebSocketEvent = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 Collaboration WebSocket disconnected');
          this.isConnected = false;
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect(userId);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
      this.isConnected = false;
    }
  }

  private handleWebSocketMessage(event: WebSocketEvent): void {
    // Emit to all registered listeners for this event type
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => listener(event));

    // Handle global events
    switch (event.type) {
      case 'user_joined':
        console.log(`👋 ${event.data.userName} joined the session`);
        break;
      case 'user_left':
        console.log(`👋 ${event.data.userName} left the session`);
        break;
      case 'session_ended':
        console.log('🏁 Collaboration session ended');
        break;
    }
  }

  // Event Subscription System
  on(eventType: WebSocketEventType, listener: (event: WebSocketEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  off(eventType: WebSocketEventType, listener: (event: WebSocketEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(eventType: WebSocketEventType, data: any): void {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ Cannot emit event: WebSocket not connected');
      return;
    }

    const event: WebSocketEvent = {
      type: eventType,
      sessionId: this.currentSessionId!,
      userId: this.currentUserId!,
      timestamp: new Date(),
      data
    };

    this.ws.send(JSON.stringify(event));
  }

  // Session Management
  async createSession(
    projectId: string, 
    settings: Partial<SessionSettings>
  ): Promise<CollaborationSession> {
    const defaultSettings: SessionSettings = {
      allowVideoAudio: true,
      allowScreenSharing: true,
      allowFileEditing: true,
      allowChatMessages: true,
      recordSession: false,
      requireApprovalToJoin: false,
      maxParticipants: 10,
      autoSaveInterval: 30,
      cursorUpdateInterval: 100
    };

    const session: CollaborationSession = {
      id: this.generateId(),
      projectId,
      name: `Collaboration Session - ${new Date().toLocaleDateString()}`,
      hostId: this.currentUserId!,
      hostName: 'Current User', // TODO: Get from user context
      participants: [],
      createdAt: new Date(),
      status: 'waiting',
      settings: { ...defaultSettings, ...settings },
      sharedViewport: this.getDefaultViewport(),
      permissions: {
        canEdit: [this.currentUserId!],
        canView: [this.currentUserId!],
        canComment: [this.currentUserId!],
        canManageSession: [this.currentUserId!]
      }
    };

    // TODO: Save session to database
    await this.saveSession(session);

    this.currentSessionId = session.id;
    
    return session;
  }

  async joinSession(sessionId: string, userId: string): Promise<SessionParticipant> {
    const participant: SessionParticipant = {
      userId,
      userName: 'User', // TODO: Get from user context
      email: 'user@example.com',
      joinedAt: new Date(),
      lastSeen: new Date(),
      status: 'online',
      role: 'participant',
      permissions: {
        canEdit: true,
        canComment: true,
        canUseVideo: true,
        canUseAudio: true,
        canShareScreen: true,
        canInviteOthers: false
      },
      videoEnabled: false,
      audioEnabled: false,
      screenSharing: false
    };

    this.currentSessionId = sessionId;
    
    // Emit join event
    this.emit('user_joined', {
      userId,
      userName: participant.userName,
      sessionId
    });

    return participant;
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    this.emit('user_left', {
      userId,
      sessionId
    });

    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }

  async updateSessionSettings(
    sessionId: string, 
    settings: Partial<SessionSettings>
  ): Promise<void> {
    // TODO: Update session in database
    console.log('Updating session settings:', settings);
  }

  // Cursor & Viewport Management
  async updateCursor(sessionId: string, cursor: LiveCursor): Promise<void> {
    this.emit('cursor_moved', cursor);
  }

  async updateViewport(sessionId: string, viewport: SharedViewport): Promise<void> {
    this.emit('viewport_changed', viewport);
  }

  async syncViewportToParticipants(
    sessionId: string, 
    viewport: SharedViewport
  ): Promise<void> {
    this.emit('viewport_changed', {
      ...viewport,
      synchronizeView: true,
      followHost: true
    });
  }

  // Comments & Communication
  async addComment(
    comment: Partial<CollaborativeComment>
  ): Promise<CollaborativeComment> {
    const newComment: CollaborativeComment = {
      id: this.generateId(),
      sessionId: this.currentSessionId!,
      projectId: comment.projectId!,
      documentId: comment.documentId,
      authorId: this.currentUserId!,
      authorName: 'Current User', // TODO: Get from user context
      content: comment.content!,
      attachments: comment.attachments || [],
      position: comment.position!,
      timestamp: new Date(),
      status: 'active',
      thread: [],
      mentions: comment.mentions || [],
      reactions: [],
      visibility: comment.visibility || 'public'
    };

    // TODO: Save comment to database
    await this.saveComment(newComment);

    this.emit('comment_added', newComment);

    // Send notifications for mentions
    if (newComment.mentions.length > 0) {
      for (const mentionedUserId of newComment.mentions) {
        await this.createNotification({
          userId: mentionedUserId,
          projectId: newComment.projectId,
          sessionId: newComment.sessionId,
          type: 'mention',
          title: 'You were mentioned',
          message: `${newComment.authorName} mentioned you in a comment`,
          priority: 'normal'
        });
      }
    }

    return newComment;
  }

  async replyToComment(
    commentId: string, 
    reply: Partial<CommentReply>
  ): Promise<CommentReply> {
    const newReply: CommentReply = {
      id: this.generateId(),
      authorId: this.currentUserId!,
      authorName: 'Current User', // TODO: Get from user context
      content: reply.content!,
      timestamp: new Date(),
      mentions: reply.mentions || [],
      reactions: []
    };

    // TODO: Add reply to comment in database
    
    this.emit('comment_updated', {
      commentId,
      reply: newReply
    });

    return newReply;
  }

  async resolveComment(commentId: string, userId: string): Promise<void> {
    // TODO: Update comment status in database
    
    this.emit('comment_resolved', {
      commentId,
      resolvedBy: userId
    });
  }

  async addReaction(
    commentId: string, 
    reaction: Partial<CommentReaction>
  ): Promise<void> {
    // TODO: Add reaction to database
    
    this.emit('comment_updated', {
      commentId,
      reaction: {
        ...reaction,
        userId: this.currentUserId!,
        userName: 'Current User',
        timestamp: new Date()
      }
    });
  }

  // Team Communication
  async sendMessage(
    message: Partial<TeamCommunication>
  ): Promise<TeamCommunication> {
    const newMessage: TeamCommunication = {
      id: this.generateId(),
      projectId: message.projectId!,
      channelId: message.channelId,
      senderId: this.currentUserId!,
      senderName: 'Current User', // TODO: Get from user context
      messageType: message.messageType || 'text',
      content: message.content!,
      attachments: message.attachments,
      mentions: message.mentions || [],
      timestamp: new Date(),
      threadId: message.threadId,
      reactions: [],
      isSystemMessage: false
    };

    // TODO: Save message to database
    await this.saveMessage(newMessage);

    this.emit('message_sent', newMessage);

    return newMessage;
  }

  async mentionUser(messageId: string, userId: string): Promise<void> {
    await this.createNotification({
      userId,
      projectId: '', // TODO: Get from message context
      type: 'mention',
      title: 'You were mentioned',
      message: 'Someone mentioned you in a message',
      priority: 'normal'
    });
  }

  // Video/Audio Features
  async startVideoCall(
    sessionId: string, 
    settings: VideoCallSettings
  ): Promise<VideoCallState> {
    const videoCall: VideoCallState = {
      sessionId,
      isActive: true,
      participants: [],
      host: this.currentUserId!,
      settings
    };

    this.emit('video_toggled', {
      action: 'call_started',
      settings
    });

    return videoCall;
  }

  async endVideoCall(sessionId: string): Promise<void> {
    this.emit('video_toggled', {
      action: 'call_ended'
    });
  }

  async toggleVideo(
    sessionId: string, 
    userId: string, 
    enabled: boolean
  ): Promise<void> {
    this.emit('video_toggled', {
      userId,
      enabled
    });
  }

  async toggleAudio(
    sessionId: string, 
    userId: string, 
    enabled: boolean
  ): Promise<void> {
    this.emit('audio_toggled', {
      userId,
      enabled
    });
  }

  async startScreenShare(sessionId: string, userId: string): Promise<any> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      this.emit('screen_share_started', {
        userId,
        streamId: stream.id
      });

      return {
        isActive: true,
        sharedBy: userId,
        sharedByName: 'Current User',
        streamId: stream.id,
        startedAt: new Date(),
        quality: 'high',
        includeAudio: true
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare(sessionId: string, userId: string): Promise<void> {
    this.emit('screen_share_stopped', {
      userId
    });
  }

  // Recording Features
  async startRecording(sessionId: string, userId: string): Promise<any> {
    const recording = {
      id: this.generateId(),
      isRecording: true,
      startedAt: new Date(),
      startedBy: userId,
      duration: 0,
      status: 'recording' as const
    };

    this.emit('recording_started', recording);

    return recording;
  }

  async stopRecording(sessionId: string, recordingId: string): Promise<any> {
    this.emit('recording_stopped', {
      recordingId
    });

    return {
      id: recordingId,
      isRecording: false,
      status: 'processing' as const
    };
  }

  // Notifications
  async createNotification(
    notification: Partial<NotificationEvent>
  ): Promise<NotificationEvent> {
    const newNotification: NotificationEvent = {
      id: this.generateId(),
      userId: notification.userId!,
      projectId: notification.projectId!,
      sessionId: notification.sessionId,
      type: notification.type!,
      title: notification.title!,
      message: notification.message!,
      data: notification.data,
      timestamp: new Date(),
      read: false,
      actionUrl: notification.actionUrl,
      priority: notification.priority || 'normal'
    };

    // TODO: Save notification to database
    
    return newNotification;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    // TODO: Update notification in database
  }

  async getNotifications(userId: string, limit: number = 50): Promise<NotificationEvent[]> {
    // TODO: Fetch notifications from database
    return [];
  }

  // Helper Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getDefaultViewport(): SharedViewport {
    return {
      id: this.generateId(),
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
    };
  }

  private setupHeartbeat(): void {
    setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  // Database operations (to be implemented with actual database)
  private async saveSession(session: CollaborationSession): Promise<void> {
    // TODO: Implement database save
    console.log('Saving session:', session.id);
  }

  private async saveComment(comment: CollaborativeComment): Promise<void> {
    // TODO: Implement database save
    console.log('Saving comment:', comment.id);
  }

  private async saveMessage(message: TeamCommunication): Promise<void> {
    // TODO: Implement database save
    console.log('Saving message:', message.id);
  }
}

// Singleton instance
export const collaborationService = new CollaborationService(); 