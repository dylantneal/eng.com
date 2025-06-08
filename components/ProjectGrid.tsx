'use client';

import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
  is_public: boolean | null;
}

interface ProjectGridProps {
  projects: Project[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getFileTypeIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('stl') || lower.includes('3d')) return '🔺';
    if (lower.includes('step') || lower.includes('stp')) return '⚙️';
    if (lower.includes('cad')) return '📐';
    if (lower.includes('robot')) return '🤖';
    if (lower.includes('print')) return '🖨️';
    return '🔧';
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.slug}`}
          className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200"
        >
          {/* Project Thumbnail/Preview */}
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-50 group-hover:to-purple-50 transition-colors duration-200">
            <div className="text-6xl opacity-50 group-hover:opacity-70 transition-opacity duration-200">
              {getFileTypeIcon(project.title)}
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            {/* Quick Actions */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                {project.title}
              </h3>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(project.updated_at)}
                </span>
              </div>
              
                             <div className="flex items-center space-x-2">
                {project.is_public === true && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar Animation */}
            <div className="mt-4">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 