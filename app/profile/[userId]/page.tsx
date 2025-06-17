import { createClient } from '@supabase/supabase-js';
import UserReputationStats from '@/app/components/UserReputationStats';
import UserBadges from '@/app/components/UserBadges';
import UserActivity from '@/app/components/UserActivity';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Fetch user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.userId)
    .single();

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">User not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <span className="text-2xl">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              {user.bio && (
                <p className="mt-1 text-gray-600">{user.bio}</p>
              )}
              <div className="mt-2">
                <UserBadges userId={params.userId} />
              </div>
            </div>
          </div>
        </div>

        {/* Reputation stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aura & Reputation</h2>
          <UserReputationStats userId={params.userId} />
        </div>

        {/* Activity history */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <UserActivity userId={params.userId} />
        </div>
      </div>
    </div>
  );
} 