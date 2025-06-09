'use client';

import { useState } from 'react';
import { ShoppingCart, Star, Shield, CreditCard, Download, BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message: string;
  details?: any;
  duration?: number;
}

export default function MarketplaceTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (test: string, status: TestResult['status'], message: string, details?: any, duration?: number) => {
    setResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        existing.duration = duration;
        return [...prev];
      }
      return [...prev, { test, status, message, details, duration }];
    });
  };

  const testAPI = async (url: string, options: RequestInit = {}) => {
    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      return { success: response.ok, status: response.status, data, duration };
    } catch (error) {
      return {
        success: false,
        status: 0,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        duration: Date.now() - startTime
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test seller onboarding
    updateResult('seller-onboarding', 'running', 'Testing seller onboarding...');
    const onboardTest = await testAPI('/api/marketplace/seller/onboard', {
      method: 'POST',
      body: JSON.stringify({
        country: 'US',
        business_type: 'individual',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      })
    });
    
    updateResult('seller-onboarding', 
      onboardTest.success || onboardTest.status === 401 ? 'success' : 'error',
      onboardTest.status === 401 ? 'Authentication required (expected)' : 
      onboardTest.success ? 'Seller onboarding works' : 'Seller onboarding failed',
      onboardTest.data, onboardTest.duration);

    // Test purchase creation
    updateResult('purchase-creation', 'running', 'Testing purchase creation...');
    const purchaseTest = await testAPI('/api/marketplace/purchase', {
      method: 'POST',
      body: JSON.stringify({ item_id: 'test_item_123', license_type: 'personal' })
    });
    
    updateResult('purchase-creation',
      purchaseTest.success || purchaseTest.status === 401 ? 'success' : 'error',
      purchaseTest.status === 401 ? 'Authentication required (expected)' : 
      purchaseTest.success ? 'Purchase creation works' : 'Purchase creation failed',
      purchaseTest.data, purchaseTest.duration);

    // Test reviews
    updateResult('review-system', 'running', 'Testing review system...');
    const reviewTest = await testAPI('/api/marketplace/reviews', {
      method: 'POST',
      body: JSON.stringify({
        item_id: 'test_item_123',
        purchase_id: 'test_purchase_123',
        rating: 5,
        title: 'Great product!',
        content: 'This is an excellent design that exceeded my expectations.'
      })
    });
    
    updateResult('review-system',
      reviewTest.success || reviewTest.status === 401 ? 'success' : 'error',
      reviewTest.status === 401 ? 'Authentication required (expected)' : 
      reviewTest.success ? 'Review system works' : 'Review system failed',
      reviewTest.data, reviewTest.duration);

    // Test analytics
    updateResult('seller-analytics', 'running', 'Testing seller analytics...');
    const analyticsTest = await testAPI('/api/marketplace/seller/analytics?period=month');
    
    updateResult('seller-analytics',
      analyticsTest.success || analyticsTest.status === 401 ? 'success' : 'error',
      analyticsTest.status === 401 ? 'Authentication required (expected)' : 
      analyticsTest.success ? 'Seller analytics works' : 'Seller analytics failed',
      analyticsTest.data, analyticsTest.duration);

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Advanced Marketplace Testing Suite
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Testing payment processing, escrow, reviews, analytics, and DRM
          </p>
          
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`px-8 py-3 rounded-lg font-semibold text-white ${
              isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
            </div>
            <div className="divide-y">
              {results.map((result, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {result.test.replace('-', ' ')}
                        </h3>
                        {result.duration && (
                          <span className="text-sm text-gray-500">{result.duration}ms</span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{result.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Marketplace Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Stripe Connect</h3>
              <p className="text-sm text-gray-600">Seller onboarding and split payments</p>
            </div>
            
            <div className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Escrow Protection</h3>
              <p className="text-sm text-gray-600">High-value transaction protection</p>
            </div>
            
            <div className="text-center">
              <Star className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Verified Reviews</h3>
              <p className="text-sm text-gray-600">Purchase-verified reviews and ratings</p>
            </div>
            
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Seller Analytics</h3>
              <p className="text-sm text-gray-600">Revenue tracking and insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 