import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Comprehensive mock engineering projects for demonstration
const MOCK_ENGINEERING_PROJECTS = [
  {
    id: 'proj-1',
    slug: 'autonomous-solar-drone',
    title: 'Autonomous Solar-Powered Drone',
    description: 'A fully autonomous drone powered by solar panels with advanced navigation and obstacle avoidance capabilities for environmental monitoring.',
    readme: '# Autonomous Solar-Powered Drone\n\nComprehensive design for long-duration environmental monitoring missions.',
    engineering_discipline: 'aerospace-engineering',
    project_type: 'prototype',
    complexity_level: 'expert',
    project_status: 'completed',
    technologies: ['ArduPilot', 'Python', 'OpenCV', 'Raspberry Pi', 'Arduino', 'GPS'],
    materials: ['Carbon Fiber', 'Aluminum 6061', 'Solar Cells', 'Lithium Polymer'],
    discipline: 'Aerospace Engineering',
    image_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
    gallery_urls: [],
    repository_url: 'https://github.com/engineering/solar-drone',
    demo_url: 'https://demo.example.com/solar-drone',
    documentation_url: 'https://docs.example.com/solar-drone',
    video_url: 'https://youtube.com/watch?v=solar-drone',
    cad_file_formats: ['STEP', 'STL', 'DXF'],
    tags: ['drone', 'solar-power', 'autonomous', 'environmental-monitoring'],
    license: 'MIT',
    view_count: 1247,
    like_count: 89,
    download_count: 34,
    bookmark_count: 67,
    is_featured: true,
    is_verified: true,
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-15T14:30:00Z',
    published_at: '2024-12-01T10:00:00Z',
    author: {
      id: 'user-1',
      username: 'alex_aerospace',
      handle: 'alex_aerospace',
      display_name: 'Dr. Alex Chen',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      engineering_discipline: 'aerospace-engineering',
      is_verified: true,
    },
    tips_cents: 0,
    thumb_path: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
  },
  {
    id: 'proj-2',
    slug: 'neural-prosthetic-hand',
    title: 'Smart Prosthetic Hand with Neural Control',
    description: 'Advanced prosthetic hand with EMG sensor control, individual finger articulation, and haptic feedback for enhanced dexterity.',
    readme: '# Smart Prosthetic Hand\n\nRevolutionary prosthetic with neural interface and haptic feedback.',
    engineering_discipline: 'biomedical-engineering',
    project_type: 'prototype',
    complexity_level: 'expert',
    project_status: 'completed',
    technologies: ['Arduino', 'TensorFlow', 'MATLAB', 'C++', 'Python', 'Bluetooth'],
    materials: ['Titanium Alloy', 'Carbon Fiber', 'Medical Grade Silicone', 'Electronics'],
    discipline: 'Biomedical Engineering',
    image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    gallery_urls: [],
    repository_url: 'https://github.com/biomedical/neural-prosthetic',
    demo_url: null,
    documentation_url: 'https://docs.example.com/prosthetic-hand',
    video_url: 'https://youtube.com/watch?v=prosthetic-demo',
    cad_file_formats: ['SLDPRT', 'STEP', 'STL'],
    tags: ['prosthetics', 'biomedical', 'emg', 'neural-control', '3d-printing'],
    license: 'GPL-3.0',
    view_count: 892,
    like_count: 156,
    download_count: 78,
    bookmark_count: 134,
    is_featured: true,
    is_verified: true,
    created_at: '2024-11-15T09:00:00Z',
    updated_at: '2024-12-10T16:45:00Z',
    published_at: '2024-11-15T09:00:00Z',
    author: {
      id: 'user-2',
      username: 'sarah_biomed',
      handle: 'sarah_biomed',
      display_name: 'Dr. Sarah Martinez',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150',
      engineering_discipline: 'biomedical-engineering',
      is_verified: true,
    },
    tips_cents: 0,
    thumb_path: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
  },
  {
    id: 'proj-3',
    slug: 'seismic-foundation-system',
    title: 'Earthquake-Resistant Building Foundation',
    description: 'Innovative base isolation system for buildings in seismic zones with adaptive damping and real-time monitoring.',
    readme: '# Seismic Foundation System\n\nAdvanced earthquake protection with adaptive damping technology.',
    engineering_discipline: 'civil-engineering',
    project_type: 'design',
    complexity_level: 'expert',
    project_status: 'completed',
    technologies: ['ANSYS', 'MATLAB', 'Python', 'LabVIEW', 'AutoCAD'],
    materials: ['Reinforced Concrete', 'Lead-Rubber', 'Steel', 'Magnetorheological Fluid'],
    discipline: 'Civil Engineering',
    image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
    gallery_urls: [],
    repository_url: 'https://github.com/civil/seismic-foundation',
    demo_url: null,
    documentation_url: 'https://docs.example.com/seismic-system',
    video_url: null,
    cad_file_formats: ['DWG', 'DXF', 'STEP'],
    tags: ['seismic', 'earthquake', 'foundation', 'civil-engineering', 'monitoring'],
    license: 'Apache-2.0',
    view_count: 567,
    like_count: 78,
    download_count: 23,
    bookmark_count: 45,
    is_featured: false,
    is_verified: true,
    created_at: '2024-10-20T11:30:00Z',
    updated_at: '2024-11-05T13:15:00Z',
    published_at: '2024-10-20T11:30:00Z',
    author: {
      id: 'user-3',
      username: 'mike_civil',
      handle: 'mike_civil',
      display_name: 'Mike Johnson, P.E.',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      engineering_discipline: 'civil-engineering',
      is_verified: true,
    },
    tips_cents: 0,
    thumb_path: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
  },
  {
    id: 'proj-4',
    slug: 'precision-cnc-center',
    title: 'Precision CNC Machining Center',
    description: 'High-precision 5-axis CNC machining center with sub-micron accuracy for aerospace and medical device manufacturing.',
    readme: '# Precision CNC Center\n\nSub-micron accuracy machining for critical applications.',
    engineering_discipline: 'mechanical-engineering',
    project_type: 'manufacturing',
    complexity_level: 'expert',
    project_status: 'completed',
    technologies: ['Siemens NX', 'Mastercam', 'SolidWorks', 'ANSYS', 'LabVIEW'],
    materials: ['Polymer Concrete', 'Steel', 'Aluminum', 'Ceramic', 'Electronics'],
    discipline: 'Mechanical Engineering',
    image_url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400',
    gallery_urls: [],
    repository_url: 'https://github.com/mechanical/precision-cnc',
    demo_url: null,
    documentation_url: 'https://docs.example.com/cnc-center',
    video_url: 'https://youtube.com/watch?v=cnc-demo',
    cad_file_formats: ['SLDPRT', 'STEP', 'IGES', 'DWG'],
    tags: ['cnc', 'machining', 'precision', 'manufacturing', 'aerospace'],
    license: 'Commercial',
    view_count: 734,
    like_count: 92,
    download_count: 41,
    bookmark_count: 87,
    is_featured: false,
    is_verified: false,
    created_at: '2024-09-10T08:45:00Z',
    updated_at: '2024-10-15T12:20:00Z',
    published_at: '2024-09-10T08:45:00Z',
    author: {
      id: 'user-4',
      username: 'emma_mech',
      handle: 'emma_mech',
      display_name: 'Emma Thompson',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      engineering_discipline: 'mechanical-engineering',
      is_verified: false,
    },
    tips_cents: 0,
    thumb_path: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400',
  },
  {
    id: 'proj-5',
    slug: 'smart-grid-energy-system',
    title: 'Smart Grid Energy Management System',
    description: 'Intelligent energy management system for smart grids with renewable integration, demand response, and predictive analytics.',
    readme: '# Smart Grid System\n\nAI-powered energy optimization for sustainable grids.',
    engineering_discipline: 'electrical-engineering',
    project_type: 'design',
    complexity_level: 'expert',
    project_status: 'completed',
    technologies: ['Python', 'TensorFlow', 'SCADA', 'IoT', 'Blockchain', 'MATLAB'],
    materials: ['Electronics', 'Sensors', 'Communication Equipment', 'Software'],
    discipline: 'Electrical Engineering',
    image_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
    thumbnail_url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
    gallery_urls: [],
    repository_url: 'https://github.com/electrical/smart-grid',
    demo_url: 'https://demo.smartgrid.example.com',
    documentation_url: 'https://docs.example.com/smart-grid',
    video_url: null,
    cad_file_formats: ['DWG', 'PDF'],
    tags: ['smart-grid', 'energy', 'renewable', 'iot', 'machine-learning'],
    license: 'MIT',
    view_count: 1456,
    like_count: 203,
    download_count: 89,
    bookmark_count: 178,
    is_featured: true,
    is_verified: true,
    created_at: '2024-08-25T15:20:00Z',
    updated_at: '2024-12-01T09:10:00Z',
    published_at: '2024-08-25T15:20:00Z',
    author: {
      id: 'user-5',
      username: 'david_electrical',
      handle: 'david_electrical',
      display_name: 'David Kim',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      engineering_discipline: 'electrical-engineering',
      is_verified: true,
    },
    tips_cents: 0,
    thumb_path: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
  }
];

