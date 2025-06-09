// Version Control System Types for Engineering Projects

export interface GitCommit {
  id: string;
  projectId: string;
  branchId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  message: string;
  description?: string;
  timestamp: Date;
  parentCommits: string[]; // For merge commits
  fileChanges: FileChange[];
  stats: CommitStats;
  tags: string[];
  verified: boolean;
}

export interface GitBranch {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  headCommitId: string;
  parentBranchId?: string; // Branch this was created from
  isDefault: boolean;
  isProtected: boolean;
  protectionRules: BranchProtectionRules;
  status: 'active' | 'merged' | 'deleted' | 'stale';
  mergedInto?: string; // Branch ID this was merged into
  mergedAt?: Date;
}

export interface FileChange {
  id: string;
  commitId: string;
  filePath: string;
  fileName: string;
  changeType: 'added' | 'modified' | 'deleted' | 'renamed' | 'moved';
  oldPath?: string; // For renamed/moved files
  sizeBefore?: number;
  sizeAfter?: number;
  linesAdded?: number;
  linesRemoved?: number;
  binaryFile: boolean;
  fileType: 'cad' | 'pcb' | 'code' | 'documentation' | 'image' | 'other';
  previewUrl?: string;
  diffUrl?: string;
  conflictStatus?: 'none' | 'resolved' | 'unresolved';
}

export interface CommitStats {
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  binaryFilesChanged: number;
  totalSizeChange: number; // in bytes
}

export interface BranchProtectionRules {
  requirePullRequest: boolean;
  requireReviews: boolean;
  minReviewers: number;
  dismissStaleReviews: boolean;
  requireCodeOwnerReviews: boolean;
  requireStatusChecks: boolean;
  requireUpToDate: boolean;
  restrictPushes: boolean;
  allowedPushers: string[]; // User IDs
  allowForcePushes: boolean;
  allowDeletions: boolean;
}

export interface PullRequest {
  id: string;
  projectId: string;
  number: number; // Auto-incrementing PR number
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'open' | 'closed' | 'merged' | 'draft';
  mergeable: boolean;
  mergeableStatus: 'clean' | 'dirty' | 'unknown' | 'blocked';
  conflicts: MergeConflict[];
  reviewers: PullRequestReviewer[];
  assignees: string[];
  labels: string[];
  milestone?: string;
  commits: string[]; // Commit IDs
  filesChanged: FileChange[];
  stats: CommitStats;
  mergedBy?: string;
  mergedAt?: Date;
  closedBy?: string;
  closedAt?: Date;
}

export interface PullRequestReviewer {
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'dismissed';
  reviewedAt?: Date;
  comments: string;
}

export interface MergeConflict {
  id: string;
  filePath: string;
  conflictType: 'content' | 'binary' | 'delete_modify' | 'rename';
  status: 'unresolved' | 'resolved';
  baseContent?: string;
  sourceContent: string;
  targetContent: string;
  resolvedContent?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  autoResolvable: boolean;
}

export interface GitTag {
  id: string;
  projectId: string;
  name: string; // e.g., v1.0.0, v2.1.0-beta
  commitId: string;
  message: string;
  description?: string;
  taggedBy: string;
  taggedAt: Date;
  tagType: 'release' | 'hotfix' | 'feature' | 'milestone';
  isPrerelease: boolean;
  releaseNotes?: string;
  downloadCount: number;
}

export interface VersionHistory {
  projectId: string;
  commits: GitCommit[];
  branches: GitBranch[];
  tags: GitTag[];
  pullRequests: PullRequest[];
  totalCommits: number;
  totalBranches: number;
  contributors: Contributor[];
  activity: ActivityEvent[];
}

export interface Contributor {
  userId: string;
  userName: string;
  email: string;
  avatar?: string;
  commitsCount: number;
  linesAdded: number;
  linesRemoved: number;
  firstCommit: Date;
  lastCommit: Date;
  role: 'owner' | 'maintainer' | 'contributor' | 'viewer';
}

export interface ActivityEvent {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  eventType: 'commit' | 'branch_created' | 'pr_opened' | 'pr_merged' | 'tag_created' | 'review_submitted';
  timestamp: Date;
  description: string;
  metadata: Record<string, any>;
}

// Git Operations Interface
export interface GitOperations {
  // Branch Operations
  createBranch(projectId: string, branchName: string, fromBranch?: string): Promise<GitBranch>;
  deleteBranch(projectId: string, branchId: string): Promise<void>;
  mergeBranch(projectId: string, sourceBranch: string, targetBranch: string): Promise<GitCommit>;
  
  // Commit Operations
  createCommit(projectId: string, branchId: string, changes: FileChange[], message: string): Promise<GitCommit>;
  getCommitHistory(projectId: string, branchId?: string, limit?: number): Promise<GitCommit[]>;
  getCommitDiff(projectId: string, commitId1: string, commitId2: string): Promise<FileChange[]>;
  
  // Pull Request Operations
  createPullRequest(data: Partial<PullRequest>): Promise<PullRequest>;
  reviewPullRequest(prId: string, review: Partial<PullRequestReviewer>): Promise<void>;
  mergePullRequest(prId: string, mergeMethod: 'merge' | 'squash' | 'rebase'): Promise<GitCommit>;
  
  // Conflict Resolution
  detectConflicts(projectId: string, sourceBranch: string, targetBranch: string): Promise<MergeConflict[]>;
  resolveConflict(conflictId: string, resolution: string): Promise<void>;
  
  // Tag Operations
  createTag(projectId: string, commitId: string, tagData: Partial<GitTag>): Promise<GitTag>;
  deleteTag(projectId: string, tagId: string): Promise<void>;
}

// Version Control Events for Real-time Updates
export interface VersionControlEvent {
  type: 'commit_created' | 'branch_created' | 'pr_opened' | 'pr_updated' | 'branch_merged' | 'tag_created';
  projectId: string;
  userId: string;
  timestamp: Date;
  data: any;
} 