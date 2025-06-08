'use client';

import { useState } from 'react';

interface ModernMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ModernMarkdownEditor({ value, onChange }: ModernMarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const sampleTemplate = `# Project Name

## Overview
Brief description of what this project does and why it's interesting.

## Components
- List key components
- Materials used
- Tools required

## Assembly Instructions
1. Step one
2. Step two
3. Step three

## Results
Describe the final outcome, performance, or key learnings.

## Future Improvements
- Ideas for enhancements
- Known issues to fix

---
*Built with ❤️ for the engineering community*`;

  const insertTemplate = () => {
    if (!value.trim()) {
      onChange(sampleTemplate);
    }
  };

  const renderPreview = (markdown: string) => {
    // Basic markdown rendering for preview
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|l|p])/gm, '<p class="mb-4">')
      .replace(/---/g, '<hr class="my-6 border-gray-300">');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Project Documentation</h3>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={insertTemplate}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
          >
            Insert Template
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'edit' 
                  ? 'bg-white text-gray-900 shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === 'preview' 
                  ? 'bg-white text-gray-900 shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {activeTab === 'edit' ? (
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write your project documentation in Markdown..."
              className="w-full h-96 p-4 font-mono text-sm border-none focus:ring-0 resize-none"
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            />
            
            {/* Markdown Help */}
            <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-black text-white text-xs p-2 rounded shadow-lg max-w-xs">
                <div className="font-medium mb-1">Markdown Tips:</div>
                <div className="space-y-1 text-gray-300">
                  <div># Heading 1</div>
                  <div>## Heading 2</div>
                  <div>**bold** *italic*</div>
                  <div>- List item</div>
                  <div>`code`</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="h-96 p-4 bg-gray-50 overflow-auto prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: value ? renderPreview(value) : '<p class="text-gray-500 italic">Nothing to preview yet. Switch to Edit to start writing.</p>' 
            }}
          />
        )}
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-gray-400 mt-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Documentation Tips</h4>
            <ul className="text-sm text-gray-600 mt-2 space-y-1">
              <li>• Describe your project's purpose and what makes it unique</li>
              <li>• Include assembly instructions and parts lists</li>
              <li>• Share lessons learned and potential improvements</li>
              <li>• Add links to related resources or inspiration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 