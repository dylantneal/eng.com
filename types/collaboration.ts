// Real-time Collaboration System Types for Engineering Projects

export interface CollaborationSession {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  hostId: string;
  hostName: string;
  participants: SessionParticipant[];
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: 'waiting' | 'active' | 'paused' | 'ended';
  settings: SessionSettings;
  sharedViewport: SharedViewport;
  activeDocument?: string; // Currently focused file/CAD model
  permissions: SessionPermissions;
}

export interface SessionParticipant {
  userId: string;
  userName: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
  lastSeen: Date;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'host' | 'co-host' | 'participant' | 'viewer';
  permissions: ParticipantPermissions;
  cursor?: LiveCursor;
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
}

export interface SessionSettings {
  allowVideoAudio: boolean;
  allowScreenSharing: boolean;
  allowFileEditing: boolean;
  allowChatMessages: boolean;
  recordSession: boolean;
  requireApprovalToJoin: boolean;
  maxParticipants: number;
  autoSaveInterval: number; // in seconds
  cursorUpdateInterval: number; // in milliseconds
}

export interface SessionPermissions {
  canEdit: string[]; // User IDs who can edit
  canView: string[]; // User IDs who can view
  canComment: string[]; // User IDs who can comment
  canManageSession: string[]; // User IDs who can manage session
}

export interface ParticipantPermissions {
  canEdit: boolean;
  canComment: boolean;
  canUseVideo: boolean;
  canUseAudio: boolean;
  canShareScreen: boolean;
  canInviteOthers: boolean;
}

export interface LiveCursor {
  userId: string;
  userName: string;
  color: string;
  position: CursorPosition;
  lastUpdate: Date;
  selection?: CursorSelection;
  tool?: string; // Current tool/mode
}

export interface CursorPosition {
  x: number;
  y: number;
  z?: number; // For 3D environments
  viewportId?: string;
  documentId?: string;
  elementId?: string; // Specific element being hovered/selected
}

export interface CursorSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startZ?: number;
  endZ?: number;
  type: 'text' | 'area' | 'component' | 'line' | 'point';
}

export interface SharedViewport {
  id: string;
  type: '2d' | '3d' | 'cad' | 'pcb' | 'schematic';
  camera: CameraState;
  zoom: number;
  pan: { x: number; y: number };
  activeLayer?: string;
  displaySettings: DisplaySettings;
  synchronizeView: boolean;
  followHost: boolean;
}

export interface CameraState {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov?: number; // Field of view for 3D
}

export interface DisplaySettings {
  showGrid: boolean;
  showAxes: boolean;
  showDimensions: boolean;
  showMaterials: boolean;
  wireframeMode: boolean;
  lightingMode: 'standard' | 'realistic' | 'technical';
  backgroundStyle: 'solid' | 'gradient' | 'environment';
}

export interface CollaborativeComment {
  id: string;
  sessionId: string;
  projectId: string;
  documentId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  attachments: CommentAttachment[];
  position: CommentPosition;
  timestamp: Date;
  updatedAt?: Date;
  status: 'active' | 'resolved' | 'deleted';
  thread: CommentReply[];
  mentions: string[]; // User IDs mentioned
  reactions: CommentReaction[];
  visibility: 'public' | 'team' | 'private';
}

export interface CommentPosition {
  x: number;
  y: number;
  z?: number;
  elementId?: string;
  viewportId?: string;
  anchor: 'point' | 'area' | 'component';
  anchorData?: any; // Additional anchor-specific data
}

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
  updatedAt?: Date;
  mentions: string[];
  reactions: CommentReaction[];
}

