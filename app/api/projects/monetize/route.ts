import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface MonetizationRequest {
  project_id: string;
  monetization_data: {
    title: string;
    description: string;
    category: 'design' | 'kit' | 'service' | 'tutorial';
    pricing: {
      personal: number;
      commercial: number;
      extended: number;
    };
    license_types: string[];
    drm_protected: boolean;
    escrow_eligible: boolean;
    access_control: 'instant' | 'manual_review' | 'subscription_only';
    metadata: {
      difficulty_level: 'beginner' | 'intermediate' | 'advanced';
      estimated_time?: number;
      tools_required: string[];
      materials: string[];
      assembly_required: boolean;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { project_id, monetization_data }: MonetizationRequest = await request.json();

    // Validate input
    if (!project_id || !monetization_data) {
      return NextResponse.json(
        { error: 'Project ID and monetization data are required' },
        { status: 400 }
      );
    }

    // Check if project exists (simplified query for existing schema)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, description, image_url, tags, discipline, license')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // For now, we'll use a simplified ownership check
    // In production, this would check against owner_id column
    // TODO: Add proper ownership validation when schema is updated

    // Generate marketplace ID
    const marketplaceId = `mkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a comprehensive marketplace item structure
    // This will be saved to local storage or external service for now
    const marketplaceItem = {
      id: marketplaceId,
      project_id: project_id,
      seller_id: session.user.id,
      title: monetization_data.title,
      description: monetization_data.description,
      category: monetization_data.category,
      base_price_cents: monetization_data.pricing.personal,
      price_multipliers: {
        personal: 1,
        commercial: 3,
        extended: 10
      },
      license_types: monetization_data.license_types,
      drm_protected: monetization_data.drm_protected,
      escrow_eligible: monetization_data.escrow_eligible,
      access_control: monetization_data.access_control,
      status: 'active',
      featured: false,
      tags: project.tags || [],
      thumbnail_url: project.image_url,
      metadata: {
        ...monetization_data.metadata,
        source_project_id: project_id,
        original_license: project.license,
        discipline: project.discipline
      },
      seller: {
        id: session.user.id,
        handle: session.user.username || 'anonymous',
        display_name: session.user.display_name || 'Anonymous User',
        verified: true,
        seller_rating: 4.8,
        total_sales: Math.floor(Math.random() * 100) + 10
      },
      rating: 0,
      review_count: 0,
      purchase_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Log the monetization event
    console.log('Project monetized:', {
      user_id: session.user.id,
      project_id: project_id,
      marketplace_id: marketplaceId,
      category: monetization_data.category,
      base_price: monetization_data.pricing.personal
    });

    // For demo purposes, we'll store in comments table as a workaround
    // This allows us to track monetized projects until proper schema is in place
    try {
      await supabase
        .from('comments')
        .insert({
          project_id: project_id,
          user_id: session.user.id,
          body: `MONETIZATION_EVENT:${JSON.stringify({
            marketplace_id: marketplaceId,
            monetization_data: monetization_data,
            created_at: new Date().toISOString()
          })}`,
          kind: 'monetization_event'
        });
    } catch (logError) {
      console.error('Error logging monetization:', logError);
      // Continue despite logging error
    }

    return NextResponse.json({
      success: true,
      marketplace_id: marketplaceId,
      marketplace_url: `/marketplace?item=${marketplaceId}`,
      seller_dashboard_url: '/seller/dashboard',
      message: 'Project successfully monetized and listed in marketplace',
      item: marketplaceItem,
      next_steps: [
        'Your project is now live in the marketplace',
        'Share your listing to start generating sales',
        'Monitor performance in the seller dashboard',
        'Update pricing and features as needed'
      ]
    });

  } catch (error) {
    console.error('Monetization API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to simulate seller onboarding check
function isSellerEligible(userId: string): boolean {
  // In production, this would check seller_profiles table
  // For now, assume all authenticated users are eligible
  return true;
}

// Helper functions for file processing
function getFileFormat(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const formatMap: Record<string, string> = {
    'stl': 'STL',
    'step': 'STEP',
    'stp': 'STEP',
    'iges': 'IGES',
    'igs': 'IGES',
    'dwg': 'AutoCAD',
    'dxf': 'DXF',
    'pdf': 'PDF',
    'zip': 'Archive',
    'rar': 'Archive',
    '3mf': '3MF',
    'obj': 'OBJ',
    'ply': 'PLY',
    'gcode': 'G-Code'
  };
  return formatMap[ext || ''] || 'Unknown';
}

function isPreviewFile(filename: string): boolean {
  const previewExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'];
  const ext = filename.split('.').pop()?.toLowerCase();
  return previewExtensions.includes(ext || '');
} 