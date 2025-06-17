import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase-server';
import EngineeringBackground from '@/components/EngineeringBackground';
import FloatingGeometry from '@/components/FloatingGeometry';
import GridPattern from '@/components/GridPattern';
import AnimatedCADCube from '@/components/AnimatedCADCube';
import EngineeringParticles from '@/components/EngineeringParticles';
import CodeRainEffect from '@/components/CodeRainEffect';
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
  ShoppingBagIcon,
  ShieldCheckIcon,
  UsersIcon,
  CubeIcon,
  GlobeAltIcon
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Keep all the background animations */}
      <EngineeringBackground />
      <FloatingGeometry />
      <GridPattern />
      <AnimatedCADCube />
      <EngineeringParticles />
      <CodeRainEffect />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="mb-8 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
          <span className="text-lg font-bold tracking-wider text-engineering">ENG.COM</span>
          <span className="text-yellow-400 animate-pulse">✨</span>
        </div>
        <h1 className="max-w-5xl text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight mb-6">
          The future of{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-300% bg-left-right">
            engineering
          </span>
          {' '}collaboration
        </h1>
        <p className="max-w-2xl text-xl sm:text-2xl text-gray-300 mb-4 leading-relaxed">
          Where hardware meets software.
        </p>
        <p className="max-w-xl text-lg text-gray-400 mb-12">
          Join engineers worldwide in a professional platform for CAD file sharing, project collaboration, and engineering community building.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/signup"
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2"
          >
            Start Building Today
            <span className="w-5 h-5 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link
            href="/gallery"
            className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 rounded-xl font-medium text-lg transition-all duration-300 flex items-center gap-2"
          >
            Explore Projects
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-400">10K+</div>
            <div className="text-sm text-gray-400">Active Engineers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">50K+</div>
            <div className="text-sm text-gray-400">Projects Shared</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400">15+</div>
            <div className="text-sm text-gray-400">CAD Formats</div>
          </div>
        </div>
      </section>

      {/* Enterprise-Grade Engineering Tools Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Professional Engineering Platform</h2>
            <p className="text-xl text-gray-300">Everything you need to collaborate and share your engineering work</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Version Control</h3>
              <p className="text-gray-400">Track changes and manage versions of your engineering projects</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-400">Work together with real-time project sharing and feedback</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CubeIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">CAD Viewer</h3>
              <p className="text-gray-400">View and share CAD files in multiple formats</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Project Analytics</h3>
              <p className="text-gray-400">Track project engagement and collaboration metrics</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GlobeAltIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Engineering Communities</h3>
              <p className="text-gray-400">Connect with specialized engineering communities</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CodeBracketIcon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">File Management</h3>
              <p className="text-gray-400">Organize and manage your engineering files efficiently</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 