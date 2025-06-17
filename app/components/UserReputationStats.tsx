import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowTrendingUpIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface ReputationStats {
  total_aura: number;
  post_aura: number;
  comment_aura: number;
  helpful_answers: number;
}

interface UserReputationStatsProps {
  userId: string;
  className?: string;
}

const stats = [
  {
    name: 'Total Aura',
    key: 'total_aura',
    icon: ArrowTrendingUpIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'Post Aura',
    key: 'post_aura',
    icon: StarIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    name: 'Comment Aura',
    key: 'comment_aura',
    icon: ChatBubbleLeftIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Helpful Answers',
    key: 'helpful_answers',
    icon: HeartIcon,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

export default function UserReputationStats({
  userId,
  className = '',
}: UserReputationStatsProps) {
  const [reputation, setReputation] = useState<ReputationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/reputation`);
        if (!response.ok) {
          throw new Error('Failed to fetch reputation');
        }
        const data = await response.json();
        setReputation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reputation');
      } finally {
        setLoading(false);
      }
    };

    fetchReputation();
  }, [userId]);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="h-24 rounded-lg bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !reputation) {
    return null;
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = reputation[stat.key as keyof ReputationStats];

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${stat.bgColor} flex flex-col items-center justify-center`}
          >
            <Icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{stat.name}</div>
          </motion.div>
        );
      })}
    </div>
  );
} 