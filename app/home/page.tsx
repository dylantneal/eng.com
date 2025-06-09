import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase-server';
import { 
  PlusIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  RocketLaunchIcon,
  BeakerIcon,
  LightBulbIcon,
  UserGroupIcon,
  TrophyIcon,
  ClockIcon,
  FireIcon,
  EyeIcon,
  HeartIcon,
  CodeBracketIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  SparklesIcon,
  AcademicCapIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin');
  }

  // Get user profile data
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('handle, avatar_url, bio')
    .eq('id', session.user.id)
    .single();

  // Redirect to onboarding if profile has no handle (incomplete)
  if (!profile || !profile.handle) {
    redirect('/onboard');
  }

  const firstName = session.user?.name?.split(' ')[0] || 'Engineer';
  const greeting = getGreeting();
  const dayOfWeek = getDayOfWeek();
  const userHandle = profile?.handle || session.user?.email?.split('@')[0] || 'user';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-blue-200/50 text-sm font-medium text-blue-700 mb-6">
              <SparklesIcon className="w-4 h-4" />
              {dayOfWeek} • Ready to innovate?
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                {greeting}, {firstName}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your engineering command center awaits. Build, collaborate, and ship innovative projects that matter.
            </p>
          </div>

          {/* Enhanced Quick Stats with Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 transition-all">
                  <FolderIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600">0</div>
              </div>
              <div className="text-gray-900 font-semibold">Projects</div>
              <div className="text-sm text-gray-600 mt-1">Your engineering portfolio</div>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:from-green-600 group-hover:to-green-700 transition-all">
                  <EyeIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600">0</div>
              </div>
              <div className="text-gray-900 font-semibold">Views</div>
              <div className="text-sm text-gray-600 mt-1">Community engagement</div>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:from-purple-600 group-hover:to-purple-700 transition-all">
                  <HeartIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600">0</div>
              </div>
              <div className="text-gray-900 font-semibold">Likes</div>
              <div className="text-sm text-gray-600 mt-1">Appreciation received</div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:from-orange-600 group-hover:to-orange-700 transition-all">
                  <TrophyIcon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600">0</div>
              </div>
              <div className="text-gray-900 font-semibold">Achievements</div>
              <div className="text-sm text-gray-600 mt-1">Milestones unlocked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Get Started Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <RocketLaunchIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to build something amazing?</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Start your engineering journey with your first project. From mechanical designs to electronics, we've got you covered.
                </p>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <PlusIcon className="w-6 h-6" />
                  Create Your First Project
                </Link>
              </div>
            </div>

            {/* Featured Engineering Domains */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BeakerIcon className="w-7 h-7 text-blue-600" />
                Engineering Domains
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Mechanical Engineering', icon: CpuChipIcon, color: 'from-blue-500 to-blue-600', description: 'CAD designs, mechanisms, and manufacturing' },
                  { name: 'Electronics & PCB', icon: BoltIcon, color: 'from-green-500 to-green-600', description: 'Circuit design, embedded systems, IoT' },
                  { name: 'Software Engineering', icon: CodeBracketIcon, color: 'from-purple-500 to-purple-600', description: 'Firmware, algorithms, and control systems' },
                  { name: 'Robotics & AI', icon: WrenchScrewdriverIcon, color: 'from-orange-500 to-orange-600', description: 'Automation, machine learning, robotics' }
                ].map((domain, index) => {
                  const Icon = domain.icon;
                  return (
                    <div key={index} className="group p-4 rounded-xl bg-gray-50 hover:bg-white transition-all duration-300 cursor-pointer border hover:border-gray-200 hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-gradient-to-br ${domain.color} rounded-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{domain.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{domain.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <ClockIcon className="w-7 h-7 text-green-600" />
                Recent Activity
              </h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FolderIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No activity yet</h4>
                <p className="text-gray-600">
                  Once you start creating projects, your activity will appear here.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Profile Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {firstName[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900">{firstName}</h4>
                  <p className="text-sm text-gray-600">FREE Plan</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
              </div>
              <Link
                href={`/u/${userHandle}`}
                className="w-full text-center py-3 px-4 bg-gradient-to-r from-gray-50 to-blue-50 text-blue-700 rounded-xl font-medium hover:from-gray-100 hover:to-blue-100 transition-all"
              >
                View Profile →
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                {[
                  { href: '/gallery', icon: FolderIcon, label: 'Browse Projects', desc: 'Explore community work' },
                  { href: '/marketplace', icon: ShoppingBagIcon, label: 'Marketplace', desc: 'Buy & sell designs' },
                  { href: '/qna', icon: AcademicCapIcon, label: 'Learn & Ask', desc: 'Get help from experts' },
                  { href: '/settings', icon: CogIcon, label: 'Settings', desc: 'Customize your experience' }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 group"
                    >
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{action.label}</div>
                        <div className="text-xs text-gray-500">{action.desc}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Trending in Community */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FireIcon className="w-5 h-5 text-red-500" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {[
                  { title: '3D Printed Drone Frame', author: 'MechMaster', likes: 234 },
                  { title: 'Arduino Weather Station', author: 'CodeCrafter', likes: 189 },
                  { title: 'PCB Design Tips', author: 'CircuitGuru', likes: 156 }
                ].map((item, index) => (
                  <div key={index} className="p-3 rounded-lg bg-gray-50 hover:bg-white transition-colors cursor-pointer">
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">by {item.author}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <HeartIcon className="w-3 h-3" />
                        {item.likes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Upgrade Card */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold">Upgrade to Pro</h3>
              </div>
              <p className="text-sm opacity-90 mb-4 leading-relaxed">
                Unlock private repositories, advanced analytics, unlimited collaboration, and premium support.
              </p>
              <div className="space-y-2 mb-6">
                {['Private repositories', 'Advanced CAD tools', 'Priority support', 'Team collaboration'].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
              <Link 
                href="/pricing"
                className="w-full bg-white text-blue-600 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center block"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 