'use client';

import { useState, useEffect } from 'react';
import { GitBranch, GitCommit, PullRequest, GitTag } from '@/types/version-control';
import { gitService } from '@/lib/git-service';

interface VersionControlDashboardProps {
  projectId: string;
  currentBranch?: string;
}

export default function VersionControlDashboard({ 
  projectId, 
  currentBranch = 'main' 
}: VersionControlDashboardProps) {
  const [activeTab, setActiveTab] = useState<'commits' | 'branches' | 'pulls' | 'tags'>('commits');
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [tags, setTags] = useState<GitTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVersionControlData();
  }, [projectId, currentBranch]);

  const loadVersionControlData = async () => {
    setIsLoading(true);
    try {
      // TODO: Load actual data from API
      // const [branchesData, commitsData, pullsData, tagsData] = await Promise.all([
      //   fetch(`/api/projects/${projectId}/branches`).then(r => r.json()),
      //   fetch(`/api/projects/${projectId}/commits`).then(r => r.json()),
      //   fetch(`/api/projects/${projectId}/pulls`).then(r => r.json()),
      //   fetch(`/api/projects/${projectId}/tags`).then(r => r.json()),
      // ]);
      
      // Mock data for demonstration
      setBranches(mockBranches);
      setCommits(mockCommits);
      setPullRequests(mockPullRequests);
      setTags(mockTags);
    } catch (error) {
      console.error('Error loading version control data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Version Control</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage branches, commits, and releases for your engineering project
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Current Branch */}
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-md">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{currentBranch}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* New Branch Button */}
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Branch
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'commits', label: 'Commits', count: commits.length },
            { key: 'branches', label: 'Branches', count: branches.length },
            { key: 'pulls', label: 'Pull Requests', count: pullRequests.length },
            { key: 'tags', label: 'Tags', count: tags.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'commits' && <CommitsView commits={commits} />}
            {activeTab === 'branches' && <BranchesView branches={branches} />}
            {activeTab === 'pulls' && <PullRequestsView pullRequests={pullRequests} />}
            {activeTab === 'tags' && <TagsView tags={tags} />}
          </>
        )}
      </div>
    </div>
  );
}

