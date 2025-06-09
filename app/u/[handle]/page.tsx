import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  CalendarIcon,
  StarIcon,
  TrophyIcon,
  CodeBracketIcon,
  CpuChipIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CogIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export const revalidate = 60;

type Params = { handle: string };

export default async function ProfilePage({ params }: { params: Promise<Params> }) {
  const { handle } = await params;
  const supabase = createClient();
  const session = await getServerSession(authOptions);

  // Get profile by handle
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, handle, avatar_url, bio, created_at')
    .eq('handle', handle)
    .single();

  if (!profile) {
    notFound();
  }

  // Get projects owned by this user
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, slug, is_public, created_at, updated_at')
    .eq('owner_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6);

  // Get comments (activity feed)
  const { data: comments } = await supabase
    .from('comments')
    .select('id, body, created_at, project_id')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Check if viewer is the profile owner
  const isOwnProfile = session?.user?.id === profile.id;
  
  // Calculate stats
  const projectCount = projects?.length || 0;
  const memberSince = profile.created_at ? new Date(profile.created_at) : new Date();
  const daysSinceJoin = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24));
  
  const profileStats = {
    projects: projectCount,
    views: projectCount * 47 + 89, // Mock calculation
    likes: projectCount * 23 + 12, // Mock calculation
    comments: comments?.length || 0,
    joined: daysSinceJoin
  };

  // Engineering skills based on projects
  const skills = [
    { name: 'Mechanical Design', level: Math.min(95, 60 + projectCount * 5), icon: CpuChipIcon },
    { name: 'Electronics', level: Math.min(87, 50 + projectCount * 4), icon: BoltIcon },
    { name: 'Embedded Systems', level: Math.min(78, 40 + projectCount * 6), icon: CodeBracketIcon },
    { name: 'Robotics', level: Math.min(82, 45 + projectCount * 5), icon: WrenchScrewdriverIcon },
  ];

  // Achievements based on activity
  const achievements = [];
  if (projectCount >= 1) achievements.push({ title: 'First Project', description: 'Published your first engineering project', icon: '🚀' });
  if (projectCount >= 3) achievements.push({ title: 'Prolific Creator', description: 'Created 3+ engineering projects', icon: '⚡' });
  if (daysSinceJoin >= 30) achievements.push({ title: 'Community Member', description: '30+ days on eng.com', icon: '🏆' });

  const tools = ['SolidWorks', 'AutoCAD', 'KiCad', 'Arduino IDE', 'Python', 'C++', 'Git', 'Docker'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Profile Photo & Basic Info */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                    <Image
                      src={profile.avatar_url || `https://robohash.org/${profile.id}`}
                      alt={profile.handle}
                      width={160}
                      height={160}
                      className="w-full h-full rounded-xl object-cover bg-white"
                    />
                  </div>
                  {isOwnProfile && (
                    <Link
                      href="/settings"
                      className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <CogIcon className="w-8 h-8 text-white" />
                    </Link>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  {isOwnProfile ? (
                    <Link
                      href="/settings"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      <CogIcon className="w-5 h-5 inline mr-2" />
                      Edit Profile
                    </Link>
                  ) : (
                    <div className="flex gap-3">
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                        <UserGroupIcon className="w-5 h-5 inline mr-2" />
                        Follow
                      </button>
                      <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                        <EnvelopeIcon className="w-5 h-5 inline mr-2" />
                        Message
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">@{profile.handle}</h1>
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium">
                    Engineer
                  </div>
                </div>
                
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {profile.bio || "Passionate engineer building the future, one project at a time. Welcome to my engineering journey on eng.com!"}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-white/60 rounded-xl p-4 text-center border border-white/50">
                    <div className="text-2xl font-bold text-blue-600">{profileStats.projects}</div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 text-center border border-white/50">
                    <div className="text-2xl font-bold text-green-600">{profileStats.views}</div>
                    <div className="text-sm text-gray-600">Views</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 text-center border border-white/50">
                    <div className="text-2xl font-bold text-purple-600">{profileStats.likes}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 text-center border border-white/50">
                    <div className="text-2xl font-bold text-orange-600">{profileStats.comments}</div>
                    <div className="text-sm text-gray-600">Comments</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 text-center border border-white/50">
                    <div className="text-2xl font-bold text-indigo-600">{profileStats.joined}</div>
                    <div className="text-sm text-gray-600">Days Active</div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Joined {memberSince.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    Active for {profileStats.joined} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Skills & Achievements */}
          <div className="space-y-6">
            
            {/* Engineering Skills */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BeakerIcon className="w-6 h-6 text-blue-600" />
                Engineering Skills
              </h3>
              <div className="space-y-4">
                {skills.map((skill, index) => {
                  const Icon = skill.icon;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tools & Technologies */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-6 h-6 text-green-600" />
                Tools & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-gray-100 to-blue-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-yellow-600" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.length > 0 ? achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-4 text-gray-500">
                    <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Start creating projects to unlock achievements!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center & Right Columns - Projects & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Featured Projects */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
                  Projects ({projectCount})
                </h3>
                {isOwnProfile && (
                  <Link
                    href="/projects/new"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                  >
                    <PlusIcon className="w-4 h-4 inline mr-1" />
                    New Project
                  </Link>
                )}
              </div>
              
              {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="group block p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </h4>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {project.is_public ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Engineering project • Created {new Date(project.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" />
                          {Math.floor(Math.random() * 100) + 20}
                        </span>
                        <span className="flex items-center gap-1">
                          <HeartIcon className="w-3 h-3" />
                          {Math.floor(Math.random() * 50) + 5}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RocketLaunchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {isOwnProfile ? "You haven't created any projects yet" : "No public projects yet"}
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {isOwnProfile 
                      ? "Start your engineering journey by creating your first project" 
                      : "This engineer is working on something amazing. Check back soon!"}
                  </p>
                  {isOwnProfile && (
                    <Link
                      href="/projects/new"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Create Your First Project
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                Recent Activity
              </h3>
              
              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Commented on a project
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 pl-6">
                        {comment.body.length > 100 ? `${comment.body.substring(0, 100)}...` : comment.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? "Your community activity will appear here when you start engaging with projects and discussions" 
                      : "No recent activity to show"}
                  </p>
                </div>
              )}
            </div>

            {/* Marketplace Items (Placeholder) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBagIcon className="w-6 h-6 text-purple-600" />
                Marketplace Items
              </h3>
              
              <div className="text-center py-8">
                <ShoppingBagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 mb-4">
                  {isOwnProfile 
                    ? "List your engineering designs, components, or services for sale" 
                    : "No items currently for sale"}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/marketplace/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    List Something
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 