export interface CommentAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface CommentReaction {
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

export interface ActivityEvent {
  id: string;
  sessionId: string;
  projectId: string;
  userId: string;
  userName: string;
  eventType: ActivityEventType;
  timestamp: Date;
  description: string;
  data: Record<string, any>;
  visibility: 'all' | 'team' | 'private';
}

export type ActivityEventType = 
  | 'user_joined'
  | 'user_left'
  | 'comment_added'
  | 'comment_resolved'
  | 'file_edited'
  | 'view_changed'
  | 'screen_shared'
  | 'recording_started'
  | 'recording_stopped'
  | 'permission_changed'
  | 'document_opened'
  | 'tool_selected'
  | 'measurement_taken'
  | 'annotation_added';

export interface TeamCommunication {
  id: string;
  projectId: string;
  channelId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  messageType: 'text' | 'file' | 'system' | 'mention' | 'reaction';
  content: string;
  attachments?: MessageAttachment[];
  mentions: string[];
  timestamp: Date;
  editedAt?: Date;
  threadId?: string; // For threaded replies
  reactions: MessageReaction[];
  isSystemMessage: boolean;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  thumbnailUrl?: string;
  preview?: FilePreview;
}

export interface FilePreview {
  type: 'image' | 'video' | 'audio' | 'document' | 'cad';
  previewUrl?: string;
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

export interface VideoCallState {
  sessionId: string;
  isActive: boolean;
  participants: VideoParticipant[];
  host: string;
  settings: VideoCallSettings;
  recording?: RecordingState;
  screenShare?: ScreenShareState;
}

export interface VideoParticipant {
  userId: string;
  userName: string;
  peerId: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoStream?: MediaStream;
  audioStream?: MediaStream;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
  quality: 'high' | 'medium' | 'low' | 'auto';
}

export interface VideoCallSettings {
  videoQuality: 'high' | 'medium' | 'low' | 'auto';
  audioQuality: 'high' | 'medium' | 'low';
  enableNoiseCancellation: boolean;
  enableEchoCancellation: boolean;
  muteOnJoin: boolean;
  videoOnJoin: boolean;
  maxParticipants: number;
}

export interface RecordingState {
  id: string;
  isRecording: boolean;
  startedAt: Date;
  startedBy: string;
  recordingUrl?: string;
  duration: number; // in seconds
  fileSize?: number;
  status: 'recording' | 'processing' | 'ready' | 'failed';
}

export interface ScreenShareState {
  isActive: boolean;
  sharedBy: string;
  sharedByName: string;
  streamId: string;
  startedAt: Date;
  quality: 'high' | 'medium' | 'low';
  includeAudio: boolean;
}

export interface NotificationEvent {
  id: string;
  userId: string;
  projectId: string;
  sessionId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export type NotificationType = 
  | 'mention'
  | 'comment'
  | 'session_invite'
  | 'session_started'
  | 'session_ended'
  | 'file_shared'
  | 'edit_conflict'
  | 'system_alert'
  | 'review_request';

// Real-time Collaboration Operations Interface
export interface CollaborationOperations {
  // Session Management
  createSession(projectId: string, settings: Partial<SessionSettings>): Promise<CollaborationSession>;
  joinSession(sessionId: string, userId: string): Promise<SessionParticipant>;
  leaveSession(sessionId: string, userId: string): Promise<void>;
  updateSessionSettings(sessionId: string, settings: Partial<SessionSettings>): Promise<void>;
  
  // Cursor & Viewport
  updateCursor(sessionId: string, cursor: LiveCursor): Promise<void>;
  updateViewport(sessionId: string, viewport: SharedViewport): Promise<void>;
  syncViewportToParticipants(sessionId: string, viewport: SharedViewport): Promise<void>;
  
  // Comments & Communication
  addComment(comment: Partial<CollaborativeComment>): Promise<CollaborativeComment>;
  replyToComment(commentId: string, reply: Partial<CommentReply>): Promise<CommentReply>;
  resolveComment(commentId: string, userId: string): Promise<void>;
  addReaction(commentId: string, reaction: Partial<CommentReaction>): Promise<void>;
  
  // Team Communication
  sendMessage(message: Partial<TeamCommunication>): Promise<TeamCommunication>;
  mentionUser(messageId: string, userId: string): Promise<void>;
  
  // Video/Audio
  startVideoCall(sessionId: string, settings: VideoCallSettings): Promise<VideoCallState>;
  endVideoCall(sessionId: string): Promise<void>;
  toggleVideo(sessionId: string, userId: string, enabled: boolean): Promise<void>;
  toggleAudio(sessionId: string, userId: string, enabled: boolean): Promise<void>;
  startScreenShare(sessionId: string, userId: string): Promise<ScreenShareState>;
  stopScreenShare(sessionId: string, userId: string): Promise<void>;
  
  // Recording
  startRecording(sessionId: string, userId: string): Promise<RecordingState>;
  stopRecording(sessionId: string, recordingId: string): Promise<RecordingState>;
  
  // Notifications
  createNotification(notification: Partial<NotificationEvent>): Promise<NotificationEvent>;
  markNotificationRead(notificationId: string): Promise<void>;
  getNotifications(userId: string, limit?: number): Promise<NotificationEvent[]>;
}

// WebSocket Event Types for Real-time Updates
export interface WebSocketEvent {
  type: WebSocketEventType;
  sessionId: string;
  userId: string;
  timestamp: Date;
  data: any;
}

export type WebSocketEventType = 
  | 'cursor_moved'
  | 'cursor_selection'
  | 'viewport_changed'
  | 'comment_added'
  | 'comment_updated'
  | 'comment_resolved'
  | 'user_joined'
  | 'user_left'
  | 'user_typing'
  | 'message_sent'
  | 'video_toggled'
  | 'audio_toggled'
  | 'screen_share_started'
  | 'screen_share_stopped'
  | 'recording_started'
  | 'recording_stopped'
  | 'file_edited'
  | 'permission_changed'
  | 'session_ended'; 