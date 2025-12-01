import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { apiService } from '../../utils/api';
import Link from 'next/link';

export default function MyBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBusinesses();
  }, []);

  const fetchMyBusinesses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyBusinesses();
      setBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (!confirm('Are you sure you want to delete this business?')) {
      return;
    }

    try {
      await apiService.deleteBusiness(businessId);
      fetchMyBusinesses(); // Refresh the list
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Failed to delete business');
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <PrivateRoute>
      <Layout>
        <Head>
          <title>My Businesses - UPNRI Forum Kuwait</title>
        </Head>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Businesses</h1>
              <p className="text-gray-600">Manage your business listings</p>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                {businesses.length} business{businesses.length !== 1 ? 'es' : ''} registered
              </div>
              <Link
                href="/businesses/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Add New Business
              </Link>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : businesses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Businesses Registered</h3>
                <p className="text-gray-600 mb-6">You haven't registered any businesses yet.</p>
                <Link
                  href="/businesses/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Register Your First Business
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <div key={business.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border">
                          {business.logo ? (
                            <img 
                              src={business.logo} 
                              alt={business.businessName}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-lg">🏢</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{business.businessName}</h3>
                          <StatusBadge status={business.status} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>Type:</strong> {business.businessType}</p>
                      {business.location && (
                        <p><strong>Location:</strong> {business.location}</p>
                      )}
                      {business.contactPhone && (
                        <p><strong>Phone:</strong> {business.contactPhone}</p>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-4 border-t">
                      <Link
                        href={`/businesses/edit/${business.id}`}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm text-center transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteBusiness(business.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </PrivateRoute>
  );
}