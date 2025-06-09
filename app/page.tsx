import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import {
  CubeIcon,
  CogIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  GlobeAltIcon,
  SparklesIcon,
  BoltIcon,
  ArrowRightIcon,
  CpuChipIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  ComputerDesktopIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import AnimatedLogo from '@/components/AnimatedLogo';
import EngineeringParticles, { CodeRainEffect } from '@/components/EngineeringParticles';
import EngineeringBackground from '@/components/EngineeringBackground';

/* ----------  Engineering Animation Components  ---------- */
function FloatingGeometry() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated geometric shapes */}
      <div className="absolute top-1/4 left-1/4 w-20 h-20 border border-blue-500/20 rotate-45 animate-spin-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 border border-purple-500/20 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rotate-12 animate-bounce-slow"></div>
      
      {/* Circuit pattern */}
      <svg className="absolute top-1/2 right-1/6 w-24 h-24 text-blue-400/10 animate-pulse" viewBox="0 0 100 100">
        <circle cx="20" cy="20" r="3" fill="currentColor" />
        <circle cx="80" cy="20" r="3" fill="currentColor" />
        <circle cx="20" cy="80" r="3" fill="currentColor" />
        <circle cx="80" cy="80" r="3" fill="currentColor" />
        <path d="M20 20 L80 20 L80 80 L20 80 Z" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M50 20 L50 80" stroke="currentColor" strokeWidth="1" />
        <path d="M20 50 L80 50" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}

function GridPattern() {
  return (
    <div className="absolute inset-0 opacity-20">
      <div className="h-full w-full bg-gray-900" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
    </div>
  );
}

function AnimatedCADCube() {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
      <div className="w-48 h-48 perspective-1000">
        <div className="cube-container animate-rotate-3d">
          {/* 3D Cube made with CSS */}
          <div className="cube">
            <div className="face front border border-blue-400/30"></div>
            <div className="face back border border-blue-400/30"></div>
            <div className="face right border border-purple-400/30"></div>
            <div className="face left border border-purple-400/30"></div>
            <div className="face top border border-cyan-400/30"></div>
            <div className="face bottom border border-cyan-400/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Enhanced Background Animations */}
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
          Join thousands of engineers building the next generation of technology through collaborative design, version control, and real-time feedback.
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
            <div className="text-3xl font-bold text-cyan-400">$2M+</div>
            <div className="text-sm text-gray-400">Tips Earned</div>
          </div>
        </div>
      </section>

      {/* Enterprise-Grade Engineering Tools Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Enterprise-Grade Engineering Tools</h2>
            <p className="text-xl text-gray-300">Everything you need to build the future</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Version Control</h3>
              <p className="text-gray-400">Git-like branching for hardware projects</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-400">Real-time design reviews and feedback</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BoltIcon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Live Simulations</h3>
              <p className="text-gray-400">FEA, CFD, and circuit simulation</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-400">Track performance and engagement</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GlobeAltIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Marketplace</h3>
              <p className="text-gray-400">Monetize your engineering expertise</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CodeBracketIcon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">API Integration</h3>
              <p className="text-gray-400">Connect with your existing workflow</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to engineer the future? CTA Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to engineer the future?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the platform where innovation meets collaboration. Start building something amazing today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 rounded-xl font-medium text-lg transition-all duration-300"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Built for Every Engineering Discipline Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Every Engineering Discipline</h2>
            <p className="text-xl text-gray-300">From mechanical design to AI systems</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <CogIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mechanical</h3>
              <p className="text-gray-400">CAD, simulations, manufacturing</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <CpuChipIcon className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Electronics</h3>
              <p className="text-gray-400">PCB design, embedded systems</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <ComputerDesktopIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Software</h3>
              <p className="text-gray-400">Firmware, algorithms, AI/ML</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 group text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
                <BeakerIcon className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Research</h3>
              <p className="text-gray-400">Prototypes, experiments, data</p>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Made Collaborative Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Engineering Made Collaborative</h2>
            <p className="text-xl text-gray-300">From concept to deployment in one platform</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">01</div>
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <CubeIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Design & Create</h3>
              <p className="text-gray-300 leading-relaxed">
                Upload CAD files, schematics, code. Built-in version control tracks every change.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute top-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">02</div>
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UsersIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Collaborate in Real-time</h3>
              <p className="text-gray-300 leading-relaxed">
                Share screens, review designs live, comment directly on 3D models.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">03</div>
                <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <RocketLaunchIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Ship & Monetize</h3>
              <p className="text-gray-300 leading-relaxed">
                Launch to marketplace, earn from designs, build your engineering brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Start Building Today</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of engineers already using eng.com to build the future.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl gap-2"
          >
            Get Started Free
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
} 