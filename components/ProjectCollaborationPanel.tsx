'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  UserPlus,
  Shield,
  Edit3,
  Eye,
  Crown,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
  Mail,
  Globe,
  Lock,
  MessageSquare,
  Activity,
  GitBranch,
  Settings
} from 'lucide-react';

interface Collaborator {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: {
    read: boolean;
    write: boolean;
    delete: boolean;
    invite: boolean;
    admin: boolean;
  };
  status: 'active' | 'pending' | 'inactive';
  last_active: string;
  joined_at: string;
}

interface EditSession {
  id: string;
  user_id: string;
  username: string;
  file_path: string;
  started_at: string;
  last_heartbeat: string;
  changes_count: number;
}

interface ConflictResolution {
  id: string;
  file_path: string;
  conflicting_users: string[];
  conflict_type: 'simultaneous_edit' | 'version_mismatch' | 'permission_change';
  status: 'pending' | 'resolved' | 'escalated';
  created_at: string;
  resolution_strategy?: 'merge' | 'overwrite' | 'branch' | 'manual';
}

interface ProjectCollaborationPanelProps {
  projectId: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectCollaborationPanel({
  projectId,
  isOwner,
  isOpen,
  onClose
}: ProjectCollaborationPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'conflicts' | 'settings'>('members');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activeSessions, setActiveSessions] = useState<EditSession[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const roles = [
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full control over project and team',
      permissions: { read: true, write: true, delete: true, invite: true, admin: true },
      color: 'text-purple-600',
      icon: Crown
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Manage team and project settings',
      permissions: { read: true, write: true, delete: false, invite: true, admin: true },
      color: 'text-blue-600',
      icon: Shield
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Edit and contribute to project',
      permissions: { read: true, write: true, delete: false, invite: false, admin: false },
      color: 'text-green-600',
      icon: Edit3
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'View project and leave comments',
      permissions: { read: true, write: false, delete: false, invite: false, admin: false },
      color: 'text-gray-600',
      icon: Eye
    }
  ];

