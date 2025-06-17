import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDropzone } from 'react-dropzone';
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onAttachmentsChange?: (files: File[]) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  onAttachmentsChange,
  placeholder = 'Write your post...',
  maxLength = 10000,
  className = '',
}: RichTextEditorProps) {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newAttachments = [...attachments, ...acceptedFiles];
    setAttachments(newAttachments);
    onAttachmentsChange?.(newAttachments);
  }, [attachments, onAttachmentsChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'text/markdown': ['.md'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    onAttachmentsChange?.(newAttachments);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setPreviewMode(false)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              !previewMode
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setPreviewMode(true)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              previewMode
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Preview
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {value.length}/{maxLength} characters
        </div>
      </div>

      {!previewMode ? (
        <div className="border rounded-lg overflow-hidden">
          <MDEditor
            value={value}
            onChange={(val) => onChange(val || '')}
            preview="edit"
            height={400}
            className="!bg-white"
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-white">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {value}
          </ReactMarkdown>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <PaperClipIcon className="w-6 h-6 mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: Images, PDF, Text, JSON, XML, Markdown (max 5MB)
        </p>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <PaperClipIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(2)}MB)
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 