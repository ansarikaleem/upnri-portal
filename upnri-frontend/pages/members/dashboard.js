import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import { useRouter } from 'next/router';
import { apiService } from '../../utils/api';

export default function MemberDashboard() {
  const [member, setMember] = useState(null);
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const memberData = localStorage.getItem('member');
    
    if (!token || !memberData) {
      router.push('/login');
      return;
    }

    setMember(JSON.parse(memberData));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      const statsRes = await apiService.getDashboardStats();
      const activitiesRes = await apiService.getDashboardActivities();
      
      // const [statsRes, activitiesRes] = await Promise.all([
      //   fetch('http://localhost:5000/api/members/dashboard/stats', {
      //     headers: { 'Authorization': `Bearer ${token}` }
      //   }),
      //   fetch('http://localhost:5000/api/members/dashboard/activities', {
      //     headers: { 'Authorization': `Bearer ${token}` }
      //   })
      // ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (activitiesRes.ok) setRecentActivities(await activitiesRes.json());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('member');
    router.push('/');
  };

  if (!member) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Member Dashboard - UPNRI Forum</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {member.fullName}!
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your account.
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-primary-600 mb-2">
                {stats.eventsRegistered || 0}
              </div>
              <div className="text-sm text-gray-600">Events Registered</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {stats.businesses || 0}
              </div>
              <div className="text-sm text-gray-600">Business Listings</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {stats.posts || 0}
              </div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {stats.connections || 0}
              </div>
              <div className="text-sm text-gray-600">Connections</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-800">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent activities</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => router.push('/members/profile')}
                  className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-2">👤</div>
                  <span className="text-sm font-medium">Update Profile</span>
                </button>
                <button 
                  onClick={() => router.push('/businesses/register')}
                  className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-2">🏢</div>
                  <span className="text-sm font-medium">Add Business</span>
                </button>
                <button 
                  onClick={() => router.push('/events')}
                  className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-2">📅</div>
                  <span className="text-sm font-medium">View Events</span>
                </button>
                <button 
                  onClick={() => router.push('/members/posts/create')}
                  className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <span className="text-sm font-medium">Create Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}