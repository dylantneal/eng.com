import React from 'react';
import { createClient } from '@/utils/supabase-server';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TipJar from '@/components/TipJar';
import type { Database } from '@/types/database';

interface ProjectPageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id, slug } = await params;
  
  // TODO: Implement project viewing when database schema is ready
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Project: {slug}</h1>
        <p className="text-gray-600 mb-6">
          Project viewing is being developed. This feature will be available soon!
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h3 className="font-medium text-blue-900 mb-2">Coming Soon:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• View CAD files and 3D models</li>
            <li>• Browse project documentation</li>
            <li>• Leave comments and feedback</li>
            <li>• Support creators with tips</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 