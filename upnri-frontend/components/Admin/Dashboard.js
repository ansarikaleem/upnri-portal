import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useRouter } from 'next/router';
import { apiService } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, approvalsResponse] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getPendingApprovals()
      ]);

      setStats(statsResponse?.data || {});
      setPendingApprovals(approvalsResponse?.data || []);
      
      // Mock recent activities
      setRecentActivities([
        {
          id: 1,
          description: 'New member registration received',
          type: 'member',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          description: 'Business listing submitted for review',
          type: 'business',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          description: 'News article published',
          type: 'news',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type, id, action) => {
    try {
      await apiService.approveItem(type, id, action);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating approval:', error);
      alert('Error processing approval. Please try again.');
    }
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - UPNRI Forum</title>
      </Head>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to UPNRI Forum Admin Panel</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Members"
          value={stats.totalMembers || 0}
          color="text-blue-600"
          icon="👥"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals || 0}
          color="text-orange-600"
          icon="⏳"
        />
        <StatCard
          title="Total Events"
          value={stats.totalEvents || 0}
          color="text-green-600"
          icon="📅"
        />
        <StatCard
          title="Business Listings"
          value={stats.totalBusinesses || 0}
          color="text-purple-600"
          icon="🏢"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📋</span>
              Pending Approvals
            </h2>
          </div>
          <div className="p-6">
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {item.type === 'member' ? (item.fullName || 'New Member') : (item.businessName || 'New Business')}
                      </h4>
                      <p className="text-xs text-gray-600 capitalize mt-1">
                        {item.type} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(item.type, item.id, 'approve')}
                        className="px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprove(item.type, item.id, 'reject')}
                        className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-300 text-4xl mb-3">✅</div>
                <p className="text-gray-500 text-sm">All caught up! No pending approvals.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📈</span>
              Recent Activities
            </h2>
          </div>
          <div className="p-6">
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'member' ? 'bg-blue-500' :
                      activity.type === 'business' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-300 text-4xl mb-3">📊</div>
                <p className="text-gray-500 text-sm">No recent activities to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Manage Members', icon: '👥', path: '/admin/members', color: 'hover:bg-blue-50 hover:border-blue-200' },
            { name: 'Manage News', icon: '📰', path: '/admin/news', color: 'hover:bg-green-50 hover:border-green-200' },
            { name: 'Manage Events', icon: '📅', path: '/admin/events', color: 'hover:bg-purple-50 hover:border-purple-200' },
            { name: 'Business Directory', icon: '🏢', path: '/admin/businesses', color: 'hover:bg-orange-50 hover:border-orange-200' },
          ].map((action) => (
            <button 
              key={action.name}
              onClick={() => router.push(action.path)}
              className={`p-4 border-2 border-gray-200 rounded-lg text-center transition-all duration-200 ${action.color}`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <span className="text-sm font-medium text-gray-700">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}