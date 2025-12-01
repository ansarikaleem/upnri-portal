import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import { useForm } from 'react-hook-form';
import { apiService } from '../../utils/api';

export default function MemberRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await apiService.registerMember(data);
      setMessage('Registration successful! Awaiting admin approval.');
      
      // Reset form
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const districts = [
    'Lucknow', 'Kanpur', 'Varanasi', 'Allahabad', 'Agra', 'Meerut', 'Ghaziabad',
    'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Faizabad', 'Bareilly',
    'Sitapur', 'Azamgarh', 'Jaunpur', 'Mirzapur', 'Bhadohi', 'Raebareli'
  ];

  const kuwaitAreas = [
    'Kuwait City', 'Hawalli', 'Salmiya', 'Jleeb Al-Shuyoukh', 'Farwaniya',
    'Abu Halifa', 'Mangaf', 'Fahaheel', 'Ahmadi', 'Jahra'
  ];

  return (
    <Layout>
      <Head>
        <title>Member Registration - UPNRI Forum</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-primary-700">
              Member Registration
            </h1>
            
            {message && (
              <div className={`p-4 mb-6 rounded ${
                message.includes('successful') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Full name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Civil ID Number *
                    </label>
                    <input
                      type="text"
                      {...register('civilId', { 
                        required: 'Civil ID is required',
                        pattern: {
                          value: /^[0-9]{12}$/,
                          message: 'Civil ID must be 12 digits'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.civilId && (
                      <p className="text-red-500 text-sm mt-1">{errors.civilId.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9]{8}$/,
                          message: 'Please enter a valid Kuwaiti phone number (8 digits)'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      {...register('gender', { required: 'Gender is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District in UP *
                    </label>
                    <select
                      {...register('district', { required: 'District is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area in Kuwait *
                    </label>
                    <select
                      {...register('area', { required: 'Area is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Area</option>
                      {kuwaitAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    {errors.area && (
                      <p className="text-red-500 text-sm mt-1">{errors.area.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession *
                    </label>
                    <input
                      type="text"
                      {...register('profession', { required: 'Profession is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.profession && (
                      <p className="text-red-500 text-sm mt-1">{errors.profession.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      {...register('company')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Account Security */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">Account Security</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => 
                          value === watch('password') || 'Passwords do not match'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Consent */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('consent', { 
                      required: 'You must agree to join the community' 
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    I agree to join the UPNRI Forum community and accept the terms and conditions *
                  </label>
                </div>
                {errors.consent && (
                  <p className="text-red-500 text-sm mt-1">{errors.consent.message}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering...' : 'Register Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}