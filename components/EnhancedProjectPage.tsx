'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import EnhancedComments from './EnhancedComments';
import FileViewer from './FileViewer';
import { 
  HeartIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  ShareIcon,
  BookmarkIcon,
  CalendarIcon,
  TagIcon,
  ShieldCheckIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  readme?: string;
  discipline: string;
  tags: string[];
  license: string;
  image_url?: string;
  view_count: number;
  like_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  owner: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  files: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    downloadUrl?: string;
    lastModified?: string;
  }>;
}

interface EnhancedProjectPageProps {
  project: Project;
  canEdit?: boolean;
}

export default function EnhancedProjectPage({ project, canEdit = false }: EnhancedProjectPageProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(project.like_count);
  const [viewTracked, setViewTracked] = useState(false);

  // Track project view on component mount
  useEffect(() => {
    if (!viewTracked) {
      trackView();
      setViewTracked(true);
    }
  }, []);

  const trackView = async () => {
    try {
      await fetch(`/api/projects/${project.id}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'view' })
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handleLike = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to like projects');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: isLiked ? 'unlike' : 'like' 
        })
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to save projects');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${project.id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: isSaved ? 'unsave' : 'save' 
        })
      });

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/projects/${project.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Project link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalFileSize = project.files.reduce((total, file) => total + file.size, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Image/Preview */}
            <div className="lg:col-span-1">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <div className="text-center">
                      <UserIcon className="w-24 h-24 text-blue-400 mx-auto mb-4" />
                      <p className="text-blue-600 font-medium">Project Preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Project Info */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Title and Author */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {project.owner.avatar_url ? (
                        <img
                          src={project.owner.avatar_url}
                          alt={project.owner.display_name}
                          className="w-8 h-8 rounded-full border border-gray-200"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{project.owner.display_name}</p>
                        <p className="text-sm text-gray-500">@{project.owner.username}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-700 text-lg leading-relaxed">{project.description}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <EyeIcon className="w-4 h-4" />
                    <span>{project.view_count.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>{project.download_count.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TagIcon className="w-4 h-4" />
                    <span>{project.files.length} files ({formatFileSize(totalFileSize)})</span>
                  </div>
                </div>

                {/* Tags and License */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {project.discipline}
                    </span>
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Licensed under {project.license}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      isLiked
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isLiked ? (
                      <HeartIconSolid className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>{likeCount}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      isSaved
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkIconSolid className="w-5 h-5" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5" />
                    )}
                    <span>Save</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span>Share</span>
                  </button>

                  {canEdit && (
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Analytics</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* README */}
            {project.readme && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">About this project</h2>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {project.readme}
                  </div>
                </div>
              </div>
            )}

            {/* Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <FileViewer
                files={project.files}
                projectId={project.id}
                canDownload={project.is_public || canEdit}
              />
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <EnhancedComments
                projectId={project.id}
                canComment={project.is_public || canEdit}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download All Files</span>
                  </button>
                  
                  {canEdit && (
                    <>
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <span>Edit Project</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>View Analytics</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Project Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Project Statistics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Views</span>
                    <span className="font-medium">{project.view_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Downloads</span>
                    <span className="font-medium">{project.download_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Likes</span>
                    <span className="font-medium">{likeCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">{formatDate(project.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Related Projects */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold mb-4">Related Projects</h3>
                <p className="text-sm text-gray-500">
                  Discover similar projects in {project.discipline}
                </p>
                {/* Related projects would be loaded here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 