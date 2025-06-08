'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

interface Version {
  id: string;
  created_at: string | null;
  readme: string | null;
  files: any; // Json type from Supabase
}

interface VersionHistoryProps {
  projectId: string;
  currentVersionId?: string;
  className?: string;
}

export default function VersionHistory({ projectId, currentVersionId, className = '' }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(currentVersionId || null);

  useEffect(() => {
    fetchVersions();
  }, [projectId]);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      const supabase = supabaseBrowser;
      
      const { data, error } = await supabase
        .from('versions')
        .select('id, created_at, readme, files')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching versions:', error);
        return;
      }

      setVersions(data || []);
      if (!selectedVersion && data?.length > 0) {
        setSelectedVersion(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilesSummary = (files: Version['files']) => {
    if (!files || files.length === 0) return 'No files';
    if (files.length === 1) return `1 file`;
    return `${files.length} files`;
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        No versions found
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-4">Version History</h3>
      
      <div className="space-y-2">
        {versions.map((version, index) => (
          <div
            key={version.id}
            className={`p-3 rounded border cursor-pointer transition-colors ${
              selectedVersion === version.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedVersion(version.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index === 0 ? 'L' : index + 1}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {index === 0 ? 'Latest Version' : `Version ${versions.length - index}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(version.created_at)} • {getFilesSummary(version.files)}
                  </div>
                </div>
              </div>
              
              {selectedVersion === version.id && (
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {version.files && Array.isArray(version.files) && version.files.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Files: {version.files.map((f: any) => f.name).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        💡 Pro tip: Branching and merging coming in V1+
      </div>
    </div>
  );
} 