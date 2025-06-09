import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseServerAdmin } from '@/lib/supabase/server-admin';
import Link from 'next/link';

export default async function DebugProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profile Debug</h1>
        <div className="bg-red-100 p-4 rounded">
          <p>Not logged in. Please sign in first.</p>
        </div>
      </div>
    );
  }

  const supabase = supabaseServerAdmin();
  
  // Get all profiles to see what exists
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .limit(10);

  // Try to find user's profile by ID
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const handle = session.user.email?.split('@')[0] || 'user';

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Session User</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(session.user, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">User Profile (by ID)</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(userProfile, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">All Profiles (first 10)</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(allProfiles, null, 2)}</pre>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Constructed Handles</h2>
          <p><strong>From email:</strong> {handle}</p>
          <p><strong>From profile:</strong> {userProfile?.handle || 'null'}</p>
          <p><strong>Profile URL should be:</strong> /u/{userProfile?.handle || handle}</p>
        </div>

        {!userProfile && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Profile Missing</h2>
            <p className="mb-4">No profile found in database. This is why you're getting 404 errors.</p>
            <form action="/api/create-profile" method="POST">
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Profile Now
              </button>
            </form>
            <p className="text-sm mt-2 text-gray-600">This will create a profile and redirect you back here.</p>
          </div>
        )}

        {userProfile && (
          <div className="bg-green-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Profile Found!</h2>
            <p className="mb-4">Your profile exists. Try visiting your profile page:</p>
            <Link 
              href={`/u/${userProfile.handle}`}
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Visit Profile: /u/{userProfile.handle}
            </Link>
          </div>
        )}

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Navigation</h2>
          <div className="space-x-4">
            <Link href="/home" className="text-blue-600 hover:underline">← Back to Home</Link>
            <Link href="/signin" className="text-blue-600 hover:underline">Sign In</Link>
            <Link href="/api/auth/signout" className="text-red-600 hover:underline">Sign Out</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 