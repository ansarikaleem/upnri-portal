import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../utils/api';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    // Perform logout
    authService.logout();
    
    // Redirect to home after a brief delay
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Logged Out Successfully</h2>
        <p className="text-gray-600">You have been logged out of your account.</p>
        <p className="text-gray-500 text-sm mt-2">Redirecting to homepage...</p>
      </div>
    </div>
  );
}