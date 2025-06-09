import { supabaseServerAdmin } from '@/lib/supabase/server-admin';
import Link from 'next/link';

export default async function DebugProfilePage() {
  // Remove NextAuth session usage
  // Instead, just show a message to log in via the main UI
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile Debug</h1>
      <div className="bg-yellow-100 p-4 rounded">
        <p>Use the main app UI to log in and view your profile.</p>
      </div>
    </div>
  );
} 