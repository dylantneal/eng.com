import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  TrophyIcon,
  AcademicCapIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/solid';

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  description: string;
  earned_at: string;
}

interface UserBadgesProps {
  userId: string;
  className?: string;
}

const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  helper: HeartIcon,
  popular: StarIcon,
  commentator: ChatBubbleLeftIcon,
  expert: AcademicCapIcon,
  contributor: CodeBracketIcon,
  champion: TrophyIcon,
};

const badgeColors: Record<string, string> = {
  helper: 'bg-pink-100 text-pink-600',
  popular: 'bg-yellow-100 text-yellow-600',
  commentator: 'bg-blue-100 text-blue-600',
  expert: 'bg-purple-100 text-purple-600',
  contributor: 'bg-green-100 text-green-600',
  champion: 'bg-red-100 text-red-600',
};

export default function UserBadges({ userId, className = '' }: UserBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/reputation`);
        if (!response.ok) {
          throw new Error('Failed to fetch badges');
        }
        const data = await response.json();
        setBadges(data.badges || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch badges');
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badges.map((badge) => {
        const Icon = badgeIcons[badge.badge_type] || StarIcon;
        const colorClass = badgeColors[badge.badge_type] || 'bg-gray-100 text-gray-600';

        return (
          <motion.div
            key={badge.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="group relative"
          >
            <div
              className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center cursor-help`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              <div className="font-semibold">{badge.badge_name}</div>
              <div className="text-gray-300 text-xs">{badge.description}</div>
              <div className="text-gray-400 text-xs mt-1">
                Earned {new Date(badge.earned_at).toLocaleDateString()}
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
} 