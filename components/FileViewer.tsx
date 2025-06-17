'use client';

import { useState, useRef } from 'react';
import Simple3DViewer from './Simple3DViewer';
import { 
  DocumentIcon, 
  PhotoIcon, 
  CubeIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  downloadUrl?: string;
  lastModified?: string;
}

interface FileViewerProps {
  files: FileItem[];
  projectId: string;
  canDownload?: boolean;
}

// No longer needed - using Simple3DViewer component instead

// Image Viewer Component
function ImageViewer({ fileUrl, fileName }: { fileUrl: string; fileName: string }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        <div className="flex items-center justify-center min-h-64">
          {!imageLoaded && !imageError && (
            <div className="text-center">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading image...</p>
            </div>
          )}
          
          {imageError && (
            <div className="text-center p-8">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load image</p>
            </div>
          )}
          
          <img
            src={fileUrl}
            alt={fileName}
            className={`max-w-full max-h-96 object-contain cursor-zoom-in ${
              imageLoaded ? 'block' : 'hidden'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            onClick={() => setFullscreen(true)}
          />
        </div>
        
        {imageLoaded && (
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setFullscreen(true)}
              className="p-2 bg-black bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 transition-colors"
              title="View fullscreen"
            >
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-screen max-h-screen p-4">
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-75 text-white rounded-lg hover:bg-opacity-90"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Main File Viewer Component
export default function FileViewer({ files, projectId, canDownload = true }: FileViewerProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewMode, setPreviewMode] = useState<'grid' | 'list'>('list');
  const [filter, setFilter] = useState('');

  // Filter files based on search
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(filter.toLowerCase()) ||
    file.type.toLowerCase().includes(filter.toLowerCase())
  );

  const getFileIcon = (file: FileItem) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type.toLowerCase();

    // 3D file types
    if (['stl', 'obj', 'ply', 'step', 'stp', 'iges', 'igs'].includes(extension)) {
      return <CubeIcon className="w-6 h-6 text-blue-600" />;
    }

    // Image types
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return <PhotoIcon className="w-6 h-6 text-green-600" />;
    }

    // Default document icon
    return <DocumentIcon className="w-6 h-6 text-gray-600" />;
  };

  const getFileTypeLabel = (file: FileItem) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'stl': return '3D Model (STL)';
      case 'obj': return '3D Model (OBJ)';
      case 'ply': return '3D Model (PLY)';
      case 'step':
      case 'stp': return 'CAD Model (STEP)';
      case 'iges':
      case 'igs': return 'CAD Model (IGES)';
      case 'pdf': return 'PDF Document';
      case 'dwg': return 'AutoCAD Drawing';
      case 'dxf': return 'CAD Drawing (DXF)';
      case 'jpg':
      case 'jpeg': return 'JPEG Image';
      case 'png': return 'PNG Image';
      case 'svg': return 'SVG Vector';
      case 'zip': return 'ZIP Archive';
      case 'txt': return 'Text File';
      case 'md': return 'Markdown';
      default: return extension.toUpperCase() + ' File';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreview = (file: FileItem) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type.toLowerCase();
    
    return (
      // 3D files
      ['stl', 'obj', 'ply'].includes(extension) ||
      // Images
      mimeType.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)
    );
  };

  const handleDownload = async (file: FileItem) => {
    if (!canDownload) return;

    try {
      // In a real implementation, this would call your download API
      const downloadUrl = file.downloadUrl || `/api/projects/${projectId}/download?filename=${encodeURIComponent(file.name)}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const renderPreview = (file: FileItem) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = file.type.toLowerCase();
    
    // 3D model preview
    if (['stl', 'obj', 'ply'].includes(extension)) {
      return <Simple3DViewer fileName={file.name} fileUrl={file.url} />;
    }
    
    // Image preview
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return <ImageViewer fileUrl={file.url || ''} fileName={file.name} />;
    }
    
    // Unsupported preview
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Preview not available</p>
        <p className="text-sm text-gray-500">{getFileTypeLabel(file)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Project Files ({filteredFiles.length})
        </h3>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setPreviewMode('list')}
              className={`px-3 py-2 text-sm ${
                previewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setPreviewMode('grid')}
              className={`px-3 py-2 text-sm ${
                previewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No files found</h4>
          <p className="text-gray-500">
            {filter ? 'Try adjusting your search terms' : 'No files have been uploaded to this project yet'}
          </p>
        </div>
      ) : (
        <div className={previewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`
                ${previewMode === 'grid' 
                  ? 'bg-white rounded-lg border border-gray-200 p-4' 
                  : 'flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {previewMode === 'grid' ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{getFileTypeLabel(file)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    {file.lastModified && (
                      <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {canPreview(file) && (
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>Preview</span>
                      </button>
                    )}
                    
                    {canDownload && (
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{getFileTypeLabel(file)} • {formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {canPreview(file) && (
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Preview file"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    )}
                    
                    {canDownload && (
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Download file"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
                <p className="text-sm text-gray-500">{getFileTypeLabel(selectedFile)} • {formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              {renderPreview(selectedFile)}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {canDownload && (
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 