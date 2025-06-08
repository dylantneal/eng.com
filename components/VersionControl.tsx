'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GitBranch, GitCommit, Clock, User, FileText } from 'lucide-react';

type Version = {
  id: string;
  version_no: number;
  created_at: string;
  readme_md: string | null;
  files: any;
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
      const { data, error } = await supabase
        .from('project_versions')
        .select('id, version_no, created_at, readme_md, files')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCommit = async () => {
    if (!commitMessage.trim() || !canEdit) return;

    try {
      const { data, error } = await supabase
        .from('project_versions')
        .insert({
          project_id: projectId,
          version_no: (versions[0]?.version_no || 0) + 1,
          readme_md: commitMessage,
          files: {}
        })
        .select()
        .single();

      if (error) throw error;

      setVersions(prev => [data, ...prev]);
      setCommitMessage('');
      setShowCommitModal(false);
    } catch (error) {
      console.error('Error creating commit:', error);
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
            <div key={version.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <GitCommit className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    v{version.version_no}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(version.created_at)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600">
                  {version.readme_md || 'No commit message'}
                </p>
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