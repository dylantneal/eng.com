'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import {
  UserIcon,
  CogIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  KeyIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  CodeBracketIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  LinkIcon,
  UserGroupIcon,
  ChartBarIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface Profile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  handle: string;
  avatar_url: string;
  bio: string;
  location: string;
  website: string;
  github_username: string;
  linkedin_username: string;
  engineering_discipline: string;
  experience_level: string;
  company: string;
  job_title: string;
  plan: string;
  is_verified: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    email_notifications: boolean;
    push_notifications: boolean;
    show_online_status: boolean;
    public_profile: boolean;
    allow_dm: boolean;
    feed_algorithm: 'hot' | 'new' | 'top' | 'personalized';
    nsfw_content: boolean;
  };
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Debug: Log all state changes
  useEffect(() => {
    console.log('Settings state:', { session, status, profile, loading, error });
  }, [session, status, profile, loading, error]);

  useEffect(() => {
    console.log('Settings page useEffect triggered:', { status, session });
    
    if (status === 'loading') {
      console.log('Session is still loading...');
      return;
    }
    
    if (status === 'unauthenticated') {
      console.log('User is unauthenticated, redirecting to signin');
      router.push('/signin?redirect=/settings');
      return;
    }
    
    if (session?.user) {
      console.log('User session found, loading profile');
      loadProfile();
    } else {
      console.log('No user in session, setting loading to false');
      setLoading(false);
    }
  }, [session, status, router]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing display');
        setError('Loading timed out. Please refresh the page.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const loadProfile = async () => {
    try {
      console.log('Loading profile for session:', session);
      
      if (!session?.user?.id) {
        console.log('No session or user ID available');
        setLoading(false);
        return;
      }
      
      console.log('Fetching profile for user ID:', session.user.id);
      
      const { data, error } = await supabaseBrowser
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        
        // If profile doesn't exist, create a basic one or redirect to onboarding
        if (error.code === 'PGRST116') {
          console.log('Profile not found, redirecting to onboarding');
          router.push('/onboard');
          return;
        }
        
        throw error;
      }
      
      // Map the database result to our Profile interface
      const profileData = data as any;
      const mappedProfile = {
        id: profileData.id,
        email: profileData.email || session.user.email || '',
        username: profileData.username || profileData.handle || session.user.email?.split('@')[0] || '',
        display_name: profileData.display_name || session.user.name || '',
        handle: profileData.handle || profileData.username || session.user.email?.split('@')[0] || '',
        avatar_url: profileData.avatar_url || session.user.image || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        github_username: profileData.github_username || '',
        linkedin_username: profileData.linkedin_username || '',
        engineering_discipline: profileData.engineering_discipline || '',
        experience_level: profileData.experience_level || '',
        company: profileData.company || '',
        job_title: profileData.job_title || '',
        plan: profileData.plan || 'FREE',
        is_verified: profileData.is_verified || false,
        preferences: (profileData.preferences as any) || {
          theme: 'dark',
          email_notifications: true,
          push_notifications: true,
          show_online_status: true,
          public_profile: true,
          allow_dm: true,
          feed_algorithm: 'personalized',
          nsfw_content: false,
        },
      };
      
      console.log('Mapped profile:', mappedProfile);
      setProfile(mappedProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Set a basic profile with session data as fallback
      if (session?.user) {
        const fallbackProfile = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.email?.split('@')[0] || 'user',
          display_name: session.user.name || '',
          handle: session.user.email?.split('@')[0] || 'user',
          avatar_url: session.user.image || '',
          bio: '',
          location: '',
          website: '',
          github_username: '',
          linkedin_username: '',
          engineering_discipline: '',
          experience_level: '',
          company: '',
          job_title: '',
          plan: 'FREE',
          is_verified: false,
          preferences: {
            theme: 'dark' as const,
            email_notifications: true,
            push_notifications: true,
            show_online_status: true,
            public_profile: true,
            allow_dm: true,
            feed_algorithm: 'personalized' as const,
            nsfw_content: false,
          },
        };
        console.log('Using fallback profile:', fallbackProfile);
        setProfile(fallbackProfile);
      } else {
        setError('Failed to load profile data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const settingsItems = [
    {
      title: 'Profile',
      description: 'Personal information, bio, and professional details',
      href: '#profile',
      icon: UserIcon,
      color: 'blue',
    },
    {
      title: 'Account Security',
      description: 'Password, 2FA, and security preferences',
      href: '#security',
      icon: ShieldCheckIcon,
      color: 'green',
    },
    {
      title: 'Notifications',
      description: 'Email alerts, push notifications, and preferences',
      href: '#notifications',
      icon: BellIcon,
      color: 'yellow',
    },
    {
      title: 'Privacy',
      description: 'Profile visibility and data sharing settings',
      href: '#privacy',
      icon: EyeIcon,
      color: 'purple',
    },
    {
      title: 'Billing',
      description: 'Subscription, payment methods, and usage',
      href: '#billing',
      icon: CreditCardIcon,
      color: 'indigo',
    },
    {
      title: 'Developer',
      description: 'API keys, webhooks, and integration tools',
      href: '#developer',
      icon: KeyIcon,
      color: 'gray',
    },
  ];

  const handleSaveProfile = async (updatedData: Partial<Profile>) => {
    if (!session?.user?.id) return;
    
    setSaving(true);
    try {
      const { error } = await supabaseBrowser
        .from('profiles')
        .update(updatedData)
        .eq('id', session.user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      // Show success notification
    } catch (error) {
      console.error('Error saving profile:', error);
      // Show error notification
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    
    try {
      // Call delete account API
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete account');
      
      // Sign out and redirect
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-6"></div>
          <p className="text-white/80 mb-4">Loading your settings...</p>
          <div className="space-x-4">
            <button 
              onClick={() => setLoading(false)} 
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
            >
              Skip Loading
            </button>
            <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Settings</h1>
          <p className="text-white/80 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
            <Link href="/" className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-white/80 mb-4">Please complete your profile setup</p>
          <div className="space-x-4">
            <Link href="/onboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Complete Setup
            </Link>
            <Link href="/" className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/u/${profile.handle}`}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Profile
              </Link>
              <div className="w-px h-6 bg-white/20"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-white/80">Manage your account and preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/u/${profile.handle}`}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all border border-white/30"
              >
                <EyeIcon className="w-4 h-4 inline mr-2" />
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 sticky top-8">
              {/* Profile Summary */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{profile.display_name}</h3>
                <p className="text-sm text-gray-600">@{profile.username}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  profile.plan === 'PRO' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.plan} Plan
                </span>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {settingsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.href.slice(1);
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => setActiveTab(item.href.slice(1))}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </button>
                  );
                })}
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                  >
                    <TrashIcon className="w-5 h-5" />
                    <span className="font-medium">Delete Account</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
              {activeTab === 'overview' && <OverviewTab profile={profile} onSave={handleSaveProfile} saving={saving} />}
              {activeTab === 'profile' && <ProfileTab profile={profile} onSave={handleSaveProfile} saving={saving} />}
              {activeTab === 'security' && <SecurityTab profile={profile} onSave={handleSaveProfile} saving={saving} />}
              {activeTab === 'notifications' && <NotificationsTab profile={profile} onSave={handleSaveProfile} saving={saving} />}
              {activeTab === 'privacy' && <PrivacyTab profile={profile} onSave={handleSaveProfile} saving={saving} />}
              {activeTab === 'billing' && <BillingTab profile={profile} />}
              {activeTab === 'developer' && <DeveloperTab profile={profile} />}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h2>
              <p className="text-gray-600">
                This action is permanent and cannot be undone. All your data will be lost forever.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">This will permanently delete:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Your profile and personal information</li>
                  <li>• All your projects and files</li>
                  <li>• Comments and forum posts</li>
                  <li>• Billing and subscription data</li>
                  <li>• API keys and integrations</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tab Components
function OverviewTab({ profile, onSave, saving }: { profile: Profile; onSave: (data: Partial<Profile>) => void; saving: boolean }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Overview</h2>
        <p className="text-gray-600">Quick overview and actions for your engineering profile</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <RocketLaunchIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">0</div>
              <div className="text-sm text-blue-600">Projects</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">0</div>
              <div className="text-sm text-green-600">Followers</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">0</div>
              <div className="text-sm text-purple-600">Total Views</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/projects/new"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
          >
            <PaperAirplaneIcon className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Create Project</div>
              <div className="text-sm text-gray-600">Share your engineering work</div>
            </div>
          </Link>
          
          <Link
            href="/pricing"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
          >
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Upgrade Plan</div>
              <div className="text-sm text-gray-600">Unlock Pro features</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ profile, onSave, saving }: { profile: Profile; onSave: (data: Partial<Profile>) => void; saving: boolean }) {
  const [editData, setEditData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    company: profile.company || '',
    job_title: profile.job_title || '',
    engineering_discipline: profile.engineering_discipline || '',
    experience_level: profile.experience_level || '',
    github_username: profile.github_username || '',
    linkedin_username: profile.linkedin_username || '',
  });

  const handleSave = () => {
    onSave(editData);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Information</h2>
        <p className="text-gray-600">Update your professional profile and engineering details</p>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={editData.display_name}
              onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="City, Country"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={editData.bio}
            onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell the engineering community about yourself..."
          />
        </div>

        {/* Professional Information */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={editData.company}
                onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your company"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              <input
                type="text"
                value={editData.job_title}
                onChange={(e) => setEditData(prev => ({ ...prev, job_title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your job title"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SecurityTab({ profile }: { profile: Profile; onSave: (data: Partial<Profile>) => void; saving: boolean }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Security</h2>
        <p className="text-gray-600">Manage your password and security settings</p>
      </div>

      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Account Security Status</h3>
          </div>
          <p className="text-green-700">Your account is secured with modern authentication practices.</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security features coming soon:</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Two-factor authentication</li>
            <li>• Security key support</li>
            <li>• Login activity monitoring</li>
            <li>• Session management</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ profile, onSave, saving }: { profile: Profile; onSave: (data: Partial<Profile>) => void; saving: boolean }) {
  const [preferences, setPreferences] = useState(profile.preferences);

  const handleToggle = (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    onSave({ preferences: newPrefs });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Choose what updates you want to receive</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <button
              onClick={() => handleToggle('email_notifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.email_notifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-600">Real-time browser notifications</p>
            </div>
            <button
              onClick={() => handleToggle('push_notifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.push_notifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.push_notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyTab({ profile, onSave, saving }: { profile: Profile; onSave: (data: Partial<Profile>) => void; saving: boolean }) {
  const [preferences, setPreferences] = useState(profile.preferences);

  const handleToggle = (key: keyof typeof preferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    onSave({ preferences: newPrefs });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
        <p className="text-gray-600">Control your privacy and profile visibility</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Public Profile</h4>
              <p className="text-sm text-gray-600">Make your profile visible to everyone</p>
            </div>
            <button
              onClick={() => handleToggle('public_profile')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.public_profile ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.public_profile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Show Online Status</h4>
              <p className="text-sm text-gray-600">Let others see when you're active</p>
            </div>
            <button
              onClick={() => handleToggle('show_online_status')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.show_online_status ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.show_online_status ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingTab({ profile }: { profile: Profile }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing & Subscription</h2>
        <p className="text-gray-600">Manage your subscription and payment methods</p>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile.plan === 'PRO' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {profile.plan} Plan
            </span>
          </div>
          
          {profile.plan === 'FREE' ? (
            <div className="text-center py-8">
              <SparklesIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Upgrade to Pro</h4>
              <p className="text-gray-600 mb-6">Unlock advanced features and unlimited projects</p>
              <Link
                href="/pricing"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                View Plans
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
              <p className="text-yellow-800">Thank you for being a Pro member! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeveloperTab({ profile }: { profile: Profile }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Developer Settings</h2>
        <p className="text-gray-600">API keys, webhooks, and integration tools</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <CodeBracketIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Developer Tools Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            API access, webhooks, and advanced integration features are in development
          </p>
          <div className="text-sm text-gray-500">
            <p>• REST API for project management</p>
            <p>• Webhook notifications</p>
            <p>• OAuth integrations</p>
            <p>• SDK and documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
} 