export async function GET() {
  try {
    console.log('🔍 Fetching engineering projects...');
    
    // Try database first, fallback to mock data
    let projects = null;
    let error = null;
    
    try {
      const result = await supabase
        .from('projects')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      projects = result.data;
      error = result.error;
    } catch (dbError) {
      console.log('Database unavailable, using mock engineering projects');
      projects = null;
      error = dbError;
    }

    // Use mock data if database is unavailable or empty
    if (error || !projects || projects.length === 0) {
      console.log('✅ Serving mock engineering projects for demonstration');
      return NextResponse.json(MOCK_ENGINEERING_PROJECTS);
    }

    console.log(`✅ Retrieved ${projects.length} projects from database`);

    // Transform database data with safe property access
    const transformedProjects = projects.map(project => {
      const p = project as any;
      
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description || 'No description available',
        readme: p.readme,
        
        // Engineering-specific fields (with fallbacks)
        engineering_discipline: p.engineering_discipline || p.discipline || 'Engineering',
        project_type: p.project_type || 'design',
        complexity_level: p.complexity_level || 'intermediate',
        project_status: p.project_status || 'completed',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        materials: Array.isArray(p.materials) ? p.materials : [],
        
        // Legacy support
        discipline: p.engineering_discipline || p.discipline || 'Engineering',
        
        // Media and links
        image_url: p.thumbnail_url || p.image_url,
        thumbnail_url: p.thumbnail_url,
        gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
        repository_url: p.repository_url,
        demo_url: p.demo_url,
        documentation_url: p.documentation_url,
        video_url: p.video_url,
        cad_file_formats: Array.isArray(p.cad_file_formats) ? p.cad_file_formats : [],
        
        // Metadata
        tags: Array.isArray(p.tags) ? p.tags : [],
        license: p.license || 'MIT',
        
        // Engagement metrics
        view_count: Number(p.view_count) || 0,
        like_count: Number(p.like_count) || 0,
        download_count: Number(p.download_count) || 0,
        bookmark_count: Number(p.bookmark_count) || 0,
        
        // Status flags
        is_featured: p.is_featured || false,
        is_verified: p.is_verified || false,
        
        // Timestamps
        created_at: p.created_at,
        updated_at: p.updated_at,
        published_at: p.published_at,
        
        // Author information (simplified)
        author: {
          id: p.owner_id,
          username: 'engineer',
          handle: 'engineer',
          display_name: 'Engineering Professional',
          avatar_url: null,
          engineering_discipline: p.engineering_discipline || p.discipline,
          is_verified: false,
        },
        
        // Legacy fields
        tips_cents: 0,
        thumb_path: p.thumbnail_url,
      };
    });

    return NextResponse.json(transformedProjects);

  } catch (error) {
    console.error('Projects API error:', error);
    console.log('🔄 Fallback: Serving mock engineering projects');
    return NextResponse.json(MOCK_ENGINEERING_PROJECTS);
  }
} 