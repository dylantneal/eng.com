'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Package,
  Cpu
} from 'lucide-react';

interface FileUploadProps {
  projectId: string;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const SUPPORTED_FORMATS = {
  cad: ['.step', '.stp', '.stl', '.obj', '.ply', '.dae'],
  pcb: ['.kicad_sch', '.kicad_pcb', '.brd', '.sch'],
  code: ['.ino', '.cpp', '.c', '.h', '.py', '.js'],
  docs: ['.md', '.txt', '.pdf', '.docx'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
};

export default function FileUpload({ 
  projectId, 
  onFilesUploaded, 
  maxFiles = 10,
  maxSizeBytes = 100 * 1024 * 1024 // 100MB
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const getFileCategory = (filename: string): { category: string; icon: React.ComponentType<any> } => {
    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    
    if (SUPPORTED_FORMATS.cad.includes(ext)) {
      return { category: 'CAD Model', icon: Package };
    }
    if (SUPPORTED_FORMATS.pcb.includes(ext)) {
      return { category: 'PCB Design', icon: Cpu };
    }
    if (SUPPORTED_FORMATS.code.includes(ext)) {
      return { category: 'Source Code', icon: FileText };
    }
    if (SUPPORTED_FORMATS.docs.includes(ext)) {
      return { category: 'Documentation', icon: FileText };
    }
    if (SUPPORTED_FORMATS.images.includes(ext)) {
      return { category: 'Image', icon: File };
    }
    
    return { category: 'Other', icon: File };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${formatFileSize(maxSizeBytes)} limit`;
    }

    const allSupportedExts = Object.values(SUPPORTED_FORMATS).flat();
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allSupportedExts.includes(fileExt)) {
      return `Unsupported file type. Supported formats: ${allSupportedExts.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString().split('T')[0];
    const filePath = `${projectId}/${timestamp}/${file.name}`;

    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: '',
      status: 'uploading',
      progress: 0
    };

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('projects')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      uploadedFile.url = publicUrl;
      uploadedFile.status = 'success';
      uploadedFile.progress = 100;

      return uploadedFile;
    } catch (error) {
      uploadedFile.status = 'error';
      uploadedFile.error = error instanceof Error ? error.message : 'Upload failed';
      return uploadedFile;
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    
    if (files.length + newFiles.length > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        alert(`${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Create initial file objects
    const uploadingFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      status: 'uploading' as const,
      progress: 0
    }));

    setFiles(prev => [...prev, ...uploadingFiles]);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      const uploadedFile = await uploadFile(file);
      
      setFiles(prev => prev.map(f => 
        f.id === uploadingFiles[index].id ? uploadedFile : f
      ));

      return uploadedFile;
    });

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFiles.filter(f => f.status === 'success');
      
      if (successfulUploads.length > 0) {
        onFilesUploaded?.(successfulUploads);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Drop your files here or{' '}
            <button
              type="button"
              onClick={openFileDialog}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              browse
            </button>
          </p>
          
          <p className="text-sm text-gray-500">
            Supports CAD files (STEP, STL), PCB designs (KiCad), code, and documentation
          </p>
          
          <p className="text-xs text-gray-400">
            Max file size: {formatFileSize(maxSizeBytes)} • Max files: {maxFiles}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept={Object.values(SUPPORTED_FORMATS).flat().join(',')}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files ({files.length})</h4>
          
          <div className="space-y-2">
            {files.map((file) => {
              const { category, icon: Icon } = getFileCategory(file.name);
              
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {category}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {file.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">
                        {file.error}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {file.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {file.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 