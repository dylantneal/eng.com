'use client';

import GalleryFilterBar from '@/components/GalleryFilterBar';
import InfiniteFeed from '@/components/InfiniteFeed';
import { useAuth } from '@/contexts/AuthContext';

export default function GalleryPage() {
  // Optionally get userId for personalized feeds/bookmarks
  // const { user } = useAuth();
  // const userId = user?.id || '';
  // For now, pass empty string to InfiniteFeed for public feed
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-5xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Project Gallery</h1>
        <GalleryFilterBar active="newest" />
        <InfiniteFeed userId={''} />
      </div>
    </div>
  );
} 