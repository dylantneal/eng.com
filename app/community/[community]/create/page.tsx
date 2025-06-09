'use client';

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  DocumentIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const POST_TYPES = [
  {
    id: 'question',
    name: 'Question',
    description: 'Ask for help with a technical problem',
    icon: '❓',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'discussion',
    name: 'Discussion',
    description: 'Start a conversation about a topic',
    icon: '💬',
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    id: 'show_and_tell',
    name: 'Show & Tell',
    description: 'Share your project or creation',
    icon: '🎯',
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  {
    id: 'help',
    name: 'Help Needed',
    description: 'Request assistance or guidance',
    icon: '🆘',
    color: 'bg-red-50 text-red-700 border-red-200'
  }
];

const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Beginner', color: 'bg-green-100 text-green-800' },
  { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'advanced', name: 'Advanced', color: 'bg-red-100 text-red-800' }
];

const COMMUNITY_TAGS = {
  'mechanical-engineering': ['bearings', 'mechanics', 'calculations', 'design', 'materials', 'manufacturing', 'CAD', 'analysis'],
  'electronics': ['pcb-design', 'circuits', 'components', 'arduino', 'embedded', 'power', 'sensors', 'microcontrollers'],
  'robotics': ['automation', 'control-systems', 'sensors', 'actuators', 'programming', 'vision', 'kinematics'],
  'engineering-software': ['CAD', 'simulation', 'analysis', 'modeling', 'tools', 'workflow', 'integration'],
  'materials-science': ['properties', 'testing', 'selection', 'composites', 'metals', 'polymers', 'ceramics'],
  'manufacturing': ['3d-printing', 'cnc', 'injection-molding', 'machining', 'production', 'quality', 'tooling'],
  'default': ['engineering', 'technical', 'project', 'design', 'build', 'help', 'discussion']
};

interface AttachedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const params = useParams();
  const community = params.community as string;
  
  const [postType, setPostType] = useState('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const communityName = community.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const suggestedTags = COMMUNITY_TAGS[community as keyof typeof COMMUNITY_TAGS] || COMMUNITY_TAGS.default;

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag.toLowerCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    for (let i = 0; i < files.length && attachedFiles.length + newFiles.length < 5; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Files must be smaller than 10MB');
        continue;
      }
      newFiles.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
    
    setAttachedFiles([...attachedFiles, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <PhotoIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <DocumentIcon className="h-4 w-4" />;
    return <PaperClipIcon className="h-4 w-4" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!title.trim() || !content.trim()) {
        throw new Error('Title and content are required');
      }

      // For now, we'll use a mock user ID - in a real app, get this from auth
      const mockUserId = 'current-user-id';

      // Prepare the post data
      const postData = {
        title: title.trim(),
        content: content.trim(),
        post_type: postType,
        tags,
        difficulty_level: difficultyLevel || undefined,
        author_id: mockUserId,
        attachments: attachedFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        }))
      };

      const response = await fetch(`/api/communities/${community}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const newPost = await response.json();
      
      // Redirect to the new post
      router.push(`/community/${community}/posts/${newPost.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/community/${community}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to r/{communityName}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create a Post</h1>
          <p className="text-gray-600 mt-2">
            Share your knowledge, ask questions, or start a discussion in r/{communityName}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {POST_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id)}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    postType === type.id
                      ? type.color + ' border-current'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{type.icon}</span>
                    <span className="font-medium">{type.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a descriptive title for your post..."
              maxLength={300}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/300 characters</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Describe your ${postType === 'question' ? 'question' : postType === 'show_and_tell' ? 'project' : 'topic'} in detail...`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{content.length} characters</p>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (up to 10)
            </label>
            
            {/* Current Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Tag Input */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(newTag);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag..."
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => handleAddTag(newTag)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                disabled={!newTag.trim() || tags.length >= 10}
              >
                Add
              </button>
            </div>

            {/* Suggested Tags */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags
                  .filter(tag => !tags.includes(tag))
                  .slice(0, 8)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition"
                      disabled={tags.length >= 10}
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Difficulty Level (optional)
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setDifficultyLevel('')}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  !difficultyLevel
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Not specified
              </button>
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setDifficultyLevel(level.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition ${
                    difficultyLevel === level.id
                      ? 'border-current ' + level.color
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>

          {/* File Attachments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Attachments (up to 5 files, 10MB each)
            </label>
            
            {/* Attached Files */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2 mb-4">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileAttach}
              multiple
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.step,.stp,.stl,.dwg,.dxf,.sch,.pcb"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={attachedFiles.length >= 5}
            >
              <PaperClipIcon className="h-4 w-4" />
              <span>Attach Files</span>
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Supported: PDF, Images, CAD files (STEP, STL, DWG), Schematics
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-between items-center">
            <Link
              href={`/community/${community}`}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 