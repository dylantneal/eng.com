'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationText })
      });

      const data = await response.json();

      if (response.ok) {
        // Account deleted successfully - sign out and redirect
        await signOut({ redirect: false });
        router.push('/signin?message=account-deleted');
      } else {
        setError(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Delete account error:', err);
    }

    setLoading(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access this page.</p>
          <Link href="/signin" className="mt-4 text-blue-600 hover:text-blue-800">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/settings" 
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
          >
            ← Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-red-900">Delete Account</h1>
          <p className="text-gray-600 mt-2">
            This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-red-900 mb-4">
                ⚠️ Are you absolutely sure?
              </h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-red-900 mb-2">This will permanently:</h3>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Delete your profile (@{session.user.email?.split('@')[0] || 'your-handle'})</li>
                  <li>Remove all your projects and files</li>
                  <li>Cancel any active subscriptions</li>
                  <li>Delete all your account data</li>
                  <li>Make your username available for others</li>
                  <li>Sign you out immediately</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-yellow-900 mb-2">Before you continue:</h3>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Download any important project files</li>
                  <li>Save any data you want to keep</li>
                  <li>Consider if you might want to return in the future</li>
                  <li>Make sure this is really what you want</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Yes, I want to delete my account
                </button>
                <Link
                  href="/settings"
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-red-900 mb-4">
                Final Confirmation
              </h2>
              
              <p className="text-gray-700 mb-6">
                To confirm account deletion, please type{' '}
                <code className="bg-gray-100 px-2 py-1 rounded text-red-600 font-mono">
                  DELETE MY ACCOUNT
                </code>{' '}
                in the box below:
              </p>

              <div className="mb-6">
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Type: DELETE MY ACCOUNT"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Account Details:</h3>
                <p className="text-sm text-gray-600">Email: {session.user.email}</p>
                <p className="text-sm text-gray-600">User ID: {session.user.id}</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={confirmationText !== 'DELETE MY ACCOUNT' || loading}
                  className={`px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 ${
                    confirmationText === 'DELETE MY ACCOUNT' && !loading
                      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting Account...
                    </div>
                  ) : (
                    'Delete My Account Forever'
                  )}
                </button>
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Safety Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Need help instead?</h3>
          <p className="text-sm text-blue-800 mb-3">
            If you're having issues with your account, consider these alternatives:
          </p>
          <div className="space-y-2">
            <Link href="/settings/account" className="block text-sm text-blue-700 hover:text-blue-900">
              • Update your profile or handle
            </Link>
            <Link href="/settings/notifications" className="block text-sm text-blue-700 hover:text-blue-900">
              • Adjust notification settings
            </Link>
            <Link href="/settings/billing" className="block text-sm text-blue-700 hover:text-blue-900">
              • Manage subscription or billing
            </Link>
            <a href="mailto:support@eng.com" className="block text-sm text-blue-700 hover:text-blue-900">
              • Contact support for help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 