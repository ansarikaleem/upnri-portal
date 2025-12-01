import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/Admin/AdminLayout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { apiService } from '../../utils/api';

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, [statusFilter]);

  const fetchBusinesses = async () => {
  try {
    setLoading(true);
    const response = await apiService.getAdminBusinesses({ 
      status: statusFilter || undefined,
      search: searchTerm || undefined
    });
    setBusinesses(response.data.businesses || []);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    // Fallback to regular businesses endpoint if admin endpoint fails
    try {
      const response = await apiService.getBusinesses({});
      setBusinesses(response.data.businesses || []);
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
  } finally {
    setLoading(false);
  }
};

  const handleApproveBusiness = async (businessId) => {
  try {
    await apiService.updateBusinessStatus(businessId, 'approved');
    fetchBusinesses();
  } catch (error) {
    console.error('Error approving business:', error);
    // Fallback to old method
    try {
      await apiService.approveItem('business', businessId, 'approve');
      fetchBusinesses();
    } catch (fallbackError) {
      console.error('Fallback approve error:', fallbackError);
      alert('Failed to approve business');
    }
  }
};

const handleRejectBusiness = async (businessId) => {
  if (confirm('Are you sure you want to reject this business listing?')) {
    try {
      await apiService.updateBusinessStatus(businessId, 'rejected');
      fetchBusinesses();
    } catch (error) {
      console.error('Error rejecting business:', error);
      // Fallback to old method
      try {
        await apiService.approveItem('business', businessId, 'reject');
        fetchBusinesses();
      } catch (fallbackError) {
        console.error('Fallback reject error:', fallbackError);
        alert('Failed to reject business');
      }
    }
  }
};

// Update the save function for admin edits:
const handleSaveBusiness = async (formData) => {
  try {
    setSaving(true);
    await apiService.updateBusinessAdmin(editingBusiness.id, formData);
    setEditingBusiness(null);
    fetchBusinesses();
    alert('Business updated successfully!');
  } catch (error) {
    console.error('Error updating business:', error);
    alert('Failed to update business');
  } finally {
    setSaving(false);
  }
};

// Update the delete function:
const handleDeleteBusiness = async (businessId) => {
  if (confirm('Are you sure you want to delete this business permanently?')) {
    try {
      await apiService.deleteBusinessAdmin(businessId);
      fetchBusinesses();
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Failed to delete business');
    }
  }
};

  const handleEditBusiness = (business) => {
    setEditingBusiness(business);
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status}
      </span>
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBusinesses();
  };

  return (
    <PrivateRoute adminOnly>
      <AdminLayout>
        <Head>
          <title>Manage Businesses - Admin Panel</title>
        </Head>

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Manage Business Directory</h1>
            <p className="text-gray-600">Approve, reject, and manage business listings</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Businesses
                </label>
                <form onSubmit={handleSearch} className="flex space-x-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by business name or owner..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Search
                  </button>
                </form>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchBusinesses}
                  className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Businesses Table View for better management */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading businesses...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type & Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {businesses.map((business) => (
                        <tr key={business.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                {business.logo ? (
                                  <img
                                    className="h-10 w-10 rounded-lg object-cover"
                                    src={business.logo}
                                    alt={business.businessName}
                                  />
                                ) : (
                                  <span className="text-gray-500">🏢</span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {business.businessName}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-2">
                                  {business.natureOfBusiness}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{business.owner?.fullName}</div>
                            <div className="text-sm text-gray-500">{business.owner?.email}</div>
                            <div className="text-sm text-gray-500">{business.contactPhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{business.businessType}</div>
                            <div className="text-sm text-gray-500">{business.location}</div>
                            {business.websiteUrl && (
                              <a 
                                href={business.websiteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-900"
                              >
                                Website
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={business.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(business.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-2">
                              <div className="flex space-x-2">
                                {business.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveBusiness(business.id)}
                                      className="text-green-600 hover:text-green-900 text-xs bg-green-50 px-2 py-1 rounded"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectBusiness(business.id)}
                                      className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {business.status === 'approved' && (
                                  <button
                                    onClick={() => handleRejectBusiness(business.id)}
                                    className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                                  >
                                    Reject
                                  </button>
                                )}
                                {business.status === 'rejected' && (
                                  <button
                                    onClick={() => handleApproveBusiness(business.id)}
                                    className="text-green-600 hover:text-green-900 text-xs bg-green-50 px-2 py-1 rounded"
                                  >
                                    Approve
                                  </button>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditBusiness(business)}
                                  className="text-blue-600 hover:text-blue-900 text-xs bg-blue-50 px-2 py-1 rounded"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteBusiness(business.id)}
                                  className="text-gray-600 hover:text-gray-900 text-xs bg-gray-50 px-2 py-1 rounded"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {businesses.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No businesses found.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit Business Modal */}
        {editingBusiness && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Business: {editingBusiness.businessName}
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  handleSaveBusiness(Object.fromEntries(formData));
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        defaultValue={editingBusiness.businessName}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Type *
                      </label>
                      <select
                        name="businessType"
                        defaultValue={editingBusiness.businessType}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Restaurant & Food">Restaurant & Food</option>
                        <option value="Retail & Shopping">Retail & Shopping</option>
                        <option value="Professional Services">Professional Services</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Construction">Construction</option>
                        <option value="IT & Technology">IT & Technology</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Beauty & Wellness">Beauty & Wellness</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Travel & Tourism">Travel & Tourism</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        defaultValue={editingBusiness.contactPhone}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website URL
                      </label>
                      <input
                        type="url"
                        name="websiteUrl"
                        defaultValue={editingBusiness.websiteUrl}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        defaultValue={editingBusiness.location}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nature of Business
                      </label>
                      <textarea
                        name="natureOfBusiness"
                        defaultValue={editingBusiness.natureOfBusiness}
                        rows="2"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Details
                      </label>
                      <textarea
                        name="businessDetails"
                        defaultValue={editingBusiness.businessDetails}
                        rows="3"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        name="logo"
                        defaultValue={editingBusiness.logo}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        defaultValue={editingBusiness.status}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setEditingBusiness(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </PrivateRoute>
  );
}