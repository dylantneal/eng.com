'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  HeartIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState as usePopoverState } from 'react';

const ENGINEERING_DISCIPLINES = [
  'Aerospace Engineering',
  'Biomedical Engineering',
  'Chemical Engineering',
  'Civil Engineering',
  'Computer Engineering',
  'Electrical Engineering',
  'Environmental Engineering',
  'Industrial Engineering',
  'Materials Science Engineering',
  'Mechanical Engineering',
  'Nuclear Engineering',
  'Petroleum Engineering',
  'Software Engineering',
  'Systems Engineering',
  'Other'
];

const MOCK_PROJECTS = [
  {
    id: '1',
    slug: 'arduino-weather-station',
    title: 'Arduino Weather Station',
    description: 'A comprehensive IoT weather monitoring system built with Arduino, featuring real-time data collection, wireless transmission, and web-based dashboard visualization.',
    image_url: 'https://projects.arduinocontent.cc/5d4ddea4-38b2-42e9-92f0-6b4f12da5e3c.JPG',
    discipline: 'Electrical Engineering',
    tags: ['arduino', 'iot', 'sensors', 'weather', 'electronics'],
    view_count: 1280,
    like_count: 47,
    download_count: 245,
    created_at: '2024-01-15T10:00:00Z',
    author: {
      id: 'user-1',
      display_name: 'Alice Smith',
      username: 'alicesmith',
      avatar_url: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
  },
  {
    id: '2',
    slug: '3d-printed-robot-arm',
    title: '3D Printed Robot Arm',
    description: 'A 6-axis robotic arm designed for educational purposes, featuring 3D printed components, servo control, and Arduino-based motion planning with inverse kinematics.',
    image_url: 'https://web-objects.markforged.com/craft/common/_small/5be21a397a0067baae10a774_Screen_Shot_2018-11-06_at_3.19.06_PM.png',
    discipline: 'Mechanical Engineering',
    tags: ['robotics', '3d-printing', 'mechanical', 'automation', 'education'],
    view_count: 3420,
    like_count: 156,
    download_count: 892,
    created_at: '2024-01-10T14:30:00Z',
    author: {
      id: 'user-2',
      display_name: 'Bob Johnson',
      username: 'bobjohnson',
      avatar_url: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
  },
  {
    id: '3',
    slug: 'iot-smart-home-controller',
    title: 'IoT Smart Home Controller',
    description: 'Complete smart home automation system with voice control, mobile app, and machine learning-based energy optimization. Supports 50+ device types.',
    image_url: 'https://insidetelecom.com/wp-content/uploads/2022/10/smart-home-01-1024x576.jpg',
    discipline: 'Software Engineering',
    tags: ['iot', 'smart-home', 'automation', 'machine-learning', 'mobile'],
    view_count: 2150,
    like_count: 89,
    download_count: 634,
    created_at: '2024-01-08T09:15:00Z',
    author: {
      id: 'user-3',
      display_name: 'Charlie Davis',
      username: 'charliedavis',
      avatar_url: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
  },
  {
    id: '4',
    slug: 'custom-pcb-design-tool',
    title: 'Custom PCB Design Tool',
    description: 'Professional PCB design software with auto-routing, DRC checking, and 3D visualization. Supports multi-layer designs up to 16 layers with impedance control.',
    image_url: 'https://www.cirexx.com/wp-content/uploads/PCB-Layout-Board-1024x455.jpg',
    discipline: 'Electrical Engineering',
    tags: ['pcb', 'electronics', 'cad', 'design-tools', 'hardware'],
    view_count: 4850,
    like_count: 203,
    download_count: 1240,
    created_at: '2024-01-05T16:45:00Z',
    author: {
      id: 'user-4',
      display_name: 'Diana Evans',
      username: 'dianaevans',
      avatar_url: 'https://randomuser.me/api/portraits/women/4.jpg',
    },
  },
  {
    id: '5',
    slug: 'drone-flight-controller',
    title: 'Drone Flight Controller',
    description: 'Advanced flight controller firmware with GPS navigation, obstacle avoidance, and autonomous mission planning. Supports both multirotor and fixed-wing aircraft.',
    image_url: 'https://oscarliang.com/wp-content/uploads/2022/11/how-to-build-fpv-drone-2023-fc-stack-nuts.jpg',
    discipline: 'Software Engineering',
    tags: ['drone', 'flight-control', 'embedded', 'navigation', 'autonomous'],
    view_count: 2890,
    like_count: 128,
    download_count: 567,
    created_at: '2024-01-02T11:20:00Z',
    author: {
      id: 'user-5',
      display_name: 'Eve Adams',
      username: 'eveadams',
      avatar_url: 'https://randomuser.me/api/portraits/women/5.jpg',
    },
  },
  {
    id: '6',
    slug: 'solar-panel-optimizer',
    title: 'Solar Panel Optimizer',
    description: 'MPPT solar charge controller with real-time optimization algorithms, battery management, and grid-tie capabilities. Increases efficiency by up to 30%.',
    image_url: 'https://blueandgreentomorrow.com/wp-content/uploads/2024/08/Depositphotos_5111838_XL-scaled.jpg',
    discipline: 'Electrical Engineering',
    tags: ['solar', 'renewable-energy', 'power-electronics', 'optimization', 'green-tech'],
    view_count: 1650,
    like_count: 71,
    download_count: 423,
    created_at: '2023-12-28T08:30:00Z',
    author: {
      id: 'user-6',
      display_name: 'Frank Baker',
      username: 'frankbaker',
      avatar_url: 'https://randomuser.me/api/portraits/men/6.jpg',
    },
  },
  {
    id: '7',
    slug: 'ai-powered-cad',
    title: 'AI-Powered CAD Assistant',
    description: 'Next-gen CAD tool with AI-driven design suggestions, real-time collaboration, and cloud rendering.',
    image_url: 'https://www.opencascade.com/wp-content/uploads/2020/09/CAD-Assistant2-650x366.jpg',
    discipline: 'Computer Engineering',
    tags: ['cad', 'ai', 'collaboration', 'cloud', 'design'],
    view_count: 980,
    like_count: 54,
    download_count: 312,
    created_at: '2024-01-12T13:00:00Z',
    author: {
      id: 'user-7',
      display_name: 'Grace Carter',
      username: 'gracecarter',
      avatar_url: 'https://randomuser.me/api/portraits/women/7.jpg',
    },
  },
  {
    id: '8',
    slug: 'biomedical-sensor',
    title: 'Wearable Biomedical Sensor',
    description: 'A flexible, skin-mounted sensor for continuous health monitoring, with Bluetooth connectivity and mobile app integration.',
    image_url: 'https://assets.palmsens.com/app/uploads/2023/11/Sensit-Wearable-on-arm.png.webp',
    discipline: 'Biomedical Engineering',
    tags: ['biomedical', 'sensor', 'wearable', 'health', 'bluetooth'],
    view_count: 720,
    like_count: 33,
    download_count: 210,
    created_at: '2024-01-18T09:00:00Z',
    author: {
      id: 'user-8',
      display_name: 'Hannah Evans',
      username: 'hannahEvans',
      avatar_url: 'https://randomuser.me/api/portraits/women/8.jpg',
    },
  },
  {
    id: '9',
    slug: 'green-building-automation',
    title: 'Green Building Automation',
    description: 'Smart building automation system for energy efficiency, integrating HVAC, lighting, and security with IoT sensors.',
    image_url: 'https://www.advancedcontrolcorp.com/wp-content/uploads/2022/09/green-building-automation-benefits.jpg',
    discipline: 'Civil Engineering',
    tags: ['green', 'building', 'automation', 'iot', 'energy'],
    view_count: 1340,
    like_count: 62,
    download_count: 410,
    created_at: '2024-01-20T15:00:00Z',
    author: {
      id: 'user-9',
      display_name: 'Ian Thompson',
      username: 'ianThompson',
      avatar_url: 'https://randomuser.me/api/portraits/men/9.jpg',
    },
  },
];

export default function ProjectsGallery() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('Newest');
  const [popoverAuthorId, setPopoverAuthorId] = usePopoverState(null);

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, selectedDiscipline, sortOption]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedDiscipline !== 'All') params.append('discipline', selectedDiscipline);
      if (sortOption !== 'Newest') {
        const sortMap: Record<string, string> = {
          'Most Liked': 'most_liked',
          'Most Viewed': 'most_viewed',
          'Newest': 'newest'
        };
        params.append('sort', sortMap[sortOption] || 'newest');
      }
      
      const response = await fetch(`/api/projects?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle both real database data and mock data structures
      if (Array.isArray(data) && data.length > 0) {
        const processedData = data.map(project => {
          // Ensure project is a valid object
          if (!project || typeof project !== 'object') {
            return null;
          }
          
          return {
            id: project.id || Math.random().toString(36),
            slug: project.slug || project.id || Math.random().toString(36),
            title: project.title || 'Untitled Project',
            description: project.description || 'No description available',
            image_url: project.image_url || null,
            discipline: project.discipline || 'Other',
            tags: Array.isArray(project.tags) ? project.tags : [],
            view_count: Number(project.view_count) || 0,
            like_count: Number(project.like_count) || 0,
            download_count: Number(project.download_count) || 0,
            created_at: project.created_at || new Date().toISOString(),
            author: project.author || {
              id: project.author_id || project.owner_id || 'unknown',
              username: project.username || 'unknown',
              handle: project.handle || project.username || 'unknown',
              display_name: project.display_name || project.username || 'Unknown Author',
              avatar_url: project.avatar_url || null,
            }
          };
        }).filter(Boolean); // Remove any null entries
        
        setProjects(processedData);
      } else {
        console.log('No projects received from API, using mock data');
        setProjects(MOCK_PROJECTS);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects(MOCK_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  // Tag click handler
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? null : tag);
  };

  // Discipline filter handler
  const handleDisciplineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDiscipline(e.target.value);
  };

  // Sort option handler
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  // Filter and sort projects
  const filteredProjects = projects.filter((p) => {
    if (!p || typeof p !== 'object') return false;
    
    const tagMatch = selectedTag ? 
      (Array.isArray(p.tags) && p.tags.includes(selectedTag)) : true;
    const disciplineMatch = selectedDiscipline === 'All' || 
      (p.discipline || 'Other') === selectedDiscipline;
    
    return tagMatch && disciplineMatch;
  }).sort((a, b) => {
    if (!a || !b) return 0;
    
    if (sortOption === 'Most Liked') {
      return (Number(b.like_count) || 0) - (Number(a.like_count) || 0);
    }
    if (sortOption === 'Most Viewed') {
      return (Number(b.view_count) || 0) - (Number(a.view_count) || 0);
    }
    
    // Default to newest first
    try {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    } catch (error) {
      return 0;
    }
  });

  // Group filtered projects by discipline
  const projectsByDiscipline = ENGINEERING_DISCIPLINES.reduce((acc, discipline) => {
    const projectsInDiscipline = filteredProjects.filter(
      (p) => {
        if (!p || typeof p !== 'object') return false;
        const projectDiscipline = p.discipline || 'Other';
        return projectDiscipline.toLowerCase() === discipline.toLowerCase();
      }
    );
    acc[discipline] = projectsInDiscipline;
    return acc;
  }, {} as Record<string, any[]>);

  const handleProjectClick = (slug: string) => {
    router.push(`/projects/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-900 text-white">
      {/* Hero Header */}
      <div className="w-full h-56 md:h-64 bg-gradient-to-br from-blue-600/80 to-purple-700/80 flex items-center justify-center relative mb-10 shadow-lg">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          <div className="flex items-center gap-4 mb-2">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="url(#paint0_linear)"/><path d="M24 12l8 16H16l8-16z" fill="#fff"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#A78BFA"/></linearGradient></defs></svg>
            <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow text-white">Project Gallery</h1>
          </div>
          <p className="text-lg text-blue-100/90 font-medium">Discover, share, and collaborate on cutting-edge engineering projects</p>
        </div>
      </div>
      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto -mt-16 mb-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30">
          <div className="flex gap-2 items-center">
            <label htmlFor="discipline-select" className="text-sm font-semibold text-blue-100">Discipline:</label>
            <select id="discipline-select" value={selectedDiscipline} onChange={handleDisciplineChange} className="rounded-full px-4 py-2 text-blue-900 bg-white/80 font-semibold shadow focus:ring-2 focus:ring-blue-400">
              <option value="All">All</option>
              {ENGINEERING_DISCIPLINES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="sort-select" className="text-sm font-semibold text-blue-100">Sort by:</label>
            <select id="sort-select" value={sortOption} onChange={handleSortChange} className="rounded-full px-4 py-2 text-blue-900 bg-white/80 font-semibold shadow focus:ring-2 focus:ring-blue-400">
              <option>Newest</option>
              <option>Most Liked</option>
              <option>Most Viewed</option>
            </select>
          </div>
          <div className="relative w-full max-w-xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-blue-400" />
            </span>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 rounded-full bg-white/70 text-blue-900 placeholder-blue-400 font-medium shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search projects by title, tag, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/20 backdrop-blur-md rounded-2xl shadow-xl h-80 border border-white/30" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <h2 className="text-2xl font-bold mb-4">No projects found</h2>
          <p className="mb-6 text-blue-200">Be the first to showcase your engineering project!</p>
          <button
            className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all"
            onClick={() => router.push('/projects/new')}
          >
            Create New Project
          </button>
        </div>
      ) :
        Object.entries(projectsByDiscipline).map(([discipline, projs]) =>
          projs.length > 0 && (
            <section key={discipline} className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="url(#paint0_linear)"/><path d="M12 6l4 8H8l4-8z" fill="#fff"/><defs><linearGradient id="paint0_linear" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#A78BFA"/></linearGradient></defs></svg>
                </div>
                <h2 className="text-2xl font-bold text-white drop-shadow">{discipline}</h2>
                <div className="flex-1 border-t border-white/20 ml-4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projs.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-blue-400 group relative"
                    onClick={() => handleProjectClick(project.slug)}
                  >
                    <div className="relative h-52 w-full overflow-hidden">
                      <img
                        src={project.image_url || '/placeholder-project.jpg'}
                        alt={project.title}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {project.tags?.map((tag: string) => (
                          <span
                            key={tag}
                            className={`bg-blue-900/70 text-xs px-3 py-1 rounded-full font-medium shadow-sm border border-blue-400/30 cursor-pointer transition-all ${selectedTag === tag ? 'ring-2 ring-blue-400' : ''}`}
                            onClick={e => { e.stopPropagation(); handleTagClick(tag); }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col gap-2">
                      <h3 className="text-xl font-bold mb-1 text-white truncate drop-shadow">{project.title}</h3>
                      <p className="text-base text-blue-100 mb-2 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-6 text-sm text-blue-200 mb-2 border-b border-white/20 pb-2">
                        <span className="flex items-center gap-1"><EyeIcon className="inline h-4 w-4 mr-1" />{project.view_count}</span>
                        <span className="flex items-center gap-1"><HeartIconSolid className="inline h-4 w-4 mr-1 text-red-400" />{project.like_count}</span>
                        <span className="flex items-center gap-1"><ArrowDownTrayIcon className="inline h-4 w-4 mr-1" />{project.download_count}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <a
                          href={`/profile/${project.author?.id}`}
                          className="flex items-center gap-2 group focus:outline-none"
                          tabIndex={0}
                          aria-label={`View profile of ${project.author?.display_name || 'Unknown Author'}`}
                          onMouseEnter={() => setPopoverAuthorId(project.author?.id)}
                          onMouseLeave={() => setPopoverAuthorId(null)}
                          onFocus={() => setPopoverAuthorId(project.author?.id)}
                          onBlur={() => setPopoverAuthorId(null)}
                        >
                          <img
                            src={project.author?.avatar_url || '/placeholder-project.jpg'}
                            alt={project.author?.display_name || 'Unknown Author'}
                            className="w-8 h-8 rounded-full border-2 border-blue-400 shadow-sm object-cover bg-white"
                          />
                          <span className="text-sm font-semibold text-blue-100 group-hover:underline">
                            {project.author?.display_name || 'Unknown Author'}
                          </span>
                        </a>
                        {popoverAuthorId === project.author?.id && (
                          <div className="absolute z-50 mt-12 ml-2 bg-white text-gray-900 rounded-lg shadow-lg p-4 w-56 border border-blue-200 animate-fade-in" role="tooltip">
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={project.author?.avatar_url || '/placeholder-project.jpg'}
                                alt={project.author?.display_name || 'Unknown Author'}
                                className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover bg-white"
                              />
                              <div>
                                <div className="font-bold text-base text-blue-900">{project.author?.display_name || 'Unknown Author'}</div>
                                <div className="text-xs text-gray-500">@{project.author?.username || 'unknown'}</div>
                              </div>
                            </div>
                            <a href={`/profile/${project.author?.id}`} className="block mt-2 text-blue-600 hover:underline text-xs font-semibold">View Profile</a>
                          </div>
                        )}
                        <span className="text-xs text-blue-200 ml-auto">{project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )
        )
      }
    </div>
  );
} 