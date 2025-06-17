import { useState, useEffect } from 'react';
import { StarIcon, TrophyIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'star' | 'trophy' | 'shield';
  level: number;
  earned_at: string;
}

interface UserReputationProps {
  userId: string;
  className?: string;
}

export default function UserReputation({ userId, className = '' }: UserReputationProps) {
  const [reputation, setReputation] = useState<{
    total_aura: number;
    post_aura: number;
    comment_aura: number;
    helpful_answers: number;
    badges: Badge[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/reputation`);
        const data = await response.json();
        setReputation(data);
      } catch (error) {
        console.error('Error fetching reputation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReputation();
  }, [userId]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!reputation) {
    return null;
  }

  const getBadgeIcon = (icon: Badge['icon']) => {
    switch (icon) {
      case 'star':
        return <StarIcon className="w-5 h-5 text-yellow-400" />;
      case 'trophy':
        return <TrophyIcon className="w-5 h-5 text-yellow-600" />;
      case 'shield':
        return <ShieldCheckIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="text-2xl font-bold text-gray-900">
          {reputation.total_aura.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">
          <div>Post Aura: {reputation.post_aura.toLocaleString()}</div>
          <div>Comment Aura: {reputation.comment_aura.toLocaleString()}</div>
          <div>Helpful Answers: {reputation.helpful_answers}</div>
        </div>
      </div>

      {reputation.badges.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Badges</h3>
          <div className="flex flex-wrap gap-2">
            {reputation.badges.map((badge) => (
              <div
                key={badge.id}
                className="group relative flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-full"
              >
                {getBadgeIcon(badge.icon)}
                <span className="text-sm font-medium text-gray-700">
                  {badge.name}
                </span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {badge.description}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 