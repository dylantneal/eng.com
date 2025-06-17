'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChatBubbleLeftIcon,
  StarIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'post' | 'comment' | 'vote' | 'badge';
  title: string;
  description: string;
  created_at: string;
  aura_change?: number;
  badge_type?: string;
}

interface UserActivityProps {
  userId: string;
  className?: string;
}

const activityIcons = {
  post: StarIcon,
  comment: ChatBubbleLeftIcon,
  vote: HeartIcon,
  badge: ArrowTrendingUpIcon,
};

const activityColors = {
  post: 'text-yellow-600 bg-yellow-50',
  comment: 'text-blue-600 bg-blue-50',
  vote: 'text-pink-600 bg-pink-50',
  badge: 'text-purple-600 bg-purple-50',
};

export default function UserActivity({
  userId,
  className = '',
}: UserActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/activity`);
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || activities.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-8 pb-8 last:pb-0"
          >
            {/* Timeline line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Timeline dot */}
            <div className="absolute left-0 top-0">
              <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Activity content */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Aura change or badge info */}
              {activity.aura_change && (
                <div className="mt-2 text-sm">
                  <span className={activity.aura_change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {activity.aura_change > 0 ? '+' : ''}{activity.aura_change} aura
                  </span>
                </div>
              )}
              {activity.badge_type && (
                <div className="mt-2 text-sm text-purple-600">
                  Earned {activity.badge_type} badge
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
} 