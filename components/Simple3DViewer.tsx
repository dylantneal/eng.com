'use client';

import { useState, useEffect } from 'react';
import { 
  CubeIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Simple3DViewerProps {
  fileName: string;
  fileUrl?: string;
  className?: string;
}

export default function Simple3DViewer({ fileName, fileUrl, className = '' }: Simple3DViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const renderPreview = () => (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-lg overflow-hidden border border-gray-200">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <CubeIcon className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-white">Loading 3D model...</p>
          </div>
        </div>
      ) : (
        <>
          {/* 3D Scene Mockup */}
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Grid lines background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="text-blue-300">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* 3D Object Representation */}
            <div className="relative">
              <div className="w-32 h-32 bg-blue-500 relative transform rotate-12 shadow-2xl">
                <div className="absolute -top-2 -right-2 w-32 h-32 bg-blue-400 transform rotate-6"></div>
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-300 transform rotate-3"></div>
              </div>
              
              {/* Axis indicators */}
              <div className="absolute -bottom-8 -left-8 text-xs text-white space-y-1">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-1 bg-red-500"></div>
                  <span>X</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-4 bg-green-500"></div>
                  <span>Y</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Z</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Controls overlay */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            {fileName}
          </div>
          
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs">
            Mouse: Rotate • Scroll: Zoom • Drag: Pan
          </div>
          
          <button
            onClick={() => setFullscreen(true)}
            className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-75 text-white rounded-lg hover:bg-opacity-90 transition-colors"
            title="View fullscreen"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className={className}>
        {renderPreview()}
      </div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl">
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-lg overflow-hidden relative">
              {/* Same content as preview but full screen */}
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Grid lines background */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%" className="text-blue-300">
                    <defs>
                      <pattern id="fullscreen-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#fullscreen-grid)" />
                  </svg>
                </div>
                
                {/* Larger 3D Object */}
                <div className="relative">
                  <div className="w-48 h-48 bg-blue-500 relative transform rotate-12 shadow-2xl">
                    <div className="absolute -top-3 -right-3 w-48 h-48 bg-blue-400 transform rotate-6"></div>
                    <div className="absolute -top-6 -right-6 w-48 h-48 bg-blue-300 transform rotate-3"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-6 right-6 bg-black bg-opacity-75 text-white px-4 py-2 rounded text-lg">
                {fileName}
              </div>
              
              <div className="absolute bottom-6 left-6 bg-black bg-opacity-75 text-white px-4 py-2 rounded">
                Mouse: Rotate • Scroll: Zoom • Drag: Pan
              </div>
            </div>
            
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 p-3 bg-black bg-opacity-75 text-white rounded-lg hover:bg-opacity-90"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
} 