  useEffect(() => {
    if (isOpen) {
      loadCollaborationData();
      // Set up real-time updates
      const interval = setInterval(loadCollaborationData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, projectId]);

  const loadCollaborationData = async () => {
    setLoading(true);
    try {
      // Simulate loading collaboration data
      // In production, this would be real API calls
      const mockCollaborators: Collaborator[] = [
        {
          id: '1',
          user_id: user?.id || 'current-user',
          username: user?.username || 'you',
          display_name: user?.display_name || 'You',
          avatar_url: user?.avatar_url,
          role: 'owner',
          permissions: { read: true, write: true, delete: true, invite: true, admin: true },
          status: 'active',
          last_active: new Date().toISOString(),
          joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          user_id: 'user-2',
          username: 'sarah_engineer',
          display_name: 'Sarah Johnson',
          avatar_url: 'https://picsum.photos/seed/sarah/40/40',
          role: 'editor',
          permissions: { read: true, write: true, delete: false, invite: false, admin: false },
          status: 'active',
          last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          joined_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          user_id: 'user-3',
          username: 'mike_reviewer',
          display_name: 'Mike Chen',
          avatar_url: 'https://picsum.photos/seed/mike/40/40',
          role: 'viewer',
          permissions: { read: true, write: false, delete: false, invite: false, admin: false },
          status: 'pending',
          last_active: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const mockActiveSessions: EditSession[] = [
        {
          id: '1',
          user_id: 'user-2',
          username: 'sarah_engineer',
          file_path: '/models/main_assembly.step',
          started_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          last_heartbeat: new Date(Date.now() - 30 * 1000).toISOString(),
          changes_count: 12
        }
      ];

      const mockConflicts: ConflictResolution[] = [
        {
          id: '1',
          file_path: '/pcb/schematic.kicad_sch',
          conflicting_users: ['sarah_engineer', 'mike_reviewer'],
          conflict_type: 'simultaneous_edit',
          status: 'pending',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        }
      ];

      setCollaborators(mockCollaborators);
      setActiveSessions(mockActiveSessions);
      setConflicts(mockConflicts);
    } catch (error) {
      console.error('Error loading collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborate/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      });

      if (response.ok) {
        setInviteEmail('');
        setShowInviteForm(false);
        loadCollaborationData();
      }
    } catch (error) {
      console.error('Error inviting collaborator:', error);
    }
  };

  const handleRoleChange = async (collaboratorId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborate/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collaborator_id: collaboratorId,
          role: newRole
        })
      });

      if (response.ok) {
        loadCollaborationData();
      }
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const handleConflictResolution = async (conflictId: string, strategy: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborate/resolve-conflict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflict_id: conflictId,
          resolution_strategy: strategy
        })
      });

      if (response.ok) {
        loadCollaborationData();
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Project Collaboration</h2>
              <p className="text-gray-600">Manage team members, permissions, and real-time editing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Status Bar */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  {activeSessions.length} active editing session{activeSessions.length !== 1 ? 's' : ''}
                </span>
              </div>
              {conflicts.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} need resolution
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm text-blue-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(['members', 'activity', 'conflicts', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'conflicts' && conflicts.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                  {conflicts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                {isOwner && (
                  <button
                    onClick={() => setShowInviteForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                  </button>
                )}
              </div>

              {/* Invite Form */}
              {showInviteForm && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Invite New Collaborator</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleInviteCollaborator}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Send Invite
                    </button>
                    <button
                      onClick={() => setShowInviteForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Collaborators List */}
              <div className="space-y-3">
                {collaborators.map((collaborator) => {
                  const role = roles.find(r => r.id === collaborator.role);
                  const RoleIcon = role?.icon || Users;
                  
                  return (
                    <div key={collaborator.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={collaborator.avatar_url || '/default-avatar.jpg'}
                          alt={collaborator.display_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{collaborator.display_name}</span>
                            <span className="text-sm text-gray-500">@{collaborator.username}</span>
                            {collaborator.status === 'pending' && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <RoleIcon className={`w-4 h-4 ${role?.color}`} />
                            <span>{role?.name}</span>
                            <span>•</span>
                            <Clock className="w-4 h-4" />
                            <span>Active {new Date(collaborator.last_active).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {isOwner && collaborator.role !== 'owner' && (
                        <div className="flex items-center gap-2">
                          <select
                            value={collaborator.role}
                            onChange={(e) => handleRoleChange(collaborator.id, e.target.value)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
              
              {/* Active Sessions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Active Editing Sessions</h4>
                {activeSessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active editing sessions</p>
                ) : (
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div>
                            <div className="font-medium text-gray-900">{session.username}</div>
                            <div className="text-sm text-gray-600">Editing {session.file_path}</div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{session.changes_count} changes</div>
                          <div>Started {new Date(session.started_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conflicts Tab */}
          {activeTab === 'conflicts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Conflict Resolution</h3>
              
              {conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-500">No conflicts detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <span className="font-medium text-gray-900">
                              {conflict.conflict_type.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            File: <code className="bg-gray-100 px-2 py-1 rounded">{conflict.file_path}</code>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Users involved: {conflict.conflicting_users.join(', ')}
                          </div>
                        </div>
                        <span className="text-xs text-orange-600">
                          {new Date(conflict.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {isOwner && conflict.status === 'pending' && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleConflictResolution(conflict.id, 'merge')}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Auto Merge
                          </button>
                          <button
                            onClick={() => handleConflictResolution(conflict.id, 'branch')}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Create Branch
                          </button>
                          <button
                            onClick={() => handleConflictResolution(conflict.id, 'manual')}
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Manual Review
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Collaboration Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Real-time Editing</div>
                    <div className="text-sm text-gray-600">Allow multiple users to edit simultaneously</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Auto-save Changes</div>
                    <div className="text-sm text-gray-600">Automatically save changes every 30 seconds</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Conflict Notifications</div>
                    <div className="text-sm text-gray-600">Send email notifications for editing conflicts</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 