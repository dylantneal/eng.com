'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">eng.com</span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/gallery" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Projects
            </Link>
            <Link 
              href="/marketplace" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Marketplace
            </Link>
            <Link 
              href="/community" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Community
            </Link>
          </div>

          {/* Search */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                          placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                           bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                           transition-colors"
                >
                  New Project
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {session.user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 
                                invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="py-1">
                      <Link
                        href="/home"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
                           bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                           transition-colors"
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