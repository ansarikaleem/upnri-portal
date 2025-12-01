import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { apiService } from '../../utils/api';

export default function Register() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      console.log('🔄 Attempting registration...');
      
      // Test API connection first
      try {
        await apiService.testConnection();
        console.log('✅ API connection successful');
      } catch (connectionError) {
        console.error('❌ API connection failed:', connectionError);
        setMessage('Cannot connect to server. Please make sure the backend is running on port 5000.');
        setIsSubmitting(false);
        return;
      }

      const response = await apiService.registerMember(data);
      console.log('✅ Registration response:', response.data);
      
      setMessage('Registration successful! Your account is pending admin approval. You will be redirected to login shortly.');
      
      // Redirect to login after delay
      setTimeout(() => {
        router.push('/auth/login?registered=true');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Registration error:', error);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <Head>
        <title>Member Registration - UPNRI Forum Kuwait</title>
        <meta name="description" content="Register as a member of UPNRI Forum Kuwait" />
      </Head>

      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                UP
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Member Registration</h1>
              <p className="text-gray-600 mt-2">Join the UPNRI Forum Kuwait community</p>
            </div>
            
            {message && (
              <div className={`p-4 mb-6 rounded ${
                message.includes('successful') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Full name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
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
                          message: 'Civil ID must be exactly 12 digits'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="12-digit Civil ID"
                    />
                    {errors.civilId && (
                      <p className="mt-1 text-sm text-red-600">{errors.civilId.message}</p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="8-digit phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Optional email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      {...register('gender', { required: 'Gender is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District in UP *
                    </label>
                    <select
                      {...register('district', { required: 'District is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area in Kuwait *
                    </label>
                    <select
                      {...register('area', { required: 'Area is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select Area</option>
                      {kuwaitAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                    {errors.area && (
                      <p className="mt-1 text-sm text-red-600">{errors.area.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Professional Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profession *
                    </label>
                    <input
                      type="text"
                      {...register('profession', { required: 'Profession is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your profession"
                    />
                    {errors.profession && (
                      <p className="mt-1 text-sm text-red-600">{errors.profession.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company/Organization
                    </label>
                    <input
                      type="text"
                      {...register('company')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your company (optional)"
                    />
                  </div>
                </div>
              </div>
              
              {/* Account Security */}
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Account Security</h2>
                
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Create a password"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Consent */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    {...register('consent', { 
                      required: 'You must agree to join the community' 
                    })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                  />
                  <label className="ml-3 block text-sm text-gray-900">
                    <span className="font-medium">I agree to join the UPNRI Forum Kuwait community</span>
                    <p className="text-gray-600 mt-1">
                      By registering, I consent to become a member of UPNRI Forum Kuwait and agree to abide by the 
                      community guidelines. I understand that my registration is subject to admin approval.
                    </p>
                  </label>
                </div>
                {errors.consent && (
                  <p className="mt-2 text-sm text-red-600">{errors.consent.message}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
                
                <div className="text-center">
                  <Link 
                    href="/auth/login" 
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Already have an account? Sign in
                  </Link>
                </div>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Your registration will be reviewed by our admin team. You will receive a confirmation 
                once your account is approved. This usually takes 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}