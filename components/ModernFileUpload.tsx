'use client';

import { useState, useRef } from 'react';

interface ModernFileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  userPlan: string;
}

export default function ModernFileUpload({ files, onFilesChange, userPlan }: ModernFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = userPlan === 'PRO' ? 1024 * 1024 * 1024 : 100 * 1024 * 1024; // 1GB vs 100MB
  const maxFiles = 10;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > maxFileSize) {
        alert(`${file.name} is too large. Maximum size is ${userPlan === 'PRO' ? '1GB' : '100MB'}.`);
        return false;
      }
      return true;
    });

    const totalFiles = [...files, ...validFiles];
    if (totalFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    onFilesChange([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'stl': return '🔺';
      case 'step':
      case 'stp': return '⚙️';
      case 'dwg':
      case 'dxf': return '📐';
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      default: return '📎';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".stl,.step,.stp,.dwg,.dxf,.pdf,.jpg,.jpeg,.png,.txt,.md"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">Upload your files</h3>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop files here, or click to browse
            </p>
          </div>
          
          <div className="text-xs text-gray-400">
            <p>Supported: STL, STEP, DWG, DXF, PDF, Images</p>
            <p>Max size: {userPlan === 'PRO' ? '1GB' : '100MB'} per file • Max files: {maxFiles}</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 mt-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900">File Upload Guidelines</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Upload your CAD files, documentation, and images</li>
              <li>• STL files will be automatically rendered in 3D</li>
              <li>• Include a PDF or images for better project showcase</li>
              {userPlan !== 'PRO' && (
                <li>• Upgrade to Pro for 1GB file size limit</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 