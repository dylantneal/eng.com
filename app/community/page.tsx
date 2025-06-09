'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  display_name: string;
  description: string;
  member_count: number;
  post_count: number;
  color: string;
  category: string;
}

export default function CommunityPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Community page useEffect triggered');
    
    const loadCommunities = async () => {
      try {
        console.log('Fetching communities...');
        const response = await fetch('/api/communities');
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Communities data:', data);
          setCommunities(data);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        console.error('Error loading communities:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Fallback data
        setCommunities([
          {
            id: '1',
            name: 'mechanical-engineering',
            display_name: 'Mechanical Engineering',
            description: 'Design, analysis, and manufacturing of mechanical systems',
            member_count: 15420,
            post_count: 892,
            color: '#DC2626',
            category: 'engineering'
          },
          {
            id: '2',
            name: 'electronics',
            display_name: 'Electronics & PCB Design',
            description: 'Circuit design, PCB layout, and electronic prototyping',
            member_count: 12380,
            post_count: 756,
            color: '#7C3AED',
            category: 'engineering'
          },
          {
            id: '3',
            name: 'robotics',
            display_name: 'Robotics',
            description: 'Autonomous systems, control theory, and robot design',
            member_count: 8950,
            post_count: 543,
            color: '#059669',
            category: 'engineering'
          }
        ]);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  console.log('Render - loading:', loading, 'communities:', communities.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading communities...</p>
          <div className="mt-2 text-xs text-gray-400">
            <p>Debug: loading = {loading.toString()}</p>
            <p>Communities: {communities.length}</p>
            <p>Error: {error || 'none'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Engineering Communities</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with engineers worldwide. Ask questions, share projects, and learn from the community.
            </p>
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Communities</h2>
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Warning: {error} (showing fallback data)</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Link
              key={community.id}
              href={`/community/${community.name}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: community.color }}
                >
                  {community.display_name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {community.display_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    r/{community.name}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {community.description}
              </p>
              
              <div className="flex justify-between text-sm text-gray-500">
                <span>{community.member_count.toLocaleString()} members</span>
                <span>{community.post_count} posts</span>
              </div>
            </Link>
          ))}
        </div>

        {communities.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No communities found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 