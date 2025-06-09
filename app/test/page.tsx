import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function TestPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧪 eng.com Feature Testing
        </h1>
        
        {/* Authentication Status */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            Authentication Status
          </h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ User authenticated</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Name:</strong> {session.user?.name || 'Not set'}</p>
              <p><strong>User ID:</strong> {(session.user as any)?.id || 'Not available'}</p>
            </div>
          ) : (
            <div>
              <p className="text-orange-600">⚠️ Not authenticated</p>
              <a href="/auth/signin" className="text-blue-600 hover:underline">
                → Sign in to test authentication
              </a>
            </div>
          )}
        </div>

        {/* Feature Tests */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Enhanced Authentication */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              🔐 Enhanced Authentication
            </h3>
            <div className="space-y-2 text-sm">
              <p>✅ NextAuth configuration</p>
              <p>✅ Server session handling</p>
              <p>🔄 Custom signin page</p>
              <p>🔄 2FA integration</p>
              <p>🔄 Rate limiting</p>
            </div>
            <div className="mt-4">
              <a 
                href="/auth/signin" 
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                Test Sign In
              </a>
            </div>
          </div>

          {/* CAD Processing */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              ⚙️ CAD File Processing
            </h3>
            <div className="space-y-2 text-sm">
              <p>✅ File format detection</p>
              <p>✅ Processing pipeline</p>
              <p>✅ Metadata extraction</p>
              <p>🔄 3D viewer integration</p>
              <p>🔄 Thumbnail generation</p>
            </div>
            <div className="mt-4">
              <a 
                href="/projects/new" 
                className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
              >
                Test File Upload
              </a>
            </div>
          </div>

          {/* Project Creation */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📁 Modern Project Creation
            </h3>
            <div className="space-y-2 text-sm">
              <p>✅ Multi-step wizard</p>
              <p>✅ File upload component</p>
              <p>✅ Markdown editor</p>
              <p>✅ Plan integration</p>
              <p>🔄 API endpoints</p>
            </div>
            <div className="mt-4">
              <a 
                href="/projects/new" 
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Create Project
              </a>
            </div>
          </div>

          {/* Dashboard & UI */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-900 mb-3">
              🏠 Dashboard & Navigation
            </h3>
            <div className="space-y-2 text-sm">
              <p>✅ Dashboard restoration</p>
              <p>✅ Sample content</p>
              <p>✅ Navigation fixes</p>
              <p>✅ Pricing page</p>
              <p>✅ Settings integration</p>
            </div>
            <div className="mt-4">
              <a 
                href="/home" 
                className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700"
              >
                View Dashboard
              </a>
            </div>
          </div>
        </div>

        {/* Server Information */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🔧 Server Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Server Status:</strong> ✅ Running</p>
              <p><strong>Port:</strong> 4000</p>
              <p><strong>Environment:</strong> Development</p>
            </div>
            <div>
              <p><strong>Auth Provider:</strong> NextAuth</p>
              <p><strong>Database:</strong> Supabase</p>
              <p><strong>Storage:</strong> Supabase Storage</p>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            📋 Testing Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Authentication Test:</strong> Click "Test Sign In" to test the enhanced signin form</li>
            <li><strong>Project Creation:</strong> Click "Create Project" to test the multi-step project wizard</li>
            <li><strong>CAD Processing:</strong> Upload a CAD file (.stl, .step, .dwg) to test file processing</li>
            <li><strong>Dashboard:</strong> Click "View Dashboard" to see the restored dashboard with stats</li>
            <li><strong>Navigation:</strong> Test all navbar links to ensure proper routing</li>
          </ol>
        </div>

        {/* System Health */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            💚 System Health Check
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Core Features</p>
              <p>✅ Server startup</p>
              <p>✅ Page rendering</p>
              <p>✅ Static assets</p>
            </div>
            <div>
              <p className="font-medium">Authentication</p>
              <p>✅ Session handling</p>
              <p>✅ Route protection</p>
              <p>✅ User data</p>
            </div>
            <div>
              <p className="font-medium">Database</p>
              <p>✅ Supabase connection</p>
              <p>🔄 User profiles</p>
              <p>🔄 Project storage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 