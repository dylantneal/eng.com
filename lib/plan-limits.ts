export const PLAN_LIMITS = {
  FREE: {
    name: 'Free',
    maxProjects: 5,
    maxStoragePerProjectMB: 100,
    canCreatePrivateProjects: false,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    features: ['public_projects', 'basic_viewer', 'comments', 'version_history']
  },
  PRO: {
    name: 'Pro',
    maxProjects: null, // unlimited
    maxStoragePerProjectMB: 1024, // 1GB
    canCreatePrivateProjects: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    features: ['private_projects', 'unlimited_projects', 'priority_support', 'advanced_search']
  }
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string | null): typeof PLAN_LIMITS.FREE | typeof PLAN_LIMITS.PRO {
  const planType = (plan?.toUpperCase() as PlanType) || 'FREE';
  return PLAN_LIMITS[planType] || PLAN_LIMITS.FREE;
}

export function canCreateProject(currentProjectCount: number, plan: string | null): boolean {
  const limits = getPlanLimits(plan);
  if (limits.maxProjects === null) return true;
  return currentProjectCount < limits.maxProjects;
}

export function canCreatePrivateProject(plan: string | null): boolean {
  const limits = getPlanLimits(plan);
  return limits.canCreatePrivateProjects;
}

export function getMaxFileSize(plan: string | null): number {
  const limits = getPlanLimits(plan);
  return limits.maxFileSize;
}

export function getMaxStoragePerProject(plan: string | null): number {
  const limits = getPlanLimits(plan);
  return limits.maxStoragePerProjectMB * 1024 * 1024; // Convert to bytes
} 