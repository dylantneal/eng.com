'use client';

import { useState } from 'react';
import { testSupabaseConnection, clearBrowserSession, getCurrentUser } from '@/lib/auth';

export default function DebugAuthPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: any) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      console.log(`🔄 Running test: ${testName}`);
      const result = await testFn();
      addResult({ test: testName, status: 'success', result });
    } catch (error: any) {
      console.error(`❌ Test failed: ${testName}`, error);
      addResult({ test: testName, status: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Authentication Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => runTest('Supabase Connection', testSupabaseConnection)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
          >
            Test Supabase Connection
          </button>
          
          <button
            onClick={() => runTest('Get Current User', getCurrentUser)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:opacity-50"
          >
            Test getCurrentUser
          </button>
          
          <button
            onClick={() => runTest('Clear Browser Session', clearBrowserSession)}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded disabled:opacity-50"
          >
            Clear Browser Session
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Clear Results
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>

        {loading && (
          <div className="mb-4 p-4 bg-blue-900/50 rounded">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
              Running test...
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          {results.length === 0 && (
            <p className="text-gray-400">No tests run yet. Click a button above to start testing.</p>
          )}
          
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded ${
                result.status === 'success' ? 'bg-green-900/50' : 'bg-red-900/50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{result.test}</h3>
                <span className="text-sm text-gray-400">{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <div className={`text-sm ${result.status === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                Status: {result.status}
              </div>
              
              <pre className="mt-2 text-xs bg-black/50 p-2 rounded overflow-auto">
                {JSON.stringify(result.result || result.error, null, 2)}
              </pre>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2 text-sm">
            <a href="/signin" className="block text-blue-400 hover:underline">→ Go to Sign In Page</a>
            <a href="/signup" className="block text-blue-400 hover:underline">→ Go to Sign Up Page</a>
            <a href="/dashboard" className="block text-blue-400 hover:underline">→ Go to Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
} 