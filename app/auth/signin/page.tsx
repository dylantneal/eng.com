import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';

export const metadata = {
  title: 'Sign In — eng.com',
  description: 'Sign in to your eng.com account',
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">eng.com</h1>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <a
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </a>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignInForm />
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="text-sm text-gray-600">
          <a
            href="/auth/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
} 