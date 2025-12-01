import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    // const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // const token = localStorage.getItem('token');
      
      const [statsRes, approvalsRes, activitiesRes] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/pending-approvals', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/recent-activities', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (approvalsRes.ok) setPendingApprovals(await approvalsRes.json());
      if (activitiesRes.ok) setRecentActivities(await activitiesRes.json());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleApprove = async (type, id, action) => {
    try {
      const token = localStorage.getItem('adminToken');
      // const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/approve/${type}/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard - UPNRI Forum</title>
      </Head>

      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to UPNRI Forum Admin Panel</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
            </div>
            <div className="p-6">
              {pendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.type === 'member' ? item.fullName : item.businessName}
                        </h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {item.type} • {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(item.type, item.id, 'approve')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprove(item.type, item.id, 'reject')}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No pending approvals</p>
              )}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
            </div>
            <div className="p-6">
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/members')}
              className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">👥</div>
              <span className="text-sm font-medium">Manage Members</span>
            </button>
            <button 
              onClick={() => router.push('/admin/news')}
              className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">📰</div>
              <span className="text-sm font-medium">Manage News</span>
            </button>
            <button 
              onClick={() => router.push('/admin/events')}
              className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">📅</div>
              <span className="text-sm font-medium">Manage Events</span>
            </button>
            <button 
              onClick={() => router.push('/admin/businesses')}
              className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50"
            >
              <div className="text-2xl mb-2">🏢</div>
              <span className="text-sm font-medium">Business Directory</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}