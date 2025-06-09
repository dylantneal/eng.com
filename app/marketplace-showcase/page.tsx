import Link from 'next/link';
import { 
  Shield, 
  Lock, 
  Star, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Globe,
  CheckCircle,
  DollarSign,
  Download,
  ShoppingCart,
  BarChart3,
  Zap
} from 'lucide-react';

export const metadata = {
  title: 'Advanced Marketplace Features - Eng.com',
  description: 'Explore our enterprise-grade marketplace with escrow protection, DRM, licensing, and seller analytics',
};

export default function MarketplaceShowcase() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Advanced Marketplace System
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Enterprise-grade marketplace with payment processing, escrow protection, 
              digital rights management, and comprehensive seller analytics
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/marketplace"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Explore Marketplace
              </Link>
              <Link
                href="/test-marketplace"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Test All Features
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built for Professional Engineers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our marketplace combines the best of e-commerce platforms like Etsy and Gumroad 
            with enterprise features tailored for engineering and technical content.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Escrow Protection</h3>
            <p className="text-gray-600 text-sm">
              Automatic escrow for high-value transactions over $500 with 7-day auto-release
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Licenses</h3>
            <p className="text-gray-600 text-sm">
              Personal, commercial, extended, and open source licensing with different price multipliers
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">DRM Protection</h3>
            <p className="text-gray-600 text-sm">
              Secure downloads with token-based access, download limits, and time expiry
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Reviews</h3>
            <p className="text-gray-600 text-sm">
              Purchase-verified reviews with seller responses and helpful vote tracking
            </p>
          </div>
        </div>

        {/* Detailed Feature Sections */}
        
        {/* Payment Processing */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border mb-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Payment Processing & Financial Management</h3>
              <p className="text-gray-600">Stripe Connect integration with split payments and international support</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Stripe Connect</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Express account creation</li>
                <li>• Automated onboarding</li>
                <li>• Identity verification</li>
                <li>• Payout management</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Split Payments</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 5% platform fees</li>
                <li>• Instant seller payouts</li>
                <li>• Tax calculation</li>
                <li>• International support</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Tax Handling</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• VAT/sales tax calculation</li>
                <li>• Geographic tax rules</li>
                <li>• Tax reporting</li>
                <li>• Business compliance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Seller Analytics */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border mb-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Seller Analytics & Reporting</h3>
              <p className="text-gray-600">Comprehensive dashboard with performance metrics and insights</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">$12,473</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-gray-600">Total Sales</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">4.8/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">12.4%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Performance Metrics</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Revenue tracking and trends</li>
                <li>• Sales performance analysis</li>
                <li>• Conversion rate optimization</li>
                <li>• Top performing items</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Geographic Insights</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sales by country breakdown</li>
                <li>• Revenue distribution maps</li>
                <li>• International market analysis</li>
                <li>• Currency performance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Demo Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">See It In Action</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Experience our advanced marketplace features with real API calls and interactive demonstrations
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/marketplace"
                className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all"
              >
                <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">Browse Marketplace</div>
                <div className="text-sm text-purple-100">View items with license selection</div>
              </Link>
              
              <Link
                href="/seller/dashboard"
                className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all"
              >
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">Seller Dashboard</div>
                <div className="text-sm text-purple-100">Complete analytics interface</div>
              </Link>
              
              <Link
                href="/test-marketplace"
                className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 hover:bg-opacity-30 transition-all"
              >
                <Zap className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">API Testing Suite</div>
                <div className="text-sm text-purple-100">Test all endpoints live</div>
              </Link>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Available API Endpoints</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Seller Management</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="bg-blue-50 px-3 py-1 rounded">POST /api/marketplace/seller/onboard</div>
                <div className="bg-green-50 px-3 py-1 rounded">GET /api/marketplace/seller/analytics</div>
                <div className="bg-purple-50 px-3 py-1 rounded">GET /api/marketplace/seller/analytics/dashboard</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Purchase & Escrow</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="bg-blue-50 px-3 py-1 rounded">POST /api/marketplace/purchase</div>
                <div className="bg-orange-50 px-3 py-1 rounded">POST /api/marketplace/escrow</div>
                <div className="bg-red-50 px-3 py-1 rounded">POST /api/marketplace/escrow/[id]/release</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Reviews & Social</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="bg-blue-50 px-3 py-1 rounded">POST /api/marketplace/reviews</div>
                <div className="bg-green-50 px-3 py-1 rounded">GET /api/marketplace/reviews</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Digital Downloads</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="bg-green-50 px-3 py-1 rounded">GET /api/marketplace/download/[fileId]</div>
                <div className="bg-purple-50 px-3 py-1 rounded">POST /api/marketplace/download/[fileId]</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-gray-900 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">Technical Implementation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-blue-400 mb-3">Architecture</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Next.js 15 with App Router</li>
                <li>• TypeScript for type safety</li>
                <li>• 738+ lines of service logic</li>
                <li>• 370+ lines of type definitions</li>
                <li>• RESTful API design</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-green-400 mb-3">Security</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• NextAuth authentication</li>
                <li>• Input validation & sanitization</li>
                <li>• XSS protection</li>
                <li>• DRM token-based access</li>
                <li>• Purchase verification</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-purple-400 mb-3">Integrations</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Stripe Connect payments</li>
                <li>• International tax APIs</li>
                <li>• Email notifications</li>
                <li>• Analytics tracking</li>
                <li>• File storage & DRM</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 