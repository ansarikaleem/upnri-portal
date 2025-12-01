import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import PrivateRoute from '../../components/Layout/PrivateRoute';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { apiService } from '../../utils/api';

export default function RegisterBusiness() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await apiService.registerBusiness(data);

      setMessage('Business registered successfully! Awaiting admin approval.');
      setTimeout(() => {
        router.push('/members/businesses');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PrivateRoute>
      <Layout>
        <Head>
          <title>Register Business - UPNRI Forum Kuwait</title>
        </Head>

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Register Your Business
                  </h1>
                  <p className="text-gray-600">
                    List your business in our community directory and connect with potential customers
                  </p>
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Business Information */}
                  <div className="border-b border-gray-200 pb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">1</span>
                      </span>
                      Business Information
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-6">
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
                        <p className="text-xs text-gray-500 mt-2">
                          Example: "Restaurant serving authentic Indian cuisine" or "IT consulting services"
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Details
                        </label>
                        <textarea
                          {...register('businessDetails')}
                          rows="4"
                          className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Provide detailed information about your business, services, products, specialties, etc."
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          This detailed description will help customers understand your business better
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="border-b border-gray-200 pb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">2</span>
                      </span>
                      Contact Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="mt-6">
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

                  {/* Logo Upload */}
                  <div className="pb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">3</span>
                      </span>
                      Business Logo
                    </h2>
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
                      <p className="text-xs text-gray-500 mt-2">
                        Provide a direct URL to your business logo image
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors duration-200"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering Business...
                        </span>
                      ) : (
                        'Register Business'
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Your business listing will be reviewed by our admin team before being published. 
                        This process usually takes 24-48 hours. You'll be notified once your business is approved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </PrivateRoute>
  );
}