'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  BookmarkIcon, 
  TrophyIcon,
  FireIcon,
  PlusIcon,
  EyeIcon,
  BellIcon,
  StarIcon,
  FolderIcon,
  CubeIcon,
  ChatBubbleLeftEllipsisIcon,
  ShoppingCartIcon,
  CogIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  ChevronRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  CpuChipIcon,
  SignalIcon,
  WrenchScrewdriverIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { 
  ChartBarIcon as ChartBarSolid,
  UserGroupIcon as UserGroupSolid,
  BookmarkIcon as BookmarkSolid,
  TrophyIcon as TrophySolid,
  FireIcon as FireSolid,
  BellIcon as BellSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

interface ActivityItem {
  id: string;
  type: 'comment' | 'like' | 'follow' | 'project_update' | 'sale' | 'tip' | 'review' | 'fork' | 'download' | 'order';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
  bgColor: string;
  metadata?: any;
  unread?: boolean;
}

interface UserMetrics {
  projects_bookmarked: number;
  unread_messages: number;
  open_orders: number;
  new_stars: number;
  forks: number;
  downloads_today: number;
  pending_orders: number;
  sales_this_week: number;
  estimated_payout: number;
}

interface QuickAction {
  title: string;
  icon: any;
  href: string;
  color: string;
  description: string;
  badge?: boolean;
  urgent?: boolean;
}

function EngineeringHealthWidget() {
  const [projectHealth, setProjectHealth] = useState({
    buildStatus: 'passing',
    testsRunning: 12,
    coverage: 87,
    lastBuild: '2 minutes ago'
  });

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <BeakerIcon className="w-5 h-5 text-green-400" />
        <h3 className="font-semibold text-white">Project Health</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Build Status</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-300">Passing</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Test Coverage</span>
          <span className="text-sm text-blue-300">{projectHealth.coverage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" style={{ width: `${projectHealth.coverage}%` }}></div>
        </div>
      </div>
    </div>
  );
}

function QuickCalculator() {
  const [activeCalc, setActiveCalc] = useState<'ohms' | 'thermal' | 'gear' | null>(null);
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <CpuChipIcon className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white">Quick Calc</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={() => setActiveCalc(activeCalc === 'ohms' ? null : 'ohms')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-center"
        >
          <BoltIcon className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
          <div className="text-gray-300">Ohm's</div>
        </button>
        <button 
          onClick={() => setActiveCalc(activeCalc === 'thermal' ? null : 'thermal')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-center"
        >
          <FireIcon className="w-4 h-4 mx-auto mb-1 text-red-400" />
          <div className="text-gray-300">Thermal</div>
        </button>
        <button 
          onClick={() => setActiveCalc(activeCalc === 'gear' ? null : 'gear')}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-center"
        >
          <CogIcon className="w-4 h-4 mx-auto mb-1 text-blue-400" />
          <div className="text-gray-300">Gear</div>
        </button>
      </div>
      
      {activeCalc === 'ohms' && (
        <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-xs text-gray-300 mb-2">V = I × R</div>
          <div className="space-y-2">
            <input placeholder="Voltage (V)" className="w-full p-2 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-gray-400" />
            <input placeholder="Current (A)" className="w-full p-2 text-xs bg-white/10 border border-white/20 rounded text-white placeholder-gray-400" />
            <div className="text-xs text-green-300">R = 12.5 Ω</div>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveCollaboration() {
  const [activeUsers, setActiveUsers] = useState([
    { name: 'Sarah', project: 'Robot Arm v3', avatar: 'S', color: 'bg-blue-500' },
    { name: 'Mike', project: 'IoT Sensor', avatar: 'M', color: 'bg-green-500' },
    { name: 'Alex', project: 'PCB Design', avatar: 'A', color: 'bg-purple-500' }
  ]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <SignalIcon className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-white">Live Activity</h3>
      </div>
      <div className="space-y-2">
        {activeUsers.map((user, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full ${user.color} flex items-center justify-center text-xs text-white font-bold relative`}>
              {user.avatar}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-gray-900 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">editing {user.project}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsightsPanel() {
  const [insights, setInsights] = useState([
    {
      type: 'optimization',
      message: 'Your robot arm project could benefit from servo placement optimization for 23% better efficiency',
      confidence: 94,
      action: 'View Analysis'
    },
    {
      type: 'trend',
      message: 'LoRaWAN IoT projects are trending +47% this week. Perfect time to launch your sensor network',
      confidence: 87,
      action: 'Market Insights'
    },
    {
      type: 'learning',
      message: 'Based on your interests, consider learning Rust for embedded systems',
      confidence: 91,
      action: 'Learning Path'
    }
  ]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="w-5 h-5 text-pink-400" />
        <h3 className="font-semibold text-white">AI Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.slice(0, 2).map((insight, index) => (
          <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-start gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                insight.type === 'optimization' ? 'bg-blue-400' :
                insight.type === 'trend' ? 'bg-green-400' : 'bg-purple-400'
              }`}></div>
              <p className="text-sm text-gray-300 leading-relaxed">{insight.message}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{ width: `${insight.confidence}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-400">{insight.confidence}%</span>
              </div>
              <button className="text-xs text-pink-300 hover:text-pink-200 transition-colors">
                {insight.action} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentInventory() {
  const [components, setComponents] = useState([
    { name: 'ESP32-WROOM', count: 12, status: 'good', trend: 'stable' },
    { name: 'LM358', count: 3, status: 'low', trend: 'decreasing' },
    { name: '10kΩ Resistor', count: 47, status: 'good', trend: 'stable' },
    { name: 'HC-SR04', count: 0, status: 'out', trend: 'critical' }
  ]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <CubeIcon className="w-5 h-5 text-orange-400" />
        <h3 className="font-semibold text-white">Component Stock</h3>
      </div>
      <div className="space-y-2">
        {components.slice(0, 3).map((comp, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{comp.name}</div>
              <div className="text-xs text-gray-400">
                {comp.count > 0 ? `${comp.count} in stock` : 'Out of stock'}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              comp.status === 'good' ? 'bg-green-400' :
              comp.status === 'low' ? 'bg-yellow-400' : 'bg-red-400'
            } ${comp.status === 'out' ? 'animate-pulse' : ''}`}></div>
          </div>
        ))}
        <button className="w-full mt-2 p-2 text-xs text-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          Manage Inventory →
        </button>
      </div>
    </div>
  );
}

function ProjectTimeline() {
  const [milestones, setMilestones] = useState([
    { title: 'PCB Design Complete', date: 'Today', status: 'completed' },
    { title: 'Component Sourcing', date: 'Tomorrow', status: 'active' },
    { title: 'Assembly & Testing', date: 'May 15', status: 'upcoming' },
    { title: 'Documentation', date: 'May 20', status: 'upcoming' }
  ]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <ClockIcon className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-white">Project Timeline</h3>
      </div>
      <div className="space-y-3">
        {milestones.slice(0, 3).map((milestone, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1 border-2 ${
              milestone.status === 'completed' ? 'bg-green-400 border-green-400' :
              milestone.status === 'active' ? 'bg-blue-400 border-blue-400 animate-pulse' :
              'border-gray-500'
            }`}></div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${
                milestone.status === 'completed' ? 'text-green-300 line-through' :
                milestone.status === 'active' ? 'text-blue-300' : 'text-gray-300'
              }`}>
                {milestone.title}
              </div>
              <div className="text-xs text-gray-400">{milestone.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocalMakerEvents() {
  const [events, setEvents] = useState([
    { name: 'Arduino Meetup', location: 'TechSpace', date: 'Tomorrow 7PM', attendees: 23 },
    { name: '3D Printing Workshop', location: 'MakerLab', date: 'Saturday 2PM', attendees: 8 },
    { name: 'PCB Design Course', location: 'Online', date: 'May 15 6PM', attendees: 45 }
  ]);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <UserGroupIcon className="w-5 h-5 text-emerald-400" />
        <h3 className="font-semibold text-white">Local Events</h3>
      </div>
      <div className="space-y-3">
        {events.slice(0, 2).map((event, index) => (
          <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="font-medium text-white text-sm mb-1">{event.name}</div>
            <div className="text-xs text-gray-400 mb-2">{event.location} • {event.date}</div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[...Array(Math.min(3, Math.floor(event.attendees / 10)))].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border border-gray-700"></div>
                ))}
              </div>
              <span className="text-xs text-gray-400">{event.attendees} attending</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [userRole, setUserRole] = useState<'explorer' | 'creator' | 'seller'>('explorer');

  if (!user) return null;

  // Mock user metrics - in real app, fetch from API
  const metrics: UserMetrics = {
    projects_bookmarked: 23,
    unread_messages: 4,
    open_orders: 2,
    new_stars: 12,
    forks: 5,
    downloads_today: 47,
    pending_orders: 3,
    sales_this_week: 8,
    estimated_payout: 1247.50
  };

  // Determine user role based on activity/data
  useEffect(() => {
    // In real app, determine role based on user data
    if (metrics.sales_this_week > 0 || metrics.pending_orders > 0) {
      setUserRole('seller');
    } else if (metrics.new_stars > 0 || metrics.forks > 0) {
      setUserRole('creator');
    } else {
      setUserRole('explorer');
    }
  }, []);

  // Mock activity feed - in real app, fetch from API
  const activityFeed: ActivityItem[] = [
    {
      id: '1',
      type: 'comment',
      title: 'New comment on "Arduino Weather Station"',
      description: '@alex_eng commented: "Great use of the DHT22 sensor! Have you considered adding wind speed measurement?"',
      timestamp: '2 minutes ago',
      icon: ChatBubbleLeftEllipsisIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      unread: true,
      metadata: { 
        projectImage: '🌡️',
        commentCount: 3,
        type: 'technical_discussion'
      }
    },
    {
      id: '2',
      type: 'like',
      title: 'Your project gained 3 new stars',
      description: '"3D Printed Robot Arm" is trending in the Robotics category',
      timestamp: '15 minutes ago',
      icon: StarIcon,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      unread: true,
      metadata: { 
        projectImage: '🦾',
        trendingRank: 5,
        categoryGrowth: '+23%'
      }
    },
    {
      id: '3',
      type: 'sale',
      title: 'New sale completed',
      description: 'Someone purchased "PCB Design Files - IoT Sensor Board" for $25.00',
      timestamp: '1 hour ago',
      icon: ShoppingCartIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      metadata: { 
        amount: 25.00,
        projectImage: '💾',
        buyerLocation: 'Germany',
        totalSales: 47
      }
    },
    {
      id: '4',
      type: 'project_update',
      title: 'Build completed successfully',
      description: 'Smart Home Hub v2.1: All tests passed ✅ | 94% code coverage | 0 critical issues',
      timestamp: '3 hours ago',
      icon: CheckCircleIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      metadata: {
        projectImage: '🏠',
        buildTime: '4m 32s',
        testsCount: 127,
        coverage: 94
      }
    },
    {
      id: '5',
      type: 'tip',
      title: 'You received a tip!',
      description: '@maker_jane sent you $5.00 for "Excellent tutorial on PCB layout best practices"',
      timestamp: '5 hours ago',
      icon: BanknotesIcon,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      metadata: { 
        amount: 5.00,
        projectImage: '⚡',
        tipperLevel: 'Pro Member'
      }
    },
    {
      id: '6',
      type: 'project_update',
      title: 'Simulation analysis complete',
      description: 'FEA results for "Drone Frame Design": Max stress 45.2 MPa | Safety factor 3.1 | Weight optimized to 287g',
      timestamp: '6 hours ago',
      icon: BeakerIcon,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      metadata: {
        projectImage: '🚁',
        simType: 'FEA',
        maxStress: '45.2 MPa',
        safetyFactor: 3.1,
        weight: '287g'
      }
    }
  ];

  const getMetricsForRole = () => {
    const baseMetrics = [
      { key: 'projects_bookmarked', label: 'Bookmarked', value: metrics.projects_bookmarked, icon: BookmarkIcon },
      { key: 'unread_messages', label: 'Messages', value: metrics.unread_messages, icon: BellIcon },
      { key: 'open_orders', label: 'Orders', value: metrics.open_orders, icon: ShoppingCartIcon }
    ];

    if (userRole === 'creator' || userRole === 'seller') {
      baseMetrics.push(
        { key: 'new_stars', label: 'New Stars', value: metrics.new_stars, icon: StarIcon },
        { key: 'forks', label: 'Forks', value: metrics.forks, icon: DocumentDuplicateIcon },
        { key: 'downloads_today', label: 'Downloads', value: metrics.downloads_today, icon: ArrowTrendingUpIcon }
      );
    }

    if (userRole === 'seller') {
      baseMetrics.push(
        { key: 'pending_orders', label: 'Pending', value: metrics.pending_orders, icon: ClockIcon },
        { key: 'sales_this_week', label: 'Sales', value: metrics.sales_this_week, icon: TrophyIcon },
        { key: 'estimated_payout', label: 'Payout', value: metrics.estimated_payout, icon: CreditCardIcon }
      );
    }

    return baseMetrics;
  };

  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      { title: 'Browse Projects', icon: EyeIcon, href: '/projects', color: 'bg-blue-500', description: 'Discover amazing projects' },
      { title: 'Find Communities', icon: UserGroupIcon, href: '/community', color: 'bg-purple-500', description: 'Join engineering discussions' }
    ];

    if (userRole === 'creator' || userRole === 'seller') {
      baseActions.unshift(
        { title: 'Create Project', icon: PlusIcon, href: '/projects/new', color: 'bg-green-500', description: 'Share your latest work', badge: true }
      );
    }

    if (userRole === 'creator' || userRole === 'seller') {
      baseActions.push(
        { title: 'Ask Question', icon: ChatBubbleLeftEllipsisIcon, href: '/questions/new', color: 'bg-orange-500', description: 'Get help from community' }
      );
    }

    if (userRole === 'seller') {
      baseActions.push(
        { title: 'List Product', icon: ShoppingCartIcon, href: '/marketplace/new', color: 'bg-emerald-500', description: 'Monetize your work' },
        { title: 'Seller Analytics', icon: ChartBarIcon, href: '/seller/dashboard', color: 'bg-indigo-500', description: 'Track your sales' }
      );
      
      if (metrics.pending_orders > 0) {
        baseActions.push({
          title: 'Orders',
          icon: ExclamationTriangleIcon,
          href: '/marketplace/orders',
          color: 'bg-red-500',
          description: 'Requires attention',
          badge: true,
          urgent: true
        });
      }
    }

    return baseActions;
  };

  const filteredFeed = selectedMetric 
    ? activityFeed.filter(item => item.type === selectedMetric)
    : activityFeed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Action Rail */}
        <div className="hidden lg:flex w-80 bg-gray-900/50 backdrop-blur-md border-r border-white/10 flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CommandLineIcon className="w-5 h-5 text-blue-400" />
              Quick Actions
            </h2>
          </div>
          
          <div className="flex-1 p-6 space-y-3">
            {getQuickActions().map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`group relative flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ${
                    action.urgent ? 'ring-2 ring-red-400/50 animate-pulse' : ''
                  }`}
                >
                  <div className={`p-3 rounded-lg ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                      {action.title}
                      {action.badge && (
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      {action.description}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              );
            })}
          </div>

                     {/* Engineering Widgets */}
           <div className="p-6 space-y-4 border-t border-white/10">
             <EngineeringHealthWidget />
             <QuickCalculator />
             <LiveCollaboration />
             
             {/* Advanced Features for Creators/Sellers */}
             {(userRole === 'creator' || userRole === 'seller') && (
               <>
                 <ComponentInventory />
                 <ProjectTimeline />
               </>
             )}
             
             {/* AI and Events for all users */}
             <AIInsightsPanel />
             <LocalMakerEvents />
           </div>

          {/* Profile Section */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white truncate">
                  {user.display_name || user.username || 'Engineer'}
                </div>
                <div className="text-sm text-gray-400 capitalize">
                  {userRole} Mode
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <div className="p-6 lg:p-8 border-b border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome back, {user.display_name?.split(' ')[0] || user.username || 'Engineer'}! 
                  <span className="ml-2">👋</span>
                </h1>
                <p className="text-gray-300 text-lg">
                  Here's what's happening in your engineering world
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-xl">
                  {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
            </div>

            {/* Metrics Header */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {getMetricsForRole().map((metric) => {
                const Icon = metric.icon;
                const isSelected = selectedMetric === metric.key;
                return (
                  <button
                    key={metric.key}
                    onClick={() => setSelectedMetric(isSelected ? null : metric.key)}
                    className={`group p-4 rounded-xl bg-white/10 backdrop-blur-md border transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                      isSelected 
                        ? 'border-blue-400 bg-blue-500/20 ring-2 ring-blue-400/50' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 transition-colors ${
                        isSelected ? 'text-blue-300' : 'text-gray-400 group-hover:text-white'
                      }`} />
                      {typeof metric.value === 'number' && metric.value > 0 && (
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <div className={`text-2xl font-bold mb-1 transition-colors ${
                      isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'
                    }`}>
                      {metric.key === 'estimated_payout' ? `$${metric.value}` : metric.value}
                    </div>
                    <div className={`text-xs font-medium transition-colors ${
                      isSelected ? 'text-blue-200' : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      {metric.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-blue-400" />
                {selectedMetric ? `${selectedMetric.replace('_', ' ')} Activity` : "What's New for You"}
              </h2>
              {selectedMetric && (
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear Filter
                </button>
              )}
            </div>

            <div className="space-y-4">
              {filteredFeed.length > 0 ? filteredFeed.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedActivity(item);
                      setDrawerOpen(true);
                    }}
                    className={`group w-full text-left p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 ${
                      item.unread ? 'ring-2 ring-blue-400/50' : ''
                    }`}
                  >
                                         <div className="flex items-start gap-4">
                       <div className={`p-3 rounded-lg ${item.bgColor} shadow-lg group-hover:scale-110 transition-transform relative`}>
                         <Icon className={`w-5 h-5 ${item.color}`} />
                         {item.metadata?.projectImage && (
                           <div className="absolute -top-1 -right-1 text-xs">
                             {item.metadata.projectImage}
                           </div>
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-2">
                           <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                             {item.title}
                           </h3>
                           {item.unread && (
                             <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                           )}
                           {item.metadata?.trendingRank && (
                             <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs font-medium rounded-lg">
                               #{item.metadata.trendingRank} Trending
                             </span>
                           )}
                         </div>
                         <p className="text-gray-300 group-hover:text-gray-200 transition-colors line-clamp-2">
                           {item.description}
                         </p>
                         
                         {/* Engineering-specific metadata */}
                         {item.metadata?.simType && (
                           <div className="mt-2 flex gap-3 text-xs">
                             <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">
                               {item.metadata.simType}
                             </span>
                             <span className="text-gray-400">
                               SF: {item.metadata.safetyFactor}
                             </span>
                             <span className="text-gray-400">
                               {item.metadata.weight}
                             </span>
                           </div>
                         )}
                         
                         {item.metadata?.coverage && (
                           <div className="mt-2 flex items-center gap-2">
                             <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                               <div 
                                 className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                                 style={{ width: `${item.metadata.coverage}%` }}
                               ></div>
                             </div>
                             <span className="text-xs text-green-300">{item.metadata.coverage}%</span>
                           </div>
                         )}
                         
                         <div className="flex items-center justify-between mt-3">
                           <div className="flex items-center gap-3">
                             <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                               {item.timestamp}
                             </span>
                             {item.metadata?.buildTime && (
                               <span className="text-xs text-gray-500">
                                 ⚡ {item.metadata.buildTime}
                               </span>
                             )}
                           </div>
                           <div className="flex items-center gap-2">
                             {item.metadata?.categoryGrowth && (
                               <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-lg">
                                 {item.metadata.categoryGrowth}
                               </span>
                             )}
                             {item.metadata?.amount && (
                               <span className="px-2 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-lg">
                                 +${item.metadata.amount}
                               </span>
                             )}
                           </div>
                         </div>
                       </div>
                       <ChevronRightIcon className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                     </div>
                  </button>
                );
              }) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                    <BellIcon className="w-full h-full text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedMetric ? 'No matching activity' : 'All caught up!'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {selectedMetric 
                      ? 'Try clearing the filter to see all activity.'
                      : 'Start engaging with the community to see updates here.'
                    }
                  </p>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Explore Projects
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Drawer */}
        {drawerOpen && selectedActivity && (
          <div className="fixed inset-0 z-50 lg:relative lg:w-96 lg:flex-shrink-0">
            <div 
              className="absolute inset-0 bg-black/50 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            ></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-md lg:max-w-none lg:relative lg:w-full bg-gray-900/95 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Activity Details</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

                             <div className="space-y-6">
                 <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                   <div className="flex items-start gap-3 mb-4">
                     <div className={`p-3 rounded-lg ${selectedActivity.bgColor} relative`}>
                       <selectedActivity.icon className={`w-6 h-6 ${selectedActivity.color}`} />
                       {selectedActivity.metadata?.projectImage && (
                         <div className="absolute -top-1 -right-1 text-lg">
                           {selectedActivity.metadata.projectImage}
                         </div>
                       )}
                     </div>
                     <div className="flex-1">
                       <h4 className="font-semibold text-white mb-1">{selectedActivity.title}</h4>
                       <p className="text-gray-300">{selectedActivity.description}</p>
                     </div>
                   </div>
                   <div className="text-sm text-gray-400">{selectedActivity.timestamp}</div>
                 </div>

                 {/* Engineering Specifications */}
                 {selectedActivity.metadata && (
                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                     <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                       <BeakerIcon className="w-4 h-4 text-cyan-400" />
                       Technical Details
                     </h5>
                     <div className="space-y-3">
                       {selectedActivity.metadata.simType && (
                         <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                             <span className="text-gray-400">Analysis Type:</span>
                             <div className="text-cyan-300 font-medium">{selectedActivity.metadata.simType}</div>
                           </div>
                           <div>
                             <span className="text-gray-400">Safety Factor:</span>
                             <div className="text-green-300 font-medium">{selectedActivity.metadata.safetyFactor}</div>
                           </div>
                         </div>
                       )}
                       
                       {selectedActivity.metadata.coverage && (
                         <div>
                           <div className="flex items-center justify-between mb-1">
                             <span className="text-gray-400 text-sm">Test Coverage</span>
                             <span className="text-green-300 text-sm font-medium">{selectedActivity.metadata.coverage}%</span>
                           </div>
                           <div className="w-full bg-gray-700 rounded-full h-2">
                             <div 
                               className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                               style={{ width: `${selectedActivity.metadata.coverage}%` }}
                             ></div>
                           </div>
                         </div>
                       )}

                       {selectedActivity.metadata.buildTime && (
                         <div className="flex items-center gap-2 text-sm">
                           <BoltIcon className="w-4 h-4 text-yellow-400" />
                           <span className="text-gray-400">Build Time:</span>
                           <span className="text-yellow-300 font-medium">{selectedActivity.metadata.buildTime}</span>
                         </div>
                       )}

                       {selectedActivity.metadata.buyerLocation && (
                         <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                             <span className="text-gray-400">Buyer Location:</span>
                             <div className="text-blue-300 font-medium">{selectedActivity.metadata.buyerLocation}</div>
                           </div>
                           <div>
                             <span className="text-gray-400">Total Sales:</span>
                             <div className="text-green-300 font-medium">{selectedActivity.metadata.totalSales}</div>
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Quick Actions */}
                 <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                     <h5 className="font-medium text-white mb-3">Quick Actions</h5>
                     <div className="space-y-2">
                       <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left group">
                         <EyeIcon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                         <span className="text-gray-300 group-hover:text-white transition-colors">View Full Project</span>
                         <ChevronRightIcon className="w-4 h-4 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
                       </button>
                       
                       {selectedActivity.type === 'comment' && (
                         <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left group">
                           <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                           <span className="text-gray-300 group-hover:text-white transition-colors">Reply to Comment</span>
                           <ChevronRightIcon className="w-4 h-4 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
                         </button>
                       )}
                       
                       {selectedActivity.type === 'sale' && (
                         <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left group">
                           <ChartBarIcon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                           <span className="text-gray-300 group-hover:text-white transition-colors">View Sales Analytics</span>
                           <ChevronRightIcon className="w-4 h-4 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
                         </button>
                       )}
                       
                       <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-left group">
                         <HeartIcon className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                         <span className="text-gray-300 group-hover:text-white transition-colors">Share Achievement</span>
                         <ChevronRightIcon className="w-4 h-4 text-gray-500 ml-auto group-hover:translate-x-1 transition-transform" />
                       </button>
                     </div>
                   </div>

                   {/* Related Projects */}
                   <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                     <h5 className="font-medium text-white mb-3">Related Projects</h5>
                     <div className="space-y-2">
                       {['Smart Thermostat v2', 'IoT Garden Monitor', 'Weather Station Pro'].map((project, index) => (
                         <button key={index} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left group">
                           <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs">
                             {project[0]}
                           </div>
                           <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1 truncate">
                             {project}
                           </span>
                           <ChevronRightIcon className="w-3 h-3 text-gray-500 group-hover:translate-x-1 transition-transform" />
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10 p-4">
        <div className="flex justify-around">
          {getQuickActions().slice(0, 4).map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-400">{action.title.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 