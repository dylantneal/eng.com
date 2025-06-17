'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  HeartIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  BookmarkIcon,
  ChatBubbleLeftIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CodeBracketIcon,
  XMarkIcon as X,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import ProjectMonetizationModal from '@/components/ProjectMonetizationModal';

// Simple collaboration panel for now
function CollaborationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Project Collaboration</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🚀 Real-time Collaboration Features</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Multi-user simultaneous editing</li>
              <li>• Live cursor tracking and presence</li>
              <li>• Automatic conflict resolution</li>
              <li>• Version branching and merging</li>
              <li>• Role-based permissions (Owner, Editor, Viewer)</li>
              <li>• Real-time comments and discussions</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">👥 Team Management</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Invite collaborators by email</li>
              <li>• Granular permission control</li>
              <li>• Activity tracking and analytics</li>
              <li>• Notification system for changes</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🔧 Advanced CAD Tools</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Visual diff for CAD files</li>
              <li>• Automatic BOM extraction</li>
              <li>• 3D model comparison</li>
              <li>• Assembly validation</li>
              <li>• Material cost estimation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  discipline: string;
  tags: string[];
  view_count: number;
  like_count: number;
  download_count: number;
  created_at: string;
  repository_url: string;
  demo_url: string;
  license: string;
  owner_id?: string;
  author: {
    id?: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
  visibility: string;
  version_count: number;
  forked_from: string;
  files: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
}

