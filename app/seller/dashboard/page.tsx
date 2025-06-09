import { Suspense } from 'react';
import SellerDashboard from '@/components/seller-dashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Seller Dashboard - Eng.com',
  description: 'Manage your marketplace presence and track performance',
};

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/signin?callbackUrl=/seller/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<DashboardLoading />}>
          <SellerDashboard sellerId={session.user?.id} />
        </Suspense>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
        ))}
      </div>
    </div>
  );
} 