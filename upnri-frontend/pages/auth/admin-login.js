import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { apiService } from '../../utils/api';
import {authService} from '../../utils/auth';

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (authService.isAuthenticated() && authService.isAdmin()) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Attempting admin login...');
      
      // Test API connection first
      try {
        await apiService.testConnection();
        console.log('✅ API connection successful');
      } catch (connectionError) {
        console.error('❌ API connection failed:', connectionError);
        setError('Cannot connect to server. Please make sure the backend is running on port 5000.');
        setIsLoading(false);
        return;
      }

      const response = await apiService.adminLogin(data);
      console.log('✅ Admin login response:', response.data);

      const { token, admin } = response.data;
      
      // Store authentication data
      authService.login(token, admin);
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
      
    } catch (error) {
      console.error('❌ Admin login error:', error);
      setError(error.response?.data?.error || 'Admin login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Admin Login - UPNRI Forum Kuwait</title>
        <meta name="description" content="Admin login for UPNRI Forum Kuwait" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            A
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          UPNRI Forum Kuwait Administration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
          {error && (
            <div className="mb-4 bg-red-900 bg-opacity-20 border border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Admin Email
              </label>
              <div className="mt-1">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-white sm:text-sm"
                  placeholder="admin@upnriforum.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register('password', {
                    required: 'Password is required'
                  })}
                  type="password"
                  autoComplete="current-password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 bg-gray-700 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-white sm:text-sm"
                  placeholder="Enter admin password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in as Admin'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-gray-300 hover:text-white"
              >
                ← Back to Member Login
              </Link>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Default Admin Credentials</span>
              </div>
            </div>

            <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300 text-center">
                <strong>Email:</strong> admin@upnriforum.com<br />
                <strong>Password:</strong> admin123
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                Change these credentials after first login
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}