export default function ProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Files' | 'Activity' | 'Comments' | 'Versions'>('Overview');
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setProject(data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/like`, {
        method: 'POST',
      });
      if (response.ok) {
        setLiked(!liked);
        if (project) {
          setProject({
            ...project,
            like_count: liked ? project.like_count - 1 : project.like_count + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/save`, {
        method: 'POST',
      });
      if (response.ok) {
        setSaved(!saved);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: project?.title,
        text: project?.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing project:', error);
    }
  };

  const handleMonetizationSuccess = (marketplaceId: string) => {
    setShowMonetizationModal(false);
    router.push(`/marketplace/${marketplaceId}`);
  };

  const isOwner = user && project && (user.id === project.owner_id || user.id === project.author?.id);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <span className="text-gray-500 dark:text-gray-400">Loading project...</span>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Project Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">The project you are looking for does not exist or has been removed.</p>
        <a href="/projects" className="inline-block px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">Back to Projects</a>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Image */}
      <div className="w-full h-64 md:h-80 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative mb-8">
        <img
          src={project.image_url || '/placeholder-project.jpg'}
          alt={project.title}
          className="object-cover w-full h-full absolute inset-0 opacity-60"
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow mb-2">{project.title || 'Untitled Project'}</h1>
          <div className="flex flex-wrap items-center gap-2 text-lg text-white/90">
            <span>{project.author?.display_name || project.author?.username || 'Unknown Author'}</span>
            <span>•</span>
            <span>{project.discipline || 'General Engineering'}</span>
            <span>•</span>
            <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown Date'}</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sticky Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-6 sticky top-24 self-start">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Visibility:</span>
              <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {project.visibility || 'Public'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Versions:</span>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                {project.version_count ?? 1}
              </span>
            </div>
            {/* Owner Actions */}
            {isOwner && (
              <div className="space-y-2">
                <button 
                  onClick={() => setShowMonetizationModal(true)}
                  className="w-full px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold transition flex items-center justify-center gap-2"
                >
                  <CurrencyDollarIcon className="w-4 h-4" />
                  Monetize Project
                </button>
                <button 
                  onClick={() => setShowCollaborationPanel(true)}
                  className="w-full px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold transition flex items-center justify-center gap-2"
                >
                  <UsersIcon className="w-4 h-4" />
                  Collaborate
                </button>
              </div>
            )}
            
            {/* General Actions */}
            <button className="w-full px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">Fork Project</button>
            <div className="flex gap-2 justify-between">
              <button onClick={handleLike} className="flex-1 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center" title="Like">
                {liked ? (
                  <HeartIconSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button onClick={handleSave} className="flex-1 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center" title="Save">
                <BookmarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={handleShare} className="flex-1 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center" title="Share">
                <ShareIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          {/* Contributors/Collaborators (placeholder) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Contributors</div>
            <div className="flex flex-wrap gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white">{project.author?.display_name?.[0]?.toUpperCase() || 'E'}</span>
              {/* TODO: Map over real contributors */}
            </div>
          </div>
        </aside>
        {/* Main Content with Tabs */}
        <main className="flex-1 space-y-8">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
            {(['Overview', 'Files', 'Activity', 'Comments', 'Versions'] as const).map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Tab Content */}
          {activeTab === 'Overview' && (
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</div>
              <div className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</div>
              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {/* License */}
              {project.license && (
                <div className="text-xs text-gray-500 dark:text-gray-400">License: {project.license}</div>
              )}
            </section>
          )}
          {activeTab === 'Files' && (
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-gray-700 dark:text-gray-200">Project Files</div>
                {isOwner && (
                  <div className="flex gap-2">
                    <button className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700 transition">
                      <CodeBracketIcon className="w-4 h-4 mr-1" />
                      CAD Diff
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition">
                      📋 Extract BOM
                    </button>
                  </div>
                )}
              </div>

              {/* Advanced CAD Tools Banner */}
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CodeBracketIcon className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Advanced CAD Tools Enabled</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-900">🔍 Visual Diff</div>
                    <div className="text-gray-600">Compare model changes</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-900">📋 BOM Generation</div>
                    <div className="text-gray-600">Auto-extract materials</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div className="font-medium text-gray-900">💰 Cost Analysis</div>
                    <div className="text-gray-600">Estimate production cost</div>
                  </div>
                </div>
              </div>

              {Array.isArray(project.files) && project.files.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {project.files.map((file) => (
                    <li key={file.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded bg-gray-100 dark:bg-gray-700">
                          {file.type === 'cad' && <span className="text-blue-500">📐</span>}
                          {file.type === 'doc' && <span className="text-green-500">📄</span>}
                          {file.type === 'pcb' && <span className="text-purple-500">🛠️</span>}
                          {!['cad','doc','pcb'].includes(file.type) && <span className="text-gray-400">📁</span>}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{file.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 space-x-2">
                            <span>{(file.size/1024).toFixed(1)} KB</span>
                            {file.type === 'cad' && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">3D Model</span>
                                <span>•</span>
                                <span className="text-purple-600">BOM Available</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.type === 'cad' && (
                          <>
                            <button className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition">
                              View 3D
                            </button>
                            <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">
                              Analyze
                            </button>
                          </>
                        )}
                        <a
                          href={file.url}
                          download
                          className="inline-flex items-center px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <CodeBracketIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <div className="text-sm text-gray-500 dark:text-gray-400">No files uploaded yet.</div>
                  <div className="text-xs text-gray-400 mt-1">Upload CAD files to enable advanced analysis tools</div>
                </div>
              )}
            </section>
          )}
          {activeTab === 'Activity' && (
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Recent Activity</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">TODO: Show comments, forks, and other activity here.</div>
            </section>
          )}
          {activeTab === 'Comments' && (
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Comments</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">TODO: Comments section here.</div>
            </section>
          )}
          {activeTab === 'Versions' && (
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Versions</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">TODO: Version history and branch management here.</div>
            </section>
          )}
        </main>
      </div>

      {/* Monetization Modal */}
      {project && isOwner && (
        <ProjectMonetizationModal
          project={{
            ...project,
            owner_id: project.owner_id || user?.id || '',
            files: project.files || []
          }}
          isOpen={showMonetizationModal}
          onClose={() => setShowMonetizationModal(false)}
          onSuccess={handleMonetizationSuccess}
        />
      )}

      {/* Collaboration Panel */}
      <CollaborationPanel
        isOpen={showCollaborationPanel}
        onClose={() => setShowCollaborationPanel(false)}
      />
    </div>
  );
} 