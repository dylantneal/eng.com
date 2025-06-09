'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EngineeringBackground from '@/components/EngineeringBackground';
import DarkSignInForm from '@/components/auth/DarkSignInForm';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <EngineeringBackground />
      
      <div className="max-w-md w-full space-y-8 p-10 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700/50 relative z-10">
        <div>
          <div className="mb-8 flex items-center justify-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <span className="text-lg font-bold tracking-wider text-engineering">ENG.COM</span>
            <span className="text-yellow-400 animate-pulse">✨</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome Back, Engineer
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to continue building the future
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <DarkSignInForm callbackUrl="/dashboard" />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Join the engineering community
            </Link>
          </p>
        </div>

        {/* Engineering Stats */}
        <div className="grid grid-cols-3 gap-4 text-center mt-8 pt-8 border-t border-gray-700/50">
          <div>
            <div className="text-lg font-bold text-blue-400">10K+</div>
            <div className="text-xs text-gray-400">Engineers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">50K+</div>
            <div className="text-xs text-gray-400">Projects</div>
          </div>
          <div>
            <div className="text-lg font-bold text-cyan-400">$2M+</div>
            <div className="text-xs text-gray-400">Earned</div>
          </div>
        </div>
      </div>
    </div>
  );
} 