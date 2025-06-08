import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabaseBrowser } from '@/lib/supabase/client';
import { getPlanLimits, canCreateProject, canCreatePrivateProject } from '@/lib/plan-limits';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = supabaseBrowser;

    // Get user's current plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', session.user.id)
      .single();

    const currentPlan = profile?.plan || 'FREE';
    const limits = getPlanLimits(currentPlan);

    // Get current project count
    const { count: projectCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', session.user.id);

    // Get storage usage (approximate)
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', session.user.id);

    let totalStorageUsed = 0;
    if (projects) {
      // This is a simplified calculation - in production you'd track this more precisely
      const storagePromises = projects.map(async (project) => {
        const { data: versions } = await supabase
          .from('versions')
          .select('files')
          .eq('project_id', project.id);
        
        let projectStorage = 0;
        versions?.forEach(version => {
          if (version.files && Array.isArray(version.files)) {
            version.files.forEach((file: any) => {
              if (file.size) projectStorage += file.size;
            });
          }
        });
        return projectStorage;
      });

      const storageSizes = await Promise.all(storagePromises);
      totalStorageUsed = storageSizes.reduce((sum, size) => sum + size, 0);
    }

    const status = {
      plan: currentPlan,
      limits: limits,
      usage: {
        projects: projectCount || 0,
        storageBytes: totalStorageUsed,
        storageMB: Math.round(totalStorageUsed / 1024 / 1024),
      },
      permissions: {
        canCreateProject: canCreateProject(projectCount || 0, currentPlan),
        canCreatePrivateProject: canCreatePrivateProject(currentPlan),
      },
      warnings: [] as string[]
    };

    // Add warnings for users approaching limits
    if (limits.maxProjects && (projectCount || 0) >= limits.maxProjects * 0.8) {
      status.warnings.push(`You're using ${projectCount} of ${limits.maxProjects} projects. Upgrade to Pro for unlimited projects.`);
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching plan status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 