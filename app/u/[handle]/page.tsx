'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import {
  UserIcon,
  CogIcon,
  PlusIcon,
  MapPinIcon,
  CalendarIcon,
  LinkIcon,
  EnvelopeIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  HeartIcon,
  TrophyIcon,
  ChartBarIcon,
  BoltIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  CpuChipIcon,
  GlobeAltIcon,
  PhotoIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  FolderIcon,
  ShareIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  KeyIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FireIcon,
  SparklesIcon,
  AcademicCapIcon,
  MegaphoneIcon,
  DocumentTextIcon,
  ClipboardIcon,
  ArrowUpRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

interface Params {
  handle: string;
}

interface Profile {
  id: string;
  handle: string | null;
  avatar_url?: string | null;
  cover_image_url?: string | null;
  bio?: string | null;
  display_name?: string | null;
  location?: string | null;
  website?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  created_at: string | null;
  plan?: string | null;
  role?: 'creator' | 'moderator' | 'admin' | null;
  follower_count?: number | null;
  following_count?: number | null;
  seller_rating?: number | null;
}

interface Project {
  id: string;
  title: string | null;
  slug: string | null;
  description?: string | null;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  thumbnail_url?: string | null;
  star_count?: number | null;
  download_count?: number | null;
  tags?: string[] | null;
}

interface TabSection {
  key: string;
  label: string;
  icon: any;
  count?: number;
  content?: React.ReactNode;
}

