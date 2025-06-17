import React from 'react';
import { createClient } from '@/utils/supabase-server';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import Markdown from 'react-markdown';
import TipJar from '@/components/TipJar';
import Comments from '@/components/Comments';
import Link from 'next/link';
import { 
  HeartIcon, 
  ShareIcon, 
  DocumentIcon, 
  CodeBracketIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowDownTrayIcon as DownloadIcon,
  EyeIcon,
  StarIcon,
  CpuChipIcon,
  RectangleGroupIcon as CircuitBoardIcon,
  CogIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';

export const revalidate = 60;

// Get engineering discipline icon
const getDisciplineIcon = (discipline: string) => {
  switch (discipline?.toLowerCase()) {
    case 'mechanical': return CogIcon;
    case 'electrical': return CircuitBoardIcon;
    case 'software': return CodeBracketIcon;
    case 'research': return BeakerIcon;
    default: return CpuChipIcon;
  }
};

export default async function ProjectShowcase({ 
  params 
}: { 
  params: { username: string; slug: string } 
}) {
  const supabase = createClient();
  const session = await getServerSession(authOptions);

  // First, find the user by handle/username
  const { data: owner } = await supabase
    .from('profiles')
    .select('id, handle, avatar_url, bio, plan')
    .eq('handle', params.username)
    .single();

  if (!owner) {
    notFound();
  }

  // Then find the project by owner and slug
  const { data: project } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      slug,
      owner_id,
      is_public,
      created_at,
      updated_at,
      current_version,
      description,
      tags,
      discipline,
      license,
      repository_url,
      demo_url,
      image_url,
      download_count,
      view_count,
      like_count
    `)
    .eq('owner_id', owner.id)
    .eq('slug', params.slug)
    .maybeSingle();

  // If no real project found, show sample data for demo purposes
  let isDemo = false;
  let currentProject = project;
  
  if (!project) {
    // Check if this is one of our sample projects
    const sampleProjects = {
      'arduino-weather-station': {
        id: 'sample-1',
        title: 'Arduino Weather Station',
        slug: 'arduino-weather-station',
        owner_id: 'sample-user',
        is_public: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        description: 'A comprehensive IoT weather monitoring system built with Arduino, featuring real-time data collection, wireless transmission, and web-based dashboard visualization.',
        tags: ['arduino', 'iot', 'sensors', 'weather', 'electronics'],
        discipline: 'Electrical',
        license: 'MIT',
        repository_url: 'https://github.com/engineerdemo/arduino-weather-station',
        demo_url: 'https://weather-demo.eng.com',
        image_url: 'https://picsum.photos/seed/weather-station/600/400',
        download_count: 245,
        view_count: 1280,
        like_count: 47,
        current_version: 'sample-version-1'
      },
      '3d-printed-robot-arm': {
        id: 'sample-2',
        title: '3D Printed Robot Arm',
        slug: '3d-printed-robot-arm',
        owner_id: 'sample-user',
        is_public: true,
        created_at: '2024-01-10T14:30:00Z',
        updated_at: '2024-01-10T14:30:00Z',
        description: 'A 6-axis robotic arm designed for educational purposes, featuring 3D printed components, servo control, and Arduino-based motion planning with inverse kinematics.',
        tags: ['robotics', '3d-printing', 'mechanical', 'automation', 'education'],
        discipline: 'Mechanical',
        license: 'GPL-3.0',
        repository_url: 'https://github.com/roboticsexpert/robot-arm-v2',
        demo_url: 'https://robot-arm-sim.eng.com',
        image_url: 'https://picsum.photos/seed/robot-arm/600/400',
        download_count: 892,
        view_count: 3420,
        like_count: 156,
        current_version: 'sample-version-2'
      },
      'iot-smart-home-controller': {
        id: 'sample-3',
        title: 'IoT Smart Home Controller',
        slug: 'iot-smart-home-controller',
        owner_id: 'sample-user',
        is_public: true,
        created_at: '2024-01-08T09:15:00Z',
        updated_at: '2024-01-08T09:15:00Z',
        description: 'Complete smart home automation system with voice control, mobile app, and machine learning-based energy optimization. Supports 50+ device types.',
        tags: ['iot', 'smart-home', 'automation', 'machine-learning', 'mobile'],
        discipline: 'Software',
        license: 'Apache-2.0',
        repository_url: 'https://github.com/iotmaker/smart-home-hub',
        demo_url: 'https://smarthome-demo.eng.com',
        image_url: 'https://picsum.photos/seed/smart-home/600/400',
        download_count: 634,
        view_count: 2150,
        like_count: 89,
        current_version: 'sample-version-3'
      },
      'custom-pcb-design-tool': {
        id: 'sample-4',
        title: 'Custom PCB Design Tool',
        slug: 'custom-pcb-design-tool',
        owner_id: 'sample-user',
        is_public: true,
        created_at: '2024-01-05T16:45:00Z',
        updated_at: '2024-01-05T16:45:00Z',
        description: 'Professional PCB design software with auto-routing, DRC checking, and 3D visualization. Supports multi-layer designs up to 16 layers with impedance control.',
        tags: ['pcb', 'electronics', 'cad', 'design-tools', 'hardware'],
        discipline: 'Electrical',
        license: 'Commercial',
        repository_url: null,
        demo_url: 'https://pcb-tool-demo.eng.com',
        image_url: 'https://picsum.photos/seed/pcb-tool/600/400',
        download_count: 1240,
        view_count: 4850,
        like_count: 203,
        current_version: 'sample-version-4'
      },
      'drone-flight-controller': {
        id: 'sample-5',
        title: 'Drone Flight Controller',
        slug: 'drone-flight-controller',
        owner_id: 'sample-user',
        is_public: true,
        created_at: '2024-01-02T11:20:00Z',
        updated_at: '2024-01-02T11:20:00Z',
        description: 'Advanced flight controller firmware with GPS navigation, obstacle avoidance, and autonomous mission planning. Supports both multirotor and fixed-wing aircraft.',
        tags: ['drone', 'flight-control', 'embedded', 'navigation', 'autonomous'],
        discipline: 'Software',
        license: 'GPL-3.0',
        repository_url: 'https://github.com/dronetech/advanced-fc',
        demo_url: 'https://drone-sim.eng.com',
        image_url: 'https://picsum.photos/seed/drone-controller/600/400',
        download_count: 567,
        view_count: 2890,
        like_count: 128,
        current_version: 'sample-version-5'
      },
      'solar-panel-optimizer': {
        id: 'sample-6',
        title: 'Solar Panel Optimizer',
        slug: 'solar-panel-optimizer',
        owner_id: 'sample-user',
        is_public: true,
        created_at: '2023-12-28T08:30:00Z',
        updated_at: '2023-12-28T08:30:00Z',
        description: 'MPPT solar charge controller with real-time optimization algorithms, battery management, and grid-tie capabilities. Increases efficiency by up to 30%.',
        tags: ['solar', 'renewable-energy', 'power-electronics', 'optimization', 'green-tech'],
        discipline: 'Electrical',
        license: 'MIT',
        repository_url: 'https://github.com/greenengineer/solar-optimizer',
        demo_url: 'https://solar-monitor.eng.com',
        image_url: 'https://picsum.photos/seed/solar-optimizer/600/400',
        download_count: 423,
        view_count: 1650,
        like_count: 71,
        current_version: 'sample-version-6'
      }
    };

    if (sampleProjects[params.slug]) {
      currentProject = sampleProjects[params.slug];
      isDemo = true;
    } else {
      notFound();
    }
  }

  // Sample version data for demo projects
  const sampleVersions = {
    'sample-version-1': {
      id: 'sample-version-1',
      readme_md: `# Arduino Weather Station

## Overview
This project demonstrates a complete IoT weather monitoring solution using Arduino microcontrollers and various environmental sensors.

## Features
- **Real-time monitoring** of temperature, humidity, pressure, and wind speed
- **Wireless data transmission** via WiFi to cloud dashboard
- **Historical data logging** with 1-minute resolution
- **Alert system** for extreme weather conditions
- **Mobile-responsive web interface**

## Hardware Components
- Arduino ESP32 DevKit
- DHT22 Temperature/Humidity Sensor
- BMP280 Pressure Sensor
- Anemometer (wind speed)
- Solar panel for power
- Waterproof enclosure

## Software Stack
- Arduino IDE with ESP32 libraries
- MQTT for data transmission
- InfluxDB for time-series data storage
- Grafana for visualization dashboard
- React.js web interface

## Installation
1. Flash the firmware to your ESP32
2. Configure WiFi credentials
3. Set up cloud database connection
4. Deploy dashboard to web server

## Performance
- **Battery life**: 6+ months on solar power
- **Data accuracy**: ±0.5°C temperature, ±2% humidity
- **Range**: Up to 1km with LoRa extension
- **Update frequency**: Configurable 1-60 minutes`,
      version_number: 'v2.1.0',
      files: [
        { name: 'weather_station.ino', path: 'firmware/weather_station.ino', size: 15420 },
        { name: 'sensor_config.h', path: 'firmware/sensor_config.h', size: 2340 },
        { name: 'enclosure_v2.stl', path: 'hardware/enclosure_v2.stl', size: 847200 },
        { name: 'pcb_schematic.pdf', path: 'hardware/pcb_schematic.pdf', size: 125400 },
        { name: 'assembly_guide.pdf', path: 'docs/assembly_guide.pdf', size: 2156000 }
      ]
    }
  };

  // Get version data (real or sample)
  let currentVersion = null;
  if (!isDemo && currentProject?.current_version) {
    const { data: versionData } = await supabase
      .from('project_versions')
      .select('readme_md, files, version_number, changelog')
      .eq('id', currentProject.current_version)
      .single();
    currentVersion = versionData;
  } else if (isDemo) {
    currentVersion = sampleVersions['sample-version-1'];
  }

  // Check if user has liked this project (only for real projects)
  const { data: userLike } = session && !isDemo ? await supabase
    .from('project_likes')
    .select('id')
    .eq('project_id', currentProject.id)
    .eq('user_id', session.user.id)
    .maybeSingle() : { data: null };

  const files = currentVersion?.files || [];
  const readme = currentVersion?.readme_md || '';
  const tags = currentProject.tags || [];
  const DisciplineIcon = getDisciplineIcon(currentProject.discipline);

  // Increment view count (only for real projects)
  if (!isDemo) {
    supabase
      .from('projects')
      .update({ view_count: (currentProject.view_count || 0) + 1 })
      .eq('id', currentProject.id)
      .then(() => {});
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-gray-900" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        {/* Demo Badge */}
        {isDemo && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
            <p className="text-blue-300 text-center">
              🎯 <strong>Demo Project</strong> - This is sample data to showcase the platform's capabilities. 
              <Link href="/projects/new" className="ml-2 underline hover:text-blue-200">
                Create your own project →
              </Link>
            </p>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">eng.com</Link>
          <span>/</span>
          <Link href="/gallery" className="hover:text-white transition-colors">Projects</Link>
          <span>/</span>
          <Link href={`/@${params.username}`} className="hover:text-white transition-colors">@{params.username}</Link>
          <span>/</span>
          <span className="text-white">{currentProject.slug}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <DisciplineIcon className="w-8 h-8 text-blue-400" />
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                      {currentProject.discipline || 'Engineering'}
                    </span>
                    {owner?.plan === 'PRO' && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                        ⭐ PRO
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                    {currentProject.title}
                  </h1>
                  
                  {currentProject.description && (
                    <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                      {currentProject.description}
                    </p>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {tags.map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-lg text-sm border border-gray-600/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Image */}
                {currentProject.image_url && (
                  <div className="ml-8">
                    <img 
                      src={currentProject.image_url} 
                      alt={currentProject.title}
                      className="w-48 h-32 object-cover rounded-xl border border-white/20"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105">
                  <DownloadIcon className="w-5 h-5" />
                  Download Project
                </button>
                
                {currentProject.demo_url && (
                  <Link 
                    href={currentProject.demo_url}
                    target="_blank"
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-semibold text-white transition-all duration-300"
                  >
                    <EyeIcon className="w-5 h-5" />
                    Live Demo
                  </Link>
                )}
                
                {currentProject.repository_url && (
                  <Link 
                    href={currentProject.repository_url}
                    target="_blank"
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-white transition-all duration-300"
                  >
                    <CodeBracketIcon className="w-5 h-5" />
                    Source Code
                  </Link>
                )}

                <button className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white transition-all duration-300">
                  <ShareIcon className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            {/* Project Documentation */}
            {readme && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <DocumentIcon className="w-6 h-6 text-blue-400" />
                  Documentation
                </h2>
                
                <div className="prose prose-invert prose-blue max-w-none text-gray-300">
                  <Markdown>
                    {readme}
                  </Markdown>
                </div>
              </div>
            )}

            {/* Project Files */}
            {files.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <DocumentIcon className="w-6 h-6 text-blue-400" />
                  Project Files ({files.length})
                </h2>
                
                <div className="grid gap-3">
                  {files.map((file: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <DocumentIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-white font-medium">
                          {file.name || file.path?.split('/').pop() || 'Unknown file'}
                        </span>
                        {file.size && (
                          <span className="text-sm text-gray-400">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => alert(`Download ${file.name} - In a real implementation, this would download the file.`)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-blue-400" />
                Project Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Views</span>
                  </div>
                  <span className="font-semibold text-white">
                    {(currentProject.view_count || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DownloadIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Downloads</span>
                  </div>
                  <span className="font-semibold text-white">
                    {(currentProject.download_count || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Likes</span>
                  </div>
                  <span className="font-semibold text-white">
                    {(currentProject.like_count || 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">Updated</span>
                  </div>
                  <span className="font-semibold text-white">
                    {new Date(currentProject.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Like Button */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <button 
                  onClick={() => alert('Like functionality - In a real implementation, this would toggle the like status.')}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 rounded-xl font-medium text-red-300 transition-colors"
                >
                  {userLike ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                  {userLike ? 'Liked' : 'Like Project'}
                </button>
              </div>
            </div>

            {/* Project Creator */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-blue-400" />
                Creator
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {owner?.avatar_url ? (
                    <img 
                      src={owner.avatar_url} 
                      alt={`@${params.username}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    params.username?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                
                <div>
                  <Link 
                    href={`/@${params.username}`}
                    className="font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    @{params.username}
                  </Link>
                  {owner?.plan === 'PRO' && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                      PRO
                    </span>
                  )}
                  {owner?.bio && (
                    <p className="text-sm text-gray-400 mt-1">{owner.bio}</p>
                  )}
                </div>
              </div>

              <Link 
                href={`/@${params.username}`}
                className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-white transition-colors"
              >
                View Profile
              </Link>
            </div>

            {/* Tip Jar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Support This Project</h3>
              <p className="text-gray-300 text-sm mb-4">
                Show your appreciation for this engineering work
              </p>
              <TipJar projectId={currentProject.id} payeeId={currentProject.owner_id} />
            </div>

            {/* Project Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Project Info</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">License:</span>
                  <span className="ml-2 text-white font-medium">
                    {currentProject.license || 'Not specified'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-400">Version:</span>
                  <span className="ml-2 text-white font-medium">
                    {currentVersion?.version_number || '1.0.0'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="ml-2 text-white font-medium">
                    {new Date(currentProject.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Discussion</h2>
            {!isDemo ? (
              <Comments projectId={currentProject.id} ownerId={currentProject.owner_id} />
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="mb-4">💬 Comments are available for real projects</p>
                <Link 
                  href="/projects/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors"
                >
                  Create Your Project
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 