// Commits View Component
function CommitsView({ commits }: { commits: GitCommit[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Recent Commits</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
          New Commit
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {commits.map((commit) => (
          <div key={commit.id} className="py-4 flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {commit.authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {commit.message}
                </p>
                {commit.verified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500">{commit.authorName}</p>
                <p className="text-sm text-gray-500">
                  {new Date(commit.timestamp).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  +{commit.stats.linesAdded} -{commit.stats.linesRemoved}
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                {commit.id.substring(0, 7)}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Branches View Component
function BranchesView({ branches }: { branches: GitBranch[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Branches</h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
          New Branch
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {branches.map((branch) => (
          <div key={branch.id} className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{branch.name}</span>
                  {branch.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Default
                    </span>
                  )}
                  {branch.isProtected && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Protected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{branch.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <p className="text-xs text-gray-500">
                Updated {new Date(branch.updatedAt).toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Compare</button>
                {!branch.isDefault && (
                  <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pull Requests View Component
function PullRequestsView({ pullRequests }: { pullRequests: PullRequest[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Pull Requests</h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
          New Pull Request
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {pullRequests.map((pr) => (
          <div key={pr.id} className="py-4">
            <div className="flex items-start space-x-3">
              <div className={`w-4 h-4 rounded-full mt-0.5 ${
                pr.status === 'open' ? 'bg-green-500' : 
                pr.status === 'merged' ? 'bg-purple-500' : 'bg-red-500'
              }`}></div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    #{pr.number} {pr.title}
                  </h4>
                  {pr.labels.map((label) => (
                    <span 
                      key={label}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {label}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>opened by {pr.authorName}</span>
                  <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                  <span>{pr.sourceBranch} → {pr.targetBranch}</span>
                  <span>{pr.commits.length} commits</span>
                  <span>{pr.stats.filesChanged} files changed</span>
                </div>
                
                {pr.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pr.description}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {pr.mergeable ? (
                  <span className="text-green-600 text-xs">✓ Ready to merge</span>
                ) : (
                  <span className="text-red-600 text-xs">⚠ Conflicts</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tags View Component
function TagsView({ tags }: { tags: GitTag[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Tags & Releases</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
          Create Tag
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {tags.map((tag) => (
          <div key={tag.id} className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                  {tag.isPrerelease && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Pre-release
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tag.tagType === 'release' ? 'bg-green-100 text-green-800' :
                    tag.tagType === 'hotfix' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {tag.tagType}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{tag.message}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <p className="text-xs text-gray-500">
                {tag.downloadCount} downloads
              </p>
              <p className="text-xs text-gray-500">
                {new Date(tag.taggedAt).toLocaleDateString()}
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mock data for demonstration
const mockBranches: GitBranch[] = [
  {
    id: '1',
    projectId: 'proj1',
    name: 'main',
    description: 'Main development branch',
    createdBy: 'user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-08'),
    headCommitId: 'abc123',
    isDefault: true,
    isProtected: true,
    protectionRules: {
      requirePullRequest: true,
      requireReviews: true,
      minReviewers: 2,
      dismissStaleReviews: false,
      requireCodeOwnerReviews: false,
      requireStatusChecks: false,
      requireUpToDate: false,
      restrictPushes: false,
      allowedPushers: [],
      allowForcePushes: false,
      allowDeletions: false
    },
    status: 'active'
  },
  {
    id: '2',
    projectId: 'proj1',
    name: 'feature/improved-motor-control',
    description: 'Enhanced motor control algorithms',
    createdBy: 'user2',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-07'),
    headCommitId: 'def456',
    parentBranchId: '1',
    isDefault: false,
    isProtected: false,
    protectionRules: {
      requirePullRequest: false,
      requireReviews: false,
      minReviewers: 1,
      dismissStaleReviews: false,
      requireCodeOwnerReviews: false,
      requireStatusChecks: false,
      requireUpToDate: false,
      restrictPushes: false,
      allowedPushers: [],
      allowForcePushes: false,
      allowDeletions: false
    },
    status: 'active'
  }
];

const mockCommits: GitCommit[] = [
  {
    id: 'abc123def456',
    projectId: 'proj1',
    branchId: '1',
    authorId: 'user1',
    authorName: 'John Engineer',
    authorEmail: 'john@example.com',
    message: 'Update motor control parameters',
    description: 'Optimized PID controller settings for better performance',
    timestamp: new Date('2024-06-08'),
    parentCommits: ['xyz789'],
    fileChanges: [],
    stats: { filesChanged: 3, linesAdded: 45, linesRemoved: 12, binaryFilesChanged: 0, totalSizeChange: 1024 },
    tags: [],
    verified: true
  },
  {
    id: 'def456ghi789',
    projectId: 'proj1',
    branchId: '2',
    authorId: 'user2',
    authorName: 'Sarah Designer',
    authorEmail: 'sarah@example.com',
    message: 'Add CAD file for new housing design',
    timestamp: new Date('2024-06-07'),
    parentCommits: ['abc123'],
    fileChanges: [],
    stats: { filesChanged: 1, linesAdded: 0, linesRemoved: 0, binaryFilesChanged: 1, totalSizeChange: 2048000 },
    tags: [],
    verified: false
  }
];

const mockPullRequests: PullRequest[] = [
  {
    id: 'pr1',
    projectId: 'proj1',
    number: 42,
    title: 'Implement advanced motor control system',
    description: 'This PR adds sophisticated motor control algorithms with real-time feedback and adaptive tuning capabilities.',
    sourceBranch: 'feature/improved-motor-control',
    targetBranch: 'main',
    authorId: 'user2',
    authorName: 'Sarah Designer',
    createdAt: new Date('2024-06-07'),
    updatedAt: new Date('2024-06-08'),
    status: 'open',
    mergeable: true,
    mergeableStatus: 'clean',
    conflicts: [],
    reviewers: [
      {
        userId: 'user1',
        userName: 'John Engineer',
        status: 'pending',
        comments: ''
      }
    ],
    assignees: ['user1'],
    labels: ['enhancement', 'motor-control'],
    commits: ['def456ghi789'],
    filesChanged: [],
    stats: { filesChanged: 5, linesAdded: 127, linesRemoved: 23, binaryFilesChanged: 1, totalSizeChange: 3072 }
  }
];

const mockTags: GitTag[] = [
  {
    id: 'tag1',
    projectId: 'proj1',
    name: 'v1.2.0',
    commitId: 'abc123def456',
    message: 'Release v1.2.0 - Motor Control Improvements',
    description: 'Major update with enhanced motor control algorithms and improved CAD integration',
    taggedBy: 'user1',
    taggedAt: new Date('2024-06-01'),
    tagType: 'release',
    isPrerelease: false,
    releaseNotes: 'This release includes significant improvements to motor control systems...',
    downloadCount: 156
  },
  {
    id: 'tag2',
    projectId: 'proj1',
    name: 'v1.3.0-beta',
    commitId: 'def456ghi789',
    message: 'Beta release for v1.3.0',
    taggedBy: 'user2',
    taggedAt: new Date('2024-06-08'),
    tagType: 'release',
    isPrerelease: true,
    downloadCount: 23
  }
]; 