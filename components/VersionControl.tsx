'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GitBranch, GitCommit, Clock, User, FileText } from 'lucide-react';

type Version = {
  id: string;
  version_no: number;
  created_at: string;
  readme_md: string | null;
  file_count: number;
  total_size: number;
  has_files: boolean;
};

interface VersionControlProps {
  projectId: string;
  canEdit: boolean;
}

export default function VersionControl({ projectId, canEdit }: VersionControlProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadVersionHistory();
  }, [projectId]);

  const loadVersionHistory = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/versions`);
      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }
      
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCommit = async () => {
    if (!commitMessage.trim() || !canEdit) return;

    try {
      const formData = new FormData();
      formData.set('changelog', commitMessage.trim());
      formData.set('readme_md', commitMessage.trim());
      
      // For now, we'll require at least a dummy file since the API requires files
      // In a real implementation, this would be handled through a proper file upload flow
      const dummyFile = new File(['# Version Update\n\n' + commitMessage], 'changelog.md', {
        type: 'text/markdown'
      });
      formData.append('files', dummyFile);

      const response = await fetch(`/api/projects/${projectId}/versions`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create version');
      }

      const result = await response.json();
      
      // Reload version history to show the new version
      await loadVersionHistory();
      
      setCommitMessage('');
      setShowCommitModal(false);
    } catch (error) {
      console.error('Error creating version:', error);
      alert(error instanceof Error ? error.message : 'Failed to create version');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">Version History</h3>
          </div>
          {canEdit && (
            <button
              onClick={() => setShowCommitModal(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
            >
              <GitCommit className="w-4 h-4" />
              New Version
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {versions.map((version) => (
            <div key={version.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <GitCommit className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Version {version.version_no}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(version.created_at)}
                  </span>
                  {version.file_count && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {version.file_count} files
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {version.readme_md || 'No description available'}
                </p>
                
                {version.has_files && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/api/projects/${projectId}/download?version=${version.version_no}`, '_blank')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Files
                    </button>
                    <span className="text-xs text-gray-400">•</span>
                    <button
                      onClick={() => window.open(`/api/projects/${projectId}/download?version=${version.version_no}`, '_blank')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {versions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No versions yet</p>
            <p className="text-sm">Create your first version to start tracking changes</p>
          </div>
        )}
      </div>

      {showCommitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Version</h3>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe your changes..."
              className="w-full px-3 py-2 border rounded-md mb-4 h-24 resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCommitModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createCommit}
                disabled={!commitMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Create Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 