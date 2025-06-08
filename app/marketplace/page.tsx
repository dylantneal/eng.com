import { Suspense } from 'react';
import Marketplace from '@/components/Marketplace';
import { Search } from 'lucide-react';

export const metadata = {
  title: 'Marketplace - Eng.com',
  description: 'Discover and purchase engineering designs, kits, and services from the community',
};

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Engineering Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Buy and sell CAD files, hardware kits, tutorials, and professional services. 
              Join the community where engineers learn, build, and earn together.
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search designs, kits, tutorials..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={params.search || ''}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">2,847</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">156k</div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">$127k</div>
              <div className="text-sm text-gray-600">Earned by Sellers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">4.8/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<MarketplaceLoading />}>
          <Marketplace 
            category={params.category}
            searchQuery={params.search}
            showFeatured={true}
          />
        </Suspense>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Turn your engineering expertise into income. List your designs, kits, or services 
              and reach thousands of makers and engineers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/seller/onboarding"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Become a Seller
              </a>
              <a
                href="/learn/selling-guide"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketplaceLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
          ))}
        </div>
      </div>
    </div>
  );
} 