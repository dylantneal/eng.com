'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    engineeringDiscipline: '',
    experienceLevel: '',
    interests: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  console.log('AuthPage render:', { user, loading, isSignUp });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(formData.email, formData.password, {
          username: formData.username,
          display_name: formData.displayName,
          engineering_discipline: formData.engineeringDiscipline,
          experience_level: formData.experienceLevel as any,
          interests: formData.interests,
          bio: formData.bio,
        });

        if (result.error) {
          setError(result.error.message);
        } else {
          router.push('/dashboard');
        }
      } else {
        const result = await signIn(formData.email, formData.password);

        if (result.error) {
          setError(result.error.message);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 p-10 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700/50">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isSignUp ? 'Create Your eng.com Profile' : 'Sign in to Your Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isSignUp ? 'Join a global network of innovators' : 'Welcome back to the cutting edge'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a strong password"
              />
            </div>

            {isSignUp && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                      Display Name
                    </label>
                    <input id="displayName" name="displayName" type="text" required value={formData.displayName} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Jane Doe" />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                      Username
                    </label>
                    <input id="username" name="username" type="text" required value={formData.username} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., jdoe" />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell us a little about yourself..."></textarea>
                </div>
                
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-300 mb-1">
                    Interests
                  </label>
                  <input id="interests" name="interests" type="text" value={formData.interests} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., AI, Robotics, Web3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="engineeringDiscipline" className="block text-sm font-medium text-gray-300 mb-1">
                      Engineering Discipline
                    </label>
                    <select id="engineeringDiscipline" name="engineeringDiscipline" value={formData.engineeringDiscipline} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select discipline</option>
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Aerospace Engineering">Aerospace Engineering</option>
                      <option value="Biomedical Engineering">Biomedical Engineering</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-300 mb-1">
                      Experience Level
                    </label>
                    <select id="experienceLevel" name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select level</option>
                      <option value="student">Student</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-md p-4 mt-4">
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                console.log('Toggle SignUp:', !isSignUp);
              }}
              className="font-medium text-blue-400 hover:text-blue-300 text-sm"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}