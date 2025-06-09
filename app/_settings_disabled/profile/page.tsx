import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  UserCircleIcon,
  PhotoIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Profile Settings - Eng.com',
  description: 'Edit your engineering profile and showcase your skills',
};

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin?callbackUrl=/settings/profile');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/u/${session.user?.email?.split('@')[0] || 'user'}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Customize your engineering profile to showcase your skills and expertise
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Photo & Basic Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserCircleIcon className="w-6 h-6 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Photo */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Profile Photo
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-white">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <PhotoIcon className="w-4 h-4" />
                    Upload Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    defaultValue={session.user?.name || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username/Handle *
                  </label>
                  <input
                    type="text"
                    defaultValue={session.user?.email?.split('@')[0] || ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your-username"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your profile URL: eng.com/u/your-username
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell the engineering community about yourself, your expertise, and your passion for innovation..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum 500 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
              Professional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Senior Mechanical Engineer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Tesla, Apple, Startup Inc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-website.com"
                />
              </div>
            </div>
          </div>

          {/* Engineering Skills */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-6 h-6 text-purple-600" />
              Engineering Skills & Expertise
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Engineering Domain
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select your primary domain</option>
                  <option value="mechanical">Mechanical Engineering</option>
                  <option value="electrical">Electrical Engineering</option>
                  <option value="software">Software Engineering</option>
                  <option value="civil">Civil Engineering</option>
                  <option value="aerospace">Aerospace Engineering</option>
                  <option value="robotics">Robotics & Automation</option>
                  <option value="biomedical">Biomedical Engineering</option>
                  <option value="chemical">Chemical Engineering</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Technologies
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., SolidWorks, Arduino, Python, CAD Design, PCB Layout, 3D Printing..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate skills with commas. These will help others find your expertise.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years (Student/New Graduate)</option>
                  <option value="2-5">2-5 years (Junior Engineer)</option>
                  <option value="6-10">6-10 years (Senior Engineer)</option>
                  <option value="11-15">11-15 years (Lead Engineer)</option>
                  <option value="16+">16+ years (Principal/Director)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GlobeAltIcon className="w-6 h-6 text-indigo-600" />
              Social & Professional Links
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-portfolio.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter/X Profile
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy & Visibility</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                  <p className="text-sm text-gray-600">Control who can see your profile</p>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="public">Public</option>
                  <option value="engineering-community">Engineering Community Only</option>
                  <option value="followers">Followers Only</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Email Address</h3>
                  <p className="text-sm text-gray-600">Allow others to see your email for collaboration</p>
                </div>
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Activity Status</h3>
                  <p className="text-sm text-gray-600">Display when you're online and active</p>
                </div>
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Link
              href={`/u/${session.user?.email?.split('@')[0] || 'user'}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 