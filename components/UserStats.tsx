'use client';

interface UserStatsProps {
  projectCount: number;
  commentCount: number;
  plan?: string | null;
  memberSince?: string | null;
}

export default function UserStats({ projectCount, commentCount, plan, memberSince }: UserStatsProps) {
  const formatMemberSince = (dateString?: string | null) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const stats = [
    {
      label: 'Projects',
      value: projectCount,
      icon: '🔧',
      description: 'Public projects shared',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Engagement',
      value: commentCount,
      icon: '💬',
      description: 'Comments received',
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Plan',
      value: plan || 'FREE',
      icon: plan === 'PRO' ? '💎' : '🆓',
      description: 'Current subscription',
      color: plan === 'PRO' ? 'from-purple-500 to-purple-600' : 'from-gray-500 to-gray-600'
    },
    {
      label: 'Member',
      value: formatMemberSince(memberSince),
      icon: '📅',
      description: 'Joined the platform',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 overflow-hidden group"
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-xl shadow-sm`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {stat.label}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              {stat.description}
            </p>
            
            {/* Animated underline */}
            <div className={`mt-3 h-1 bg-gradient-to-r ${stat.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left`} />
          </div>
        </div>
      ))}
    </div>
  );
} 