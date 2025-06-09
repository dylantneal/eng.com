'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Star, 
  TrendingUp, 
  Package, 
  Eye,
  Users,
  Download,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Award,
  Shield,
  Activity
} from 'lucide-react';

interface SellerDashboardProps {
  sellerId?: string;
}

interface DashboardData {
  overview: {
    total_revenue_cents: number;
    total_sales: number;
    active_listings: number;
    average_rating: number;
    total_reviews: number;
    conversion_rate: number;
    refund_rate: number;
  };
  recent_activity: Array<{
    type: 'sale' | 'review' | 'payout';
    item_title: string;
    amount_cents?: number;
    rating?: number;
    buyer_handle?: string;
    reviewer_handle?: string;
    timestamp: string;
  }>;
  top_performing_items: Array<{
    id: string;
    title: string;
    sales_count: number;
    revenue_cents: number;
    rating: number;
    conversion_rate: number;
  }>;
  revenue_trend: {
    period: string;
    data: Array<{
      date: string;
      revenue_cents: number;
      sales: number;
    }>;
  };
  geographic_breakdown: Array<{
    country: string;
    sales: number;
    revenue_cents: number;
    percentage: number;
  }>;
  pending_payouts: {
    total_cents: number;
    next_payout_date: string;
    items: Array<{
      description: string;
      amount_cents: number;
      status: string;
    }>;
  };
  goals: {
    monthly_revenue_target_cents: number;
    monthly_revenue_actual_cents: number;
    monthly_sales_target: number;
    monthly_sales_actual: number;
    progress_percentage: number;
  };
}

export default function SellerDashboard({ sellerId }: SellerDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'sales' | 'payouts'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/seller/analytics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 mb-2 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
        </div>
        
        {/* Loading KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Unavailable</h3>
          <p className="text-gray-600 mb-6">Unable to load your seller analytics. This might be due to authentication or a temporary service issue.</p>
          <button 
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'payouts', label: 'Payouts', icon: CreditCard },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Seller Command Center
          </h1>
          <p className="text-lg text-gray-600">Monitor your engineering marketplace performance and optimize your sales strategy</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +12.5%
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(data.overview.total_revenue_cents)}
          </div>
          <div className="text-gray-600 font-medium">Total Revenue</div>
        </div>

        <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-green-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +8.2%
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.overview.total_sales.toLocaleString()}
          </div>
          <div className="text-gray-600 font-medium">Total Sales</div>
        </div>

        <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-purple-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +0.3%
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.overview.average_rating.toFixed(1)}
          </div>
          <div className="text-gray-600 font-medium">Avg Rating</div>
        </div>

        <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-orange-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +2.1%
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {data.overview.conversion_rate.toFixed(1)}%
          </div>
          <div className="text-gray-600 font-medium">Conversion Rate</div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Monthly Goals</h3>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {data.goals.progress_percentage.toFixed(1)}%
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Revenue Goal</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(data.goals.monthly_revenue_actual_cents)} / {formatCurrency(data.goals.monthly_revenue_target_cents)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((data.goals.monthly_revenue_actual_cents / data.goals.monthly_revenue_target_cents) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-medium">Sales Goal</span>
              <span className="text-lg font-bold text-gray-900">
                {data.goals.monthly_sales_actual} / {data.goals.monthly_sales_target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((data.goals.monthly_sales_actual / data.goals.monthly_sales_target) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {data.recent_activity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'sale' ? 'bg-green-100 text-green-600' :
                  activity.type === 'review' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'sale' && <ShoppingCart className="w-5 h-5" />}
                  {activity.type === 'review' && <Star className="w-5 h-5" />}
                  {activity.type === 'payout' && <CreditCard className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {activity.type === 'sale' && `New sale: ${activity.item_title}`}
                    {activity.type === 'review' && `${activity.rating}★ review on ${activity.item_title}`}
                    {activity.type === 'payout' && activity.item_title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {activity.type === 'sale' && `by @${activity.buyer_handle}`}
                    {activity.type === 'review' && `by @${activity.reviewer_handle}`}
                    {activity.type === 'payout' && 'Payout processed'}
                  </div>
                </div>
                
                <div className="text-right">
                  {activity.amount_cents && (
                    <div className="font-bold text-gray-900">
                      {formatCurrency(activity.amount_cents)}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {formatDate(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Top Performers</h3>
          </div>
          
          <div className="space-y-4">
            {data.top_performing_items.slice(0, 3).map((item, index) => (
              <div key={item.id} className="relative">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 transition-all">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-orange-400 to-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm leading-tight">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {item.sales_count} sales • {item.conversion_rate.toFixed(1)}% conversion
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">
                      {formatCurrency(item.revenue_cents)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      {item.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Geographic Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Global Sales Distribution</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.geographic_breakdown.map((geo, index) => (
            <div key={geo.country} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-emerald-50 hover:from-gray-100 hover:to-emerald-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{geo.country}</span>
                <span className="text-sm font-medium text-emerald-600">{geo.percentage.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{geo.sales} sales</span>
                <span className="font-medium">{formatCurrency(geo.revenue_cents)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${geo.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Payouts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Pending Payouts</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.pending_payouts.total_cents)}
            </div>
            <div className="text-sm text-gray-600">
              Next payout: {new Date(data.pending_payouts.next_payout_date).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.pending_payouts.items.map((payout, index) => (
            <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{payout.description}</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(payout.amount_cents)}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                Status: {payout.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 