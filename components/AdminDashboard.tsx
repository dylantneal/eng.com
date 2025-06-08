'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  proSubscriptions: number;
  storageUsedGB: number;
  monthlyRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'dmca'>('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const supabase = supabaseBrowser;
      
      // Fetch platform statistics
      const [usersRes, projectsRes, paymentsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount_cents')
      ]);

      const proUsers = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('plan', 'PRO');

      const monthlyRevenue = paymentsRes.data?.reduce((sum, payment) => sum + payment.amount_cents, 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalProjects: projectsRes.count || 0,
        proSubscriptions: proUsers.count || 0,
        storageUsedGB: 0, // Simplified for MVP
        monthlyRevenue: monthlyRevenue / 100, // Convert cents to dollars
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'projects', label: 'Projects', icon: '🔧' },
    { id: 'dmca', label: 'DMCA', icon: '⚖️' },
  ] as const;

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">💎</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pro Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.proSubscriptions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔧</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats?.monthlyRevenue || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'projects' && <ProjectsTab />}
        {activeTab === 'dmca' && <DMCATab />}
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: PlatformStats | null }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Key Metrics</h4>
          <ul className="space-y-2 text-sm">
            <li>Conversion Rate: {stats ? ((stats.proSubscriptions / stats.totalUsers) * 100).toFixed(1) : 0}%</li>
            <li>Revenue per User: ${stats ? (stats.monthlyRevenue / Math.max(stats.totalUsers, 1)).toFixed(2) : 0}</li>
            <li>Projects per User: {stats ? (stats.totalProjects / Math.max(stats.totalUsers, 1)).toFixed(1) : 0}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-3">System Status</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
              Database: Healthy
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
              Storage: Operational
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
              Payments: Active
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
      <p className="text-gray-600">Advanced user management tools coming in V1+</p>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Next Steps:</strong> Implement user search, banning capabilities, and support ticket system.
        </p>
      </div>
    </div>
  );
}

function ProjectsTab() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Project Moderation</h3>
      <p className="text-gray-600">Project moderation tools and content filtering coming in V1+</p>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Next Steps:</strong> Implement project flagging, automated content scanning, and bulk actions.
        </p>
      </div>
    </div>
  );
}

function DMCATab() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">DMCA Takedown Requests</h3>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Legal Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Ensure you have registered a DMCA agent and have proper legal procedures in place before processing takedown requests.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Takedown Process</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Receive DMCA takedown notice via email</li>
            <li>Verify the request meets DMCA requirements</li>
            <li>Notify the project owner</li>
            <li>Remove or disable access to the content</li>
            <li>Handle any counter-notices</li>
          </ol>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-700 mb-3">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <div className="font-medium text-gray-900">Emergency Takedown</div>
              <div className="text-sm text-gray-500">Immediately disable a project pending review</div>
            </button>
            <button className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              <div className="font-medium text-gray-900">Send Counter-Notice</div>
              <div className="text-sm text-gray-500">Notify copyright holder of dispute</div>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Next Steps:</strong> Implement automated DMCA workflow, email templates, and legal document storage.
          </p>
        </div>
      </div>
    </div>
  );
} 