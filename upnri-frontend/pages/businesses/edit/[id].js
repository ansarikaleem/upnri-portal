import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../../components/Layout/Layout';
import PrivateRoute from '../../../components/Layout/PrivateRoute';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { apiService } from '../../../utils/api';

export default function EditBusiness() {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { id } = router.query;
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const businessTypes = [
    'Restaurant & Food',
    'Retail & Shopping',
    'Professional Services',
    'Healthcare',
    'Education',
    'Construction',
    'IT & Technology',
    'Automotive',
    'Beauty & Wellness',
    'Real Estate',
    'Travel & Tourism',
    'Other'
  ];

  useEffect(() => {
    if (id) {
      fetchBusiness();
    }
  }, [id]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      // Get all user's businesses and find the specific one
      const response = await apiService.getMyBusinesses();
      const foundBusiness = response.data.find(b => b.id === parseInt(id));
      
      if (foundBusiness) {
        setBusiness(foundBusiness);
        reset({
          businessName: foundBusiness.businessName,
          businessType: foundBusiness.businessType,
          natureOfBusiness: foundBusiness.natureOfBusiness,
          businessDetails: foundBusiness.businessDetails,
          location: foundBusiness.location,
          contactPhone: foundBusiness.contactPhone,
          websiteUrl: foundBusiness.websiteUrl,
          logo: foundBusiness.logo
        });
      } else {
        setMessage('Business not found or you do not have permission to edit it.');
      }
    } catch (error) {
      console.error('Error fetching business:', error);
      setMessage('Error loading business details.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      await apiService.updateBusiness(id, data);
      setMessage('Business updated successfully!');
      setTimeout(() => {
        router.push('/members/businesses');
      }, 1500);
    } catch (error) {
      console.error('Update error:', error);
      setMessage(error.response?.data?.error || 'Failed to update business. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteBusiness(id);
      setMessage('Business deleted successfully!');
      setTimeout(() => {
        router.push('/members/businesses');
      }, 1500);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Failed to delete business. Please try again.');
    }
  };

  if (loading) {
    return (
      <PrivateRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading business details...</p>
            </div>
          </div>
        </Layout>
      </PrivateRoute>
    );
  }

  if (message && !business) {
    return (
      <PrivateRoute>
        <Layout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <button
                onClick={() => router.push('/members/businesses')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Back to My Businesses
              </button>
            </div>
          </div>
        </Layout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <Layout>
        <Head>
          <title>Edit Business - UPNRI Forum Kuwait</title>
        </Head>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Edit Business
                    </h1>
                    <p className="text-gray-600">
                      Update your business information
                    </p>
                  </div>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete Business
                  </button>
                </div>
                
                {message && (
                  <div className={`p-4 mb-6 rounded-md ${
                    message.includes('successful') 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {message}
                  </div>
                )}

                {business && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Business Information */}
                    <div className="border-b border-gray-200 pb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Name *
                          </label>
                          <input
                            type="text"
                            {...register('businessName', { 
                              required: 'Business name is required',
                              minLength: {
                                value: 2,
                                message: 'Business name must be at least 2 characters'
                              }
                            })}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your business name"
                          />
                          {errors.businessName && (
                            <p className="text-red-500 text-sm mt-2">{errors.businessName.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Type *
                          </label>
                          <select
                            {...register('businessType', { required: 'Business type is required' })}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Business Type</option>
                            {businessTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          {errors.businessType && (
                            <p className="text-red-500 text-sm mt-2">{errors.businessType.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nature of Business
                          </label>
                          <textarea
                            {...register('natureOfBusiness')}
                            rows="3"
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Briefly describe what your business does..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Details
                          </label>
                          <textarea
                            {...register('businessDetails')}
                            rows="4"
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Provide detailed information about your business..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-b border-gray-200 pb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            {...register('location')}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Business location in Kuwait"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            {...register('contactPhone')}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Business phone number"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL
                        </label>
                        <input
                          type="url"
                          {...register('websiteUrl')}
                          className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="pb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Logo</h2>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logo URL
                        </label>
                        <input
                          type="url"
                          {...register('logo')}
                          className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => router.push('/members/businesses')}
                        className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors duration-200"
                      >
                        {isSubmitting ? 'Updating Business...' : 'Update Business'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PrivateRoute>
  );
}