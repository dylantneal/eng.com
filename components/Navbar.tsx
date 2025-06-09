'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MagnifyingGlassIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { LogoMark } from '@/components/AnimatedLogo';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <LogoMark className="group-hover:scale-110 transition-transform duration-200" />
            <span className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">eng.com</span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/gallery" 
              className="text-gray-300 hover:text-white font-medium transition-colors relative group"
            >
              Projects
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/marketplace" 
              className="text-gray-300 hover:text-white font-medium transition-colors relative group"
            >
              Marketplace
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link 
              href="/community" 
              className="text-gray-300 hover:text-white font-medium transition-colors relative group"
            >
              Community
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Search */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-80 pl-10 pr-3 py-2 border border-gray-600 rounded-lg text-sm
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 
                          focus:border-blue-400 bg-gray-800/50 hover:bg-gray-800 text-white transition-colors"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                           bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
                           border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  New Project
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                      <span className="text-sm font-medium text-white">
                        {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 
                                invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-md">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">{user.display_name}</p>
                        <p className="text-xs text-gray-400">u/{user.username}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                           bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
                           border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
                           focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 