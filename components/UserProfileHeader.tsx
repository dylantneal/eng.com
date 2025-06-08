'use client';

interface UserProfileHeaderProps {
  profile: {
    id: string;
    handle: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    plan?: string | null;
    created_at?: string | null;
  };
  isOwner: boolean;
  stats: {
    projectCount: number;
    commentCount: number;
    memberSince?: string | null;
  };
}

export default function UserProfileHeader({ profile, isOwner, stats }: UserProfileHeaderProps) {
  const formatMemberSince = (dateString?: string | null) => {
    if (!dateString) return 'Member';
    const date = new Date(dateString);
    return `Member since ${date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })}`;
  };

  return (
    <div className="text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
        {/* Avatar */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 overflow-hidden">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={`@${profile.handle}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                {(profile.handle || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Plan Badge */}
          {profile.plan && (
            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold ${
              profile.plan === 'PRO' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                : 'bg-white/90 text-gray-800'
            }`}>
              {profile.plan}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-4xl font-bold text-white">
              @{profile.handle || 'user'}
            </h1>
            {isOwner && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                Your Profile
              </span>
            )}
          </div>
          
          <p className="text-xl text-white/90 mb-4 max-w-2xl">
            {profile.bio || (isOwner ? "Add a bio to tell others about yourself" : "No bio yet")}
          </p>

          <div className="flex items-center space-x-6 text-white/80">
            <div>
              <span className="font-semibold text-white">{stats.projectCount}</span>
              <span className="ml-1">{stats.projectCount === 1 ? 'Project' : 'Projects'}</span>
            </div>
            <div>
              <span className="font-semibold text-white">{stats.commentCount}</span>
              <span className="ml-1">{stats.commentCount === 1 ? 'Comment' : 'Comments'}</span>
            </div>
            <div className="hidden md:block">
              {formatMemberSince(stats.memberSince)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isOwner ? (
            <>
              <a
                href="/settings/account"
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-200 border border-white/30"
              >
                Edit Profile
              </a>
              <a
                href="/projects/new"
                className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200 shadow-lg"
              >
                New Project
              </a>
            </>
          ) : (
            <button className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-200 border border-white/30">
              Follow
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 