export default function ProfilePage({ params }: { params: Params }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCreatorTools, setShowCreatorTools] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [editProfile, setEditProfile] = useState<Partial<Profile>>({});
  const [editBio, setEditBio] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');

  useEffect(() => {
    loadProfileData();
  }, [params.handle]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
  // Get profile by handle
      const { data: profileData, error: profileError } = await supabaseBrowser
    .from('profiles')
        .select('*')
        .eq('handle', params.handle)
    .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      if (!profileData) {
    notFound();
  }

      setProfile(profileData as any);
      setEditProfile(profileData as any);
      setEditBio(profileData.bio || '');
      setEditDisplayName(profileData.display_name || '');
      setEditLocation((profileData as any).location || '');
      setEditWebsite((profileData as any).website || '');

      // Get projects
      const { data: projectsData, error: projectsError } = await supabaseBrowser
    .from('projects')
        .select('*')
        .eq('owner_id', profileData.id)
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

      if (projectsError) {
        throw new Error(projectsError.message);
      }

      setProjects((projectsData || []) as any);

      // TODO: Check if current user owns this profile
      // This would come from your auth system
      setIsOwnProfile(false); // Placeholder

    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!profile) return;
    
    const { error } = await supabaseBrowser
      .from('profiles')
      .update({
        bio: editBio,
        display_name: editDisplayName,
        location: editLocation,
        website: editWebsite,
      })
      .eq('id', profile.id);

    if (!error) {
      setProfile(prev => prev ? {
        ...prev,
        bio: editBio,
        display_name: editDisplayName,
        location: editLocation,
        website: editWebsite,
      } : null);
      setIsEditMode(false);
    }
  };

  const handleCancelEdit = () => {
    setEditBio(profile?.bio || '');
    setEditDisplayName(profile?.display_name || '');
    setEditLocation(profile?.location || '');
    setEditWebsite(profile?.website || '');
    setIsEditMode(false);
  };

  const tabs: TabSection[] = [
    {
      key: 'projects',
      label: 'Projects',
      icon: RocketLaunchIcon,
      count: projects.length,
    },
    {
      key: 'marketplace',
      label: 'Marketplace',
      icon: ShoppingBagIcon,
      count: 0, // TODO: Get marketplace items count
    },
    {
      key: 'forum',
      label: 'Forum',
      icon: ChatBubbleLeftRightIcon,
      count: 0, // TODO: Get forum posts count
    },
    {
      key: 'likes',
      label: 'Likes',
      icon: HeartIcon,
      count: 0, // TODO: Get likes count
    },
    {
      key: 'about',
      label: 'About',
      icon: UserIcon,
    },
  ];

  const mockStats = {
    projects: projects.length,
    downloads: projects.reduce((sum, p) => sum + (p.download_count || 0), 0),
    followers: profile?.follower_count || 0,
    following: profile?.following_count || 0,
    rating: profile?.seller_rating || 0,
    joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    }) : ''
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-red-400 mb-4">
            <XMarkIcon className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Error Loading Profile</h2>
          <p className="text-gray-300 text-center mb-6">{error}</p>
          <button
            onClick={loadProfileData}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Private Dashboard Toolbar - Only visible to profile owner */}
      {isOwnProfile && (
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-white/80 text-sm font-medium">Private Dashboard:</span>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isEditMode 
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <PencilIcon className="w-4 h-4 inline mr-2" />
                  {isEditMode ? 'Editing' : 'Edit'}
                </button>
                
                {projects.length > 0 && (
                  <button
                    onClick={() => setShowCreatorTools(!showCreatorTools)}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg font-medium text-sm hover:bg-blue-500/30 transition-all border border-blue-400/30"
                  >
                    <RocketLaunchIcon className="w-4 h-4 inline mr-2" />
                    Creator Tools
                  </button>
                )}
                
                <button
                  onClick={() => setShowAccountPanel(!showAccountPanel)}
                  className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg font-medium text-sm hover:bg-purple-500/30 transition-all border border-purple-400/30"
                >
                  <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
                  Account
                </button>
              </div>
              
              <div className="text-white/60 text-sm">
                What the world sees vs. what you control
              </div>
            </div>
          </div>
        </div>
      )}
        
      {/* Cover Image & Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600/80 to-purple-700/80 relative overflow-hidden">
          {profile.cover_image_url ? (
            <Image
              src={profile.cover_image_url}
              alt="Cover"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />
          )}
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Edit Cover Button - Only in edit mode */}
          {isEditMode && (
            <button className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all border border-white/30">
              <PhotoIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden shadow-2xl">
                <Image
                  src={profile.avatar_url || `https://robohash.org/${profile.id}`}
                  alt={profile.handle || 'Profile'}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Plan Badge */}
              {profile.plan && (
                <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                  profile.plan === 'PRO' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    : 'bg-white/90 text-gray-800'
                }`}>
                  {profile.plan}
                </div>
              )}

              {/* Role Badge */}
              {profile.role && (
                <div className={`absolute -top-2 -left-2 px-2 py-1 rounded-lg text-xs font-bold shadow-lg ${
                  profile.role === 'admin' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                  profile.role === 'moderator' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' :
                  'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                }`}>
                  {profile.role === 'admin' ? '👑' : profile.role === 'moderator' ? '🛡️' : '⭐'}
                </div>
              )}

              {/* Edit Avatar Button - Only in edit mode */}
              {isEditMode && (
                <button className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PhotoIcon className="w-8 h-8 text-white" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="Display Name"
                    className="text-4xl md:text-5xl font-bold bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30 text-white placeholder-white/60"
                  />
                ) : (
                  <h1 className="text-4xl md:text-5xl font-bold">
                    {profile.display_name || `@${profile.handle}`}
                  </h1>
                )}
                
                {profile.display_name && (
                  <span className="text-xl text-white/80">@{profile.handle}</span>
                )}
                
                {isOwnProfile && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    Your Profile
                  </span>
                )}
              </div>
              
              {/* Bio */}
              {isEditMode ? (
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell the engineering community about yourself..."
                  className="w-full max-w-2xl text-xl bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30 text-white placeholder-white/60 resize-none"
                  rows={3}
                />
              ) : (
              <p className="text-xl text-white/90 mb-4 max-w-2xl leading-relaxed">
                  {profile.bio || "Passionate engineer building the future, one project at a time."}
              </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/80 mb-6">
                {isEditMode ? (
                  <>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Location"
                      className="bg-white/20 backdrop-blur-sm rounded px-3 py-1 border border-white/30 text-white placeholder-white/60"
                    />
                    <input
                      type="url"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      placeholder="Website URL"
                      className="bg-white/20 backdrop-blur-sm rounded px-3 py-1 border border-white/30 text-white placeholder-white/60"
                    />
                  </>
                ) : (
                  <>
                    {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                        <span>{profile.location}</span>
                </div>
                    )}
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                      <span>Joined {mockStats.joinDate}</span>
                </div>
                    {profile.website && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                          {profile.website.replace('https://', '').replace('http://', '')}
                        </a>
                      </div>
                    )}
                  </>
                )}
                </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 mb-6">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all border border-white/30"
                  >
                    <CodeBracketIcon className="w-5 h-5" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all border border-white/30"
                  >
                    <UserGroupIcon className="w-5 h-5" />
                  </a>
                )}
                {isEditMode && (
                  <button className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all border border-white/20 border-dashed">
                    <PlusIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all shadow-lg"
                    >
                      <CheckIcon className="w-5 h-5 inline mr-2" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all border border-white/30"
                    >
                      <XMarkIcon className="w-5 h-5 inline mr-2" />
                      Cancel
                    </button>
                  </>
                ) : isOwnProfile ? (
                  <>
                    <Link
                      href="/settings/profile"
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all border border-white/30"
                    >
                      <CogIcon className="w-5 h-5 inline mr-2" />
                      Settings
                    </Link>
                    <Link
                      href="/projects/new"
                      className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-medium transition-all shadow-lg"
                    >
                      <PlusIcon className="w-5 h-5 inline mr-2" />
                      New Project
                    </Link>
                  </>
                ) : (
                  <>
                    <button className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-medium transition-all shadow-lg">
                      <UserGroupIcon className="w-5 h-5 inline mr-2" />
                      Follow
                    </button>
                    <button className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all border border-white/30">
                      <EnvelopeIcon className="w-5 h-5 inline mr-2" />
                      Message
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg">
                      <SparklesIcon className="w-5 h-5 inline mr-2" />
                      Tip
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
            <div className="group cursor-pointer">
              <div className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
                {mockStats.projects}
              </div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="group cursor-pointer">
              <div className="text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform">
                {mockStats.downloads.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            <div className="group cursor-pointer">
              <div className="text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform">
                {mockStats.followers}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="group cursor-pointer">
              <div className="text-2xl font-bold text-orange-600 group-hover:scale-110 transition-transform">
                {mockStats.following}
              </div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div className="group cursor-pointer">
              <div className="text-2xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">
                {mockStats.rating > 0 ? mockStats.rating.toFixed(1) : '—'}
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
            <div className="group cursor-pointer">
              <div className="text-2xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                {profile.created_at ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Tools Panel */}
      {showCreatorTools && isOwnProfile && (
        <div className="bg-blue-500/10 backdrop-blur-md border-b border-blue-400/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <RocketLaunchIcon className="w-5 h-5" />
                  Projects Manager
                </h3>
                <p className="text-white/70 text-sm mb-3">Manage visibility, versions, and analytics</p>
                <Link href="/dashboard/projects" className="text-blue-300 hover:text-blue-200 text-sm flex items-center gap-1">
                  Manage Projects <ArrowUpRightIcon className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <ShoppingBagIcon className="w-5 h-5" />
                  Listings Manager
                </h3>
                <p className="text-white/70 text-sm mb-3">Price, stock, sales analytics</p>
                <Link href="/dashboard/marketplace" className="text-blue-300 hover:text-blue-200 text-sm flex items-center gap-1">
                  Manage Listings <ArrowUpRightIcon className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Earnings
                </h3>
                <p className="text-white/70 text-sm mb-3">Payouts, balance, performance</p>
                <Link href="/dashboard/earnings" className="text-blue-300 hover:text-blue-200 text-sm flex items-center gap-1">
                  View Earnings <ArrowUpRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Panel */}
      {showAccountPanel && isOwnProfile && (
        <div className="bg-purple-500/10 backdrop-blur-md border-b border-purple-400/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: UserIcon, label: 'Profile Info', href: '/settings/profile' },
                { icon: ShieldCheckIcon, label: 'Security', href: '/settings/security' },
                { icon: BellIcon, label: 'Notifications', href: '/settings/notifications' },
                { icon: CreditCardIcon, label: 'Billing', href: '/settings/billing' },
                { icon: KeyIcon, label: 'API Keys', href: '/settings/developer' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all border border-white/20 text-white"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    <ChevronRightIcon className="w-4 h-4 ml-auto" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
        
        {/* Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
          
      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                      key={project.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-4 overflow-hidden">
                        {project.thumbnail_url ? (
                          <Image
                            src={project.thumbnail_url}
                          alt={project.title || 'Project'}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <RocketLaunchIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {project.title}
                        </h3>
                      
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {project.description || 'No description available.'}
                      </p>
                      
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                          <StarIcon className="w-4 h-4" />
                          {project.star_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          {project.download_count || 0}
                          </span>
                        </div>
                      <span>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    
                    {isOwnProfile && (
                      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                          Analytics
                        </button>
                      </div>
                    )}
                  </div>
                  ))}
                </div>
              ) : (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                  <RocketLaunchIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {isOwnProfile ? "Ready to share your first project?" : "No public projects yet"}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {isOwnProfile 
                      ? "Upload your CAD files, schematics, or code. The engineering community is waiting to see what you build!" 
                      : "This engineer is working on something amazing. Check back soon!"}
                  </p>
                  {isOwnProfile && (
                    <Link
                      href="/projects/new"
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                      <PlusIcon className="w-6 h-6" />
                      Create Your First Project
                    </Link>
                  )}
                </div>
              )}
            </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <ShoppingBagIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Marketplace Coming Soon</h3>
                  <p className="text-gray-600">
              {isOwnProfile ? "Start selling your engineering designs and expertise." : "No marketplace listings yet."}
                  </p>
                </div>
              )}

        {activeTab === 'forum' && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <ChatBubbleLeftRightIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Forum Activity</h3>
                  <p className="text-gray-600">
              {isOwnProfile ? "Your forum posts and discussions will appear here." : "No recent forum activity."}
                  </p>
                </div>
              )}

        {activeTab === 'likes' && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <HeartIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Liked Projects</h3>
            <p className="text-gray-600">
              {isOwnProfile ? "Projects you've liked will appear here." : "Liked projects are private."}
            </p>
          </div>
        )}
            
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* About Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <UserIcon className="w-7 h-7 text-blue-600" />
                  About {profile.display_name || profile.handle}
                </h2>
              
                <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {profile.bio || "Passionate engineer building the future, one project at a time."}
                  </p>
                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Engineering Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Mechanical Design', 'Electronics', 'Embedded Systems', 'Robotics', 'CAD/CAM'].map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
              </div>
            </div>

                  {(profile.website || profile.github_url || profile.linkedin_url) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Links</h4>
                      <div className="space-y-2">
                        {profile.website && (
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <GlobeAltIcon className="w-4 h-4" />
                            {profile.website.replace('https://', '').replace('http://', '')}
                          </a>
                        )}
                        {profile.github_url && (
                          <a 
                            href={profile.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <CodeBracketIcon className="w-4 h-4" />
                            GitHub Profile
                          </a>
                        )}
                        {profile.linkedin_url && (
                          <a 
                            href={profile.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          >
                            <UserGroupIcon className="w-4 h-4" />
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </div>
                  )}
            </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6 text-orange-600" />
                Statistics
              </h3>
              
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profile views</span>
                    <span className="font-semibold text-gray-900">2,847</span>
                  </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total downloads</span>
                    <span className="font-semibold text-gray-900">{mockStats.downloads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-semibold text-gray-900">{mockStats.joinDate}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total followers</span>
                    <span className="font-semibold text-gray-900">{mockStats.followers}</span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-yellow-600" />
                  Achievements
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl">🚀</div>
                    <div>
                      <div className="font-medium text-gray-900">First Launch</div>
                      <div className="text-sm text-gray-600">Published first project</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl">💡</div>
                    <div>
                      <div className="font-medium text-gray-900">Innovator</div>
                      <div className="text-sm text-gray-600">Creative problem solver</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

      {/* Floating Action Button - Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform">
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 